import { useState } from "react";
import {
  ArrowLeft,
  GitBranch,
  Clock,
  RotateCw,
  XCircle,
  LayoutDashboard,
  GitMerge,
  Bot,
  Database,
  FileCode,
  Terminal,
  CheckCircle,
  FileText,
  Check,
  Loader,
  Flag,
  Play,
  FolderOpen,
  Folder,
  FileJson,
  ShieldAlert,
  Copy,
  ShieldCheck,
  Search,
} from "lucide-react";

const WorkflowDetailView = ({
  workflowId = "WF-2048",
  workflows = [],
  onNavigate,
  onToast,
  onCancelWorkflow,
}) => {
  const [activeTab, setActiveTab] = useState("execution");

  const wf =
    workflows.find(
      (w) =>
        (w.customId && w.customId === workflowId) ||
        (w._id && w._id.toString() === workflowId) ||
        (w.id && w.id === workflowId)
    ) ||
    workflows[0] || {
      customId: "WF-2048",
      name: "Autonomous Test Coverage Enhancement",
      project: { name: "payments-api", branch: "main" },
      branch: "main",
      status: "running",
      progress: 68,
      duration: "12m 34s",
    };

  const wfCustomId = wf.customId || wf.id || wf._id?.toString() || workflowId || "WF-2048";
  const projectName =
    typeof wf.project === "object"
      ? wf.project?.name || wf.project?.repo || "payments-api"
      : wf.project || "payments-api";
  const branchName =
    wf.branch || (typeof wf.project === "object" ? wf.project?.branch : "main") || "main";

  const isRunning = wf.status === "running" || wf.status === "in_progress";

  const defaultPipeline = [
    { name: "Code Analysis Agent", status: "completed", tokens: 1250, output: "AST structure analyzed, dependencies resolved." },
    { name: "Unit Test Agent", status: "completed", tokens: 2800, output: "Generated unit test suites against OKF coverage targets." },
    { name: "Security Auditor Agent", status: "completed", tokens: 1950, output: "SAST secrets and OKF guardrails verified." },
    { name: "DevOps Deployer Agent", status: "waiting", tokens: 850, output: "Awaiting human authorization gate before deployment." },
  ];

  const pipeline = wf.agentPipeline && wf.agentPipeline.length > 0 ? wf.agentPipeline : defaultPipeline;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "execution", label: "Execution Graph", icon: GitMerge },
    { id: "agents", label: "Agents Pipeline", icon: Bot },
    { id: "context", label: "Unified Context", icon: Database },
    { id: "artifacts", label: "Artifacts", icon: FileCode },
    { id: "logs", label: "Live Logs", icon: Terminal },
    { id: "approvals", label: "Approvals", icon: CheckCircle },
    { id: "report", label: "Engineering Report", icon: FileText },
  ];

  const handleAbort = async () => {
    const targetId = wf._id || wfCustomId;
    if (onCancelWorkflow) {
      await onCancelWorkflow(targetId);
    } else if (onToast) {
      onToast("Workflow execution halted", "warning");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "running":
      case "in_progress":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/30 font-mono font-bold">
            Running
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
            Completed
          </span>
        );
      case "waiting_for_approval":
      case "blocked":
      case "waiting":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono font-bold">
            Blocked Gate
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono font-bold">
            Cancelled
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono font-bold">
            Failed
          </span>
        );
      case "queued":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono font-bold">
            Queued
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#181920] text-cream-100 font-mono">
            {status || "Active"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Back button */}
      <button
        type="button"
        onClick={() => onNavigate("workflows")}
        className="text-xs font-mono text-[#b8ab97] hover:text-orange-400 flex items-center gap-2 mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Workflows
      </button>

      {/* Workflow Header */}
      <div className="bg-dark-card border border-[#201d1a] rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-32 bg-orange-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap font-mono">
              <span className="text-xs text-orange-400 font-bold">
                {wfCustomId}
              </span>
              <span className="text-[#524c45]">/</span>
              <span className="text-xs text-cream-100 hover:text-orange-300 transition-colors">
                {projectName}
              </span>
              <span className="text-[#524c45]">/</span>
              <span className="text-xs text-[#a89f91] flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-orange-400" />{" "}
                {branchName}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-cream-100 tracking-tight mb-3">
              {wf.name || "Autonomous Test Coverage Enhancement"}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {getStatusBadge(wf.status)}
              <span className="text-xs text-orange-300 font-mono font-semibold">
                {wf.progress || 0}% Complete
              </span>
              <span className="text-[#363028]">|</span>
              <span className="text-xs text-[#a89f91] font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-400" />{" "}
                {wf.duration || "12m 34s"}
              </span>
              <span className="text-[#363028]">|</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#181920] border border-[#282420] text-[#d6c5a8] font-mono">
                Parallel Execution
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                onToast && onToast("Workflow execution restarted", "info")
              }
              className="bg-[#14151b] hover:bg-[#1c1d25] text-cream-100 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors border border-[#282420] flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-orange-400" /> Re-run
            </button>
            {isRunning && (
              <button
                type="button"
                onClick={handleAbort}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors border border-rose-500/25 flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> Abort
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 bg-[#181920] rounded-full h-1.5 overflow-hidden border border-dark-border">
          <div
            className={`h-1.5 rounded-full transition-all duration-1000 ${
              isRunning
                ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                : "bg-[#524c45]"
            }`}
            style={{ width: `${wf.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-dark-card border border-[#201d1a] rounded-xl flex overflow-x-auto custom-scrollbar p-1 gap-1 shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-30 px-3.5 py-2.5 text-xs font-mono font-medium rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? "text-orange-300 bg-orange-500/15 border border-orange-500/30 shadow-[0_0_12px_rgba(249,115,22,0.15)] font-bold"
                  : "text-[#a89f91] hover:text-cream-100 hover:bg-[#14151b]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-125">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4">
                <div className="text-[11px] text-[#a89f91] mb-1 font-mono uppercase">
                  Agents Active
                </div>
                <div className="text-xl font-bold font-mono text-cream-100">
                  4 Agents
                </div>
              </div>
              <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4">
                <div className="text-[11px] text-[#a89f91] mb-1 font-mono uppercase">
                  Tokens Consumed
                </div>
                <div className="text-xl font-bold font-mono text-cream-100">
                  124.5K
                </div>
              </div>
              <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4">
                <div className="text-[11px] text-[#a89f91] mb-1 font-mono uppercase">
                  Estimated Cost
                </div>
                <div className="text-xl font-bold font-mono text-cream-100">
                  $0.42
                </div>
              </div>
              <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4">
                <div className="text-[11px] text-[#a89f91] mb-1 font-mono uppercase">
                  Improvement Loops
                </div>
                <div className="text-xl font-bold font-mono text-orange-400">
                  2 / 3
                </div>
              </div>
              <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4">
                <div className="text-[11px] text-[#a89f91] mb-1 font-mono uppercase">
                  Gate Approvals
                </div>
                <div className="text-xl font-bold font-mono text-amber-400">
                  1 Pending
                </div>
              </div>
            </div>

            <div className="bg-dark-card border border-[#201d1a] rounded-xl p-6">
              <h3 className="text-sm font-bold font-mono text-cream-100 uppercase tracking-wider mb-6">
                Orchestration Phase Progression
              </h3>
              <div className="flex flex-col space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[#201d1a]">
                {pipeline.map((p, idx) => {
                  const isDone = p.status === "completed";
                  const isRunning = p.status === "running";
                  const isWaiting = p.status === "waiting";
                  return (
                    <div
                      key={p.name || idx}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                    >
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-dark-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : isWaiting
                            ? "bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                            : isRunning
                            ? "bg-orange-500 text-white animate-pulse shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                            : "bg-[#181920] text-[#8a7f70]"
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-4 h-4" />
                        ) : isWaiting ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : isRunning ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div
                        className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${
                          isDone
                            ? "bg-[#14151b] border-[#282420]"
                            : isWaiting
                            ? "bg-amber-500/10 border-amber-500/40"
                            : isRunning
                            ? "bg-orange-500/10 border-orange-500/30"
                            : "bg-[#121319] border-[#201d1a]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 font-mono">
                          <h4
                            className={`font-bold text-xs ${
                              isDone
                                ? "text-cream-100"
                                : isWaiting
                                ? "text-amber-300"
                                : isRunning
                                ? "text-orange-300"
                                : "text-[#8a7f70]"
                            }`}
                          >
                            {p.name}
                          </h4>
                          <span
                            className={`text-[10px] font-mono ${
                              isDone
                                ? "text-emerald-400 font-bold"
                                : isWaiting
                                ? "text-amber-400 font-bold"
                                : isRunning
                                ? "text-orange-400 font-bold animate-pulse"
                                : "text-[#6b645b]"
                            }`}
                          >
                            {isDone ? "Done" : isWaiting ? "Human Gate" : isRunning ? "Running..." : "Queued"}
                          </span>
                        </div>
                        <p className="text-xs text-[#b8ab97] font-sans leading-relaxed">
                          {p.output || "Autonomous agent awaiting previous stage completion."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* EXECUTION GRAPH TAB */}
        {activeTab === "execution" && (
          <div className="bg-dark-card border border-[#201d1a] rounded-xl p-6 overflow-x-auto relative min-h-105x items-center justify-center custom-scrollbar shadow-xl animate-fadeInUp">
            <div className="flex items-center gap-8 min-w-max relative py-12">
              {/* Connecting SVG Lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 0 }}
              >
                <path
                  d="M 120 150 L 180 150"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="4"
                  fill="none"
                  opacity="0.6"
                />
                <path
                  d="M 340 150 L 380 150 L 380 70 L 420 70"
                  stroke="#f97316"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.5"
                />
                <path
                  d="M 340 150 L 380 150 L 380 230 L 420 230"
                  stroke="#f97316"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.5"
                />
                <path
                  d="M 580 70 L 620 70 L 620 150 L 660 150"
                  stroke="#f97316"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.4"
                />
                <path
                  d="M 580 230 L 620 230 L 620 150 L 660 150"
                  stroke="#f97316"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.4"
                />
                <path
                  d="M 820 150 L 880 150"
                  stroke="#443e38"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>

              {/* Node: Start */}
              <div className="w-28 bg-[#14151b] border border-[#282420] rounded-xl p-3 text-center z-10 flex flex-col items-center shadow-lg shrink-0">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center mb-1 text-orange-400">
                  <Play className="w-4 h-4 fill-orange-500/30" />
                </div>
                <span className="text-xs font-mono font-bold text-cream-100">
                  Task Start
                </span>
                <span className="text-[10px] font-mono text-[#8a7f70]">
                  RAG + OKF
                </span>
              </div>

              {/* Dynamic Agent Nodes */}
              {pipeline.map((p, idx) => {
                const isDone = p.status === "completed";
                const isRunning = p.status === "running";
                const isWaiting = p.status === "waiting";
                return (
                  <div
                    key={p.name || idx}
                    className={`w-44 rounded-xl p-3 text-center shadow-lg flex flex-col items-center relative z-10 border transition-all shrink-0 ${
                      isDone
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : isWaiting
                        ? "bg-amber-500/15 border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                        : isRunning
                        ? "bg-orange-500/15 border-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.35)]"
                        : "bg-[#14151b] border-[#282420] opacity-50"
                    }`}
                  >
                    <div
                      className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-dark-card ${
                        isDone
                          ? "bg-emerald-500"
                          : isWaiting
                          ? "bg-amber-500 text-black font-bold"
                          : isRunning
                          ? "bg-orange-500"
                          : "bg-[#282420]"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3" />
                      ) : isWaiting ? (
                        <ShieldAlert className="w-3 h-3" />
                      ) : isRunning ? (
                        <Loader className="w-3 h-3 animate-spin" />
                      ) : (
                        <Clock className="w-3 h-3 text-[#8a7f70]" />
                      )}
                    </div>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-400"
                          : isWaiting
                          ? "bg-amber-500/20 text-amber-400"
                          : isRunning
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-[#1c1d25] text-[#8a7f70]"
                      }`}
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-xs font-mono font-bold truncate max-w-full ${
                        isDone
                          ? "text-emerald-300"
                          : isWaiting
                          ? "text-amber-300"
                          : isRunning
                          ? "text-orange-300"
                          : "text-[#8a7f70]"
                      }`}
                    >
                      {p.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono mt-0.5 truncate max-w-full ${
                        isDone
                          ? "text-emerald-400"
                          : isWaiting
                          ? "text-amber-400 font-bold"
                          : isRunning
                          ? "text-orange-400 font-bold animate-pulse"
                          : "text-[#6b645b]"
                      }`}
                    >
                      {isDone ? "Completed" : isWaiting ? "Human Gate" : isRunning ? "Running..." : "Queued"}
                    </span>
                  </div>
                );
              })}

              {/* Node: Complete / Result */}
              <div
                className={`w-28 rounded-xl p-3 text-center z-10 flex flex-col items-center shadow-lg border shrink-0 ${
                  wf.status === "completed"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : wf.status === "waiting"
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                    : "bg-[#14151b] border-[#282420] opacity-40 text-[#8a7f70]"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#1c1d25] flex items-center justify-center mb-1 text-orange-400">
                  <Flag className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold">
                  {wf.status === "completed" ? "Done" : wf.status === "waiting" ? "Gate" : "Pending"}
                </span>
                <span className="text-[10px] font-mono">{wf.progress || 0}%</span>
              </div>
            </div>
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === "agents" && (
          <div className="bg-dark-card border border-[#201d1a] rounded-xl overflow-hidden shadow-xl animate-fadeInUp">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#121319] text-[#a89f91] font-mono uppercase tracking-wider border-b border-[#201d1a]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Agent</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Tokens</th>
                  <th className="px-4 py-3 font-semibold w-full">
                    Output Summary
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201d1a] text-cream-100 font-mono">
                {pipeline.map((p, idx) => {
                  const isDone = p.status === "completed";
                  const isRunning = p.status === "running";
                  const isWaiting = p.status === "waiting";
                  return (
                    <tr
                      key={p.name || idx}
                      className={isRunning ? "bg-orange-500/5" : isWaiting ? "bg-amber-500/5" : ""}
                    >
                      <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                        <Bot
                          className={`w-4 h-4 ${
                            isDone
                              ? "text-emerald-400"
                              : isWaiting
                              ? "text-amber-400"
                              : isRunning
                              ? "text-orange-400 animate-spin"
                              : "text-[#8a7f70]"
                          }`}
                        />
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#a89f91]">
                        autonomous-agent
                      </td>
                      <td className="px-4 py-3">
                        {isDone && (
                          <span className="text-emerald-400 text-xs flex items-center gap-1 font-bold">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        )}
                        {isRunning && (
                          <span className="text-orange-400 text-xs flex items-center gap-1 font-bold">
                            <Loader className="w-3 h-3 animate-spin" /> Running
                          </span>
                        )}
                        {isWaiting && (
                          <span className="text-amber-400 text-xs flex items-center gap-1 font-bold">
                            <Clock className="w-3 h-3" /> Human Gate
                          </span>
                        )}
                        {!isDone && !isRunning && !isWaiting && (
                          <span className="text-[#8a7f70] text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Queued
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#a89f91]">
                        {p.duration || (isDone ? "1.2s" : isRunning ? "Running" : "-")}
                      </td>
                      <td className="px-4 py-3 text-[#a89f91]">
                        {p.tokens ? p.tokens.toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-[#d6c5a8] whitespace-normal">
                        {p.output || "Autonomous worker awaiting instruction."}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTEXT TAB (80% RAG + 20% OKF) */}
        {activeTab === "context" && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="bg-dark-card border border-[#201d1a] rounded-xl p-8 flex flex-col items-center shadow-xl">
              <div className="text-center mb-6">
                <h3 className="text-base font-bold font-mono text-cream-100 uppercase tracking-wider">
                  Unified Context Manager Architecture
                </h3>
                <p className="text-xs text-[#a89f91] font-mono mt-1">
                  Autonomous injection of 80% dynamic RAG embeddings + 20%
                  deterministic OKF policy constraints.
                </p>
              </div>

              <div className="flex flex-col items-center w-full max-w-3xl font-mono text-xs">
                <div className="bg-[#14151b] border border-[#282420] px-5 py-2.5 rounded-lg text-cream-100 mb-3 z-10 font-bold shadow-md">
                  Developer Engineering Prompt
                </div>
                <div className="w-px h-6 bg-orange-500/50 mb-3 z-0" />

                <div className="bg-orange-500/15 border border-orange-500/40 px-6 py-2.5 rounded-lg text-orange-300 mb-6 z-10 font-bold shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                  Context Manager Dispatcher
                </div>

                <div className="flex w-full justify-between gap-6 relative mb-6">
                  {/* Left Side: RAG (80%) */}
                  <div className="w-[48%] flex flex-col items-center z-10">
                    <div className="bg-orange-500/20 border border-orange-500/40 px-4 py-2 rounded-lg text-orange-300 w-full text-center mb-3 font-bold flex justify-between">
                      <span>RAG Vector Retrieval</span>{" "}
                      <span className="text-orange-400">80% Context</span>
                    </div>
                    <div className="w-full space-y-2 border-l-2 border-orange-500/40 pl-4 py-1 text-xs">
                      <div className="flex items-center gap-2 text-[#d6c5a8]">
                        <FileCode className="w-3.5 h-3.5 text-orange-400" />{" "}
                        src/payments/stripe.ts (Chunks 1-12)
                      </div>
                      <div className="flex items-center gap-2 text-[#d6c5a8]">
                        <FileText className="w-3.5 h-3.5 text-orange-400" />{" "}
                        docs/testing_standards.md
                      </div>
                      <div className="flex items-center gap-2 text-[#d6c5a8]">
                        <Search className="w-3.5 h-3.5 text-orange-400" /> Past
                        Workflow WF-1994 (Pattern)
                      </div>
                    </div>
                  </div>

                  {/* Right Side: OKF (20%) */}
                  <div className="w-[48%] flex flex-col items-center z-10">
                    <div className="bg-amber-500/20 border border-amber-500/40 px-4 py-2 rounded-lg text-amber-300 w-full text-center mb-3 font-bold flex justify-between">
                      <span>OKF Deterministic Rules</span>{" "}
                      <span className="text-amber-400">20% Rules</span>
                    </div>
                    <div className="w-full space-y-2 border-l-2 border-amber-500/40 pl-4 py-1 text-xs">
                      <div className="flex items-center gap-2 text-[#d6c5a8]">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />{" "}
                        OKF-01: Production Gate Required
                      </div>
                      <div className="flex items-center gap-2 text-[#d6c5a8]">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />{" "}
                        OKF-02: Min 60% Test Coverage
                      </div>
                      <div className="flex items-center gap-2 text-[#d6c5a8]">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />{" "}
                        OKF-03: No Direct Push to Main
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-px h-6 bg-orange-500/50 mb-3 z-0" />

                <div className="bg-linear-to-r from-orange-600/30 via-amber-500/30 to-orange-600/30 border border-orange-500/50 px-8 py-3.5 rounded-xl text-cream-100 mb-3 z-10 font-extrabold shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                  Unified Agent Context (124,500 Tokens Formatted)
                </div>

                <div className="w-px h-6 bg-orange-500/50 mb-3 z-0" />
                <div className="bg-[#14151b] border border-[#282420] px-5 py-2 rounded-lg text-[#d6c5a8] z-10">
                  Specialized Agent Execution (GPT-4o / Claude 3.5 Sonnet)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ARTIFACTS TAB */}
        {activeTab === "artifacts" && (
          <div className="bg-dark-card border border-[#201d1a] rounded-xl p-6 shadow-xl animate-fadeInUp">
            <h3 className="text-sm font-bold font-mono text-cream-100 uppercase tracking-wider mb-4">
              Generated Engineering Artifacts
            </h3>

            <div className="border border-[#201d1a] rounded-xl overflow-hidden font-mono text-xs">
              <div className="bg-[#121319] px-4 py-2.5 text-[#d6c5a8] border-b border-[#201d1a] flex items-center gap-2 font-bold">
                <FolderOpen className="w-4 h-4 text-orange-400" />{" "}
                artifacts/payments-api/WF-2048/
              </div>
              <div className="p-3 bg-dark-base">
                <ul className="space-y-1.5">
                  <li>
                    <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-[#14151b] rounded-lg cursor-pointer text-cream-100">
                      <Folder className="w-4 h-4 text-orange-400" /> tests/unit/
                    </div>
                    <ul className="pl-6 space-y-1.5 border-l border-[#201d1a] ml-4 mt-1">
                      <li className="flex items-center justify-between px-2 py-1.5 hover:bg-[#14151b] rounded cursor-pointer text-[#d6c5a8]">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-emerald-400" />{" "}
                          auth_service.test.ts
                        </div>
                        <span className="text-[10px] text-[#8a7f70]">
                          2.4 KB • Generated
                        </span>
                      </li>
                      <li className="flex items-center justify-between px-2 py-1.5 hover:bg-[#14151b] rounded cursor-pointer text-[#d6c5a8]">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-emerald-400" />{" "}
                          stripe_webhook.test.ts
                        </div>
                        <span className="text-[10px] text-[#8a7f70]">
                          4.1 KB • Generated
                        </span>
                      </li>
                      <li className="flex items-center justify-between px-2 py-1.5 hover:bg-[#14151b] rounded cursor-pointer text-[#d6c5a8]">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-[#8a7f70]" /> 41
                          other test suites...
                        </div>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <div className="flex items-center justify-between px-2.5 py-2 hover:bg-[#14151b] rounded-lg cursor-pointer text-[#d6c5a8]">
                      <div className="flex items-center gap-2">
                        <FileJson className="w-4 h-4 text-amber-400" />{" "}
                        coverage_delta_report.json
                      </div>
                      <span className="text-[10px] text-[#8a7f70]">
                        18.4 KB
                      </span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center justify-between px-2.5 py-2 hover:bg-[#14151b] rounded-lg cursor-pointer text-[#d6c5a8]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-400" />{" "}
                        multi_agent_synthesis.md
                      </div>
                      <span className="text-[10px] text-[#8a7f70]">3.2 KB</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === "logs" && (
          <div className="h-120 bg-dark-base border border-[#201d1a] rounded-xl p-5 font-mono text-xs overflow-y-auto custom-scrollbar shadow-xl animate-fadeInUp">
            <div className="space-y-3">
              <div className="text-[#8a7f70]">
                <span className="text-orange-400 font-bold">[PRAXIS Engine]</span> Initializing workflow {wfCustomId} ({wf.name}) on branch &apos;{branchName}&apos;...
              </div>
              <div className="text-[#8a7f70]">
                <span className="text-amber-400 font-bold">[Vector RAG]</span> Injected 80% code context chunks from Vector DB + 20% active OKF governance policies.
              </div>
              {pipeline.map((p, idx) => (
                <div key={p.name || idx} className="text-[#d6c5a8] border-l-2 border-[#201d1a] pl-3 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-orange-400 font-bold">[{p.name}]</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      p.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : p.status === "waiting"
                        ? "bg-amber-500/20 text-amber-400"
                        : p.status === "running"
                        ? "bg-orange-500/20 text-orange-400 animate-pulse"
                        : "bg-[#181920] text-[#8a7f70]"
                    }`}>
                      {p.status?.toUpperCase() || "QUEUED"}
                    </span>
                    <span className="text-[10px] text-[#8a7f70]">
                      {p.duration || "1.2s"} • {p.tokens ? `${p.tokens} tokens` : "0 tokens"}
                    </span>
                  </div>
                  <p className="text-cream-100 text-xs font-sans leading-relaxed">
                    {p.output || "Stage queued for execution."}
                  </p>
                </div>
              ))}
              {wf.status === "waiting" && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Pipeline paused at Human Approval Gate. Awaiting security administrator authorization.</span>
                </div>
              )}
              {wf.status === "completed" && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All autonomous agents completed successfully. Workflow 100% verified against OKF policies.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* APPROVALS TAB */}
        {activeTab === "approvals" && (
          <div className="space-y-4 animate-fadeInUp">
            <div className="bg-dark-card border border-orange-500/40 rounded-xl p-6 shadow-[0_0_25px_rgba(249,115,22,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-mono font-bold mb-1">
                    <ShieldAlert className="w-4 h-4" /> Human-in-the-Loop
                    Approval Required
                  </div>
                  <h3 className="text-lg font-bold text-cream-100">
                    Commit 43 generated unit test files to main branch
                  </h3>
                </div>
                <span className="text-xs text-[#8a7f70] font-mono">
                  12m ago
                </span>
              </div>
              <div className="bg-dark-base rounded-lg border border-dark-border p-4 text-xs text-[#d6c5a8] font-mono mb-5 leading-relaxed">
                The Unit Test Agent has synthesized 43 comprehensive unit tests,
                boosting test coverage from 48% to 74%. Security scanner
                confirmed zero vulnerabilities. In accordance with OKF Rule #5
                (AI-Generated Code Review), human authorization is required
                before committing to &apos;payments-api/main&apos;.
              </div>
              <div className="flex gap-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={() =>
                    onToast &&
                    onToast("Changes approved and committed", "success")
                  }
                  className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-bold shadow-[0_0_12px_rgba(249,115,22,0.35)] cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Approve &amp; Commit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onToast && onToast("Change request sent to agent", "info")
                  }
                  className="bg-[#14151b] hover:bg-[#1c1d25] text-cream-100 px-4 py-2.5 rounded-lg transition-colors border border-[#282420] cursor-pointer"
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onToast && onToast("Approval rejected", "error")
                  }
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2.5 rounded-lg transition-colors border border-rose-500/25 cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === "report" && (
          <div className="bg-dark-card border border-[#201d1a] rounded-xl overflow-hidden shadow-xl animate-fadeInUp">
            <div className="flex justify-between items-center px-6 py-3.5 border-b border-[#201d1a] bg-[#121319]">
              <span className="text-xs font-mono font-bold text-orange-400">
                PRAXIS MULTI-AGENT SYNTHESIS REPORT
              </span>
              <button
                type="button"
                onClick={() =>
                  onToast && onToast("Report copied to clipboard", "success")
                }
                className="text-xs font-mono text-[#d6c5a8] hover:text-cream-100 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg bg-[#181920] border border-[#282420] cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Markdown
              </button>
            </div>
            <div className="p-6 font-mono text-xs text-cream-100 whitespace-pre-wrap leading-relaxed max-w-4xl bg-dark-base">
              {`PRAXIS ENGINEERING REPORT
=========================
Workflow ID : ${wfCustomId}
Repository  : ${projectName} (Branch: ${branchName})
Timestamp   : 2026-08-31 22:10:15
Status      : IN PROGRESS (Autonomous Improvement Loop 2/3)

1. CODE ANALYSIS AGENT
----------------------
[✔] 14 potential code smells identified
[✔] AST generated without syntax violations
[✔] Security scanner: 0 high-risk CVEs detected

2. UNIT TEST AGENT (Autonomous Test Loop)
----------------------------------------
Coverage Progression:
  - Initial Code Coverage : 48%
  - Current Coverage      : 74%
  - Target Threshold      : 80%

Test Execution Results:
  - Generated Test Suites : 43
  - Passing Tests         : 41
  - Failed Tests          : 2 (in Stripe Webhook Mock)
  - Action                : Regenerating failed suites with updated fixture mocks

3. OKF GOVERNANCE POLICIES
--------------------------
[✔] OKF-01 (Production Gate) : Active
[✔] OKF-02 (Coverage Gate)   : In Progress (74% / 80%)
[!] OKF-05 (AI Code Review)  : Pending Human Authorization

=========================
Recommendation: Loop 2 execution in progress. Coverage delta +26%.`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDetailView;

export { WorkflowDetailView };
