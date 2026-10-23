import { useState } from "react";
import {
  Search,
  TestTube2,
  ArrowRight,
  Code2,
  ShieldAlert,
  Server,
  BookOpen,
  FileText,
  CheckSquare,
  Bot,
} from "lucide-react";

const AgentsView = ({ agents = [], onNavigate }) => {
  const [filter, setFilter] = useState("");

  const activeCount = agents.filter(
    (a) => a.status === "running" || a.status === "active",
  ).length;

  const iconMap = {
    "code-2": Code2,
    Code2: Code2,
    "shield-alert": ShieldAlert,
    ShieldAlert: ShieldAlert,
    "test-tube-2": TestTube2,
    TestTube2: TestTube2,
    server: Server,
    Server: Server,
    "book-open": BookOpen,
    BookOpen: BookOpen,
    "file-text": FileText,
    FileText: FileText,
    "check-square": CheckSquare,
    CheckSquare: CheckSquare,
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(filter.toLowerCase()) ||
      a.model.toLowerCase().includes(filter.toLowerCase()) ||
      (a.capabilities &&
        a.capabilities.some((c) =>
          c.toLowerCase().includes(filter.toLowerCase()),
        )),
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
      case "running":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
            {status}
          </span>
        );
      case "idle":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#181920] text-[#a89f91] border border-[#282420] font-mono">
            idle
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#181920] text-cream-100 font-mono">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
            Agent Library
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            {agents.length} specialized autonomous agents • {activeCount} active in cluster
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-orange-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter capabilities, tools, models..."
            className="bg-dark-card border border-[#26231f] text-cream-100 text-xs font-mono rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-orange-500 w-full sm:w-72 placeholder-[#6b645b]"
          />
        </div>
      </div>

      {/* Featured Agent Showcase: Unit Test Agent */}
      <div className="bg-linear-to-r from-[#14120f] via-[#1a1510] to-dark-card border border-orange-500/35 rounded-xl p-6 shadow-[0_4px_30px_rgba(249,115,22,0.1)] relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.3)]">
              <TestTube2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-cream-100">
                  Unit Test Agent
                </h2>
                <span className="text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/40 uppercase tracking-wider">
                  Signature Capability
                </span>
              </div>
              <p className="text-xs text-orange-200/70 font-mono mt-0.5">
                Autonomous Test Generation &amp; Iterative Self-Improvement Loop
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("agent-detail", "agent-003")}
            className="bg-orange-600 hover:bg-orange-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] flex items-center gap-1.5 cursor-pointer"
          >
            <span>Inspect Loop</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Iterative Loop Visualizer */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono my-4 p-3 bg-dark-base rounded-xl border border-dark-border">
          <span className="bg-[#14151b] border border-[#282420] text-cream-100 px-3 py-1 rounded-md">
            Analyze Source
          </span>
          <ArrowRight className="w-3 h-3 text-orange-500" />
          <span className="bg-[#14151b] border border-[#282420] text-cream-100 px-3 py-1 rounded-md">
            Identify Gaps
          </span>
          <ArrowRight className="w-3 h-3 text-orange-500" />
          <span className="bg-[#14151b] border border-[#282420] text-cream-100 px-3 py-1 rounded-md">
            Synthesize Tests
          </span>
          <ArrowRight className="w-3 h-3 text-orange-500" />
          <span className="bg-orange-500/20 border border-orange-500/40 text-orange-300 px-3 py-1 rounded-md font-bold">
            Run Sandbox
          </span>
          <ArrowRight className="w-3 h-3 text-orange-500" />
          <span className="bg-[#14151b] border border-[#282420] text-cream-100 px-3 py-1 rounded-md">
            Evaluate Failures
          </span>
          <ArrowRight className="w-3 h-3 text-orange-500" />
          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-md">
            Report Delta
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#d6c5a8] pt-1">
          <div>
            Initial: <span className="text-cream-100 font-bold">48%</span>
          </div>
          <div className="text-[#524c45]">→</div>
          <div>
            Current: <span className="text-orange-400 font-bold">74%</span>
          </div>
          <div className="text-[#524c45]">→</div>
          <div>
            Target: <span className="text-emerald-400 font-bold">80%</span>
          </div>
          <span className="text-[#363028]">|</span>
          <div className="text-[#8a7f70]">
            Generated: <span className="text-cream-100">43 Tests</span>
          </div>
          <div className="text-emerald-400 font-bold">41 Passed</div>
          <div className="text-rose-400 font-bold">2 In Retry</div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAgents.map((agent) => {
          const IconComponent = iconMap[agent.icon] || Bot;
          const caps = agent.capabilities || ["AST parsing", "Static analysis"];

          return (
            <div
              key={agent.id}
              onClick={() => onNavigate("agent-detail", agent.id)}
              className="bg-dark-card border border-[#201d1a] hover:border-orange-500/40 rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-[0_4px_20px_rgba(249,115,22,0.1)] group cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform shadow-sm">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {getStatusBadge(agent.status)}
                </div>

                <h3 className="text-sm font-bold text-cream-100 group-hover:text-orange-300 transition-colors mb-1">
                  {agent.name}
                </h3>
                <div className="text-[10px] font-mono text-orange-400/80 mb-3">
                  {agent.model || "gpt-4o"}
                </div>
                <p className="text-xs text-[#b8ab97] line-clamp-2 mb-4 font-sans leading-relaxed">
                  {agent.description || "Specialized autonomous engineering worker."}
                </p>

                <div className="mb-4">
                  <span className="text-[9px] font-mono uppercase text-[#78716c] font-bold block mb-1.5 tracking-wider">
                    Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {caps.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-mono bg-[#14151b] border border-[#26231f] text-[#d6c5a8] px-2 py-0.5 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#201d1a] flex items-center justify-between text-xs font-mono text-[#8a7f70]">
                <div>
                  Success:{" "}
                  <span className="text-emerald-400 font-bold">
                    {agent.successRate || 95}%
                  </span>
                </div>
                <div>
                  Avg:{" "}
                  <span className="text-cream-100">
                    {agent.avgDuration || "2m"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgentsView;

export { AgentsView };
