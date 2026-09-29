import { Link } from "react-router-dom";
import React from "react";
import Logo from "../../../components/Logo";
import { LogOut } from "lucide-react";

const LandingNavbar = ({ isAuthenticated, handleAuth }) => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* <!-- Sticky Navbar --> */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#070709]/80 backdrop-blur-xl border-b border-[#201d1a]/80 shadow-lg"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* <!-- Brand Logo --> */}
          <Logo />

          {/* <!-- Header Actions --> */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-3 font-mono text-xs">
              <Link
                to="/auth"
                className="px-3.5 py-2 rounded-lg text-[#d6c5a8] hover:text-white hover:bg-[#14151b] transition-colors border border-transparent hover:border-[#282420]"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(249,115,22,0.35)] hover:shadow-[0_0_22px_rgba(249,115,22,0.55)] flex items-center gap-1.5 border border-orange-400/40"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 pr-1.5 py-1 rounded-xl border border-[#201d1a] bg-[#0e0f14]">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-tr from-orange-600 to-amber-500 flex items-center justify-center shrink-0 relative border border-orange-400/40 shadow-sm">
                  <span className="text-xs font-bold text-white">AP</span>
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border-2 border-[#0c0d12]"></div>
                </div>
                <div className="hidden md:flex flex-col overflow-hidden text-left">
                  <span className="text-xs font-semibold text-[#faf7f0] truncate">
                    Alok Prasad
                  </span>
                  <span className="text-[9px] text-orange-400 font-mono">
                    Workspace Admin
                  </span>
                </div>
              </div>
              <button
                className="text-[#8a7f70] hover:text-orange-400 hover:bg-orange-500/15 p-1.5 rounded-lg transition-colors ml-0.5"
                onClick={handleAuth}
                title="Sign Out"
              >
                <LogOut  class="w-3.5 h-3.5"></LogOut>
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default LandingNavbar;
