import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FloatingImagesCanvas from "../../ui/FloatingImagesCanvas";
import logo from "../../assets/images/logo.svg";
import AuthHeader from "./components/AuthHeader";
import SystemStatus from "./components/SystemStatus";
import TabButton from "./components/TabButton";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import { useAuth } from "../../context/useAuth";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";

const AuthPage = () => {
  const [tab, setTab] = useState("signin");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Listen for GitHub OAuth redirect with token in URL (Executes once when token is present)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    if (token) {
      let user = null;
      if (userParam) {
        try {
          user = JSON.parse(decodeURIComponent(userParam));
        } catch {
          user = null;
        }
      }
      // Save in AuthContext & redirect directly to /app dashboard
      login(token, user);
      navigate("/app", { replace: true });
    }
  }, [location.search, login, navigate]);

  const handleGitHubLogin = () => {
    // Redirect browser to backend GitHub OAuth trigger
    window.location.href = `${BASE_URL}${API_PATHS.AUTH.GITHUB_OAUTH}`;
  };

  return (
    <div className="min-h-screen bg-dark-base text-cream-100 flex flex-col items-center justify-center relative font-sans overflow-hidden py-12">
      <FloatingImagesCanvas className="z-0" />
      <div className="agentic-glow-center" />
      <div className="agentic-aurora-2" />

      <div className="w-full max-w-md px-4 relative z-10">
        <AuthHeader />

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-3 relative group cursor-pointer block">
            <div className="absolute -inset-1 bg-linear-to-r from-orange-600 via-amber-500 to-rose-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
            <div className="relative w-16 h-16 rounded-2xl bg-[#090a0e] border border-orange-500/30 flex items-center justify-center p-2 shadow-2xl">
              <img src={logo} className="w-12 h-12" alt="logo" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            PRAXIS
          </h1>
          <p className="text-orange-200/70 text-xs font-mono tracking-wider uppercase">
            Multi-Agent Orchestration Platform For Developers
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-xl overflow-hidden relative">
          {/* Tabs */}
          <div className="flex border-b border-[#23201c]">
            <TabButton
              label="Sign In"
              active={tab === "signin"}
              onClick={() => setTab("signin")}
            />
            <TabButton
              label="Sign Up"
              active={tab === "signup"}
              onClick={() => setTab("signup")}
            />
          </div>

          <div className="p-6 sm:p-8">
            {tab === "signin" ? <SignIn /> : <SignUp />}

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#24211c]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-dark-card px-2 text-[#78716c] font-mono uppercase">
                    or authenticate via
                  </span>
                </div>
              </div>
            </div>

            {/* GitHub OAuth Button */}
            <div className="mt-5">
              <button
                type="button"
                onClick={handleGitHubLogin}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-[#14151b] hover:bg-[#1c1e26] text-cream-100 text-sm font-mono rounded-lg transition-colors border border-[#2d2924] hover:border-orange-500/40 cursor-pointer shadow-sm"
              >
                <svg
                  className="h-5 w-5 mr-2.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#8a7f70] font-mono flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          PRAXIS v2.0.2 Beta
        </div>
      </div>
      <SystemStatus />
    </div>
  );
};

export default AuthPage;
