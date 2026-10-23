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
  SettingsView,
} from "./components";

import { useAuth } from "../../context/useAuth";
import { projectApi, authApi } from "../../utils/apiService";
import {
  mockAgents,
  mockAgentRuns,
  mockTools,
  mockRecentToolExecutions,
  mockApprovalHistory,
  mockAnalyticsData,
  mockTeamMembers,
} from "../../utils/dashboardData";

const DashboardPage = () => {
  // DashboardPage component ke andar:
  const { user, logout } = useAuth();

  // Navigation & Page State
  const [activePage, setActivePage] = useState("overview");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("WF-2048");
  const [selectedAgentId, setSelectedAgentId] = useState("agent-001");

  // Core Data State
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const executionLogs = [];
  const [notifications, setNotifications] = useState([]);
  const ragSources = [];
  const okfPolicies = [];
  const kpis = {
    activeWorkflows: 0,
    runningAgents: 0,
    completedTasks: 0,
    tokensUsed: "0k",
    estimatedCost: "$0.00",
    avgDuration: "0s",
    successRate: "100%",
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

  // Load real projects from MongoDB on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectApi.getAll();
        if (res?.success && res.data?.length > 0) {
          setProjects(res.data);
          setActiveProject(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to load projects from server:", err);
      }
    };
    loadProjects();
  }, []);

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
      addToast(
        `Workflow ${newWf.id} launched successfully in parallel mode`,
        "success",
      );
      setIsNewWorkflowOpen(false);
      handleNavigate("workflow-detail", newWf.id);
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

  

  // Approval Gate Handlers
  const handleApprove = useCallback(
    (id) => {
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      addToast(`Approval granted for ${id}. Execution proceeding.`, "success");
    },
    [addToast],
  );

  const handleReject = useCallback(
    (id) => {
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      addToast(`Approval rejected for ${id}. Step cancelled.`, "warning");
    },
    [addToast],
  );

  // Mark all notifications read
  const handleMarkAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    addToast("All alerts marked as read", "info");
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
            onSelectProject={handleSelectProject}
            onOpenConnectModal={() => setIsConnectRepoOpen(true)}
            onNavigate={handleNavigate}
          />
        );

      case "repositories":
        return (
          <RepositoriesView
            projects={projects}
            onOpenConnectModal={() => setIsConnectRepoOpen(true)}
            onDeleteProject={handleDeleteProject}
          />
        );

      case "workflows":
        return (
          <WorkflowsView
            workflows={workflows}
            projects={projects}
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
            agents={mockAgents}
            onNavigate={handleNavigate}
            onToast={addToast}
          />
        );

      case "agent-runs":
        return (
          <AgentRunsView
            agentRuns={mockAgentRuns}
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
            ragSources={ragSources}
            onToast={addToast}
            onOpenConnectModal={() => setIsConnectRepoOpen(true)}
          />
        );

      case "okf":
        return <OkfView okfPolicies={okfPolicies} onToast={addToast} />;

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
            history={mockApprovalHistory}
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
        return <TeamView members={mockTeamMembers} onToast={addToast} />;

      case "notifications":
        return (
          <NotificationsView
            notifications={notifications}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onToast={addToast}
          />
        );

      case "settings":
        return <SettingsView onToast={addToast} />;

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
          onSignOut={logout} // <-- Real logout function
          user={
            user || {
              name: "Developer",
              role: "Workspace Admin",
              initials: "DV",
            }
          } // <-- Real logged in user (name, email, avatar)
          unreadCount={unreadNotificationsCount}
        />

        {/* Main Content Viewport */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto custom-scrollbar relative p-4 sm:p-6"
        >
          {renderCurrentView()}
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
