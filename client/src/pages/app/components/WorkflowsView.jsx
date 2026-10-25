import { useState } from "react";
import { Plus, Search, Bot, Eye, Play } from "lucide-react";

const WorkflowsView = ({
  projects = [],
  workflows = [],
  onNavigate,
  onOpenNewWorkflow,
}) => {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredWorkflows = workflows.filter((wf) => {
    const wfId = wf.customId || wf.id || wf._id?.toString() || "";
    const projName = typeof wf.project === "object" ? (wf.project?.name || "") : (wf.project || "");

    const matchesSearch =
      (wf.name && wf.name.toLowerCase().includes(search.toLowerCase())) ||
      wfId.toLowerCase().includes(search.toLowerCase()) ||
      (wf.branch && wf.branch.toLowerCase().includes(search.toLowerCase()));

    const matchesProject =
      projectFilter === "All Projects" || projName === projectFilter;

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Running" &&
        (wf.status === "running" || wf.status === "in_progress")) ||
      (statusFilter === "Completed" && wf.status === "completed") ||
      (statusFilter === "Failed" && wf.status === "failed") ||
      (statusFilter === "Blocked" &&
        (wf.status === "blocked" || wf.status === "waiting"));

    return matchesSearch && matchesProject && matchesStatus;
  });

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
          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-500/15 text-slate-400 border border-slate-500/30 font-mono">
            {status}
          </span>
        );
    }
  };

  const runningCount = workflows.filter(
    (w) => w.status === "running" || w.status === "in_progress",
  ).length;

  return (
    <div className="space-y-6 animate-fadeInUp font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight font-sans">
            Workflows Orchestration
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            {workflows.length} configured engineering workflows • {runningCount}{" "}
            executing
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewWorkflow}
          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.35)] flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> New Workflow
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 bg-dark-card border border-[#201d1a] rounded-xl p-3 font-mono text-xs">
        <div className="relative grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflow name, ID, branch..."
            className="w-full bg-dark-base border border-[#26231f] rounded-lg pl-9 pr-4 py-1.5 text-xs text-cream-100 focus:outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="bg-dark-base border border-[#26231f] rounded-lg px-3 py-1.5 text-xs text-[#d6c5a8] focus:outline-none focus:border-orange-500"
        >
          <option value="All Projects">All Projects</option>
          {projects.map((p) => (
            <option key={p.id || p._id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2 font-mono text-xs">
        {["All", "Running", "Completed", "Failed", "Blocked"].map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => setStatusFilter(pill)}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              statusFilter === pill
                ? "font-bold bg-orange-600 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                : "bg-dark-card text-[#d6c5a8] border border-[#201d1a] hover:border-orange-500/30"
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Workflows Table */}
      <div className="bg-dark-card border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
        {filteredWorkflows.length === 0 ? (
          <div className="p-12 text-center text-[#8a7f70] text-xs font-mono">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3 text-orange-400">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <p className="text-cream-100 font-bold mb-1">No Workflows Found</p>
            <p className="text-[#8a7f70] mb-4">
              Click &quot;New Workflow&quot; to launch an autonomous multi-agent
              task execution.
            </p>
            <button
              type="button"
              onClick={onOpenNewWorkflow}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] cursor-pointer"
            >
              Launch First Workflow
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-dark-base text-[#a89f91] font-mono uppercase tracking-wider border-b border-[#201d1a]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Workflow</th>
                  <th className="px-4 py-3 font-semibold">Project / Branch</th>
                  <th className="px-4 py-3 font-semibold">Trigger</th>
                  <th className="px-4 py-3 font-semibold">Agents</th>
                  <th className="px-4 py-3 font-semibold">Progress</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201d1a] text-cream-100 font-mono">
                {filteredWorkflows.map((wf) => {
                  const wfId = wf.customId || wf.id || wf._id;
                  const projName = typeof wf.project === "object" ? (wf.project?.name || wf.project?.repo || "Project") : (wf.project || "Project");
                  const agentCount =
                    wf.agents?.length || wf.agentPipeline?.length || 4;

                  return (
                    <tr
                      key={wfId}
                      onClick={() => onNavigate("workflow-detail", wfId)}
                      className="hover:bg-[#14151b] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-orange-400">{wfId}</div>
                        <div className="text-xs text-cream-100 font-sans font-medium mt-0.5">
                          {wf.name}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#d6c5a8]">
                        <div>{projName}</div>
                        <div className="text-[10px] text-[#78716c]">
                          {wf.branch || "main"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[#181920] border border-[#282420] text-[#a89f91]">
                          {wf.trigger || "manual"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#d6c5a8]">
                          <Bot className="w-3.5 h-3.5 text-orange-400" />
                          {agentCount} Agents
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-dark-base rounded-full h-1.5 overflow-hidden border border-dark-border">
                            <div
                              className="bg-orange-500 h-1.5 rounded-full"
                              style={{ width: `${wf.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-orange-300 font-bold">
                            {wf.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {getStatusBadge(wf.status)}
                      </td>
                      <td className="px-4 py-3.5 text-[#8a7f70]">
                        {wf.duration || "0s"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate("workflow-detail", wfId);
                          }}
                          className="text-[#a89f91] hover:text-orange-400 p-1 transition-colors cursor-pointer"
                          title="View workflow"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowsView;
export { WorkflowsView };
