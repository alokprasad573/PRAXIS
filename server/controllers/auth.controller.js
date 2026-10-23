const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const Workspace = require("../models/workspace.models");
const Project = require("../models/project.models");
const Session = require("../models/session.models");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_SECRETS ||
  process.env.secret_key ||
  "praxis-super-secret-key";

const SESSION_DURATION_DAYS = 7;

// Helper: Parse basic device information from headers
const parseDeviceInfo = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const ip =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

  let browser = "Chrome";
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
    browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  let os = "Unknown OS";
  if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS"))
    os = "macOS";
  else if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Linux")) os = "Linux";

  const clientType = userAgent.includes("PRAXIS-CLI") ? "cli" : "browser";

  return { ip, userAgent, browser, os, clientType };
};

// 1. REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // A. Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "Workspace Admin",
    });

    // B. Auto-create Workspace for user (Container only, NO fake projects)
    const workspace = await Workspace.create({
      name: `${user.name.split(" ")[0]}'s Workspace`,
      slug: `${user.name.toLowerCase().replace(/\s+/g, "-")}-org`,
      owner: user._id,
      plan: "Enterprise Dedicated Swarm",
      members: [{ user: user._id, role: "Owner / Admin" }],
    });

    user.activeWorkspace = workspace._id;
    user.activeProject = null;
    await user.save();

    // C. Generate JWT Token
    const expiresAt = new Date(
      Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    );
    const token = jwt.sign(
      { userId: user._id, workspaceId: workspace._id, projectId: null },
      JWT_SECRET,
      { expiresIn: `${SESSION_DURATION_DAYS}d` },
    );

    // D. Create Session document
    const session = await Session.create({
      token,
      user: user._id,
      workspace: workspace._id,
      project: null,
      role: user.role,
      device: parseDeviceInfo(req),
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: "Account and workspace registered successfully.",
      data: {
        token,
        session: { id: session._id, expiresAt: session.expiresAt },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          initials: user.initials,
        },
        workspace: {
          id: workspace._id,
          name: workspace.name,
          plan: workspace.plan,
        },
        project: null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    // Find user with password included
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password")
      .populate("activeWorkspace")
      .populate("activeProject");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Account not found or invalid email/password credentials.",
      });
    }

    // Resolve or fallback Workspace & Project
    let workspaceId = user.activeWorkspace?._id;
    if (!workspaceId) {
      const existingWs = await Workspace.findOne({ owner: user._id });
      workspaceId = existingWs?._id;
    }

    let projectId = user.activeProject?._id;
    if (!projectId && workspaceId) {
      const existingProj = await Project.findOne({ workspace: workspaceId });
      projectId = existingProj?._id;
    }

    // Generate JWT
    const expiresAt = new Date(
      Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    );
    const token = jwt.sign(
      { userId: user._id, workspaceId, projectId },
      JWT_SECRET,
      { expiresIn: `${SESSION_DURATION_DAYS}d` },
    );

    // Create Session Record referencing all active models
    const session = await Session.create({
      token,
      user: user._id,
      workspace: workspaceId,
      project: projectId,
      role: user.role,
      device: parseDeviceInfo(req),
      expiresAt,
    });

    res.status(200).json({
      success: true,
      message: "Authentication successful.",
      data: {
        token,
        session: { id: session._id, expiresAt: session.expiresAt },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          initials: user.initials,
        },
        workspace: user.activeWorkspace,
        project: user.activeProject,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET CURRENT USER & SESSION CONTEXT
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      session: {
        id: req.sessionId,
        device: req.session.device,
        lastActive: req.session.lastActive,
      },
      user: req.user,
      workspace: req.workspace,
      project: req.project,
    },
  });
};

// 4. SWITCH CONTEXT (Project or Workspace without re-login)
exports.switchContext = async (req, res) => {
  try {
    const { projectId, workspaceId } = req.body;
    let targetWorkspaceId = req.session.workspace;
    let workspaceChanged = false;

    if (workspaceId) {
      const ws = await Workspace.findOne({
        _id: workspaceId,
        $or: [{ owner: req.userId }, { "members.user": req.userId }],
      });
      if (!ws)
        return res
          .status(404)
          .json({ success: false, message: "Workspace not found." });
      workspaceChanged =
        req.session.workspace?.toString() !== ws._id.toString();
      req.session.workspace = ws._id;
      req.user.activeWorkspace = ws._id;
      targetWorkspaceId = ws._id;
    }

    if (projectId) {
      const proj = await Project.findOne({
        _id: projectId,
        workspace: targetWorkspaceId,
      });
      if (!proj)
        return res
          .status(404)
          .json({ success: false, message: "Project not found." });
      req.session.project = proj._id;
      req.user.activeProject = proj._id;
    } else if (workspaceChanged) {
      req.session.project = null;
      req.user.activeProject = null;
    }

    await req.user.save();
    await req.session.save();

    res.status(200).json({
      success: true,
      message: "Session active context switched.",
      data: {
        workspaceId: req.session.workspace,
        projectId: req.session.project,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. LOGOUT (Invalidate Current Session)
exports.logout = async (req, res) => {
  try {
    req.session.isValid = false;
    await req.session.save();

    res.status(200).json({
      success: true,
      message: "Signed out successfully. Session invalidated.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. GET ACTIVE DEVICE SESSIONS (Matches Settings View)
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.userId,
      isValid: true,
      expiresAt: { $gt: new Date() },
    }).sort({ lastActive: -1 });

    const formatted = sessions.map((s) => ({
      id: s._id,
      isCurrent: s._id.toString() === req.sessionId.toString(),
      device: s.device,
      lastActive: s.lastActive,
      createdAt: s.createdAt,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. REVOKE OTHER SESSIONS
exports.revokeOtherSessions = async (req, res) => {
  try {
    await Session.updateMany(
      { user: req.userId, _id: { $ne: req.sessionId } },
      { isValid: false },
    );

    res.status(200).json({
      success: true,
      message: "All other device sessions have been revoked.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. GITHUB OAUTH - REDIRECT TO GITHUB AUTH PAGE
exports.githubRedirect = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri =
    process.env.GITHUB_CALLBACK_URL ||
    `http://localhost:${process.env.PORT || 8000}/api/auth/github/callback`;

  if (!clientId) {
    return res.status(500).json({
      success: false,
      message: "GITHUB_CLIENT_ID is not configured in .env",
    });
  }

  // 👈 scope=repo,user:email taaki user ke saare original repositories read ho sakein
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=repo,user:email`;

  res.redirect(githubAuthUrl);
};

// 9. GITHUB OAUTH - CALLBACK & SESSION CREATION
exports.githubCallback = async (req, res) => {
  const { code } = req.query;
  const clientUrl = process.env.GITHUB_CLIENT_URL || "http://localhost:5173";

  if (!code) {
    return res.redirect(`${clientUrl}/auth?error=github_code_missing`);
  }

  try {
    // 1. Exchange temporary code for GitHub access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      },
    );
    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.redirect(`${clientUrl}/auth?error=github_token_failed`);
    }

    // 2. Fetch GitHub User Profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "PRAXIS - Multi Agent Orchestration Platform",
      },
    });
    const githubUser = await userResponse.json();

    // 3. Fetch GitHub Primary Email
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "PRAXIS - Multi Agent Orchestration Platform",
      },
    });
    const emails = await emailResponse.json();
    const primaryEmail =
      Array.isArray(emails) &&
      emails.find((e) => e.primary && e.verified)?.email
        ? emails.find((e) => e.primary && e.verified).email
        : githubUser.email || `${githubUser.login}@github.internal`;

    // 4. Find or Create User in MongoDB
    let user = await User.findOne({ email: primaryEmail.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: githubUser.name || githubUser.login,
        email: primaryEmail.toLowerCase(),
        password: Math.random().toString(36).slice(-10) + "Aa1!",
        avatar: githubUser.avatar_url,
        provider: "github",
        role: "Workspace Admin",
        githubAccessToken: tokenData.access_token,
        githubUsername: githubUser.login,
      });

      const workspace = await Workspace.create({
        name: `${user.name.split(" ")[0]}'s Workspace`,
        slug: `${user.name.toLowerCase().replace(/\s+/g, "-")}-org`,
        owner: user._id,
        plan: "Enterprise Dedicated Swarm",
        members: [{ user: user._id, role: "Owner / Admin" }],
      });

      user.activeWorkspace = workspace._id;
      user.activeProject = null;
      await user.save();
    } else {
      user.githubAccessToken = tokenData.access_token;
      user.githubUsername = githubUser.login;
      if (githubUser.avatar_url && !user.avatar) {
        user.avatar = githubUser.avatar_url;
      }
      await user.save();
    }

    // 5. Generate JWT Session Token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = jwt.sign(
      {
        userId: user._id,
        workspaceId: user.activeWorkspace,
        projectId: user.activeProject || null,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Create Session Record
    await Session.create({
      token,
      user: user._id,
      workspace: user.activeWorkspace,
      project: user.activeProject || null,
      role: user.role,
      device: parseDeviceInfo(req),
      expiresAt,
    });

    const userData = encodeURIComponent(
      JSON.stringify({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
        avatar: user.avatar,
      }),
    );

    // 7. Redirect back to Frontend with Token
    res.redirect(`${clientUrl}/auth?token=${token}&user=${userData}`);
  } catch (err) {
    console.error("GitHub OAuth Error:", err);
    res.redirect(`${clientUrl}/auth?error=oauth_internal_error`);
  }
};
