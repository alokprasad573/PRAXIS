const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    category: {
      type: String,
      enum: ["Approvals", "Agent Activity", "System", "Workflows"],
      default: "System",
    },
    type: {
      type: String,
      enum: ["high-risk", "approval", "success", "info"],
      default: "info",
    },
    unread: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);