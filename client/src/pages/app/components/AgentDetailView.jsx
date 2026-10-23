import {
  ArrowLeft,
  TestTube2,
  Cpu,
  Activity,
  CheckCircle,
  Play,
  Repeat,
  ChevronLeft,
  Database,
  Search,
  Target,
  ListOrdered,
  Sparkles,
  PlayCircle,
  AlertTriangle,
  Wrench,
  RotateCw,
  FileText,
  Check,
  Terminal,
} from "lucide-react";

const AgentDetailView = ({
  agentId = "agent-003",
  agents = [],
  onNavigate,
  onToast,
}) => {
  const agent =
    agents.find((a) => a.id === agentId) || {
      id: "agent-003",
      name: "Unit Test Agent",
      model: "claude-3-5-sonnet",
      status: "running",
      totalRuns: 156,
      successRate: 91.7,
      description:
        "Autonomous test gap discovery, test synthesis, execution in sandbox, and iterative self-improvement loop.",
    };

  const steps = [
    { name: "Repository Source Files", status: "done", icon: Database, time: "0.2s" },
    { name: "Analyze Existing Test Suites", status: "done", icon: Search, time: "1.4s" },
    { name: "AST & Coverage Gap Detection", status: "done", icon: Target, time: "2.8s" },
    { name: "Prioritize Untested Logic Paths", status: "done", icon: ListOrdered, time: "0.6s" },
    { name: "Synthesize Unit Test Cases", status: "done", icon: Sparkles, time: "8.2s" },
    { name: "Execute in Sandboxed Test Runner", status: "running", icon: PlayCircle, label: "Loop 2 Active" },
    { name: "Evaluate Failures & Trace Logs", status: "waiting", icon: AlertTriangle },
    { name: "Regenerate Failed Fixtures/Mocks", status: "waiting", icon: Wrench },
    { name: "Re-run & Confirm Coverage Threshold", status: "waiting", icon: RotateCw },
    { name: "Synthesize Final Engineering Report", status: "waiting", icon: FileText },
  ];

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div>
        <button
          type="button"
          onClick={() => onNavigate("agents")}
          className="text-xs text-[#a89f91] hover:text-orange-400 flex items-center gap-1.5 mb-4 font-mono transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Agent Library
        </button>

        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/35 flex items-center justify-center text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)] shrink-0">
              <TestTube2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold text-cream-100">
                  {agent.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-[#181920] text-orange-400 font-mono font-bold">
                  {agent.status}
                </span>
              </div>
              <p className="text-xs text-[#b8ab97] font-sans max-w-2xl leading-relaxed">
                {agent.description}
              </p>
              <div className="flex items-center gap-5 mt-3 text-xs text-[#a89f91] font-mono">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-orange-400" /> Model:{" "}
                  <span className="text-cream-100">{agent.model}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-400" /> Runs:{" "}
                  <span className="text-cream-100">{agent.totalRuns || 156}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Success:{" "}
                  <span className="text-emerald-400 font-bold">
                    {agent.successRate || 91.7}%
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() =>
                onToast && onToast("Unit Test Agent execution started", "info")
              }
              className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(249,115,22,0.35)] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Trigger Run
            </button>
          </div>
        </div>
      </div>

      {/* Agent Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: The Unit Test Loop Visualizer */}
        <div className="bg-dark-card border border-[#201d1a] rounded-xl p-6 shadow-xl">
          <h3 className="text-xs font-bold font-mono text-cream-100 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Repeat className="w-4 h-4 text-orange-500" /> Autonomous Unit Test Loop Architecture
          </h3>

          <div className="relative pl-6 space-y-3.5">
            {/* Vertical line connecting nodes */}
            <div className="absolute left-7.75 top-4 bottom-4 w-0.5 bg-[#201d1a] z-0" />

            {/* Loop back arrow visualization */}
            <div className="absolute right-4 top-1/2 bottom-8 w-6 border-t-2 border-r-2 border-b-2 border-orange-500/40 rounded-r-xl z-0 border-dashed" />
            <div className="absolute right-3.5 top-1/2 -mt-1.25 text-orange-500">
              <ChevronLeft className="w-3.5 h-3.5" />
            </div>

            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.name}
                  className={`relative z-10 flex items-center justify-between bg-dark-base border ${
                    step.status === "running"
                      ? "border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.2)] bg-orange-500/5"
                      : "border-dark-border"
                  } rounded-xl p-3 shadow-sm transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs ${
                        step.status === "done"
                          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                          : step.status === "running"
                            ? "border-orange-500 bg-orange-500/20 text-orange-400 animate-pulse"
                            : "border-[#26231f] bg-[#14151b] text-[#78716c]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span
                      className={`text-xs font-mono font-medium ${
                        step.status === "waiting"
                          ? "text-[#8a7f70]"
                          : step.status === "running"
                            ? "text-orange-300 font-bold"
                            : "text-cream-100"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    {step.label && (
                      <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-0.5 rounded font-bold">
                        {step.label}
                      </span>
                    )}
                    {step.time && (
                      <span className="text-[#8a7f70]">{step.time}</span>
                    )}
                    {step.status === "done" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : step.status === "running" ? (
                      <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#363028]" />
                    )}
                  </div>
                </div>
              );
            })}

            <div className="absolute right-8 top-1/2 -mt-4 text-[9px] text-orange-400 font-mono tracking-wider rotate-90 origin-right whitespace-nowrap bg-dark-card px-1.5 font-bold">
              IF COVERAGE &lt; 80%, RETRY LOOP
            </div>
          </div>
        </div>

        {/* Right: Live Metrics & Progress */}
        <div className="space-y-6">
          <div className="bg-dark-card border border-[#201d1a] rounded-xl p-6 shadow-xl">
            <h3 className="text-xs font-bold font-mono text-cream-100 uppercase tracking-wider mb-4">
              Code Coverage Delta Progress
            </h3>
            <div className="space-y-4 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[#8a7f70] mb-1.5">
                  <span>Initial Base Coverage</span>
                  <span className="text-cream-100">48%</span>
                </div>
                <div className="w-full bg-[#181920] rounded-full h-2 overflow-hidden border border-[#26231f]">
                  <div className="bg-[#524c45] h-2 rounded-full" style={{ width: "48%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-orange-300 font-bold">Current Loop Coverage</span>
                  <span className="text-orange-400 font-extrabold text-sm">74% (+26%)</span>
                </div>
                <div className="w-full bg-[#181920] rounded-full h-2 relative border border-[#26231f]">
                  <div
                    className="bg-orange-500 h-2 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                    style={{ width: "74%" }}
                  />
                  {/* Target marker 80% */}
                  <div className="absolute -top-1 -bottom-1 w-1 bg-amber-400 left-[80%] shadow-[0_0_8px_rgba(251,191,36,0.8)] rounded-full" />
                </div>
                <div className="text-[10px] text-amber-400 mt-1.5 text-right font-bold">
                  ★ Target Threshold: 80%
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-card border border-[#201d1a] rounded-xl p-5 shadow-xl">
              <h3 className="text-xs font-bold font-mono text-cream-100 uppercase tracking-wider mb-3">
                Test Execution
              </h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#a89f91]">Generated:</span>
                  <span className="text-cream-100 font-bold">43</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a89f91]">Passing:</span>
                  <span className="text-emerald-400 font-bold">41</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a89f91]">Failed:</span>
                  <span className="text-rose-400 font-bold">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a89f91]">Retries:</span>
                  <span className="text-orange-400 font-bold">1 Loop</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-card border border-[#201d1a] rounded-xl p-5 shadow-xl">
              <h3 className="text-xs font-bold font-mono text-cream-100 uppercase tracking-wider mb-3">
                Token Consumption
              </h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[#a89f91]">Input Tokens:</span>
                  <span className="text-cream-100">18,302</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a89f91]">Output Tokens:</span>
                  <span className="text-cream-100">8,441</span>
                </div>
                <div className="flex justify-between border-t border-[#201d1a] pt-1.5 mt-1.5">
                  <span className="text-orange-300">Total:</span>
                  <span className="text-orange-300 font-bold">26,743</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#8a7f70] pt-1">
                  <span className="text-[#78716c]">Est. API Cost:</span>
                  <span className="text-emerald-400 font-bold">$0.48</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-base border border-[#201d1a] rounded-xl p-4 font-mono text-xs text-[#d6c5a8]">
            <div className="text-[10px] text-orange-400 mb-2 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Last Agent Output
            </div>
            <p className="leading-relaxed text-cream-100">
              &quot;Remediating StripeWebhook.verifySignature failure. Added missing fixture for event timestamp offset. Re-running Jest test runner in sandbox...&quot;
            </p>
            <div className="mt-2 text-[10px] text-[#8a7f70]">
              ~ Just now • Autonomous Fix #2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailView;

export { AgentDetailView };
