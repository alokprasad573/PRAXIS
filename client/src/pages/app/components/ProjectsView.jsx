import { Plus, FolderGit2 } from "lucide-react";

const ProjectsView = ({
  projects = [],
  onNavigate,
  onOpenConnectModal,
  onOpenNewWorkflow,
}) => {
  const getLangColor = (lang) => {
    if (!lang) return "bg-orange-500";
    switch (lang.toLowerCase()) {
      case "node.js":
        return "bg-emerald-500";
      case "typescript":
        return "bg-orange-400";
      case "go":
        return "bg-amber-400";
      case "python":
        return "bg-yellow-400";
      default:
        return "bg-orange-500";
    }
  };

  const getHealthBadge = (status) => {
    switch (status) {
      case "healthy":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Healthy
          </span>
        );
      case "warning":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Warning
          </span>
        );
      case "error":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Error
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
            Active
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#faf7f0] tracking-tight">
            Connected Projects
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            {projects.length} repositories indexed into RAG & vector memory
          </p>
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={onOpenConnectModal}
            className="bg-[#14151b] hover:bg-[#1c1d25] text-[#faf7f0] px-3.5 py-2 rounded-lg transition-colors border border-[#282420] flex items-center gap-1.5 cursor-pointer"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-orange-400" /> Connect
            GitHub
          </button>
          <button
            type="button"
            onClick={onOpenConnectModal}
            className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Connect Repository
          </button>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((p) => {
          const lang = p.language || p.lang || "Node.js";
          const health = p.health || p.status || "healthy";
          const agentsCount =
            p.agents !== undefined ? p.agents : p.agentsActive || 0;
          const chunkCount =
            p.ragChunks !== undefined ? p.ragChunks : p.chunks || 0;
          const lastTime = p.lastWorkflow || p.lastActive || "recently";

          return (
            <div
              key={p.id}
              className="bg-[#0e0f14] border border-[#201d1a] hover:border-orange-500/40 rounded-xl p-6 transition-all hover:shadow-[0_4px_20px_rgba(249,115,22,0.1)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${getLangColor(
                        lang,
                      )}`}
                    />
                    <h3 className="text-base font-bold text-[#faf7f0] font-mono">
                      {p.name}
                    </h3>
                  </div>
                  <div>{getHealthBadge(health)}</div>
                </div>

                <div className="text-xs font-mono text-[#a89f91] mb-5 flex items-center gap-4 flex-wrap">
                  <span className="text-[#d6c5a8]">{p.repo}</span>
                  <span className="text-[#524c45]">•</span>
                  <span>
                    Branch: <b className="text-[#faf7f0]">{p.branch}</b>
                  </span>
                  <span className="text-[#524c45]">•</span>
                  <span>{lang}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-[#070709] border border-[#201d1a] font-mono text-xs mb-5">
                  <div>
                    <div className="text-[10px] text-[#8a7f70] uppercase">
                      Agents
                    </div>
                    <div className="text-[#faf7f0] font-bold mt-0.5">
                      {agentsCount} Active
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8a7f70] uppercase">
                      Workflows
                    </div>
                    <div className="text-[#faf7f0] font-bold mt-0.5">
                      {p.workflows || 8}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8a7f70] uppercase">
                      RAG Chunks
                    </div>
                    <div className="text-orange-400 font-bold mt-0.5">
                      {chunkCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#201d1a] flex items-center justify-between font-mono text-xs">
                <span className="text-[#8a7f70]">Last run: {lastTime}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate("workflows")}
                    className="px-3 py-1.5 rounded-lg bg-[#14151b] border border-[#282420] text-[#d6c5a8] hover:text-[#faf7f0] hover:border-orange-500/30 transition-colors cursor-pointer"
                  >
                    Workflows
                  </button>
                  <button
                    type="button"
                    onClick={onOpenNewWorkflow}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition-colors cursor-pointer"
                  >
                    Run Task
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsView;

export { ProjectsView };
