import { useState, useMemo } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Database,
  Activity,
  Trash2,
  Check,
  CheckCheck,
  Bell,
  RefreshCw,
} from "lucide-react";
import { notificationApi } from "../../../utils/apiService";

const getNotificationIcon = (type, category) => {
  if (type === "high-risk") return AlertTriangle;
  if (type === "approval" || category === "Approvals") return ShieldAlert;
  if (type === "success") return CheckCircle;
  if (category === "System" || type === "info") return Database;
  return Activity;
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const NotificationsView = ({
  notifications: initialNotifications = [],
  onMarkAllRead,
  onToast = () => {},
}) => {
  const [filterTab, setFilterTab] = useState("All Alerts");
  const [items, setItems] = useState(initialNotifications);
  const [previousNotifications, setPreviousNotifications] =
    useState(initialNotifications);
  const [loading, setLoading] = useState(false);

  // Adjust state during render when the prop changes, avoiding an effect-driven
  // cascading render.
  if (initialNotifications !== previousNotifications) {
    setPreviousNotifications(initialNotifications);
    if (initialNotifications && initialNotifications.length > 0) {
      setItems(initialNotifications);
    }
  }

  const fetchLive = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getAll();
      if (res?.success && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch {
      onToast("Failed to refresh notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
      if (onMarkAllRead) onMarkAllRead();
      onToast("All notifications marked as read", "success");
    } catch {
      onToast("Failed to mark all as read", "error");
    }
  };

  const handleMarkSingleRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationApi.markRead(id);
      setItems((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, unread: false } : n)),
      );
    } catch {
      // Non-blocking
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationApi.delete(id);
      setItems((prev) => prev.filter((n) => (n._id || n.id) !== id));
      onToast("Notification removed", "info");
    } catch {
      onToast("Failed to remove notification", "error");
    }
  };

  const filteredNotifs = useMemo(() => {
    if (filterTab === "All Alerts") return items;
    return items.filter(
      (n) =>
        n.category === filterTab ||
        (filterTab === "System" && n.category === "System Events"),
    );
  }, [items, filterTab]);

  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeInUp">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
              Notifications &amp; Telemetry Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#b8ab97] font-mono mt-1">
            Real-time alerts for human approval gates, policy violations, and
            workflow completions.
          </p>
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={fetchLive}
            disabled={loading}
            className="p-2 bg-[#14151b] hover:bg-[#1c1d25] text-cream-100 rounded-lg border border-[#282420] transition-colors cursor-pointer"
            title="Refresh alerts"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-orange-400" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className={`px-4 py-2 font-bold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              unreadCount > 0
                ? "bg-[#14151b] hover:bg-[#1c1d25] text-cream-100 border-[#282420]"
                : "bg-[#101116] text-[#6b6256] border-[#1d1b18] cursor-not-allowed"
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        </div>
      </div>

      <div className="border-b border-[#201d1a]">
        <nav className="flex space-x-6 font-mono text-xs overflow-x-auto pb-1">
          {[
            "All Alerts",
            "Approvals",
            "Agent Activity",
            "System",
            "Workflows",
          ].map((tab) => {
            const count =
              tab === "All Alerts"
                ? items.length
                : items.filter((n) => n.category === tab).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`pb-3 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  filterTab === tab
                    ? "text-orange-400 font-bold border-b-2 border-orange-500"
                    : "text-[#8a7f70] hover:text-cream-100"
                }`}
              >
                <span>{tab}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#181920] text-[#a89f91] border border-[#24211d]">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 font-mono text-xs">
          <span className="font-bold text-cream-100 uppercase tracking-wider">
            {filterTab} ({filteredNotifs.length})
          </span>
          {filteredNotifs.length > 0 && (
            <span className="text-[11px] text-[#8a7f70]">
              Click any notification to acknowledge
            </span>
          )}
        </div>

        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-dark-card border border-[#201d1a] font-mono">
            <Bell className="w-8 h-8 text-[#5e5549] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-cream-100">
              No alerts found
            </h4>
            <p className="text-xs text-[#8a7f70] mt-1">
              There are currently no alerts under the "{filterTab}" category.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map((n) => {
              const id = n._id || n.id;
              const Icon = getNotificationIcon(n.type, n.category);
              const isUnread = n.unread;

              return (
                <div
                  key={id}
                  onClick={(e) => isUnread && handleMarkSingleRead(id, e)}
                  className={`group flex items-start gap-4 p-4 bg-dark-card border rounded-xl transition-all cursor-pointer ${
                    isUnread
                      ? "border-[#2d2924] border-l-4 border-l-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.06)] bg-[#0d0e14]"
                      : "border-[#201d1a] opacity-80 hover:opacity-100"
                  } hover:border-orange-500/40`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                      n.type === "high-risk"
                        ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                        : n.type === "approval"
                          ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                          : n.type === "success"
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : "bg-blue-500/15 border-blue-500/30 text-blue-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 font-mono min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-cream-100 font-bold tracking-tight">
                          {n.title}
                        </p>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shrink-0"></span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8a7f70] shrink-0">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a89f91] mt-1 font-sans leading-relaxed">
                      {n.description || n.detail}
                    </p>
                    <div className="mt-2.5 flex items-center gap-3 text-[10px] text-[#8a7f70]">
                      <span className="px-2 py-0.5 rounded bg-[#14151b] border border-[#26231f]">
                        {n.category || "System"}
                      </span>
                      {n.type && (
                        <span className="uppercase text-[9px] font-bold text-[#b8ab97]">
                          {n.type}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUnread && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkSingleRead(id, e)}
                        className="p-1.5 rounded hover:bg-[#1f2029] text-[#a89f91] hover:text-emerald-400 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(id, e)}
                      className="p-1.5 rounded hover:bg-[#1f2029] text-[#8a7f70] hover:text-rose-400 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
export { NotificationsView };
