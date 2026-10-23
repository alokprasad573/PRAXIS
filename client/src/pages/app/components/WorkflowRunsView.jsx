import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

const WorkflowRunsView = ({
  activeRuns = [],
  historicalRuns = [],
  onNavigate,
  onOpenNewWorkflow,
}) => {
  const [search, setSearch] = useState("");

  const filteredHistory = historicalRuns.filter(
    (h) =>
      h.id?.toLowerCase().includes(search.toLowerCase()) ||
      h.workflow?.toLowerCase().includes(search.toLowerCase()) ||
      h.agent?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
            Workflow & Agent Runs
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
            className="bg-dark-card border border-[#201d1a] rounded-lg px-3.5 py-1.5 text-cream-100 focus:outline-none focus:border-orange-500"
          />
          <button
            type="button"
            onClick={onOpenNewWorkflow}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3.5 py-1.5 font-bold text-white transition-colors hover:bg-orange-500 cursor-pointer"
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
            {activeRuns.map((r) => (
              <div
                key={r.id}
                onClick={() => onNavigate && onNavigate("workflow-detail", r.id)}
                className="bg-dark-card border border-orange-500/40 rounded-xl p-5 shadow-[0_0_20px_rgba(249,115,22,0.1)] flex flex-col justify-between cursor-pointer hover:border-orange-500 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-cream-100 font-mono">
                      {r.agent || "Orchestrator"}
                    </h4>
                    <p className="text-xs text-orange-400 font-mono mt-0.5">
                      {r.id} • {r.name || r.workflow}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> RUNNING
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#201d1a] bg-dark-base p-3 rounded-lg border">
                  <div className="flex justify-between text-[11px] text-[#8a7f70] font-mono mb-1">
                    <span>Active Step</span>
                    <span className="text-orange-400 font-bold">{r.duration || "0s"}</span>
                  </div>
                  <p className="text-xs text-cream-100 font-mono truncate">
                    {r.step || "Processing task plan..."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Runs Table */}
      <div className="bg-dark-card border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#201d1a] bg-[#121319]">
          <h3 className="text-xs font-bold font-mono text-cream-100 uppercase tracking-wider">
            Completed Run History ({filteredHistory.length})
          </h3>
        </div>
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
                <td colSpan="7" className="py-12 text-center text-[#8a7f70] font-mono text-xs">
                  No historical workflow runs found in this workspace.
                </td>
              </tr>
            ) : (
              filteredHistory.map((h) => (
                <tr
                  key={h.id}
                  onClick={() => onNavigate && onNavigate("workflow-detail", h.id)}
                  className="hover:bg-[#14151b] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-bold text-orange-400">{h.id}</td>
                  <td className="px-4 py-3 font-medium">{h.workflow || h.name}</td>
                  <td className="px-4 py-3 text-[#d6c5a8]">{h.agent || "Orchestrator"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        h.status === "Success" || h.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {h.status || "Completed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8a7f70]">{h.duration || "0s"}</td>
                  <td className="px-4 py-3 text-[#a89f91]">{h.tokens || "0"}</td>
                  <td className="px-4 py-3 text-right text-[#8a7f70]">{h.trigger || "manual"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkflowRunsView;
export { WorkflowRunsView };
