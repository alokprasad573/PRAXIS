const WorkNodeGrid = ({ step }) => {
  const IconComponent = step.icon;
  const isEmerald = step.variant === "emerald";
  const isHighlight = step.highlight;

  return (
    <div
      className={`bg-dark-base rounded-xl p-3 flex flex-col items-center text-center group transition-colors ${
        isEmerald
          ? "border border-emerald-500/30 hover:border-emerald-500/60"
          : isHighlight
          ? "border border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.15)]"
          : "border border-dark-border hover:border-orange-500/40"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
          isEmerald
            ? "bg-emerald-500/20 text-emerald-400"
            : isHighlight
            ? "bg-orange-500 text-black font-bold"
            : "bg-orange-500/15 text-orange-400"
        }`}
      >
        <IconComponent className="w-4 h-4" />
      </div>
      <span className={`font-bold ${isEmerald ? "text-emerald-300" : isHighlight ? "text-orange-300" : "text-cream-100"}`}>
        {step.id}. {step.title}
      </span>
      <span className={`text-[10px] mt-0.5 ${isEmerald ? "text-emerald-400/80" : isHighlight ? "text-orange-400/80" : "text-[#8a7f70]"}`}>
        {step.subtitle}
      </span>
    </div>
  );
};


export default WorkNodeGrid;