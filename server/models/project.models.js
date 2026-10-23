const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    repo: {
      type: String,
      required: [true, "Repository URL is required"],
      trim: true,
    },
    branch: {
      type: String,
      default: "main",
    },
    language: {
      type: String,
      default: "Node.js", // Node.js, TypeScript, Go, Python
    },
    framework: {
      type: String,
      default: "Express", // Express, React, Gin, FastAPI
    },
    health: {
      type: String,
      enum: ["healthy", "warning", "error"],
      default: "healthy",
    },
    ragStatus: {
      type: String,
      enum: ["indexed", "indexing", "failed", "pending"],
      default: "indexed",
    },
    ragChunks: {
      type: Number,
      default: 0,
    },
    lastIndexed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);