import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PLATFORM_COLORS, PLATFORM_STYLES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { Instagram, Twitter, Linkedin, Facebook, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  content: {
    content: string;
    hashtags?: string;
    imagePrompt?: string;
  };
  platform: string;
  isActive: boolean;
  position: number;
}

export default function ContentCard({ content, platform, isActive, position }: ContentCardProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  
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
  
  // Get platform styles or use default
  const platformColor = PLATFORM_COLORS[platform] || PLATFORM_COLORS[platform.toLowerCase()] || "#888";
  const platformStyle = PLATFORM_STYLES[platform] || PLATFORM_STYLES[platform.toLowerCase()] || {};
  
  // Prepare the content
  const mainContent = content.content;
  const hashtags = content.hashtags || "";
  
  const copyToClipboard = () => {
    const textToCopy = `${mainContent}\n\n${hashtags}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error("Could not copy text: ", err);
      });
  };
  
  if (!isActive) {
    return null;
  }
  
  return (
    <Card 
      className={cn(
        "mb-4 transition-all duration-300 overflow-hidden",
        isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-2`}
              style={{ backgroundColor: platformColor }}
            >
              {getPlatformIcon(platform)}
            </div>
            <span className="font-medium text-high-contrast">{platform}</span>
          </div>
          
          <div className="text-xs placeholder-text">
            Option {position + 1}
          </div>
        </div>
        
        <div 
          className="mb-3 whitespace-pre-wrap ai-content-text"
          style={platformStyle}
        >
          {mainContent}
        </div>
        
        {hashtags && (
          <div className="text-blue-500 dark:text-blue-400 mb-3">
            {hashtags}
          </div>
        )}
        
        {content.imagePrompt && (
          <div className="mb-3 bg-accessible-card p-2 rounded-md text-sm">
            <div className="font-medium text-medium-contrast mb-1">Image Prompt:</div>
            <div className="ai-content-text">{content.imagePrompt}</div>
          </div>
        )}
        
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
                Copy
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}