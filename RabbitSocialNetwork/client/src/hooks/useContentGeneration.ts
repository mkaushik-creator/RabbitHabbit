import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { OnboardingInput, ContentGenerationResponse } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useContentGeneration() {
  const [contentData, setContentData] = useState<ContentGenerationResponse | null>(null);
  const { toast } = useToast();
  
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async (preferences: OnboardingInput) => {
      try {
        // Make the API request to generate content
        const response = await fetch('/api/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preferences),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json() as ContentGenerationResponse;
      } catch (error) {
        console.error('API request failed:', error);
        throw new Error('Failed to generate content. Please try again.');
      }
    },
    onSuccess: (data: ContentGenerationResponse) => {
      console.log('Content generation successful:', data);
      setContentData(data);
      
      // Invalidate post history cache to ensure new content appears
      queryClient.invalidateQueries({ queryKey: ['/api/post-history'] });
      
      toast({
        title: "Content generated successfully",
        description: "Your content is ready to be reviewed.",
      });
    },
    onError: (error: Error) => {
      console.error('Content generation failed:', error);
      toast({
        title: "Content generation failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  const generateContent = useCallback((preferences: OnboardingInput) => {
    console.log('Generating content with preferences:', preferences);
    mutate(preferences);
  }, [mutate]);
  
  return {
    generateContent,
    isLoading,
    contentData,
  };
}