import { Link } from "react-router-dom";
import React from "react";
import Logo from "../../../components/Logo";
import { ArrowRight } from "lucide-react";

const LandingNavbar = ({ isAuthenticated}) => {
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
            ? "bg-dark-base/80 backdrop-blur-xl border-b border-[#201d1a]/80 shadow-lg"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* <!-- Brand Logo --> */}
          <Logo />

          {/* <!-- Header Actions --> */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3 font-mono text-sm">
              <Link
                to="/app"
                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(249,115,22,0.35)] hover:shadow-[0_0_22px_rgba(249,115,22,0.55)] flex items-center gap-1.5 border border-orange-400/40"
              >
                Launch App <ArrowRight className="w-5 h-5"/>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 font-mono text-sm">
              <Link
                to="/auth"
                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(249,115,22,0.35)] hover:shadow-[0_0_22px_rgba(249,115,22,0.55)] flex items-center gap-1.5 border border-orange-400/40"
              >
                Sign In<ArrowRight className="w-5 h-5"/>
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default LandingNavbar;
