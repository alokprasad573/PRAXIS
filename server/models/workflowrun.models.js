const mongoose = require("mongoose");

const workflowRunSchema = new mongoose.Schema(
  {
    runId: {
      type: String, // e.g. "run-8832"
      required: true,
      unique: true,
      index: true,
    },
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    agent: {
      type: String, // e.g. "Code Analysis Agent"
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Running",
        "Success",
        "Failed",
        "Aborted",
        "Cancelled",
        "Waiting",
        "Queued",
        "Skipped",
      ],
      default: "Running",
    },
    currentStep: {
      type: String, // e.g. "Analyzing AST for injection vectors..."
      default: "",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    duration: {
      type: String,
      default: "0s",
    },
    tokens: {
      type: Number,
      default: 0,
    },
    retries: {
      type: Number,
      default: 0,
    },
    trigger: {
      type: String,
      default: "System",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkflowRun", workflowRunSchema);
