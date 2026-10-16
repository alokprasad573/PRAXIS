import { useState, useEffect, useRef } from "react";
import {
  Search,
  Play,
  LayoutDashboard,
  FolderGit2,
  GitBranch,
  GitMerge,
  PlayCircle,
  Bot,
  Activity,
  Database,
  ShieldCheck,
  CheckCircle,
  Scroll,
  Terminal,
  FileBarChart,
  BarChart3,
  Settings,
  Users,
  Bell,
} from "lucide-react";

const CommandPaletteModal = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewWorkflow,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    {
      label: "New Workflow",
      icon: Play,
      category: "Actions",
      action: () => {
        onClose();
        if (onOpenNewWorkflow) onOpenNewWorkflow();
      },
    },
    {
      label: "Overview",
      icon: LayoutDashboard,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("overview");
      },
    },
    {
      label: "Projects",
      icon: FolderGit2,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("projects");
      },
    },
    {
      label: "Repositories",
      icon: GitBranch,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("repositories");
      },
    },
    {
      label: "Workflows",
      icon: GitMerge,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("workflows");
      },
    },
    {
      label: "Workflow Runs",
      icon: PlayCircle,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("workflow-runs");
      },
    },
    {
      label: "Agent Library",
      icon: Bot,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("agents");
      },
    },
    {
      label: "Agent Runs",
      icon: Activity,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("agent-runs");
      },
    },
    {
      label: "RAG Knowledge Base",
      icon: Database,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("rag");
      },
    },
    {
      label: "OKF Policies",
      icon: ShieldCheck,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("okf");
      },
    },
    {
      label: "Approvals",
      icon: CheckCircle,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("approvals");
      },
    },
    {
      label: "Execution Logs",
      icon: Scroll,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("logs");
      },
    },
    {
      label: "Tools & Sandbox",
      icon: Terminal,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("tools");
      },
    },
    {
      label: "Reports",
      icon: FileBarChart,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("reports");
      },
    },
    {
      label: "Analytics",
      icon: BarChart3,
      category: "Navigate",
      action: () => {
        onClose();
        onNavigate("analytics");
      },
    },
    {
      label: "Settings",
      icon: Settings,
      category: "System",
      action: () => {
        onClose();
        onNavigate("settings");
      },
    },
    {
      label: "Team",
      icon: Users,
      category: "System",
      action: () => {
        onClose();
        onNavigate("team");
      },
    },
    {
      label: "Notifications",
      icon: Bell,
      category: "System",
      action: () => {
        onClose();
        onNavigate("notifications");
      },
    },
  ];

  const filteredCommands = query
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        Math.min(prev + 1, filteredCommands.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex].action();
    }
  };

  if (!isOpen) return null;

  // Group filtered by category
  const grouped = {};
  filteredCommands.forEach((c) => {
    if (!grouped[c.category]) grouped[c.category] = [];
    grouped[c.category].push(c);
  });

  let runningIndex = 0;

  return (
    <div
      id="cmd-palette-overlay"
      onClick={(e) => {
        if (e.target.id === "cmd-palette-overlay") onClose();
      }}
      className="fixed inset-0 cmd-palette-overlay z-[100] flex items-start justify-center pt-24 transition-opacity p-4 bg-black/80 backdrop-blur-sm"
    >
      <div
        id="cmd-palette"
        className="w-full max-w-xl bg-[#0e0f14] border border-[#2a2520] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-fadeInUp"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#201d1a]">
          <Search className="w-4 h-4 text-orange-500" />
          <input
            ref={inputRef}
            id="cmd-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, agents, workflows, policies..."
            className="flex-1 bg-transparent text-sm text-[#faf7f0] placeholder-[#78716c] outline-none font-mono"
            autoComplete="off"
          />
          <kbd
            onClick={onClose}
            className="text-[10px] font-mono bg-[#1a1b22] text-[#d6c5a8] px-1.5 py-0.5 rounded border border-[#2a2520] cursor-pointer"
          >
            ESC
          </kbd>
        </div>

        <div
          id="cmd-results"
          className="py-2 max-h-72 overflow-y-auto custom-scrollbar"
        >
          {filteredCommands.length === 0 ? (
            <p className="text-xs text-[#8a7f70] px-4 py-8 text-center font-mono">
              No commands matching &quot;{query}&quot;
            </p>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-3.5 py-1.5 text-[9px] font-mono text-orange-400/80 uppercase tracking-widest font-bold bg-[#0a0a0d] border-y border-[#1c1d24]">
                  {category}
                </div>
                {items.map((cmd) => {
                  const itemIndex = runningIndex++;
                  const isSelected = itemIndex === selectedIndex;
                  const Icon = cmd.icon;

                  return (
                    <button
                      key={cmd.label}
                      type="button"
                      onClick={() => cmd.action()}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-[#1c1d25] transition-colors font-mono cursor-pointer ${
                        isSelected
                          ? "bg-orange-500/15 text-orange-300"
                          : "text-[#faf7f0]"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>{cmd.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-[#201d1a] bg-[#09090c] flex justify-between items-center text-[10px] text-[#8a7f70] font-mono">
          <span>
            Use{" "}
            <kbd className="bg-[#181920] text-orange-300 px-1 rounded mx-0.5">
              ↑
            </kbd>
            <kbd className="bg-[#181920] text-orange-300 px-1 rounded mx-0.5">
              ↓
            </kbd>{" "}
            to navigate
          </span>
          <span>
            <kbd className="bg-[#181920] text-orange-300 px-1 rounded mx-0.5">
              ↵
            </kbd>{" "}
            to execute
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPaletteModal;

export { CommandPaletteModal };
