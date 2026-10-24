const Notification = require("../models/notifications.models");

// 1. GET ALL NOTIFICATIONS FOR LOGGED-IN USER (100% Real DB records)
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. MARK ALL NOTIFICATIONS AS READ
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId }, { unread: false });
    const updated = await Notification.find({ user: req.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All alerts marked as read.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. MARK SINGLE NOTIFICATION AS READ
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.userId },
      { unread: false },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. DELETE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findOneAndDelete({ _id: id, user: req.userId });

    res.status(200).json({
      success: true,
      message: "Notification removed.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
