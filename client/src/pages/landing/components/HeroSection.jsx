import { Link } from "react-router-dom";
import WorkSpacePreview from "../../../components/WorkSpacePreview";

const HeroSection = ({ isAuthenticated }) => {
  

  return (
    <>
      <section className="relative z-10 mx-auto max-w-10xl px-4 pt-20 pb-24 text-center sm:px-6 lg:px-8">
        {/* Product Badge */}
        <div className="mb-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-orange-500/30 bg-dark-card px-4 py-1.5 font-mono text-xs text-[#d6c5a8] shadow-[0_0_15px_rgba(249,115,22,0.15)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />

          <span>PRAXIS v2.0 Beta</span>

          <span className="text-[#524c45]">•</span>

          <span className="font-bold text-orange-400">
            Multi-Agent Orchestration Platform for Developers
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="mx-auto mb-6 max-w-8xl h-2text-4xl leading-[1.1] font-extrabold tracking-tight text-cream-100 sm:text-6xl lg:text-7xl">
          Multi-Agent Orchestration{" "}
          <span className="block orange-gradient-text">Built for Complex Engineering</span>
        </h1>

        {/* Description */}
        <p className="mx-auto mb-10 max-w-3xl text-base leading-relaxed font-sans text-[#b8ab97] sm:text-lg">
          Transform developer tasks into validated, observable, production-grade
          Pull Requests with specialized agent consensus,{" "}
          <span className="font-semibold text-cream-100">
            80% RAG + 20% OKF Context
          </span>
          , and deterministic validation guardrails.
        </p>

        {/* CTA Buttons */}
        <div className="mb-14 flex flex-col items-center justify-center gap-4 font-mono text-sm sm:flex-row">
          <Link
            to={isAuthenticated ? "/app" : "/auth"}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-400/40 bg-orange-600 px-8 py-3.5 font-bold text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all hover:bg-orange-500 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] sm:w-auto"
          >
            <span aria-hidden="true">▶</span>
            <span>Start Orchestration</span>
          </Link>

          <a
            href="#pipeline"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#282420] bg-dark-card px-8 py-3.5 font-semibold text-cream-100 transition-colors hover:border-orange-500/40 hover:bg-[#14151b] sm:w-auto"
          >
            <span>Explore Architecture</span>
          </a>
        </div>

        <WorkSpacePreview />
      </section>
    </>
  );
};

export default HeroSection;
