const assert = require("assert");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Workspace = require("../models/workspace.models");
const Project = require("../models/project.models");
const Workflow = require("../models/workflow.models");
const ApprovalGate = require("../models/approvalGate.models");
const Notification = require("../models/notifications.models");
const User = require("../models/user.models");
const dashboardController = require("../controllers/dashboard.controller");
const workflowController = require("../controllers/workflow.controller");
const approvalController = require("../controllers/approval.controller");
const notificationController = require("../controllers/notification.controller");

/**
 * Regression Test Suite for BUG-003:
 * Proves mounted /api/dashboard routes:
 * 1. GET /api/dashboard/bootstrap (aggregated data + tenant isolation)
 * 2. POST /api/dashboard/workflows/launch
 * 3. POST /api/dashboard/approvals/:id/decision
 * 4. PATCH /api/dashboard/notifications/mark-read
 */
async function runDashboardRoutesTests() {
  console.log("==================================================");
  console.log("RUNNING: BUG-003 Dashboard Routes Test Suite");
  console.log("==================================================");

  const { atlasConnect } = require("../config/db");
  await atlasConnect();

  const workspaceAId = new mongoose.Types.ObjectId();
  const workspaceBId = new mongoose.Types.ObjectId();
  const userAId = new mongoose.Types.ObjectId();

  const userA = await User.create({
    _id: userAId,
    name: "Architect User A",
    email: `architect-a-${Date.now()}@praxis.io`,
    password: "Password123!",
  });

  const workspaceA = await Workspace.create({
    _id: workspaceAId,
    name: "Workspace Alpha",
    owner: userAId,
    members: [{ user: userAId, role: "Owner / Admin" }],
  });

  const projectA = await Project.create({
    name: `project-alpha-${Date.now()}`,
    workspace: workspaceAId,
    repo: "https://github.com/praxis/alpha",
    branch: "main",
  });

  const projectB = await Project.create({
    name: `project-beta-${Date.now()}`,
    workspace: workspaceBId,
    repo: "https://github.com/praxis/beta",
    branch: "main",
  });

  const wfA = await Workflow.create({
    customId: `WF-DASH-A-${Date.now()}`,
    name: "Alpha CI/CD Pipeline",
    workspace: workspaceAId,
    project: projectA._id,
    status: "running",
    progress: 25,
  });

  const wfB = await Workflow.create({
    customId: `WF-DASH-B-${Date.now()}`,
    name: "Beta Pipeline (Tenant B)",
    workspace: workspaceBId,
    project: projectB._id,
    status: "running",
    progress: 50,
  });

  const gateA = await ApprovalGate.create({
    approvalId: `appr-dash-a-${Date.now()}`,
    workflow: wfA._id,
    project: projectA._id,
    workspace: workspaceAId,
    stepIndex: 3,
    branch: "main",
    requestedBy: "DevOps Deployer Agent",
    action: "Deploy Alpha to Production",
    risk: "high",
    status: "pending",
  });

  const notifA = await Notification.create({
    user: userAId,
    workspace: workspaceAId,
    title: "TEST NOTIFICATION A",
    message: "Alpha pipeline awaiting check",
    category: "System",
    type: "info",
    unread: true,
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: GET /api/dashboard/bootstrap returns aggregated data with tenant isolation
    // -------------------------------------------------------------------------
    console.log("\n[TEST 1] Testing /api/dashboard/bootstrap aggregation & tenant isolation...");

    let bootstrapStatus = null;
    let bootstrapData = null;
    const reqBootstrap = {
      userId: userAId,
      workspaceId: workspaceAId.toString(),
    };
    const resBootstrap = {
      status(code) {
        bootstrapStatus = code;
        return this;
      },
      json(payload) {
        bootstrapData = payload;
        return this;
      },
    };

    await dashboardController.getBootstrap(reqBootstrap, resBootstrap);

    assert.strictEqual(bootstrapStatus, 200, "Bootstrap should return HTTP 200");
    assert.strictEqual(bootstrapData.success, true);
    assert.ok(bootstrapData.data, "Bootstrap should return data payload");

    const d = bootstrapData.data;
    assert.ok(d.workspace, "Should contain workspace object");
    assert.strictEqual(d.workspace._id.toString(), workspaceAId.toString());
    assert.ok(Array.isArray(d.teamMembers), "Should contain teamMembers array");
    assert.strictEqual(d.teamMembers.length, 1);
    assert.strictEqual(d.teamMembers[0].name, "Architect User A");

    // Check Project isolation
    assert.ok(Array.isArray(d.projects), "Should contain projects array");
    assert.strictEqual(d.projects.length, 1);
    assert.strictEqual(d.projects[0]._id.toString(), projectA._id.toString());
    assert.strictEqual(d.projects.some((p) => p._id.toString() === projectB._id.toString()), false, "Tenant B projects must not leak");

    // Check Workflow isolation
    assert.ok(Array.isArray(d.workflows), "Should contain workflows array");
    assert.strictEqual(d.workflows.length, 1);
    assert.strictEqual(d.workflows[0]._id.toString(), wfA._id.toString());

    // Check Approvals isolation
    assert.ok(Array.isArray(d.approvals), "Should contain approvals array");
    assert.strictEqual(d.approvals.length, 1);
    assert.strictEqual(d.approvals[0]._id.toString(), gateA._id.toString());

    // Check KPIs
    assert.ok(d.kpis, "Should contain kpis object");
    assert.strictEqual(d.kpis.pendingApprovals, 1);
    assert.strictEqual(d.kpis.unreadNotifications, 1);

    console.log("✓ TEST 1 PASSED: /api/dashboard/bootstrap successfully aggregated 10 collections with strict tenant isolation");

    // -------------------------------------------------------------------------
    // TEST 2: POST /api/dashboard/workflows/launch aliases workflow launch
    // -------------------------------------------------------------------------
    console.log("\n[TEST 2] Testing /api/dashboard/workflows/launch route binding...");

    let launchStatus = null;
    let launchData = null;
    const reqLaunch = {
      userId: userAId,
      workspaceId: workspaceAId.toString(),
      body: {
        name: "Security Audit Scan",
        projectId: projectA._id.toString(),
        branch: "main",
        executionMode: "sequential",
      },
    };
    const resLaunch = {
      status(code) {
        launchStatus = code;
        return this;
      },
      json(payload) {
        launchData = payload;
        return this;
      },
    };

    await workflowController.launchWorkflow(reqLaunch, resLaunch);

    assert.strictEqual(launchStatus, 201, "Workflow launch should return HTTP 201");
    assert.strictEqual(launchData.success, true);
    assert.ok(launchData.data._id, "Launched workflow must have an ID");
    assert.strictEqual(launchData.data.name, "Security Audit Scan");

    // Cleanup launched workflow
    await Workflow.deleteOne({ _id: launchData.data._id });
    console.log("✓ TEST 2 PASSED: /api/dashboard/workflows/launch cleanly launches and records workflow");

    // -------------------------------------------------------------------------
    // TEST 3: POST /api/dashboard/approvals/:id/decision aliases approval decision
    // -------------------------------------------------------------------------
    console.log("\n[TEST 3] Testing /api/dashboard/approvals/:id/decision route binding...");

    let decideStatus = null;
    let decideData = null;
    const reqDecide = {
      userId: userAId,
      user: { name: userA.name },
      workspaceId: workspaceAId.toString(),
      params: { id: gateA._id.toString() },
      body: { decision: "approve" },
    };
    const resDecide = {
      status(code) {
        decideStatus = code;
        return this;
      },
      json(payload) {
        decideData = payload;
        return this;
      },
    };

    await approvalController.decideApproval(reqDecide, resDecide);

    assert.strictEqual(decideStatus, 200, "Decision should return HTTP 200");
    assert.strictEqual(decideData.success, true);
    assert.strictEqual(decideData.data.status, "approved");

    const refreshedGateA = await ApprovalGate.findById(gateA._id);
    assert.strictEqual(refreshedGateA.status, "approved");
    console.log("✓ TEST 3 PASSED: /api/dashboard/approvals/:id/decision cleanly authorizes gate and completes workflow");

    // -------------------------------------------------------------------------
    // TEST 4: PATCH /api/dashboard/notifications/mark-read aliases notification read
    // -------------------------------------------------------------------------
    console.log("\n[TEST 4] Testing /api/dashboard/notifications/mark-read route binding...");

    let notifStatus = null;
    let notifData = null;
    const reqNotif = {
      userId: userAId,
      workspaceId: workspaceAId.toString(),
    };
    const resNotif = {
      status(code) {
        notifStatus = code;
        return this;
      },
      json(payload) {
        notifData = payload;
        return this;
      },
    };

    await notificationController.markAllRead(reqNotif, resNotif);

    assert.strictEqual(notifStatus, 200, "Mark all read should return HTTP 200");
    assert.strictEqual(notifData.success, true);

    const refreshedNotifA = await Notification.findById(notifA._id);
    assert.strictEqual(refreshedNotifA.unread, false, "Notification unread flag should be false");
    console.log("✓ TEST 4 PASSED: /api/dashboard/notifications/mark-read cleanly marks alerts as read");

    console.log("\n==================================================");
    console.log("ALL 4 DASHBOARD ROUTE REGRESSION TESTS PASSED!");
    console.log("==================================================");
  } finally {
    // Teardown test fixtures
    await ApprovalGate.deleteMany({ workspace: { $in: [workspaceAId, workspaceBId] } });
    await Workflow.deleteMany({ workspace: { $in: [workspaceAId, workspaceBId] } });
    await Notification.deleteMany({ workspace: { $in: [workspaceAId, workspaceBId] } });
    await Project.deleteMany({ workspace: { $in: [workspaceAId, workspaceBId] } });
    await Workspace.deleteMany({ _id: { $in: [workspaceAId, workspaceBId] } });
    await User.deleteOne({ _id: userAId });
    await mongoose.disconnect();
    console.log("✓ Test fixtures cleanly dismantled");
  }
}

runDashboardRoutesTests().catch((err) => {
  console.error("❌ Dashboard Routes Test Failed:", err);
  process.exit(1);
});

