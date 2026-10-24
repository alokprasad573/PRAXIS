const express = require("express");
const router = express.Router();
const approvalController = require("../controllers/approval.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/pending", approvalController.getPendingApprovals);
router.get("/history", approvalController.getApprovalHistory);
router.post("/:id/decision", approvalController.decideApproval);
router.post("/:id/approve", (req, res, next) => {
  req.body.decision = "approve";
  approvalController.decideApproval(req, res, next);
});
router.post("/:id/reject", (req, res, next) => {
  req.body.decision = "reject";
  approvalController.decideApproval(req, res, next);
});

module.exports = router;