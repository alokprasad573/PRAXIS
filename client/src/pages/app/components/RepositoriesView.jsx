import { useState } from "react";
import { Plus, FolderGit2, CheckCircle, ArrowRight, Trash2, Loader2, Database } from "lucide-react";

const RepositoriesView = ({
  projects = [],
  onOpenConnectModal,
  onDeleteProject,
  onNavigate,
  onSelectProject,
}) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id, name) => {
    if (!onDeleteProject) return;
    setDeletingId(id);
    try {
      await onDeleteProject(id, name);
    } finally {
      setDeletingId(null);
    }
  };

  const totalChunks = projects.reduce((acc, p) => acc + (p.ragChunks ?? 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
            Repositories
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            {projects.length} codebases connected • {totalChunks.toLocaleString()} total vectors indexed in MongoDB
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
          Guided secure authorization, AST tree generation, and RAG chunk indexing.
        </p>

        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          <div className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/40 text-orange-300 rounded-full font-bold flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-orange-500 text-black text-[10px] font-bold flex items-center justify-center">
              1
            </span>{" "}
            GitHub OAuth
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#524c45]" />
          <div className="px-3 py-1.5 bg-dark-base border border-dark-border text-[#8a7f70] rounded-full flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#181920] flex items-center justify-center text-[10px]">
              2
            </span>{" "}
            Select Real Repo
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#524c45]" />
          <div className="px-3 py-1.5 bg-dark-base border border-dark-border text-[#8a7f70] rounded-full flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#181920] flex items-center justify-center text-[10px]">
              3
            </span>{" "}
            Ingest AST into RAG
          </div>
        </div>
      </div>

      {/* Connected Repositories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-cream-100 uppercase font-mono">
            Connected Codebases ({projects.length})
          </h3>
          <span className="text-[11px] font-mono text-orange-400">
            Real DB Chunks: {totalChunks.toLocaleString()}
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-[#282420] rounded-xl bg-[#0b0c10] font-mono">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center mx-auto mb-3 text-orange-400">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-cream-100 mb-1">
              No Repositories Connected Yet
            </h4>
            <p className="text-xs text-[#8a7f70] max-w-sm mx-auto mb-4">
              Connect your original GitHub repository to begin AST indexing and multi-agent code analysis.
            </p>
            <button
              type="button"
              onClick={onOpenConnectModal}
              className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              Connect First Repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => {
              const projectId = p.id || p._id;
              const isDeleting = deletingId === projectId;
              const chunkCount = p.ragChunks ?? 0;

              return (
                <div
                  key={projectId}
                  className="bg-dark-card border border-[#201d1a] hover:border-orange-500/40 rounded-xl p-5 transition-all shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                          <FolderGit2 className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-cream-100 font-bold font-mono truncate">
                            {p.name}
                          </h4>
                          <p className="text-[11px] text-[#8a7f70] font-mono truncate">
                            {p.repo}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border ${
                          chunkCount > 0
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        }`}>
                          <CheckCircle className="w-3 h-3" />
                          {chunkCount > 0 ? "Indexed" : "Pending Index"}
                        </span>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(projectId, p.name)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-lg text-[#8a7f70] hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
                          title="Disconnect and delete repository from DB"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-[#a89f91] space-y-1.5 pt-2 border-t border-[#1b1916]">
                      <div className="flex justify-between">
                        <span>Default Branch:</span>
                        <span className="text-cream-100 font-bold">{p.branch || "main"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Language:</span>
                        <span className="text-orange-400">{p.language || "TypeScript"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>RAG Chunks:</span>
                        <span className="text-orange-300 font-bold flex items-center gap-1">
                          <Database className="w-3 h-3 text-orange-400" />
                          {chunkCount.toLocaleString()} vectors
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3.5 mt-3 border-t border-[#201d1a] flex items-center justify-between font-mono text-xs">
                    <span className="text-[11px] text-[#78716c]">
                      Status: <b className="text-cream-100">{chunkCount > 0 ? "Active in RAG" : "Not yet indexed"}</b>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectProject) onSelectProject(p);
                        if (onNavigate) onNavigate("rag");
                      }}
                      className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-bold cursor-pointer"
                    >
                      {chunkCount > 0 ? "View Vectors" : "Index in RAG"} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoriesView;
export { RepositoriesView };
