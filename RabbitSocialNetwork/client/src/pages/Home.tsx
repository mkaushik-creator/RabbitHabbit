import { useCallback, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Wand2, 
  Share2, 
  Clock,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Zap,
  Menu,
  X,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Moon,
  Sun,
  Users,
  TrendingUp,
  Shield,
  Rocket,
  Hash
} from "lucide-react";

const Navbar = () => {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div 
              onClick={() => setLocation('/')}
              className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 hover:rotate-1 transition-all duration-300 cursor-pointer"
            >
              <span className="text-white font-bold text-sm">🐰</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">Features</a>
            <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">Pricing</a>
            <a href="#blog" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">Blog</a>
            <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">Contact</a>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Authentication Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200" title={user?.fullName || user?.username || 'User'}>
                    {(user?.fullName || user?.username || 'User').length > 12 
                      ? `${(user?.fullName || user?.username || 'User').substring(0, 12)}...` 
                      : (user?.fullName || user?.username || 'User')}
                  </span>
                </div>

                {/* Dashboard Button */}
                <Button
                  onClick={() => setLocation('/dashboard')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Dashboard
                </Button>

                {/* Sign Out Button */}
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-gray-300/50 hover:bg-white/70 dark:border-gray-600/50 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-200 font-medium px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                {/* Sign In Button */}
                <Button
                  onClick={() => setLocation('/login')}
                  variant="outline"
                  className="border-gray-300/50 hover:bg-white/70 dark:border-gray-600/50 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-200 font-medium px-4 py-2 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                  Sign In
                </Button>

                {/* Get Started Button */}
                <Button
                  onClick={() => setLocation('/login')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-medium px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Animated background component
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
    </div>
  );
};

// Typewriter effect component
const TypewriterEffect = ({ words }: { words: string[] }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(word.substring(0, currentText.length + 1));
        if (currentText === word) {
          setTimeout(() => setIsDeleting(true), 1000);
        }
      } else {
        setCurrentText(word.substring(0, currentText.length - 1));
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 150);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words]);

  return (
    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const HeroSection = () => {
  const [_, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 pt-24 md:pt-32">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Headline */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 font-['Poppins'] tracking-tight">
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 bg-clip-text text-transparent" style={{
            filter: 'drop-shadow(0 0 20px rgba(236, 72, 153, 0.3)) drop-shadow(0 0 40px rgba(147, 51, 234, 0.2))'
          }}>
            RabbitHabbit
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 font-medium opacity-90">
          Your AI-powered social media companion
        </p>

        {/* Typewriter Subheadline */}
        <div className="text-2xl md:text-3xl mb-10 font-medium text-gray-700 dark:text-gray-300">
          <TypewriterEffect words={['AI-Powered', 'Effortless', 'Engaging', 'Viral-Worthy']} />
          <span className="text-gray-600 dark:text-gray-400"> content creation</span>
        </div>

        {/* Description */}
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-14 max-w-3xl mx-auto leading-relaxed">
          Create stunning social media content across all platforms with our AI-powered tools. 
          Generate, schedule, and optimize your posts in minutes, not hours.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => setLocation(isAuthenticated ? '/dashboard' : '/login')}
            className="relative bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 overflow-hidden group text-lg"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <Rocket className="w-5 h-5" />
              <span>Start Creating Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 text-lg"
          >
            <span className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>See Features</span>
            </span>
          </Button>
        </div>

        {/* Social Proof */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
          <div className="flex items-center justify-center space-x-2">
            <Users className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium">10k+ Creators</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">500k+ Posts</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">99% Uptime</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span className="text-sm font-medium">AI-Powered</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const [_, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI Chat Creator",
      description: "Chat with AI to create perfect posts tailored to your audience.",
      gradient: "from-purple-400 to-pink-400",
      hoverGradient: "from-purple-500 to-pink-500",
      path: "/ai-chat"
    },
    {
      icon: <Wand2 className="w-8 h-8" />,
      title: "Content Generator",
      description: "Generate posts for all platforms with advanced AI technology.",
      gradient: "from-blue-400 to-cyan-400",
      hoverGradient: "from-blue-500 to-cyan-500",
      path: "/post-generator"
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Platform Connect",
      description: "Link your social accounts for seamless multi-platform publishing.",
      gradient: "from-green-400 to-emerald-400",
      hoverGradient: "from-green-500 to-emerald-500",
      path: "/platform-connect"
    },
    {
      icon: <Hash className="w-8 h-8" />,
      title: "Hashtag Tools",
      description: "Discover trending hashtags and analyze their performance.",
      gradient: "from-orange-400 to-yellow-400",
      hoverGradient: "from-orange-500 to-yellow-500",
      path: "/hashtag-generator"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Engagement Up",
      description: "Track and boost your content performance with smart analytics.",
      gradient: "from-blue-400 to-blue-600",
      hoverGradient: "from-blue-500 to-blue-700",
      path: "/dashboard"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI Credits",
      description: "Manage your AI generation credits and track usage efficiently.",
      gradient: "from-green-400 to-green-600",
      hoverGradient: "from-green-500 to-green-700",
      path: "/dashboard"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-gray-800/50 dark:to-purple-900/20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-['Poppins']">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to create, schedule, and optimize your social media content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              onClick={() => {
                if (isAuthenticated) {
                  setLocation(feature.path);
                } else {
                  setLocation('/login');
                }
              }}
              className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <CardContent className="p-8 relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>{isAuthenticated ? 'Go to feature' : 'Login to access'}</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  const [_, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-gradient-x"></div>
      
      {/* Wave Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-16"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="#ffffff"
            className="dark:fill-gray-900"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-['Poppins']">
          Ready to supercharge your content?
        </h2>
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
          Join thousands of creators who are already using RabbitHabbit to grow their audience
        </p>
        
        <Button
          onClick={() => setLocation(isAuthenticated ? '/dashboard' : '/login')}
          className="relative bg-white text-purple-600 hover:bg-gray-100 font-bold px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 overflow-hidden group text-xl"
        >
          <span className="relative z-10 flex items-center space-x-3">
            <Rocket className="w-6 h-6" />
            <span>Start Your Journey</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Button>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300" style={{ scrollBehavior: 'smooth' }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}