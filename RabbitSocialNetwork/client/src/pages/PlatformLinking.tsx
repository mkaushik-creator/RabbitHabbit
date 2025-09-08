import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Facebook,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Info
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Alert,
  AlertDescription
} from "@/components/ui/alert";

interface PlatformStatus {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  connected: boolean;
  hasCredentials: boolean;
  authUrl?: string;
  permissions: string[];
}

export default function PlatformLinking() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [connecting, setConnecting] = useState<string | null>(null);
  
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([
    {
      id: "twitter",
      name: "X (Twitter)",
      icon: <Twitter className="h-6 w-6" />,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      connected: false,
      hasCredentials: true, // Will be set dynamically based on server response
      authUrl: "/api/auth/twitter",
      permissions: ["Read tweets", "Post tweets", "Access profile"]
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <Instagram className="h-6 w-6" />,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      connected: false,
      hasCredentials: false,
      permissions: ["Read profile", "Post photos", "Access stories"]
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <Linkedin className="h-6 w-6" />,
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      connected: false,
      hasCredentials: false,
      permissions: ["Read profile", "Post updates", "Share articles"]
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: <SiTiktok className="h-5 w-5" />,
      color: "text-black",
      bgColor: "bg-gray-100",
      connected: false,
      hasCredentials: false,
      permissions: ["Read profile", "Post videos", "Access analytics"]
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <Facebook className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      connected: false,
      hasCredentials: false,
      permissions: ["Read profile", "Post updates", "Manage pages"]
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: <Youtube className="h-6 w-6" />,
      color: "text-red-600",
      bgColor: "bg-red-100",
      connected: false,
      hasCredentials: false,
      permissions: ["Read channel", "Upload videos", "Manage playlists"]
    }
  ]);

  // Check platform credentials status on load
  useEffect(() => {
    checkPlatformCredentials();
  }, []);

  const checkPlatformCredentials = async () => {
    try {
      const response = await fetch('/api/platform-status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlatforms(prev => prev.map(platform => ({
          ...platform,
          hasCredentials: data[platform.id]?.hasCredentials || false,
          connected: data[platform.id]?.connected || false
        })));
      }
    } catch (error) {
      console.error('Failed to check platform credentials:', error);
    }
  };

  const connectPlatform = async (platform: PlatformStatus) => {
    if (!platform.hasCredentials) {
      toast({
        title: "Platform Not Available",
        description: `${platform.name} API credentials are not configured. Contact admin to enable this platform.`,
        variant: "destructive"
      });
      return;
    }

    setConnecting(platform.id);

    try {
      if (platform.id === 'twitter' && platform.authUrl) {
        // For OAuth providers, redirect to authentication
        window.location.href = platform.authUrl;
      } else {
        // For other platforms, implement API-specific flows
        toast({
          title: "Connecting Platform",
          description: `Initiating connection to ${platform.name}...`,
        });

        // Simulate connection process
        setTimeout(() => {
          setPlatforms(prev => prev.map(p => 
            p.id === platform.id ? { ...p, connected: true } : p
          ));
          
          setConnecting(null);
          toast({
            title: "Platform Connected!",
            description: `Successfully connected to ${platform.name}`,
          });
        }, 2000);
      }
    } catch (error) {
      setConnecting(null);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${platform.name}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const disconnectPlatform = async (platformId: string) => {
    try {
      const response = await fetch(`/api/platforms/${platformId}/disconnect`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setPlatforms(prev => prev.map(p => 
          p.id === platformId ? { ...p, connected: false } : p
        ));
        
        toast({
          title: "Platform Disconnected",
          description: "Platform has been successfully disconnected",
        });
      }
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect platform. Please try again.",
        variant: "destructive"
      });
    }
  };

  const connectedCount = platforms.filter(p => p.connected).length;
  const availableCount = platforms.filter(p => p.hasCredentials).length;

  return (
    <div className="p-4 pb-20 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Connect Your Platforms</h1>
        <p className="text-gray-600">
          Link your social media accounts to start posting content across all platforms
        </p>
        
        <div className="flex items-center gap-4 mt-3">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {connectedCount} Connected
          </Badge>
          <Badge variant="outline">
            {availableCount} Available
          </Badge>
        </div>
      </div>

      {/* Connection Status Alert */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Authentication Status:</strong> {user ? `Signed in as ${user.fullName || user.username}` : 'Not signed in'}
          {availableCount < platforms.length && (
            <span className="block mt-1 text-sm text-gray-600">
              Some platforms require API credentials to be configured by the administrator.
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Platform Connection Cards */}
      <div className="space-y-4">
        {platforms.map((platform) => (
          <Card key={platform.id} className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${platform.bgColor} ${platform.color}`}>
                    {platform.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{platform.name}</h3>
                      {platform.connected && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {!platform.hasCredentials && (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {platform.connected 
                          ? "Successfully connected and ready to post"
                          : platform.hasCredentials 
                            ? "Ready to connect"
                            : "API credentials required"
                        }
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {platform.permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {platform.connected ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => disconnectPlatform(platform.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button 
                      variant={platform.hasCredentials ? "default" : "outline"}
                      size="sm"
                      onClick={() => connectPlatform(platform)}
                      disabled={!platform.hasCredentials || connecting === platform.id}
                      className={platform.hasCredentials ? "" : "opacity-50"}
                    >
                      {connecting === platform.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Connecting...
                        </>
                      ) : platform.hasCredentials ? (
                        <>
                          Connect
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </>
                      ) : (
                        "Not Available"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      <div className="mt-8">
        <Button 
          className="w-full" 
          size="lg"
          onClick={() => setLocation("/dashboard")}
        >
          Continue to Dashboard
        </Button>
        
        <p className="text-center text-sm text-gray-500 mt-2">
          You can connect more platforms later from your dashboard
        </p>
      </div>
    </div>
  );
}