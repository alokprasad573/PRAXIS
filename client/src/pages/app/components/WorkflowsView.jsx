import { useState } from "react";
import { Plus, Search, Bot, Eye } from "lucide-react";

const WorkflowsView = ({
  workflows = [],
  onNavigate,
  onOpenNewWorkflow,
}) => {
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredWorkflows = workflows.filter((wf) => {
    const matchesSearch =
      wf.name.toLowerCase().includes(search.toLowerCase()) ||
      wf.id.toLowerCase().includes(search.toLowerCase()) ||
      (wf.branch && wf.branch.toLowerCase().includes(search.toLowerCase()));

    const matchesProject =
      projectFilter === "All Projects" || wf.project === projectFilter;

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
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#181920] text-[#faf7f0] font-mono">
            {status || "Active"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#faf7f0] tracking-tight">
            Workflows
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            {workflows.length} configured engineering workflows • 3 executing
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewWorkflow}
          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.35)] flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> New Workflow
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 bg-[#0e0f14] border border-[#201d1a] rounded-xl p-3 font-mono text-xs">
        <div className="relative grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflow name, ID, branch..."
            className="w-full bg-[#070709] border border-[#26231f] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#faf7f0] focus:outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="bg-[#070709] border border-[#26231f] rounded-lg px-3 py-1.5 text-xs text-[#d6c5a8] focus:outline-none focus:border-orange-500"
        >
          <option>All Projects</option>
          <option>payments-api</option>
          <option>ecommerce-frontend</option>
          <option>auth-service</option>
          <option>data-pipeline</option>
        </select>
        <select className="bg-[#070709] border border-[#26231f] rounded-lg px-3 py-1.5 text-xs text-[#d6c5a8] focus:outline-none focus:border-orange-500">
          <option>Sort: Newest First</option>
          <option>Sort: Status</option>
          <option>Sort: Progress</option>
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
                : "bg-[#0e0f14] text-[#d6c5a8] border border-[#201d1a] hover:border-orange-500/30"
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Workflows Table */}
      <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#070709] text-[#a89f91] font-mono uppercase tracking-wider border-b border-[#201d1a]">
              <tr>
                <th className="px-4 py-3 font-semibold">Workflow</th>
                <th className="px-4 py-3 font-semibold">Project / Branch</th>
                <th className="px-4 py-3 font-semibold">Trigger</th>
                <th className="px-4 py-3 font-semibold">Agents</th>
                <th className="px-4 py-3 font-semibold">Progress</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#201d1a] text-[#faf7f0] font-mono">
              {filteredWorkflows.map((wf) => (
                <tr
                  key={wf.id}
                  onClick={() => onNavigate("workflow-detail", wf.id)}
                  className="hover:bg-[#14151b] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-orange-400">{wf.id}</div>
                    <div className="text-xs text-[#faf7f0] font-sans font-medium mt-0.5">
                      {wf.name}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#d6c5a8]">
                    <div>{wf.project || "payments-api"}</div>
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
                    <span className="flex items-center gap-1 text-[#d6c5a8]">
                      <Bot className="w-3.5 h-3.5 text-orange-400" />{" "}
                      {wf.agents ? wf.agents.length : 3}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#181920] rounded-full h-1.5 overflow-hidden border border-[#23201d]">
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
                  <td className="px-4 py-3.5">{getStatusBadge(wf.status)}</td>
                  <td className="px-4 py-3.5 text-[#8a7f70]">
                    {wf.duration || "0s"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate("workflow-detail", wf.id);
                      }}
                      className="text-[#a89f91] hover:text-orange-400 p-1 transition-colors cursor-pointer"
                      title="View workflow"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkflowsView;

export { WorkflowsView };
