const Workflow = require("../models/workflow.models");
const WorkflowRun = require("../models/workflowrun.models");
const Project = require("../models/project.models");
const ApprovalGate = require("../models/approvalGate.models");
const Notification = require("../models/notifications.models");
const {
  executeRealPipeline,
  cancelWorkflow: cancelWorkflowService,
} = require("../services/agentOrchestrator.service");

// 1. GET ALL WORKFLOWS (Filtered by active workspace and project)
exports.getWorkflows = async (req, res) => {
  try {
    const workspaceId = req.workspaceId;
    const query = {};

    if (workspaceId) query.workspace = workspaceId;
    if (req.query.projectId) query.project = req.query.projectId;
    if (req.query.status) query.status = req.query.status;

    const workflows = await Workflow.find(query)
      .populate("project", "name repo branch")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. LAUNCH NEW WORKFLOW
exports.launchWorkflow = async (req, res) => {
  try {
    const {
      name,
      projectId,
      branch = "main",
      executionMode = "parallel",
      approvalPolicy = "high-risk-only",
      trigger = "manual",
    } = req.body;

    const workspaceId = req.workspaceId;

    if (!name || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Workflow name and project are required.",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    // Generate Custom ID like WF-2049
    const count = await Workflow.countDocuments();
    const customId = `WF-${2048 + count}`;

    // Standard Multi-Agent Pipeline for PRAXIS with DAG dependencies
    const agentPipeline = [
      {
        id: "stage-code-analysis",
        name: "Code Analysis Agent",
        status: "running",
        dependencies: [],
        startedAt: new Date(),
        tokens: 1250,
        output: "Scanning AST and module dependencies...",
      },
      {
        id: "stage-unit-test",
        name: "Unit Test Agent",
        status: executionMode === "parallel" ? "running" : "pending",
        dependencies: executionMode === "parallel" ? [] : ["Code Analysis Agent"],
        startedAt: executionMode === "parallel" ? new Date() : null,
        tokens: 0,
        output: "Waiting for AST verification...",
      },
      {
        id: "stage-security-auditor",
        name: "Security Auditor Agent",
        status: executionMode === "parallel" ? "running" : "pending",
        dependencies: executionMode === "parallel" ? [] : ["Unit Test Agent"],
        startedAt: executionMode === "parallel" ? new Date() : null,
        tokens: 0,
        output: "Queued for SAST vulnerability check...",
      },
      {
        id: "stage-devops-deployer",
        name: "DevOps Deployer Agent",
        status: "pending",
        dependencies: ["Code Analysis Agent", "Unit Test Agent", "Security Auditor Agent"],
        startedAt: null,
        tokens: 0,
        output: "Waiting for human approval gate...",
      },
    ];

    const workflow = await Workflow.create({
      customId,
      name,
      workspace: workspaceId,
      project: project._id,
      branch: branch || project.branch || "main",
      status: "running",
      progress: 25,
      trigger,
      executionMode,
      approvalPolicy,
      agentPipeline,
      duration: "12s",
      metrics: {
        tokensUsed: 1250,
        estimatedCost: 0.02,
        retries: 0,
      },
      startedAt: new Date(),
    });

    // Create Initial Trace Run
    const runId = `run-${Math.floor(1000 + Math.random() * 9000)}`;
    await WorkflowRun.create({
      runId,
      workflow: workflow._id,
      agent: "Code Analysis Agent",
      status: "Running",
      currentStep: "Analyzing AST dependencies and cyclomatic complexity",
      duration: "12s",
      tokens: 1250,
      retries: 0,
      trigger: "Manual Launch",
    });

    // Real Notification: Workflow Launched
    if (req.userId) {
      await Notification.create({
        user: req.userId,
        title: `WORKFLOW LAUNCHED: ${customId} ${name}`,
        description: `Multi-agent pipeline started in ${executionMode} execution mode on branch '${branch}'.`,
        category: "Workflows",
        type: "info",
        unread: true,
      });
    }

    // Launch Real Autonomous Pipeline Runner
    executeRealPipeline({
      workflowId: workflow._id,
      userId: req.userId,
      approvalPolicy,
      project,
      branch,
      customId,
      name,
      executionMode,
    });

    const populatedWf = await Workflow.findById(workflow._id).populate("project", "name repo branch");

    res.status(201).json({
      success: true,
      message: `Workflow ${customId} launched successfully in ${executionMode} mode!`,
      data: populatedWf,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET SINGLE WORKFLOW BY ID
exports.getWorkflowById = async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await Workflow.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { customId: id }],
    }).populate("project", "name repo branch");

    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found." });
    }

    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. CANCEL WORKFLOW
exports.cancelWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await Workflow.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { customId: id }],
    });

    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found." });
    }

    const cancelledWf = await cancelWorkflowService(
      workflow._id,
      req.body?.reason || "Cancelled by user"
    );

    res.status(200).json({
      success: true,
      message: `Workflow ${workflow.customId} cancelled.`,
      data: cancelledWf || workflow,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. GET WORKFLOW RUNS (Active & Historical traces)
exports.getWorkflowRuns = async (req, res) => {
  try {
    const runs = await WorkflowRun.find()
      .populate("workflow", "customId name status branch")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: runs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
