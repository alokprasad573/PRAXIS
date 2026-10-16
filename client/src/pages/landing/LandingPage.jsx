import React from "react";
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
  const [isAuthenticated, setAuthenticated] = React.useState(false);


  return (
    <>
      <div className="min-h-screen bg-dark-base font-sans text-cream-100 relative">
        {/* -z-10 ke badle z-0 use karein */}
        <FloatingImagesCanvas className="z-0" />
        
        <LandingNavbar isAuthenticated={isAuthenticated} />
        
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
