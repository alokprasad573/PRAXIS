const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.patch("/mark-read", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;

