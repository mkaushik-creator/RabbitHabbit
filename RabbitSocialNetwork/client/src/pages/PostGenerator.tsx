import { useState } from "react";
import { useLocation } from "wouter";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import LoadingScreen from "@/components/common/LoadingScreen";
import ContentSwiper from "@/components/content/ContentSwiper";
import MainHeader from "@/components/common/MainHeader";
import { OnboardingInput, ContentGenerationResponse } from "@shared/schema";
import { useContentGeneration } from "@/hooks/useContentGeneration";

export default function PostGenerator() {
  const [_, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<"onboarding" | "loading" | "results">("onboarding");
  const [preferences, setPreferences] = useState<OnboardingInput | null>(null);
  
  console.log("Post Generator page loaded");
  
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
      setLocation("/dashboard");
    } else {
      setCurrentStep("onboarding");
    }
  };

  return (
    <div className="pb-16">
      <MainHeader 
        title="Post Generator"
        showBackButton={true}
        onBackClick={handleBack}
      />
      
      {currentStep === "onboarding" && (
        <OnboardingFlow onComplete={handleSubmitPreferences} />
      )}
      
      {currentStep === "loading" && (
        <LoadingScreen />
      )}
      
      {currentStep === "results" && contentData && (
        <ContentSwiper contentData={contentData} preferences={preferences!} />
      )}
    </div>
  );
}