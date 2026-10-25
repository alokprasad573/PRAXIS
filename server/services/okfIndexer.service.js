const OkfPolicy = require("../models/okfPolicy.models");

const BASELINE_OKF_POLICIES = [
  {
    policyId: "okf-001",
    name: "Production Deployment Gate",
    category: "Deployment Restrictions",
    risk: "high",
    status: "enabled",
    description: "Requires explicit human authorization gate before any agent triggers deployment to live production clusters.",
    rule: `if (env === "production" && action === "deploy") {
  return requireHumanApproval({ risk: "high", reason: "Production gate requires human authorization" });
}`,
    version: "v2.1",
    triggers: 0,
  },
  {
    policyId: "okf-002",
    name: "Test Coverage Threshold (≥ 80%)",
    category: "Validation Rules",
    risk: "medium",
    status: "enabled",
    description: "Generated code modifications must maintain or increase test coverage. Target threshold is strictly 80%.",
    rule: `assert(new_coverage >= 80, "Coverage threshold (80%) not met. Initiating test iteration loop.");`,
    version: "v1.3",
    triggers: 0,
  },
  {
    policyId: "okf-003",
    name: "Database Mutation Guard",
    category: "Security Policies",
    risk: "high",
    status: "enabled",
    description: "Autonomous agents are strictly forbidden from executing destructive SQL or MongoDB drops, truncates, or uncontrolled deletions.",
    rule: `const forbidden = ["DROP", "TRUNCATE", "DELETE FROM"];
if (forbidden.some(op => sql.toUpperCase().includes(op))) {
  return blockAction("Destructive database mutation blocked by OKF-003.");
}`,
    version: "v1.0",
    triggers: 0,
  },
  {
    policyId: "okf-004",
    name: "No Direct Main Branch Push",
    category: "Architecture Rules",
    risk: "medium",
    status: "enabled",
    description: "All AI agent synthesized code must be submitted via branch pull request with verification checks.",
    rule: `if (targetBranch === "main" || targetBranch === "master") {
  return createPullRequest({ title: "Autonomous Agent Change Proposal" });
}`,
    version: "v1.1",
    triggers: 0,
  },
  {
    policyId: "okf-005",
    name: "AI-Generated Code Review Policy",
    category: "Approval Policies",
    risk: "medium",
    status: "enabled",
    description: "Synthesized production code files require peer or human sign-off before pipeline merging.",
    rule: `if (author === "AI_AGENT" && linesChanged > 50) {
  return requireHumanApproval({ risk: "medium", reason: "AI Code Review Threshold" });
}`,
    version: "v1.2",
    triggers: 0,
  },
];

/**
 * Initialize baseline OKF Policies for a specific repository / project
 * Ensures each repository has its own isolated policies.
 */
async function seedAndIndexOkfPolicies(workspaceId = null, projectId = null) {
  try {
    const filter = {};
    if (projectId) filter.project = projectId;
    else if (workspaceId) filter.workspace = workspaceId;

    const existingPolicies = await OkfPolicy.find(filter);

    // If policies don't exist for this project/workspace, initialize baseline rules
    if (existingPolicies.length === 0) {
      for (const policy of BASELINE_OKF_POLICIES) {
        await OkfPolicy.create({
          ...policy,
          workspace: workspaceId,
          project: projectId,
          triggers: 0, // Real zero trigger count
        });
      }
    }
  } catch (err) {
    console.error("OKF baseline initialization error:", err);
  }
}

/**
 * No-op helper preserved for backward compatibility
 */
async function indexSinglePolicy(policyDoc) {
  return true;
}

module.exports = {
  seedAndIndexOkfPolicies,
  indexSinglePolicy,
  BASELINE_OKF_POLICIES,
};
