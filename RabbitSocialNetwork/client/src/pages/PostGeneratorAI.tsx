import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MainHeader from "@/components/common/MainHeader";
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  RefreshCw, 
  Copy,
  CheckCircle,
  AlertCircle,
  Wand2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  suggestions?: ContentSuggestion[];
  step?: ConversationStep;
}

interface ContentSuggestion {
  id: string;
  platform: string;
  content: string;
  hashtags?: string[];
  tone: string;
  version: number;
}

type ConversationStep = 
  | 'greeting'
  | 'topic'
  | 'platforms'
  | 'tone'
  | 'audience'
  | 'generating'
  | 'results'
  | 'refinement';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500', icon: '📸' },
  { id: 'twitter', name: 'Twitter', color: 'bg-blue-500', icon: '🐦' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700', icon: '💼' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black', icon: '🎵' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', icon: '👥' },
  { id: 'youtube', name: 'YouTube', color: 'bg-red-600', icon: '🎬' }
];

const TONES = [
  { id: 'professional', name: 'Professional', emoji: '👔' },
  { id: 'casual', name: 'Casual', emoji: '😊' },
  { id: 'witty', name: 'Witty', emoji: '😄' },
  { id: 'inspiring', name: 'Inspiring', emoji: '✨' },
  { id: 'educational', name: 'Educational', emoji: '📚' },
  { id: 'conversational', name: 'Conversational', emoji: '💬' }
];

export default function PostGeneratorAI() {
  const [_, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ConversationStep>('greeting');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [conversationContext, setConversationContext] = useState<any>({});
  const [retryCount, setRetryCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with greeting message
    const greetingMessage: Message = {
      id: '1',
      type: 'assistant',
      content: "👋 Hey there! I'm your AI content assistant. I'll help you create amazing posts for your social media platforms. What would you like to create content about today?",
      timestamp: new Date(),
      step: 'greeting'
    };
    setMessages([greetingMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      await processUserInput(inputText);
    } catch (error) {
      console.error('Error processing message:', error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const processUserInput = async (input: string) => {
    switch (currentStep) {
      case 'greeting':
        handleTopicInput(input);
        break;
      case 'topic':
        handlePlatformSelection();
        break;
      case 'platforms':
        handleToneSelection();
        break;
      case 'tone':
        handleAudienceInput(input);
        break;
      case 'audience':
        await generateContent();
        break;
      case 'results':
        await handleRefinement(input);
        break;
      default:
        break;
    }
  };

  const handleTopicInput = (topic: string) => {
    setConversationContext(prev => ({ ...prev, topic }));
    
    const response: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Great! I'll help you create content about "${topic}". Which platforms would you like to post on? Select all that apply:`,
      timestamp: new Date(),
      step: 'platforms'
    };
    
    setMessages(prev => [...prev, response]);
    setCurrentStep('platforms');
  };

  const handlePlatformSelection = () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: "Please select platforms",
        description: "Choose at least one platform to continue",
        variant: "destructive"
      });
      return;
    }

    setConversationContext(prev => ({ ...prev, platforms: selectedPlatforms }));
    
    const response: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Perfect! You've selected ${selectedPlatforms.join(', ')}. What tone would you like for your content?`,
      timestamp: new Date(),
      step: 'tone'
    };
    
    setMessages(prev => [...prev, response]);
    setCurrentStep('tone');
  };

  const handleToneSelection = () => {
    if (!selectedTone) {
      toast({
        title: "Please select a tone",
        description: "Choose a tone to continue",
        variant: "destructive"
      });
      return;
    }

    setConversationContext(prev => ({ ...prev, tone: selectedTone }));
    
    const response: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Excellent! I'll create ${selectedTone} content for you. Who's your target audience? (e.g., "young professionals", "tech enthusiasts", "small business owners")`,
      timestamp: new Date(),
      step: 'audience'
    };
    
    setMessages(prev => [...prev, response]);
    setCurrentStep('audience');
  };

  const handleAudienceInput = (audience: string) => {
    setConversationContext(prev => ({ ...prev, audience }));
    
    const response: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Got it! Creating ${conversationContext.tone} content about "${conversationContext.topic}" for ${audience} on ${selectedPlatforms.join(', ')}. Give me a moment to craft something amazing! ✨`,
      timestamp: new Date(),
      step: 'generating',
      isLoading: true
    };
    
    setMessages(prev => [...prev, response]);
    setCurrentStep('generating');
  };

  const generateContent = async () => {
    try {
      const response = await apiRequest('POST', '/api/ai-chat', {
        messages: [
          {
            role: 'system',
            content: `You are a creative social media content generator. Create 3 different versions of content for each platform. Be specific to each platform's style and format.`
          },
          {
            role: 'user',
            content: `Create ${conversationContext.tone} content about "${conversationContext.topic}" for ${conversationContext.audience} on ${selectedPlatforms.join(', ')}`
          }
        ],
        platforms: selectedPlatforms,
        userQuery: `${conversationContext.topic} - ${conversationContext.tone} tone for ${conversationContext.audience}`
      });

      const aiResponse = await response.json();
      
      // Process the response into suggestions
      const suggestions: ContentSuggestion[] = selectedPlatforms.flatMap((platform, platformIndex) => 
        Array.from({ length: 3 }, (_, version) => ({
          id: `${platform}-${version}`,
          platform,
          content: aiResponse.suggestedContent?.find(s => s.platform.toLowerCase() === platform.toLowerCase())?.content || `Generated content for ${platform}`,
          hashtags: ['#example', '#content'],
          tone: conversationContext.tone,
          version: version + 1
        }))
      );

      const resultMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🎉 Here are your personalized content suggestions! I've created 3 versions for each platform. You can copy any version you like or ask me to refine them further.`,
        timestamp: new Date(),
        step: 'results',
        suggestions
      };

      setMessages(prev => prev.map(msg => 
        msg.step === 'generating' ? resultMessage : msg
      ));
      setCurrentStep('results');
      
    } catch (error) {
      console.error('Error generating content:', error);
      handleError(error);
    }
  };

  const handleRefinement = async (refinementRequest: string) => {
    // Handle refinement requests
    const response: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `I'll refine that for you! "${refinementRequest}"`,
      timestamp: new Date(),
      step: 'refinement'
    };
    
    setMessages(prev => [...prev, response]);
  };

  const handleError = (error?: any) => {
    let errorContent = "🔧 We're experiencing some hiccups. Try again or tweak your input.";
    
    if (error?.message?.includes('quota') || error?.message?.includes('429')) {
      errorContent = "🔑 The AI service is currently at capacity. Please try again in a few moments or contact support for a new API key.";
    } else if (error?.message?.includes('401')) {
      errorContent = "🔒 Authentication issue with the AI service. Please check your API configuration.";
    } else if (error?.message?.includes('500')) {
      errorContent = "⚠️ The AI service is temporarily down. Our team has been notified.";
    }

    const errorMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: errorContent,
      timestamp: new Date()
    };
    
    setMessages(prev => {
      // Replace any loading message with error message
      const updatedMessages = prev.map(msg => 
        msg.isLoading ? errorMessage : msg
      );
      
      // If no loading message was found, just add the error message
      if (!prev.some(msg => msg.isLoading)) {
        updatedMessages.push(errorMessage);
      }
      
      return updatedMessages;
    });
    
    setRetryCount(prev => prev + 1);
  };

  const handleRetry = () => {
    if (currentStep === 'audience' || currentStep === 'generating') {
      generateContent();
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const selectTone = (toneId: string) => {
    setSelectedTone(toneId);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <MainHeader 
        title="AI Post Generator"
        showBackButton={true}
        onBackClick={() => setLocation('/dashboard')}
      />
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-4xl rounded-2xl shadow-lg ${
                message.type === 'user' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-indigo-600' 
                        : 'bg-emerald-100 dark:bg-emerald-900'
                    }`}>
                      {message.type === 'user' ? (
                        <span className="text-white font-semibold">U</span>
                      ) : (
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className={`${
                        message.type === 'user' 
                          ? 'text-white' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {message.content}
                      </div>
                      
                      {message.isLoading && (
                        <div className="flex items-center space-x-2 mt-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
                          <span className="text-sm text-gray-500">Generating amazing content...</span>
                        </div>
                      )}
                      
                      {/* Platform Selection */}
                      {message.step === 'platforms' && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {PLATFORMS.map(platform => (
                            <motion.button
                              key={platform.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => togglePlatform(platform.id)}
                              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                                selectedPlatforms.includes(platform.id)
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{platform.icon}</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {platform.name}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                      
                      {/* Tone Selection */}
                      {message.step === 'tone' && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {TONES.map(tone => (
                            <motion.button
                              key={tone.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => selectTone(tone.id)}
                              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                                selectedTone === tone.id
                                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{tone.emoji}</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {tone.name}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                      
                      {/* Content Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {selectedPlatforms.map(platform => (
                            <div key={platform} className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">
                                  {PLATFORMS.find(p => p.id === platform)?.icon}
                                </span>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                  {platform}
                                </h4>
                              </div>
                              
                              {message.suggestions
                                .filter(s => s.platform.toLowerCase() === platform)
                                .map(suggestion => (
                                  <motion.div
                                    key={suggestion.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <Badge variant="outline" className="text-xs">
                                        Version {suggestion.version}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(suggestion.content)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-200 mb-2">
                                      {suggestion.content}
                                    </p>
                                    {suggestion.hashtags && suggestion.hashtags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {suggestion.hashtags.map(hashtag => (
                                          <Badge key={hashtag} variant="secondary" className="text-xs">
                                            {hashtag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Retry Button */}
                      {retryCount > 0 && message.type === 'assistant' && (
                        <div className="mt-3">
                          <Button
                            onClick={handleRetry}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span>Try Again</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <Card className="max-w-xs bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            {currentStep === 'platforms' ? (
              <div className="text-center">
                <Button 
                  onClick={handlePlatformSelection}
                  disabled={selectedPlatforms.length === 0}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-2 rounded-xl"
                >
                  Continue with {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}
                </Button>
              </div>
            ) : currentStep === 'tone' ? (
              <div className="text-center">
                <Button 
                  onClick={handleToneSelection}
                  disabled={!selectedTone}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2 rounded-xl"
                >
                  Continue with {selectedTone} tone
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1 rounded-xl border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}