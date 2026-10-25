/**
 * PRAXIS Dashboard Metrics & Tool Configuration
 * Lightweight mock definitions for UI widgets (Analytics, Tools Sandbox).
 */

export const mockAnalyticsData = {
  workflowSuccessRate: [88, 91, 87, 93, 95, 92, 94],
  tokenUsage: [120000, 145000, 98000, 180000, 210000, 175000, 195000],
  agentRuns: [24, 31, 19, 42, 38, 35, 44],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

export const mockTokenByAgent = [
  { name: "Code Analysis", tokens: "82k", val: 82 },
  { name: "Security", tokens: "54k", val: 54 },
  { name: "Unit Test", tokens: "195k", val: 195 },
  { name: "DevOps", tokens: "38k", val: 38 },
  { name: "Research", tokens: "120k", val: 120 },
  { name: "Review", tokens: "44k", val: 44 },
];

export const mockTools = [
  { name: "Git Engine", icon: "GitBranch", status: "available", lastUsed: "2m ago", category: "VCS" },
  { name: "Sandboxed File System", icon: "FolderOpen", status: "available", lastUsed: "just now", category: "Storage" },
  { name: "Jest Test Runner", icon: "TestTube", status: "executing", lastUsed: "now", category: "Runtime" },
  { name: "Package Manager (npm/yarn)", icon: "Package", status: "available", lastUsed: "5m ago", category: "Dependencies" },
  { name: "ESLint / Prettier", icon: "CheckSquare", status: "available", lastUsed: "12m ago", category: "Quality" },
  { name: "AST Static Analyzer", icon: "Scan", status: "available", lastUsed: "15m ago", category: "Analysis" },
  { name: "Semgrep Security Scanner", icon: "Shield", status: "available", lastUsed: "1h ago", category: "Security" },
  { name: "Isolated Docker Sandbox", icon: "Container", status: "available", lastUsed: "2h ago", category: "Containers" },
];
export const tools = mockTools;

export const mockRecentToolExecutions = [
  { tool: "Jest Test Runner", agent: "Unit Test Agent", command: "npm test -- --coverage", status: "running", duration: "00:18", exitCode: "--" },
  { tool: "ESLint", agent: "Code Analysis Agent", command: "eslint src/ --fix", status: "completed", duration: "12s", exitCode: "0" },
  { tool: "File System", agent: "Code Analysis Agent", command: "cat src/index.ts", status: "completed", duration: "1s", exitCode: "0" },
  { tool: "Git Engine", agent: "DevOps Agent", command: "git status -s", status: "completed", duration: "2s", exitCode: "0" },
  { tool: "Semgrep Security", agent: "Security Agent", command: "semgrep --config p/ci .", status: "completed", duration: "45s", exitCode: "0" },
];
export const recentExecutions = mockRecentToolExecutions;

export const mockActiveWorkflowRuns = [
  {
    id: "run-8832",
    agent: "Code Analysis Agent",
    workflow: "WF-2048 Security Patch",
    status: "Running",
    duration: "2m 14s",
    step: "Analyzing AST for injection vectors...",
  },
  {
    id: "run-8833",
    agent: "Unit Test Agent",
    workflow: "WF-2048 Coverage Loop",
    status: "Running",
    duration: "45s",
    step: "Generating mocks for auth service (Loop 2)...",
  },
];
export const activeRuns = mockActiveWorkflowRuns;

export const mockHistoricalWorkflowRuns = [
  {
    id: "run-8831",
    workflow: "WF-2047 Security Scan",
    agent: "Review Agent",
    status: "Success",
    started: "1h ago",
    duration: "1m 12s",
    tokens: "14,200",
    retries: 0,
    trigger: "System",
  },
  {
    id: "run-8830",
    workflow: "WF-2047 Security Scan",
    agent: "Code Analysis Agent",
    status: "Success",
    started: "1h 5m ago",
    duration: "3m 45s",
    tokens: "89,450",
    retries: 1,
    trigger: "System",
  },
];
export const historicalRuns = mockHistoricalWorkflowRuns;
