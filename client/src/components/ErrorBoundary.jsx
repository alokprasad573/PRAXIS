import { Component } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught render exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 rounded-xl bg-dark-card border border-rose-500/30 text-center font-mono">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-cream-100 mb-2">View Render Exception</h3>
          <p className="text-xs text-[#a89f91] mb-6 leading-relaxed">
            {this.state.error?.message || "An unexpected error occurred while rendering this view."}
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
                else window.location.reload();
              }}
              className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RotateCw className="w-3.5 h-3.5" /> Reload View
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

