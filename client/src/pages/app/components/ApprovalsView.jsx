import { AlertCircle, File, Check } from "lucide-react";

const ApprovalsView = ({
  approvals = [],
  history = [],
  onApprove,
  onReject,
  onToast,
}) => {
  return (
    <div className="space-y-8 animate-fadeInUp font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight font-sans">
              Human-in-the-Loop Approvals
            </h1>
            <span
              id="pending-approvals-count"
              className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40"
            >
              {approvals.length}
            </span>
          </div>
          <p className="text-xs text-[#b8ab97] font-mono">
            Governed decision gates protecting production environments, database migrations, and code merges.
          </p>
        </div>
      </div>

      {/* Active Pending Approvals */}
      <div className="space-y-6">
        <h2 className="text-xs font-bold font-mono text-cream-100 uppercase tracking-wider flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500" /> Pending Decision Requests
        </h2>

        {approvals.length === 0 ? (
          <div className="bg-dark-card border border-[#201d1a] rounded-xl p-8 text-center font-mono">
            <p className="text-sm text-[#b8ab97]">
              No pending approval gates. Swarm operations are cleared for execution.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((a) => {
              const gateId = a.approvalId || a.id || a._id;
              const isHigh = a.risk === "high" || a.risk === "critical";
              const files = a.affectedFiles || a.filesAffected || [];
              const wfName = a.workflow?.customId || a.workflow?.name || a.workflow || "Workflow";

              return (
                <div
                  key={gateId}
                  id={`approval-${gateId}`}
                  className={`bg-dark-card border ${
                    isHigh
                      ? "border-orange-500/40 shadow-[0_0_25px_rgba(249,115,22,0.1)]"
                      : "border-[#282420]"
                  } rounded-xl p-6 relative overflow-hidden transition-all`}
                >
                  <div
                    className={`absolute top-0 left-0 w-1.5 h-full ${
                      isHigh ? "bg-orange-500" : "bg-amber-400"
                    }`}
                  />

                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono mb-1.5 flex-wrap">
                        <span className="font-bold text-orange-400">{wfName}</span>
                        <span className="text-[#8a7f70]">•</span>
                        <span className="text-[#a89f91]">{a.requestedBy || "Autonomous Agent"}</span>
                        <span className="text-[#8a7f70]">•</span>
                        <span className="text-[#a89f91]">{a.branch || "main"}</span>
                      </div>
                      <h3 className="text-base font-bold text-cream-100">{a.action}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-mono px-2.5 py-1 rounded font-bold uppercase border ${
                          isHigh
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {a.risk} Risk
                      </span>
                    </div>
                  </div>

                  <div className="bg-dark-base rounded-lg border border-dark-border p-4 text-xs font-mono mb-4 text-[#d6c5a8] leading-relaxed">
                    <p className="mb-2">
                      <b className="text-cream-100">Reason:</b> {a.reason || "Automatic gate triggered by autonomous orchestrator"}
                    </p>
                    <p className="text-orange-300">
                      <b className="text-orange-400">Impact Assessment:</b>{" "}
                      {a.impact || a.expectedImpact || "Awaiting authorization before container promotion"}
                    </p>
                  </div>

                  {files.length > 0 && (
                    <div className="mb-5">
                      <span className="text-[10px] font-mono uppercase text-[#8a7f70] font-bold block mb-1.5">
                        Affected File Assets
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {files.map((f) => (
                          <span
                            key={f}
                            className="text-[11px] font-mono bg-[#14151b] border border-[#26231f] text-cream-100 px-2.5 py-1 rounded flex items-center gap-1.5"
                          >
                            <File className="w-3 h-3 text-orange-400" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-3 border-t border-[#201d1a] font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => onApprove && onApprove(gateId)}
                      className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-[0_0_12px_rgba(249,115,22,0.35)] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Authorize &amp; Execute
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onToast && onToast("Change request sent to agent", "info")
                      }
                      className="bg-[#14151b] hover:bg-[#1c1d25] text-cream-100 border border-[#282420] px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Request Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject && onReject(gateId)}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approval Audit Log Table */}
      <div className="bg-dark-card border border-[#201d1a] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#201d1a] bg-[#121319] flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono text-cream-100 uppercase tracking-wider">
            Governance Audit Trail ({history.length})
          </h3>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8a7f70]">
            No historical approval decisions recorded yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-dark-base text-[#a89f91] font-mono uppercase tracking-wider border-b border-[#201d1a]">
              <tr>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold">Workflow</th>
                <th className="px-4 py-3 font-semibold">Action Requested</th>
                <th className="px-4 py-3 font-semibold">Decision Maker</th>
                <th className="px-4 py-3 font-semibold">Resolution</th>
                <th className="px-4 py-3 font-semibold">Review Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#201d1a] text-cream-100 font-mono">
              {history.map((h, idx) => {
                const dateStr = h.decidedAt
                  ? new Date(h.decidedAt).toLocaleString()
                  : h.date || "Recently";
                const wfStr = h.workflow?.customId || h.workflow?.name || h.workflow || "Workflow";
                const isApproved = h.status === "approved" || h.decision === "Approved";

                return (
                  <tr key={h._id || h.approvalId || idx} className="hover:bg-[#14151b] transition-colors">
                    <td className="px-4 py-3 text-[#8a7f70]">{dateStr}</td>
                    <td className="px-4 py-3 font-bold text-orange-400">{wfStr}</td>
                    <td className="px-4 py-3 font-medium text-cream-100">{h.action}</td>
                    <td className="px-4 py-3 text-[#d6c5a8]">{h.decidedByName || h.decidedBy?.name || "Admin"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isApproved
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {isApproved ? "Approved" : "Rejected"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8a7f70]">{h.decisionDuration || h.duration || "1m"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ApprovalsView;
export { ApprovalsView };
