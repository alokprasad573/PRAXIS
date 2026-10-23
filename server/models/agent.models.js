const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    agentId: {
      type: String, // e.g. "agent-001"
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true, // e.g. "Code Analysis Agent", "Unit Test Agent"
    },
    type: {
      type: String,
      required: true, // e.g. "code-analysis", "unit-test", "security", "devops"
    },
    icon: {
      type: String,
      default: "Bot",
    },
    color: {
      type: String,
      default: "orange",
    },
    status: {
      type: String,
      enum: ["active", "running", "idle", "disabled"],
      default: "active",
    },
    model: {
      type: String,
      default: "gpt-4o", // gpt-4o, claude-3-5-sonnet, gemini-2-0-flash
    },
    successRate: {
      type: Number,
      default: 95.0,
    },
    avgDuration: {
      type: String,
      default: "2m 14s",
    },
    totalRuns: {
      type: Number,
      default: 0,
    },
    capabilities: [String],
    tools: [String],
    permissions: [String],
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Agent", agentSchema);