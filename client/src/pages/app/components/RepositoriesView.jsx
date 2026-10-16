import { Plus, ArrowRight, FolderGit2 } from "lucide-react";

const RepositoriesView = ({ onOpenConnectModal }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
            Repositories
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            Manage connected codebases and vector artifact storage
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenConnectModal}
          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(249,115,22,0.35)] flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Connect Repository
        </button>
      </div>

      {/* Setup Flow Banner */}
      <div className="bg-linear-to-r from-[#14120f] via-[#1a1510] to-dark-card border border-orange-500/35 rounded-xl p-8 shadow-[0_4px_30px_rgba(249,115,22,0.1)]">
        <h2 className="text-base font-bold text-cream-100 mb-1.5 font-mono">
          Connect a New Codebase to PRAXIS Engine
        </h2>
        <p className="text-xs text-[#d6c5a8] mb-6 font-sans">
          Guided secure authorization, AST tree generation, and RAG chunk
          indexing.
        </p>

        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <div className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded-full font-bold flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-orange-500 text-black text-[10px] font-bold flex items-center justify-center">
              1
            </span>{" "}
            Provider
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#524c45]" />
          <div className="px-3 py-1.5 bg-dark-base border border-dark-border text-[#8a7f70] rounded-full flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#181920] flex items-center justify-center text-[10px]">
              2
            </span>{" "}
            OAuth
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#524c45]" />
          <div className="px-3 py-1.5 bg-dark-base border border-dark-border text-[#8a7f70] rounded-full flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#181920] flex items-center justify-center text-[10px]">
              3
            </span>{" "}
            Select Repo
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#524c45]" />
          <div className="px-3 py-1.5 bg-dark-base border border-dark-border text-[#8a7f70] rounded-full flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#181920] flex items-center justify-center text-[10px]">
              4
            </span>{" "}
            Configure OKF
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#524c45]" />
          <div className="px-3 py-1.5 bg-dark-base border border-dark-border text-[#8a7f70] rounded-full flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#181920] flex items-center justify-center text-[10px]">
              5
            </span>{" "}
            Ingest RAG
          </div>
        </div>
      </div>

      {/* Connected Repos */}
      <div>
        <h3 className="text-xs font-bold text-cream-100 uppercase font-mono mb-4">
          Connected Codebases (3)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-card border border-[#201d1a] hover:border-orange-500/40 rounded-xl p-5 transition-all shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-cream-100 font-bold font-mono">
                    payments-api
                  </h4>
                  <p className="text-[11px] text-[#8a7f70] font-mono">
                    github.com/acme/payments-api
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Synced
              </span>
            </div>
            <div className="text-xs font-mono text-[#a89f91] space-y-1">
              <div>
                Default Branch: <span className="text-cream-100">main</span>
              </div>
              <div>
                RAG Chunks:{" "}
                <span className="text-orange-400 font-bold">
                  48,291 vectors
                </span>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-[#201d1a] hover:border-orange-500/40 rounded-xl p-5 transition-all shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-cream-100 font-bold font-mono">
                    auth-service
                  </h4>
                  <p className="text-[11px] text-[#8a7f70] font-mono">
                    gitlab.com/acme/auth-service
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Synced
              </span>
            </div>
            <div className="text-xs font-mono text-[#a89f91] space-y-1">
              <div>
                Default Branch: <span className="text-cream-100">develop</span>
              </div>
              <div>
                RAG Chunks:{" "}
                <span className="text-orange-400 font-bold">
                  22,109 vectors
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoriesView;

export { RepositoriesView };
