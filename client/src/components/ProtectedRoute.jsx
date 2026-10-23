import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";

// 🛡️ Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // 1. Initial auth check ke dauran loader dikhayega (page refresh par redirect hone se rokega)
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-base flex flex-col items-center justify-center text-cream-100 font-mono">
        <div className="w-9 h-9 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-[#8a7f70] tracking-widest uppercase">
          Verifying Session...
        </span>
      </div>
    );
  }

  // 2. Agar logged in nahi hai toh /auth page par bhej dega
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // 3. Authenticated hone par Dashboard load karega
  return children;
};

export default ProtectedRoute;