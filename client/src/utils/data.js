import { Terminal, GitMerge, Database, Bot, Box, RefreshCw, ShieldCheck, FileCheck2 } from "lucide-react";
import { TestTube2, Code2, ShieldAlert, Server, BookOpen, CheckSquare } from "lucide-react";

export const steps = [
  { id: 1, title: "Request", subtitle: "Task Prompt", icon: Terminal },
  { id: 2, title: "Orchestrate", subtitle: "Decomposition", icon: GitMerge },
  { id: 3, title: "Context", subtitle: "80% RAG + 20% OKF", icon: Database, highlight: true },
  { id: 4, title: "Agents", subtitle: "Parallel Swarm", icon: Bot },
  { id: 5, title: "Execute", subtitle: "Sandbox Tools", icon: Box },
  { id: 6, title: "Validate", subtitle: "Autonomous Loop", icon: RefreshCw },
  { id: 7, title: "Approve", subtitle: "Human Gate", icon: ShieldCheck },
  { id: 8, title: "Report", subtitle: "Synthesized PR", icon: FileCheck2, variant: "emerald" },
];


export const agentsData = [
  {
    id: 1,
    title: "Unit Test Agent",
    model: "claude-3-5-sonnet",
    successRate: "91.7% Success",
    description: "Autonomous test improvement loop: analyze coverage gaps → synthesize tests → execute in sandbox → evaluate failures → improve until target (80%) is reached.",
    capabilities: "Capabilities: Mock generation, AST fixture synthesis, Jest/Pytest execution",
    icon: TestTube2,
    highlight: true, // Pehle card ke liye special border
  },
  {
    id: 2,
    title: "Code Analysis Agent",
    model: "gpt-4o",
    successRate: "96.4% Success",
    description: "Deep AST traversal, cyclomatic complexity calculations, dependency graph discovery, and structural code smell detection.",
    capabilities: "Capabilities: AST parsing, complexity metrics, dependency mapping",
    icon: Code2,
  },
  {
    id: 3,
    title: "Security Agent",
    model: "gpt-4o",
    successRate: "98.1% Success",
    description: "OWASP Top 10 compliance audits, hardcoded secret and API key detection, and third-party CVE dependency scans.",
    capabilities: "Capabilities: CVE scanning, secret leakage prevention, OWASP audit",
    icon: ShieldAlert,
  },
  {
    id: 4,
    title: "DevOps Agent",
    model: "claude-3-5-sonnet",
    successRate: "87.3% Success",
    description: "Docker image configuration, CI/CD pipeline automation, Kubernetes deployment manifests, and staging validation checks.",
    capabilities: "Capabilities: Docker, GitHub Actions, K8s manifests, env validation",
    icon: Server,
  },
  {
    id: 5,
    title: "Research Agent",
    model: "gpt-4o",
    successRate: "94.2% Success",
    description: "Retrieves external API documentation, best practices patterns, and semantic vector embeddings across all indexed repositories.",
    capabilities: "Capabilities: Vector search, documentation ingestion, design patterns",
    icon: BookOpen,
  },
  {
    id: 6,
    title: "Review Agent",
    model: "gpt-4o",
    successRate: "97.6% Success",
    description: "Cross-agent output validation, quality gate verification, retry loop decisions, and automated markdown engineering report synthesis.",
    capabilities: "Capabilities: Quality gate evaluation, report generation, PR prep",
    icon: CheckSquare,
  },
];


export const policies = [
    "Production Deployment Approval Gate",
    "Test Coverage Threshold (> 80%)",
    "Destructive Database Operation Blocker",
    "Mandatory AI-Generated Code Review",
  ];

export const markdownText = `# Open Knowledge Format
**Domain:** database_governance | **Version:** 2.0.4

\`\`\`yaml
guardrail_rules:
  - id: "OKF-DB-001"
    constraint: "BLOCK_DESTRUCTIVE_OPS"
    forbidden_tokens: ["DROP", "TRUNCATE"]
    action_on_match: "REQUIRE_HUMAN_GATE"
  - id: "OKF-DB-002"
    action_on_match: "PASS"
\`\`\``;