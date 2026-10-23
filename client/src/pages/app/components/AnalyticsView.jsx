import { useState } from "react";
import { ArrowUp, ArrowDown, TrendingDown, Minus, TrendingUp } from "lucide-react";
import {
  mockAnalyticsData,
  mockTokenByAgent,
} from "../../../utils/dashboardData";

const AnalyticsView = ({
  analyticsData = mockAnalyticsData,
  tokenByAgent = mockTokenByAgent,
}) => {
  const [timeframe, setTimeframe] = useState("Last 7 Days");

  const successTrend = analyticsData.workflowSuccessRate;
  const days = analyticsData.days;
  const dailyRuns = analyticsData.agentRuns;

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#faf7f0] tracking-tight">
            System Analytics &amp; Performance
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            Multi-agent token throughput, execution latencies, and autonomous success distributions.
          </p>
        </div>
        <div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-[#0e0f14] border border-[#201d1a] text-[#faf7f0] text-xs font-mono rounded-lg px-3.5 py-2 focus:outline-none focus:border-orange-500"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-5 hover:border-orange-500/30 transition-colors">
          <div className="text-[11px] text-[#a89f91] uppercase font-mono mb-1">
            Workflow Success Rate
          </div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              94.2%
            </div>
            <div className="text-xs text-emerald-400 mb-1 flex items-center">
              <ArrowUp className="w-3 h-3" /> 2.1%{" "}
              <span className="text-[#78716c] ml-1">vs last week</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-5 hover:border-orange-500/30 transition-colors">
          <div className="text-[11px] text-[#a89f91] uppercase font-mono mb-1">
            Avg Execution Duration
          </div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-[#faf7f0] font-mono">
              7m 22s
            </div>
            <div className="text-xs text-emerald-400 mb-1 flex items-center">
              <ArrowDown className="w-3 h-3" /> 0.8%{" "}
              <span className="text-[#78716c] ml-1">vs last week</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-5 hover:border-orange-500/30 transition-colors">
          <div className="text-[11px] text-[#a89f91] uppercase font-mono mb-1">
            Total Token Usage
          </div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-orange-400 font-mono">
              4.2M
            </div>
            <div className="text-xs text-orange-300 mb-1 flex items-center">
              <ArrowUp className="w-3 h-3" /> 12%{" "}
              <span className="text-[#78716c] ml-1">vs last week</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-5 hover:border-orange-500/30 transition-colors">
          <div className="text-[11px] text-[#a89f91] uppercase font-mono mb-1">
            Total Platform Cost
          </div>
          <div className="flex items-end gap-3">
            <div className="text-2xl font-bold text-[#d6c5a8] font-mono">
              $12.84
            </div>
            <div className="text-xs text-orange-300 mb-1 flex items-center">
              <ArrowUp className="w-3 h-3" /> 12%{" "}
              <span className="text-[#78716c] ml-1">vs last week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-6 shadow-xl">
          <h3 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider mb-4">
            Workflow Success Rate Trend (%)
          </h3>
          <div className="h-64 flex flex-col justify-end pt-6">
            <div className="flex items-end justify-between h-48 gap-3 px-2 border-b border-[#201d1a]">
              {successTrend.map((rate, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-orange-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {rate}%
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-orange-600/40 to-orange-500 rounded-t transition-all hover:brightness-125"
                    style={{ height: `${(rate - 75) * 4}%` }}
                  />
                  <span className="text-[10px] font-mono text-[#8a7f70]">
                    {days[idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-6 shadow-xl">
          <h3 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider mb-4">
            Token Consumption by Agent
          </h3>
          <div className="h-64 flex flex-col justify-center space-y-3 font-mono text-xs">
            {tokenByAgent.map((agent) => (
              <div key={agent.name} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#d6c5a8]">{agent.name}</span>
                  <span className="text-orange-400 font-bold">{agent.tokens} tokens</span>
                </div>
                <div className="w-full bg-[#181920] rounded-full h-1.5 overflow-hidden border border-[#23201d]">
                  <div
                    className="bg-orange-500 h-1.5 rounded-full"
                    style={{ width: `${(agent.val / 200) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-6 shadow-xl">
          <h3 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider mb-4">
            Agent Success Rate Benchmarks
          </h3>
          <div className="h-64 flex flex-col justify-around font-mono text-xs">
            {[
              { name: "Code Analysis", rate: "96.4%" },
              { name: "Security Agent", rate: "98.1%" },
              { name: "Unit Test Agent", rate: "91.7%" },
              { name: "DevOps Agent", rate: "87.3%" },
              { name: "Review Agent", rate: "97.6%" },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded bg-[#070709] border border-[#201d1a]">
                <span className="text-[#faf7f0]">{item.name}</span>
                <span className="text-emerald-400 font-bold">{item.rate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-6 shadow-xl">
          <h3 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider mb-4">
            Daily Workflow Execution Volumes
          </h3>
          <div className="h-64 flex flex-col justify-end pt-6">
            <div className="flex items-end justify-between h-48 gap-3 px-2 border-b border-[#201d1a]">
              {dailyRuns.map((runs, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {runs}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600/40 to-emerald-500 rounded-t transition-all hover:brightness-125"
                    style={{ height: `${(runs / 50) * 100}%` }}
                  />
                  <span className="text-[10px] font-mono text-[#8a7f70]">
                    {days[idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics Table */}
      <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#201d1a] bg-[#121319]">
          <h3 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider">
            Reliability &amp; Governance Indicators
          </h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-[#070709] border-b border-[#201d1a] text-[#a89f91] font-mono uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Reliability Dimension</th>
              <th className="px-5 py-3 font-semibold">Current Metric</th>
              <th className="px-5 py-3 font-semibold">Delta</th>
              <th className="px-5 py-3 font-semibold">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#201d1a] text-[#faf7f0] font-mono">
            <tr className="hover:bg-[#14151b] transition-colors">
              <td className="px-5 py-3 text-[#d6c5a8]">Autonomous Loop Retries</td>
              <td className="px-5 py-3 font-bold text-orange-400">14</td>
              <td className="px-5 py-3 text-emerald-400">-3 this week</td>
              <td className="px-5 py-3 text-emerald-400">
                <TrendingDown className="w-4 h-4" />
              </td>
            </tr>
            <tr className="hover:bg-[#14151b] transition-colors">
              <td className="px-5 py-3 text-[#d6c5a8]">
                Approval Gate Authorization Rate
              </td>
              <td className="px-5 py-3 font-bold text-emerald-400">87%</td>
              <td className="px-5 py-3 text-[#8a7f70]">stable</td>
              <td className="px-5 py-3 text-[#8a7f70]">
                <Minus className="w-4 h-4" />
              </td>
            </tr>
            <tr className="hover:bg-[#14151b] transition-colors">
              <td className="px-5 py-3 text-[#d6c5a8]">
                Sandboxed Tool Invocations
              </td>
              <td className="px-5 py-3 font-bold text-orange-300">342</td>
              <td className="px-5 py-3 text-orange-400">+15%</td>
              <td className="px-5 py-3 text-orange-400">
                <TrendingUp className="w-4 h-4" />
              </td>
            </tr>
            <tr className="hover:bg-[#14151b] transition-colors">
              <td className="px-5 py-3 text-[#d6c5a8]">
                RAG Vector Cache Hit Rate
              </td>
              <td className="px-5 py-3 font-bold text-emerald-400">91.4%</td>
              <td className="px-5 py-3 text-emerald-400">+0.8%</td>
              <td className="px-5 py-3 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsView;

export { AnalyticsView };
