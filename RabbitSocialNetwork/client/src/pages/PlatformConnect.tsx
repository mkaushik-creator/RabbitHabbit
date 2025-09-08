import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowRight,
  UserRound,
  ChevronLeft,
  CheckCircle,
  Moon,
  Sun,
  Users,
  Clock
} from "lucide-react";
import { SiTiktok, SiInstagram, SiX, SiLinkedin, SiYoutube, SiFacebook } from "react-icons/si";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MainHeader from "@/components/common/MainHeader";

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  gradientBorder: string;
  connected: boolean;
  connectedAt?: string;
  profileName?: string;
  followerCount?: string;
  status: 'disconnected' | 'connected' | 'pending' | 'failed';
}

export default function PlatformConnect() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Theme and UI state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMinimalMode, setIsMinimalMode] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  
  // Initialize platforms
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: "instagram",
      name: "Instagram",
      icon: <SiInstagram className="h-6 w-6" />,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      gradientBorder: "from-pink-400 to-purple-500",
      connected: false,
      status: 'disconnected' as const
    },
    {
      id: "twitter",
      name: "Twitter/X",
      icon: <SiX className="h-6 w-6" />,
      color: "text-gray-900",
      bgColor: "bg-gray-50",
      gradientBorder: "from-blue-400 to-black",
      connected: false,
      status: 'disconnected' as const
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: <SiLinkedin className="h-6 w-6" />,
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      gradientBorder: "from-blue-500 to-blue-700",
      connected: false,
      status: 'disconnected' as const
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: <SiTiktok className="h-6 w-6" />,
      color: "text-black",
      bgColor: "bg-gray-50",
      gradientBorder: "from-gray-700 to-pink-500",
      connected: false,
      status: 'disconnected' as const
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: <SiFacebook className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      gradientBorder: "from-blue-600 to-blue-800",
      connected: false,
      status: 'disconnected' as const
    },
    {
      id: "youtube",
      name: "YouTube Shorts",
      icon: <SiYoutube className="h-6 w-6" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
      gradientBorder: "from-red-500 to-red-700",
      connected: false,
      status: 'disconnected' as const
    }
  ]);

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleConnect = (platformId: string) => {
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    setPlatforms(prev => 
      prev.map(platform => 
        platform.id === platformId 
          ? { 
              ...platform, 
              connected: true, 
              status: 'connected' as const,
              connectedAt: currentTime,
              profileName: `@demo_${platform.id}`,
              followerCount: Math.floor(Math.random() * 10000 + 1000).toLocaleString()
            }
          : platform
      )
    );
    
    toast({
      title: `Connected to ${platforms.find(p => p.id === platformId)?.name}`,
      description: "Platform connected successfully!",
    });
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      setSelectedPlatforms(platforms.map(p => p.id));
    } else {
      setSelectedPlatforms([]);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleContinue = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform to continue.",
        variant: "destructive"
      });
      return;
    }
    
    // Save selected platforms to localStorage
    localStorage.setItem('selectedPlatforms', JSON.stringify(selectedPlatforms));
    
    toast({
      title: "Platforms Connected Successfully!",
      description: `Connected to ${selectedPlatforms.length} platform(s). Ready to create content!`,
    });
    
    // Stay on the same page instead of auto-redirecting
  };

  const handleSignUp = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <MainHeader title="Platform Connect" showBackButton={true} />

      <div className="p-6 max-w-2xl mx-auto">
        {/* Demo User Notice */}
        {!isAuthenticated && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <UserRound className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Demo Users: One-Time Sign Up</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                    Sign up to connect your social accounts and start posting. Just for demo purposes.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSignUp}
                    className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                  >
                    Sign Up / Sign In
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Select All Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                Select All Platforms
              </Label>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Minimal Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="minimal-mode" className="text-sm text-gray-600 dark:text-gray-300">
                Minimal Mode
              </Label>
              <Switch
                id="minimal-mode"
                checked={isMinimalMode}
                onCheckedChange={setIsMinimalMode}
              />
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="theme-toggle" className="text-sm text-gray-600 dark:text-gray-300">
                {isDarkMode ? 'Light' : 'Dark'}
              </Label>
              <Switch
                id="theme-toggle"
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
              />
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
          </div>
        </div>

        {/* Platform Selection */}
        <div className={`${isMinimalMode ? 'grid grid-cols-2 sm:grid-cols-3 gap-4' : 'space-y-4'}`}>
          {platforms.map((platform) => (
            <Card 
              key={platform.id} 
              className={`
                ${platform.connected ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : platform.bgColor} 
                dark:bg-gray-800 
                border-2 border-transparent
                ${!platform.connected ? `bg-gradient-to-r ${platform.gradientBorder} p-[1px]` : ''}
                shadow-lg hover:shadow-xl 
                transform hover:scale-[1.02] 
                transition-all duration-200 ease-in-out
                cursor-pointer
                ${isMinimalMode ? 'p-2' : ''}
              `}
              onClick={() => handlePlatformToggle(platform.id)}
            >
              <CardContent className={`${isMinimalMode ? 'p-3' : 'p-6'} bg-white dark:bg-gray-800 rounded-xl`}>
                {isMinimalMode ? (
                  /* Minimal Mode Layout */
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`${platform.color} dark:text-white`}>
                      {platform.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-white text-center">
                      {platform.name}
                    </span>
                    {platform.connected && (
                      <div className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Full Mode Layout */
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`${platform.color} dark:text-white p-2 rounded-lg bg-gray-50 dark:bg-gray-700`}>
                          {platform.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {platform.name}
                          </h3>
                          {platform.connected && platform.profileName && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {platform.profileName}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          id={platform.id}
                          checked={selectedPlatforms.includes(platform.id)}
                          onCheckedChange={() => handlePlatformToggle(platform.id)}
                          className="scale-125"
                        />
                      </div>
                    </div>

                    {/* Connection Status and Details */}
                    {platform.connected && (
                      <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Connected
                            </span>
                          </div>
                          {platform.connectedAt && (
                            <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                              <Clock className="h-3 w-3" />
                              <span>{platform.connectedAt}</span>
                            </div>
                          )}
                        </div>
                        {platform.followerCount && (
                          <div className="flex items-center space-x-1 mt-2 text-xs text-gray-600 dark:text-gray-300">
                            <Users className="h-3 w-3" />
                            <span>{platform.followerCount} followers</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Connect Button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(platform.id);
                      }}
                      disabled={platform.connected}
                      className={`
                        w-full py-3 font-bold text-sm
                        transition-all duration-200 ease-in-out
                        transform hover:scale-105
                        ${platform.connected 
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25" 
                          : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                        }
                      `}
                    >
                      {platform.connected ? (
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        "Connect Platform"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <Button 
            onClick={handleContinue}
            className={`
              w-full py-4 text-base font-bold
              transition-all duration-200 ease-in-out
              transform hover:scale-[1.02]
              ${selectedPlatforms.length > 0 
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40" 
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }
            `}
            disabled={selectedPlatforms.length === 0}
          >
            Connect Selected Platforms ({selectedPlatforms.length} selected)
            <CheckCircle className="ml-2 h-5 w-5" />
          </Button>

          {selectedPlatforms.length > 0 && (
            <Button 
              onClick={() => setLocation("/post-generator")}
              variant="outline"
              className="w-full py-4 text-base font-semibold border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
            >
              Continue to Content Generator
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}