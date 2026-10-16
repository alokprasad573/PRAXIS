import { ArrowRight } from "lucide-react";
import logo from "../../../assets/images/logo.svg";
import { Link } from "react-router-dom";

const CTABanner = ({ isAuthenticated }) => {
  return (
    <>
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative z-10">
        <div className="bg-linear-to-tr from-[#14120f] via-[#1c1813] to-dark-card border border-orange-500/40 rounded-3xl p-10 sm:p-14 shadow-[0_10px_50px_rgba(249,115,22,0.15)] relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#090a0e] border border-orange-500/30 flex items-center justify-center p-2.5 mx-auto mb-6 shadow-xl">
            <img src={logo} alt="logo" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-cream-100 mb-4">
            Ready to Automate Your Engineering Workflows?
          </h2>

          <p className="text-sm text-[#d6c5a8] max-w-xl mx-auto mb-8 font-sans">
            Connect your GitHub repository in under 2 minutes and let
            PRAXIS orchestrate the heavy lifting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-sm">
            <Link
              to={isAuthenticated ? "/app" : "/auth"}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] flex items-center gap-2"
            >
              <span>Open Control Panel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default CTABanner;
