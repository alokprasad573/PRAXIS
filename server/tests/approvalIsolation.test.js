const assert = require("assert");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const ApprovalGate = require("../models/approvalGate.models");
const Project = require("../models/project.models");
const approvalController = require("../controllers/approval.controller");

/**
 * Regression Test: Prove Workspace A cannot view, approve, or reject Workspace B's approvals.
 */
async function runRegressionTests() {
  console.log("==================================================");
  console.log("RUNNING: Approval Gate Workspace Isolation Test Suite");
  console.log("==================================================");

  const { atlasConnect } = require("../config/db");
  await atlasConnect();

  const workspaceAId = new mongoose.Types.ObjectId();
  const workspaceBId = new mongoose.Types.ObjectId();
  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();

  const projectA = await Project.create({
    name: "test-repo-workspace-a",
    workspace: workspaceAId,
    repo: "https://github.com/praxis/repo-a",
    branch: "main",
  });

  const projectB = await Project.create({
    name: "test-repo-workspace-b",
    workspace: workspaceBId,
    repo: "https://github.com/praxis/repo-b",
    branch: "main",
  });

  const dummyWorkflowId = new mongoose.Types.ObjectId();

  // Create Gate in Workspace B
  const gateB = await ApprovalGate.create({
    approvalId: `appr-test-b-${Date.now()}`,
    workflow: dummyWorkflowId,
    project: projectB._id,
    workspace: workspaceBId,
    branch: "main",
    requestedBy: "DevOps Deployer Agent",
    action: "Deploy Workspace B Service",
    risk: "high",
    status: "pending",
  });

  // Create Gate in Workspace A
  const gateA = await ApprovalGate.create({
    approvalId: `appr-test-a-${Date.now()}`,
    workflow: dummyWorkflowId,
    project: projectA._id,
    workspace: workspaceAId,
    branch: "main",
    requestedBy: "Security Auditor Agent",
    action: "Authorize Workspace A Fix",
    risk: "high",
    status: "pending",
  });

  console.log("✓ Fixtures created: Gate A in Workspace A, Gate B in Workspace B");

  // TEST 1: User in Workspace A queries pending approvals
  const mockReqA = {
    workspaceId: workspaceAId,
    userId: userAId,
    user: { name: "User A" },
  };

  let resDataA = null;
  const mockResA = {
    status: (code) => ({
      json: (payload) => {
        resDataA = { code, payload };
      },
    }),
  };

  await approvalController.getPendingApprovals(mockReqA, mockResA);
  assert(resDataA.payload.success === true, "Query must succeed");
  const visibleIdsA = resDataA.payload.data.map((g) => g.approvalId);

  assert(visibleIdsA.includes(gateA.approvalId), "Workspace A must see Gate A");
  assert(!visibleIdsA.includes(gateB.approvalId), "SECURITY VIOLATION: Workspace A must NOT see Gate B!");
  console.log("✓ TEST 1 PASSED: Workspace A cannot view pending approvals from Workspace B");

  // TEST 2: User in Workspace A attempts to decide (approve) Gate B
  const mockReqCrossApprove = {
    params: { id: gateB.approvalId },
    body: { decision: "approve" },
    workspaceId: workspaceAId,
    userId: userAId,
    user: { name: "Attacker in Workspace A" },
  };

  let resCrossData = null;
  const mockResCross = {
    status: (code) => ({
      json: (payload) => {
        resCrossData = { code, payload };
      },
    }),
  };

  await approvalController.decideApproval(mockReqCrossApprove, mockResCross);
  assert(resCrossData.code === 404, "Cross-workspace decision must return 404 Not Found in workspace");
  assert(resCrossData.payload.success === false, "Cross-workspace decision must fail");

  const refreshedGateB = await ApprovalGate.findById(gateB._id);
  assert(refreshedGateB.status === "pending", "Gate B status must remain pending (unauthorized modification blocked)");
  console.log("✓ TEST 2 PASSED: Cross-workspace approval decision blocked and returned 404 without data leak");

  // TEST 3: User in Workspace A queries approval audit history
  let historyDataA = null;
  const mockResHistoryA = {
    status: (code) => ({
      json: (payload) => {
        historyDataA = { code, payload };
      },
    }),
  };

  // Decide Gate A cleanly
  let decideResultA = null;
  const mockResDecideA = {
    status: (code) => ({
      json: (payload) => {
        decideResultA = { code, payload };
      },
    }),
  };

  const mockReqApproveA = {
    params: { id: gateA.approvalId },
    body: { decision: "approve" },
    workspaceId: workspaceAId,
    userId: userAId,
    user: { name: "User A" },
  };
  await approvalController.decideApproval(mockReqApproveA, mockResDecideA);
  assert(decideResultA?.payload?.success === true, "Gate A approval must succeed");

  await approvalController.getApprovalHistory(mockReqA, mockResHistoryA);
  console.log("History response received:", JSON.stringify(historyDataA));
  assert(historyDataA?.payload?.data, "historyDataA payload must have data array");
  const historyIdsA = historyDataA.payload.data.map((g) => g.approvalId);
  assert(historyIdsA.includes(gateA.approvalId), "History A must include Gate A");
  assert(!historyIdsA.includes(gateB.approvalId), "History A must NOT include Gate B");
  console.log("✓ TEST 3 PASSED: Workspace A audit history is strictly isolated from Workspace B");

  // Cleanup test fixtures
  await ApprovalGate.deleteMany({ _id: { $in: [gateA._id, gateB._id] } });
  await Project.deleteMany({ _id: { $in: [projectA._id, projectB._id] } });
  console.log("✓ Test fixtures cleanly dismantled");

  console.log("==================================================");
  console.log("ALL 3 REGRESSION TESTS PASSED CLEANLY!");
  console.log("==================================================");
  process.exit(0);
}

runRegressionTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
