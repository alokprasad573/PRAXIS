const mongoose = require("mongoose");

const platformConfigSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      unique: true,
    },
    llmRouting: {
      codeAnalysisAgent: { type: String, default: "OpenAI - GPT-4o (2024-11-20)" },
      unitTestAgent: { type: String, default: "Anthropic - Claude 3.5 Sonnet (v2)" },
      researchAgent: { type: String, default: "Google - Gemini 1.5 Pro" },
      fallbackCircuit: { type: String, default: "Auto-fallback to Claude 3.5 on rate-limit" },
      openaiKeySet: { type: Boolean, default: true },
      anthropicKeySet: { type: Boolean, default: true },
      vllmGatewayUrl: { type: String, default: "http://localhost:11434/v1" },
    },
    vectorDb: {
      provider: { type: String, enum: ["Qdrant", "Pinecone", "Milvus"], default: "Qdrant" },
      endpoint: { type: String, default: "https://praxis-prod-vectordb.qdrant.tech:6333" },
      embeddingModel: { type: String, default: "text-embedding-3-large (3072 dims)" },
      astChunkSize: { type: Number, default: 512 },
      similarityThreshold: { type: Number, default: 0.82 },
    },
    inboundWebhookSecret: {
      type: String,
      default: "whsec_99482018471948291048201948",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformConfig", platformConfigSchema);