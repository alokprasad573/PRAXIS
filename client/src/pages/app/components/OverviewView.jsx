import {
  GitMerge,
  Plus,
  Bot,
  CheckCircle,
  Zap,
  DollarSign,
  Clock,
  TrendingUp,
  ArrowRight,
  Activity,
  Check,
} from "lucide-react";

const OverviewView = ({
  workflows = [],
  logs = [],
  kpis = {
    activeWorkflows: 0,
    runningAgents: 0,
    completedTasks: 0,
    tokensUsed: "0k",
    estimatedCost: "$0.00",
    avgDuration: "0s",
    successRate: "100%",
  },
  onNavigate,
  onOpenNewWorkflow,
}) => {
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
      case "blocked":
      case "waiting":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono font-bold">
            Blocked Gate
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono font-bold">
            Failed
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
    <div className="space-y-8 animate-fadeInUp">
      {/* Top Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            Orchestrating autonomous developer workflows across distributed repositories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("workflows")}
            className="px-3.5 py-2 text-xs font-mono border border-[#282420] text-[#d6c5a8] hover:text-cream-100 hover:border-orange-500/40 rounded-lg bg-dark-card transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <GitMerge className="w-3.5 h-3.5 text-orange-400" /> View All Workflows
          </button>
          <button
            type="button"
            onClick={onOpenNewWorkflow}
            className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(249,115,22,0.35)] hover:shadow-[0_0_20px_rgba(249,115,22,0.55)] border border-orange-400/30 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Launch Workflow
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (7 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4 flex flex-col hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#a89f91] font-mono uppercase tracking-wider">
              Active Workflows
            </span>
            <GitMerge className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-cream-100">
            {kpis.activeWorkflows || 3}
          </span>
        </div>

        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4 flex flex-col hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#a89f91] font-mono uppercase tracking-wider">
              Running Agents
            </span>
            <div className="relative">
              <Bot className="w-4 h-4 text-orange-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-cream-100">
            {kpis.runningAgents || 4}
          </span>
        </div>

        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4 flex flex-col hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#a89f91] font-mono uppercase tracking-wider">
              Completed Tasks
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-cream-100">
            {kpis.completedTasks ? kpis.completedTasks.toLocaleString() : "1,204"}
          </span>
        </div>

        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4 flex flex-col hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#a89f91] font-mono uppercase tracking-wider">
              Tokens Used
            </span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-cream-100">
            {kpis.tokensUsed || "4.2M"}
          </span>
        </div>

        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4 flex flex-col hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#a89f91] font-mono uppercase tracking-wider">
              Est. API Cost
            </span>
            <DollarSign className="w-4 h-4 text-[#d6c5a8]" />
          </div>
          <span className="text-2xl font-bold font-mono text-cream-100">
            {kpis.estimatedCost || "$12.84"}
          </span>
        </div>

        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4 flex flex-col hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#a89f91] font-mono uppercase tracking-wider">
              Avg Duration
            </span>
            <Clock className="w-4 h-4 text-orange-300" />
          </div>
          <span className="text-2xl font-bold font-mono text-cream-100">
            {kpis.avgDuration || "7m 22s"}
          </span>
        </div>

        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4 flex flex-col col-span-2 md:col-span-2 hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-[#a89f91] font-mono uppercase tracking-wider">
              Autonomous Success Rate
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {kpis.successRate || "94.2%"}
            </span>
            <div className="flex gap-1.5 items-end h-8">
              <div className="w-2 bg-orange-500/20 rounded-t h-[40%]" />
              <div className="w-2 bg-orange-500/40 rounded-t h-[60%]" />
              <div className="w-2 bg-orange-500/30 rounded-t h-[50%]" />
              <div className="w-2 bg-orange-500/60 rounded-t h-[80%]" />
              <div className="w-2 bg-orange-500/50 rounded-t h-[70%]" />
              <div className="w-2 bg-orange-500 rounded-t h-[95%] shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Workflow Monitor + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold font-mono text-cream-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Live Workflow Monitor
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("workflows")}
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
            >
              View All Workflows <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {workflows.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8a7f70] bg-dark-card border border-dashed border-[#201d1a] rounded-xl font-mono">
                No active workflows running. Click "New Workflow" to launch an orchestration pipeline.
              </div>
            ) : null}
            {workflows.slice(0, 3).map((wf) => {
              const isRunning =
                wf.status === "running" || wf.status === "in_progress";

              return (
                <div
                  key={wf.id}
                  onClick={() => onNavigate("workflow-detail", wf.id)}
                  className="bg-dark-card border border-[#201d1a] rounded-xl p-5 hover:border-orange-500/40 cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(249,115,22,0.1)] block group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isRunning
                            ? "bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                            : "bg-[#524c45]"
                        }`}
                      />
                      <span className="text-xs font-mono text-orange-400 font-bold">
                        {wf.id || "WF-XXXX"}
                      </span>
                    </div>
                    <div>{getStatusBadge(wf.status)}</div>
                  </div>

                  <h3 className="text-sm font-semibold text-cream-100 group-hover:text-orange-300 transition-colors mb-2">
                    {wf.name || "Workflow Task"}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-[#a89f91] mb-2 font-mono">
                    <span>
                      {wf.project || "payments-api"} / {wf.branch || "main"}
                    </span>
                    <span className="text-cream-200 font-semibold">
                      {wf.progress || 0}% complete
                    </span>
                  </div>

                  <div className="bg-[#181920] rounded-full h-1.5 mb-4 overflow-hidden border border-dark-border">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-1000 ${
                        isRunning
                          ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                          : "bg-[#524c45]"
                      }`}
                      style={{ width: `${wf.progress || 0}%` }}
                    />
                  </div>

                  {/* Pipeline Status Dots */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#a89f91] overflow-hidden">
                    <span className="text-cream-100">Orchestrator</span>
                    <ArrowRight className="w-3 h-3 text-[#524c45]" />
                    <div
                      className="w-4 h-4 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 text-emerald-400"
                      title="Code Analysis"
                    >
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <ArrowRight className="w-3 h-3 text-[#524c45]" />
                    <div
                      className="w-4 h-4 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 text-emerald-400"
                      title="Research"
                    >
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <ArrowRight className="w-3 h-3 text-[#524c45]" />
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        isRunning
                          ? "bg-orange-500/25 border border-orange-500/60 animate-pulse text-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                          : "bg-[#181920] border border-[#2a2520]"
                      }`}
                      title="Unit Test"
                    >
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    </div>
                    <ArrowRight className="w-3 h-3 text-[#524c45]" />
                    <div
                      className="w-4 h-4 bg-[#181920] rounded-full border border-[#2a2520]"
                      title="DevOps"
                    />
                    <ArrowRight className="w-3 h-3 text-[#524c45]" />
                    <div
                      className="w-4 h-4 bg-[#181920] rounded-full border border-[#2a2520]"
                      title="Review"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="col-span-1">
          <h2 className="text-base font-bold font-mono text-cream-100 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            Activity Trace
          </h2>
          <div className="bg-dark-card border border-[#201d1a] rounded-xl p-4 h-105 overflow-y-auto custom-scrollbar">
            <div className="relative border-l border-[#201d1a] ml-3 space-y-6 pb-4">
              {logs.slice(0, 5).map((log) => {
                const dotBorder =
                  log.status === "error"
                    ? "border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                    : log.status === "warning"
                      ? "border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                      : "border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]";

                return (
                  <div key={log.id} className="relative pl-6">
                    <span
                      className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-dark-card border-2 ${dotBorder}`}
                    />
                    <div className="text-[10px] text-[#8a7f70] font-mono mb-1">
                      {log.timestamp || "Just now"}
                    </div>
                    <div className="text-xs font-semibold font-mono text-orange-300">
                      {log.agent || "System Orchestrator"}
                    </div>
                    <div className="text-xs text-[#b8ab97] mt-1 leading-relaxed font-sans">
                      {log.event || log.message || "Action completed."}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;

export { OverviewView };
