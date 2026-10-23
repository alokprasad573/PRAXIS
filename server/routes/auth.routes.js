const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Public endpoints
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected endpoints (Requires Active Session)
router.get("/me", authenticate, authController.getMe);
router.post("/logout", authenticate, authController.logout);
router.patch("/switch-context", authenticate, authController.switchContext);
router.get("/sessions", authenticate, authController.getActiveSessions);
router.delete("/sessions/others", authenticate, authController.revokeOtherSessions);

// GitHub OAuth routes (Public)
router.get("/github", authController.githubRedirect);
router.get("/github/callback", authController.githubCallback);

module.exports = router;