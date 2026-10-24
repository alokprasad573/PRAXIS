const ApprovalGate = require("../models/approvalGate.models");
const Workflow = require("../models/workflow.models");
const Notification = require("../models/notifications.models");

// 1. GET PENDING APPROVALS FOR ACTIVE WORKSPACE
exports.getPendingApprovals = async (req, res) => {
  try {
    const approvals = await ApprovalGate.find({ status: "pending" })
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
    const { decision } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid decision. Must be 'approve' or 'reject'.",
      });
    }

    const gate = await ApprovalGate.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { approvalId: id }],
    }).populate("workflow").populate("project");

    if (!gate) {
      return res.status(404).json({ success: false, message: "Approval gate not found." });
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
    await gate.save();

    // Update associated workflow status
    if (gate.workflow) {
      const workflow = await Workflow.findById(gate.workflow._id);
      if (workflow) {
        if (isApproved) {
          workflow.progress = 100;
          workflow.status = "completed";
          workflow.completedAt = new Date();
          if (workflow.agentPipeline && workflow.agentPipeline.length > 3) {
            workflow.agentPipeline[3].status = "completed";
            workflow.agentPipeline[3].output = "Authorized by human operator. Container promoted to staging cluster.";
          }
        } else {
          workflow.status = "failed";
          workflow.completedAt = new Date();
          if (workflow.agentPipeline && workflow.agentPipeline.length > 3) {
            workflow.agentPipeline[3].status = "failed";
            workflow.agentPipeline[3].output = "Deployment aborted by human authorization gate.";
          }
        }
        await workflow.save();

        // Create Real Notification
        if (req.userId) {
          await Notification.create({
            user: req.userId,
            title: isApproved
              ? `GATE AUTHORIZED: ${gate.action} (${gate.approvalId})`
              : `GATE REJECTED: ${gate.action} (${gate.approvalId})`,
            description: isApproved
              ? `Workflow ${workflow.customId} resumed and completed at 100%.`
              : `Step rejected. Workflow ${workflow.customId} stopped.`,
            category: "Approvals",
            type: isApproved ? "success" : "high-risk",
            unread: true,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Action has been ${isApproved ? "authorized" : "rejected"} successfully.`,
      data: gate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET APPROVAL AUDIT HISTORY
exports.getApprovalHistory = async (req, res) => {
  try {
    const history = await ApprovalGate.find({ status: { $ne: "pending" } })
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
