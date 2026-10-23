const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    tokenName: {
      type: String,
      required: true, // e.g. "CLI Production Worker"
    },
    keyPrefix: {
      type: String, // e.g. "px_live_8849"
      required: true,
    },
    keyHash: {
      type: String, // bcrypt hash of full secret
      required: true,
      select: false,
    },
    scopes: {
      type: [String],
      default: ["workflows:write", "repo:read"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ApiKey", apiKeySchema);