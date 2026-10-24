import { useState, useEffect, useCallback } from "react";
import {
  GitBranch,
  X,
  Loader2,
  AlertCircle,
  Search,
  Lock,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { projectApi } from "../../../utils/apiService";
import { API_PATHS, BASE_URL } from "../../../utils/apiPaths";

const ConnectRepoModal = ({ isOpen, onClose, onAddProject }) => {
  const [activeTab, setActiveTab] = useState("github"); // "github" | "custom"
  const [githubState, setGithubState] = useState({
    loading: true,
    connected: false,
    username: "",
    repos: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(null);

  // Custom Form fields
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [language, setLanguage] = useState("");
  const [ingestAst, setIngestAst] = useState(true);
  const [enableOkf, setEnableOkf] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSelectRepo = useCallback((repo) => {
    setSelectedRepo(repo);
    setRepoUrl(repo.htmlUrl);
    setBranch(repo.branch || "main");
    setLanguage(repo.language || "TypeScript");
  }, []);

  // Fetch Real GitHub Repos on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchRepos = async () => {
      setGithubState((prev) => ({ ...prev, loading: true }));
      try {
        const res = await projectApi.getGithubRepos();
        if (res?.connected && Array.isArray(res?.data)) {
          setGithubState({
            loading: false,
            connected: true,
            username: res.username || "",
            repos: res.data,
          });
          if (res.data.length > 0) {
            handleSelectRepo(res.data[0]);
          }
        } else {
          setGithubState({
            loading: false,
            connected: false,
            username: "",
            repos: [],
          });
        }
      } catch (error) {
        setGithubState({
          loading: false,
          connected: false,
          username: "",
          repos: [],
        });
        setErrorMsg(
          error.response?.data?.message ||
            "Unable to load GitHub repositories. Please try again.",
        );
      }
    };

    fetchRepos();
  }, [handleSelectRepo, isOpen]);

  if (!isOpen) return null;

  const handleConnectGitHub = () => {
    // Redirects to backend OAuth trigger
    window.location.href = `${BASE_URL}${API_PATHS.AUTH.GITHUB_OAUTH}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!repoUrl.trim()) {
      setErrorMsg("Please select or enter a repository URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await projectApi.connectRepo({
        repoUrl: repoUrl.trim(),
        branch: branch.trim() || "main",
        name: selectedRepo?.name,
        language: language,
        ingestAst,
        enableOkf,
      });

      if (res.success && res.data) {
        if (onAddProject) onAddProject(res.data);
        onClose();
      } else {
        setErrorMsg(res.message || "Failed to connect repository.");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to connect repository. Ensure backend is running.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRepos = githubState.repos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      id="modal-connect-repo"
      onClick={(e) => {
        if (e.target.id === "modal-connect-repo") onClose();
      }}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-100 flex items-center justify-center p-4 transition-opacity font-mono"
    >
      <div className="w-full max-w-3xl bg-[#0b0c10] border border-[#2a2520] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-fadeInUp flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#201d1a] bg-[#101218]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-cream-100">
                Connect Repository to PRAXIS RAG
              </h2>
              <p className="text-[11px] text-[#8a7f70]">
                Live AST indexing & Vector Memory ingestion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8a7f70] hover:text-white p-1 rounded-lg hover:bg-[#1a1c24] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#201d1a] bg-dark-card px-5 pt-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab("github")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "github"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-[#8a7f70] hover:text-cream-100"
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Your GitHub Repositories
            {githubState.connected && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                Connected
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "custom"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-[#8a7f70] hover:text-cream-100"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Custom Git URL
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === "github" ? (
            <div>
              {githubState.loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-[#8a7f70] gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  <span>Fetching your repositories from GitHub API...</span>
                </div>
              ) : !githubState.connected ? (
                <div className="py-8 px-4 text-center border border-dashed border-[#2a2520] rounded-xl bg-[#0f1016] flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#161820] border border-[#2a2520] flex items-center justify-center mb-3 text-orange-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-cream-100 mb-1">
                    Connect GitHub to Access Repositories
                  </h3>
                  <p className="text-[11px] text-[#8a7f70] max-w-sm mb-4">
                    Authorize PRAXIS with repo permissions to load your private
                    and public repositories automatically.
                  </p>
                  <button
                    type="button"
                    onClick={handleConnectGitHub}
                    className="bg-[#181a24] hover:bg-[#222533] text-white px-4 py-2 rounded-lg font-bold border border-orange-500/40 text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    Authorize with GitHub
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#8a7f70] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder={`Search ${githubState.repos.length} repositories of @${githubState.username}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-dark-base border border-[#282420] rounded-lg pl-9 pr-3 py-2 text-xs text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  {/* Repositories List */}
                  <div className="border border-[#201d1a] rounded-xl divide-y divide-[#1b1916] max-h-56 overflow-y-auto custom-scrollbar bg-dark-base">
                    {filteredRepos.length === 0 ? (
                      <div className="p-4 text-center text-[#8a7f70]">
                        No repositories matching "{searchQuery}"
                      </div>
                    ) : (
                      filteredRepos.map((r) => {
                        const isSelected = selectedRepo?.id === r.id;
                        return (
                          <div
                            key={r.id}
                            onClick={() => handleSelectRepo(r)}
                            className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-orange-500/10 border-l-2 border-orange-500"
                                : "hover:bg-[#101218]"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-cream-100 text-xs truncate">
                                  {r.name}
                                </span>
                                {r.isPrivate ? (
                                  <span className="text-[9px] px-1.5 py-0.2 bg-dark-card border border-[#332e27] text-[#a89f91] rounded">
                                    Private
                                  </span>
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded">
                                    Public
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#8a7f70] truncate mt-0.5">
                                {r.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 text-[10px] text-[#8a7f70]">
                              {r.language && (
                                <span className="text-orange-400">
                                  {r.language}
                                </span>
                              )}
                              {isSelected ? (
                                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block uppercase text-[#d6c5a8] mb-1.5 font-bold text-[10px]">
                Repository Clone / HTTPS URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setSelectedRepo(null);
                }}
                placeholder="https://github.com/facebook/react.git"
                className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          )}

          {/* Configuration Inputs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block uppercase text-[#d6c5a8] mb-1.5 font-bold text-[10px]">
                Default Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-dark-base border border-[#282420] rounded-lg p-2 text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block uppercase text-[#d6c5a8] mb-1.5 font-bold text-[10px]">
                Language / Framework
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-dark-base border border-[#282420] rounded-lg p-2 text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Indexing Checkboxes */}
          <div className="space-y-1.5 pt-2 border-t border-[#1d1b17]">
            <label className="flex items-center gap-2 text-[#d6c5a8] cursor-pointer">
              <input
                type="checkbox"
                checked={ingestAst}
                onChange={(e) => setIngestAst(e.target.checked)}
                className="accent-orange-500"
              />{" "}
              Ingest source code AST & generate vector embeddings
            </label>
            <label className="flex items-center gap-2 text-[#d6c5a8] cursor-pointer">
              <input
                type="checkbox"
                checked={enableOkf}
                onChange={(e) => setEnableOkf(e.target.checked)}
                className="accent-orange-500"
              />{" "}
              Enable OKF deterministic guardrail rules
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-[#201d1a] bg-dark-card">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2 rounded-lg border border-[#282420] text-[#a89f91] hover:bg-[#14151b] cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !repoUrl}
            className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-[0_0_12px_rgba(249,115,22,0.3)] cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Ingesting Codebase into RAG...
              </>
            ) : (
              `${selectedRepo ? selectedRepo.name : "Connect & Ingest Repository"}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectRepoModal;
