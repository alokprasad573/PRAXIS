import React from "react";
import "../../styles/landing.css";
import LandingNavbar from "./components/LandingNavbar";
import HeroSection from "./components/HeroSection";
import WorkflowPipeline from "./components/WorkflowPipeline";
import ArchitectureFoundation from "./components/ArchitectureFoundation";
import AgentSwarm from "./components/AgentSwarm";
import OKFSection from "./components/OKFSection";
import CTABanner from "./components/CTABanner";
import LandingFooter from "./components/LandingFooter";
import FloatingImagesCanvas from "../../ui/FloatingImagesCanvas";


const LandingPage = () => {
  const [isAuthenticated, setAuthenticated] = React.useState(false)
  
  const handleAuth = () => {
    setAuthenticated((prev) => !prev)
  }

  return (
    <>
      <div className="min-h-screen bg-[#070709] font-sans text-[#faf7f0] relative">
        {/* -z-10 ke badle z-0 use karein */}
        <FloatingImagesCanvas className="z-0" />
        
        <LandingNavbar isAuthenticated={isAuthenticated}  handleAuth={handleAuth} />
        
        {/* Content canvas ke upar rahega */}
        <main className="relative z-10 flex-1 overflow-hidden">
          <HeroSection isAuthenticated={isAuthenticated} />
          <WorkflowPipeline />
          <ArchitectureFoundation />
          <AgentSwarm />
          <OKFSection />
          <CTABanner isAuthenticated={isAuthenticated} />
        </main>
        
        <LandingFooter />
      </div>
    </>
  );
};

export default LandingPage;
