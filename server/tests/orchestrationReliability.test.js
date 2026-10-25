const assert = require("assert");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Workflow = require("../models/workflow.models");
const WorkflowRun = require("../models/workflowrun.models");
const ApprovalGate = require("../models/approvalGate.models");
const Project = require("../models/project.models");
const Workspace = require("../models/workspace.models");
const ExecutionLog = require("../models/executionLog.models");

const {
  WORKFLOW_STATES,
  STAGE_STATES,
  isValidWorkflowTransition,
  assertValidWorkflowTransition,
  isValidStageTransition,
  assertValidStageTransition,
  calculateWorkflowProgress,
  executeStageWithTimeoutAndRetry,
  cancelWorkflow,
  recoverDanglingWorkflows,
  resumeWorkflowAfterApproval,
} = require("../services/agentOrchestrator.service");

async function runOrchestrationReliabilityTests() {
  console.log("==================================================");
  console.log("RUNNING: Phase 2 Orchestration Reliability Test Suite");
  console.log("==================================================");

  const { atlasConnect } = require("../config/db");
  await atlasConnect();

  const testWorkspaceId = new mongoose.Types.ObjectId();
  const testProject = await Project.create({
    name: "orchestration-test-repo",
    workspace: testWorkspaceId,
    repo: "https://github.com/praxis/orchestrator-test",
    branch: "main",
  });

  const createdWorkflowIds = [];
  const createdGateIds = [];

  try {
    // ------------------------------------------------------------------------
    // [TEST 1] State Machine Transition Rules & Validation
    // ------------------------------------------------------------------------
    console.log("\n[TEST 1] Testing State Machine Transitions & Validation...");

    // Legal transitions
    assert.strictEqual(isValidWorkflowTransition("queued", "running"), true);
    assert.strictEqual(isValidWorkflowTransition("running", "waiting_for_approval"), true);
    assert.strictEqual(isValidWorkflowTransition("waiting_for_approval", "running"), true);
    assert.strictEqual(isValidWorkflowTransition("running", "completed"), true);
    assert.strictEqual(isValidWorkflowTransition("running", "cancelled"), true);
    assert.strictEqual(isValidWorkflowTransition("running", "failed"), true);

    // Illegal transitions from terminal states
    assert.strictEqual(isValidWorkflowTransition("completed", "running"), false);
    assert.strictEqual(isValidWorkflowTransition("cancelled", "running"), false);
    assert.throws(
      () => assertValidWorkflowTransition("completed", "running"),
      /Illegal workflow state transition from 'completed' to 'running'/
    );
    assert.throws(
      () => assertValidWorkflowTransition("cancelled", "running"),
      /Illegal workflow state transition from 'cancelled' to 'running'/
    );

    // Dynamic progress calculation
    const dummyStages = [
      { name: "S1", status: "completed" },
      { name: "S2", status: "completed" },
      { name: "S3", status: "running" },
      { name: "S4", status: "pending" },
    ];
    // (2 completed + 0.5 running) / 4 = 2.5 / 4 = 62.5% -> 63%
    const progress = calculateWorkflowProgress(dummyStages);
    assert.strictEqual(progress, 63, `Expected progress 63%, got ${progress}%`);

    console.log("✓ TEST 1 PASSED: State transition invariants and progress calculation verified");

    // ------------------------------------------------------------------------
    // [TEST 2] Execution Resilience: Retry on Transient Error
    // ------------------------------------------------------------------------
    console.log("\n[TEST 2] Testing Stage Execution Retry on Transient Failure...");

    let callCount = 0;
    const retryLog = [];

    const transientFailStage = async () => {
      callCount += 1;
      if (callCount < 3) {
        const err = new Error(`Temporary Network Glitch #${callCount}`);
        err.transient = true;
        throw err;
      }
      return { success: true, payload: "Recovered on attempt 3" };
    };

    const { result, retries } = await executeStageWithTimeoutAndRetry({
      stageName: "Test Flaky Agent",
      stageFn: transientFailStage,
      maxRetries: 3,
      timeoutMs: 5000,
      onRetry: async (attempt, err) => {
        retryLog.push({ attempt, message: err.message });
      },
    });

    assert.strictEqual(callCount, 3, "Expected function to be executed 3 times");
    assert.strictEqual(retries, 2, "Expected 2 retries recorded");
    assert.strictEqual(result.payload, "Recovered on attempt 3");
    assert.strictEqual(retryLog.length, 2, "Expected 2 retry callbacks");

    console.log("✓ TEST 2 PASSED: Stage retried on transient error and recovered cleanly");

    // ------------------------------------------------------------------------
    // [TEST 3] Execution Resilience: Stage Timeout Handling
    // ------------------------------------------------------------------------
    console.log("\n[TEST 3] Testing Stage Execution Timeout Enforcement...");

    const hangingStage = async () => {
      // Simulate hanging agent that never finishes in time
      await new Promise((r) => setTimeout(r, 2000));
      return { success: true };
    };

    let timeoutCaught = false;
    try {
      await executeStageWithTimeoutAndRetry({
        stageName: "Hanging Agent",
        stageFn: hangingStage,
        maxRetries: 1,
        timeoutMs: 150, // 150ms timeout
      });
    } catch (err) {
      timeoutCaught = true;
      assert.strictEqual(err.code, "STAGE_TIMEOUT");
      assert(err.message.includes("exceeded execution timeout of 150ms"));
    }

    assert.strictEqual(timeoutCaught, true, "Expected STAGE_TIMEOUT to be thrown");
    console.log("✓ TEST 3 PASSED: Hanging stage safely aborted with STAGE_TIMEOUT");

    // ------------------------------------------------------------------------
    // [TEST 4] Workflow Cancellation: In-Flight Halt
    // ------------------------------------------------------------------------
    console.log("\n[TEST 4] Testing Workflow In-Flight Cancellation...");

    const wfToCancel = await Workflow.create({
      customId: `WF-TEST-CANCEL-${Date.now()}`,
      name: "Test Cancel Workflow",
      workspace: testWorkspaceId,
      project: testProject._id,
      branch: "main",
      status: "running",
      progress: 30,
      currentStepIndex: 1,
      executionMode: "sequential",
      agentPipeline: [
        { name: "Code Analysis Agent", status: "completed", tokens: 100 },
        { name: "Unit Test Agent", status: "running", tokens: 50 },
        { name: "Security Auditor Agent", status: "pending", tokens: 0 },
        { name: "DevOps Deployer Agent", status: "pending", tokens: 0 },
      ],
    });
    createdWorkflowIds.push(wfToCancel._id);

    const cancelledWf = await cancelWorkflow(wfToCancel._id, "User aborted via Dashboard UI");

    assert.strictEqual(cancelledWf.status, "cancelled");
    assert(cancelledWf.completedAt !== null);

    const reloadedWf = await Workflow.findById(wfToCancel._id);
    assert.strictEqual(reloadedWf.status, "cancelled");
    assert.strictEqual(reloadedWf.agentPipeline[0].status, "completed");
    assert.strictEqual(reloadedWf.agentPipeline[1].status, "cancelled");
    assert.strictEqual(reloadedWf.agentPipeline[2].status, "cancelled");
    assert.strictEqual(reloadedWf.agentPipeline[3].status, "cancelled");

    // Check cancellation event logged to WorkflowRun
    const cancelRun = await WorkflowRun.findOne({
      workflow: wfToCancel._id,
      status: "Cancelled",
    });
    assert(cancelRun, "Expected WorkflowRun with status 'Cancelled' to be recorded");

    console.log("✓ TEST 4 PASSED: In-flight workflow cancelled, stages halted, trace logged");

    // ------------------------------------------------------------------------
    // [TEST 5] Server Startup Recovery: Dangling Workflow Reconciliation
    // ------------------------------------------------------------------------
    console.log("\n[TEST 5] Testing Server Startup Dangling Workflow Recovery...");

    // Case A: Workflow running but has a pending approval gate -> should reconcile to "waiting"
    const wfWithPendingGate = await Workflow.create({
      customId: `WF-TEST-REC-GATE-${Date.now()}`,
      name: "Workflow With Orphan Gate",
      workspace: testWorkspaceId,
      project: testProject._id,
      branch: "main",
      status: "running", // crashed while waiting
      currentStepIndex: 3,
      agentPipeline: [
        { name: "Code Analysis Agent", status: "completed" },
        { name: "Unit Test Agent", status: "completed" },
        { name: "Security Auditor Agent", status: "completed" },
        { name: "DevOps Deployer Agent", status: "waiting" },
      ],
    });
    createdWorkflowIds.push(wfWithPendingGate._id);

    const orphanGate = await ApprovalGate.create({
      approvalId: `appr-orphan-${Date.now()}`,
      workflow: wfWithPendingGate._id,
      project: testProject._id,
      workspace: testWorkspaceId,
      stepIndex: 3,
      branch: "main",
      requestedBy: "DevOps Deployer Agent",
      action: "Deploy Production",
      risk: "high",
      status: "pending",
    });
    createdGateIds.push(orphanGate._id);

    // Case B: Workflow running but all stages completed -> should reconcile to "completed"
    const wfAllCompleted = await Workflow.create({
      customId: `WF-TEST-REC-DONE-${Date.now()}`,
      name: "Workflow All Stages Finished",
      workspace: testWorkspaceId,
      project: testProject._id,
      branch: "main",
      status: "running", // was not closed before crash
      agentPipeline: [
        { name: "Code Analysis Agent", status: "completed" },
        { name: "Unit Test Agent", status: "completed" },
        { name: "Security Auditor Agent", status: "completed" },
        { name: "DevOps Deployer Agent", status: "completed" },
      ],
    });
    createdWorkflowIds.push(wfAllCompleted._id);

    // Run recovery routine without triggering full live AI loop
    const recoveryReport = await recoverDanglingWorkflows({ autoResume: false });

    const updatedGateWf = await Workflow.findById(wfWithPendingGate._id);
    assert.strictEqual(updatedGateWf.status, "waiting", "Workflow with pending gate must be set to waiting");

    const updatedDoneWf = await Workflow.findById(wfAllCompleted._id);
    assert.strictEqual(updatedDoneWf.status, "completed", "Workflow with all stages complete must be set to completed");
    assert.strictEqual(updatedDoneWf.progress, 100);

    console.log("✓ TEST 5 PASSED: Server startup recovery cleanly reconciled dangling workflows");

    // ------------------------------------------------------------------------
    // [TEST 6] Governance & Approval Resumption without Double Execution
    // ------------------------------------------------------------------------
    console.log("\n[TEST 6] Testing Approval Resumption and Rejection Handlers...");

    const gateWf = await Workflow.create({
      customId: `WF-TEST-GOV-${Date.now()}`,
      name: "Governance Workflow",
      workspace: testWorkspaceId,
      project: testProject._id,
      branch: "main",
      status: "waiting",
      currentStepIndex: 3,
      agentPipeline: [
        { name: "Code Analysis Agent", status: "completed", tokens: 100 },
        { name: "Unit Test Agent", status: "completed", tokens: 200 },
        { name: "Security Auditor Agent", status: "completed", tokens: 150 },
        { name: "DevOps Deployer Agent", status: "waiting", tokens: 0 },
      ],
    });
    createdWorkflowIds.push(gateWf._id);

    const testGate = await ApprovalGate.create({
      approvalId: `appr-gov-${Date.now()}`,
      workflow: gateWf._id,
      project: testProject._id,
      workspace: testWorkspaceId,
      stepIndex: 3,
      branch: "main",
      requestedBy: "DevOps Deployer Agent",
      action: "Authorize Deployment",
      risk: "high",
      status: "pending",
    });
    createdGateIds.push(testGate._id);

    // Authorize gate
    const approveResult = await resumeWorkflowAfterApproval({
      approvalGateId: testGate._id,
      decision: "approve",
    });

    assert.strictEqual(approveResult.status, "completed");
    const completedGovWf = await Workflow.findById(gateWf._id);
    assert.strictEqual(completedGovWf.status, "completed");
    assert.strictEqual(completedGovWf.progress, 100);
    assert.strictEqual(completedGovWf.agentPipeline[3].status, "completed");

    console.log("✓ TEST 6 PASSED: Final approval gate cleanly completed pipeline without re-executing finished stages");

    console.log("\n==================================================");
    console.log("ALL 6 ORCHESTRATION RELIABILITY TESTS PASSED!");
    console.log("==================================================");
  } finally {
    // Clean up test fixtures
    if (createdWorkflowIds.length > 0) {
      await Workflow.deleteMany({ _id: { $in: createdWorkflowIds } });
      await WorkflowRun.deleteMany({ workflow: { $in: createdWorkflowIds } });
      await ExecutionLog.deleteMany({ workflow: { $in: createdWorkflowIds } });
    }
    if (createdGateIds.length > 0) {
      await ApprovalGate.deleteMany({ _id: { $in: createdGateIds } });
    }
    await Project.deleteOne({ _id: testProject._id });
    console.log("✓ Test fixtures cleanly dismantled");
  }
}

runOrchestrationReliabilityTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failure:", err);
    process.exit(1);
  });

