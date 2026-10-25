import { useState, useEffect } from "react";
import {
  Plus,
  ShieldCheck,
  FolderGit2,
  GitBranch,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import { okfApi } from "../../../utils/apiService";

const EMPTY_POLICIES = [];

const OkfView = ({
  policies = EMPTY_POLICIES,
  projects = [],
  activeProject = null,
  onSelectProject,
  onToast,
}) => {
  const activeProjectId = activeProject?._id || activeProject?.id || null;
  const firstProjectId =
    projects.length > 0 ? projects[0]._id || projects[0].id : null;
  const initialProjectId = activeProjectId || firstProjectId || null;

  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [localPolicies, setLocalPolicies] = useState(policies || []);
  const [isLoading, setIsLoading] = useState(
    Boolean(initialProjectId && (!policies || policies.length === 0)),
  );
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Add Rule Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);
  const [ruleFormData, setRuleFormData] = useState({
    name: "",
    category: "Security Policies",
    risk: "high",
    description: "",
    rule: '// Deterministic assertion rule\nif (condition) {\n  return blockAction("Reason for block");\n}',
  });

  const [previousActiveProjectId, setPreviousActiveProjectId] = useState(activeProjectId);
  const [prevPolicies, setPrevPolicies] = useState(policies);

  // Sync when parent provides new policies prop
  if (policies !== prevPolicies) {
    setPrevPolicies(policies);
    if (Array.isArray(policies) && policies.length > 0 && localPolicies.length === 0) {
      setLocalPolicies(policies);
      setIsLoading(false);
    }
  }

  // Adjust local selection when parent changes active project
  if (activeProjectId && activeProjectId !== previousActiveProjectId) {
    setPreviousActiveProjectId(activeProjectId);
    setSelectedProjectId(activeProjectId);
    setIsLoading(true);
  } else if (!activeProjectId && projects.length > 0 && !selectedProjectId) {
    setSelectedProjectId(projects[0]._id || projects[0].id);
    setIsLoading(true);
  }

  // Auto-switch away if currently selected project was deleted/delinked
  if (selectedProjectId && projects.length > 0 && !projects.some((p) => (p._id || p.id) === selectedProjectId)) {
    const nextId = projects[0]._id || projects[0].id || null;
    setSelectedProjectId(nextId);
    setIsLoading(Boolean(nextId));
  } else if (projects.length === 0 && selectedProjectId) {
    setSelectedProjectId(null);
    setLocalPolicies([]);
    setIsLoading(false);
  }

  const currentProject =
    projects.find((p) => (p._id || p.id) === selectedProjectId) ||
    activeProject ||
    (projects.length > 0 ? projects[0] : null);

  // Fetch real policies strictly for the selected repository
  useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    let ignore = false;
    const fetchPolicies = async () => {
      setIsLoading(true);
      try {
        const res = await okfApi.getPolicies(selectedProjectId);
        if (!ignore) {
          setLocalPolicies(
            res?.success && Array.isArray(res.data) ? res.data : [],
          );
        }
      } catch (err) {
        console.error("Failed to load OKF policies:", err);
        if (!ignore) {
          setLocalPolicies(Array.isArray(policies) ? policies : []);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchPolicies();
    return () => {
      ignore = true;
    };
  }, [selectedProjectId, policies]);

  // Handle switching repository
  const handleProjectChange = (e) => {
    const newId = e.target.value;
    setSelectedProjectId(newId);
    const found = projects.find((p) => (p._id || p.id) === newId);
    setIsLoading(true);
    if (found && onSelectProject) {
      onSelectProject(found);
    }
  };

  // Toggle Policy Status
  const handleToggle = async (policy) => {
    const targetId = policy?._id || policy?.id || policy?.policyId;
    if (!targetId) return;

    setTogglingId(targetId);
    try {
      const res = await okfApi.togglePolicy(targetId);
      if (res?.success) {
        setLocalPolicies((prev) =>
          prev.map((p) => {
            const pid = p?._id || p?.id || p?.policyId;
            if (pid === targetId) {
              const updatedStatus =
                p.status === "enabled" ? "disabled" : "enabled";
              return { ...p, status: res.data?.status || updatedStatus };
            }
            return p;
          }),
        );
        if (onToast)
          onToast(
            `Policy ${policy.name || targetId} is now ${res.data?.status || "updated"}`,
            "success",
          );
      } else {
        if (onToast) onToast(res?.message || "Failed to toggle policy status", "error");
      }
    } catch (err) {
      console.error("Policy toggle error:", err);
      if (onToast) onToast("Error updating policy status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Policy
  const handleDelete = async (policy) => {
    const targetId = policy?._id || policy?.id || policy?.policyId;
    if (!targetId) return;

    if (
      !window.confirm(
        `Delete rule "${policy.name || targetId}" from ${currentProject?.name || "this repository"}?`,
      )
    ) {
      return;
    }

    setDeletingId(targetId);
    try {
      const res = await okfApi.deletePolicy(targetId);
      if (res?.success) {
        setLocalPolicies((prev) =>
          prev.filter((p) => (p?._id || p?.id || p?.policyId) !== targetId),
        );
        if (onToast) onToast(`Policy ${policy.name || targetId} deleted`, "info");
      } else {
        if (onToast) onToast(res?.message || "Failed to delete policy", "error");
      }
    } catch (err) {
      console.error("Delete policy error:", err);
      if (onToast) onToast("Error deleting policy", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Create New Policy for this repository
  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    if (!ruleFormData.name.trim() || !ruleFormData.rule.trim()) {
      if (onToast)
        onToast("Please provide policy name and rule logic.", "error");
      return;
    }

    setIsSubmittingRule(true);
    try {
      const targetProjectId = selectedProjectId || activeProjectId || firstProjectId || null;
      const res = await okfApi.createPolicy({
        ...ruleFormData,
        projectId: targetProjectId,
      });

      if (res?.success && res.data) {
        setLocalPolicies((prev) => [...prev, res.data]);
        setIsAddModalOpen(false);
        setRuleFormData({
          name: "",
          category: "Security Policies",
          risk: "high",
          description: "",
          rule: '// Deterministic assertion rule\nif (condition) {\n  return blockAction("Reason for block");\n}',
        });
        if (onToast)
          onToast(
            `Rule "${res.data.name}" added to ${currentProject?.name || "repository"}`,
            "success",
          );
      } else {
        if (onToast) onToast(res?.message || "Failed to create rule", "error");
      }
    } catch (err) {
      console.error("Rule creation error:", err);
      if (onToast)
        onToast(
          "Error creating rule: " + (err.message || "Server error"),
          "error",
        );
    } finally {
      setIsSubmittingRule(false);
    }
  };

  const handleApplyBaseline = async () => {
    const targetProjId = selectedProjectId || activeProjectId || firstProjectId;
    if (!targetProjId) {
      if (onToast) onToast("Please select a repository first", "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await okfApi.applyBaseline(targetProjId);
      if (res?.success && Array.isArray(res.data)) {
        setLocalPolicies(res.data);
        if (onToast) onToast("Standard baseline guardrails applied to repository", "success");
      } else {
        if (onToast) onToast(res?.message || "Failed to apply baseline rules", "error");
      }
    } catch (err) {
      console.error("Apply baseline error:", err);
      if (onToast) onToast("Failed to apply baseline rules", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderCode = (rule) => {
    let content;
    if (typeof rule === "string") {
      content = rule;
    } else if (rule && typeof rule === "object") {
      try {
        content = JSON.stringify(rule, null, 2);
      } catch {
        content = String(rule);
      }
    } else {
      content = "// No deterministic assertion rule defined";
    }

    return (
      <pre className="leading-relaxed font-mono text-[11px] text-cream-100">
        <code>{content}</code>
      </pre>
    );
  };

  const getRiskBadge = (risk = "medium") => {
    const r = (risk || "medium").toLowerCase();
    if (r === "high") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
          High Risk
        </span>
      );
    }
    if (r === "medium") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
          Medium Risk
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
        Low Risk
      </span>
    );
  };

  // Real calculations strictly from MongoDB
  const safePolicies = Array.isArray(localPolicies) ? localPolicies : [];
  const activeCount = safePolicies.filter(
    (p) => p?.status === "enabled",
  ).length;
  const totalInterceptions = safePolicies.reduce(
    (acc, p) => acc + (p?.triggers || 0),
    0,
  );

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
              OKF Policy Engine
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-wider bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded font-bold border border-orange-500/30">
              20% Context Layer
            </span>
          </div>
          <p className="text-xs text-[#b8ab97] font-mono">
            Organizational Knowledge Framework: Deterministic guardrails configured per repository.
          </p>
        </div>

        {/* Repository Switcher & Add Rule */}
        <div className="flex items-center gap-3">
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
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add Rule
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
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-[#8a7f70]">Policy Scope:</span>
            <span className="font-bold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded">
              Repository Specific ({currentProject.name})
            </span>
          </div>
        </div>
      )}

      {/* Info Banner & Real Stats */}
      <div className="bg-dark-card border border-[#201d1a] rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-cream-100 text-sm font-mono">
              Deterministic Guardrails for {currentProject?.name || "Repository"}
            </h3>
          </div>
          <p className="text-xs text-[#b8ab97] leading-relaxed font-sans">
            While RAG provides dynamic repository code context (80%), OKF establishes
            immutable deterministic rules (20%) that agents cannot bypass. If a policy fails,
            execution halts and invokes a Human Approval Gate.
          </p>
        </div>
        <div className="w-full md:w-1/3 shrink-0 bg-dark-base p-3.5 rounded-lg border border-dark-border font-mono text-xs">
          <div className="flex justify-between text-[11px] text-[#8a7f70] mb-2">
            <span>Active Rules:</span>
            <span className="text-orange-400 font-bold">
              {activeCount} / {safePolicies.length} Enabled
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-[#8a7f70]">
            <span>Actual Interceptions:</span>
            <span className="text-emerald-400 font-bold">
              {totalInterceptions}
            </span>
          </div>
        </div>
      </div>

      {/* Real Policies Grid */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs font-mono text-[#8a7f70]">
          <RefreshCw className="w-5 h-5 animate-spin text-orange-400" />
          Loading repository governance rules...
        </div>
      ) : safePolicies.length === 0 ? (
        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-12 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-orange-400 mx-auto" />
          <h4 className="text-sm font-bold text-cream-100 font-mono">
            No OKF Policies configured for {currentProject?.name || "this repository"}
          </h4>
          <p className="text-xs text-[#8a7f70] font-mono max-w-md mx-auto">
            Add custom deterministic rules or initialize the baseline policies for this repository.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Create Repository Rule
            </button>
            <button
              type="button"
              onClick={handleApplyBaseline}
              className="bg-[#24211d] hover:bg-[#2e2a24] text-[#fef08a] border border-[#3a352e] px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" /> Apply Baseline Security Rules
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {safePolicies.map((p, idx) => {
            if (!p) return null;
            const isEnabled = p.status === "enabled";
            const policyKey = p._id || p.id || p.policyId || `okf-key-${idx}`;
            const displayId = p.id || p.policyId || `OKF-${String(idx + 1).padStart(3, "0")}`;
            const displayName = p.name || "Governance Policy Rule";
            const displayCategory = p.category || "Security Policies";
            const displayDesc = p.description || "Deterministic guardrail constraint enforcing repository integrity.";

            return (
              <div
                key={policyKey}
                className={`bg-dark-card border rounded-xl p-6 flex flex-col justify-between transition-all ${
                  isEnabled
                    ? "border-[#201d1a] hover:border-orange-500/40 hover:shadow-[0_4px_20px_rgba(249,115,22,0.1)]"
                    : "border-[#1c1916] opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-orange-400 font-bold uppercase">
                          {displayId}
                        </span>
                        <span className="text-[#524c45]">|</span>
                        <span className="text-[10px] font-mono text-[#a89f91]">
                          {displayCategory}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-cream-100">
                        {displayName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRiskBadge(p.risk)}
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === policyKey}
                        className="text-[#78716c] hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#b8ab97] font-sans mb-4 leading-relaxed">
                    {displayDesc}
                  </p>

                  <div className="mb-4">
                    <div className="text-[10px] font-mono uppercase text-[#8a7f70] font-bold mb-1.5 flex items-center justify-between">
                      <span>Deterministic Constraint</span>
                      <span className="text-orange-400/80">
                        {p.version || "v1.0"}
                      </span>
                    </div>
                    <div className="bg-dark-base border border-dark-border rounded-lg p-3 font-mono text-[11px] text-cream-100 overflow-x-auto custom-scrollbar">
                      {renderCode(p.rule)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#201d1a] flex items-center justify-between font-mono text-xs">
                  <span className="text-[#8a7f70]">
                    Triggered:{" "}
                    <span className="text-cream-100 font-bold">
                      {p.triggers || 0} times
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold ${
                        isEnabled ? "text-emerald-400" : "text-[#7a7164]"
                      }`}
                    >
                      {isEnabled ? "ACTIVE" : "DISABLED"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle(p)}
                      disabled={togglingId === policyKey}
                      title={
                        isEnabled
                          ? "Click to disable rule"
                          : "Click to enable rule"
                      }
                      className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                        isEnabled
                          ? "bg-orange-600 justify-end"
                          : "bg-[#2c2822] justify-start"
                      }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-100 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-[#2c2822] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between p-5 border-b border-[#201d1a] bg-[#14151b]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <h3 className="font-bold text-cream-100 text-sm font-sans">
                  Add OKF Rule for {currentProject?.name || "Repository"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8a7f70] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="p-5 space-y-4">
              <div>
                <label className="block uppercase text-[#d6c5a8] mb-1 font-bold text-[10px]">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Strict Secret Masking Policy"
                  value={ruleFormData.name}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, name: e.target.value })
                  }
                  className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase text-[#d6c5a8] mb-1 font-bold text-[10px]">
                    Category
                  </label>
                  <select
                    value={ruleFormData.category}
                    onChange={(e) =>
                      setRuleFormData({
                        ...ruleFormData,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
                  >
                    <option value="Security Policies">Security Policies</option>
                    <option value="Deployment Restrictions">
                      Deployment Restrictions
                    </option>
                    <option value="Validation Rules">Validation Rules</option>
                    <option value="Architecture Rules">
                      Architecture Rules
                    </option>
                    <option value="Approval Policies">Approval Policies</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase text-[#d6c5a8] mb-1 font-bold text-[10px]">
                    Risk Level
                  </label>
                  <select
                    value={ruleFormData.risk}
                    onChange={(e) =>
                      setRuleFormData({ ...ruleFormData, risk: e.target.value })
                    }
                    className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
                  >
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase text-[#d6c5a8] mb-1 font-bold text-[10px]">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="What does this rule prevent or enforce?"
                  value={ruleFormData.description}
                  onChange={(e) =>
                    setRuleFormData({
                      ...ruleFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block uppercase text-[#d6c5a8] mb-1 font-bold text-[10px]">
                  Deterministic JavaScript Constraint Rule
                </label>
                <textarea
                  rows={4}
                  required
                  value={ruleFormData.rule}
                  onChange={(e) =>
                    setRuleFormData({ ...ruleFormData, rule: e.target.value })
                  }
                  className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 font-mono text-[11px] text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#201d1a]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-[#282420] text-[#a89f91] hover:bg-[#14151b] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRule}
                  className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold cursor-pointer transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingRule ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Save & Index Rule"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OkfView;
export { OkfView };
