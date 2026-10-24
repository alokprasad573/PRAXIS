const express = require("express");
const router = express.Router();
const workspaceController = require("../controllers/workspace.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Public Invitation Endpoints (Email click par bina login bhi open ho sake)
router.get("/invite-details", workspaceController.getInviteDetails);
router.post("/accept-invite", workspaceController.acceptInvitation);

// Protected Workspace Endpoints (Requires Login)
router.use(authenticate);

router.get("/current", workspaceController.getCurrentWorkspace);
router.get("/members", workspaceController.getMembers);
router.post("/members", workspaceController.inviteMember);
router.patch("/members/:id", workspaceController.updateMemberRole);
router.delete("/members/:id", workspaceController.removeMember);

module.exports = router;