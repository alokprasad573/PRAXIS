import { useState } from "react";
import { PlusCircle, X, Play, Loader } from "lucide-react";

const NewWorkflowModal = ({ isOpen, onClose, onLaunchWorkflow, projects = [] }) => {
  const [task, setTask] = useState("");
  const [project, setProject] = useState(projects[0]?.name || "");
  const [branch, setBranch] = useState("main");
  const [executionMode, setExecutionMode] = useState("parallel");
  const [approvalPolicy, setApprovalPolicy] = useState("high-risk-only");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!task.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newId = "WF-" + (2050 + Math.floor(Math.random() * 100));
      const newWf = {
        id: newId,
        name: task.length > 50 ? task.slice(0, 47) + "..." : task,
        projectId: project,
        project,
        branch,
        status: "running",
        progress: 15,
        trigger: "manual",
        executionMode,
        approvalPolicy,
        agents: ["agent-001", "agent-003", "agent-005", "agent-007"],
        duration: "12s",
        startedAt: new Date().toISOString(),
        metrics: { tokensUsed: 4200, estimatedCost: 0.08, retries: 0 },
      };

      if (onLaunchWorkflow) onLaunchWorkflow(newWf);
      setIsSubmitting(false);
      setTask("");
      onClose();
    }, 600);
  };

  return (
    <div
      id="modal-new-workflow"
      onClick={(e) => {
        if (e.target.id === "modal-new-workflow") onClose();
      }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center p-4 transition-opacity"
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

        <form id="new-workflow-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#d6c5a8] mb-1.5">
              Task Description
            </label>
            <textarea
              id="wf-desc"
              required
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-dark-base border border-[#282420] rounded-lg p-3 text-sm text-cream-100 placeholder-[#6b645b] focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-mono h-24 resize-none transition-colors outline-none"
              placeholder="e.g. Improve unit test coverage to 80% for payments-api and audit security vulnerabilities..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#d6c5a8] mb-1.5">
                Project
              </label>
              <select
                id="wf-project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full bg-dark-base border border-[#282420] rounded-lg p-2 text-xs text-cream-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-mono outline-none"
              >
                {projects.length === 0 ? (
                  <option value="">No connected projects</option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id || p._id} value={p.name}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#d6c5a8] mb-1.5">
                Branch
              </label>
              <select
                id="wf-branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-dark-base border border-[#282420] rounded-lg p-2 text-xs text-cream-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-mono outline-none"
              >
                <option value="main">main</option>
                <option value="develop">develop</option>
                <option value="feature/test-coverage">
                  feature/test-coverage
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#d6c5a8] mb-1.5">
              Execution Mode
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExecutionMode("parallel")}
                className={`flex-1 py-2 px-3 text-xs rounded-lg font-mono font-medium transition-colors cursor-pointer ${
                  executionMode === "parallel"
                    ? "border border-orange-500 bg-orange-500/15 text-orange-400"
                    : "border border-[#282420] text-[#8a7f70] hover:border-orange-500/30"
                }`}
                data-mode="parallel"
              >
                Parallel Branching
              </button>
              <button
                type="button"
                onClick={() => setExecutionMode("sequential")}
                className={`flex-1 py-2 px-3 text-xs rounded-lg font-mono font-medium transition-colors cursor-pointer ${
                  executionMode === "sequential"
                    ? "border border-orange-500 bg-orange-500/15 text-orange-400"
                    : "border border-[#282420] text-[#8a7f70] hover:border-orange-500/30"
                }`}
                data-mode="sequential"
              >
                Sequential Linear
              </button>
            </div>
            <input type="hidden" id="wf-mode" value={executionMode} />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#d6c5a8] mb-1.5">
              Approval Governance Policy
            </label>
            <select
              id="wf-policy"
              value={approvalPolicy}
              onChange={(e) => setApprovalPolicy(e.target.value)}
              className="w-full bg-dark-base border border-[#282420] rounded-lg p-2 text-xs text-cream-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-mono outline-none"
            >
              <option value="high-risk-only">
                High Risk Only (Recommended Gate)
              </option>
              <option value="all">All Destructive/Write Actions</option>
              <option value="none">Autonomous Full Automation</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#201d1a]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 text-xs font-mono border border-[#282420] text-[#b8ab97] rounded-lg hover:bg-[#181920] hover:text-cream-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 text-xs font-mono bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(249,115,22,0.35)] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Start Orchestrator
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

export { NewWorkflowModal };
