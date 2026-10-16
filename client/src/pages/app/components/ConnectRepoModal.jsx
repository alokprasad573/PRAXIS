import { useState } from "react";
import { GitBranch, X } from "lucide-react";

const ConnectRepoModal = ({ isOpen, onClose, onAddProject }) => {
  const [repoUrl, setRepoUrl] = useState("https://github.com/acme/new-microservice");
  const [branch, setBranch] = useState("main");
  const [ingestAst, setIngestAst] = useState(true);
  const [ingestDocs, setIngestDocs] = useState(true);
  const [enableOkf, setEnableOkf] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parts = repoUrl.split("/");
    const repoName = parts[parts.length - 1] || "custom-repo";

    const newProject = {
      id: `proj-${Date.now()}`,
      name: repoName,
      repo: repoUrl.replace("https://", ""),
      branch,
      language: "TypeScript",
      framework: "Node.js",
      health: "healthy",
      ragStatus: "indexed",
      agents: 2,
      workflows: 1,
      lastWorkflow: "Just now",
      ragChunks: 12400,
      lastIndexed: new Date().toISOString(),
    };

    if (onAddProject) onAddProject(newProject);
    onClose();
  };

  return (
    <div
      id="modal-connect-repo"
      onClick={(e) => {
        if (e.target.id === "modal-connect-repo") onClose();
      }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity"
    >
      <div className="w-full max-w-lg bg-[#0e0f14] border border-[#2a2520] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-mono animate-fadeInUp">
        <div className="flex items-center justify-between p-5 border-b border-[#201d1a] bg-[#121319]">
          <h2 className="text-base font-bold text-[#faf7f0] flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-orange-500" />
            Connect Repository to RAG
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8a7f70] hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block uppercase text-[#d6c5a8] mb-1.5 font-bold text-[10px]">
              Repository URL
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full bg-[#070709] border border-[#282420] rounded-lg p-2.5 text-[#faf7f0] focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block uppercase text-[#d6c5a8] mb-1.5 font-bold text-[10px]">
              Default Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-[#070709] border border-[#282420] rounded-lg p-2.5 text-[#faf7f0] focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>
          <div className="space-y-2 pt-2">
            <label className="block uppercase text-[#d6c5a8] mb-1 font-bold text-[10px]">
              Indexing Options
            </label>
            <label className="flex items-center gap-2 text-[#d6c5a8] cursor-pointer">
              <input
                type="checkbox"
                checked={ingestAst}
                onChange={(e) => setIngestAst(e.target.checked)}
                className="accent-orange-500"
              />{" "}
              Ingest source code AST & extract vector embeddings
            </label>
            <label className="flex items-center gap-2 text-[#d6c5a8] cursor-pointer">
              <input
                type="checkbox"
                checked={ingestDocs}
                onChange={(e) => setIngestDocs(e.target.checked)}
                className="accent-orange-500"
              />{" "}
              Ingest markdown documentation & OpenAPI specs
            </label>
            <label className="flex items-center gap-2 text-[#d6c5a8] cursor-pointer">
              <input
                type="checkbox"
                checked={enableOkf}
                onChange={(e) => setEnableOkf(e.target.checked)}
                className="accent-orange-500"
              />{" "}
              Enable OKF deterministic rule checks
            </label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-[#201d1a]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-[#282420] text-[#a89f91] hover:bg-[#14151b] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-[0_0_12px_rgba(249,115,22,0.3)] cursor-pointer transition-all"
            >
              Start Ingestion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectRepoModal;

export { ConnectRepoModal };
