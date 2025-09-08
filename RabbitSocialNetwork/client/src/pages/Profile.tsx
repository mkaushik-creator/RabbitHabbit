import { useState } from "react";
import { useLocation } from "wouter";
import { LogOut, Settings, User, Instagram, Twitter, Linkedin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import MainHeader from "@/components/common/MainHeader";

export default function Profile() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handle logout with real authentication
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await logout();
      
      toast({
        title: "Logged out successfully",
        description: "You've been logged out of your account.",
      });
      
      // Redirect to home page
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Redirect to login if no user
  if (!user) {
    setLocation("/login");
    return null;
  }

  // Mock connected platforms
  const connectedPlatforms = [
    {
      id: "instagram",
      name: "Instagram",
      username: "@" + user.username,
      icon: <Instagram className="h-5 w-5 text-pink-600" />
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      username: "@" + user.username,
      icon: <Twitter className="h-5 w-5 text-blue-500" />
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      username: user.fullName || user.username,
      icon: <Linkedin className="h-5 w-5 text-blue-700" />
    }
  ];

  return (
    <div className="pb-20">
      <MainHeader title="Profile" showBackButton={true} />
      
      <div className="px-6 py-8">
        <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.fullName || user.username}
              className="w-24 h-24 rounded-full border-2 border-primary"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold">{user.fullName || user.username}</h1>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-sm text-gray-500 mt-1">
          Authenticated via {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Connected Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {connectedPlatforms.map(platform => (
              <div key={platform.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  {platform.icon}
                  <div className="ml-3">
                    <div className="font-medium">{platform.name}</div>
                    <div className="text-sm text-gray-500">{platform.username}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Reconnect</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-gray-500 mr-3" />
              <span>Account Preferences</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>
          </div>
          <Separator />
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </CardContent>
      </Card>

      {/* Account Preferences Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Edit Account Preferences
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {/* Placeholder content for account preferences */}
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium text-gray-700 mb-2">Account Preferences</h3>
                <p className="text-sm">
                  Manage your account settings, notification preferences, and privacy options.
                </p>
                <p className="text-xs mt-2 text-gray-400">
                  Feature coming soon - this is a placeholder form.
                </p>
              </div>
              
              {/* Placeholder form elements */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Email Notifications</span>
                  <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Push Notifications</span>
                  <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Privacy Mode</span>
                  <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Preferences saved",
                    description: "Your account preferences have been updated.",
                  });
                  setIsEditModalOpen(false);
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}