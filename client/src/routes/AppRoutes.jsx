import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/landing/LandingPage";
import AuthPage from "../pages/auth/AuthPage";
import DashboardPage from "../pages/app/DashboardPage";
import AcceptInvitePage from "../pages/auth/AcceptInvitePage";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* 🔗 Public Accept Invitation Route */}
          <Route path="/accept-invite" element={<AcceptInvitePage />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;