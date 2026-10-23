const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema(
  {
    customId: {
      type: String, // e.g. "WF-2048"
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    branch: {
      type: String,
      default: "main",
    },
    status: {
      type: String,
      enum: ["running", "completed", "failed", "blocked", "waiting"],
      default: "running",
      index: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    trigger: {
      type: String,
      enum: ["manual", "ci/cd", "schedule", "webhook", "system"],
      default: "manual",
    },
    executionMode: {
      type: String,
      enum: ["parallel", "sequential"],
      default: "parallel",
    },
    approvalPolicy: {
      type: String,
      enum: ["high-risk-only", "all", "none"],
      default: "high-risk-only",
    },
    agents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent",
      },
    ],
    agentPipeline: [
      {
        agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
        name: String,
        status: { type: String, enum: ["running", "completed", "waiting", "failed"] },
        startedAt: Date,
        completedAt: Date,
        tokens: { type: Number, default: 0 },
        output: String,
      },
    ],
    duration: {
      type: String,
      default: "0s",
    },
    metrics: {
      tokensUsed: { type: Number, default: 0 },
      estimatedCost: { type: Number, default: 0 },
      retries: { type: Number, default: 0 },
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workflow", workflowSchema);