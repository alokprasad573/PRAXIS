const AgentGrid = ({ agent }) => {
  const IconComponent = agent.icon;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-cream-100 font-mono text-sm">
              {agent.title}
            </h4>
            <span className="text-[10px] text-orange-400 font-mono">
              {agent.model}
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          {agent.successRate}
        </span>
      </div>

      <p className="text-xs text-[#a89f91] mb-4">{agent.description}</p>

      <div className="bg-dark-base p-3 rounded-lg border border-dark-border font-mono text-[10px] text-[#d6c5a8]">
        {agent.capabilities}
      </div>
    </>
  );
};

export default AgentGrid;