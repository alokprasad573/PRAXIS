const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const workflowController = require("../controllers/workflow.controller");
const approvalController = require("../controllers/approval.controller");
const notificationController = require("../controllers/notification.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// All dashboard endpoints require valid authenticated session context
router.use(authenticate);

// 1. Centralized Bootstrap Aggregator
router.get("/bootstrap", dashboardController.getBootstrap);

// 2. Action Endpoints (Aliases matching API_PATHS.DASHBOARD)
router.post("/workflows/launch", workflowController.launchWorkflow);
router.post("/approvals/:id/decision", approvalController.decideApproval);
router.patch("/notifications/mark-read", notificationController.markAllRead);

module.exports = router;

