import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const LogsView = ({ logs = [], executionLogs = [], onToast }) => {
  const [currentViewMode, setCurrentViewMode] = useState("table");
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("All Agents");
  const [statusFilter, setStatusFilter] = useState("All Statuses");

  useEffect(() => {
    let interval = null;
    if (isLiveMode) {
      interval = setInterval(() => {
        if (onToast) {
          onToast(
            "Live stream: [Unit Test Agent] Loop 2 iteration check passed",
            "info",
          );
        }
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveMode, onToast]);

  const defaultLogs = [
    {
      id: "log-1",
      timestamp: "22:10:18",
      workflowId: "WF-2048",
      agent: "Unit Test Agent",
      event: "Generated 12 new test cases for payment module",
      status: "success",
      duration: "2.1s",
      tokens: 4812,
      cost: "$0.09",
    },
    {
      id: "log-2",
      timestamp: "22:09:07",
      workflowId: "WF-2048",
      agent: "Unit Test Agent",
      event: "Test execution: 41/43 passed, 2 failures in webhook",
      status: "warning",
      duration: "8.3s",
      tokens: 0,
      cost: "$0.00",
    },
    {
      id: "log-3",
      timestamp: "22:08:44",
      workflowId: "WF-2048",
      agent: "Unit Test Agent",
      event: "Evaluating test failures, initiating autonomous fix loop",
      status: "running",
      duration: "12s",
      tokens: 2201,
      cost: "$0.04",
    },
    {
      id: "log-4",
      timestamp: "22:07:16",
      workflowId: "WF-2048",
      agent: "Research Agent",
      event: "Retrieved Jest testing patterns from RAG (24 chunks)",
      status: "success",
      duration: "3.1s",
      tokens: 6841,
      cost: "$0.12",
    },
    {
      id: "log-5",
      timestamp: "22:05:02",
      workflowId: "WF-2048",
      agent: "Code Analysis Agent",
      event: "Coverage gaps identified: 23 untested branch functions",
      status: "success",
      duration: "4.2s",
      tokens: 8291,
      cost: "$0.15",
    },
  ];

  const availableLogs = logs.length > 0 ? logs : executionLogs;
  const displayLogs = availableLogs.length > 0 ? availableLogs : defaultLogs;

  const filteredLogs = displayLogs.filter((l) => {
    const matchesSearch =
      l.event.toLowerCase().includes(search.toLowerCase()) ||
      l.agent.toLowerCase().includes(search.toLowerCase()) ||
      (l.workflowId && l.workflowId.toLowerCase().includes(search.toLowerCase()));

    const matchesAgent =
      agentFilter === "All Agents" || l.agent === agentFilter;

    const matchesStatus =
      statusFilter === "All Statuses" ||
      l.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesAgent && matchesStatus;
  });

  const getLogColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "success" || s === "completed") return "text-emerald-400";
    if (s === "error" || s === "failed") return "text-rose-400";
    if (s === "running" || s === "in_progress") return "text-orange-400";
    if (s === "warning") return "text-amber-400";
    return "text-[#faf7f0]";
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
            Real-Time Execution Logs
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            Granular multi-agent execution telemetry and tool interaction stream.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsLiveMode(!isLiveMode)}
            className="px-3.5 py-1.5 rounded-lg border border-[#282420] text-xs font-mono font-bold text-cream-100 hover:bg-[#14151b] transition-all flex items-center gap-2 cursor-pointer"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isLiveMode
                  ? "bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                  : "bg-[#8a7f70]"
              }`}
            />
            {isLiveMode ? "Live Mode Active" : "Live Mode"}
          </button>
          <div className="flex bg-dark-card p-1 rounded-lg border border-[#201d1a]">
            <button
              type="button"
              onClick={() => setCurrentViewMode("table")}
              className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                currentViewMode === "table"
                  ? "bg-orange-600 text-white font-bold"
                  : "text-[#a89f91] hover:text-white"
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setCurrentViewMode("terminal")}
              className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                currentViewMode === "terminal"
                  ? "bg-orange-600 text-white font-bold"
                  : "text-[#a89f91] hover:text-white"
              }`}
            >
              Terminal
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-orange-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter log stream..."
            className="w-full bg-dark-card border border-[#201d1a] text-cream-100 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="bg-dark-card border border-[#201d1a] text-cream-100 rounded-lg px-3 py-2 text-xs outline-none"
        >
          <option>All Agents</option>
          <option>Unit Test Agent</option>
          <option>Code Analysis Agent</option>
          <option>Research Agent</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-dark-card border border-[#201d1a] text-cream-100 rounded-lg px-3 py-2 text-xs outline-none"
        >
          <option>All Statuses</option>
          <option>Success</option>
          <option>Running</option>
          <option>Warning</option>
          <option>Error</option>
        </select>
      </div>

      {/* View Mode Container */}
      {currentViewMode === "table" ? (
        <div className="bg-dark-card border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-dark-base text-[#a89f91] font-mono uppercase tracking-wider border-b border-[#201d1a]">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Workflow</th>
                <th className="px-4 py-3 font-semibold">Agent</th>
                <th className="px-4 py-3 font-semibold">Event Description</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                <th className="px-4 py-3 font-semibold">Tokens</th>
                <th className="px-4 py-3 font-semibold text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#201d1a] text-cream-100 font-mono">
              {filteredLogs.map((l, i) => (
                <tr key={l.id || i} className="hover:bg-[#14151b] transition-colors">
                  <td className="px-4 py-3 text-[#8a7f70]">{l.timestamp}</td>
                  <td className="px-4 py-3 font-bold text-orange-400">
                    {l.workflowId || "WF-2048"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-orange-200">
                    {l.agent}
                  </td>
                  <td className="px-4 py-3 text-[#d6c5a8] font-sans truncate max-w-md">
                    {l.event}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${getLogColor(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8a7f70]">
                    {l.duration || "-"}
                  </td>
                  <td className="px-4 py-3 text-[#a89f91]">
                    {l.tokens ? l.tokens.toLocaleString() : "0"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-400">
                    {l.cost ? (typeof l.cost === "number" ? `$${l.cost.toFixed(2)}` : l.cost) : "$0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="terminal-bg bg-dark-base rounded-xl p-6 font-mono text-xs overflow-y-auto max-h-137.5 custom-scrollbar border border-[#201d1a] shadow-2xl">
          <div className="space-y-2.5">
            {filteredLogs.map((l, i) => (
              <div
                key={l.id || i}
                className="flex items-start gap-3 hover:bg-white/3 p-1.5 rounded transition-colors"
              >
                <span className="text-[#8a7f70] select-none shrink-0">
                  [{l.timestamp}]
                </span>
                <span className="text-orange-400 font-bold select-none shrink-0">
                  {l.workflowId || "WF-2048"}
                </span>
                <span className="text-orange-300 font-semibold select-none shrink-0">
                  &lt;{l.agent}&gt;
                </span>
                <span className={`${getLogColor(l.status)} flex-1 leading-relaxed`}>
                  {l.event}
                </span>
                {l.duration && (
                  <span className="text-[#6b645b] text-[10px] select-none">
                    ({l.duration})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsView;

export { LogsView };
