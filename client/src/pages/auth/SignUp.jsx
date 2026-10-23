import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/InputField";
import { authApi } from "../../utils/apiService";
import { useAuth } from "../../context/useAuth";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Correct hook invocation

  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Form Validations
    if (!signUpData.name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!signUpData.email || !signUpData.email.includes("@")) {
      setErrorMsg("Please enter a valid work email address.");
      return;
    }
    if (signUpData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call Backend Register API
      const res = await authApi.register(
        signUpData.name.trim(),
        signUpData.email.trim(),
        signUpData.password
      );

      if (res.success && res.data?.token) {
        // 2. Set Auth State globally in Context
        login(res.data.token, res.data.user);

        // 3. Navigate to Dashboard
        navigate("/app", { replace: true });
      } else {
        setErrorMsg(res.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Cannot connect to backend server. Make sure server is running on port 8000.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUpSubmit} className="space-y-4">
      {/* Full Name */}
      <InputField
        id="nameUp"
        label="Full Name"
        type="text"
        placeholder="Alok Prasad"
        value={signUpData.name}
        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
        icon={<User className="h-4 w-4 text-[#8a7f70]" />}
        required
      />

      {/* Work Email */}
      <InputField
        id="emailUp"
        label="Work Email"
        type="email"
        placeholder="engineer@enterprise.com"
        value={signUpData.email}
        onChange={(e) =>
          setSignUpData({ ...signUpData, email: e.target.value })
        }
        icon={<Mail className="h-4 w-4 text-[#8a7f70]" />}
        required
      />

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-2 gap-3">
        <InputField
          id="passwordUp"
          label="Password"
          type={showSignUpPassword ? "text" : "password"}
          placeholder="••••••••"
          value={signUpData.password}
          onChange={(e) =>
            setSignUpData({ ...signUpData, password: e.target.value })
          }
          icon={<Lock className="h-4 w-4 text-[#8a7f70]" />}
          required
          children={
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8a7f70] hover:text-cream-100 cursor-pointer"
              onClick={() => setShowSignUpPassword(!showSignUpPassword)}
            >
              {showSignUpPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          }
        />

        <InputField
          id="passwordConfirmUp"
          label="Confirm"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          value={signUpData.confirmPassword}
          onChange={(e) =>
            setSignUpData({ ...signUpData, confirmPassword: e.target.value })
          }
          icon={<Lock className="h-4 w-4 text-[#8a7f70]" />}
          required
          children={
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8a7f70] hover:text-cream-100 cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          }
        />
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
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
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};

export default SignUp;