const mongoose = require("mongoose");

const okfPolicySchema = new mongoose.Schema(
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
    policyId: {
      type: String, // e.g. "okf-001"
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Deployment Restrictions",
        "Validation Rules",
        "Security Policies",
        "Architecture Rules",
        "Approval Policies",
      ],
      required: true,
    },
    risk: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["enabled", "disabled"],
      default: "enabled",
    },
    description: String,
    rule: String, // JavaScript deterministic assertion rule
    version: {
      type: String,
      default: "v1.0",
    },
    triggers: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index: A policyId is unique within a specific project / workspace
okfPolicySchema.index({ policyId: 1, project: 1 });
okfPolicySchema.index({ workspace: 1, project: 1 });

module.exports = mongoose.model("OkfPolicy", okfPolicySchema);
