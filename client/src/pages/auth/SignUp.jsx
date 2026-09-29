import { useState } from "react";
import { Eye, EyeOff, Lock, User, Mail, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InputField from "../../components/InputField";

const SignUp = () => {
  const navigate = useNavigate();

  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    if (!signUpData.email || !signUpData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    navigate("/app");
  };

  return (
    <form onSubmit={handleSignUpSubmit} className="space-y-4">
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

      <InputField
        id="emailUp"
        label="Work Email"
        type="email"
        placeholder="engineer@enterprise.com"
        value={signUpData.email}
        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
        icon={<Mail className="h-4 w-4 text-[#8a7f70]" />}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <InputField
          id="passwordUp"
          label="Password"
          type={showSignUpPassword ? "text" : "password"}
          placeholder="••••••••"
          value={signUpData.password}
          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
          icon={<Lock className="h-4 w-4 text-[#8a7f70]" />}
          required
          children={
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8a7f70] hover:text-cream-100 cursor-pointer"
              onClick={() => setShowSignUpPassword(!showSignUpPassword)}
            >
              {showSignUpPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          }
        />

        <InputField
          id="passwordConfirmUp"
          label="Confirm"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          value={signUpData.confirmPassword}
          onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
          icon={<Lock className="h-4 w-4 text-[#8a7f70]" />}
          required
          children={
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8a7f70] hover:text-cream-100 cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          }
        />
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
        Create Account<ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};

export default SignUp;
