import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Instagram, Linkedin, Twitter, Facebook, Award, Clock, Loader2, Youtube } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PLATFORM_COLORS } from "@/constants";
import { getQueryFn } from "@/lib/queryClient";
import MainHeader from "@/components/common/MainHeader";

// Post history data type
interface PostHistory {
  id: string;
  content: string;
  platforms: string[];
  status: "posted" | "scheduled" | "failed";
  timestamp: string;
  scheduled?: string;
}

export default function History() {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [filter, setFilter] = useState("all");
  
  // Fetch post history from API
  const { 
    data: postHistory = [], 
    isLoading, 
    error 
  } = useQuery<PostHistory[]>({
    queryKey: ['/api/post-history'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: isAuthenticated,
    staleTime: 30000, // Cache for 30 seconds
  });
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Filter posts based on selected tab
  const filteredPosts = filter === "all" 
    ? postHistory 
    : postHistory.filter(post => post.status === filter);

  // Loading state
  if (isLoading) {
    return (
      <div className="px-6 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-bold mb-1">Your Content History</h1>
          <p className="text-gray-500 text-sm">Track your posts across all connected platforms</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-gray-500">Loading your content history...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-6 py-6 pb-20">
        <div className="mb-5">
          <h1 className="text-xl font-bold mb-1">Your Content History</h1>
          <p className="text-gray-500 text-sm">Track your posts across all connected platforms</p>
        </div>
        <div className="text-center py-10">
          <p className="text-red-500">Failed to load post history. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <MainHeader title="Post History" showBackButton={true} />
      
      <div className="px-6 py-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold mb-1">Your Content History</h1>
          <p className="text-gray-500 text-sm">Track your posts across all connected platforms</p>
        </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="posted">Posted</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={filter} className="mt-0">
          {filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <PostHistoryCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {filter === "all" 
                  ? "No posts found. Create your first post to see it here!" 
                  : `No ${filter} posts found.`}
              </p>
            </div>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PostHistoryCard({ post }: { post: PostHistory }) {
  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
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
        return <div className="w-4 h-4 text-white font-bold text-xs">TT</div>;
      default:
        return null;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "posted":
        return <Award className="w-4 h-4 text-green-500" />;
      case "scheduled":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "failed":
        return <Clock className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "posted":
        return "success";
      case "scheduled":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex space-x-1">
            {post.platforms.map(platform => (
              <div
                key={platform}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: PLATFORM_COLORS[platform] || '#888' }}
              >
                {getPlatformIcon(platform)}
              </div>
            ))}
          </div>
          <Badge variant={getStatusVariant(post.status) as any} className="flex items-center space-x-1">
            {getStatusIcon(post.status)}
            <span className="capitalize ml-1">{post.status}</span>
          </Badge>
        </div>
        
        <p className="text-sm mb-3 line-clamp-3">{post.content}</p>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{post.timestamp}</span>
          {post.scheduled && (
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {post.scheduled}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}