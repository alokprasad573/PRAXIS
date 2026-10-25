import { Suspense, useState, useCallback, useEffect, useMemo } from "react";

import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import Toast from "./components/Toast";

import ErrorBoundary from "../../components/ErrorBoundary";
import { useAuth } from "../../context/useAuth";
import {
  projectApi,
  authApi,
  workspaceApi,
  workflowApi,
  approvalApi,
  agentApi,
  notificationApi,
  ragApi,
  okfApi,
  dashboardApi,
  telemetryApi,
} from "../../utils/apiService";
import {
  mockTools,
  mockRecentToolExecutions,
  mockAnalyticsData,
} from "../../utils/dashboardData";

import CommandPaletteModal from "./components/CommandPaletteModal";
import NewWorkflowModal from "./components/NewWorkflowModal";
import ConnectRepoModal from "./components/ConnectRepoModal";
import OverviewView from "./components/OverviewView";
import ProjectsView from "./components/ProjectsView";
import RepositoriesView from "./components/RepositoriesView";
import WorkflowsView from "./components/WorkflowsView";
import WorkflowRunsView from "./components/WorkflowRunsView";
import WorkflowDetailView from "./components/WorkflowDetailView";
import AgentsView from "./components/AgentsView";
import AgentRunsView from "./components/AgentRunsView";
import AgentDetailView from "./components/AgentDetailView";
import RagView from "./components/RagView";
import OkfView from "./components/OkfView";
import ToolsView from "./components/ToolsView";
import ApprovalsView from "./components/ApprovalsView";
import LogsView from "./components/LogsView";
import ReportsView from "./components/ReportsView";
import AnalyticsView from "./components/AnalyticsView";
import TeamView from "./components/TeamView";
import NotificationsView from "./components/NotificationsView";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  // Navigation & Page State
  const [activePage, setActivePage] = useState("overview");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("WF-2048");
  const [selectedAgentId, setSelectedAgentId] = useState("agent-001");

  // Core Data State (Synced with MongoDB)
  const [workspace, setWorkspace] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [agentRuns, setAgentRuns] = useState([]);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(mockAnalyticsData);
  const [tokenByAgent, setTokenByAgent] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [ragSources, setRagSources] = useState([]);
  const [okfPolicies, setOkfPolicies] = useState([]);

  const safeWorkflows = Array.isArray(workflows) ? workflows : [];
  const safeAgents = Array.isArray(agents) ? agents : [];
  const safeApprovals = Array.isArray(approvals) ? approvals : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const kpis = {
    activeWorkflows: safeWorkflows.filter(
      (w) => w && (w.status === "running" || w.status === "in_progress"),
    ).length,
    runningAgents: safeAgents.filter(
      (a) => a && (a.status === "active" || a.status === "running"),
    ).length,
    completedTasks: safeWorkflows.filter((w) => w && w.status === "completed")
      .length,
    tokensUsed: "12.4k",
    estimatedCost: "$0.14",
    avgDuration: "45s",
    successRate: "98%",
  };

  // Modals & UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewWorkflowOpen, setIsNewWorkflowOpen] = useState(false);
  const [isConnectRepoOpen, setIsConnectRepoOpen] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Universal Navigation Handler
  const handleNavigate = useCallback((page, param = null) => {
    let target = page;
    if (page === "dashboard") {
      target = "overview";
    }

    if (target === "workflow-detail") {
      if (param) setSelectedWorkflowId(param);
    } else if (target === "agent-detail") {
      if (param) setSelectedAgentId(param);
    }

    setActivePage(target);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Keyboard Shortcuts (⌘K / Ctrl+K and ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
        setIsNewWorkflowOpen(false);
        setIsConnectRepoOpen(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load Real Data from MongoDB on Mount
  useEffect(() => {
    let isMounted = true;

    const loadFallbacks = () => {
      const load = (name, request, onSuccess) => {
        request.then(
          (response) => {
            if (isMounted) onSuccess(response);
          },
          (error) => console.error(`Failed to load ${name}:`, error),
        );
      };

      load("workspace", workspaceApi.getCurrent(), (response) => {
        if (response?.success && response.data) {
          setWorkspace(response.data);
          if (response.data.members) setTeamMembers(response.data.members);
        }
      });

      load("projects", projectApi.getAll(), (response) => {
        if (response?.success && response.data?.length > 0) {
          setProjects(response.data);
          setActiveProject(response.data[0]);
        }
      });

      load("workflows", workflowApi.getAll(), (response) => {
        if (response?.success && response.data) {
          setWorkflows(response.data);
          if (response.data.length > 0) {
            setSelectedWorkflowId(
              response.data[0].customId || response.data[0]._id,
            );
          }
        }
      });

      load("pending approvals", approvalApi.getPending(), (response) => {
        if (response?.success) setApprovals(response.data || []);
      });

      load("approval history", approvalApi.getHistory(), (response) => {
        if (response?.success) setApprovalHistory(response.data || []);
      });

      load("agents", agentApi.getLibrary(), (response) => {
        if (response?.success) setAgents(response.data || []);
      });

      load("agent runs", agentApi.getRuns(), (response) => {
        if (response?.success) setAgentRuns(response.data || []);
      });

      load("notifications", notificationApi.getAll(), (response) => {
        if (response?.success && Array.isArray(response.data)) {
          setNotifications(response.data);
        }
      });

      load("RAG sources", ragApi.getSources(), (response) => {
        if (response?.success && Array.isArray(response.data)) {
          setRagSources(response.data);
        }
      });

      load("OKF policies", okfApi.getPolicies(), (response) => {
        if (response?.success && Array.isArray(response.data)) {
          setOkfPolicies(response.data);
        }
      });

      load("telemetry logs", telemetryApi.getLogs(), (response) => {
        if (response?.success && Array.isArray(response.data)) {
          setExecutionLogs(response.data);
        }
      });

      load("telemetry analytics", telemetryApi.getAnalytics(), (response) => {
        if (response?.success && response.data?.analyticsData) {
          setAnalyticsData(response.data.analyticsData);
          if (Array.isArray(response.data.tokenByAgent)) {
            setTokenByAgent(response.data.tokenByAgent);
          }
        }
      });
    };

    // Primary: Hydrate entire dashboard in 1 single bootstrap call
    dashboardApi
      .getBootstrap()
      .then((res) => {
        if (res?.success && res.data && isMounted) {
          const d = res.data;
          if (d.workspace) setWorkspace(d.workspace);
          if (d.teamMembers) setTeamMembers(d.teamMembers);
          if (d.projects?.length > 0) {
            setProjects(d.projects);
            setActiveProject(d.projects[0]);
          }
          if (d.workflows?.length > 0) {
            setWorkflows(d.workflows);
            setSelectedWorkflowId(
              d.workflows[0].customId || d.workflows[0]._id,
            );
          }
          if (d.approvals) setApprovals(d.approvals);
          if (d.approvalHistory) setApprovalHistory(d.approvalHistory);
          if (d.agents) setAgents(d.agents);
          if (d.agentRuns) setAgentRuns(d.agentRuns);
          if (d.notifications) setNotifications(d.notifications);
          if (d.ragSources) setRagSources(d.ragSources);
          if (d.okfPolicies) setOkfPolicies(d.okfPolicies);
          // Also fetch telemetry logs & analytics in parallel
          telemetryApi.getLogs().then((logRes) => {
            if (logRes?.success && Array.isArray(logRes.data) && isMounted) {
              setExecutionLogs(logRes.data);
            }
          }).catch(() => {});
          telemetryApi.getAnalytics().then((anRes) => {
            if (anRes?.success && anRes.data?.analyticsData && isMounted) {
              setAnalyticsData(anRes.data.analyticsData);
              if (Array.isArray(anRes.data.tokenByAgent)) {
                setTokenByAgent(anRes.data.tokenByAgent);
              }
            }
          }).catch(() => {});
        } else {
          loadFallbacks();
        }
      })
      .catch(() => {
        if (isMounted) loadFallbacks();
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Derive boolean active workflow flag without tying effect lifecycle to array mutation (BUG-008 Fix)
  const hasActiveWorkflow = useMemo(() => {
    return (
      Array.isArray(workflows) &&
      workflows.some(
        (w) =>
          w &&
          (w.status === "running" ||
            w.status === "in_progress" ||
            w.status === "waiting"),
      )
    );
  }, [workflows]);

  // Live Workflow & Telemetry Poller with decoupled, adaptive lifecycle (BUG-008 Fix)
  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    // Fast polling (3.5s) when workflows are active/waiting; relaxed polling (15s) when idle
    const pollInterval = hasActiveWorkflow ? 3500 : 15000;

    const poll = async () => {
      if (isFetching || !isMounted) return;
      isFetching = true;

      try {
        const [wfRes, apprRes, notifRes, runsRes] = await Promise.allSettled([
          workflowApi.getAll(),
          approvalApi.getPending(),
          notificationApi.getAll(),
          agentApi.getRuns(),
        ]);

        if (!isMounted) return;

        if (
          wfRes.status === "fulfilled" &&
          wfRes.value?.success &&
          Array.isArray(wfRes.value.data)
        ) {
          setWorkflows(wfRes.value.data);
        }
        if (
          apprRes.status === "fulfilled" &&
          apprRes.value?.success &&
          Array.isArray(apprRes.value.data)
        ) {
          setApprovals(apprRes.value.data);
        }
        if (
          notifRes.status === "fulfilled" &&
          notifRes.value?.success &&
          Array.isArray(notifRes.value.data)
        ) {
          setNotifications(notifRes.value.data);
        }
        if (
          runsRes.status === "fulfilled" &&
          runsRes.value?.success &&
          Array.isArray(runsRes.value.data)
        ) {
          setAgentRuns(runsRes.value.data);
        }
      } catch {
        // Background silent poll
      } finally {
        isFetching = false;
      }
    };

    const intervalId = setInterval(poll, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [hasActiveWorkflow]);

  // Project Switcher Handler
  const handleSelectProject = useCallback(
    async (project) => {
      setActiveProject(project);
      addToast(`Switched active context to ${project.name}`, "info");
      try {
        await authApi.switchContext({ projectId: project.id || project._id });
      } catch (e) {
        console.error("Context switch sync error:", e);
      }
    },
    [addToast],
  );

  // Workflow Actions
  const handleLaunchWorkflow = useCallback(
    (newWf) => {
      setWorkflows((prev) => [newWf, ...prev]);
      const wfId = newWf.customId || newWf.id || "WF-NEW";
      addToast(
        `Workflow ${wfId} launched successfully in ${newWf.executionMode || "parallel"} mode`,
        "success",
      );
      setIsNewWorkflowOpen(false);
      handleNavigate("workflow-detail", wfId);
    },
    [addToast, handleNavigate],
  );

  const handleCancelWorkflow = useCallback(
    async (workflowId) => {
      try {
        const res = await workflowApi.cancel(workflowId);
        if (res.success) {
          setWorkflows((prev) =>
            prev.map((w) =>
              w._id === workflowId || w.customId === workflowId
                ? { ...w, status: "cancelled" }
                : w
            )
          );
          addToast(`Workflow ${workflowId} execution cancelled`, "warning");
        }
      } catch (err) {
        addToast(`Failed to cancel workflow: ${err.message}`, "error");
      }
    },
    [addToast],
  );

  // Repo Connection Handler
  const handleConnectRepo = useCallback(
    (newProject) => {
      setProjects((prev) => [newProject, ...prev]);
      setActiveProject(newProject);
      addToast(
        `Repository ${newProject.name} connected and indexed`,
        "success",
      );
      setIsConnectRepoOpen(false);
    },
    [addToast],
  );

  // Delete / Disconnect Repository from DB Handler
  const handleDeleteProject = useCallback(
    async (projectId, projectName) => {
      if (
        !window.confirm(
          `Are you sure you want to disconnect and delete "${projectName}" from this workspace?`,
        )
      ) {
        return;
      }
      try {
        const res = await projectApi.deleteProject(projectId);
        if (res?.success) {
          setProjects((prev) =>
            prev.filter((p) => (p.id || p._id) !== projectId),
          );
          setActiveProject((prev) =>
            (prev?.id || prev?._id) === projectId ? null : prev,
          );
          addToast(
            `Repository "${projectName}" removed from database`,
            "success",
          );
        } else {
          addToast(res.message || "Failed to delete repository", "error");
        }
      } catch (err) {
        addToast(
          err.response?.data?.message ||
            "Error deleting repository from database",
          "error",
        );
      }
    },
    [addToast],
  );

  // Approval Gate Handlers (Persisted in DB)
  const handleApprove = useCallback(
    async (id) => {
      try {
        const res = await approvalApi.decide(id, "approve");
        if (res?.success) {
          setApprovals((prev) =>
            prev.filter(
              (a) => (a._id || a.approvalId) !== id && a.approvalId !== id,
            ),
          );
          if (res.data) setApprovalHistory((prev) => [res.data, ...prev]);
          if (res.workflow) {
            setWorkflows((prev) =>
              prev.map((w) => (w._id === res.workflow._id ? res.workflow : w)),
            );
          }
          addToast(
            `Approval granted for ${id}. Pipeline proceeding.`,
            "success",
          );
        } else {
          addToast(res.message || "Failed to record approval", "error");
        }
      } catch {
        addToast("Error communicating with approvals server", "error");
      }
    },
    [addToast],
  );

  const handleReject = useCallback(
    async (id) => {
      try {
        const res = await approvalApi.decide(id, "reject");
        if (res?.success) {
          setApprovals((prev) =>
            prev.filter(
              (a) => (a._id || a.approvalId) !== id && a.approvalId !== id,
            ),
          );
          if (res.data) setApprovalHistory((prev) => [res.data, ...prev]);
          if (res.workflow) {
            setWorkflows((prev) =>
              prev.map((w) => (w._id === res.workflow._id ? res.workflow : w)),
            );
          }
          addToast(`Approval rejected for ${id}. Step aborted.`, "warning");
        } else {
          addToast(res.message || "Failed to record rejection", "error");
        }
      } catch {
        addToast("Error communicating with approvals server", "error");
      }
    },
    [addToast],
  );

  // Mark all notifications read
  const handleMarkAllNotificationsRead = useCallback(async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      addToast("All alerts marked as read", "info");
    } catch {
      addToast("Failed to mark alerts as read", "error");
    }
  }, [addToast]);

  // Dynamic View Renderer
  const renderCurrentView = () => {
    switch (activePage) {
      case "overview":
      case "dashboard":
        return (
          <OverviewView
            kpis={kpis}
            workflows={workflows}
            onNavigate={handleNavigate}
            onOpenNewWorkflow={() => setIsNewWorkflowOpen(true)}
            onOpenConnectModal={() => setIsConnectRepoOpen(true)}
          />
        );

      case "projects":
        return (
          <ProjectsView
            projects={projects}
            onNavigate={handleNavigate}
            onSelectProject={handleSelectProject}
            onOpenConnectModal={() => setIsConnectRepoOpen(true)}
            onOpenNewWorkflow={(proj) => {
              if (proj) setActiveProject(proj);
              setIsNewWorkflowOpen(true);
            }}
          />
        );

      case "repositories":
        return (
          <RepositoriesView
            projects={projects}
            onOpenConnectModal={() => setIsConnectRepoOpen(true)}
            onDeleteProject={handleDeleteProject}
            onNavigate={handleNavigate}
            onSelectProject={setActiveProject}
          />
        );

      case "workflows":
        return (
          <WorkflowsView
            workflows={workflows}
            onNavigate={handleNavigate}
            onOpenNewWorkflow={() => setIsNewWorkflowOpen(true)}
          />
        );

      case "workflow-runs":
        return (
          <WorkflowRunsView
            activeRuns={workflows.filter(
              (w) => w.status === "running" || w.status === "in_progress",
            )}
            historicalRuns={workflows.filter(
              (w) => w.status !== "running" && w.status !== "in_progress",
            )}
            workflows={workflows}
            onNavigate={handleNavigate}
            onOpenNewWorkflow={() => setIsNewWorkflowOpen(true)}
          />
        );

      case "workflow-detail":
        return (
          <WorkflowDetailView
            workflowId={selectedWorkflowId}
            workflows={workflows}
            onNavigate={handleNavigate}
            onToast={addToast}
            onCancelWorkflow={handleCancelWorkflow}
          />
        );

      case "agents":
        return (
          <AgentsView
            agents={agents}
            onNavigate={handleNavigate}
            onToast={addToast}
          />
        );

      case "agent-runs":
        return (
          <AgentRunsView
            agentRuns={agentRuns}
            onNavigate={handleNavigate}
            onToast={addToast}
          />
        );

      case "agent-detail":
        return (
          <AgentDetailView
            agentId={selectedAgentId}
            agents={agents}
            agentRuns={agentRuns}
            onNavigate={handleNavigate}
            onToast={addToast}
          />
        );

      case "rag":
        return (
          <RagView
            sources={ragSources}
            projects={projects}
            activeProject={activeProject}
            onSelectProject={setActiveProject}
            onToast={addToast}
            onUpdateProject={(updatedProject) => {
              if (!updatedProject) return;
              const uId = updatedProject.id || updatedProject._id;
              setProjects((prev) =>
                prev.map((p) => {
                  const pid = p.id || p._id;
                  if (pid === uId) {
                    return {
                      ...p,
                      ...updatedProject,
                      ragChunks:
                        updatedProject.ragChunks !== undefined
                          ? updatedProject.ragChunks
                          : p.ragChunks,
                    };
                  }
                  return p;
                }),
              );
              if (
                activeProject &&
                (activeProject.id === uId || activeProject._id === uId)
              ) {
                setActiveProject((prev) => ({
                  ...prev,
                  ...updatedProject,
                  ragChunks:
                    updatedProject.ragChunks !== undefined
                      ? updatedProject.ragChunks
                      : prev.ragChunks,
                }));
              }
            }}
          />
        );

      case "okf":
        return (
          <OkfView
            policies={okfPolicies}
            projects={projects}
            activeProject={activeProject}
            onSelectProject={setActiveProject}
            onToast={addToast}
          />
        );

      case "tools":
        return (
          <ToolsView
            tools={mockTools}
            recentExecutions={mockRecentToolExecutions}
            onToast={addToast}
          />
        );

      case "approvals":
        return (
          <ApprovalsView
            approvals={approvals}
            history={approvalHistory}
            onApprove={handleApprove}
            onReject={handleReject}
            onToast={addToast}
          />
        );

      case "logs":
        return <LogsView logs={executionLogs} executionLogs={executionLogs} onToast={addToast} />;

      case "reports":
        return <ReportsView onToast={addToast} />;

      case "analytics":
        return (
          <AnalyticsView
            analyticsData={analyticsData}
            tokenByAgent={tokenByAgent.length > 0 ? tokenByAgent : undefined}
            onNavigate={handleNavigate}
          />
        );

      case "team":
        return (
          <TeamView
            workspace={workspace}
            members={teamMembers}
            setMembers={setTeamMembers}
            onToast={addToast}
          />
        );

      case "notifications":
        return (
          <NotificationsView
            notifications={notifications}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onToast={addToast}
          />
        );

      default:
        return (
          <OverviewView
            kpis={kpis}
            workflows={workflows}
            onNavigate={handleNavigate}
            onOpenNewWorkflow={() => setIsNewWorkflowOpen(true)}
            onOpenConnectModal={() => setIsConnectRepoOpen(true)}
          />
        );
    }
  };

  const pendingApprovalsCount = safeApprovals.length;
  const unreadNotificationsCount = safeNotifications.filter(
    (n) => n && n.unread,
  ).length;

  return (
    <div className="bg-dark-base text-cream-100 font-sans antialiased h-screen overflow-hidden flex selection:bg-orange-500/30 selection:text-orange-200 relative">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          id="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar (Fixed 256px Width) */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        activeProject={activeProject}
        onSelectProject={handleSelectProject}
        projects={projects}
        onOpenConnectModal={() => setIsConnectRepoOpen(true)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        pendingApprovalsCount={pendingApprovalsCount}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-dark-base w-full min-w-0 relative z-10">
        {/* Top Header */}
        <TopHeader
          activePage={activePage}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={handleNavigate}
          onSignOut={logout}
          user={
            user || {
              name: "Developer",
              role: "Workspace Admin",
              initials: "DV",
            }
          }
          unreadCount={unreadNotificationsCount}
        />

        {/* Main Content Viewport */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto custom-scrollbar relative p-4 sm:p-6"
        >
          <ErrorBoundary
            key={activePage}
            onReset={() => setActivePage("overview")}
          >
            <Suspense
              fallback={
                <div className="flex min-h-48 items-center justify-center text-xs font-mono text-[#a89f91]">
                  Loading view...
                </div>
              }
            >
              {renderCurrentView()}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Command Palette Modal (⌘K) */}
      {isCommandPaletteOpen && (
        <Suspense fallback={null}>
          <CommandPaletteModal
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onNavigate={handleNavigate}
            onOpenNewWorkflow={() => setIsNewWorkflowOpen(true)}
          />
        </Suspense>
      )}

      {/* Launch New Workflow Modal */}
      {isNewWorkflowOpen && (
        <Suspense fallback={null}>
          <NewWorkflowModal
            isOpen={isNewWorkflowOpen}
            onClose={() => setIsNewWorkflowOpen(false)}
            onLaunchWorkflow={handleLaunchWorkflow}
            projects={projects}
          />
        </Suspense>
      )}

      {/* Connect Repository Modal */}
      {isConnectRepoOpen && (
        <Suspense fallback={null}>
          <ConnectRepoModal
            isOpen={isConnectRepoOpen}
            onClose={() => setIsConnectRepoOpen(false)}
            onAddProject={handleConnectRepo}
          />
        </Suspense>
      )}
    </div>
  );
};

export default DashboardPage;
export { DashboardPage };
