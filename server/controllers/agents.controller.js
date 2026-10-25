const Agent = require("../models/agent.models");
const AgentRun = require("../models/agentRun.models");

// Default PRAXIS Agents Seed
const defaultAgents = [
  {
    agentId: "agent-001",
    name: "Code Analysis Agent",
    type: "code-analysis",
    icon: "Code2",
    color: "amber",
    status: "active",
    model: "qwen/qwen3.8-27b",
    successRate: 98.4,
    avgDuration: "42s",
    capabilities: ["AST Analysis", "Complexity Scoring", "Code Smells"],
    tools: ["ast-grep", "eslint", "tree-sitter"],
    description: "Performs full AST structural parsing, module dependency graph resolution, and semantic code review.",
  },
  {
    agentId: "agent-002",
    name: "Unit Test Agent",
    type: "unit-test",
    icon: "TestTube2",
    color: "emerald",
    status: "active",
    model: "deepseek-r1-distill-llama-70b",
    successRate: 94.1,
    avgDuration: "1m 18s",
    capabilities: ["Autonomous Test Generation", "Coverage Analysis", "Regression Defense"],
    tools: ["jest", "pytest", "vitest", "coverage-reporter"],
    description: "Synthesizes edge-case test suites, executes tests in isolated sandboxes, and verifies branch coverage targets.",
  },
  {
    agentId: "agent-003",
    name: "Security Auditor Agent",
    type: "security",
    icon: "ShieldAlert",
    color: "rose",
    status: "active",
    model: "qwen/qwen3.8-27b",
    successRate: 99.1,
    avgDuration: "35s",
    capabilities: ["CWE Detection", "SQLi/XSS Prevention", "Dependency Vulnerability"],
    tools: ["semgrep", "trivy", "owasp-zap"],
    description: "Evaluates source code against deterministic OKF policies, OWASP Top 10, and CWE vulnerability catalogs.",
  },
  {
    agentId: "agent-004",
    name: "DevOps Deployer Agent",
    type: "devops",
    icon: "Rocket",
    color: "blue",
    status: "active",
    model: "deepseek-r1-distill-llama-70b",
    successRate: 96.8,
    avgDuration: "2m 05s",
    capabilities: ["Helm Synthesis", "Terraform Plan", "Canary Rollouts"],
    tools: ["kubectl", "docker", "terraform"],
    description: "Manages container orchestration, staging deployments, and generates human-in-the-loop promotion gates.",
  },
];

// 1. GET AGENT LIBRARY (Auto-seeds or updates open-source models)
exports.getAgents = async (req, res) => {
  try {
    let agents = await Agent.find().sort({ agentId: 1 });

    if (agents.length === 0) {
      agents = await Agent.insertMany(defaultAgents);
    } else {
      // Migrate legacy models if any were seeded earlier
      for (const a of agents) {
        if (a.model && (a.model.includes("gpt") || a.model.includes("claude"))) {
          const match = defaultAgents.find((d) => d.agentId === a.agentId);
          if (match) {
            a.model = match.model;
            await a.save();
          }
        }
      }
    }

    res.status(200).json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET SINGLE AGENT BY ID
exports.getAgentById = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await Agent.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { agentId: id }],
    });

    if (!agent) {
      return res.status(404).json({ success: false, message: "Agent not found." });
    }

    res.status(200).json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. GET AGENT RUNS (10-Stage autonomous loop records)
exports.getAgentRuns = async (req, res) => {
  try {
    const runs = await AgentRun.find()
      .populate("agent", "agentId name type color icon")
      .populate("workflow", "customId name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, data: runs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};