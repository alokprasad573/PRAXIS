import {
  GitBranch,
  FolderOpen,
  TestTube,
  Package,
  CheckSquare,
  Scan,
  Shield,
  Container,
} from "lucide-react";

const ToolsView = () => {
  const tools = [
    { name: "Git Engine", icon: GitBranch, status: "available", lastUsed: "2m ago", category: "VCS" },
    { name: "Sandboxed File System", icon: FolderOpen, status: "available", lastUsed: "just now", category: "Storage" },
    { name: "Jest Test Runner", icon: TestTube, status: "executing", lastUsed: "now", category: "Runtime" },
    { name: "Package Manager (npm/yarn)", icon: Package, status: "available", lastUsed: "5m ago", category: "Dependencies" },
    { name: "ESLint / Prettier", icon: CheckSquare, status: "available", lastUsed: "12m ago", category: "Quality" },
    { name: "AST Static Analyzer", icon: Scan, status: "available", lastUsed: "15m ago", category: "Analysis" },
    { name: "Semgrep Security Scanner", icon: Shield, status: "available", lastUsed: "1h ago", category: "Security" },
    { name: "Isolated Docker Sandbox", icon: Container, status: "available", lastUsed: "2h ago", category: "Containers" },
  ];

  const recentExecutions = [
    { tool: "Jest Test Runner", agent: "Unit Test Agent", command: "npm test -- --coverage", status: "running", duration: "00:18", exitCode: "--" },
    { tool: "ESLint", agent: "Code Analysis Agent", command: "eslint src/ --fix", status: "completed", duration: "12s", exitCode: "0" },
    { tool: "File System", agent: "Code Analysis Agent", command: "cat src/index.ts", status: "completed", duration: "1s", exitCode: "0" },
    { tool: "Git Engine", agent: "DevOps Agent", command: "git status -s", status: "completed", duration: "2s", exitCode: "0" },
    { tool: "Semgrep Security", agent: "Security Agent", command: "semgrep --config p/ci .", status: "completed", duration: "45s", exitCode: "0" },
  ];

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#faf7f0] tracking-tight">
            Tools &amp; Execution Sandbox
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            Isolated execution environments with strict resource constraints and governance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Sandbox Isolation Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Execution Monitor & Terminal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                <h2 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider">
                  Active Sandbox Process Monitor
                </h2>
              </div>
              <span className="text-xs font-mono text-orange-400 font-bold">
                Elapsed: 00:18
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#070709] border border-[#23201d] font-mono text-xs mb-4">
              <div>
                <div className="text-[10px] text-[#8a7f70] uppercase">Tool</div>
                <div className="text-[#faf7f0] font-bold">Jest Test Runner</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8a7f70] uppercase">Agent</div>
                <div className="text-orange-300 font-bold">Unit Test Agent</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8a7f70] uppercase">Memory Limit</div>
                <div className="text-[#faf7f0]">512 MB / 2 GB</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8a7f70] uppercase">Status</div>
                <div className="text-orange-400 font-bold animate-pulse">
                  Running in Sandbox
                </div>
              </div>
            </div>

            {/* Terminal output */}
            <div className="terminal-bg bg-[#070709] rounded-xl p-4 font-mono text-xs overflow-x-auto custom-scrollbar border border-[#23201d]">
              <div className="text-[#8a7f70] mb-2 flex items-center justify-between border-b border-[#201d1a] pb-2">
                <span className="text-[#a89f91]">
                  $ npm test -- --coverage --testPathPattern=auth
                </span>
                <span className="text-[10px] text-orange-400">PID 41922</span>
              </div>
              <div className="text-[#faf7f0] leading-relaxed space-y-1">
                <div>PASS tests/unit/auth_service.test.ts (2.41s)</div>
                <div>PASS tests/unit/jwt_validator.test.ts (1.18s)</div>
                <div className="text-amber-400">
                  RUNS tests/unit/stripe_webhook.test.ts...
                </div>
                <div className="text-emerald-400 font-bold mt-2">
                  Coverage Summary: 74.2% statements (Target: 80%)
                </div>
              </div>
            </div>
          </div>

          {/* Available Tools Grid */}
          <div>
            <h2 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider mb-4">
              Configured Sandbox Tools
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {tools.map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.name}
                    className="bg-[#0e0f14] border border-[#201d1a] hover:border-orange-500/40 rounded-xl p-4 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center border border-orange-500/30">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[9px] font-mono ${
                          t.status === "executing"
                            ? "text-orange-400 animate-pulse font-bold"
                            : "text-emerald-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#faf7f0] font-mono truncate">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-[#8a7f70] font-mono mt-0.5">
                      {t.category} • {t.lastUsed}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sandbox Security Guardrails */}
        <div className="space-y-6">
          <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-6 shadow-xl">
            <h3 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-500" />
              Sandbox Security Boundaries
            </h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#070709] rounded-lg border border-[#201d1a]">
                <div className="text-orange-400 font-bold text-[11px] mb-1">
                  Max Execution Timeout
                </div>
                <div className="text-[#a89f91]">
                  Strict 300s threshold per child process to prevent infinite loops.
                </div>
              </div>
              <div className="p-3 bg-[#070709] rounded-lg border border-[#201d1a]">
                <div className="text-orange-400 font-bold text-[11px] mb-1">
                  Network Egress Filter
                </div>
                <div className="text-[#a89f91]">
                  Outbound HTTP restricted to package registries and approved APIs.
                </div>
              </div>
              <div className="p-3 bg-[#070709] rounded-lg border border-[#201d1a]">
                <div className="text-orange-400 font-bold text-[11px] mb-1">
                  Ephemeral File System
                </div>
                <div className="text-[#a89f91]">
                  Temporary workspace container destroyed on workflow termination.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution History Table */}
      <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#201d1a] bg-[#121319]">
          <h3 className="text-xs font-bold font-mono text-[#faf7f0] uppercase tracking-wider">
            Recent Tool Executions
          </h3>
        </div>
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#070709] text-[#a89f91] font-mono uppercase tracking-wider border-b border-[#201d1a]">
            <tr>
              <th className="px-4 py-3 font-semibold">Tool</th>
              <th className="px-4 py-3 font-semibold">Agent</th>
              <th className="px-4 py-3 font-semibold">Executed Command</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold text-right">Exit Code</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#201d1a] text-[#faf7f0] font-mono">
            {recentExecutions.map((r, i) => (
              <tr key={i} className="hover:bg-[#14151b] transition-colors">
                <td className="px-4 py-3 font-bold">{r.tool}</td>
                <td className="px-4 py-3 text-orange-300">{r.agent}</td>
                <td className="px-4 py-3 text-[#d6c5a8] font-mono text-[11px]">
                  {r.command}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#8a7f70]">{r.duration}</td>
                <td
                  className={`px-4 py-3 text-right font-bold ${
                    r.exitCode === "0"
                      ? "text-emerald-400"
                      : r.exitCode === "--"
                        ? "text-orange-400"
                        : "text-rose-400"
                  }`}
                >
                  {r.exitCode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ToolsView;

export { ToolsView };
