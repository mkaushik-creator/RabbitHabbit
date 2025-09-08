import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import MainHeader from "@/components/common/MainHeader";
import AIProviderStatus from "@/components/AIProviderStatus";
import { 
  Plus, 
  MessageSquare, 
  Share2, 
  Wand2, 
  Hash, 
  Clock, 
  Users,
  ChevronRight,
  Sparkles,
  FileText,
  Globe,
  Eye,
  Star,
  History,
  CheckCircle,
  ArrowRight,
  Calendar,
  Zap,
  TrendingUp
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Check if session was restored from localStorage
  const sessionRestored = localStorage.getItem('rabbit_user') !== null;
  
  // Feature cards for available tools
  const featureCards = [
    {
      title: "AI Chat Creator",
      description: "Chat with AI to create perfect posts",
      icon: MessageSquare,
      path: "/ai-chat",
      gradient: "from-purple-400 to-pink-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Content Generator",
      description: "Generate posts for all platforms",
      icon: Wand2,
      path: "/post-generator",
      gradient: "from-blue-400 to-cyan-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Platform Connect",
      description: "Link your social accounts",
      icon: Share2,
      path: "/platform-connect",
      gradient: "from-green-400 to-emerald-400",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Hashtag Tools",
      description: "Trending hashtags & analytics",
      icon: Hash,
      path: "/hashtag-generator",
      gradient: "from-orange-400 to-yellow-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: "Post History",
      description: "View your published content",
      icon: History,
      path: "/history",
      gradient: "from-gray-400 to-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-900/20"
    }
  ];
  
  return (
    <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 min-h-screen font-sans w-full">
      <MainHeader />
      
      {/* Main Content Container */}
      <div className="w-full max-w-6xl mx-auto px-6 py-8">
        {/* Enhanced Brand Header */}
        <div className="text-center mb-16">
          <div className="mb-10">
            <h1 className="text-6xl md:text-8xl font-black font-['Poppins'] brand-gradient text-glow mb-4 animate-fade-in tracking-tight">
              RabbitHabbit
            </h1>
            <div className="w-40 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full mx-auto shadow-lg animate-pulse"></div>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mt-6 font-medium opacity-80">
              Your AI-powered social media companion
            </p>
          </div>
        </div>

        {/* Main Welcome Section */}
        <div className="text-center mb-16">
          {/* Large Welcome Headline */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4 drop-shadow-sm">
              Welcome back,
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
              {user?.fullName ? user.fullName.split(' ')[0] : 'Demo'}!
            </h2>
          </div>

          {/* Status Badges */}
          <div className="flex justify-center gap-6 mb-10">
            <div className="px-8 py-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl shadow-lg border border-yellow-200 dark:border-yellow-700 transform hover:scale-105 transition-transform duration-200">
              <span className="text-yellow-800 dark:text-yellow-200 font-semibold text-lg">⭐ Pro User</span>
            </div>
            <div className="px-8 py-4 bg-green-100 dark:bg-green-900/30 rounded-2xl shadow-lg border border-green-200 dark:border-green-700 transform hover:scale-105 transition-transform duration-200">
              <span className="text-green-800 dark:text-green-200 font-semibold text-lg">✅ Session Active</span>
            </div>
          </div>

          {/* Encouraging Call-to-Action */}
          <div className="mb-8">
            <h3 className="text-3xl md:text-4xl font-bold text-purple-700 dark:text-purple-300 mb-4">
              ✨ Ready to create amazing content? ✨
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Let's get started with your next viral post and watch your engagement soar!
            </p>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featureCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card 
                key={index}
                className={`${card.bgColor} border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden`}
                onClick={() => setLocation(card.path)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${card.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Provider Status */}
        <div className="mb-8 flex justify-center">
          <AIProviderStatus />
        </div>

        {/* Quick Stats or Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Engagement Up
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your content is performing 23% better this week!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                AI Credits
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                You have 847 AI generation credits remaining
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Posts Scheduled
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                12 posts ready to go live this week
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}