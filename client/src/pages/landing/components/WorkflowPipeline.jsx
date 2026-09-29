import WorkNodeGrid from "../../../components/WorkNodeGrid";
import { steps } from "../../../utils/data";

const WorkflowPipeline = () => {
  return (
    <section
      id="pipeline"
      className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="bg-[#0e0f14] border border-[#201d1a] hover:border-orange-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(249,115,22,0.08)] max-w-8xl mx-auto text-left transition-all">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#201d1a] pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">
              Execution Engine
            </span>
            <h3 className="text-lg font-bold text-[#faf7f0] font-mono mt-0.5">
              The PRAXIS Multi-Agent Workflow Pipeline
            </h3>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Stream
            </span>
          </div>
        </div>

        {/* Step Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs">
          {steps.map((step) => (
            <WorkNodeGrid key={step.id} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkflowPipeline;
