import logo from "../../../assets/images/logo.svg";

const LandingFooter = () => {
  return (
    <>
      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 relative z-10 text-sm font-mono text-[#8a7f70]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="w-6 h-6 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <img src={logo} alt="logo" />
            </div>
            <span className="text-cream-100 font-bold">
              PRAXIS{" "}
              <span className="text-[9px] font-mono font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">
                v2.0 Beta
              </span>
            </span>
            <span>
              © {new Date().getFullYear()} PRAXIS Technologies Inc. All rights
              reserved.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingFooter;
