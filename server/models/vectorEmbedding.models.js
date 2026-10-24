const mongoose = require("mongoose");

const vectorEmbeddingSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },
    category: {
      type: String,
      enum: ["code", "docs", "okf_policy", "artifact"],
      default: "code",
      index: true,
    },
    source: {
      type: String, // e.g. "src/auth/jwt.ts" or "OKF-001"
      required: true,
    },
    title: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      lineStart: Number,
      lineEnd: Number,
      language: String,
      astType: String, // e.g. "function_declaration", "class", "guardrail_policy"
      policyId: String,
      riskLevel: String,
      sha: String,
    },
    embedding: {
      type: [Number], // float array from Hugging Face sentence-transformers/all-MiniLM-L6-v2
      required: true,
    },
    tokenCount: {
      type: Number,
      default: 0,
    },
    chunkIndex: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Standard compound indices for fast filtered vector retrieval
vectorEmbeddingSchema.index({ workspace: 1, category: 1 });
vectorEmbeddingSchema.index({ project: 1, category: 1 });

module.exports = mongoose.model("VectorEmbedding", vectorEmbeddingSchema);

