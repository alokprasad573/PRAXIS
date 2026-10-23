import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import InputField from "../../components/InputField";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../utils/apiService";
import { useAuth } from "../../context/useAuth";

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!signInData.email || !signInData.password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.login(signInData.email, signInData.password);
      if (res.success && res.data?.token) {
        login(res.data.token, res.data.user, signInData.remember);
        navigate("/app", { replace: true });
      } else {
        setErrorMsg(res.message || "Invalid credentials.");
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        "Account not found or invalid email/password credentials.";
      setErrorMsg(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignInSubmit} className="space-y-4">
      <InputField
        id="emailIn"
        label="Work Email"
        type="email"
        placeholder="engineer@enterprise.com"
        value={signInData.email}
        onChange={(e) =>
          setSignInData({ ...signInData, email: e.target.value })
        }
        icon={<Mail className="h-4 w-4 text-[#8a7f70]" />}
        required
      />

      <InputField
        id="passwordIn"
        label="Password"
        type={showSignInPassword ? "text" : "password"}
        placeholder="••••••••"
        value={signInData.password}
        onChange={(e) =>
          setSignInData({ ...signInData, password: e.target.value })
        }
        icon={<Lock className="h-4 w-4 text-[#8a7f70]" />}
        required
        children={
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8a7f70] hover:text-cream-100 cursor-pointer"
            onClick={() => setShowSignInPassword(!showSignInPassword)}
          >
            {showSignInPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
      />

      {/* Remember checkbox */}
      <div className="flex items-center pt-1">
        <input
          id="remember"
          type="checkbox"
          checked={signInData.remember}
          onChange={(e) =>
            setSignInData({ ...signInData, remember: e.target.checked })
          }
          className="h-4 w-4 rounded border-[#38322a] bg-dark-base text-orange-500 focus:ring-orange-500/30 accent-orange-500"
        />
        <label
          htmlFor="remember"
          className="ml-2 block text-xs text-[#b8ab97] font-mono select-none cursor-pointer"
        >
          Remember authentication token
        </label>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
          {errorMsg}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-2.5 rounded-lg text-base font-semibold flex items-center justify-center gap-2 mt-3 font-mono cursor-pointer transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            Authenticate <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};

export default SignIn;