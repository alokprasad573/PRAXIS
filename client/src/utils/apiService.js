import axiosInstance from "./axiosInstance";
import { API_PATHS } from "./apiPaths";

// ==========================================
// 1. AUTHENTICATION & SESSION APIs
// ==========================================
export const authApi = {
  // Register new account & default workspace
  register: async (name, email, password) => {
    const res = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      name,
      email,
      password,
    });
    return res.data;
  },

  // Login with email & password
  login: async (email, password) => {
    const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
      email,
      password,
    });
    return res.data;
  },

  // Invalidate current session
  logout: async () => {
    const res = await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
    return res.data;
  },

  // Get current user, active workspace, active project & session info
  getMe: async () => {
    const res = await axiosInstance.get(API_PATHS.AUTH.ME);
    return res.data;
  },

  // Switch active project or workspace on live session
  switchContext: async ({ projectId, workspaceId }) => {
    const res = await axiosInstance.patch(API_PATHS.AUTH.SWITCH_CONTEXT, {
      projectId,
      workspaceId,
    });
    return res.data;
  },

  // Get active device sessions (Mac, Windows, CLI)
  getActiveSessions: async () => {
    const res = await axiosInstance.get(API_PATHS.AUTH.SESSIONS);
    return res.data;
  },

  // Revoke all other device sessions
  revokeOtherSessions: async () => {
    const res = await axiosInstance.delete(API_PATHS.AUTH.REVOKE_OTHER_SESSIONS);
    return res.data;
  },
};

// ==========================================
// 2. DASHBOARD AGGREGATOR APIs (Main Views)
// ==========================================
export const dashboardApi = {
  // Fetches initial live state for all 18 views in 1 call
  getBootstrap: async () => {
    const res = await axiosInstance.get(API_PATHS.DASHBOARD.BOOTSTRAP);
    return res.data;
  },

  // Launch new workflow from modal
  launchWorkflow: async (payload) => {
    const res = await axiosInstance.post(
      API_PATHS.DASHBOARD.LAUNCH_WORKFLOW,
      payload
    );
    return res.data;
  },

  // Authorize or Reject human approval gate
  decideApproval: async (approvalId, decision) => {
    const res = await axiosInstance.post(
      API_PATHS.DASHBOARD.DECIDE_APPROVAL(approvalId),
      { decision }
    );
    return res.data;
  },

  // Mark all unread alerts as read
  markNotificationsRead: async () => {
    const res = await axiosInstance.patch(
      API_PATHS.DASHBOARD.MARK_NOTIFICATIONS_READ
    );
    return res.data;
  },
};

// ==========================================
// 3. PROJECTS & REPOSITORIES APIs
// ==========================================
export const projectApi = {
  getAll: async () => {
    const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_ALL);
    return res.data;
  },

  getGithubRepos: async () => {
    const res = await axiosInstance.get(API_PATHS.PROJECTS.GITHUB_REPOS);
    return res.data;
  },

  connectRepo: async (payload) => {
    const res = await axiosInstance.post(API_PATHS.PROJECTS.CONNECT, payload);
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(API_PATHS.PROJECTS.GET_BY_ID(id));
    return res.data;
  },

  deleteProject: async (id) => {
    const res = await axiosInstance.delete(API_PATHS.PROJECTS.DELETE(id));
    return res.data;
  },
};

// ==========================================
// 4. WORKFLOWS & MULTI-AGENT APIs
// ==========================================
export const workflowApi = {
  getAll: async (params) => {
    const res = await axiosInstance.get(API_PATHS.WORKFLOWS.GET_ALL, { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(API_PATHS.WORKFLOWS.GET_BY_ID(id));
    return res.data;
  },

  cancel: async (id) => {
    const res = await axiosInstance.post(API_PATHS.WORKFLOWS.CANCEL(id));
    return res.data;
  },

  getRuns: async () => {
    const res = await axiosInstance.get(API_PATHS.WORKFLOWS.RUNS);
    return res.data;
  },
};

// ==========================================
// 5. AGENTS & DIAGNOSTICS APIs
// ==========================================
export const agentApi = {
  getLibrary: async () => {
    const res = await axiosInstance.get(API_PATHS.AGENTS.LIBRARY);
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(API_PATHS.AGENTS.GET_BY_ID(id));
    return res.data;
  },

  getRuns: async () => {
    const res = await axiosInstance.get(API_PATHS.AGENTS.RUNS);
    return res.data;
  },
};

// ==========================================
// 6. RAG KNOWLEDGE & OKF POLICIES APIs
// ==========================================
export const ragApi = {
  getSources: async () => {
    const res = await axiosInstance.get(API_PATHS.RAG.SOURCES);
    return res.data;
  },

  queryVector: async (query, threshold) => {
    const res = await axiosInstance.post(API_PATHS.RAG.QUERY, {
      query,
      threshold,
    });
    return res.data;
  },
};

export const okfApi = {
  getPolicies: async () => {
    const res = await axiosInstance.get(API_PATHS.OKF.POLICIES);
    return res.data;
  },

  togglePolicy: async (policyId) => {
    const res = await axiosInstance.patch(API_PATHS.OKF.TOGGLE(policyId));
    return res.data;
  },
};

// ==========================================
// 7. TELEMETRY & LOGS APIs
// ==========================================
export const telemetryApi = {
  getLogs: async (params) => {
    const res = await axiosInstance.get(API_PATHS.TELEMETRY.LOGS, { params });
    return res.data;
  },

  getAnalytics: async () => {
    const res = await axiosInstance.get(API_PATHS.TELEMETRY.ANALYTICS);
    return res.data;
  },
};