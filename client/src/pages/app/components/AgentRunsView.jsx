import { useState } from "react";
import { mockAgentRuns } from "../../../utils/dashboardData";

const AgentRunsView = ({ agentRuns = mockAgentRuns }) => {
  const [selectedAgent, setSelectedAgent] = useState("All Agents");

  const filteredRuns =
    selectedAgent === "All Agents"
      ? agentRuns
      : agentRuns.filter((r) => r.agent === selectedAgent);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#faf7f0] tracking-tight">
            Agent Runs
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            Autonomous agent task executions across all workflows
          </p>
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-[#0e0f14] border border-[#201d1a] text-[#faf7f0] rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-500"
          >
            <option>All Agents</option>
            <option>Code Analysis Agent</option>
            <option>Unit Test Agent</option>
            <option>Security Agent</option>
            <option>Review Agent</option>
          </select>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-5 hover:border-orange-500/30 transition-colors">
          <p className="text-[11px] text-[#a89f91] uppercase font-mono mb-1">
            Total Runs Today
          </p>
          <p className="text-2xl font-bold font-mono text-[#faf7f0]">28 Runs</p>
        </div>
        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-5 hover:border-orange-500/30 transition-colors">
          <p className="text-[11px] text-[#a89f91] uppercase font-mono mb-1">
            Success Rate
          </p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold font-mono text-emerald-400">
              92.8%
            </p>
            <p className="text-xs text-[#8a7f70] mb-0.5 font-mono">(26/28)</p>
          </div>
        </div>
        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-5 hover:border-orange-500/30 transition-colors">
          <p className="text-[11px] text-[#a89f91] uppercase font-mono mb-1">
            Token Throughput
          </p>
          <p className="text-2xl font-bold font-mono text-orange-400">624K</p>
        </div>
        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-5 hover:border-orange-500/30 transition-colors">
          <p className="text-[11px] text-[#a89f91] uppercase font-mono mb-1">
            Avg Execution
          </p>
          <p className="text-2xl font-bold font-mono text-[#faf7f0]">2m 14s</p>
        </div>
      </div>

      {/* Runs Table */}
      <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#070709] text-[#a89f91] font-mono uppercase tracking-wider border-b border-[#201d1a]">
            <tr>
              <th className="px-4 py-3 font-semibold">Run ID</th>
              <th className="px-4 py-3 font-semibold">Agent</th>
              <th className="px-4 py-3 font-semibold">Task Objective</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Tokens</th>
              <th className="px-4 py-3 font-semibold text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#201d1a] text-[#faf7f0] font-mono">
            {filteredRuns.map((r) => (
              <tr key={r.id} className="hover:bg-[#14151b] transition-colors">
                <td className="px-4 py-3 font-bold text-orange-400">{r.id}</td>
                <td className="px-4 py-3 font-semibold text-[#faf7f0]">
                  {r.agent}
                </td>
                <td className="px-4 py-3 text-[#d6c5a8] font-sans truncate max-w-sm">
                  {r.task}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === "Success"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#8a7f70]">{r.duration}</td>
                <td className="px-4 py-3 text-[#a89f91]">{r.tokens}</td>
                <td className="px-4 py-3 text-right text-[#8a7f70]">{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentRunsView;

export { AgentRunsView };
