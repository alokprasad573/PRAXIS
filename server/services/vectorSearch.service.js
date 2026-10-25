const mongoose = require("mongoose");
const VectorEmbedding = require("../models/vectorEmbedding.models");
const { getEmbedding } = require("./embedding.service");

/**
 * Compute Cosine Similarity between two normalized float vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dot / denominator;
}

/**
 * Semantic Vector Search over MongoDB Embeddings Collection
 * Performs hybrid filtering by workspace, project, category, and minimum score threshold.
 */
async function searchSimilarChunks({
  query,
  workspaceId = null,
  projectId = null,
  category = null, // "code" | "okf_policy" | "docs"
  limit = 5,
  minScore = 0.05,
}) {
  if (!query || typeof query !== "string") {
    return [];
  }

  // 1. Generate Query Vector via Embedding Service
  const queryVector = await getEmbedding(query);

  // 2. Build MongoDB Match Filter (handles both ObjectId & String)
  const filter = {};
  if (projectId) {
    filter.project = mongoose.Types.ObjectId.isValid(projectId)
      ? { $in: [new mongoose.Types.ObjectId(projectId), projectId.toString()] }
      : projectId;
  } else if (workspaceId) {
    filter.workspace = mongoose.Types.ObjectId.isValid(workspaceId)
      ? { $in: [new mongoose.Types.ObjectId(workspaceId), workspaceId.toString()] }
      : workspaceId;
  }
  if (category) filter.category = category;

  // 3. Fetch candidate documents from MongoDB strictly isolated by project / workspace
  let candidates = await VectorEmbedding.find(filter)
    .select("source title content metadata category chunkIndex tokenCount embedding")
    .lean();

  if (!candidates || candidates.length === 0) {
    return [];
  }

  // 4. Score each candidate via Cosine Similarity
  const scoredResults = candidates
    .map((doc) => {
      const score = cosineSimilarity(queryVector, doc.embedding);
      // Clean document for return (omit raw vector array)
      const { embedding, ...cleanDoc } = doc;
      return {
        ...cleanDoc,
        score: Number(score.toFixed(4)),
      };
    })
    .filter((doc) => doc.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scoredResults;
}

/**
 * Retrieve Unified 80/20 Context for Multi-Agent Loops
 * Combines 80% relevant code chunks with 20% deterministic OKF governance policies.
 */
async function getUnifiedAgentContext({
  taskDescription,
  workspaceId,
  projectId,
  codeLimit = 4,
  policyLimit = 2,
}) {
  // Retrieve 80% relevant code context
  const codeChunks = await searchSimilarChunks({
    query: taskDescription,
    workspaceId,
    projectId,
    category: "code",
    limit: codeLimit,
    minScore: 0.6,
  });

  // Retrieve 20% applicable OKF governance policies
  const okfPolicies = await searchSimilarChunks({
    query: taskDescription,
    workspaceId,
    category: "okf_policy",
    limit: policyLimit,
    minScore: 0.5,
  });

  // Format into prompt-ready context structure
  const formattedCodeContext = codeChunks
    .map(
      (c, i) =>
        `### [RAG Code Chunk ${i + 1}] Source: ${c.source} (Similarity: ${(c.score * 100).toFixed(1)}%)\n\`\`\`${c.metadata?.language || ""}\n${c.content}\n\`\`\``
    )
    .join("\n\n");

  const formattedOkfContext = okfPolicies
    .map(
      (p, i) =>
        `### [OKF Policy Guardrail ${i + 1}] Policy: ${p.source} (${p.metadata?.riskLevel || "medium"} risk)\nRule: ${p.content}`
    )
    .join("\n\n");

  return {
    rawCodeChunks: codeChunks,
    rawOkfPolicies: okfPolicies,
    totalCodeChunks: codeChunks.length,
    totalOkfPolicies: okfPolicies.length,
    formattedPromptContext: `--- UNIFIED AGENT CONTEXT (80% CODE RAG + 20% OKF GOVERNANCE) ---\n\n## 1. CODEBASE RETRIEVAL (80% CONTEXT):\n${
      formattedCodeContext || "No matching code chunks found for this task."
    }\n\n## 2. OKF POLICY GUARDRAILS (20% CONTEXT):\n${
      formattedOkfContext || "Standard OKF base policies apply."
    }\n-------------------------------------------------------------`,
  };
}

module.exports = {
  searchSimilarChunks,
  getUnifiedAgentContext,
  cosineSimilarity,
};

