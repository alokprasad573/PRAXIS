import { agentsData } from "../../../utils/data";
import AgentGrid from "../../../components/AgentGrid";

const AgentSwarm = () => {
  return (
    <section
      id="agents"
      className="py-24  bg-[#0c0d12]/40 relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">
            Autonomous Specialists
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cream-100 mt-2 mb-4">
            The PRAXIS Autonomous Agent Swarm
          </h2>
          <p className="text-sm text-[#b8ab97]">
            Every agent has specialized AST parsing capabilities, sandboxed
            tools, and strict validation loops.
          </p>
        </div>

        {/* Agents Grid (Mapped) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentsData.map((agent) => (
            <div
              key={agent.id}
              className={`bg-dark-card rounded-xl p-6 transition-all ${
                agent.highlight
                  ? "border border-orange-500/30 shadow-md hover:border-orange-500/60"
                  : "border border-[#201d1a] hover:border-orange-500/30"
              }`}
            >
              <AgentGrid agent={agent} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgentSwarm;
