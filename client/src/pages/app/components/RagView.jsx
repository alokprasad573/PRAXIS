import { useState } from "react";
import {
  RefreshCw,
  Layers,
  FileCode2,
  Cpu,
  Sparkles,
  FileCode,
  FileText,
  Search,
  Plus,
} from "lucide-react";

const RagView = ({ sources = [], onToast }) => {
  const [searchQuery, setSearchQuery] = useState(
    "How is authentication middleware implemented?",
  );

  const defaultSources = [
    {
      name: "Core Source Code",
      type: "code",
      chunks: 28441,
      status: "indexed",
      lastUpdated: "10 mins ago",
      size: "14.2 MB",
      icon: "code-2",
    },
    {
      name: "API Documentation & OpenAPI",
      type: "docs",
      chunks: 8122,
      status: "indexed",
      lastUpdated: "1 hr ago",
      size: "2.1 MB",
      icon: "file-text",
    },
    {
      name: "Architecture Decision Records (ADRs)",
      type: "docs",
      chunks: 3204,
      status: "indexed",
      lastUpdated: "Yesterday",
      size: "0.8 MB",
      icon: "layers",
    },
    {
      name: "README & Developer Guides",
      type: "docs",
      chunks: 1842,
      status: "indexed",
      lastUpdated: "2 days ago",
      size: "0.4 MB",
      icon: "book-open",
    },
    {
      name: "Previous Agent Output Artifacts",
      type: "artifacts",
      chunks: 4122,
      status: "indexed",
      lastUpdated: "Just now",
      size: "1.1 MB",
      icon: "file-code",
    },
    {
      name: "Production Telemetry & Logs",
      type: "logs",
      chunks: 2560,
      status: "indexing",
      lastUpdated: "Active",
      size: "0.6 MB",
      icon: "scroll",
    },
  ];

  const displaySources = sources.length > 0 ? sources : defaultSources;

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-3xl font-extrabold text-[#faf7f0] tracking-tight">
              RAG Knowledge Base
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-wider bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30 font-bold">
              80% Context Layer
            </span>
          </div>
          <p className="text-xs text-[#b8ab97] font-mono">
            Vector-indexed dynamic project intelligence injected into agent prompts before execution.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToast && onToast("RAG indexing pipeline triggered", "info")}
          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-index All Chunks
        </button>
      </div>

      {/* RAG (80%) vs OKF (20%) Split Visualizer */}
      <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider">
            Agent Context Ingestion Architecture
          </h3>
          <span className="text-[10px] font-mono text-orange-400">
            Total Tokens: 124,500
          </span>
        </div>
        <div className="flex h-7 rounded-lg overflow-hidden font-mono text-xs font-bold shadow-inner mb-4 border border-[#201d1a]">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 w-4/5 flex items-center justify-center text-white border-r border-[#070709] shadow-sm">
            Dynamic RAG Vectors (80%)
          </div>
          <div className="bg-[#24211d] text-[#fef08a] w-1/5 flex items-center justify-center border-l border-[#3a352e]">
            OKF Rules (20%)
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="bg-[#070709] p-3.5 rounded-lg border border-[#201d1a]">
            <span className="text-orange-400 font-mono font-bold block mb-1">
              RAG (80%): Unstructured Project Knowledge
            </span>
            <p className="text-[#b8ab97] text-[11px] leading-relaxed">
              Source code ASTs, API schemas, PR history, architecture ADRs, previous agent execution transcripts.
            </p>
          </div>
          <div className="bg-[#070709] p-3.5 rounded-lg border border-[#201d1a]">
            <span className="text-[#fef08a] font-mono font-bold block mb-1">
              OKF (20%): Deterministic Governance Rules
            </span>
            <p className="text-[#b8ab97] text-[11px] leading-relaxed">
              Security policies, database mutate guards, coverage minimums, direct-push blocks, human approval gates.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-4 flex items-center gap-4 hover:border-orange-500/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#a89f91] font-mono">
              Total Vector Chunks
            </div>
            <div className="text-xl font-bold text-[#faf7f0] font-mono">
              48,291
            </div>
          </div>
        </div>

        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-4 flex items-center gap-4 hover:border-orange-500/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#a89f91] font-mono">
              Files Fully Indexed
            </div>
            <div className="text-xl font-bold text-[#faf7f0] font-mono">
              842 Files
            </div>
          </div>
        </div>

        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-4 flex items-center gap-4 hover:border-orange-500/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#a89f91] font-mono">
              Embedding Model
            </div>
            <div className="text-xs font-bold text-[#faf7f0] font-mono">
              text-embedding-3-large
            </div>
          </div>
        </div>
      </div>

      {/* Semantic Search + Knowledge Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Semantic Search Explorer */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" /> Semantic Vector Search
            </h3>
            <div className="relative mb-4">
              <input
                id="rag-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#070709] border border-[#282420] rounded-lg p-3 pr-20 text-xs font-mono text-[#faf7f0] focus:ring-1 focus:ring-orange-500 outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  onToast && onToast("Semantic search executed: 3 matches", "info")
                }
                className="absolute right-1.5 top-1.5 bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>

            <div className="space-y-3">
              <div className="border border-[#23201d] bg-[#070709] rounded-xl p-3.5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono font-bold text-[#faf7f0] flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-orange-400" /> auth/middleware.ts
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded">
                    Score: 0.94
                  </span>
                </div>
                <p className="text-xs text-[#a89f91] font-mono line-clamp-2 mt-1.5 bg-[#0e0f14] p-2 rounded border border-[#1f1c19]">
                  &quot;export const verifyJwtToken = (req, res, next) =&gt; &#123; const authHeader = req.headers.authorization...&quot;
                </p>
              </div>

              <div className="border border-[#23201d] bg-[#070709] rounded-xl p-3.5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono font-bold text-[#faf7f0] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" /> docs/security.md
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded">
                    Score: 0.88
                  </span>
                </div>
                <p className="text-xs text-[#a89f91] font-mono line-clamp-2 mt-1.5 bg-[#0e0f14] p-2 rounded border border-[#1f1c19]">
                  &quot;All API endpoints under /v1/protected require valid RS256 signed bearer tokens with session check.&quot;
                </p>
              </div>

              <div className="border border-[#23201d] bg-[#070709] rounded-xl p-3.5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono font-bold text-[#faf7f0] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#d6c5a8]" /> architecture/adrs/004.md
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#1c1d25] text-[#d6c5a8] border border-[#2c2822] px-1.5 py-0.5 rounded">
                    Score: 0.84
                  </span>
                </div>
                <p className="text-xs text-[#a89f91] font-mono line-clamp-2 mt-1.5 bg-[#0e0f14] p-2 rounded border border-[#1f1c19]">
                  &quot;ADR-004: JWT validation delegates token refresh directly to Auth0 gateway.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Sources Table */}
        <div className="lg:col-span-2">
          <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#201d1a] flex items-center justify-between bg-[#121319]">
              <h3 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider">
                Indexed Knowledge Repositories
              </h3>
              <button
                type="button"
                onClick={() => onToast && onToast("Connecting new knowledge source...", "info")}
                className="text-xs font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Source
              </button>
            </div>

            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#070709] text-[#a89f91] font-mono uppercase tracking-wider border-b border-[#201d1a]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Source Name</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Chunks</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Last Synced</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201d1a] text-[#faf7f0] font-mono">
                {displaySources.map((s) => (
                  <tr key={s.name} className="hover:bg-[#14151b] transition-colors">
                    <td className="px-4 py-3.5 font-bold flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-orange-400" /> {s.name}
                    </td>
                    <td className="px-4 py-3.5 text-[#a89f91]">{s.type}</td>
                    <td className="px-4 py-3.5 font-bold text-orange-300">
                      {s.chunks.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#8a7f70]">
                      {s.lastUpdated || "Recently"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onToast && onToast(`Source ${s.name} synced`, "success")}
                        className="text-[#a89f91] hover:text-orange-400 p-1 transition-colors cursor-pointer"
                        title="Sync now"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RagView;

export { RagView };
