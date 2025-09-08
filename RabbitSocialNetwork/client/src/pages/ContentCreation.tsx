import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/common/Header";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import LoadingScreen from "@/components/common/LoadingScreen";
import ContentSwiper from "@/components/content/ContentSwiper";
import BottomNav from "@/components/common/BottomNav";
import { OnboardingInput, ContentGenerationResponse } from "@shared/schema";
import { useContentGeneration } from "@/hooks/useContentGeneration";

export default function ContentCreation() {
  const [_, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<"onboarding" | "loading" | "results">("onboarding");
  const [preferences, setPreferences] = useState<OnboardingInput | null>(null);
  
  const { generateContent, isLoading, contentData } = useContentGeneration();

  const handleSkip = () => {
    setCurrentStep("loading");
    generateContent({
      contentType: "Thought",
      audience: "Tech VCs",
      tone: "Professional",
      platforms: ["LinkedIn", "Twitter"],
      imageOption: "Generate via DALL·E"
    });
  };

  const handleSubmitPreferences = async (data: OnboardingInput) => {
    setPreferences(data);
    setCurrentStep("loading");
    
    // Generate content based on preferences
    await generateContent(data);
    setCurrentStep("results");
  };

  const handleBack = () => {
    if (currentStep === "onboarding") {
      setLocation("/");
    } else {
      setCurrentStep("onboarding");
    }
  };

  return (
    <>
      <Header 
        showBackButton={true} 
        showSkipButton={currentStep === "onboarding"}
        onBackClick={handleBack}
        onSkipClick={handleSkip}
      />
      
      <main className="pb-16">
        {currentStep === "onboarding" && (
          <OnboardingFlow onComplete={handleSubmitPreferences} />
        )}
        
        {currentStep === "loading" && (
          <LoadingScreen />
        )}
        
        {currentStep === "results" && contentData && (
          <ContentSwiper contentData={contentData} preferences={preferences!} />
        )}
      </main>
      
      {currentStep === "results" && (
        <BottomNav />
      )}
    </>
  );
}
