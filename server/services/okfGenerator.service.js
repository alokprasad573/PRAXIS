const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");
const OkfPolicy = require("../models/okfPolicy.models");
const VectorEmbedding = require("../models/vectorEmbedding.models");
const { getEmbedding } = require("./embedding.service");

/**
 * Generate fallback tailored policies if AI is offline
 */
function getTailoredFallbackPolicies(project) {
  const lang = project.language || "";
  const name = project.name || "";

  return [
    {
      policyId: "okf-001",
      name: `${name} Production Gate`,
      category: "Deployment Restrictions",
      risk: "high",
      description: `Requires explicit human authorization gate before any agent triggers deployment to live production clusters for ${name}.`,
      rule: `if (env === "production" && action === "deploy") {\n  return requireHumanApproval({ risk: "high", reason: "Production deployment gate for ${name}" });\n}`,
      version: "v1.0",
      triggers: 0,
    },
    {
      policyId: "okf-002",
      name: `${lang} Test Coverage Threshold (≥ 80%)`,
      category: "Validation Rules",
      risk: "medium",
      description: `Generated ${lang} code modifications for ${name} must maintain or increase test coverage. Target threshold is 80%.`,
      rule: `assert(new_coverage >= 80, "Coverage threshold (80%) not met for ${name}. Initiating test iteration loop.");`,
      version: "v1.0",
      triggers: 0,
    },
    {
      policyId: "okf-003",
      name: `${name} Database Mutation Guard`,
      category: "Security Policies",
      risk: "high",
      description: `Autonomous agents are strictly forbidden from executing destructive SQL or MongoDB drops, truncates, or uncontrolled deletions on ${name}.`,
      rule: `const forbidden = ["DROP", "TRUNCATE", "DELETE FROM"];\nif (forbidden.some(op => sql.toUpperCase().includes(op))) {\n  return blockAction("Destructive database mutation blocked on ${name}.");\n}`,
      version: "v1.0",
      triggers: 0,
    },
    {
      policyId: "okf-004",
      name: "No Direct Main Branch Push",
      category: "Architecture Rules",
      risk: "medium",
      description: `All AI agent synthesized code for ${name} must be submitted via branch pull request with verification checks.`,
      rule: `if (targetBranch === "main" || targetBranch === "master") {\n  return createPullRequest({ title: "Autonomous Agent Change Proposal for ${name}" });\n}`,
      version: "v1.0",
      triggers: 0,
    },
  ];
}

/**
 * Synthesize repository-specific OKF Governance Policies using @google/genai or groq-sdk
 */
async function callGeminiForOkf({ prompt, apiKey }) {
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: `You are PRAXIS OKF Governance Architect. You synthesize deterministic, production-grade guardrail policies (OKF - Open Knowledge Framework) strictly customized for the analyzed repository.\n\n${prompt}`,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    });

    const rawText =
      response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawText) {
      return JSON.parse(rawText.trim());
    }
  } catch (err) {
    console.warn(`[@google/genai OKF Notice] Model '${model}' call: ${err.message}`);
  }

  return null;
}

async function callGroqForOkf({ prompt, apiKey, modelName }) {
  const groq = new Groq({ apiKey });
  const targetModel = process.env.GROQ_MODEL_NAME || modelName || "openai/gpt-oss-12b";

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are PRAXIS OKF Governance Architect. You synthesize deterministic, production-grade guardrail policies (OKF - Open Knowledge Framework) strictly customized for the analyzed repository. Output raw JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: targetModel,
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      stream: true,
      reasoning_effort: "medium",
      stop: null,
    });

    let fullContent = "";
    for await (const chunk of chatCompletion) {
      fullContent += (chunk.choices[0]?.delta?.content || "");
    }

    const cleanJson = fullContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    // Retry without streaming/reasoning parameters if model doesn't support them
    try {
      const fallback = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are PRAXIS OKF Governance Architect. You synthesize deterministic, production-grade guardrail policies (OKF - Open Knowledge Framework) strictly customized for the analyzed repository. Output raw JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: targetModel,
        temperature: 1,
        max_completion_tokens: 2048,
      });
      const content = fallback.choices?.[0]?.message?.content || "";
      const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (fallbackErr) {
      console.warn(`[groq-sdk OKF Warning]:`, err.message);
      return null;
    }
  }
}

/**
 * Synthesize repository-specific OKF Governance Policies
 */
async function generateAndStoreOkfGuardrails({ project, files = [] }) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const groqModel = process.env.GROQ_MODEL_NAME || "openai/gpt-oss-12b";
  const geminiModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  let policiesToStore = [];

  // 1. Prepare repository summary for LLM
  const fileSummary = files
    .slice(0, 15)
    .map((f) => f.path || f.relPath)
    .filter(Boolean);
  const sampleSnippets = files
    .slice(0, 5)
    .map((f) => `// File: ${f.path}\n${(f.content || "").slice(0, 300)}`)
    .join("\n\n");

  const prompt = `Analyze this repository and generate 4 to 5 tailored, deterministic governance guardrails (OKF - Open Knowledge Framework) specifically designed for this codebase.

Repository: ${project.name}
Language: ${project.language || ""}
Framework: ${project.framework || ""}
Repository URL: ${project.repo || ""}
Key Files Detected: ${fileSummary.join(", ") || "General structure"}
Code Snippets:
${sampleSnippets || "Standard repository structure"}

Requirements:
Return ONLY a valid JSON array of policy objects (no markdown, no backticks, raw JSON only) matching this schema:
[
  {
    "policyId": "okf-001",
    "name": "Policy Title",
    "category": "Deployment Restrictions | Validation Rules | Security Policies | Architecture Rules | Approval Policies",
    "risk": "high | medium | low",
    "description": "Clear explanation of what this rule prevents or enforces in this repository",
    "rule": "// Deterministic JavaScript assertion rule",
    "version": "v1.0"
  }
]`;

  let parsed = null;

  // Attempt 1: Google GenAI (Gemini)
  if (geminiKey) {
    try {
      console.log(
        `[OKF Guardrails] Calling Google GenAI ${geminiModel} to synthesize repository policies...`,
      );
      parsed = await callGeminiForOkf({ prompt, apiKey: geminiKey });
    } catch (err) {
      console.warn("[Google GenAI OKF Error]:", err.message);
    }
  }

  // Attempt 2: Groq Cloud (Free high-speed LPU)
  if (
    (!parsed || !Array.isArray(parsed) || parsed.length === 0) &&
    groqKey &&
    groqKey.startsWith("gsk_")
  ) {
    try {
      console.log(
        `[OKF Guardrails] Calling Groq Cloud (${groqModel}) to synthesize repository policies...`,
      );
      parsed = await callGroqForOkf({
        prompt,
        apiKey: groqKey,
        modelName: groqModel,
      });
    } catch (err) {
      console.warn("[Groq Cloud OKF Error]:", err.message);
    }
  }

  // If parsed successfully from any LLM provider
  if (Array.isArray(parsed) && parsed.length > 0) {
    policiesToStore = parsed.map((p, idx) => ({
      policyId: p.policyId || `okf-00${idx + 1}`,
      name: p.name,
      category: p.category || "Security Policies",
      risk: p.risk || "medium",
      description: p.description || "",
      rule: p.rule || 'return blockAction("Guardrail triggered");',
      version: p.version || "v1.0",
      triggers: 0,
    }));
    console.log(
      `[OKF Guardrails] Successfully synthesized ${policiesToStore.length} real policies via AI.`,
    );
  }

  // If LLM returned empty or was unavailable, use tailored fallback
  if (policiesToStore.length === 0) {
    policiesToStore = getTailoredFallbackPolicies(project);
  }

  // 2. Remove existing OKF policies for this specific project
  await OkfPolicy.deleteMany({ project: project._id });
  await VectorEmbedding.deleteMany({
    project: project._id,
    category: "okf_policy",
  });

  // 3. Store synthesized policies into MongoDB OkfPolicy & VectorEmbedding
  const storedPolicies = [];
  for (const p of policiesToStore) {
    const doc = await OkfPolicy.create({
      workspace: project.workspace,
      project: project._id,
      policyId: p.policyId,
      name: p.name,
      category: p.category,
      risk: p.risk,
      status: "enabled",
      description: p.description,
      rule: p.rule,
      version: p.version || "v1.0",
      triggers: 0,
    });

    storedPolicies.push(doc);

    // Vector embed the synthesized policy into VectorEmbedding
    const textToIndex = `Policy: ${doc.policyId} - ${doc.name}\nCategory: ${doc.category}\nRisk: ${doc.risk}\nDescription: ${doc.description}\nDeterministic Rule:\n${doc.rule}`;
    const embedding = await getEmbedding(textToIndex);

    await VectorEmbedding.create({
      workspace: project.workspace,
      project: project._id,
      category: "okf_policy",
      source: doc.policyId,
      title: doc.name,
      content: textToIndex,
      metadata: {
        policyId: doc.policyId,
        riskLevel: doc.risk,
        astType: "guardrail_policy",
      },
      embedding,
      tokenCount: Math.ceil(textToIndex.length / 4),
    });
  }

  return storedPolicies;
}

module.exports = {
  generateAndStoreOkfGuardrails,
  getTailoredFallbackPolicies,
};
