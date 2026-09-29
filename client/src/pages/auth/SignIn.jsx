import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import InputField from "../../components/InputField";
import { useNavigate } from "react-router-dom";

const SignIn = () => {

  const navigate = useNavigate();

  const [signInData, setSignInData] = useState({
    email: "engineer@company.com",
    password: "password123",
    remember: true,
  });

  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    if (!signInData.email || !signInData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    navigate("/app");
  };

  return (
    <form onSubmit={handleSignInSubmit} className="space-y-4">
      <InputField
        id="emailIn"
        label="Work Email"
        type="email"
        value={signInData.email}
        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
        icon={<Mail className="h-4 w-4 text-[#8a7f70]" />}
        required
      />

      <InputField
        id="passwordIn"
        label="Password"
        type={showSignInPassword ? "text" : "password"}
        value={signInData.password}
        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
        icon={<Lock className="h-4 w-4 text-[#8a7f70]" />}
        required
        children={
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8a7f70] hover:text-cream-100 cursor-pointer"
            onClick={() => setShowSignInPassword(!showSignInPassword)}
          >
            {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      {/* Remember checkbox */}
      <div className="flex items-center pt-1">
        <input
          id="remember"
          type="checkbox"
          checked={signInData.remember}
          onChange={(e) => setSignInData({ ...signInData, remember: e.target.checked })}
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
        <div className="mb-4 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        className="btn-primary w-full py-2.5 rounded-lg text-base font-semibold flex items-center justify-center gap-2 mt-3 font-mono cursor-pointer"
      >
        Authenticate <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};

export default SignIn