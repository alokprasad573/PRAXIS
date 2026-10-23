import { useState } from "react";
import {
  LayoutDashboard,
  FolderGit2,
  GitBranch,
  GitMerge,
  PlayCircle,
  Bot,
  Activity,
  Database,
  ShieldCheck,
  Terminal,
  CheckCircle,
  Scroll,
  FileBarChart,
  BarChart3,
  Users,
  Bell,
  Settings,
  ChevronDown,
  Search,
  Plus,
} from "lucide-react";

const Sidebar = ({
  activePage,
  onNavigate,
  activeProject,
  onSelectProject,
  projects = [],
  onOpenConnectModal,
  mobileOpen,
  onCloseMobile,
  pendingApprovalsCount = 0,
  unreadNotificationsCount = 0,
}) => {
  const [projectSwitcherOpen, setProjectSwitcherOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");

  const filteredProjects = projects.filter((p) => {
    const q = projectSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.language && p.language.toLowerCase().includes(q)) ||
      (p.repo && p.repo.toLowerCase().includes(q))
    );
  });

  const navItem = (id, label, Icon, badge = null) => {
    const isActive =
      activePage === id || (id === "dashboard" && activePage === "overview");

    return (
      <button
        key={id}
        id={`nav-${id}`}
        type="button"
        onClick={() => {
          onNavigate(id);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-all nav-link group cursor-pointer ${
          isActive
            ? "nav-active bg-orange-500/15 text-orange-400 border-r-2 border-orange-500 font-semibold"
            : "text-[#b8ab97] hover:bg-[#181920] hover:text-cream-100"
        }`}
        title={label}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive
                ? "text-orange-400"
                : "text-[#8a7f70] group-hover:text-orange-400"
            }`}
          />
          <span className="whitespace-nowrap">{label}</span>
        </div>
        {badge !== null && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500/20 text-[9px] font-bold text-orange-400 border border-orange-500/30">
            {badge}
          </span>
        )}
      </button>
    );
  };

  const getHealthDotColor = (health) => {
    if (health === "healthy") return "bg-emerald-400";
    if (health === "warning") return "bg-amber-400";
    if (health === "error") return "bg-rose-400";
    return "bg-orange-400";
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Left Sidebar (Clean & Fixed 256px Width) */}
      <aside
        id="main-sidebar"
        className={`sidebar fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-[#0c0d12] border-r border-[#201d1a] transition-transform duration-300 ease-in-out shrink-0 w-64 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand bar */}
        <div className="h-14 border-b border-[#201d1a] flex items-center px-4 shrink-0">
          <div
            onClick={() => {
              onNavigate("overview");
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#090a0e] border border-orange-500/30 flex items-center justify-center p-1 shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:border-orange-400/60 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.45)] transition-all shrink-0">
              <svg
                className="w-6 h-6"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="sb-g1"
                    x1="24"
                    y1="3"
                    x2="43"
                    y2="24"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#ff7a00" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                  <linearGradient
                    id="sb-g2"
                    x1="43"
                    y1="24"
                    x2="24"
                    y2="45"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                  <linearGradient
                    id="sb-g3"
                    x1="5"
                    y1="24"
                    x2="24"
                    y2="3"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#ea580c" />
                    <stop offset="60%" stopColor="#ff5400" />
                    <stop offset="100%" stopColor="#ff7a00" />
                  </linearGradient>
                  <linearGradient
                    id="sb-p-grad"
                    x1="14"
                    y1="12"
                    x2="34"
                    y2="36"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#fff1e6" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
                <path d="M24 3.5L42 13.8V24L24 24V3.5Z" fill="url(#sb-g1)" />
                <path d="M24 24L42 24V34.2L24 44.5V24Z" fill="url(#sb-g2)" />
                <path
                  d="M24 3.5L24 44.5L6 34.2V13.8L24 3.5Z"
                  fill="url(#sb-g3)"
                />
                <polygon
                  points="24,9 37,16.5 37,31.5 24,39 11,31.5 11,16.5"
                  fill="#090a0e"
                  fillOpacity="0.92"
                />
                <path
                  d="M17 15H27C29.7614 15 32 17.2386 32 20C32 22.7614 29.7614 25 27 25H21.5V33H17V15ZM21.5 19V21.5H26.8C27.4627 21.5 28 20.9627 28 20.3C28 19.6373 27.4627 19 26.8 19H21.5Z"
                  fill="url(#sb-p-grad)"
                />
                <circle cx="32" cy="20" r="2" fill="#06b6d4" />
              </svg>
            </div>
            <span className="font-extrabold text-base tracking-wider text-white">
              PRAXIS
            </span>
          </div>
        </div>

        {/* Project Switcher */}
        <div className="relative shrink-0 border-b border-[#201d1a]">
          <button
            id="project-switcher-btn"
            type="button"
            onClick={() => setProjectSwitcherOpen(!projectSwitcherOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-[#13141b] transition-all group text-left cursor-pointer"
            title="Switch Active Project"
          >
            <div className="flex flex-col overflow-hidden">
              <span className="text-[9px] font-mono text-orange-400/80 uppercase tracking-widest font-bold">
                Switch Project
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  id="active-project-dot"
                  className={`w-2 h-2 rounded-full shrink-0 ${getHealthDotColor(
                    activeProject?.health || activeProject?.status,
                  )}`}
                />
                <span
                  id="active-project-name"
                  className="text-xs font-bold text-cream-100 font-mono truncate"
                >
                  {activeProject?.name || "Select Project"}
                </span>
                <ChevronDown
                  id="project-switcher-chevron"
                  className={`w-3.5 h-3.5 text-[#8a7f70] group-hover:text-orange-400 transition-transform duration-200 ${
                    projectSwitcherOpen ? "rotate-180 text-orange-400" : ""
                  }`}
                />
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded border border-orange-500/30 shrink-0">
              PRO
            </span>
          </button>

          {/* Project Switcher Popover */}
          {projectSwitcherOpen && (
            <div
              id="project-switcher-dropdown"
              className="absolute left-2 right-2 top-[calc(100%+4px)] z-50 bg-dark-card border border-[#2a2520] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(249,115,22,0.15)] overflow-hidden font-mono animate-fadeInUp"
            >
              <div className="p-2.5 border-b border-[#201d1a] bg-[#121319]">
                <div className="text-[10px] uppercase tracking-wider text-[#a89f91] font-bold flex items-center justify-between">
                  <span>Switch Project</span>
                  <span
                    id="project-count-badge"
                    className="text-orange-400 text-[9px]"
                  >
                    {projects.length} connected
                  </span>
                </div>
              </div>

              {/* Quick Filter Input */}
              <div className="p-2 border-b border-[#201d1a]">
                <div className="relative">
                  <Search className="w-3 h-3 text-[#78716c] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="project-switcher-search"
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Filter projects..."
                    className="w-full bg-dark-base border border-dark-border rounded-lg pl-7 pr-2 py-1 text-[11px] text-cream-100 placeholder-[#6b645b] focus:outline-none focus:border-orange-500"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Projects List */}
              <div
                id="project-switcher-list"
                className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-1"
              >
                {filteredProjects.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[#8a7f70]">
                    No projects found
                  </div>
                ) : (
                  filteredProjects.map((p) => {
                    const isSelected = activeProject && activeProject.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectProject(p);
                          setProjectSwitcherOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-orange-500/15 border border-orange-500/40 text-white shadow-sm"
                            : "hover:bg-[#181920] text-[#d6c5a8] hover:text-cream-100 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${getHealthDotColor(
                              p.health || p.status,
                            )}`}
                          />
                          <div className="flex flex-col overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold font-mono truncate text-cream-100">
                                {p.name}
                              </span>
                              {isSelected && (
                                <span className="text-[9px] text-orange-400 font-bold">
                                  ● Active
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8a7f70] font-sans truncate">
                              {p.repo || "repo"} • {p.language || "Code"}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#78716c] font-mono shrink-0">
                          {p.ragChunks
                            ? p.ragChunks > 1000
                              ? Math.round(p.ragChunks / 1000) + "k"
                              : p.ragChunks
                            : "0"}{" "}
                          vec
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Bottom Actions */}
              <div className="p-2 border-t border-[#201d1a] bg-[#090a0e] flex items-center justify-between text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setProjectSwitcherOpen(false);
                    if (onOpenConnectModal) onOpenConnectModal();
                  }}
                  className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Connect New
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProjectSwitcherOpen(false);
                    onNavigate("projects");
                  }}
                  className="text-[#8a7f70] hover:text-cream-100 transition-colors cursor-pointer"
                >
                  All Projects →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1 custom-scrollbar">
          {/* Dashboard */}
          {navItem("overview", "Dashboard", LayoutDashboard)}

          {/* WORKSPACE Section */}
          <div className="mt-3 mb-1 px-2.5 text-[9px] font-mono font-bold text-orange-400/70 uppercase tracking-widest">
            Workspace
          </div>
          {navItem("projects", "Projects", FolderGit2)}
          {navItem("repositories", "Repositories", GitBranch)}
          {navItem("workflows", "Workflows", GitMerge)}
          {navItem("workflow-runs", "Workflow Runs", PlayCircle)}

          {/* AI ENGINE Section */}
          <div className="mt-3 mb-1 px-2.5 text-[9px] font-mono font-bold text-orange-400/70 uppercase tracking-widest">
            AI Engine
          </div>
          {navItem("agents", "Agent Library", Bot)}
          {navItem("agent-runs", "Agent Runs", Activity)}
          {navItem("rag", "RAG Knowledge", Database)}
          {navItem("okf", "OKF Policies", ShieldCheck)}

          {/* AUTOMATION Section */}
          <div className="mt-3 mb-1 px-2.5 text-[9px] font-mono font-bold text-orange-400/70 uppercase tracking-widest">
            Automation
          </div>
          {navItem("tools", "Tools & Sandbox", Terminal)}
          {navItem(
            "approvals",
            "Approvals",
            CheckCircle,
            pendingApprovalsCount,
          )}

          {/* OBSERVABILITY Section */}
          <div className="mt-3 mb-1 px-2.5 text-[9px] font-mono font-bold text-orange-400/70 uppercase tracking-widest">
            Observability
          </div>
          {navItem("logs", "Execution Logs", Scroll)}
          {navItem("reports", "Reports", FileBarChart)}
          {navItem("analytics", "Analytics", BarChart3)}

          {/* SYSTEM Section */}
          <div className="mt-3 mb-1 px-2.5 text-[9px] font-mono font-bold text-orange-400/70 uppercase tracking-widest">
            System
          </div>
          {navItem("team", "Team", Users)}
          {navItem(
            "notifications",
            "Notifications",
            Bell,
            unreadNotificationsCount,
          )}
          {navItem("settings", "Settings", Settings)}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

export { Sidebar };
