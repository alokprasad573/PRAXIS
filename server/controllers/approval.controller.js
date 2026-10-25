const mongoose = require("mongoose");
const ApprovalGate = require("../models/approvalGate.models");
const Workflow = require("../models/workflow.models");
const Project = require("../models/project.models");
const User = require("../models/user.models");
const Notification = require("../models/notifications.models");
const { resumeWorkflowAfterApproval } = require("../services/agentOrchestrator.service");

/**
 * Builds a workspace authorization match query for ApprovalGate records.
 * Uses req.workspaceId derived from the authenticated session.
 * Also matches approval records linked to projects belonging to this workspace
 * to support legacy records created before explicit workspace tagging.
 */
async function buildWorkspaceApprovalFilter(workspaceId, extra = {}) {
  if (!workspaceId) {
    return { _id: null, ...extra };
  }

  const validWorkspaceId = mongoose.Types.ObjectId.isValid(workspaceId.toString())
    ? new mongoose.Types.ObjectId(workspaceId.toString())
    : workspaceId;

  // Find all projects owned by this workspace for backward compatibility
  const workspaceProjects = await Project.find({ workspace: validWorkspaceId }).select("_id").lean();
  const projectIds = workspaceProjects.map((p) => p._id);

  return {
    $and: [
      {
        $or: [
          { workspace: validWorkspaceId },
          { project: { $in: projectIds } },
        ],
      },
      extra,
    ],
  };
}

// 1. GET PENDING APPROVALS FOR ACTIVE WORKSPACE
exports.getPendingApprovals = async (req, res) => {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      return res.status(200).json({ success: true, data: [] });
    }

    const filter = await buildWorkspaceApprovalFilter(workspaceId, { status: "pending" });
    const approvals = await ApprovalGate.find(filter)
      .populate("workflow", "customId name branch executionMode")
      .populate("project", "name repo branch")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. DECIDE ON APPROVAL GATE (Approve or Reject)
exports.decideApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reason = "" } = req.body || {};
    const workspaceId = req.workspaceId;

    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision. Must be 'approve' or 'reject'.",
      });
    }

    if (!workspaceId) {
      return res.status(403).json({
        success: false,
        message: "Active workspace context required to decide approvals.",
      });
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const identifierCondition = isObjectId ? { _id: id } : { approvalId: id };
    const authFilter = await buildWorkspaceApprovalFilter(workspaceId, identifierCondition);

    const gate = await ApprovalGate.findOne(authFilter)
      .populate("workflow")
      .populate("project");

    if (!gate) {
      return res.status(404).json({ success: false, message: "Approval gate not found in active workspace." });
    }

    if (gate.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This gate has already been decided (${gate.status}).`,
      });
    }

    const isApproved = decision === "approve";
    gate.status = isApproved ? "approved" : "rejected";
    gate.decidedBy = req.userId;
    gate.decidedByName = req.user?.name || "Workspace Admin";
    gate.decidedAt = new Date();
    gate.decisionDuration = "Just now";
    if (!gate.workspace && workspaceId) {
      gate.workspace = workspaceId;
    }
    await gate.save();

    // Resume or fail the workflow through the orchestrator service
    let resumeResult = null;
    if (gate.workflow) {
      resumeResult = await resumeWorkflowAfterApproval({
        approvalGateId: gate._id,
        userId: req.userId,
        decision,
        reason,
      });

      // Create Real Notification
      if (req.userId) {
        const wf = resumeResult?.workflow || gate.workflow;
        const customId = wf?.customId || "Workflow";
        await Notification.create({
          user: req.userId,
          workspace: workspaceId,
          title: isApproved
            ? `GATE AUTHORIZED: ${gate.action} (${gate.approvalId})`
            : `GATE REJECTED: ${gate.action} (${gate.approvalId})`,
          description: isApproved
            ? (resumeResult?.status === "completed"
                ? `Workflow ${customId} resumed and completed at 100%.`
                : `Workflow ${customId} resumed at Step ${(resumeResult?.nextStepIndex ?? 0) + 1}.`)
            : `Step rejected. Workflow ${customId} stopped.`,
          category: "Approvals",
          type: isApproved ? "success" : "high-risk",
          unread: true,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Action has been ${isApproved ? "authorized" : "rejected"} successfully.`,
      data: gate,
      workflow: resumeResult?.workflow,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET APPROVAL AUDIT HISTORY
exports.getApprovalHistory = async (req, res) => {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      return res.status(200).json({ success: true, data: [] });
    }

    const filter = await buildWorkspaceApprovalFilter(workspaceId, { status: { $ne: "pending" } });
    const history = await ApprovalGate.find(filter)
      .populate("workflow", "customId name")
      .populate("project", "name repo")
      .populate("decidedBy", "name email")
      .sort({ decidedAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
