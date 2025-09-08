import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Moon, 
  Sun,
  UserPlus,
  LogIn,
  Loader2
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
// Import logo image
const logoImage = "/attached_assets/image_1751829306805.png";

export default function Login() {
  const [_, setLocation] = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // UI States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    email: false,
    google: false,
    twitter: false,
    demo: false
  });

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && !formData.fullName) {
      toast({
        title: "Missing Information", 
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, email: true }));

    try {
      if (isSignUp) {
        await register({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        });
        toast({
          title: "Account created!",
          description: "Welcome to RabbitHabbit!",
        });
      } else {
        await login('email', {
          email: formData.email,
          password: formData.password
        });
        toast({
          title: "Welcome back!",
          description: "Successfully signed in",
        });
      }
    } catch (error) {
      toast({
        title: isSignUp ? "Registration failed" : "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }

    setIsLoading(prev => ({ ...prev, email: false }));
  };

  const handleSocialLogin = async (provider: 'google' | 'twitter' | 'demo') => {
    setIsLoading(prev => ({ ...prev, [provider]: true }));
    
    try {
      if (provider === 'demo') {
        await login('demo');
        toast({
          title: "Demo mode activated!",
          description: "Exploring RabbitHabbit features",
        });
      } else {
        await login(provider);
        toast({
          title: "Authentication successful!",
          description: `Connected via ${provider}`,
        });
      }
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: `Could not connect via ${provider}`,
        variant: "destructive",
      });
    }

    setIsLoading(prev => ({ ...prev, [provider]: false }));
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-purple-900' 
        : 'bg-gradient-to-br from-white via-purple-50 to-blue-100'
    }`}>
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
            isDarkMode 
              ? 'bg-white/10 text-yellow-400 hover:bg-white/20 backdrop-blur-md' 
              : 'bg-white/60 text-purple-600 hover:bg-white/80 backdrop-blur-md'
          } shadow-lg border border-white/20`}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex justify-center items-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-block mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-2xl flex items-center justify-center logo-glow logo-bounce transform hover:scale-110 transition-all duration-300 hover:animate-pulse">
                <img 
                  src={logoImage} 
                  alt="RabbitHabbit Logo" 
                  className="w-12 h-12 object-contain filter drop-shadow-sm"
                  onError={(e) => {
                    // Fallback to rabbit emoji if image fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('span');
                    fallback.innerHTML = '🐰';
                    fallback.className = 'text-2xl filter drop-shadow-sm';
                    e.currentTarget.parentNode?.appendChild(fallback);
                  }}
                />
              </div>
              <h1 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${
                isDarkMode 
                  ? 'from-purple-400 to-blue-400' 
                  : 'from-purple-600 to-blue-600'
              } bg-clip-text text-transparent animate-pulse`}>
                RabbitHabbit
              </h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              } animate-fade-in-up`}>
                Your AI-powered social media companion
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className={`w-full ${
            isDarkMode 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white/40 border-white/60'
          } backdrop-blur-xl shadow-2xl rounded-[20px] p-8 border transition-all duration-300`}>
            
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {isSignUp ? 'Join thousands of creators' : 'Sign in to your account'}
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading.google}
                className={`w-full flex items-center justify-center space-x-3 py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                  isDarkMode
                    ? 'bg-white text-gray-700 hover:bg-gray-50'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } shadow-lg border border-gray-200`}
              >
                {isLoading.google ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <SiGoogle className="w-5 h-5 text-red-500" />
                )}
                <span>Continue with Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin('twitter')}
                disabled={isLoading.twitter}
                className="w-full flex items-center justify-center space-x-3 py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
              >
                {isLoading.twitter ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="text-lg font-bold">𝕏</span>
                )}
                <span>Continue with X (Twitter)</span>
              </button>

              <button
                onClick={() => handleSocialLogin('demo')}
                disabled={isLoading.demo}
                className="w-full flex items-center justify-center space-x-3 py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg"
              >
                {isLoading.demo ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span>Try Demo Mode</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  isDarkMode ? 'border-white/20' : 'border-gray-300'
                }`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${
                  isDarkMode 
                    ? 'bg-gray-900/50 text-gray-300' 
                    : 'bg-white/50 text-gray-500'
                } backdrop-blur-sm`}>
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Full Name"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
                          : 'bg-white/60 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                      } backdrop-blur-sm shadow-sm`}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email address"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
                        : 'bg-white/60 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                    } backdrop-blur-sm shadow-sm`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Password"
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
                        : 'bg-white/60 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                    } backdrop-blur-sm shadow-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    } transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isSignUp && (
                  <div className="text-right">
                    <button
                      type="button"
                      className={`text-sm ${
                        isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
                      } font-medium transition-colors`}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading.email}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading.email ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  </div>
                )}
              </button>
            </form>

            {/* Toggle Sign Up/Sign In */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className={`text-sm ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                } transition-colors`}
              >
                {isSignUp ? (
                  <>Already have an account? <span className="text-purple-500 font-semibold">Sign in</span></>
                ) : (
                  <>Don't have an account? <span className="text-purple-500 font-semibold">Sign up</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}