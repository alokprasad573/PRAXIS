import { useState, useCallback, useEffect } from "react";

// Components & Views
import {
  Sidebar,
  TopHeader,
  Toast,
  CommandPaletteModal,
  NewWorkflowModal,
  ConnectRepoModal,
  OverviewView,
  ProjectsView,
  RepositoriesView,
  WorkflowsView,
  WorkflowRunsView,
  WorkflowDetailView,
  AgentsView,
  AgentRunsView,
  AgentDetailView,
  RagView,
  OkfView,
  ToolsView,
  ApprovalsView,
  LogsView,
  ReportsView,
  AnalyticsView,
  TeamView,
  NotificationsView,
} from "./components";

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
} from "../../utils/apiService";
import {
  mockTools,
  mockRecentToolExecutions,
  mockAnalyticsData,
} from "../../utils/dashboardData";

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

  const executionLogs = [];
  const [notifications, setNotifications] = useState([]);
  const [ragSources, setRagSources] = useState([]);
  const [okfPolicies, setOkfPolicies] = useState([]);
  const kpis = {
    activeWorkflows: workflows.filter((w) => w.status === "running").length,
    runningAgents: agents.filter((a) => a.status === "active").length,
    completedTasks: workflows.filter((w) => w.status === "completed").length,
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
    const loadAllDashboardData = async () => {
      try {
        // 1. Workspace & Members
        const wsRes = await workspaceApi.getCurrent();
        if (wsRes?.success && wsRes.data) {
          setWorkspace(wsRes.data);
          if (wsRes.data.members) setTeamMembers(wsRes.data.members);
        }

        // 2. Projects
        const projRes = await projectApi.getAll();
        if (projRes?.success && projRes.data?.length > 0) {
          setProjects(projRes.data);
          setActiveProject(projRes.data[0]);
        }

        // 3. Real Workflows from DB
        const wfRes = await workflowApi.getAll();
        if (wfRes?.success && wfRes.data) {
          setWorkflows(wfRes.data);
          if (wfRes.data.length > 0) {
            setSelectedWorkflowId(wfRes.data[0].customId || wfRes.data[0]._id);
          }
        }

        // 4. Real Pending Approvals & History
        const [pendingAppr, historyAppr] = await Promise.allSettled([
          approvalApi.getPending(),
          approvalApi.getHistory(),
        ]);
        if (pendingAppr.status === "fulfilled" && pendingAppr.value?.success) {
          setApprovals(pendingAppr.value.data || []);
        }
        if (historyAppr.status === "fulfilled" && historyAppr.value?.success) {
          setApprovalHistory(historyAppr.value.data || []);
        }

        // 5. Real Agents & Runs
        const [agentsRes, runsRes] = await Promise.allSettled([
          agentApi.getLibrary(),
          agentApi.getRuns(),
        ]);
        if (agentsRes.status === "fulfilled" && agentsRes.value?.success) {
          setAgents(agentsRes.value.data || []);
        }
        if (runsRes.status === "fulfilled" && runsRes.value?.success) {
          setAgentRuns(runsRes.value.data || []);
        }

        // 6. Real Notifications from DB
        try {
          const notifRes = await notificationApi.getAll();
          if (notifRes?.success && Array.isArray(notifRes.data)) {
            setNotifications(notifRes.data);
          }
        } catch (e) {
          console.error("Notifications load error:", e);
        }

        // 7. Real RAG Sources & OKF Policies
        try {
          const [ragRes, okfRes] = await Promise.allSettled([
            ragApi.getSources(),
            okfApi.getPolicies(),
          ]);
          if (ragRes.status === "fulfilled" && ragRes.value?.success && Array.isArray(ragRes.value.data)) {
            setRagSources(ragRes.value.data);
          }
          if (okfRes.status === "fulfilled" && okfRes.value?.success && Array.isArray(okfRes.value.data)) {
            setOkfPolicies(okfRes.value.data);
          }
        } catch (e) {
          console.error("RAG / OKF load error:", e);
        }
      } catch (err) {
        console.error("Failed to load live platform data:", err);
      }
    };

    loadAllDashboardData();
  }, []);

  // Live Workflow & Notification Poller (Only polls when workflows are actively progressing)
  useEffect(() => {
    const hasActiveWorkflow = workflows.some(
      (w) => w.status === "running" || w.status === "in_progress"
    );

    if (!hasActiveWorkflow) return;

    const interval = setInterval(async () => {
      try {
        const [wfRes, apprRes, notifRes, runsRes] = await Promise.allSettled([
          workflowApi.getAll(),
          approvalApi.getPending(),
          notificationApi.getAll(),
          agentApi.getRuns(),
        ]);

        if (wfRes.status === "fulfilled" && wfRes.value?.success && Array.isArray(wfRes.value.data)) {
          setWorkflows(wfRes.value.data);
        }
        if (apprRes.status === "fulfilled" && apprRes.value?.success && Array.isArray(apprRes.value.data)) {
          setApprovals(apprRes.value.data);
        }
        if (notifRes.status === "fulfilled" && notifRes.value?.success && Array.isArray(notifRes.value.data)) {
          setNotifications(notifRes.value.data);
        }
        if (runsRes.status === "fulfilled" && runsRes.value?.success && Array.isArray(runsRes.value.data)) {
          setAgentRuns(runsRes.value.data);
        }
      } catch {
        // Background silent poll
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [workflows]);


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
          `Are you sure you want to disconnect and delete "${projectName}" from this workspace?`
        )
      ) {
        return;
      }
      try {
        const res = await projectApi.deleteProject(projectId);
        if (res?.success) {
          setProjects((prev) =>
            prev.filter((p) => (p.id || p._id) !== projectId)
          );
          setActiveProject((prev) =>
            (prev?.id || prev?._id) === projectId ? null : prev
          );
          addToast(`Repository "${projectName}" removed from database`, "success");
        } else {
          addToast(res.message || "Failed to delete repository", "error");
        }
      } catch (err) {
        addToast(
          err.response?.data?.message || "Error deleting repository from database",
          "error"
        );
      }
    },
    [addToast]
  );

  // Approval Gate Handlers (Persisted in DB)
  const handleApprove = useCallback(
    async (id) => {
      try {
        const res = await approvalApi.decide(id, "approve");
        if (res?.success) {
          setApprovals((prev) =>
            prev.filter((a) => (a._id || a.approvalId) !== id && a.approvalId !== id)
          );
          if (res.data) setApprovalHistory((prev) => [res.data, ...prev]);
          addToast(`Approval granted for ${id}. Pipeline proceeding.`, "success");
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
            prev.filter((a) => (a._id || a.approvalId) !== id && a.approvalId !== id)
          );
          if (res.data) setApprovalHistory((prev) => [res.data, ...prev]);
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
            activeRuns={workflows.filter((w) => w.status === "running" || w.status === "in_progress")}
            historicalRuns={workflows.filter((w) => w.status !== "running" && w.status !== "in_progress")}
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
            onOpenConnectModal={() => setIsConnectRepoOpen(true)}
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
        return <LogsView executionLogs={executionLogs} onToast={addToast} />;

      case "reports":
        return <ReportsView onToast={addToast} />;

      case "analytics":
        return (
          <AnalyticsView
            analyticsData={mockAnalyticsData}
            onNavigate={handleNavigate}
          />
        );

      case "team":
        return <TeamView workspace={workspace} members={teamMembers} setMembers={setTeamMembers} onToast={addToast} />;

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

  const pendingApprovalsCount = approvals.length;
  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

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
          <ErrorBoundary key={activePage} onReset={() => setActivePage("overview")}>
            {renderCurrentView()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Command Palette Modal (⌘K) */}
      {isCommandPaletteOpen && (
        <CommandPaletteModal
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={handleNavigate}
          onOpenNewWorkflow={() => setIsNewWorkflowOpen(true)}
        />
      )}

      {/* Launch New Workflow Modal */}
      <NewWorkflowModal
        isOpen={isNewWorkflowOpen}
        onClose={() => setIsNewWorkflowOpen(false)}
        onLaunchWorkflow={handleLaunchWorkflow}
        projects={projects}
      />

      {/* Connect Repository Modal */}
      <ConnectRepoModal
        isOpen={isConnectRepoOpen}
        onClose={() => setIsConnectRepoOpen(false)}
        onAddProject={handleConnectRepo}
      />
    </div>
  );
};

export default DashboardPage;
export { DashboardPage };
