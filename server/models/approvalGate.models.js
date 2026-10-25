const mongoose = require("mongoose");

const approvalGateSchema = new mongoose.Schema(
  {
    approvalId: {
      type: String, // e.g. "appr-001"
      required: true,
      unique: true,
    },
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      index: true,
    },
    stepIndex: {
      type: Number,
      default: 3,
    },
    branch: String,
    requestedBy: String, // e.g. "Unit Test Agent"
    action: {
      type: String, // e.g. "Deploy auth-service to production"
      required: true,
    },
    risk: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "high",
    },
    reason: String,
    impact: String,
    affectedFiles: [String],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    decidedByName: String,
    decidedAt: Date,
    decisionDuration: String,
    timeout: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApprovalGate", approvalGateSchema);