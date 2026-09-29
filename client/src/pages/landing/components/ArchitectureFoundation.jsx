import { Cpu, Layers, ShieldAlert } from "lucide-react";



const ArchitectureFoundation = () => {
  return (
    <>
       <section
        id="context"
        className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10"
      >
        <div className="text-center max-w-4xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest">
            Architectural Foundation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cream-100 mt-2 mb-4">
            Why PRAXIS Solves What Chatbots Cannot
          </h2>
          <p className="text-sm text-[#b8ab97]">
            Single LLM prompts hallucinate on large codebases. PRAXIS combines
            multi-agent decomposition with structured knowledge engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-dark-card border border-[#201d1a] hover:border-orange-500/40 rounded-2xl p-8 transition-all hover:shadow-[0_10px_30px_rgba(249,115,22,0.1)] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-cream-100 font-mono mb-2">
                Multi-Agent Swarm
              </h3>
              <p className="text-xs text-[#b8ab97] leading-relaxed mb-6 font-sans">
                Tasks are decomposed into dedicated sub-tasks executed by
                specialized agents: Code Analysis, Unit Testing, Security Audit,
                and DevOps.
              </p>
            </div>
            <div className="p-3 bg-dark-base rounded-lg border border-dark-border font-mono text-[11px] text-orange-300">
              ● Parallel & Linear execution modes with dependency graph DAG
              resolution.
            </div>
          </div>

          {/* Pillar 2: 80/20 Context */}
          <div className="bg-dark-card border border-orange-500/40 rounded-2xl p-8 transition-all shadow-[0_0_30px_rgba(249,115,22,0.1)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500 text-black font-bold flex items-center justify-center mb-6 shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-cream-100 font-mono mb-2">
                Unified 80/20 Context Model
              </h3>
              <p className="text-xs text-[#b8ab97] leading-relaxed mb-6 font-sans">
                Agents operate with an 80% dynamic semantic RAG vector context
                and 20% deterministic OKF policy rules, guaranteeing strict
                consistency without hallucination.
              </p>
            </div>
            <div className="p-3 bg-dark-base rounded-lg border border-dark-border font-mono text-[11px] text-amber-300">
              ● 80% RAG Vector Space + 20% OKF Deterministic Governance.
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-dark-card border border-[#201d1a] hover:border-orange-500/40 rounded-2xl p-8 transition-all hover:shadow-[0_10px_30px_rgba(249,115,22,0.1)] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-6">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-cream-100 font-mono mb-2">
                Deterministic Guardrails
              </h3>
              <p className="text-xs text-[#b8ab97] leading-relaxed mb-6 font-sans">
                Sandboxed tool execution prevents unauthorized bash commands,
                SQL DROPs, or direct main branch commits. High-risk actions
                trigger human approval gates.
              </p>
            </div>
            <div className="p-3 bg-dark-base rounded-lg border border-dark-border font-mono text-[11px] text-emerald-300">
              ● OKF Rule Policies with explicit human-in-the-loop signoff.
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ArchitectureFoundation;