import { Menu, Terminal, Search, Bell, LogOut } from "lucide-react";

const TopHeader = ({
  activePage,
  onOpenCommandPalette,
  onOpenMobileMenu,
  onNavigate,
  onSignOut,
  user = { name: "Alok Prasad", role: "Workspace Admin", initials: "AP" },
  unreadCount = 3,
}) => {
  const getBreadcrumbLabel = (page) => {
    const labels = {
      overview: "overview",
      dashboard: "dashboard",
      projects: "projects",
      repositories: "repositories",
      workflows: "workflows",
      "workflow-runs": "workflow-runs",
      "workflow-detail": "workflow-detail",
      agents: "agent-library",
      "agent-runs": "agent-runs",
      "agent-detail": "agent-detail",
      rag: "rag-knowledge",
      okf: "okf-policies",
      tools: "tools-sandbox",
      approvals: "approvals",
      logs: "execution-logs",
      reports: "reports",
      analytics: "analytics",
      team: "team",
      notifications: "notifications",
      settings: "settings",
    };
    return labels[page] || page;
  };

  return (
    <header className="h-14 border-b border-[#201d1a] bg-[#0c0d12]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile menu button */}
        <button
          id="mobile-menu-btn"
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden text-[#b8ab97] hover:text-orange-400 p-1.5 rounded-lg hover:bg-[#181920] transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
          <Terminal className="w-3.5 h-3.5 text-orange-500" />
          <span id="breadcrumb" className="text-[#8a7f70]">
            ~/praxis/
            <span className="text-[#f5eedf] font-medium" id="breadcrumb-current">
              {getBreadcrumbLabel(activePage)}
            </span>
          </span>
        </div>

        {/* All Systems Operational badge */}
        <div className="hidden md:flex items-center gap-2 ml-2 sm:ml-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            All Systems Operational
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Search trigger (CMD+K) */}
        <div
          id="search-trigger"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 bg-[#13141a] border border-[#26231f] rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-[#b8ab97] w-36 sm:w-48 lg:w-64 cursor-pointer hover:border-orange-500/40 hover:text-[#faf7f0] transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-orange-400" />
          <span className="flex-1 text-left font-mono truncate">Search...</span>
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-[#1c1d25] px-1.5 py-0.5 rounded text-orange-300 border border-orange-500/20">
            ⌘K
          </kbd>
        </div>

        <div className="w-px h-5 bg-[#201d1a]" />

        {/* Notifications trigger */}
        <button
          type="button"
          onClick={() => onNavigate("notifications")}
          className="relative text-[#b8ab97] hover:text-orange-400 transition-colors p-1.5 rounded-lg hover:bg-[#181920] cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </button>

        {/* User profile (Static Badge + Sign Out) */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 pr-1.5 py-1 rounded-xl border border-[#201d1a] bg-[#0e0f14]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shrink-0 relative border border-orange-400/40 shadow-sm">
              <span className="text-xs font-bold text-white">
                {user.initials || "AP"}
              </span>
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border-2 border-[#0c0d12]" />
            </div>
            <div className="hidden md:flex flex-col overflow-hidden text-left">
              <span className="text-xs font-semibold text-[#faf7f0] truncate">
                {user.name || "Alok Prasad"}
              </span>
              <span className="text-[9px] text-orange-400 font-mono">
                {user.role || "Workspace Admin"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="text-[#8a7f70] hover:text-orange-400 hover:bg-orange-500/15 p-1.5 rounded-lg transition-colors ml-0.5 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;

export { TopHeader };
