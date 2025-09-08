import { useState } from "react";
import { useLocation } from "wouter";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { OnboardingInput } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

export default function Onboarding() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  console.log("Onboarding page loaded");

  const handleComplete = async (data: OnboardingInput) => {
    console.log("Onboarding completed with data:", data);
    setIsCompleting(true);

    try {
      // Save onboarding data to backend
      const response = await apiRequest("POST", "/api/complete-onboarding", data);
      const result = await response.json();

      if (result.success) {
        console.log("Onboarding preferences saved:", result.preferences);
        
        // Show success state
        setIsCompleted(true);
        
        toast({
          title: "Setup Complete!",
          description: "Your preferences have been saved successfully.",
        });

        // Wait a moment to show success, then redirect
        setTimeout(() => {
          setLocation("/platform-connect");
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to save preferences");
      }
    } catch (error) {
      console.error("Onboarding completion error:", error);
      
      toast({
        title: "Setup Failed",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
      
      setIsCompleting(false);
    }
  };

  return (
    <div className="pb-16">
      {isCompleting || isCompleted ? (
        <div className="min-h-screen flex items-center justify-center px-6">
          <Card className="w-full max-w-md bg-white/80 backdrop-blur border-0 shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              {isCompleting && (
                <>
                  <div className="flex justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Setting up your profile...
                  </h2>
                  <p className="text-gray-600">
                    We're saving your preferences and preparing your content generation experience.
                  </p>
                </>
              )}
              
              {isCompleted && (
                <>
                  <div className="flex justify-center">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Setup Complete!
                  </h2>
                  <p className="text-gray-600">
                    Your preferences have been saved. Redirecting to platform connections...
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <OnboardingFlow onComplete={handleComplete} />
      )}
    </div>
  );
}