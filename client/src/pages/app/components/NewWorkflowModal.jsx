import { useState } from "react";
import { PlusCircle, X, Play, Loader2, AlertCircle } from "lucide-react";
import { workflowApi } from "../../../utils/apiService";

const NewWorkflowModal = ({
  isOpen,
  onClose,
  onLaunchWorkflow,
  projects = [],
}) => {
  const [task, setTask] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(
    () => projects[0]?._id || projects[0]?.id || "",
  );
  const [branch, setBranch] = useState(() => projects[0]?.branch || "main");
  const [executionMode, setExecutionMode] = useState("parallel");
  const [approvalPolicy, setApprovalPolicy] = useState("high-risk-only");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    if (!selectedProjectId) {
      setErrorMsg("Please select a project repository.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await workflowApi.launch({
        name: task.trim(),
        projectId: selectedProjectId,
        branch,
        executionMode,
        approvalPolicy,
      });

      if (res.success && res.data) {
        if (onLaunchWorkflow) onLaunchWorkflow(res.data);
        setTask("");
        onClose();
      } else {
        setErrorMsg(res.message || "Failed to launch workflow.");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Error launching workflow on server.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-new-workflow"
      onClick={(e) => {
        if (e.target.id === "modal-new-workflow") onClose();
      }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center p-4 transition-opacity font-mono"
    >
      <div className="w-full max-w-lg bg-dark-card border border-[#2a2520] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-fadeInUp">
        <div className="flex items-center justify-between p-5 border-b border-[#201d1a] bg-[#12131a]">
          <div>
            <h2 className="text-base font-bold text-cream-100 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-orange-500" />
              Launch New Workflow
            </h2>
            <p className="text-xs text-[#b8ab97] font-mono mt-0.5">
              Orchestrate autonomous multi-agent task execution.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8a7f70] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#d6c5a8] mb-1.5">
              Task Prompt / Objective
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Generate edge-case unit tests for auth service and fix any detected SQL injection vectors..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-dark-base border border-[#282420] rounded-lg p-3 text-xs text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#a89f91] mb-1">
                Target Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  const p = projects.find(
                    (proj) => (proj._id || proj.id) === e.target.value,
                  );
                  if (p?.branch) setBranch(p.branch);
                }}
                className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-xs text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
              >
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} ({p.language || "TypeScript"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#a89f91] mb-1">
                Git Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-xs text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#a89f91] mb-1">
                Execution Mode
              </label>
              <select
                value={executionMode}
                onChange={(e) => setExecutionMode(e.target.value)}
                className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-xs text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
              >
                <option value="parallel">Parallel (High Throughput)</option>
                <option value="sequential">
                  Sequential (Strict Step-by-Step)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#a89f91] mb-1">
                Approval Policy
              </label>
              <select
                value={approvalPolicy}
                onChange={(e) => setApprovalPolicy(e.target.value)}
                className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-xs text-cream-100 focus:ring-1 focus:ring-orange-500 outline-none"
              >
                <option value="high-risk-only">
                  High Risk Only (Recommended)
                </option>
                <option value="all">Require All Approvals</option>
                <option value="none">Autonomous (Zero Gates)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-[#201d1a]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg border border-[#282420] text-[#a89f91] hover:bg-[#14151b] cursor-pointer transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !task.trim()}
              className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-[0_0_12px_rgba(249,115,22,0.3)] cursor-pointer transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Launching...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Launch Workflow
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewWorkflowModal;
