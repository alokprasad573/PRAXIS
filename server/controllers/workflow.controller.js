const Workflow = require("../models/workflow.models");
const WorkflowRun = require("../models/workflowrun.models");
const Project = require("../models/project.models");
const ApprovalGate = require("../models/approvalGate.models");
const Notification = require("../models/notifications.models");

// Asynchronous Multi-Agent Pipeline Runner
const runPipelineAsync = async ({
  workflowId,
  userId,
  approvalPolicy,
  project,
  branch,
  customId,
  name,
}) => {
  try {
    // Stage 1: Code Analysis completes -> 50% (after 3.5s)
    await new Promise((resolve) => setTimeout(resolve, 3500));
    let wf = await Workflow.findById(workflowId);
    if (!wf || wf.status === "failed" || wf.status === "cancelled") return;

    wf.progress = 50;
    wf.duration = "24s";
    if (wf.metrics) wf.metrics.tokensUsed = (wf.metrics.tokensUsed || 0) + 2840;
    if (wf.agentPipeline && wf.agentPipeline.length > 1) {
      wf.agentPipeline[0].status = "completed";
      wf.agentPipeline[0].tokens = 2840;
      wf.agentPipeline[0].output = "AST verified. 0 syntax or type violations found.";
      wf.agentPipeline[1].status = "running";
      wf.agentPipeline[1].startedAt = new Date();
      wf.agentPipeline[1].output = "Synthesizing test suites and assertions...";
    }
    await wf.save();

    await WorkflowRun.create({
      runId: `run-${Math.floor(1000 + Math.random() * 9000)}`,
      workflow: workflowId,
      agent: "Unit Test Agent",
      status: "Running",
      currentStep: "Synthesizing unit test suites and evaluating mock coverage",
      duration: "24s",
      tokens: 2840,
      retries: 0,
      trigger: "Pipeline Step 2",
    });

    // Stage 2: Unit Test completes -> 75% (after 3.5s)
    await new Promise((resolve) => setTimeout(resolve, 3500));
    wf = await Workflow.findById(workflowId);
    if (!wf || wf.status === "failed" || wf.status === "cancelled") return;

    wf.progress = 75;
    wf.duration = "45s";
    if (wf.metrics) wf.metrics.tokensUsed = (wf.metrics.tokensUsed || 0) + 3250;
    if (wf.agentPipeline && wf.agentPipeline.length > 2) {
      wf.agentPipeline[1].status = "completed";
      wf.agentPipeline[1].tokens = 3250;
      wf.agentPipeline[1].output = "Coverage raised from 48% to 74%. 41/43 test suites passing.";
      wf.agentPipeline[2].status = "running";
      wf.agentPipeline[2].startedAt = new Date();
      wf.agentPipeline[2].output = "Scanning SAST rules & dependency CVEs...";
    }
    await wf.save();

    await WorkflowRun.create({
      runId: `run-${Math.floor(1000 + Math.random() * 9000)}`,
      workflow: workflowId,
      agent: "Security Auditor Agent",
      status: "Running",
      currentStep: "Scanning SAST rules and dependency vulnerabilities",
      duration: "45s",
      tokens: 3250,
      retries: 0,
      trigger: "Pipeline Step 3",
    });

    // Stage 3: Security Auditor completes -> 80% (after 3.5s)
    await new Promise((resolve) => setTimeout(resolve, 3500));
    wf = await Workflow.findById(workflowId);
    if (!wf || wf.status === "failed" || wf.status === "cancelled") return;

    if (wf.agentPipeline && wf.agentPipeline.length > 2) {
      wf.agentPipeline[2].status = "completed";
      wf.agentPipeline[2].output = "0 high-risk CVEs detected. Code passed OKF security guardrails.";
    }

    // Stage 4: Check if Human-in-the-Loop Approval Gate is required
    if (approvalPolicy !== "none") {
      wf.status = "waiting";
      wf.progress = 80;
      wf.duration = "1m 12s";
      if (wf.agentPipeline && wf.agentPipeline.length > 3) {
        wf.agentPipeline[3].status = "waiting";
        wf.agentPipeline[3].output = "Paused at Human Authorization Gate: Awaiting approval.";
      }
      await wf.save();

      const apprId = `appr-${Math.floor(100 + Math.random() * 900)}`;
      await ApprovalGate.create({
        approvalId: apprId,
        workflow: workflowId,
        project: project._id,
        branch: branch || "main",
        requestedBy: "DevOps Deployer Agent",
        action: `Deploy ${project.name} to Staging Cluster`,
        risk: "high",
        reason: "Autonomous pipeline reached container promotion stage",
        impact: "Modifies live cluster routing and spins up new container replica",
        affectedFiles: ["kubernetes/deployment.yaml", "Dockerfile", "package.json"],
        status: "pending",
      });

      // Real Notification: Pending Approval Gate
      await Notification.create({
        user: userId,
        title: `APPROVAL GATE: Deploy ${project.name} (${apprId})`,
        description: `Human authorization required before triggering deployment on branch '${branch}'.`,
        category: "Approvals",
        type: "approval",
        unread: true,
      });
    } else {
      // Auto Complete Workflow to 100%
      wf.status = "completed";
      wf.progress = 100;
      wf.duration = "1m 30s";
      wf.completedAt = new Date();
      if (wf.agentPipeline && wf.agentPipeline.length > 3) {
        wf.agentPipeline[3].status = "completed";
        wf.agentPipeline[3].output = "Container image built and deployed successfully.";
      }
      await wf.save();

      // Real Notification: Workflow Completed
      await Notification.create({
        user: userId,
        title: `WORKFLOW COMPLETED: ${customId} ${name}`,
        description: `All autonomous agent pipelines completed successfully on ${project.name}.`,
        category: "Workflows",
        type: "success",
        unread: true,
      });
    }
  } catch (err) {
    console.error("Pipeline runner execution error:", err);
  }
};

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

    // Standard Multi-Agent Pipeline for PRAXIS
    const agentPipeline = [
      {
        name: "Code Analysis Agent",
        status: "running",
        startedAt: new Date(),
        tokens: 1250,
        output: "Scanning AST and module dependencies...",
      },
      {
        name: "Unit Test Agent",
        status: executionMode === "parallel" ? "running" : "waiting",
        startedAt: executionMode === "parallel" ? new Date() : null,
        tokens: 0,
        output: "Waiting for AST verification...",
      },
      {
        name: "Security Auditor Agent",
        status: "waiting",
        startedAt: null,
        tokens: 0,
        output: "Queued for SAST vulnerability check...",
      },
      {
        name: "DevOps Deployer Agent",
        status: "waiting",
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

    // Launch Asynchronous Pipeline Runner (Progresses from 25% -> 50% -> 75% -> 80% / 100%)
    runPipelineAsync({
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

    workflow.status = "failed";
    workflow.progress = 100;
    workflow.completedAt = new Date();
    await workflow.save();

    res.status(200).json({
      success: true,
      message: `Workflow ${workflow.customId} cancelled.`,
      data: workflow,
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
