const express = require("express");
const router = express.Router();
const workflowController = require("../controllers/workflow.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// All workflow routes are protected with active session context
router.use(authenticate);

router.get("/", workflowController.getWorkflows);
router.post("/launch", workflowController.launchWorkflow);
router.get("/runs", workflowController.getWorkflowRuns);
router.get("/:id", workflowController.getWorkflowById);
router.post("/:id/cancel", workflowController.cancelWorkflow);

module.exports = router;