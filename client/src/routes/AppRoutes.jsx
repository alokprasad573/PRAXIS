import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/landing/LandingPage';
import AuthPage from '../pages/auth/AuthPage'; 
import DashboardPage from '../pages/app/DashboardPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/app" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes;