const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Acme Corp Engineering",
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: String,
      enum: ["Free", "Pro", "Enterprise", "Enterprise Dedicated Swarm"],
      default: "Enterprise Dedicated Swarm",
    },
    planPrice: {
      type: String,
      default: "$499/mo",
    },
    tokenSoftCap: {
      type: Number,
      default: 100.0,
    },
    tokenHardCap: {
      type: Number,
      default: 150.0,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: ["Owner / Admin", "Staff Engineer", "DevOps Lead", "Security Auditor", "Member"],
          default: "Member",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workspace", workspaceSchema);