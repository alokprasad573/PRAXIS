const assert = require("assert");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const ApprovalGate = require("../models/approvalGate.models");
const Workflow = require("../models/workflow.models");
const Project = require("../models/project.models");
const User = require("../models/user.models");
const Notification = require("../models/notifications.models");
const approvalController = require("../controllers/approval.controller");

/**
 * Regression Test Suite for BUG-002:
 * Proves durable workflow approval resumption and reject handling.
 */
async function runResumptionTests() {
  console.log("==================================================");
  console.log("RUNNING: BUG-002 Workflow Approval Resumption Suite");
  console.log("==================================================");

  const { atlasConnect } = require("../config/db");
  await atlasConnect();

  const workspaceId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  // Create User
  const testUser = await User.create({
    _id: userId,
    name: "Lead DevOps Engineer",
    email: `devops-${Date.now()}@praxis.io`,
    password: "Password123!",
  });

  // Create Project
  const testProject = await Project.create({
    name: `test-resumption-project-${Date.now()}`,
    workspace: workspaceId,
    repo: "https://github.com/praxis/resumption-app",
    branch: "main",
  });

  const createdGateIds = [];
  const createdWfIds = [];

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Approving Final DevOps Step (stepIndex 3) completes workflow at 100%
    // -------------------------------------------------------------------------
    console.log("\n[TEST 1] Testing Final Step Gate (stepIndex: 3) approval...");

    const wf1 = await Workflow.create({
      customId: `WF-TEST-1-${Date.now()}`,
      name: "Full Stack Deployment Pipeline",
      workspace: workspaceId,
      project: testProject._id,
      branch: "main",
      status: "waiting",
      progress: 85,
      currentStepIndex: 3,
      agentPipeline: [
        { name: "Code Analysis Agent", status: "completed", output: "AST check ok" },
        { name: "Unit Test Agent", status: "completed", output: "Tests passed 84%" },
        { name: "Security Auditor Agent", status: "completed", output: "0 CVEs" },
        { name: "DevOps Deployer Agent", status: "waiting", output: "Awaiting prod deploy authorization" },
      ],
    });
    createdWfIds.push(wf1._id);

    const gate1 = await ApprovalGate.create({
      approvalId: `appr-t1-${Date.now()}`,
      workflow: wf1._id,
      project: testProject._id,
      workspace: workspaceId,
      stepIndex: 3,
      branch: "main",
      requestedBy: "DevOps Deployer Agent",
      action: "Deploy to Production Cluster",
      risk: "high",
      status: "pending",
    });
    createdGateIds.push(gate1._id);

    const req1 = {
      params: { id: gate1._id.toString() },
      body: { decision: "approve" },
      userId: testUser._id,
      user: { name: testUser.name },
      workspaceId: workspaceId.toString(),
    };

    let res1Status = null;
    let res1Data = null;
    const res1 = {
      status(code) {
        res1Status = code;
        return this;
      },
      json(payload) {
        res1Data = payload;
        return this;
      },
    };

    await approvalController.decideApproval(req1, res1);

    if (res1Status !== 200) {
      console.error("Test 1 error response:", res1Data);
    }

    assert.strictEqual(res1Status, 200, "Approval decision should return HTTP 200");
    assert.strictEqual(res1Data.success, true);

    const refreshedGate1 = await ApprovalGate.findById(gate1._id);
    assert.strictEqual(refreshedGate1.status, "approved", "Gate 1 should be approved");

    const refreshedWf1 = await Workflow.findById(wf1._id);
    assert.strictEqual(refreshedWf1.status, "completed", "Workflow 1 should transition to completed");
    assert.strictEqual(refreshedWf1.progress, 100, "Workflow 1 progress should be 100%");
    assert.strictEqual(refreshedWf1.agentPipeline[3].status, "completed", "Step 3 should be completed");
    assert.ok(refreshedWf1.completedAt, "Workflow 1 should record completedAt timestamp");

    console.log("✓ TEST 1 PASSED: Final DevOps Gate approval transitions workflow to completed at 100%");

    // -------------------------------------------------------------------------
    // TEST 2: Approving Intermediate Step (stepIndex 1) resumes workflow to step 2
    // -------------------------------------------------------------------------
    console.log("\n[TEST 2] Testing Intermediate Step Gate (stepIndex: 1) approval and resumption...");

    const wf2 = await Workflow.create({
      customId: `WF-TEST-2-${Date.now()}`,
      name: "Feature Pipeline with Unit Test Gate",
      workspace: workspaceId,
      project: testProject._id,
      branch: "staging",
      status: "waiting",
      progress: 50,
      currentStepIndex: 1,
      executionMode: "sequential",
      agentPipeline: [
        { name: "Code Analysis Agent", status: "completed", output: "AST check ok" },
        { name: "Unit Test Agent", status: "waiting", output: "Coverage threshold gate" },
        { name: "Security Auditor Agent", status: "waiting", output: "Queued" },
        { name: "DevOps Deployer Agent", status: "waiting", output: "Queued" },
      ],
    });
    createdWfIds.push(wf2._id);

    const gate2 = await ApprovalGate.create({
      approvalId: `appr-t2-${Date.now()}`,
      workflow: wf2._id,
      project: testProject._id,
      workspace: workspaceId,
      stepIndex: 1,
      branch: "staging",
      requestedBy: "Unit Test Agent",
      action: "Authorize Coverage Exception (72% < 80%)",
      risk: "medium",
      status: "pending",
    });
    createdGateIds.push(gate2._id);

    const req2 = {
      params: { id: gate2._id.toString() },
      body: { decision: "approve" },
      userId: testUser._id,
      user: { name: testUser.name },
      workspaceId: workspaceId.toString(),
    };

    let res2Status = null;
    let res2Data = null;
    const res2 = {
      status(code) {
        res2Status = code;
        return this;
      },
      json(payload) {
        res2Data = payload;
        return this;
      },
    };

    await approvalController.decideApproval(req2, res2);

    assert.strictEqual(res2Status, 200, "Approval decision should return HTTP 200");
    assert.strictEqual(res2Data.success, true);

    const refreshedGate2 = await ApprovalGate.findById(gate2._id);
    assert.strictEqual(refreshedGate2.status, "approved", "Gate 2 should be approved");

    const refreshedWf2 = await Workflow.findById(wf2._id);
    // The paused step (step 1) should be completed
    assert.strictEqual(refreshedWf2.agentPipeline[1].status, "completed", "Step 1 should be marked completed upon approval");
    // The next step (step 2) should be running
    assert.strictEqual(refreshedWf2.agentPipeline[2].status, "running", "Next step (Step 2) should be initialized to running");
    assert.strictEqual(refreshedWf2.currentStepIndex, 2, "Workflow currentStepIndex should advance to 2");
    // Workflow should NOT be prematurely marked 100% or completed
    assert.notStrictEqual(refreshedWf2.progress, 100, "Intermediate gate approval should NOT prematurely set progress to 100%");

    console.log("✓ TEST 2 PASSED: Intermediate Gate approval advances currentStepIndex and resumes next agent");

    // -------------------------------------------------------------------------
    // TEST 3: Rejecting a Gate stops the pipeline and marks remaining steps failed
    // -------------------------------------------------------------------------
    console.log("\n[TEST 3] Testing Gate Rejection...");

    const wf3 = await Workflow.create({
      customId: `WF-TEST-3-${Date.now()}`,
      name: "Security Audited Pipeline",
      workspace: workspaceId,
      project: testProject._id,
      branch: "main",
      status: "waiting",
      progress: 75,
      currentStepIndex: 2,
      agentPipeline: [
        { name: "Code Analysis Agent", status: "completed", output: "AST check ok" },
        { name: "Unit Test Agent", status: "completed", output: "Tests ok" },
        { name: "Security Auditor Agent", status: "waiting", output: "Critical CVE detected" },
        { name: "DevOps Deployer Agent", status: "waiting", output: "Queued" },
      ],
    });
    createdWfIds.push(wf3._id);

    const gate3 = await ApprovalGate.create({
      approvalId: `appr-t3-${Date.now()}`,
      workflow: wf3._id,
      project: testProject._id,
      workspace: workspaceId,
      stepIndex: 2,
      branch: "main",
      requestedBy: "Security Auditor Agent",
      action: "Authorize Critical Vulnerability Bypass",
      risk: "critical",
      status: "pending",
    });
    createdGateIds.push(gate3._id);

    const req3 = {
      params: { id: gate3._id.toString() },
      body: { decision: "reject", reason: "Cannot deploy with critical CVE-2024-xxxx" },
      userId: testUser._id,
      user: { name: testUser.name },
      workspaceId: workspaceId.toString(),
    };

    let res3Status = null;
    let res3Data = null;
    const res3 = {
      status(code) {
        res3Status = code;
        return this;
      },
      json(payload) {
        res3Data = payload;
        return this;
      },
    };

    await approvalController.decideApproval(req3, res3);

    assert.strictEqual(res3Status, 200, "Decision should return HTTP 200");
    const refreshedGate3 = await ApprovalGate.findById(gate3._id);
    assert.strictEqual(refreshedGate3.status, "rejected", "Gate 3 should be marked rejected");

    const refreshedWf3 = await Workflow.findById(wf3._id);
    assert.strictEqual(refreshedWf3.status, "failed", "Workflow 3 should transition to failed");
    assert.strictEqual(refreshedWf3.agentPipeline[2].status, "failed", "Step 2 should be marked failed");
    assert.strictEqual(refreshedWf3.agentPipeline[3].status, "failed", "Subsequent Step 3 should be aborted/failed");
    assert.ok(refreshedWf3.agentPipeline[2].output.includes("rejected by human operator"));

    console.log("✓ TEST 3 PASSED: Gate rejection cleanly transitions workflow and subsequent steps to failed");

    // -------------------------------------------------------------------------
    // TEST 4: Idempotency - Cannot re-decide an already decided gate
    // -------------------------------------------------------------------------
    console.log("\n[TEST 4] Testing Idempotency (Cannot decide already approved gate)...");

    let res4Status = null;
    let res4Data = null;
    const res4 = {
      status(code) {
        res4Status = code;
        return this;
      },
      json(payload) {
        res4Data = payload;
        return this;
      },
    };

    await approvalController.decideApproval(req1, res4);
    assert.strictEqual(res4Status, 400, "Re-deciding an approved gate must return HTTP 400");
    assert.strictEqual(res4Data.success, false);
    console.log("✓ TEST 4 PASSED: Re-deciding already processed gate is rejected with HTTP 400");

    console.log("\n==================================================");
    console.log("ALL 4 RESUMPTION REGRESSION TESTS PASSED CLEANLY!");
    console.log("==================================================");
  } finally {
    // Teardown test fixtures
    await ApprovalGate.deleteMany({ _id: { $in: createdGateIds } });
    await Workflow.deleteMany({ _id: { $in: createdWfIds } });
    await Notification.deleteMany({ workspace: workspaceId });
    await Project.deleteOne({ _id: testProject._id });
    await User.deleteOne({ _id: testUser._id });
    await mongoose.disconnect();
    console.log("✓ Test fixtures cleanly dismantled");
  }
}

runResumptionTests().catch((err) => {
  console.error("❌ Resumption Regression Test Failed:", err);
  process.exit(1);
});
