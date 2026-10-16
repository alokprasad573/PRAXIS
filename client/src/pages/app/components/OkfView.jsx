import { Plus, ShieldCheck } from "lucide-react";

const OkfView = ({ policies = [], onToast }) => {
  const defaultPolicies = [
    {
      id: "okf-001",
      name: "Production Deployment Gate",
      category: "Deployment",
      risk: "high",
      status: "enabled",
      description:
        "Requires explicit human approval before any agent triggers deployment to live production.",
      rule: 'if (env === "production" && action === "deploy") {\n  return requireHumanApproval({ risk: "high", reason: "Production gate" });\n}',
      triggers: 14,
      version: "v2.1",
    },
    {
      id: "okf-002",
      name: "Test Coverage Threshold (≥ 80%)",
      category: "Validation",
      risk: "medium",
      status: "enabled",
      description:
        "Generated PRs must maintain or increase test coverage. Target: 80%.",
      rule: 'assert(new_coverage >= 80, "Coverage threshold not met. Initiating loop.");',
      triggers: 28,
      version: "v1.3",
    },
    {
      id: "okf-003",
      name: "Database Mutation Guard",
      category: "Security",
      risk: "high",
      status: "enabled",
      description:
        "Agents are strictly forbidden from running DROP, TRUNCATE, or DELETE operations without approval.",
      rule: 'const forbidden = ["DROP", "TRUNCATE", "DELETE"];\nif (forbidden.some(op => sql.toUpperCase().includes(op))) {\n  return blockAction("Destructive SQL operation detected.");\n}',
      triggers: 3,
      version: "v1.0",
    },
    {
      id: "okf-004",
      name: "No Direct Main Branch Push",
      category: "Architecture",
      risk: "medium",
      status: "enabled",
      description:
        "All AI agent modifications must go through branch pull requests.",
      rule: 'if (targetBranch === "main" || targetBranch === "master") {\n  return createPullRequest();\n}',
      triggers: 41,
      version: "v1.1",
    },
    {
      id: "okf-005",
      name: "AI-Generated Code Review Policy",
      category: "Approval",
      risk: "medium",
      status: "enabled",
      description:
        "All AI-synthesized files require human review before merge.",
      rule: 'if (file.author === "AI_AGENT") {\n  return flagForHumanReview(file);\n}',
      triggers: 67,
      version: "v1.0",
    },
  ];

  const displayPolicies = policies.length > 0 ? policies : defaultPolicies;

  const renderCode = (rule) => {
    return (
      <pre className="leading-relaxed font-mono text-[11px] text-[#faf7f0]">
        <code>{rule}</code>
      </pre>
    );
  };

  const getRiskBadge = (risk) => {
    if (risk === "high") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
          High Risk
        </span>
      );
    }
    if (risk === "medium") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
          Medium Risk
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
        Low Risk
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-[#faf7f0] tracking-tight">
              OKF Policy Engine
            </h1>
            <span className="text-[10px] uppercase font-mono tracking-wider bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded font-bold border border-orange-500/30">
              20% Context Rules
            </span>
          </div>
          <p className="text-xs text-[#b8ab97] font-mono">
            Organizational Knowledge Framework: Deterministic guardrails and governance constraints.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToast && onToast("Create Policy modal opened", "info")}
          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Rule
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-[#faf7f0] text-sm font-mono">
              Deterministic Guardrails vs Stochastic LLMs
            </h3>
          </div>
          <p className="text-xs text-[#b8ab97] leading-relaxed font-sans">
            While RAG provides dynamic context (80%), OKF establishes immutable deterministic rules (20%) that agents cannot bypass. If a policy fails, the platform halts execution and invokes the Human-in-the-Loop review gate.
          </p>
        </div>
        <div className="w-full md:w-1/3 shrink-0 bg-[#070709] p-3 rounded-lg border border-[#23201d] font-mono text-xs">
          <div className="flex justify-between text-[11px] text-[#8a7f70] mb-1">
            <span>
              Active Rules: <b className="text-orange-400">5 Enabled</b>
            </span>
            <span>
              Interceptions: <b className="text-emerald-400">153</b>
            </span>
          </div>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayPolicies.map((p) => (
          <div
            key={p.id}
            className="bg-[#0e0f14] border border-[#201d1a] hover:border-orange-500/40 rounded-xl p-6 flex flex-col justify-between transition-all hover:shadow-[0_4px_20px_rgba(249,115,22,0.1)]"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-orange-400 font-bold">
                      {p.id || "OKF-RULE"}
                    </span>
                    <span className="text-[#524c45]">|</span>
                    <span className="text-[10px] font-mono text-[#a89f91]">
                      {p.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#faf7f0]">{p.name}</h3>
                </div>
                <div>{getRiskBadge(p.risk)}</div>
              </div>

              <p className="text-xs text-[#b8ab97] font-sans mb-4 leading-relaxed">
                {p.description}
              </p>

              <div className="mb-4">
                <div className="text-[10px] font-mono uppercase text-[#8a7f70] font-bold mb-1.5 flex items-center justify-between">
                  <span>Logic Constraint</span>
                  <span className="text-orange-400/80">
                    {p.version || "v1.0"}
                  </span>
                </div>
                <div className="bg-[#070709] border border-[#23201d] rounded-lg p-3 font-mono text-[11px] text-[#faf7f0] overflow-x-auto custom-scrollbar">
                  {renderCode(p.rule)}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#201d1a] flex items-center justify-between font-mono text-xs">
              <span className="text-[#8a7f70]">
                Triggered:{" "}
                <span className="text-[#faf7f0] font-bold">
                  {p.triggers || 0} times
                </span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-400 font-bold">
                  ACTIVE
                </span>
                <button
                  type="button"
                  onClick={() => onToast && onToast("Policy updated", "info")}
                  className="w-8 h-4 rounded-full bg-orange-600 flex items-center justify-end px-0.5 cursor-pointer"
                >
                  <div className="w-3 h-3 rounded-full bg-white" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OkfView;

export { OkfView };
