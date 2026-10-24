export const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export const API_PATHS = {
  // Authentication & Session Context
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    SWITCH_CONTEXT: "/api/auth/switch-context",
    SESSIONS: "/api/auth/sessions",
    REVOKE_OTHER_SESSIONS: "/api/auth/sessions/others",
    GITHUB_OAUTH: "/api/auth/github",
  },

  // Central Dashboard Aggregator (All 18 Views)
  DASHBOARD: {
    BOOTSTRAP: "/api/dashboard/bootstrap",
    LAUNCH_WORKFLOW: "/api/dashboard/workflows/launch",
    DECIDE_APPROVAL: (id) => `/api/dashboard/approvals/${id}/decision`,
    MARK_NOTIFICATIONS_READ: "/api/dashboard/notifications/mark-read",
  },

  // Workspaces & Team Members
  WORKSPACES: {
    CURRENT: "/api/workspaces/current",
    MEMBERS: "/api/workspaces/members",
    INVITE_DETAILS: "/api/workspaces/invite-details",
    ACCEPT_INVITE: "/api/workspaces/accept-invite",
    UPDATE_ROLE: (id) => `/api/workspaces/members/${id}`,
    REMOVE_MEMBER: (id) => `/api/workspaces/members/${id}`,
  },

  // Projects & Repositories
  PROJECTS: {
    GET_ALL: "/api/projects",
    CONNECT: "/api/projects/connect",
    GITHUB_REPOS: "/api/projects/github/repos",
    GET_BY_ID: (id) => `/api/projects/${id}`,
    DELETE: (id) => `/api/projects/${id}`,
  },

  // Workflows & Pipelines
  WORKFLOWS: {
    GET_ALL: "/api/workflows",
    LAUNCH: "/api/workflows/launch",
    GET_BY_ID: (id) => `/api/workflows/${id}`,
    CANCEL: (id) => `/api/workflows/${id}/cancel`,
    RUNS: "/api/workflows/runs",
  },

  // Agents & Autonomous Loops
  AGENTS: {
    LIBRARY: "/api/agents",
    GET_BY_ID: (id) => `/api/agents/${id}`,
    RUNS: "/api/agents/runs",
  },

  // Approvals & Governance Gates
  APPROVALS: {
    PENDING: "/api/approvals/pending",
    HISTORY: "/api/approvals/history",
    DECIDE: (id) => `/api/approvals/${id}/decision`,
    APPROVE: (id) => `/api/approvals/${id}/approve`,
    REJECT: (id) => `/api/approvals/${id}/reject`,
  },

  // Notifications & Telemetry Alerts
  NOTIFICATIONS: {
    GET_ALL: "/api/notifications",
    MARK_ALL_READ: "/api/notifications/mark-read",
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    DELETE: (id) => `/api/notifications/${id}`,
  },

    // RAG Knowledge & VectorDB
  RAG: {
    SOURCES: "/api/rag/sources",
    QUERY: "/api/rag/query",
    REINDEX: "/api/rag/reindex",
    INDEX_FILE: "/api/rag/index-file",
  },

  // OKF Deterministic Policies
  OKF: {
    POLICIES: "/api/okf/policies",
    CREATE: "/api/okf/policies",
    BASELINE: "/api/okf/policies/baseline",
    TOGGLE: (id) => `/api/okf/policies/${id}/toggle`,
    DELETE: (id) => `/api/okf/policies/${id}`,
  },

  // Telemetry, Terminal Logs & Analytics
  TELEMETRY: {
    LOGS: "/api/logs",
    LOGS_STREAM: "/api/logs/stream", // SSE Feed
    ANALYTICS: "/api/logs/analytics",
  },
};
