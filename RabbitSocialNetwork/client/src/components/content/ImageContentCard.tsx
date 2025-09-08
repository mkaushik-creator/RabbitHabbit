import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PLATFORM_COLORS } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Download, 
  RefreshCw,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { Instagram, Twitter, Linkedin, Facebook, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageContentCardProps {
  content: {
    content: string;
    hashtags?: string;
    imagePrompt?: string;
  };
  platform: string;
  isActive: boolean;
  position: number;
  userQuery?: string; // User's original input for contextual image generation
}

export default function ImageContentCard({ content, platform, isActive, position, userQuery }: ImageContentCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    const normalizedPlatform = platform.toLowerCase();
    switch (normalizedPlatform) {
      case "instagram":
        return <Instagram className="w-4 h-4 text-white" />;
      case "twitter":
      case "x":
        return <Twitter className="w-4 h-4 text-white" />;
      case "linkedin":
        return <Linkedin className="w-4 h-4 text-white" />;
      case "facebook":
        return <Facebook className="w-4 h-4 text-white" />;
      case "youtube":
        return <Youtube className="w-4 h-4 text-white" />;
      case "tiktok":
        return <span className="text-white font-bold text-xs">TT</span>;
      case "discord":
        return <span className="text-white font-bold text-xs">DC</span>;
      default:
        return <span className="text-white font-bold text-xs">{platform.charAt(0).toUpperCase()}</span>;
    }
  };
  
  const platformColor = PLATFORM_COLORS[platform] || PLATFORM_COLORS[platform.toLowerCase()] || "#888";
  
  const copyToClipboard = () => {
    const textToCopy = `${content.content}\n\n${content.hashtags || ''}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Could not copy text: ", err);
      });
  };

  const generateImage = async () => {
    console.log('🖼️ Generate Image clicked');
    console.log('🎯 User query:', userQuery);
    console.log('🤖 AI response:', content.content);
    console.log('📝 Image prompt:', content.imagePrompt);
    
    console.log('🔄 Starting contextual image generation...');
    setIsGeneratingImage(true);
    
    try {
      console.log('📤 Sending contextual request to /api/generate-image');
      
      // Call the backend to generate image with contextual information
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: content.imagePrompt || content.content, // Fallback prompt
          userQuery: userQuery, // User's original input for context
          aiResponse: content.content // AI-generated content for context
        }),
      });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      
      const result = await response.json();
      console.log('📥 Response data:', result);
      
      if (result.success && result.imageUrl) {
        console.log('✅ Contextual image generated successfully:', result.imageUrl);
        setGeneratedImageUrl(result.imageUrl);
        toast({
          title: "Image Generated!",
          description: "Your contextual AI-generated image is ready.",
        });
      } else {
        console.error('❌ Generation failed:', result.message);
        toast({
          title: "Generation Failed",
          description: result.message || "Could not generate image. Please try a different description.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Network/fetch error:', error);
      toast({
        title: "Connection Error",
        description: error.message || "Could not connect to image generation service.",
        variant: "destructive",
      });
    } finally {
      console.log('🔄 Image generation completed, resetting loading state');
      setIsGeneratingImage(false);
    }
  };

  const downloadImage = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `${platform}-generated-image.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  if (!isActive) {
    return null;
  }
  
  return (
    <Card 
      className={cn(
        "mb-4 transition-all duration-300 overflow-hidden border-2",
        isActive ? "opacity-100 scale-100 border-purple-200" : "opacity-0 scale-95",
        "bg-gradient-to-br from-purple-50 to-blue-50"
      )}
    >
      <CardContent className="p-4">
        {/* Header with platform info and AI badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
              style={{ backgroundColor: platformColor }}
            >
              {getPlatformIcon(platform)}
            </div>
            <span className="font-medium">{platform}</span>
            <div className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Generated
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Option {position + 1}
          </div>
        </div>

        {/* Image generation area - prominent section */}
        <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-purple-100">
          {generatedImageUrl ? (
            <div className="space-y-3">
              <div className="relative">
                <img 
                  src={generatedImageUrl} 
                  alt="Generated content image"
                  className="w-full rounded-lg shadow-md max-h-64 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={downloadImage}
                    className="bg-white/80 hover:bg-white/90"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateImage}
                  disabled={isGeneratingImage}
                  className="flex-1"
                >
                  <RefreshCw className={cn("w-3 h-3 mr-1", isGeneratingImage && "animate-spin")} />
                  Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadImage}
                  className="flex-1"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Ready to Generate Image</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Click below to create a custom image using AI
                </p>
                <Button
                  onClick={() => {
                    console.log('🔘 Generate Image button clicked');
                    console.log('Button disabled state:', isGeneratingImage || !content.imagePrompt);
                    console.log('isGeneratingImage:', isGeneratingImage);
                    console.log('content.imagePrompt:', content.imagePrompt);
                    generateImage();
                  }}
                  disabled={isGeneratingImage || !content.imagePrompt}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isGeneratingImage ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Image prompt display */}
        {content.imagePrompt && (
          <div className="mb-3 bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-md border border-purple-100">
            <div className="font-medium text-purple-800 mb-1 flex items-center">
              <ImageIcon className="w-4 h-4 mr-1" />
              Image Prompt:
            </div>
            <div className="text-purple-700 text-sm">{content.imagePrompt}</div>
          </div>
        )}
        
        {/* Text content */}
        <div className="mb-3 whitespace-pre-wrap text-gray-800">
          {content.content}
        </div>
        
        {/* Hashtags */}
        {content.hashtags && (
          <div className="text-blue-600 mb-4 font-medium">
            {content.hashtags}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex justify-between mt-4">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-xs h-8",
                feedback === "like" && "bg-green-50 border-green-200 text-green-600"
              )}
              onClick={() => setFeedback("like")}
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              Like
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-xs h-8",
                feedback === "dislike" && "bg-red-50 border-red-200 text-red-600"
              )}
              onClick={() => setFeedback("dislike")}
            >
              <ThumbsDown className="w-3 h-3 mr-1" />
              Dislike
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy Text
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}