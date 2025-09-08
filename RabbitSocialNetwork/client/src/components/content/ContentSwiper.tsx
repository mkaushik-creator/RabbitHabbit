import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PlatformTabs from './PlatformTabs';
import ContentCard from './ContentCard';
import ImageContentCard from './ImageContentCard';
import { OnboardingInput, ContentGenerationResponse } from '@shared/schema';

interface ContentSwiperProps {
  contentData: ContentGenerationResponse;
  preferences: OnboardingInput;
  userQuery?: string; // Pass user's original query for contextual image generation
}

export default function ContentSwiper({ contentData, preferences, userQuery }: ContentSwiperProps) {
  // Get unique platforms that have content
  const availablePlatforms = Object.keys(contentData) as Array<keyof ContentGenerationResponse>;
  const [activePlatform, setActivePlatform] = useState<string>(availablePlatforms[0] || '');
  
  // Check if user selected DALL-E image generation
  const isImageGeneration = preferences.imageOption === 'Generate via DALL·E';
  
  if (availablePlatforms.length === 0) {
    return (
      <Card className="mx-4 mt-4">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No Content Available</h3>
            <p className="text-gray-500 text-sm">
              Sorry, we couldn't generate content for your selected preferences.
              Please try again with different options.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="pt-2 pb-16">
      <PlatformTabs 
        platforms={availablePlatforms}
        activePlatform={activePlatform}
        onSelectPlatform={setActivePlatform}
      />
      
      <div className="mx-2 mt-4">
        {availablePlatforms.map((platform) => {
          // Safe access with type assertion
          const platformKey = platform as keyof ContentGenerationResponse;
          const platformContent = contentData[platformKey] || [];
          
          return platformContent.map((content, contentIndex) => {
            // Use different card component based on image generation preference
            if (isImageGeneration) {
              return (
                <ImageContentCard
                  key={`${platform}-${contentIndex}`}
                  content={content}
                  platform={platform}
                  isActive={platform === activePlatform}
                  position={contentIndex}
                  userQuery={userQuery}
                />
              );
            } else {
              return (
                <ContentCard
                  key={`${platform}-${contentIndex}`}
                  content={content}
                  platform={platform}
                  isActive={platform === activePlatform}
                  position={contentIndex}
                />
              );
            }
          });
        })}
      </div>
    </div>
  );
}