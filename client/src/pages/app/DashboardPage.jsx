import React, { useState, useEffect, useCallback } from "react";
import FloatingImagesCanvas from "../../ui/FloatingImagesCanvas";
import {
  mockUser,
  mockProjects,
  mockAgents,
  mockWorkflows,
  mockApprovals,
  mockExecutionLogs,
  mockRagSources,
  mockOkfPolicies,
  mockKpis,
  mockNotifications,
  mockActiveWorkflowRuns,
  mockHistoricalWorkflowRuns,
  mockAgentRuns,
  mockTools,
  mockRecentToolExecutions,
  mockTeamMembers,
  mockApprovalHistory,
  mockAnalyticsData,
} from "../../utils/dashboardData";

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

const DashboardPage = () => {
  // Navigation & Page State
  const [activePage, setActivePage] = useState("overview");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("WF-2048");
  const [selectedAgentId, setSelectedAgentId] = useState("agent-001");

  // Core Data State
  const [projects, setProjects] = useState(mockProjects);
  const [activeProject, setActiveProject] = useState(mockProjects[0]);
  const [workflows, setWorkflows] = useState(mockWorkflows);
  const [approvals, setApprovals] = useState(mockApprovals);
  const [executionLogs, setExecutionLogs] = useState(mockExecutionLogs);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [ragSources, setRagSources] = useState(mockRagSources);
  const [okfPolicies, setOkfPolicies] = useState(mockOkfPolicies);
  const [kpis, setKpis] = useState(mockKpis);

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

  // Project Switcher Handler
  const handleSelectProject = useCallback(
    (project) => {
      setActiveProject(project);
      addToast(`Switched active context to ${project.name}`, "info");
    },
    [addToast]
  );

  // Workflow Actions
  const handleLaunchWorkflow = useCallback(
    (newWf) => {
      setWorkflows((prev) => [newWf, ...prev]);
      addToast(`Workflow ${newWf.id} launched successfully in parallel mode`, "success");
      setIsNewWorkflowOpen(false);
      handleNavigate("workflow-detail", newWf.id);
    },
    [addToast, handleNavigate]
  );

  // Repo Connection Handler
  const handleConnectRepo = useCallback(
    (newProject) => {
      setProjects((prev) => [newProject, ...prev]);
      setActiveProject(newProject);
      addToast(`Repository ${newProject.name} connected and indexed`, "success");
      setIsConnectRepoOpen(false);
    },
    [addToast]
  );

  // Approval Gate Handlers
  const handleApprove = useCallback(
    (id) => {
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      addToast(`Approval granted for ${id}. Execution proceeding.`, "success");
    },
    [addToast]
  );

  const handleReject = useCallback(
    (id) => {
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      addToast(`Approval rejected for ${id}. Step cancelled.`, "warning");
    },
    [addToast]
  );

  // Mark all notifications read
  const handleMarkAllNotificationsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
    addToast("All alerts marked as read", "info");
  }, [addToast]);

  // Sign out handler
  const handleSignOut = useCallback(() => {
    addToast("Signed out of session. Redirecting...", "info");
    setTimeout(() => {
      window.location.href = "/";
    }, 800);
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
            onOpenConnectModal={() => setIsConnectRepoOpen(true)}
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
            activeRuns={mockActiveWorkflowRuns}
            historicalRuns={mockHistoricalWorkflowRuns}
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
        return (
          <OkfView
            okfPolicies={okfPolicies}
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
            history={mockApprovalHistory}
            onApprove={handleApprove}
            onReject={handleReject}
            onToast={addToast}
          />
        );

      case "logs":
        return (
          <LogsView
            executionLogs={executionLogs}
            onToast={addToast}
          />
        );

      case "reports":
        return (
          <ReportsView
            onToast={addToast}
          />
        );

      case "analytics":
        return (
          <AnalyticsView
            analyticsData={mockAnalyticsData}
            onNavigate={handleNavigate}
          />
        );

      case "team":
        return (
          <TeamView
            members={mockTeamMembers}
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

      case "settings":
        return (
          <SettingsView
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
    <div className="bg-[#070709] text-[#faf7f0] font-sans antialiased h-screen overflow-hidden flex selection:bg-orange-500/30 selection:text-orange-200 relative">
      {/* Multi-Agent Brain Neural Constellation Canvas */}
      <FloatingImagesCanvas
        id="agentic-canvas"
        className="fixed inset-0 pointer-events-none z-0 opacity-35"
      />

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
      <div className="flex-1 flex flex-col overflow-hidden bg-[#070709] w-full min-w-0 relative z-10">
        {/* Top Header */}
        <TopHeader
          activePage={activePage}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={handleNavigate}
          onSignOut={handleSignOut}
          user={mockUser}
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
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        onOpenNewWorkflow={() => setIsNewWorkflowOpen(true)}
      />

      {/* Launch New Workflow Modal */}
      <NewWorkflowModal
        isOpen={isNewWorkflowOpen}
        onClose={() => setIsNewWorkflowOpen(false)}
        onLaunchWorkflow={handleLaunchWorkflow}
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
