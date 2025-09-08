import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  ChevronLeft,
  Calendar,
  Clock,
  Check,
  X,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MainHeader from "@/components/common/MainHeader";

type ScheduleOption = "now" | "schedule";

interface PlatformStatus {
  platform: string;
  name: string;
  status: "pending" | "success" | "error";
  message?: string;
}

export default function Scheduler() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [scheduleOption, setScheduleOption] = useState<ScheduleOption>("now");
  const [isPosting, setIsPosting] = useState(false);
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatus[]>([]);
  const [allComplete, setAllComplete] = useState(false);
  
  // Load stored data from previous steps
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [captionStyle, setCaptionStyle] = useState("fun-chill");

  useEffect(() => {
    // Load stored data from localStorage
    const platforms = JSON.parse(localStorage.getItem('selectedPlatforms') || '[]');
    const hashtags = JSON.parse(localStorage.getItem('selectedHashtags') || '[]');
    const collabs = JSON.parse(localStorage.getItem('collaborators') || '[]');
    const style = localStorage.getItem('captionStyle') || 'fun-chill';
    
    console.log('Scheduler: Loading data from localStorage');
    console.log('Platforms:', platforms);
    console.log('Hashtags:', hashtags);
    console.log('Collaborators:', collabs);
    console.log('Caption Style:', style);
    
    setSelectedPlatforms(platforms);
    setSelectedHashtags(hashtags);
    setCollaborators(collabs);
    setCaptionStyle(style);
    
    // Show warning if no platforms selected
    if (platforms.length === 0) {
      console.warn('No platforms selected in localStorage');
      toast({
        title: "No platforms selected",
        description: "Please go back and select platforms first.",
        variant: "destructive"
      });
    }
  }, []);

  const generateSampleContent = () => {
    const collaboratorTags = collaborators.length > 0 ? ` ${collaborators.join(' ')}` : '';
    const hashtagString = selectedHashtags.join(' ');
    
    let baseContent = "";
    switch (captionStyle) {
      case 'fun-chill':
        baseContent = "Just posted something amazing! ✨ What do you think? Drop your thoughts below! 💭";
        break;
      case 'trendy-genz':
        baseContent = "This is literally everything rn 🔥 No cap, this hits different 💯 What's your vibe?";
        break;
      case 'professional':
        baseContent = "Excited to share this latest update with the community. Looking forward to your professional insights.";
        break;
      default:
        baseContent = "Check out this latest update! Let me know what you think.";
    }
    
    return `${baseContent}${collaboratorTags}\n\n${hashtagString}`;
  };

  const handlePostNow = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please go back and select platforms to post to.",
        variant: "destructive"
      });
      return;
    }

    setIsPosting(true);
    
    // Initialize platform statuses
    const initialStatuses = selectedPlatforms.map(platform => ({
      platform,
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      status: "pending" as const
    }));
    
    setPlatformStatuses(initialStatuses);
    
    const content = generateSampleContent();
    
    try {
      // Post to each platform sequentially
      for (let i = 0; i < selectedPlatforms.length; i++) {
        const platform = selectedPlatforms[i];
        
        try {
          console.log(`Posting to ${platform}:`, { platform: platform.toLowerCase(), content });
          
          // Call the real API to post to platform
          const response = await apiRequest('POST', '/api/post-to-platform', {
            platform: platform.toLowerCase(),
            content: content
          });
          
          console.log(`Response status for ${platform}:`, response.status);
          
          const result = await response.json();
          console.log(`Response data for ${platform}:`, result);
          
          if (result.success) {
            // Update status to success
            setPlatformStatuses(prev => 
              prev.map((p, index) => 
                index === i ? { ...p, status: "success" } : p
              )
            );
            console.log(`✅ Successfully posted to ${platform}`);
          } else {
            // Update status to error
            setPlatformStatuses(prev => 
              prev.map((p, index) => 
                index === i ? { ...p, status: "error", message: result.message } : p
              )
            );
            console.error(`❌ Failed to post to ${platform}:`, result.message);
          }
        } catch (error) {
          console.error(`❌ Error posting to ${platform}:`, error);
          setPlatformStatuses(prev => 
            prev.map((p, index) => 
              index === i ? { ...p, status: "error", message: "Failed to post" } : p
            )
          );
        }
        
        // Add delay between posts for better UX
        if (i < selectedPlatforms.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
      
      setAllComplete(true);
      
      // Invalidate post history cache to refresh the history page
      queryClient.invalidateQueries({ queryKey: ['/api/post-history'] });
      
      toast({
        title: "Posts published successfully!",
        description: "Your content has been posted to all selected platforms.",
      });
    } catch (error) {
      console.error("Error posting:", error);
      toast({
        title: "Posting failed",
        description: "Failed to post to some platforms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Check className="h-4 w-4 text-green-500" />;
      case "error":
        return <X className="h-4 w-4 text-red-500" />;
      case "pending":
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  const handleViewHistory = () => {
    setLocation("/history");
  };

  return (
    <div className="min-h-screen bg-background">
      <MainHeader title="Scheduler" showBackButton={true} />

      <div className="p-6 max-w-2xl mx-auto">
        {!isPosting && !allComplete && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Schedule Your Posts</h2>
              <p className="text-gray-600">Choose when to publish your content across platforms</p>
            </div>

            {/* Summary of Selections */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Content Summary</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Platforms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPlatforms.length > 0 ? selectedPlatforms.map(platform => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      )) : (
                        <span className="text-red-500 text-xs">No platforms selected - please go back and select platforms</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Caption Style:</span> {captionStyle}
                  </div>
                  <div>
                    <span className="font-medium">Hashtags:</span> {selectedHashtags.length} selected
                  </div>
                  {collaborators.length > 0 && (
                    <div>
                      <span className="font-medium">Collaborators:</span> {collaborators.join(', ')}
                    </div>
                  )}
                </div>
                
                {/* Debug button for testing */}
                <div className="mt-4 pt-3 border-t">
                  <Button 
                    onClick={() => {
                      console.log('Debug: Current state', {
                        selectedPlatforms,
                        selectedHashtags,
                        collaborators,
                        captionStyle
                      });
                      console.log('LocalStorage data:', {
                        platforms: localStorage.getItem('selectedPlatforms'),
                        hashtags: localStorage.getItem('selectedHashtags'),
                        collabs: localStorage.getItem('collaborators'),
                        style: localStorage.getItem('captionStyle')
                      });
                    }}
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    Debug Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Options */}
            <RadioGroup 
              value={scheduleOption} 
              onValueChange={(value) => setScheduleOption(value as ScheduleOption)}
              className="mb-8"
            >
              <Card className={`cursor-pointer transition-colors ${scheduleOption === 'now' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="now" id="now" />
                    <div className="flex-1">
                      <Label htmlFor="now" className="text-base font-medium cursor-pointer">
                        Post Now
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Publish content immediately to all platforms
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-colors ${scheduleOption === 'schedule' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="schedule" id="schedule" />
                    <div className="flex-1">
                      <Label htmlFor="schedule" className="text-base font-medium cursor-pointer">
                        Schedule for Later
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Choose a specific date and time to publish
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>

            {/* Post Button */}
            <Button 
              onClick={handlePostNow}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 text-base font-medium"
              disabled={selectedPlatforms.length === 0}
            >
              {scheduleOption === 'now' ? 'Post Now' : 'Schedule Post'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}

        {/* Posting Progress */}
        {isPosting && (
          <div className="text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Posting Your Content...</h2>
              <p className="text-gray-600">Please wait while we publish to your platforms</p>
            </div>

            <div className="space-y-3">
              {platformStatuses.map((status, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(status.status)}
                        <span className="font-medium">{status.name}</span>
                      </div>
                      <Badge 
                        variant={status.status === 'success' ? 'default' : status.status === 'error' ? 'destructive' : 'secondary'}
                      >
                        {status.status === 'success' ? 'Posted' : status.status === 'error' ? 'Failed' : 'Posting...'}
                      </Badge>
                    </div>
                    {status.message && (
                      <p className="text-sm text-gray-600 mt-2">{status.message}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completion */}
        {allComplete && (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">All Done! 🎉</h2>
              <p className="text-gray-600">Your content has been successfully posted to all platforms.</p>
            </div>

            <div className="space-y-3 mb-6">
              {platformStatuses.map((status, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(status.status)}
                        <span className="font-medium">{status.name}</span>
                      </div>
                      <Badge variant={status.status === 'success' ? 'default' : 'destructive'}>
                        {status.status === 'success' ? 'Posted' : 'Failed'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleViewHistory}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                View Post History
              </Button>
              <Button 
                onClick={() => setLocation("/")}
                variant="outline"
                className="w-full"
              >
                Create Another Post
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}