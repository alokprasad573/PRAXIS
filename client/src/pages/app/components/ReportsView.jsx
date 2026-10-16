import { Download, Copy, Share2, ShieldAlert, CheckCircle, Check } from "lucide-react";

const ReportsView = ({ onToast }) => {
  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#faf7f0] tracking-tight">
            Engineering Reports
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            Multi-agent synthesized technical reports and compliance artifacts.
          </p>
        </div>
        <div className="flex gap-2.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => onToast && onToast("Generating PDF export...", "info")}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#14151b] text-[#faf7f0] border border-[#282420] rounded-lg hover:bg-[#1c1d25] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" /> Export PDF
          </button>
          <button
            type="button"
            onClick={() => onToast && onToast("Report markdown copied to clipboard", "success")}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#14151b] text-[#faf7f0] border border-[#282420] rounded-lg hover:bg-[#1c1d25] transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-orange-400" /> Copy Markdown
          </button>
          <button
            type="button"
            onClick={() => onToast && onToast("Share link created", "info")}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.3)] cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar: List of Reports */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-[#0e0f14] border border-orange-500/50 p-4 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.1)] relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500" />
            <div className="text-[10px] font-mono text-orange-400 font-bold mb-1">
              WF-2047
            </div>
            <div className="text-sm font-bold text-[#faf7f0] mb-2">
              Security Vulnerability Scan
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                COMPLETED
              </span>
              <span className="text-[10px] text-[#a89f91] font-mono">
                payments-api
              </span>
            </div>
          </div>

          <div className="bg-[#0e0f14] border border-[#201d1a] p-4 rounded-xl cursor-pointer hover:border-orange-500/30 transition-all opacity-80">
            <div className="text-[10px] font-mono text-orange-400 font-bold mb-1">
              WF-2048
            </div>
            <div className="text-sm font-bold text-[#faf7f0] mb-2">
              Improve Test Coverage (Loop 2)
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-orange-500/15 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />{" "}
                IN PROGRESS
              </span>
              <span className="text-[10px] text-[#a89f91] font-mono">
                payments-api
              </span>
            </div>
          </div>

          <div className="bg-[#0e0f14] border border-[#201d1a] p-4 rounded-xl cursor-pointer hover:border-orange-500/30 transition-all opacity-60">
            <div className="text-[10px] font-mono text-[#8a7f70] mb-1">
              WF-2046
            </div>
            <div className="text-sm font-bold text-[#faf7f0] mb-2">
              OpenAPI Documentation Spec
            </div>
            <div className="flex items-center justify-between">
              <span className="bg-[#181920] text-[#a89f91] border border-[#282420] px-2 py-0.5 rounded text-[10px] font-mono">
                WAITING GATE
              </span>
              <span className="text-[10px] text-[#8a7f70] font-mono">
                ecommerce
              </span>
            </div>
          </div>
        </div>

        {/* Main Report Panel */}
        <div className="lg:col-span-3">
          <div className="bg-[#0e0f14] border border-[#201d1a] rounded-xl p-8 shadow-xl">
            <div className="border-b border-[#201d1a] pb-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px] font-mono font-bold border border-orange-500/30">
                  FINAL SYNTHESIS
                </span>
                <span className="text-xs font-mono text-[#8a7f70]">
                  2026-08-31 20:06:12 UTC
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#faf7f0]">
                Security Vulnerability &amp; Static Analysis Audit
              </h2>
              <p className="text-xs text-[#a89f91] font-mono mt-1">
                Synthesized by Review Agent from Code Analysis, Security, and Research agent telemetry.
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#070709] border border-[#201d1a] rounded-xl p-4">
                <div className="text-[10px] font-mono text-[#8a7f70] uppercase">
                  Vulnerabilities
                </div>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  1 Critical
                </div>
              </div>
              <div className="bg-[#070709] border border-[#201d1a] rounded-xl p-4">
                <div className="text-[10px] font-mono text-[#8a7f70] uppercase">
                  Code Smells
                </div>
                <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                  14 Detected
                </div>
              </div>
              <div className="bg-[#070709] border border-[#201d1a] rounded-xl p-4">
                <div className="text-[10px] font-mono text-[#8a7f70] uppercase">
                  OKF Compliance
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  100% Passed
                </div>
              </div>
              <div className="bg-[#070709] border border-[#201d1a] rounded-xl p-4">
                <div className="text-[10px] font-mono text-[#8a7f70] uppercase">
                  Audit Duration
                </div>
                <div className="text-2xl font-bold font-mono text-[#faf7f0] mt-1">
                  6m 12s
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <div className="mb-8">
              <h3 className="text-sm font-bold font-mono text-[#faf7f0] uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" /> Critical Security Finding
              </h3>
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 font-mono text-xs">
                <div className="flex items-center justify-between text-rose-300 font-bold mb-1">
                  <span>CWE-89: SQL Injection via /api/search Query Param</span>
                  <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded">
                    CVSS 9.4
                  </span>
                </div>
                <p className="text-[#d6c5a8] leading-relaxed mt-2">
                  Unsanitized query string interpolated directly into RawQuery in{" "}
                  <code>src/controllers/search.go:42</code>.
                </p>
                <div className="mt-3 p-3 bg-[#070709] rounded border border-rose-500/20 text-[#faf7f0]">
                  <span className="text-emerald-400 font-bold">
                    Suggested Remediation:
                  </span>{" "}
                  Use parameterized prepared statement{" "}
                  <code>db.QueryRowContext(ctx, &quot;SELECT * FROM items WHERE query = $1&quot;, searchParam)</code>.
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-sm font-bold font-mono text-[#faf7f0] uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Review Agent Verification Sign-off
              </h3>
              <div className="bg-[#070709] border border-[#201d1a] rounded-xl p-4 font-mono text-xs text-[#faf7f0] space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> All unit tests in Jest verified with zero regression.
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Pull request generated on branch <code>fix/sql-injection-search</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;

export { ReportsView };
