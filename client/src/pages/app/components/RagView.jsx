import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Layers,
  FileCode2,
  Cpu,
  Sparkles,
  FileCode,
  FileText,
  Shield,
  Search,
  CheckCircle2,
  GitBranch,
  FolderGit2,
  Database,
} from "lucide-react";
import { ragApi } from "../../../utils/apiService";

const RagView = ({
  sources = [],
  projects = [],
  activeProject = null,
  onSelectProject,
  onToast,
  onUpdateProject,
}) => {
  const initialProjectId =
    activeProject?._id ||
    activeProject?.id ||
    (projects.length > 0 ? projects[0]._id || projects[0].id : null);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [currentSources, setCurrentSources] = useState(sources || []);
  const [isLoadingSources, setIsLoadingSources] = useState(
    Boolean(initialProjectId && (!sources || sources.length === 0)),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);

  // Adjust state during render when sources prop arrives (React recommended pattern)
  const [prevSources, setPrevSources] = useState(sources);
  if (sources !== prevSources) {
    setPrevSources(sources);
    if (sources && sources.length > 0 && currentSources.length === 0) {
      setCurrentSources(sources);
      setIsLoadingSources(false);
    }
  }

  const activeProjectId = activeProject?._id || activeProject?.id;
  const [previousActiveProjectId, setPreviousActiveProjectId] =
    useState(activeProjectId);

  // Adjust local selection when the parent changes the active project.
  if (activeProjectId && activeProjectId !== previousActiveProjectId) {
    setPreviousActiveProjectId(activeProjectId);
    setSelectedProjectId(activeProjectId);
    setSearchResults([]);
    setSearchQuery("");
    setIsLoadingSources(true);
  } else if (!activeProjectId && projects.length > 0 && !selectedProjectId) {
    setSelectedProjectId(projects[0]._id || projects[0].id);
    setIsLoadingSources(true);
  }

  // Auto-switch away if currently selected project was deleted/delinked
  if (
    selectedProjectId &&
    projects.length > 0 &&
    !projects.some((p) => (p._id || p.id) === selectedProjectId)
  ) {
    const nextId = projects[0]._id || projects[0].id || null;
    setSelectedProjectId(nextId);
    setSearchResults([]);
    setSearchQuery("");
    setIsLoadingSources(Boolean(nextId));
  } else if (projects.length === 0 && selectedProjectId) {
    setSelectedProjectId(null);
    setCurrentSources([]);
    setSearchResults([]);
    setIsLoadingSources(false);
  }

  // Find active project object
  const currentProject =
    projects.find((p) => (p._id || p.id) === selectedProjectId) ||
    activeProject ||
    (projects.length > 0 ? projects[0] : null);

  // Load real RAG sources for the selected repository
  const loadSources = useCallback(
    async (projectId) => {
      if (!projectId) {
        setCurrentSources([]);
        return;
      }
      setIsLoadingSources(true);
      try {
        const res = await ragApi.getSources(projectId);
        if (res?.success && Array.isArray(res.data)) {
          setCurrentSources(res.data);
          const computedTotal = res.data.reduce(
            (acc, s) => acc + (s.chunks || 0),
            0,
          );
          if (onUpdateProject) {
            onUpdateProject({
              id: projectId,
              _id: projectId,
              ragChunks: computedTotal,
            });
          }
        } else {
          setCurrentSources([]);
          if (onUpdateProject) {
            onUpdateProject({ id: projectId, _id: projectId, ragChunks: 0 });
          }
        }
      } catch (err) {
        console.error("Failed to load repository RAG sources:", err);
        setCurrentSources([]);
      } finally {
        setIsLoadingSources(false);
      }
    },
    [onUpdateProject],
  );

  // Fetch sources when selected project changes
  useEffect(() => {
    if (!selectedProjectId) return;

    let ignore = false;
    const fetchSources = async () => {
      try {
        const res = await ragApi.getSources(selectedProjectId);
        if (!ignore) {
          if (res?.success && Array.isArray(res.data)) {
            setCurrentSources(res.data);
            const computedTotal = res.data.reduce(
              (acc, s) => acc + (s.chunks || 0),
              0,
            );
            if (onUpdateProject) {
              onUpdateProject({
                id: selectedProjectId,
                _id: selectedProjectId,
                ragChunks: computedTotal,
              });
            }
          } else {
            setCurrentSources([]);
            if (onUpdateProject) {
              onUpdateProject({
                id: selectedProjectId,
                _id: selectedProjectId,
                ragChunks: 0,
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load repository RAG sources:", err);
        if (!ignore) setCurrentSources([]);
      } finally {
        if (!ignore) setIsLoadingSources(false);
      }
    };

    fetchSources();
    return () => {
      ignore = true;
    };
  }, [selectedProjectId, onUpdateProject]);

  // Handle switching repository
  const handleProjectChange = (e) => {
    const newId = e.target.value;
    setSelectedProjectId(newId);
    setSearchResults([]);
    setSearchQuery("");
    const found = projects.find((p) => (p._id || p.id) === newId);
    setIsLoadingSources(true);
    if (found && onSelectProject) {
      onSelectProject(found);
    }
  };

  // Live Semantic Vector Search strictly scoped to this repository
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await ragApi.queryVector(
        searchQuery.trim(),
        0.05,
        6,
        selectedProjectId,
      );
      if (res?.success && Array.isArray(res.data)) {
        setSearchResults(res.data);
        if (res.data.length === 0 && onToast) {
          onToast("No matching vectors found in this repository.", "info");
        }
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Vector search failed:", err);
      if (onToast)
        onToast("Vector search error. Check MongoDB connection.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger repository indexing
  const handleReindex = async () => {
    if (!selectedProjectId) {
      if (onToast) onToast("Please select a repository first.", "error");
      return;
    }

    setIsReindexing(true);
    try {
      const res = await ragApi.reindex(selectedProjectId);
      if (res?.success) {
        if (onToast)
          onToast(
            res.message || "Repository vector indexing completed!",
            "success",
          );
        await loadSources(selectedProjectId);
        if (onUpdateProject) {
          onUpdateProject(
            res.project || {
              id: selectedProjectId,
              _id: selectedProjectId,
              ragChunks: res.chunksCount,
            },
          );
        }
        if (searchQuery.trim()) {
          handleSearch();
        }
      } else {
        if (onToast) onToast(res?.message || "Re-indexing failed.", "error");
      }
    } catch (err) {
      console.error("Reindex error:", err);
      if (onToast)
        onToast(
          "Re-indexing failed: " + (err.message || "Server error"),
          "error",
        );
    } finally {
      setIsReindexing(false);
    }
  };

  // Real chunks calculations - Zero mock data
  const totalChunks = currentSources.reduce(
    (acc, s) => acc + (s.chunks || 0),
    0,
  );
  const codeSourcesCount = currentSources.filter(
    (s) => s.type === "code",
  ).length;

  const getSourceIcon = (type) => {
    if (type === "code")
      return <FileCode className="w-3.5 h-3.5 text-orange-400" />;
    if (type === "okf_policy")
      return <Shield className="w-3.5 h-3.5 text-[#fef08a]" />;
    return <FileText className="w-3.5 h-3.5 text-amber-400" />;
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Top Header & Repository Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
              RAG Knowledge Base
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-wider bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30 font-bold">
              80% Context Layer
            </span>
          </div>
          <p className="text-xs text-[#b8ab97] font-mono">
            MongoDB Vector Search + Deterministic Mathematical Vector Space
            Engine (384 dims, L2-Normalized) isolated per repository.
          </p>
        </div>

        {/* Repository Switcher & Index Actions */}
        <div className="flex items-center gap-2.5">
          {projects.length > 0 && (
            <div className="flex items-center gap-2 bg-dark-card border border-[#2c2822] rounded-lg px-3 py-1.5 text-xs font-mono">
              <FolderGit2 className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="text-[#8a7f70] text-[11px] hidden sm:inline">
                Repo:
              </span>
              <select
                value={selectedProjectId || ""}
                onChange={handleProjectChange}
                className="bg-transparent text-cream-100 font-bold focus:outline-none cursor-pointer"
              >
                {projects.map((p) => {
                  const pid = p._id || p.id;
                  return (
                    <option
                      key={pid}
                      value={pid}
                      className="bg-[#181920] text-cream-100"
                    >
                      {p.name} ({p.branch || "main"})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handleReindex}
            disabled={isReindexing || !selectedProjectId}
            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isReindexing ? "animate-spin" : ""}`}
            />
            {isReindexing ? "Refreshing Vectors..." : "Refresh Indexing"}
          </button>
        </div>
      </div>

      {/* Active Repository Indicator Bar */}
      {currentProject && (
        <div className="bg-dark-card border border-[#201d1a] rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-[#8a7f70]">Target Repository:</span>
            <span className="text-cream-100 font-bold flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-orange-400" />
              {currentProject.name}
            </span>
            <span className="text-[#3c3730]">|</span>
            <span className="text-[#a89f91] flex items-center gap-1">
              <GitBranch className="w-3 h-3 text-amber-400" />
              {currentProject.branch || "main"}
            </span>
            <span className="text-[#3c3730]">|</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#201d1a] text-orange-300 border border-[#2c2822]">
              {currentProject.language || "JavaScript"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-[#8a7f70]">Vector Scope:</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              Isolated ({currentProject.name})
            </span>
          </div>
        </div>
      )}

      {/* RAG (80%) vs OKF (20%) Split Visualizer */}
      <div className="bg-dark-card border border-[#201d1a] rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold font-mono text-cream-100 uppercase tracking-wider">
            Agent Context Ingestion Architecture
          </h3>
          <span className="text-[10px] font-mono text-orange-400">
            Vector Dimension: 384 Float64 / L2 Normalized
          </span>
        </div>
        <div className="flex h-7 rounded-lg overflow-hidden font-mono text-xs font-bold shadow-inner mb-4 border border-[#201d1a]">
          <div className="bg-linear-to-r from-orange-600 to-amber-600 w-4/5 flex items-center justify-center text-white border-r border-dark-base shadow-sm">
            Dynamic RAG Vectors (80% Repository Context)
          </div>
          <div className="bg-[#24211d] text-[#fef08a] w-1/5 flex items-center justify-center border-l border-[#3a352e]">
            OKF Guardrails (20%)
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="bg-dark-base p-3.5 rounded-lg border border-[#201d1a]">
            <span className="text-orange-400 font-mono font-bold block mb-1">
              RAG (80%): Repository Source Code ASTs
            </span>
            <p className="text-[#b8ab97] text-[11px] leading-relaxed">
              Functions, classes, endpoints, and schema declarations parsed
              strictly from {currentProject?.name || "this repository"}.
            </p>
          </div>
          <div className="bg-dark-base p-3.5 rounded-lg border border-[#201d1a]">
            <span className="text-[#fef08a] font-mono font-bold block mb-1">
              OKF (20%): Deterministic Governance Rules
            </span>
            <p className="text-[#b8ab97] text-[11px] leading-relaxed">
              Strict repository governance rules, test coverage thresholds, and
              deployment gates for {currentProject?.name || "this repository"}.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Real Data Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4 flex items-center gap-4 hover:border-orange-500/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#a89f91] font-mono">
              Total Vector Chunks
            </div>
            <div className="text-xl font-bold text-cream-100 font-mono">
              {totalChunks.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4 flex items-center gap-4 hover:border-orange-500/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#a89f91] font-mono">
              Source Files Indexed
            </div>
            <div className="text-xl font-bold text-cream-100 font-mono">
              {codeSourcesCount} {codeSourcesCount === 1 ? "File" : "Files"}
            </div>
          </div>
        </div>

        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4 flex items-center gap-4 hover:border-orange-500/30 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#a89f91] font-mono">
              Vector Space Engine
            </div>
            <div className="text-xs font-bold text-cream-100 font-mono">
              Deterministic 384-Dim (0ms Local)
            </div>
          </div>
        </div>
      </div>

      {/* Semantic Search + Knowledge Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Semantic Search Explorer */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-dark-card border border-[#201d1a] rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-bold font-mono text-cream-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" /> Repository
              Semantic Search
            </h3>
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                id="rag-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${currentProject?.name || "codebase"}...`}
                className="w-full bg-dark-base border border-[#282420] rounded-lg p-3 pr-20 text-xs font-mono text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none placeholder:text-[#524c45]"
              />
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-1.5 top-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                {isSearching ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Search className="w-3 h-3" />
                )}
                Search
              </button>
            </form>

            <div className="space-y-3">
              {isSearching ? (
                <div className="text-center py-6 text-xs text-[#8a7f70] font-mono flex flex-col items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-orange-400" />
                  Calculating cosine similarity against{" "}
                  {currentProject?.name || "repository"} vectors...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result, idx) => {
                  const scorePercent = ((result.score || 0.85) * 100).toFixed(
                    1,
                  );
                  return (
                    <div
                      key={result._id || result.id || idx}
                      className="border border-dark-border bg-dark-base rounded-xl p-3.5 hover:border-orange-500/30 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-mono font-bold text-cream-100 flex items-center gap-1.5 truncate max-w-45">
                          {getSourceIcon(result.category)}
                          {result.title || result.source}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.5 rounded shrink-0">
                          Score: {scorePercent}%
                        </span>
                      </div>
                      <p className="text-xs text-[#a89f91] font-mono line-clamp-3 mt-1.5 bg-dark-card p-2 rounded border border-[#1f1c19] text-[11px] leading-relaxed">
                        {result.content}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#7a7164]">
                        <span className="uppercase text-orange-400/80 font-bold">
                          {result.category || "code"}
                        </span>
                        <span className="truncate max-w-37.5">
                          {result.source}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-[#8a7f70] font-mono">
                  {totalChunks === 0 ? (
                    <span>
                      No vectors indexed yet. Click &quot;Refresh Indexing&quot;
                      to parse code files.
                    </span>
                  ) : searchQuery ? (
                    <span>
                      No matching code vectors found for &quot;{searchQuery}
                      &quot;.
                    </span>
                  ) : (
                    <span>
                      Enter a query above to test semantic similarity search in
                      this repository.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real Knowledge Sources Table */}
        <div className="lg:col-span-2">
          <div className="bg-dark-card border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#201d1a] flex items-center justify-between bg-[#121319]">
              <div>
                <h3 className="text-xs font-bold font-mono text-cream-100 uppercase tracking-wider">
                  Indexed Files in {currentProject?.name || "Repository"}
                </h3>
                <span className="text-[10px] text-[#7a7164] font-mono">
                  {totalChunks} vector chunks indexed in MongoDB
                </span>
              </div>
            </div>

            {isLoadingSources ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs font-mono text-[#8a7f70]">
                <RefreshCw className="w-5 h-5 animate-spin text-orange-400" />
                Loading repository vector sources...
              </div>
            ) : currentSources.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-cream-100 font-mono">
                    No Code Vectors Indexed for{" "}
                    {currentProject?.name || "this repository"}
                  </h4>
                  <p className="text-xs text-[#8a7f70] font-mono mt-1 max-w-md mx-auto">
                    Index repository files from GitHub or local disk to parse
                    and store 384-dimensional vector embeddings.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleReindex}
                    disabled={isReindexing}
                    className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-5 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isReindexing ? "animate-spin" : ""}`}
                    />
                    {isReindexing
                      ? "Refreshing Vectors..."
                      : `Refresh Indexing`}
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-dark-base text-[#a89f91] font-mono uppercase tracking-wider border-b border-[#201d1a]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Source File</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Chunks</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Indexed</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#201d1a] text-cream-100 font-mono">
                  {currentSources.map((s, idx) => (
                    <tr
                      key={s.name || idx}
                      className="hover:bg-[#14151b] transition-colors"
                    >
                      <td className="px-4 py-3.5 font-bold flex items-center gap-2">
                        {getSourceIcon(s.type)}
                        <span className="truncate max-w-55" title={s.name}>
                          {s.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#a89f91]">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#201d1a] uppercase text-[#a89f91] border border-[#2d2822]">
                          {s.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-orange-300">
                        {(s.chunks || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          {s.status || "indexed"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#8a7f70]">
                        {s.lastUpdated || "Recently"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={handleReindex}
                          className="text-[#a89f91] hover:text-orange-400 p-1 transition-colors cursor-pointer"
                          title="Re-index repository"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RagView;
export { RagView };
