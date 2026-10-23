const mongoose = require("mongoose");

const agentRunSchema = new mongoose.Schema(
  {
    runId: {
      type: String, // e.g. "agt-1104"
      required: true,
      unique: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
    },
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      default: null,
    },
    task: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Success", "Running", "Failed"],
      default: "Running",
    },
    duration: String,
    tokens: Number,
    coverageStart: Number, // e.g. 48%
    coverageCurrent: Number, // e.g. 74%
    coverageTarget: Number, // e.g. 80%
    loopSteps: [
      {
        stepName: String,
        status: { type: String, enum: ["done", "running", "waiting"] },
        time: String,
        label: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AgentRun", agentRunSchema);