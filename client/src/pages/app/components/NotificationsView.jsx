import { useState } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle, Database } from "lucide-react";

const NotificationsView = ({ onToast }) => {
  const [filterTab, setFilterTab] = useState("All Alerts");
  const [notifs, setNotifs] = useState([
    {
      id: "1",
      type: "high-risk",
      icon: AlertTriangle,
      title: "APPROVAL GATE: Deploy auth-service to production (appr-001)",
      detail:
        "Human authorization required before triggering production cluster rolling restart.",
      time: "2m ago",
      unread: true,
      category: "Approvals",
    },
    {
      id: "2",
      type: "approval",
      icon: ShieldAlert,
      title: "APPROVAL GATE: Unit Test Agent requests commit for 43 test suites",
      detail: "Coverage raised from 48% to 74% on payments-api.",
      time: "8m ago",
      unread: true,
      category: "Approvals",
    },
    {
      id: "3",
      type: "success",
      icon: CheckCircle,
      title: "WORKFLOW COMPLETED: WF-2047 Security audit passed",
      detail:
        "Analyzed all project branches. 1 critical issue flagged with remediation fix.",
      time: "1h ago",
      unread: false,
      category: "Agent Activity",
    },
    {
      id: "4",
      type: "info",
      icon: Database,
      title: "RAG INDEXED: payments-api re-indexing completed (48,291 vector chunks)",
      detail: "Vector index updated with latest OpenAPI schemas.",
      time: "2h ago",
      unread: false,
      category: "System Events",
    },
  ]);

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
    if (onToast) onToast("All notifications marked as read", "success");
  };

  const filteredNotifs =
    filterTab === "All Alerts"
      ? notifs
      : notifs.filter((n) => n.category === filterTab);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
            Notifications &amp; Telemetry Alerts
          </h1>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            Real-time alerts for human approval gates, policy violations, and workflow completions.
          </p>
        </div>
        <div className="flex gap-3 font-mono text-xs">
          <button
            type="button"
            onClick={markAllRead}
            className="px-4 py-2 bg-[#14151b] hover:bg-[#1c1d25] text-cream-100 font-bold rounded-lg border border-[#282420] transition-colors cursor-pointer"
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="border-b border-[#201d1a]">
        <nav className="flex space-x-6 font-mono text-xs">
          {["All Alerts", "Approvals", "Agent Activity", "System Events"].map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`pb-3 transition-colors cursor-pointer ${
                  filterTab === tab
                    ? "text-orange-400 font-bold border-b-2 border-orange-500"
                    : "text-[#8a7f70] hover:text-cream-100"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </nav>
      </div>

      <div className="mb-6">
        <h3 className="text-xs font-bold text-cream-100 uppercase font-mono mb-3">
          Today
        </h3>
        <div className="space-y-3">
          {filteredNotifs.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 bg-dark-card border border-[#201d1a] rounded-xl hover:border-orange-500/40 cursor-pointer transition-all ${
                  n.unread
                    ? "border-l-4 border-l-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.08)]"
                    : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0 text-orange-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 font-mono">
                  <div className="flex items-start justify-between">
                    <p className="text-xs text-cream-100 font-bold">{n.title}</p>
                    <span className="text-[10px] text-[#8a7f70] ml-3 shrink-0">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a89f91] mt-1 font-sans leading-relaxed">
                    {n.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotificationsView;

export { NotificationsView };
