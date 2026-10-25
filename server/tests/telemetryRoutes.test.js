const assert = require("assert");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Workspace = require("../models/workspace.models");
const Project = require("../models/project.models");
const Workflow = require("../models/workflow.models");
const WorkflowRun = require("../models/workflowrun.models");
const User = require("../models/user.models");
const telemetryController = require("../controllers/telemetry.controller");

/**
 * Regression Test Suite for BUG-004:
 * Proves mounted /api/logs telemetry routes:
 * 1. GET /api/logs (real execution logs with workspace isolation)
 * 2. GET /api/logs?agent=... (filtering)
 * 3. GET /api/logs/analytics (aggregated metrics, success rate, tokenByAgent)
 * 4. GET /api/logs/stream (SSE real-time stream headers and handshake)
 */
async function runTelemetryRoutesTests() {
  console.log("==================================================");
  console.log("RUNNING: BUG-004 Telemetry / Logs Routes Test Suite");
  console.log("==================================================");

  const { atlasConnect } = require("../config/db");
  await atlasConnect();

  const workspaceAId = new mongoose.Types.ObjectId();
  const workspaceBId = new mongoose.Types.ObjectId();
  const userAId = new mongoose.Types.ObjectId();

  const userA = await User.create({
    _id: userAId,
    name: "DevOps Auditor A",
    email: `auditor-a-${Date.now()}@praxis.io`,
    password: "Password123!",
  });

  const projectA = await Project.create({
    name: `telemetry-project-a-${Date.now()}`,
    workspace: workspaceAId,
    repo: "https://github.com/praxis/telemetry-a",
    branch: "main",
  });

  const projectB = await Project.create({
    name: `telemetry-project-b-${Date.now()}`,
    workspace: workspaceBId,
    repo: "https://github.com/praxis/telemetry-b",
    branch: "main",
  });

  const wfA = await Workflow.create({
    customId: `WF-TEL-A-${Date.now()}`,
    name: "Payment Gateway CI/CD",
    workspace: workspaceAId,
    project: projectA._id,
    status: "completed",
    progress: 100,
    metrics: { tokensUsed: 14200, estimatedCost: 0.28, retries: 0 },
    agentPipeline: [
      { name: "Code Analysis Agent", status: "completed", tokens: 2500, output: "AST verified 0 defects" },
      { name: "Unit Test Agent", status: "completed", tokens: 4200, output: "Generated 34 tests, 100% pass" },
      { name: "Security Auditor Agent", status: "completed", tokens: 3500, output: "0 CVEs detected" },
      { name: "DevOps Deployer Agent", status: "completed", tokens: 4000, output: "Container deployed to cluster" },
    ],
  });

  const wfB = await Workflow.create({
    customId: `WF-TEL-B-${Date.now()}`,
    name: "Tenant B Secret Pipeline",
    workspace: workspaceBId,
    project: projectB._id,
    status: "running",
    progress: 25,
    metrics: { tokensUsed: 99999, estimatedCost: 2.0, retries: 0 },
  });

  const runA1 = await WorkflowRun.create({
    runId: `run-tel-a1-${Date.now()}`,
    workflow: wfA._id,
    agent: "Unit Test Agent",
    status: "Success",
    currentStep: "Executed 34 unit tests with 100% branch coverage",
    duration: "2.4s",
    tokens: 4200,
    trigger: "Autonomous Pipeline",
  });

  const runA2 = await WorkflowRun.create({
    runId: `run-tel-a2-${Date.now()}`,
    workflow: wfA._id,
    agent: "Security Auditor Agent",
    status: "Success",
    currentStep: "SAST vulnerability audit clean",
    duration: "1.8s",
    tokens: 3500,
    trigger: "Autonomous Pipeline",
  });

  const runB1 = await WorkflowRun.create({
    runId: `run-tel-b1-${Date.now()}`,
    workflow: wfB._id,
    agent: "Code Analysis Agent",
    status: "Running",
    currentStep: "Tenant B private analysis",
    duration: "10s",
    tokens: 9999,
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: GET /api/logs returns formatted logs with workspace isolation
    // -------------------------------------------------------------------------
    console.log("\n[TEST 1] Testing /api/logs execution log extraction & tenant isolation...");

    let logsStatus = null;
    let logsData = null;
    const reqLogsA = {
      userId: userAId,
      workspaceId: workspaceAId.toString(),
      query: {},
    };
    const resLogsA = {
      status(code) {
        logsStatus = code;
        return this;
      },
      json(payload) {
        logsData = payload;
        return this;
      },
    };

    await telemetryController.getLogs(reqLogsA, resLogsA);

    assert.strictEqual(logsStatus, 200, "Logs request should return HTTP 200");
    assert.strictEqual(logsData.success, true);
    assert.ok(Array.isArray(logsData.data), "Logs response data must be an array");
    assert.strictEqual(logsData.data.length, 2, "Workspace A should see exactly its 2 runs");

    const firstLog = logsData.data[0];
    assert.ok(firstLog.id, "Log must have an id");
    assert.ok(firstLog.timestamp, "Log must have a timestamp");
    assert.strictEqual(firstLog.workflowId, wfA.customId, "Log workflowId must match Workspace A workflow");
    assert.ok(firstLog.agent, "Log must have an agent name");
    assert.ok(firstLog.event, "Log must have an event description");
    assert.ok(firstLog.status, "Log must have a status");
    assert.ok(firstLog.duration, "Log must have a duration");
    assert.ok(firstLog.cost, "Log must calculate cost string");

    // Prove Workspace B run is NOT present
    const hasTenantBRun = logsData.data.some((l) => l.workflowId === wfB.customId || l.id === runB1.runId);
    assert.strictEqual(hasTenantBRun, false, "Workspace A logs must NEVER contain Workspace B runs");

    console.log("✓ TEST 1 PASSED: /api/logs returns formatted telemetry logs with strict tenant isolation");

    // -------------------------------------------------------------------------
    // TEST 2: GET /api/logs with agent filter
    // -------------------------------------------------------------------------
    console.log("\n[TEST 2] Testing /api/logs?agent=... filtering...");

    let filteredStatus = null;
    let filteredData = null;
    const reqFilter = {
      userId: userAId,
      workspaceId: workspaceAId.toString(),
      query: { agent: "Security" },
    };
    const resFilter = {
      status(code) {
        filteredStatus = code;
        return this;
      },
      json(payload) {
        filteredData = payload;
        return this;
      },
    };

    await telemetryController.getLogs(reqFilter, resFilter);
    assert.strictEqual(filteredStatus, 200);
    assert.strictEqual(filteredData.data.length, 1);
    assert.strictEqual(filteredData.data[0].agent, "Security Auditor Agent");

    console.log("✓ TEST 2 PASSED: Agent filter on /api/logs works accurately");

    // -------------------------------------------------------------------------
    // TEST 3: GET /api/logs/analytics returns aggregated metrics
    // -------------------------------------------------------------------------
    console.log("\n[TEST 3] Testing /api/logs/analytics metrics aggregation...");

    let analyticsStatus = null;
    let analyticsData = null;
    const reqAnalytics = {
      userId: userAId,
      workspaceId: workspaceAId.toString(),
    };
    const resAnalytics = {
      status(code) {
        analyticsStatus = code;
        return this;
      },
      json(payload) {
        analyticsData = payload;
        return this;
      },
    };

    await telemetryController.getAnalytics(reqAnalytics, resAnalytics);

    assert.strictEqual(analyticsStatus, 200, "Analytics should return HTTP 200");
    assert.strictEqual(analyticsData.success, true);
    assert.ok(analyticsData.data.analyticsData, "Must contain analyticsData");
    assert.ok(Array.isArray(analyticsData.data.analyticsData.workflowSuccessRate), "Success rate must be an array");
    assert.ok(Array.isArray(analyticsData.data.analyticsData.tokenUsage), "Token usage must be an array");
    assert.ok(Array.isArray(analyticsData.data.tokenByAgent), "Must contain tokenByAgent distribution");
    assert.strictEqual(analyticsData.data.kpis.totalRuns, 2, "Workspace A total runs KPI should be 2");

    console.log("✓ TEST 3 PASSED: /api/logs/analytics aggregates real performance and token metrics");

    // -------------------------------------------------------------------------
    // TEST 4: GET /api/logs/stream SSE handshake
    // -------------------------------------------------------------------------
    console.log("\n[TEST 4] Testing /api/logs/stream SSE streaming handshake...");

    const headersSent = {};
    let writtenData = "";
    let closed = false;

    const reqStream = {
      on(event, cb) {
        if (event === "close") {
          this.closeCb = cb;
        }
      },
    };

    const resStream = {
      setHeader(k, v) {
        headersSent[k] = v;
      },
      write(chunk) {
        writtenData += chunk;
      },
      end() {
        closed = true;
      },
    };

    telemetryController.streamLogs(reqStream, resStream);

    assert.strictEqual(headersSent["Content-Type"], "text/event-stream", "Must set text/event-stream header");
    assert.strictEqual(headersSent["Cache-Control"], "no-cache", "Must disable caching for SSE");
    assert.strictEqual(headersSent["Connection"], "keep-alive", "Must keep connection alive");
    assert.ok(writtenData.includes('"type":"connected"'), "Must send initial connected handshake");

    // Trigger close
    if (reqStream.closeCb) reqStream.closeCb();
    assert.strictEqual(closed, true, "Stream must cleanly end upon client disconnect");

    console.log("✓ TEST 4 PASSED: /api/logs/stream sets valid SSE headers and sends initial event stream");

    console.log("\n==================================================");
    console.log("ALL 4 TELEMETRY ROUTE REGRESSION TESTS PASSED!");
    console.log("==================================================");
  } finally {
    // Teardown test fixtures
    await WorkflowRun.deleteMany({ _id: { $in: [runA1._id, runA2._id, runB1._id] } });
    await Workflow.deleteMany({ _id: { $in: [wfA._id, wfB._id] } });
    await Project.deleteMany({ _id: { $in: [projectA._id, projectB._id] } });
    await User.deleteOne({ _id: userAId });
    await mongoose.disconnect();
    console.log("✓ Test fixtures cleanly dismantled");
  }
}

runTelemetryRoutesTests().catch((err) => {
  console.error("❌ Telemetry Routes Test Failed:", err);
  process.exit(1);
});

