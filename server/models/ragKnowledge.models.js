const mongoose = require("mongoose");

const ragKnowledgeSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    name: String,
    repo: String,
    branch: String,
    chunks: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["synced", "indexing", "failed"],
      default: "synced",
    },
    similarityThreshold: {
      type: Number,
      default: 0.82,
    },
    embeddingModel: {
      type: String,
      default: "text-embedding-3-large (3072 dims)",
    },
    astChunkSize: {
      type: Number,
      default: 512,
    },
    lastSync: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RagKnowledge", ragKnowledgeSchema);