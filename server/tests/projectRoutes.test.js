const assert = require("assert");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Workspace = require("../models/workspace.models");
const Project = require("../models/project.models");
const VectorEmbedding = require("../models/vectorEmbedding.models");
const OkfPolicy = require("../models/okfPolicy.models");
const User = require("../models/user.models");
const projectController = require("../controllers/project.controller");

/**
 * Regression Test Suite for BUG-010:
 * Proves consolidated project deletion routes, cascade cleanup, and multi-tenant isolation.
 */
async function runProjectRoutesTests() {
  console.log("==================================================");
  console.log("RUNNING: BUG-010 Project Routes Test Suite");
  console.log("==================================================");

  const { atlasConnect } = require("../config/db");
  await atlasConnect();

  const workspaceAId = new mongoose.Types.ObjectId();
  const workspaceBId = new mongoose.Types.ObjectId();
  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();

  const userA = await User.create({
    _id: userAId,
    name: "Developer A",
    email: `dev-a-${Date.now()}@praxis.io`,
    password: "Password123!",
  });

  const projectA = await Project.create({
    name: `project-to-delete-${Date.now()}`,
    workspace: workspaceAId,
    repo: "https://github.com/praxis/repo-a",
    branch: "main",
  });

  const projectB = await Project.create({
    name: `project-isolated-${Date.now()}`,
    workspace: workspaceBId,
    repo: "https://github.com/praxis/repo-b",
    branch: "main",
  });

  // Create Vector Chunks for Project A
  const chunkA = await VectorEmbedding.create({
    project: projectA._id,
    workspace: workspaceAId,
    source: "src/auth.js",
    content: "function authenticate() { return true; }",
    category: "code",
    embedding: [0.1, 0.2, 0.3],
  });

  // Create OKF Policy for Project A
  const okfA = await OkfPolicy.create({
    project: projectA._id,
    workspace: workspaceAId,
    policyId: `okf-test-${Date.now()}`,
    name: "No Plaintext Secrets",
    description: "Guardrail preventing API key leaks",
    risk: "high",
    severity: "high",
    category: "Security Policies",
    status: "enabled",
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Cross-workspace deletion blocked (Workspace B cannot delete Project A)
    // -------------------------------------------------------------------------
    console.log("\n[TEST 1] Testing cross-workspace deletion protection...");

    let resCrossStatus = null;
    let resCrossData = null;
    const reqCross = {
      params: { id: projectA._id.toString() },
      workspaceId: workspaceBId.toString(),
      userId: userBId,
    };
    const resCross = {
      status(code) {
        resCrossStatus = code;
        return this;
      },
      json(payload) {
        resCrossData = payload;
        return this;
      },
    };

    await projectController.deleteProject(reqCross, resCross);

    assert.strictEqual(resCrossStatus, 404, "Cross-workspace deletion must return HTTP 404");
    assert.strictEqual(resCrossData.success, false);

    // Verify Project A still exists in DB
    const projectACheck = await Project.findById(projectA._id);
    assert.ok(projectACheck, "Project A must not be deleted by unauthorized tenant");

    console.log("✓ TEST 1 PASSED: Cross-workspace project deletion blocked with HTTP 404");

    // -------------------------------------------------------------------------
    // TEST 2: Canonical DELETE /api/projects/:id deletes project and cascades cleanup
    // -------------------------------------------------------------------------
    console.log("\n[TEST 2] Testing canonical DELETE /api/projects/:id with cascade cleanup...");

    let resDelStatus = null;
    let resDelData = null;
    const reqDel = {
      params: { id: projectA._id.toString() },
      workspaceId: workspaceAId.toString(),
      userId: userAId,
    };
    const resDel = {
      status(code) {
        resDelStatus = code;
        return this;
      },
      json(payload) {
        resDelData = payload;
        return this;
      },
    };

    await projectController.deleteProject(reqDel, resDel);

    assert.strictEqual(resDelStatus, 200, "Canonical deletion must return HTTP 200");
    assert.strictEqual(resDelData.success, true);

    // Verify Project A is deleted from DB
    const deletedProjCheck = await Project.findById(projectA._id);
    assert.strictEqual(deletedProjCheck, null, "Project A should be removed from database");

    // Verify vector embeddings were cascadingly purged
    const remainingChunks = await VectorEmbedding.countDocuments({ project: projectA._id });
    assert.strictEqual(remainingChunks, 0, "Vector chunks for Project A must be purged");

    // Verify OKF policies were cascadingly purged
    const remainingPolicies = await OkfPolicy.countDocuments({ project: projectA._id });
    assert.strictEqual(remainingPolicies, 0, "OKF policies for Project A must be purged");

    console.log("✓ TEST 2 PASSED: DELETE /api/projects/:id cleanly removes project and cascades vector/OKF cleanup");

    // -------------------------------------------------------------------------
    // TEST 3: Deleting an already deleted / non-existent project returns 404
    // -------------------------------------------------------------------------
    console.log("\n[TEST 3] Testing non-existent project deletion...");

    let resNonExistStatus = null;
    let resNonExistData = null;
    const resNonExist = {
      status(code) {
        resNonExistStatus = code;
        return this;
      },
      json(payload) {
        resNonExistData = payload;
        return this;
      },
    };

    await projectController.deleteProject(reqDel, resNonExist);
    assert.strictEqual(resNonExistStatus, 404, "Deleting non-existent project must return HTTP 404");
    assert.strictEqual(resNonExistData.success, false);

    console.log("✓ TEST 3 PASSED: Non-existent project deletion returns HTTP 404");

    console.log("\n==================================================");
    console.log("ALL 3 PROJECT ROUTE REGRESSION TESTS PASSED!");
    console.log("==================================================");
  } finally {
    // Teardown test fixtures
    await Project.deleteMany({ _id: { $in: [projectA._id, projectB._id] } });
    await VectorEmbedding.deleteMany({ project: { $in: [projectA._id, projectB._id] } });
    await OkfPolicy.deleteMany({ project: { $in: [projectA._id, projectB._id] } });
    await User.deleteOne({ _id: userAId });
    await mongoose.disconnect();
    console.log("✓ Test fixtures cleanly dismantled");
  }
}

runProjectRoutesTests().catch((err) => {
  console.error("❌ Project Routes Test Failed:", err);
  process.exit(1);
});
