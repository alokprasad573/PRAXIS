import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const Toast = ({ toasts = [], onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  const styles = {
    success: {
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/10",
      text: "text-emerald-300",
      Icon: CheckCircle,
    },
    error: {
      border: "border-rose-500/40",
      bg: "bg-rose-500/10",
      text: "text-rose-300",
      Icon: XCircle,
    },
    warning: {
      border: "border-amber-500/40",
      bg: "bg-amber-500/10",
      text: "text-amber-300",
      Icon: AlertTriangle,
    },
    info: {
      border: "border-orange-500/40",
      bg: "bg-orange-500/10",
      text: "text-orange-300",
      Icon: Info,
    },
  };

  return (
    <div
      id="toast-container"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const s = styles[toast.type] || styles.info;
        const IconComponent = s.Icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl border shadow-[0_10px_30px_rgba(0,0,0,0.8)] bg-dark-card ${s.border} ${s.text} min-w-70w-sm transform transition-all duration-300 animate-fadeInUp`}
          >
            <IconComponent className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-xs font-mono text-cream-100 leading-snug">
              {toast.message}
            </span>
            <button
              type="button"
              onClick={() => onDismiss && onDismiss(toast.id)}
              className="text-[#8a7f70] hover:text-cream-100 p-1 rounded hover:bg-[#181920] transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;

export { Toast };
