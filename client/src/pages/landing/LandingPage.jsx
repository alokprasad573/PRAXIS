import LandingNavbar from "./components/LandingNavbar";
import HeroSection from "./components/HeroSection";
import WorkflowPipeline from "./components/WorkflowPipeline";
import ArchitectureFoundation from "./components/ArchitectureFoundation";
import AgentSwarm from "./components/AgentSwarm";
import OKFSection from "./components/OKFSection";
import CTABanner from "./components/CTABanner";
import LandingFooter from "./components/LandingFooter";
import FloatingImagesCanvas from "../../ui/FloatingImagesCanvas";
import { useAuth } from "../../context/useAuth";

const LandingPage = () => {
  // Directly connects to global AuthContext
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-dark-base font-sans text-cream-100 relative">
      <FloatingImagesCanvas className="z-0" />
      <LandingNavbar isAuthenticated={isAuthenticated} />
      <main className="relative z-10 flex-1 overflow-hidden">
        <HeroSection isAuthenticated={isAuthenticated} />
        <WorkflowPipeline />
        <ArchitectureFoundation />
        <AgentSwarm />
        <OKFSection />
        <CTABanner />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
