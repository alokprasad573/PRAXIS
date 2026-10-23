const mongoose = require("mongoose");

const executionLogSchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
      index: true,
    },
    agent: {
      type: String,
      required: true, // e.g. "Unit Test Agent"
    },
    level: {
      type: String,
      enum: ["INFO", "WARN", "ERROR", "DEBUG"],
      default: "INFO",
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    details: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExecutionLog", executionLogSchema);