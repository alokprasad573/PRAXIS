const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agents.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/", agentController.getAgents);
router.get("/runs", agentController.getAgentRuns);
router.get("/:id", agentController.getAgentById);

module.exports = router;