const mongoose = require("mongoose");

const okfPolicySchema = new mongoose.Schema(
  {
    policyId: {
      type: String, // e.g. "okf-001"
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Deployment Restrictions", "Validation Rules", "Security Policies", "Architecture Rules", "Approval Policies"],
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

module.exports = mongoose.model("OkfPolicy", okfPolicySchema);