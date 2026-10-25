const mongoose = require("mongoose");
const Workspace = require("../models/workspace.models");
const Project = require("../models/project.models");
const Workflow = require("../models/workflow.models");
const ApprovalGate = require("../models/approvalGate.models");
const Agent = require("../models/agent.models");
const AgentRun = require("../models/agentRun.models");
const Notification = require("../models/notifications.models");
const OkfPolicy = require("../models/okfPolicy.models");
const VectorEmbedding = require("../models/vectorEmbedding.models");
const { formatMembers } = require("./workspace.controller");

/**
 * GET /api/dashboard/bootstrap
 * High-performance single-call aggregator that hydrates all 18 views of the PRAXIS dashboard.
 * Scoped strictly to the authenticated user's active workspace.
 */
exports.getBootstrap = async (req, res) => {
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
        message: "No active workspace context found for authenticated session.",
      });
    }

    const validWorkspaceId = mongoose.Types.ObjectId.isValid(workspaceId.toString())
      ? new mongoose.Types.ObjectId(workspaceId.toString())
      : workspaceId;

    // Run parallel queries across MongoDB collections
    const [
      workspaceDoc,
      projects,
      workflows,
      pendingApprovals,
      approvalHistory,
      agents,
      agentRuns,
      notifications,
      okfPolicies,
      ragSources,
    ] = await Promise.all([
      // 1. Workspace details with populated owner and members
      Workspace.findById(validWorkspaceId)
        .populate("owner", "name email initials avatar role")
        .populate("members.user", "name email initials avatar role")
        .lean(),

      // 2. Workspace Projects
      Project.find({ workspace: validWorkspaceId }).sort({ createdAt: -1 }).lean(),

      // 3. Workspace Workflows
      Workflow.find({ workspace: validWorkspaceId })
        .populate("project", "name repo branch")
        .sort({ createdAt: -1 })
        .lean(),

      // 4. Pending Approval Gates for this workspace
      ApprovalGate.find({
        workspace: validWorkspaceId,
        status: "pending",
      })
        .populate("workflow")
        .populate("project")
        .sort({ createdAt: -1 })
        .lean(),

      // 5. Historical Approval Decisions for this workspace
      ApprovalGate.find({
        workspace: validWorkspaceId,
        status: { $ne: "pending" },
      })
        .populate("workflow")
        .populate("project")
        .populate("decidedBy", "name email")
        .sort({ decidedAt: -1 })
        .limit(50)
        .lean(),

      // 6. Agent Library
      Agent.find().sort({ totalRuns: -1 }).lean(),

      // 7. Recent Agent Execution Runs
      AgentRun.find()
        .populate("agent", "name agentId type model")
        .populate("workflow", "customId name")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),

      // 8. Notifications
      Notification.find({
        $or: [{ workspace: validWorkspaceId }, { user: req.userId }],
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),

      // 9. OKF Governance Policies
      OkfPolicy.find({
        $or: [{ workspace: validWorkspaceId }, { isGlobal: true }],
      })
        .sort({ createdAt: -1 })
        .lean(),

      // 10. RAG Sources / Chunks
      VectorEmbedding.find({
        workspace: validWorkspaceId,
      })
        .select("source category metadata createdAt")
        .limit(100)
        .lean(),
    ]);

    // Format team members using workspace helper
    const teamMembers = workspaceDoc ? formatMembers(workspaceDoc) : [];

    // Derive real-time KPIs
    const runningWorkflows = (workflows || []).filter(
      (w) => w.status === "running" || w.status === "waiting"
    ).length;

    const unreadAlerts = (notifications || []).filter((n) => n.unread).length;

    const kpis = {
      activeWorkflows: runningWorkflows,
      totalWorkflows: (workflows || []).length,
      pendingApprovals: (pendingApprovals || []).length,
      activeAgents: (agents || []).filter((a) => a.status === "active").length || (agents || []).length,
      enabledOkfPolicies: (okfPolicies || []).filter((p) => p.status === "enabled").length || (okfPolicies || []).length,
      unreadNotifications: unreadAlerts,
    };

    res.status(200).json({
      success: true,
      data: {
        workspace: workspaceDoc
          ? { ...workspaceDoc, members: teamMembers }
          : null,
        teamMembers,
        projects: projects || [],
        workflows: workflows || [],
        approvals: pendingApprovals || [],
        approvalHistory: approvalHistory || [],
        agents: agents || [],
        agentRuns: agentRuns || [],
        notifications: notifications || [],
        okfPolicies: okfPolicies || [],
        ragSources: ragSources || [],
        kpis,
      },
    });
  } catch (error) {
    console.error("[Dashboard Bootstrap Error]:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

