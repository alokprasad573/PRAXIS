const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    // Reference to User Model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Reference to Workspace Model
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    // Reference to active Project Model (Active Context)
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    role: {
      type: String,
      default: "developer",
    },
    device: {
      ip: { type: String, default: "127.0.0.1" },
      userAgent: { type: String, default: "" },
      browser: { type: String, default: "Unknown" },
      os: { type: String, default: "Unknown" },
      clientType: {
        type: String,
        enum: ["browser", "cli", "api"],
        default: "browser",
      },
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB automatic TTL cleanup
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Session", sessionSchema);
