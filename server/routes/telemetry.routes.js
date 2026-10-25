const express = require("express");
const router = express.Router();
const telemetryController = require("../controllers/telemetry.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Telemetry and Logs endpoints require active authenticated session context
router.use(authenticate);

// 1. GET /api/logs
router.get("/", telemetryController.getLogs);

// 2. GET /api/logs/stream (SSE Feed)
router.get("/stream", telemetryController.streamLogs);

// 3. GET /api/logs/analytics
router.get("/analytics", telemetryController.getAnalytics);

module.exports = router;

