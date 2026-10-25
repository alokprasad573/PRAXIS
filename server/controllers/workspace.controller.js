const Workspace = require("../models/workspace.models");
const User = require("../models/user.models");
const Session = require("../models/session.models");
const jwt = require("jsonwebtoken");
const { sendInvitationEmail } = require("../utils/emailService");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_SECRETS ||
  process.env.secret_key ||
  "praxis-super-secret-key";

// Helper to format members list for frontend
const formatMembers = (workspace) => {
  if (!workspace || !workspace.members) return [];

  const ownerId = workspace.owner?._id
    ? workspace.owner._id.toString()
    : workspace.owner?.toString();

  return workspace.members.map((m) => {
    const userDoc = m.user || {};
    const userId = userDoc._id ? userDoc._id.toString() : userDoc.toString();
    const isOwner = ownerId === userId;

    let initials = userDoc.initials;
    if (!initials && userDoc.name) {
      initials = userDoc.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }

    return {
      id: m._id ? m._id.toString() : userId,
      userId,
      name: userDoc.name || "Collaborator",
      email: userDoc.email || "",
      role: isOwner ? "Owner / Admin" : m.role || "Member",
      initials: initials || "AP",
      avatar: userDoc.avatar || null,
      status: "Active",
      isOwner,
      joinedAt: m.joinedAt || workspace.createdAt || new Date().toISOString(),
    };
  });
};

exports.formatMembers = formatMembers;

// 1. GET CURRENT WORKSPACE DETAILS & MEMBERS
exports.getCurrentWorkspace = async (req, res) => {
  try {
    let workspaceId = req.workspaceId;

    if (!workspaceId) {
      const ws = await Workspace.findOne({
        $or: [{ owner: req.userId }, { "members.user": req.userId }],
      });
      if (ws) workspaceId = ws._id;
    }

    if (!workspaceId) {
      return res.status(404).json({
        success: false,
        message: "No active workspace found for this user.",
      });
    }

    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email initials avatar role")
      .populate("members.user", "name email initials avatar role");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    // Ensure owner is in members array
    const hasOwner = workspace.members.some(
      (m) =>
        (m.user?._id || m.user)?.toString() ===
        (workspace.owner?._id || workspace.owner)?.toString()
    );

    if (!hasOwner && workspace.owner) {
      workspace.members.unshift({
        user: workspace.owner._id || workspace.owner,
        role: "Owner / Admin",
        joinedAt: workspace.createdAt,
      });
      await workspace.save();
    }

    const members = formatMembers(workspace);

    res.status(200).json({
      success: true,
      data: {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
        plan: workspace.plan,
        planPrice: workspace.planPrice,
        owner: workspace.owner,
        membersCount: members.length,
        members,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET WORKSPACE MEMBERS
exports.getMembers = async (req, res) => {
  try {
    let workspaceId = req.workspaceId;

    if (!workspaceId) {
      const ws = await Workspace.findOne({
        $or: [{ owner: req.userId }, { "members.user": req.userId }],
      });
      if (ws) workspaceId = ws._id;
    }

    if (!workspaceId) {
      return res.status(200).json({ success: true, data: [] });
    }

    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email initials avatar role")
      .populate("members.user", "name email initials avatar role");

    if (!workspace) {
      return res.status(200).json({ success: true, data: [] });
    }

    const members = formatMembers(workspace);
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. INVITE NEW MEMBER TO WORKSPACE (Sends Real Email)
exports.inviteMember = async (req, res) => {
  try {
    const { email, role = "Staff Engineer", name } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
      });
    }

    let workspaceId = req.workspaceId;
    if (!workspaceId) {
      const ws = await Workspace.findOne({
        $or: [{ owner: req.userId }, { "members.user": req.userId }],
      });
      if (ws) workspaceId = ws._id;
    }

    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Active workspace not found.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if already a member
    const alreadyMember = workspace.members.some(
      (m) => m.user?.email?.toLowerCase() === cleanEmail
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: `User with email "${cleanEmail}" is already a member of this workspace.`,
      });
    }

    // 1. Generate Secure Signed Invitation Token (Valid for 7 days)
    const inviterName = req.user?.name || workspace.owner?.name || "Workspace Admin";
    const inviteToken = jwt.sign(
      {
        workspaceId: workspace._id,
        email: cleanEmail,
        role: role || "Staff Engineer",
        name: name || "",
        inviterName,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const rawClientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const clientUrl = rawClientUrl.replace(/\/+$/,"")
    const inviteLink = `${clientUrl}/accept-invite?token=${inviteToken}`;

    // 2. Send Real Email to Recipient Inbox
    await sendInvitationEmail({
      toEmail: cleanEmail,
      inviterName,
      workspaceName: workspace.name,
      role: role || "Staff Engineer",
      inviteLink,
    });

    res.status(200).json({
      success: true,
      message: `Invitation email sent successfully to ${cleanEmail}. They can click the link in their inbox to join.`,
      inviteLink,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. VERIFY INVITATION TOKEN DETAILS (When invitee clicks link)
exports.getInviteDetails = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: "Invitation token is missing." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const workspace = await Workspace.findById(decoded.workspaceId).select("name plan");

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace no longer exists." });
    }

    const existingUser = await User.findOne({ email: decoded.email.toLowerCase() });

    res.status(200).json({
      success: true,
      data: {
        workspaceId: workspace._id,
        workspaceName: workspace.name,
        email: decoded.email,
        role: decoded.role,
        inviterName: decoded.inviterName,
        userExists: !!existingUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "This invitation link has expired or is invalid.",
    });
  }
};

// 5. ACCEPT INVITATION & JOIN WORKSPACE
exports.acceptInvitation = async (req, res) => {
  try {
    const { token, password, name } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const workspace = await Workspace.findById(decoded.workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found." });
    }

    const cleanEmail = decoded.email.toLowerCase().trim();

    // 1. Find or create user
    let user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Please provide a password of at least 6 characters to complete registration.",
        });
      }
      // Naya user banega role "developer" ke sath (NO NEW WORKSPACE)
      user = await User.create({
        name: name || decoded.name || cleanEmail.split("@")[0],
        email: cleanEmail,
        password,
        role: "developer",
        activeWorkspace: workspace._id,
      });
    } else if (password) {
      const isValidPass = await user.comparePassword(password);
      if (!isValidPass) {
        return res.status(401).json({
          success: false,
          message: "Incorrect password for existing account.",
        });
      }
    }

    // 2. Add to workspace members
    const alreadyMember = workspace.members.some(
      (m) => (m.user?._id || m.user)?.toString() === user._id.toString()
    );

    if (!alreadyMember) {
      workspace.members.push({
        user: user._id,
        role: decoded.role || "Staff Engineer",
        joinedAt: new Date(),
      });
      await workspace.save();
    }

    // 3. Switch user active workspace
    user.activeWorkspace = workspace._id;
    await user.save();

    // 4. Create Session and JWT
    const sessionToken = jwt.sign(
      {
        userId: user._id,
        workspaceId: workspace._id,
        projectId: user.activeProject || null,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    await Session.create({
      token: sessionToken,
      user: user._id,
      workspace: workspace._id,
      project: user.activeProject || null,
      role: "developer",
      device: { clientType: "browser" },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      message: `Successfully joined ${workspace.name}!`,
      data: {
        token: sessionToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: decoded.role || "Staff Engineer",
          initials: user.initials,
        },
        workspace: {
          id: workspace._id,
          name: workspace.name,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to accept invitation.",
    });
  }
};

// 6. UPDATE MEMBER ROLE
exports.updateMemberRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required." });
    }

    let workspaceId = req.workspaceId;
    const workspace = await Workspace.findById(workspaceId).populate(
      "members.user",
      "name email initials avatar role"
    );

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found." });
    }

    const member = workspace.members.find(
      (m) =>
        m._id.toString() === id ||
        (m.user?._id && m.user._id.toString() === id)
    );

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found in workspace." });
    }

    if (workspace.owner.toString() === (member.user?._id || member.user).toString()) {
      return res.status(400).json({ success: false, message: "Workspace owner role cannot be modified." });
    }

    member.role = role;
    await workspace.save();

    await workspace.populate("members.user", "name email initials avatar role");
    const members = formatMembers(workspace);

    res.status(200).json({
      success: true,
      message: "Member role updated successfully.",
      data: members,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. REMOVE MEMBER FROM WORKSPACE
exports.removeMember = async (req, res) => {
  try {
    const { id } = req.params;

    let workspaceId = req.workspaceId;
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found." });
    }

    const memberIndex = workspace.members.findIndex(
      (m) =>
        m._id.toString() === id ||
        (m.user && m.user.toString() === id)
    );

    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: "Member not found in workspace." });
    }

    const targetUser = workspace.members[memberIndex].user;

    if (workspace.owner.toString() === targetUser.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove workspace owner.",
      });
    }

    workspace.members.splice(memberIndex, 1);
    await workspace.save();

    await workspace.populate("owner", "name email initials avatar role");
    await workspace.populate("members.user", "name email initials avatar role");
    const members = formatMembers(workspace);

    res.status(200).json({
      success: true,
      message: "Member removed from workspace.",
      data: members,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};