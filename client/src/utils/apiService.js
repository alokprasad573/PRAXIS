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
// 3. WORKSPACES & TEAM APIs
// ==========================================
export const workspaceApi = {
  getCurrent: async () => {
    const res = await axiosInstance.get(API_PATHS.WORKSPACES.CURRENT);
    return res.data;
  },

  getMembers: async () => {
    const res = await axiosInstance.get(API_PATHS.WORKSPACES.MEMBERS);
    return res.data;
  },

  inviteMember: async (payload) => {
    const res = await axiosInstance.post(API_PATHS.WORKSPACES.MEMBERS, payload);
    return res.data;
  },

  getInviteDetails: async (token) => {
    const res = await axiosInstance.get(`${API_PATHS.WORKSPACES.INVITE_DETAILS}?token=${token}`);
    return res.data;
  },

  acceptInvite: async (payload) => {
    const res = await axiosInstance.post(API_PATHS.WORKSPACES.ACCEPT_INVITE, payload);
    return res.data;
  },

  updateRole: async (memberId, role) => {
    const res = await axiosInstance.patch(
      API_PATHS.WORKSPACES.UPDATE_ROLE(memberId),
      { role }
    );
    return res.data;
  },

  removeMember: async (memberId) => {
    const res = await axiosInstance.delete(
      API_PATHS.WORKSPACES.REMOVE_MEMBER(memberId)
    );
    return res.data;
  },
};

// ==========================================
// 4. PROJECTS & REPOSITORIES APIs
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
    const res = await axiosInstance.post(API_PATHS.PROJECTS.CONNECT, payload, {
      timeout: 120000, // 120s timeout so large repos & AI OKF synthesis don't get aborted prematurely
    });
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

  launch: async (payload) => {
    const res = await axiosInstance.post(API_PATHS.WORKFLOWS.LAUNCH, payload);
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
// 5. APPROVALS & GOVERNANCE GATES APIs
// ==========================================
export const approvalApi = {
  getPending: async () => {
    const res = await axiosInstance.get(API_PATHS.APPROVALS.PENDING);
    return res.data;
  },

  decide: async (id, decision) => {
    const res = await axiosInstance.post(API_PATHS.APPROVALS.DECIDE(id), { decision });
    return res.data;
  },

  getHistory: async () => {
    const res = await axiosInstance.get(API_PATHS.APPROVALS.HISTORY);
    return res.data;
  },
};

// ==========================================
// 6. AGENTS & DIAGNOSTICS APIs
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
  getSources: async (projectId) => {
    const res = await axiosInstance.get(API_PATHS.RAG.SOURCES, {
      params: projectId ? { projectId } : {},
    });
    return res.data;
  },

  queryVector: async (query, threshold, limit, projectId) => {
    const res = await axiosInstance.post(API_PATHS.RAG.QUERY, {
      query,
      threshold,
      limit,
      projectId,
    });
    return res.data;
  },

  reindex: async (projectId, files) => {
    const res = await axiosInstance.post(API_PATHS.RAG.REINDEX, { projectId, files }, {
      timeout: 120000,
    });
    return res.data;
  },

  indexFile: async ({ projectId, filePath, content, language }) => {
    const res = await axiosInstance.post(API_PATHS.RAG.INDEX_FILE, {
      projectId,
      filePath,
      content,
      language,
    });
    return res.data;
  },
};

export const okfApi = {
  getPolicies: async (projectId) => {
    const res = await axiosInstance.get(API_PATHS.OKF.POLICIES, {
      params: projectId ? { projectId } : {},
    });
    return res.data;
  },

  createPolicy: async (data) => {
    const res = await axiosInstance.post(API_PATHS.OKF.CREATE, data);
    return res.data;
  },

  applyBaseline: async (projectId) => {
    const res = await axiosInstance.post(API_PATHS.OKF.BASELINE, { projectId });
    return res.data;
  },

  togglePolicy: async (policyId) => {
    const res = await axiosInstance.patch(API_PATHS.OKF.TOGGLE(policyId));
    return res.data;
  },

  deletePolicy: async (policyId) => {
    const res = await axiosInstance.delete(API_PATHS.OKF.DELETE(policyId));
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


// ==========================================
// 8. NOTIFICATIONS APIs
// ==========================================
export const notificationApi = {
  getAll: async () => {
    const res = await axiosInstance.get(API_PATHS.NOTIFICATIONS.GET_ALL);
    return res.data;
  },

  markAllRead: async () => {
    const res = await axiosInstance.patch(API_PATHS.NOTIFICATIONS.MARK_ALL_READ);
    return res.data;
  },

  markRead: async (id) => {
    const res = await axiosInstance.patch(API_PATHS.NOTIFICATIONS.MARK_READ(id));
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(API_PATHS.NOTIFICATIONS.DELETE(id));
    return res.data;
  },
};

