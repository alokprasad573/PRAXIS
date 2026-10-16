import { ShieldCheck, Check } from "lucide-react";
import { policies, markdownText } from "../../../utils/data";

const OKFSection = () => {
  return (
    <section id="okf" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="bg-dark-card border border-[#201d1a] rounded-2xl p-8 sm:p-12 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-500/15 text-orange-400 font-mono text-xs mb-4 border border-orange-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Open Knowledge Format (OKF)
            </div>
            <h2 className="text-3xl font-extrabold text-cream-100 mb-4">
              Deterministic Code Guardrails That Never Fail
            </h2>
            <p className="text-sm text-[#b8ab97] leading-relaxed mb-6 font-sans">
              While LLMs hallucinate probabilistic text, OKF executes
              deterministic structural rule schemas. If an agent tries to drop a
              table or push unreviewed code directly to main, OKF blocks
              execution and opens an approval gate.
            </p>
            
            <div className="space-y-3 font-mono text-xs">
              {policies.map((policy, index) => (
                <div key={index} className="flex items-center gap-3 text-[#d6c5a8]">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{policy}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Code Sample Preview in Markdown Format */}
          <div className="bg-dark-base border border-dark-border rounded-xl overflow-hidden font-mono text-xs shadow-xl">
            <div className="px-4 py-3 bg-[#121319] border-b border-[#201d1a] flex items-center justify-between text-[#8a7f70]">
              <span className="text-orange-400 font-bold">database_safety.okf.md</span>
              <span>Markdown Spec</span>
            </div>
            <div className="p-5 text-cream-100 overflow-x-auto">
              <pre className="font-mono text-xs text-[#d6c5a8] leading-relaxed whitespace-pre-wrap">
                {markdownText}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default OKFSection;
