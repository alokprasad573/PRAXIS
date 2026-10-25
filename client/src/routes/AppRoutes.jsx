import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/landing/LandingPage";
import AuthPage from "../pages/auth/AuthPage";
import AcceptInvitePage from "../pages/auth/AcceptInvitePage";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

const DashboardPage = lazy(() => import("../pages/app/DashboardPage"));

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
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center bg-dark-base text-xs font-mono text-[#a89f91]">
                    Loading dashboard...
                  </div>
                }
              >
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;