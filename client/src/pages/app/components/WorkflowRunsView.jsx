import { useState, useMemo } from "react";
import { Loader2, Plus, CheckCircle2, XCircle, Clock } from "lucide-react";

const WorkflowRunsView = ({
  activeRuns: initialActiveRuns = [],
  historicalRuns: initialHistoricalRuns = [],
  workflows = [],
  onNavigate,
  onOpenNewWorkflow,
}) => {
  const [search, setSearch] = useState("");

  // Determine active & historical runs dynamically
  const activeRuns = useMemo(() => {
    if (initialActiveRuns && initialActiveRuns.length > 0) {
      return initialActiveRuns;
    }
    if (workflows && workflows.length > 0) {
      return workflows.filter(
        (w) =>
          w.status === "running" ||
          w.status === "in_progress" ||
          w.status === "pending",
      );
    }
    return [];
  }, [initialActiveRuns, workflows]);

  const historicalRuns = useMemo(() => {
    if (initialHistoricalRuns && initialHistoricalRuns.length > 0) {
      return initialHistoricalRuns;
    }
    if (workflows && workflows.length > 0) {
      return workflows.filter(
        (w) =>
          w.status !== "running" &&
          w.status !== "in_progress" &&
          w.status !== "pending",
      );
    }
    return [];
  }, [initialHistoricalRuns, workflows]);

  const filteredHistory = useMemo(() => {
    return historicalRuns.filter((h) => {
      const id = (h.customId || h.id || h._id || "").toLowerCase();
      const name = (h.name || h.workflow || "").toLowerCase();
      const agent = (h.leadAgent || h.agent || "Orchestrator").toLowerCase();
      const q = search.toLowerCase().trim();
      return id.includes(q) || name.includes(q) || agent.includes(q);
    });
  }, [historicalRuns, search]);

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "success") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (s === "failed" || s === "aborted" || s === "error") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
          <XCircle className="w-3 h-3" /> Failed
        </span>
      );
    }
    if (s === "running" || s === "in_progress") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1 w-fit">
          <Loader2 className="w-3 h-3 animate-spin" /> Running
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1e2029] text-[#a89f91] border border-[#2b2d3a] flex items-center gap-1 w-fit">
        <Clock className="w-3 h-3" /> {status || "Pending"}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
            Workflow &amp; Agent Runs
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            Live execution timeline and historical agent runs telemetry
          </p>
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Run ID, Agent..."
            className="bg-dark-card border border-[#201d1a] rounded-lg px-3.5 py-1.5 text-cream-100 focus:outline-none focus:border-orange-500 w-48 sm:w-60"
          />
          <button
            type="button"
            onClick={onOpenNewWorkflow}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3.5 py-1.5 font-bold text-white transition-colors hover:bg-orange-500 cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.3)] whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            New Workflow
          </button>
        </div>
      </div>

      {/* Currently Running */}
      <div>
        <h3 className="text-xs font-bold text-cream-100 uppercase font-mono mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
          Active Executions ({activeRuns.length})
        </h3>
        {activeRuns.length === 0 ? (
          <div className="py-8 px-4 text-center border border-dashed border-[#201d1a] rounded-xl bg-[#0b0c10] font-mono text-xs text-[#8a7f70]">
            No active workflow runs currently executing in this workspace.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRuns.map((r) => {
              const runId = r.customId || r._id || r.id;
              const runName = r.name || r.workflow || "Autonomous Pipeline";
              const runAgent = r.leadAgent || r.agent || "Orchestrator Swarm";
              const currentStep =
                r.activeStep ||
                r.step ||
                "Processing task graph & AST chunks...";
              const runDuration = r.duration || "Running...";

              return (
                <div
                  key={runId}
                  onClick={() =>
                    onNavigate && onNavigate("workflow-detail", runId)
                  }
                  className="bg-dark-card border border-orange-500/40 rounded-xl p-5 shadow-[0_0_20px_rgba(249,115,22,0.1)] flex flex-col justify-between cursor-pointer hover:border-orange-500 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-cream-100 font-mono group-hover:text-orange-300 transition-colors">
                        {runAgent}
                      </h4>
                      <p className="text-xs text-orange-400 font-mono mt-0.5">
                        {runId} • {runName}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> RUNNING
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#201d1a] bg-dark-base p-3 rounded-lg border">
                    <div className="flex justify-between text-[11px] text-[#8a7f70] font-mono mb-1">
                      <span>Active Step</span>
                      <span className="text-orange-400 font-bold">
                        {runDuration}
                      </span>
                    </div>
                    <p className="text-xs text-cream-100 font-mono truncate">
                      {currentStep}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historical Runs Table */}
      <div className="bg-dark-card border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#201d1a] bg-[#121319] flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono text-cream-100 uppercase tracking-wider">
            Completed Run History ({filteredHistory.length})
          </h3>
          <span className="text-[11px] font-mono text-[#8a7f70]">
            Click any row to view execution DAG
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-dark-base text-[#a89f91] font-mono uppercase tracking-wider border-b border-[#201d1a]">
              <tr>
                <th className="px-4 py-3 font-semibold">Run ID</th>
                <th className="px-4 py-3 font-semibold">Workflow</th>
                <th className="px-4 py-3 font-semibold">Agent</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                <th className="px-4 py-3 font-semibold">Tokens</th>
                <th className="px-4 py-3 font-semibold text-right">Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#201d1a] text-cream-100 font-mono">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="py-12 text-center text-[#8a7f70] font-mono text-xs"
                  >
                    {search
                      ? `No runs found matching "${search}"`
                      : "No historical workflow runs found in this workspace."}
                  </td>
                </tr>
              ) : (
                filteredHistory.map((h) => {
                  const runId = h.customId || h._id || h.id;
                  const runName = h.name || h.workflow || "Workflow Task";
                  const runAgent =
                    h.leadAgent || h.agent || "Orchestrator Swarm";
                  const runDuration =
                    h.duration ||
                    (h.metrics?.duration ? `${h.metrics.duration}s` : "45s");
                  const runTokens =
                    h.tokensUsed ||
                    (h.metrics?.tokensUsed
                      ? `${h.metrics.tokensUsed}`
                      : "12.4k");
                  const runTrigger = h.trigger || "manual";

                  return (
                    <tr
                      key={runId}
                      onClick={() =>
                        onNavigate && onNavigate("workflow-detail", runId)
                      }
                      className="hover:bg-[#14151b] transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-bold text-orange-400">
                        {runId}
                      </td>
                      <td className="px-4 py-3 font-medium text-cream-100 max-w-xs truncate">
                        {runName}
                      </td>
                      <td className="px-4 py-3 text-[#d6c5a8]">{runAgent}</td>
                      <td className="px-4 py-3">{getStatusBadge(h.status)}</td>
                      <td className="px-4 py-3 text-[#8a7f70]">
                        {runDuration}
                      </td>
                      <td className="px-4 py-3 text-[#a89f91]">{runTokens}</td>
                      <td className="px-4 py-3 text-right text-[#8a7f70]">
                        {runTrigger}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkflowRunsView;
export { WorkflowRunsView };
