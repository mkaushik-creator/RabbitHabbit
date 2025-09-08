import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MainHeader from "@/components/common/MainHeader";
import { 
  Send, 
  Sparkles, 
  Check,
  RefreshCw,
  Copy,
  CheckCircle,
  X,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  MessageSquare,
  ArrowRight,
  Zap,
  Eye,
  Edit3,
  Hash,
  Calendar,
  Clock,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ContentSuggestion {
  platform: string;
  content: string;
  hashtags: string[];
  tone: string;
}

interface StepData {
  topic?: string;
  platforms?: string[];
  tone?: string;
  audience?: string;
  suggestions?: ContentSuggestion[];
}

type ConversationStep = 'topic' | 'platforms' | 'tone' | 'audience' | 'hashtags' | 'generating' | 'results' | 'scheduler';

const PLATFORMS = [
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram, 
    gradient: 'from-pink-500 via-red-500 to-yellow-500',
    bgGradient: 'from-pink-50 to-orange-50',
    hoverGradient: 'from-pink-100 to-orange-100',
    color: '#E1306C',
    description: 'Visual storytelling'
  },
  { 
    id: 'x', 
    name: 'X', 
    icon: X, 
    gradient: 'from-gray-900 to-gray-700',
    bgGradient: 'from-gray-50 to-slate-50',
    hoverGradient: 'from-gray-100 to-slate-100',
    color: '#1DA1F2',
    description: 'Real-time updates'
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: Linkedin, 
    gradient: 'from-blue-600 to-blue-700',
    bgGradient: 'from-blue-50 to-indigo-50',
    hoverGradient: 'from-blue-100 to-indigo-100',
    color: '#0077B5',
    description: 'Professional network'
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: MessageSquare, 
    gradient: 'from-black via-red-500 to-pink-500',
    bgGradient: 'from-red-50 to-pink-50',
    hoverGradient: 'from-red-100 to-pink-100',
    color: '#FF0050',
    description: 'Short-form video'
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: Youtube, 
    gradient: 'from-red-600 to-red-700',
    bgGradient: 'from-red-50 to-red-100',
    hoverGradient: 'from-red-100 to-red-200',
    color: '#FF0000',
    description: 'Video content'
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: Facebook, 
    gradient: 'from-blue-600 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    hoverGradient: 'from-blue-100 to-indigo-100',
    color: '#1877F2',
    description: 'Community engagement'
  }
];

const TONES = [
  { id: 'professional', name: 'Professional', emoji: '👔', description: 'Formal, business-oriented' },
  { id: 'casual', name: 'Casual', emoji: '😊', description: 'Friendly, conversational' },
  { id: 'witty', name: 'Witty', emoji: '😄', description: 'Clever, humorous' },
  { id: 'inspiring', name: 'Inspiring', emoji: '✨', description: 'Motivational, uplifting' },
  { id: 'educational', name: 'Educational', emoji: '📚', description: 'Informative, teaching' },
  { id: 'trendy', name: 'Trendy', emoji: '🔥', description: 'Hip, current' }
];

const STEP_TITLES = {
  topic: "What's your content about?",
  platforms: "Where do you want to post?",
  tone: "What tone should we use?",
  audience: "Who's your target audience?",
  hashtags: "Generate hashtags",
  generating: "Creating your content...",
  results: "Your personalized content is ready!",
  scheduler: "Schedule your posts"
};

const STEP_INDICATORS = ['Topic', 'Platforms', 'Tone', 'Audience', 'Hashtags', 'Generate', 'Review', 'Schedule'];

export default function ModernPostGenerator() {
  const [_, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<ConversationStep>('topic');
  const [stepData, setStepData] = useState<StepData>({});
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<ContentSuggestion[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [previewPlatform, setPreviewPlatform] = useState<string>('');
  const [customHashtags, setCustomHashtags] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [postingStatus, setPostingStatus] = useState<{[key: string]: 'idle' | 'posting' | 'success' | 'error'}>({});
  const [showRetryOption, setShowRetryOption] = useState(false);
  const [generatingTimeout, setGeneratingTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [currentStep]);

  useEffect(() => {
    if (generatedContent.length > 0 && !previewPlatform) {
      setPreviewPlatform(selectedPlatforms[0] || 'instagram');
    }
  }, [generatedContent, selectedPlatforms]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStepProgress = () => {
    const steps = ['topic', 'platforms', 'tone', 'audience', 'hashtags', 'generating', 'results', 'scheduler'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getStepStatus = (stepIndex: number) => {
    const steps = ['topic', 'platforms', 'tone', 'audience', 'hashtags', 'generating', 'results', 'scheduler'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'inactive';
  };

  const handleTopicSubmit = () => {
    if (!inputText.trim()) {
      toast({
        title: "Please enter a topic",
        description: "Tell us what you want to create content about",
        variant: "destructive"
      });
      return;
    }

    setStepData(prev => ({ ...prev, topic: inputText.trim() }));
    setCurrentStep('platforms');
    setInputText('');
  };

  const handlePlatformSelection = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select platforms",
        description: "Choose at least one platform to continue",
        variant: "destructive"
      });
      return;
    }

    setStepData(prev => ({ ...prev, platforms: selectedPlatforms }));
    setCurrentStep('tone');
  };

  const handleToneSelection = () => {
    if (!selectedTone) {
      toast({
        title: "Choose a tone",
        description: "Select the tone for your content",
        variant: "destructive"
      });
      return;
    }

    setStepData(prev => ({ ...prev, tone: selectedTone }));
    setCurrentStep('audience');
  };

  const handleAudienceSubmit = () => {
    if (!inputText.trim()) {
      toast({
        title: "Describe your audience",
        description: "Tell us who you're creating content for",
        variant: "destructive"
      });
      return;
    }

    setStepData(prev => ({ ...prev, audience: inputText.trim() }));
    setCurrentStep('hashtags');
    setInputText('');
  };

  const handleHashtagsGeneration = () => {
    setCurrentStep('generating');
    generateContent();
  };

  const generateContent = async () => {
    setIsLoading(true);
    setShowRetryOption(false);
    
    // Set timeout for stuck generation
    const timeout = setTimeout(() => {
      setShowRetryOption(true);
    }, 8000);
    
    setGeneratingTimeout(timeout);
    
    try {
      const finalAudience = stepData.audience || 'general audience';
      
      // First try API call
      const response = await apiRequest('POST', '/api/ai-chat', {
        messages: [
          {
            role: 'system',
            content: `You are a professional social media content creator. Create platform-specific content that's engaging and optimized for each platform's audience and format.`
          },
          {
            role: 'user',
            content: `Create ${selectedTone} content about "${stepData.topic}" for ${finalAudience} on ${selectedPlatforms.join(', ')}`
          }
        ],
        platforms: selectedPlatforms,
        userQuery: `${stepData.topic} - ${selectedTone} tone for ${finalAudience}`
      });

      const aiResponse = await response.json();
      
      // Process successful response
      const suggestions: ContentSuggestion[] = selectedPlatforms.map((platform, index) => ({
        platform: platform,
        content: aiResponse.suggestedContent?.[index]?.content || generateFallbackContent(platform, stepData.topic!, selectedTone),
        hashtags: [...generateHashtags(stepData.topic!, platform), ...customHashtags],
        tone: selectedTone
      }));

      setGeneratedContent(suggestions);
      setStepData(prev => ({ ...prev, suggestions }));
      setCurrentStep('results');
      
    } catch (error) {
      console.error('API Error:', error);
      
      // Fallback content generation
      const fallbackSuggestions: ContentSuggestion[] = selectedPlatforms.map(platform => ({
        platform: platform,
        content: generateFallbackContent(platform, stepData.topic!, selectedTone),
        hashtags: [...generateHashtags(stepData.topic!, platform), ...customHashtags],
        tone: selectedTone
      }));

      setGeneratedContent(fallbackSuggestions);
      setStepData(prev => ({ ...prev, suggestions: fallbackSuggestions }));
      setCurrentStep('results');
      
      toast({
        title: "Using fallback content",
        description: "AI service is temporarily unavailable, but we've created content for you!",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
      if (generatingTimeout) {
        clearTimeout(generatingTimeout);
        setGeneratingTimeout(null);
      }
    }
  };

  const retryGeneration = () => {
    setShowRetryOption(false);
    generateContent();
  };

  const generateFallbackContent = (platform: string, topic: string, tone: string): string => {
    const platformTemplates = {
      instagram: `${getGreeting(tone)} Check out this amazing content about ${topic}! ${getCallToAction(platform, tone)}`,
      x: `${topic} is ${getToneAdjective(tone)}! ${getCallToAction(platform, tone)}`,
      linkedin: `Insights on ${topic}: ${getProfessionalOpener(tone)} ${getCallToAction(platform, tone)}`,
      tiktok: `POV: You discover ${topic} ${getCallToAction(platform, tone)}`,
      youtube: `Everything you need to know about ${topic}! ${getCallToAction(platform, tone)}`,
      facebook: `Let's talk about ${topic}! ${getCallToAction(platform, tone)}`
    };

    return platformTemplates[platform as keyof typeof platformTemplates] || 
           `Amazing content about ${topic}! ${getCallToAction(platform, tone)}`;
  };

  const getGreeting = (tone: string): string => {
    const greetings = {
      professional: "Presenting:",
      casual: "Hey everyone!",
      witty: "Plot twist:",
      inspiring: "Ready to be amazed?",
      educational: "Today we're learning about:",
      trendy: "This is it, chief:"
    };
    return greetings[tone as keyof typeof greetings] || "Check this out:";
  };

  const getToneAdjective = (tone: string): string => {
    const adjectives = {
      professional: "game-changing",
      casual: "pretty cool",
      witty: "unexpectedly awesome",
      inspiring: "absolutely incredible",
      educational: "fascinating",
      trendy: "absolutely fire"
    };
    return adjectives[tone as keyof typeof adjectives] || "amazing";
  };

  const getProfessionalOpener = (tone: string): string => {
    const openers = {
      professional: "In today's market, understanding this is crucial.",
      casual: "Here's what I've learned recently.",
      witty: "Buckle up for some industry truth bombs.",
      inspiring: "This could transform your perspective.",
      educational: "Let me break this down for you.",
      trendy: "The latest insights everyone's talking about."
    };
    return openers[tone as keyof typeof openers] || "Here's what you need to know.";
  };

  const getCallToAction = (platform: string, tone: string): string => {
    const ctas = {
      instagram: "Double tap if you agree! 💖",
      x: "Thoughts? 🤔",
      linkedin: "What's your experience with this?",
      tiktok: "Comment your reaction! 🔥",
      youtube: "Like and subscribe for more!",
      facebook: "Share your thoughts below! 👇"
    };
    return ctas[platform as keyof typeof ctas] || "Let me know what you think!";
  };

  const generateHashtags = (topic: string, platform: string): string[] => {
    const baseHashtags = [
      `#${topic.replace(/\s+/g, '')}`,
      '#content',
      '#socialmedia'
    ];
    
    const platformHashtags = {
      instagram: ['#insta', '#photooftheday', '#instagood'],
      x: ['#twitter', '#trending', '#viral'],
      linkedin: ['#professional', '#business', '#career'],
      tiktok: ['#fyp', '#viral', '#trending'],
      youtube: ['#youtube', '#subscribe', '#video'],
      facebook: ['#facebook', '#community', '#share']
    };

    return [...baseHashtags, ...(platformHashtags[platform as keyof typeof platformHashtags] || [])];
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard!",
      description: "Content is ready to paste",
    });
  };

  const resetGenerator = () => {
    setCurrentStep('topic');
    setStepData({});
    setSelectedPlatforms([]);
    setSelectedTone('');
    setGeneratedContent([]);
    setInputText('');
    setPreviewPlatform('');
    setRetryCount(0);
    setCustomHashtags([]);
    setScheduledTime('');
    setPostingStatus({});
    setShowRetryOption(false);
    if (generatingTimeout) {
      clearTimeout(generatingTimeout);
      setGeneratingTimeout(null);
    }
  };

  const addCustomHashtag = (hashtag: string) => {
    if (hashtag && !customHashtags.includes(hashtag)) {
      setCustomHashtags(prev => [...prev, hashtag]);
    }
  };

  const removeCustomHashtag = (hashtag: string) => {
    setCustomHashtags(prev => prev.filter(h => h !== hashtag));
  };

  const handleSchedulePost = async () => {
    setCurrentStep('scheduler');
    // Initialize posting status
    const initialStatus: {[key: string]: 'idle' | 'posting' | 'success' | 'error'} = {};
    selectedPlatforms.forEach(platform => {
      initialStatus[platform] = 'idle';
    });
    setPostingStatus(initialStatus);
  };

  const postToPlatform = async (platform: string, content: string) => {
    setPostingStatus(prev => ({ ...prev, [platform]: 'posting' }));
    
    try {
      await apiRequest('POST', '/api/post-to-platform', {
        content,
        platforms: [platform],
        scheduledFor: scheduledTime || null
      });
      
      setPostingStatus(prev => ({ ...prev, [platform]: 'success' }));
      
      toast({
        title: `Posted to ${platform}!`,
        description: "Your content has been published successfully",
      });
      
    } catch (error) {
      setPostingStatus(prev => ({ ...prev, [platform]: 'error' }));
      
      toast({
        title: `Failed to post to ${platform}`,
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const postToAllPlatforms = async () => {
    for (const platform of selectedPlatforms) {
      const content = generatedContent.find(c => c.platform === platform);
      if (content) {
        await postToPlatform(platform, content.content);
        // Add delay between posts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {STEP_INDICATORS.map((label, index) => (
          <div key={index} className="flex items-center">
            <div className={`step-dot ${getStepStatus(index)}`}>
              {getStepStatus(index) === 'completed' ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < STEP_INDICATORS.length - 1 && (
              <div className={`step-line ${getStepStatus(index) === 'completed' ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'topic':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 glass-card gradient-indigo rounded-3xl flex items-center justify-center mx-auto"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-800 font-satoshi">What's your content about?</h2>
              <p className="text-slate-600 font-inter text-lg">Tell us the topic or theme for your social media post</p>
            </div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., sustainable fashion, AI in business, weekend workout tips..."
                className="h-14 text-base border-2 border-slate-200 focus:border-indigo-500 rounded-2xl font-inter bg-white/80 backdrop-blur"
                onKeyPress={(e) => e.key === 'Enter' && handleTopicSubmit()}
              />
              <Button
                onClick={handleTopicSubmit}
                disabled={!inputText.trim()}
                className="w-full h-14 gradient-indigo hover-lift text-white rounded-2xl font-inter font-semibold text-lg shadow-lg"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        );

      case 'platforms':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 glass-card gradient-blue rounded-3xl flex items-center justify-center mx-auto"
              >
                <MessageSquare className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-800 font-satoshi">Where do you want to post?</h2>
              <p className="text-slate-600 font-inter text-lg">Select the platforms for your content</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {PLATFORMS.map((platform, index) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id);
                
                return (
                  <motion.button
                    key={platform.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => togglePlatform(platform.id)}
                    className={`platform-card p-5 border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-indigo-500 bg-white shadow-xl selected'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${platform.bgGradient}`}>
                        <Icon className="w-6 h-6" style={{ color: platform.color }} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold font-inter text-slate-800 text-lg">
                          {platform.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {platform.description}
                        </div>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="success-bounce"
                        >
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            <Button
              onClick={handlePlatformSelection}
              disabled={selectedPlatforms.length === 0}
              className="w-full h-14 gradient-blue hover-lift text-white rounded-2xl font-inter font-semibold text-lg shadow-lg"
            >
              Continue with {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        );

      case 'tone':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
                <Edit3 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 font-satoshi">What tone should we use?</h2>
              <p className="text-slate-600 font-inter">Choose the style that best fits your brand</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {TONES.map(tone => {
                const isSelected = selectedTone === tone.id;
                
                return (
                  <motion.button
                    key={tone.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTone(tone.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-purple-100' : 'bg-slate-100'
                      }`}>
                        <span className="text-lg">{tone.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold font-inter ${
                          isSelected ? 'text-purple-900' : 'text-slate-800'
                        }`}>
                          {tone.name}
                        </div>
                        <div className={`text-sm ${
                          isSelected ? 'text-purple-600' : 'text-slate-500'
                        }`}>
                          {tone.description}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            <Button
              onClick={handleToneSelection}
              disabled={!selectedTone}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-inter font-medium transition-all duration-300"
            >
              Continue with {selectedTone} tone <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 font-satoshi">Who's your target audience?</h2>
              <p className="text-slate-600 font-inter">Describe who you're creating this content for</p>
            </div>
            
            <div className="space-y-4">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., young professionals, tech enthusiasts, small business owners..."
                className="h-12 text-base border-2 border-slate-200 focus:border-orange-500 rounded-xl font-inter"
                onKeyPress={(e) => e.key === 'Enter' && handleAudienceSubmit()}
              />
              <Button
                onClick={handleAudienceSubmit}
                disabled={!inputText.trim()}
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-inter font-medium transition-all duration-300"
              >
                Generate Content <Zap className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'hashtags':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 glass-card gradient-purple rounded-3xl flex items-center justify-center mx-auto"
              >
                <Hash className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-800 font-satoshi">Generate hashtags</h2>
              <p className="text-slate-600 font-inter text-lg">Add custom hashtags or use our suggestions</p>
            </div>

            <div className="space-y-4">
              <div className="neumorphic-card p-6">
                <h3 className="font-semibold text-slate-800 mb-3 font-inter">Trending Hashtags</h3>
                <div className="flex flex-wrap gap-2">
                  {['#viral', '#trending', '#content', '#socialmedia', '#marketing'].map(tag => (
                    <Badge 
                      key={tag}
                      variant="secondary" 
                      className="cursor-pointer hover:bg-indigo-100 transition-colors"
                      onClick={() => addCustomHashtag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="neumorphic-card p-6">
                <h3 className="font-semibold text-slate-800 mb-3 font-inter">Custom Hashtags</h3>
                <div className="flex space-x-2 mb-3">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Add custom hashtag..."
                    className="flex-1 h-10 rounded-xl"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addCustomHashtag(inputText.startsWith('#') ? inputText : `#${inputText}`);
                        setInputText('');
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      addCustomHashtag(inputText.startsWith('#') ? inputText : `#${inputText}`);
                      setInputText('');
                    }}
                    size="sm"
                    className="gradient-indigo text-white rounded-xl"
                  >
                    Add
                  </Button>
                </div>
                
                {customHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customHashtags.map(tag => (
                      <Badge 
                        key={tag}
                        className="bg-indigo-100 text-indigo-800 hover:bg-red-100 hover:text-red-800 cursor-pointer transition-colors"
                        onClick={() => removeCustomHashtag(tag)}
                      >
                        {tag} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleHashtagsGeneration}
              className="w-full h-14 gradient-purple hover-lift text-white rounded-2xl font-inter font-semibold text-lg shadow-lg"
            >
              Generate Content <Zap className="w-5 h-5 ml-2" />
            </Button>
          </div>
        );

      case 'generating':
        return (
          <div className="space-y-6 text-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 glass-card gradient-indigo rounded-3xl flex items-center justify-center mx-auto"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
            
            <h2 className="text-3xl font-bold text-slate-800 font-satoshi">Creating your content...</h2>
            <p className="text-slate-600 font-inter text-lg">Our AI is crafting personalized posts for your selected platforms</p>
            
            <div className="space-y-4">
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="progress-bar h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 8, ease: "easeInOut" }}
                />
              </div>
              
              <div className="typing-indicator justify-center">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>

              {showRetryOption && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-orange-50 rounded-2xl border border-orange-200"
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <div className="flex-1 text-left">
                      <p className="text-orange-800 font-medium">Taking longer than expected</p>
                      <p className="text-orange-600 text-sm">The AI might be busy. Try again?</p>
                    </div>
                    <Button
                      onClick={retryGeneration}
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Retry
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 font-satoshi">Your content is ready!</h2>
              <p className="text-slate-600 font-inter">Personalized posts for each of your selected platforms</p>
            </div>

            {/* Platform Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {selectedPlatforms.map(platformId => {
                const platform = PLATFORMS.find(p => p.id === platformId);
                if (!platform) return null;
                
                const Icon = platform.icon;
                const isActive = previewPlatform === platformId;
                
                return (
                  <button
                    key={platformId}
                    onClick={() => setPreviewPlatform(platformId)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500'
                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium font-inter">{platform.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Preview */}
            {previewPlatform && (
              <Card className="border-2 border-slate-200 rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  {(() => {
                    const content = generatedContent.find(c => c.platform === previewPlatform);
                    if (!content) return null;
                    
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {(() => {
                              const platform = PLATFORMS.find(p => p.id === previewPlatform);
                              if (!platform) return null;
                              const Icon = platform.icon;
                              return (
                                <>
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${platform.bgColor}`}>
                                    <Icon className={`w-4 h-4 ${platform.textColor}`} />
                                  </div>
                                  <h3 className="font-semibold text-slate-800 font-inter">{platform.name}</h3>
                                </>
                              );
                            })()}
                          </div>
                          <Button
                            onClick={() => copyToClipboard(content.content)}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </Button>
                        </div>
                        
                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-slate-800 leading-relaxed font-inter">{content.content}</p>
                        </div>
                        
                        {content.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {content.hashtags.map(hashtag => (
                              <Badge key={hashtag} variant="secondary" className="text-xs">
                                {hashtag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={resetGenerator}
                variant="outline"
                className="flex-1 h-14 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-2xl font-inter font-semibold hover-lift"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Create New
              </Button>
              <Button
                onClick={() => generateContent()}
                className="flex-1 h-14 gradient-blue hover-lift text-white rounded-2xl font-inter font-semibold"
              >
                <Zap className="w-5 h-5 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={handleSchedulePost}
                className="flex-1 h-14 gradient-purple hover-lift text-white rounded-2xl font-inter font-semibold"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        );

      case 'scheduler':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 glass-card gradient-slate rounded-3xl flex items-center justify-center mx-auto"
              >
                <Calendar className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-800 font-satoshi">Schedule your posts</h2>
              <p className="text-slate-600 font-inter text-lg">Post now or schedule for later</p>
            </div>

            <div className="space-y-4">
              <div className="neumorphic-card p-6">
                <h3 className="font-semibold text-slate-800 mb-4 font-inter">Posting Options</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <Input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="flex-1 h-12 rounded-xl"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  {selectedPlatforms.map(platformId => {
                    const platform = PLATFORMS.find(p => p.id === platformId);
                    const status = postingStatus[platformId] || 'idle';
                    const Icon = platform?.icon || MessageSquare;
                    
                    return (
                      <div key={platformId} className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-200">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${platform?.bgGradient}`}>
                            <Icon className="w-5 h-5" style={{ color: platform?.color }} />
                          </div>
                          <span className="font-medium text-slate-800 font-inter">{platform?.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {status === 'idle' && (
                            <Button
                              onClick={() => {
                                const content = generatedContent.find(c => c.platform === platformId);
                                if (content) postToPlatform(platformId, content.content);
                              }}
                              size="sm"
                              className="gradient-indigo text-white rounded-xl hover-lift"
                            >
                              Post Now
                            </Button>
                          )}
                          
                          {status === 'posting' && (
                            <div className="flex items-center space-x-2 text-blue-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm font-medium">Posting...</span>
                            </div>
                          )}
                          
                          {status === 'success' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center space-x-2 text-emerald-600 success-bounce"
                            >
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Posted!</span>
                            </motion.div>
                          )}
                          
                          {status === 'error' && (
                            <div className="flex items-center space-x-2 text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Failed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentStep('results')}
                variant="outline"
                className="flex-1 h-14 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-2xl font-inter font-semibold hover-lift"
              >
                Back to Review
              </Button>
              <Button
                onClick={postToAllPlatforms}
                disabled={Object.values(postingStatus).some(status => status === 'posting')}
                className="flex-1 h-14 gradient-indigo hover-lift text-white rounded-2xl font-inter font-semibold"
              >
                <Send className="w-5 h-5 mr-2" />
                Post to All
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <MainHeader 
        title="AI Post Generator"
        showBackButton={true}
        onBackClick={() => setLocation('/dashboard')}
      />
      
      <div className="max-w-4xl mx-auto p-6 pb-20">
        {/* Step Indicator */}
        <div className="mb-8">
          {renderStepIndicator()}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-600 font-inter">Progress</span>
            <span className="text-sm font-semibold text-indigo-600 font-inter">
              {Math.round(getStepProgress())}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="progress-bar h-full"
              initial={{ width: "0%" }}
              animate={{ width: `${getStepProgress()}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="glass-card rounded-3xl shadow-2xl overflow-hidden border-0">
          <CardContent className="p-8 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}