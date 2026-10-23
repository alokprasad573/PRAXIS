const jwt = require("jsonwebtoken");
const Session = require("../models/session.models");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_SECRETS ||
  process.env.secret_key ||
  "praxis-super-secret-key";

/**
 * Authentication Middleware:
 * Verifies JWT & Active Session, then injects:
 * - req.session (Session Document) & req.sessionId
 * - req.user (User Document) & req.userId
 * - req.workspace (Workspace Document) & req.workspaceId
 * - req.project (Project Document) & req.projectId
 * - req.userRole (Cached User Role)
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Bearer token missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 1. Verify JWT Signature
    const decoded = jwt.verify(token, JWT_SECRET);

    // 2. Find active session and populate all referenced models
    const session = await Session.findOne({
      token,
      isValid: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "-password")
      .populate("workspace")
      .populate("project");

    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        message: "Session is invalid, expired, or has been revoked.",
      });
    }

    // 3. Inject all models and their IDs into Express Request context
    req.session = session;
    req.sessionId = session._id;

    req.user = session.user;
    req.userId = session.user._id;

    req.workspace = session.workspace;
    req.workspaceId = session.workspace ? session.workspace._id : null;

    req.project = session.project;
    req.projectId = session.project ? session.project._id : null;

    req.userRole = session.role || session.user.role;

    // 4. Update lastActive timestamp (non-blocking)
    Session.findByIdAndUpdate(session._id, { lastActive: new Date() }).exec();

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please sign in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }
};

/**
 * Role-Based Authorization Guard Middleware
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(", ")}] roles.`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
