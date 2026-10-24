import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { workspaceApi } from "../../utils/apiService";
import { useAuth } from "../../context/useAuth";
import { Shield, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import logo from "../../assets/images/logo.svg";
import FloatingImagesCanvas from "../../ui/FloatingImagesCanvas";

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // 1. Verify invitation token on load
  useEffect(() => {
    if (!token) {
      return;
    }

    const checkInvite = async () => {
      try {
        const res = await workspaceApi.getInviteDetails(token);
        if (res.success && res.data) {
          setInviteInfo(res.data);
          if (res.data.name) setName(res.data.name);
        } else {
          setErrorMsg(res.message || "Invalid invitation token.");
        }
      } catch (err) {
        setErrorMsg(
          err.response?.data?.message ||
            "This invitation link has expired or has already been used.",
        );
      } finally {
        setLoading(false);
      }
    };

    checkInvite();
  }, [token]);

  // 2. Submit Accept & Join
  const handleJoin = async (e) => {
    e.preventDefault();
    setIsJoining(true);
    setErrorMsg("");

    try {
      const res = await workspaceApi.acceptInvite({
        token,
        password,
        name,
      });

      if (res.success && res.data?.token) {
        // Auto-login into the new workspace
        login(res.data.token, res.data.user);
        navigate("/app", { replace: true });
      } else {
        setErrorMsg(res.message || "Failed to join workspace.");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to accept invitation. Please try again.",
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-dark-base text-cream-100 font-mono">
      {/* Background Canvas & Ambient Glows */}
      <FloatingImagesCanvas className="z-0" />
      <div className="agentic-glow-center" />
      <div className="agentic-aurora-2" />

      {/* Centered Invitation Card */}
      <div className="w-full max-w-md bg-dark-card/95 backdrop-blur-md border border-[#2a2520] rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 my-auto">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#090a0e] border border-orange-500/30 flex items-center justify-center p-2 mb-3 shadow-lg">
            <img src={logo} alt="PRAXIS Logo" className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Join Workspace</h1>
          <p className="text-xs text-orange-400 mt-1 uppercase tracking-wider">
            PRAXIS Multi-Agent Orchestration
          </p>
        </div>

        {loading && token ? (
          <div className="py-12 flex flex-col items-center justify-center text-[#8a7f70] gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-xs">Verifying invitation credentials...</span>
          </div>
        ) : !token || (errorMsg && !inviteInfo) ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Invitation Invalid
            </h3>
            <p className="text-xs text-[#8a7f70] mb-6">
              {errorMsg || "Invitation link is missing or invalid."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="px-4 py-2 bg-[#181a24] hover:bg-[#222533] text-cream-100 rounded-lg text-xs font-bold border border-[#2a2520] transition-colors cursor-pointer"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            {/* Invite Details Box */}
            <div className="p-4 rounded-xl bg-[#14151e] border border-dark-border space-y-2">
              <div className="text-[11px] text-[#8a7f70]">
                <strong className="text-white">
                  {inviteInfo?.inviterName}
                </strong>{" "}
                invited you to:
              </div>
              <div className="text-base font-bold text-orange-400">
                {inviteInfo?.workspaceName}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#d6c5a8] pt-1 border-t border-[#1f1d19]">
                <Shield className="w-3.5 h-3.5 text-orange-400" />
                Role:{" "}
                <span className="text-white font-bold">{inviteInfo?.role}</span>
              </div>
              <div className="text-[11px] text-[#8a7f70]">
                Email:{" "}
                <span className="text-cream-100">{inviteInfo?.email}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!inviteInfo?.userExists && (
              <div>
                <label className="block uppercase text-[#d6c5a8] mb-1.5 font-bold text-[10px]">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-cream-100 text-xs outline-none focus:border-orange-500"
                />
              </div>
            )}

            <div>
              <label className="block uppercase text-[#d6c5a8] mb-1.5 font-bold text-[10px]">
                {inviteInfo?.userExists
                  ? "Enter Your Account Password"
                  : "Create Account Password"}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-base border border-[#282420] rounded-lg p-2.5 text-cream-100 text-xs outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(249,115,22,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining Workspace...
                </>
              ) : (
                <>
                  Accept & Enter Workspace <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitePage;
