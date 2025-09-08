import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  SendHorizontal, 
  Bot, 
  User, 
  Sparkles, 
  Image as ImageIcon, 
  Star,
  Trophy,
  Target,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Zap,
  Award,
  Loader2,
  Settings,
  Shuffle,
  RefreshCw,
  Edit3,
  Lightbulb,
  HelpCircle,
  Plus,
  X
} from "lucide-react";
import { 
  SiInstagram, 
  SiX, 
  SiLinkedin, 
  SiTiktok, 
  SiYoutube, 
  SiFacebook 
} from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import MainHeader from "@/components/common/MainHeader";
import { PLATFORM_COLORS } from "@/constants";
import { apiRequest, queryClient } from "@/lib/queryClient";

type MessageType = 'user' | 'ai' | 'system';

interface Message {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
  isGenerating?: boolean;
  platforms?: string[];
  suggestedContent?: {
    content: string;
    platform: string;
    hashtags?: string;
  }[];
  generatedImage?: {
    url: string;
    prompt: string;
    isGenerating?: boolean;
  };
  originalUserQuery?: string; // Track the user query that generated this AI response
}

const PLATFORM_ICONS = {
  instagram: <SiInstagram className="w-4 h-4" />,
  x: <SiX className="w-4 h-4" />,
  linkedin: <SiLinkedin className="w-4 h-4" />,
  tiktok: <SiTiktok className="w-4 h-4" />,
  youtube: <SiYoutube className="w-4 h-4" />,
  facebook: <SiFacebook className="w-4 h-4" />
};

const TONE_OPTIONS = [
  { id: 'Professional', label: 'Professional', icon: '💼', description: 'Formal, business-oriented' },
  { id: 'Casual', label: 'Casual', icon: '😊', description: 'Relaxed, conversational' },
  { id: 'Humorous', label: 'Humorous', icon: '😂', description: 'Witty, funny, entertaining' },
  { id: 'GenZ', label: 'Gen-Z', icon: '🔥', description: 'Trendy slang, viral vibes' },
  { id: 'Inspirational', label: 'Inspirational', icon: '✨', description: 'Motivational, uplifting' },
  { id: 'Educational', label: 'Educational', icon: '📚', description: 'Informative, teaching' },
  { id: 'Storytelling', label: 'Storytelling', icon: '📖', description: 'Narrative, personal journey' },
  { id: 'Bold', label: 'Bold', icon: '⚡', description: 'Confident, attention-grabbing' },
  { id: 'Authentic', label: 'Authentic', icon: '🙏', description: 'Genuine, personal, vulnerable' }
];

const FORMAT_OPTIONS = [
  { id: 'paragraph', label: 'Paragraph', icon: '📝', description: 'Flowing narrative format' },
  { id: 'poetic', label: 'Poetic', icon: '🎭', description: 'Artistic, rhythmic style' },
  { id: 'bullet', label: 'Bullet-style', icon: '📋', description: 'List format with points' },
  { id: 'concise', label: 'Concise/Snappy', icon: '⚡', description: 'Brief, punchy content' },
  { id: 'story', label: 'Story-style', icon: '📖', description: 'Full narrative arc' }
];

const NICHE_OPTIONS = [
  { id: 'general', label: 'General', icon: '🌟' },
  { id: 'writer', label: 'Writer', icon: '✍️' },
  { id: 'tech', label: 'Tech Reviewer', icon: '💻' },
  { id: 'food', label: 'Food Blogger', icon: '🍽️' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌿' },
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'creative', label: 'Creative', icon: '🎨' }
];

const EMOJI_PACKS = [
  { id: 'mixed', label: 'Mixed', icon: '🌈', description: 'Varied emoji selection' },
  { id: 'nature', label: 'Nature', icon: '🌿', description: 'Plants, animals, weather' },
  { id: 'minimalist', label: 'Minimalist', icon: '✨', description: 'Simple, clean symbols' },
  { id: 'vibrant', label: 'Vibrant', icon: '🎉', description: 'Colorful, energetic' },
  { id: 'nostalgic', label: 'Nostalgic', icon: '📸', description: 'Vintage, retro vibes' },
  { id: 'professional', label: 'Professional', icon: '💼', description: 'Business-appropriate' }
];

const LENGTH_OPTIONS = [
  { id: 'short', label: 'Short', icon: '⚡', description: '~50 words - Quick hooks & snappy content', wordCount: 50 },
  { id: 'medium', label: 'Medium', icon: '📝', description: '~100 words - Balanced storytelling', wordCount: 100 },
  { id: 'long', label: 'Long', icon: '📖', description: '~200 words - Detailed reflections', wordCount: 200 }
];

const CONTENT_STYLE_OPTIONS = [
  { id: 'story', label: 'Story Style', icon: '📖', description: 'Narrative arc: problem → impact → action' },
  { id: 'data-driven', label: 'Data-driven', icon: '📊', description: 'Facts, statistics, and logical arguments' },
  { id: 'call-to-action', label: 'Call-to-action', icon: '📢', description: 'Actionable steps and direct engagement' }
];

const EMOTIONAL_TONE_OPTIONS = [
  { id: 'emotional', label: 'Emotional', icon: '❤️', description: 'Include feelings and personal connection' },
  { id: 'factual', label: 'Factual', icon: '🔍', description: 'Objective information and logical reasoning' }
];

const STRUCTURE_OPTIONS = [
  { id: 'short-sentences', label: 'Short Sentences', icon: '📝', description: '1-2 short, readable sentences per paragraph' },
  { id: 'flowing-paragraphs', label: 'Flowing Paragraphs', icon: '🌊', description: 'Natural paragraph flow with smooth transitions' },
  { id: 'bullet-points', label: 'Bullet Points', icon: '📋', description: 'Clear bullet points with organized sections' }
];

const QUICK_PROMPTS = [
  "Write me a caption for a travel post",
  "Make it sound Gen Z",
  "Use 3 emojis",
  "Create a LinkedIn career post",
  "Write a funny Instagram story",
  "Make a professional announcement"
];

export default function AIChat() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'x']);
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [selectedFormat, setSelectedFormat] = useState('paragraph');
  const [selectedNiche, setSelectedNiche] = useState('general');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [contentStyle, setContentStyle] = useState('story');
  const [emotionalTone, setEmotionalTone] = useState('emotional');
  const [structurePreference, setStructurePreference] = useState('short-sentences');
  const [showContentQuality, setShowContentQuality] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "ai",
      text: "Hey there! ✨ I'm your AI content assistant. I'm here to help you create amazing posts for your social media platforms. What would you like to create today?",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showPromptAssistant, setShowPromptAssistant] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [editingText, setEditingText] = useState<{messageId: string, platform: string, selectedText: string, sentenceIndex?: number} | null>(null);
  const [selectedEmojiPack, setSelectedEmojiPack] = useState('mixed');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [lastProcessedInput, setLastProcessedInput] = useState('');
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(() => {
    try {
      return localStorage.getItem('ai-suggestions-dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [processingEnhancement, setProcessingEnhancement] = useState(false);
  
  // Gamification state
  const [userStats, setUserStats] = useState({
    xp: 150,
    level: 1,
    dailyProgress: 1,
    dailyTarget: 3,
    totalPosts: 12,
    streak: 3
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentLevelProgress = () => {
    const xpForCurrentLevel = userStats.xp % 200; // 200 XP per level
    return (xpForCurrentLevel / 200) * 100;
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    setShowHelp(false);
  };

  const regenerateContent = async (messageId: string, platform: string) => {
    try {
      const targetMessage = messages.find(msg => msg.id === messageId);
      if (!targetMessage?.originalUserQuery) return;

      const response = await apiRequest('POST', '/api/ai-chat', {
        messages: [],
        platforms: [platform],
        userQuery: targetMessage.originalUserQuery,
        tone: selectedTone,
        format: selectedFormat,
        niche: selectedNiche,
        includeEmojis: includeEmojis
      });

      const data = await response.json();
      
      // Update the specific platform content in the message
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              suggestedContent: msg.suggestedContent?.map(content => 
                content.platform === platform 
                  ? { 
                      ...content, 
                      content: data.suggestedContent?.[0]?.content || content.content,
                      hashtags: data.suggestedContent?.[0]?.hashtags || content.hashtags
                    }
                  : content
              ) 
            }
          : msg
      ));

      toast({
        title: "Content regenerated!",
        description: `New ${platform} content generated successfully`,
      });

    } catch (error) {
      console.error('Error regenerating content:', error);
      toast({
        title: "Regeneration failed",
        description: "Unable to regenerate content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shuffleIntroLine = async (messageId: string, platform: string) => {
    try {
      const targetMessage = messages.find(msg => msg.id === messageId);
      if (!targetMessage?.originalUserQuery) return;

      const response = await apiRequest('POST', '/api/ai-chat', {
        messages: [],
        platforms: [platform],
        userQuery: `Generate only a new opening sentence for: ${targetMessage.originalUserQuery}. Keep it under 20 words and match the ${selectedTone} tone.`,
        tone: selectedTone,
        format: selectedFormat,
        niche: selectedNiche,
        includeEmojis: includeEmojis,
        emojiPack: selectedEmojiPack,
        length: selectedLength
      });

      const data = await response.json();
      
      // Extract first sentence from new content
      const newContent = data.suggestedContent?.[0]?.content || '';
      const sentences = newContent.split(/[.!?]+/);
      const newIntroLine = sentences[0].trim() + '.';
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              suggestedContent: msg.suggestedContent?.map(content => 
                content.platform === platform 
                  ? { 
                      ...content, 
                      content: content.content.replace(/^[^.!?]*[.!?]/, newIntroLine + ' ')
                    }
                  : content
              ) 
            }
          : msg
      ));

      toast({
        title: "Intro line shuffled!",
        description: `New opening sentence generated for ${platform}`,
      });

    } catch (error) {
      console.error('Error shuffling intro line:', error);
      toast({
        title: "Shuffle failed",
        description: "Unable to shuffle intro line. Please try again.",
        variant: "destructive",
      });
    }
  };

  const analyzeVagueInput = (input: string) => {
    const vagueTriggers = [
      'there were', 'i saw', 'it was', 'lots of', 'many', 'some', 'few', 'everything', 'nothing',
      'good', 'bad', 'nice', 'okay', 'fine', 'great', 'terrible', 'amazing', 'awful',
      'so much', 'am scared', 'feeling', 'raining', 'its is', 'very', 'really', 'quite'
    ];
    
    const hasVagueTrigger = vagueTriggers.some(trigger => 
      input.toLowerCase().includes(trigger.toLowerCase())
    );
    
    const isShort = input.trim().split(' ').length < 8; // Increased threshold for longer inputs
    const isVague = hasVagueTrigger || isShort;
    
    if (isVague) {
      const suggestions = [];
      
      if (input.toLowerCase().includes('rain') || input.toLowerCase().includes('weather') || input.toLowerCase().includes('storm')) {
        suggestions.push("Describe sensory details");
        suggestions.push("Focus on emotional contrast");
        suggestions.push("Add specific location details");
      } else if (input.toLowerCase().includes('scared') || input.toLowerCase().includes('fear') || input.toLowerCase().includes('afraid')) {
        suggestions.push("Include personal emotions");
        suggestions.push("Focus on emotional contrast");
        suggestions.push("Share specific moments");
      } else if (input.toLowerCase().includes('tree') || input.toLowerCase().includes('building')) {
        suggestions.push("Emphasize nostalgia and memories");
        suggestions.push("Add specific location details");
        suggestions.push("Focus on emotional contrast");
      } else if (input.toLowerCase().includes('food') || input.toLowerCase().includes('eat')) {
        suggestions.push("Describe taste and texture");
        suggestions.push("Add cultural significance");
        suggestions.push("Focus on visual appeal");
      } else if (input.toLowerCase().includes('travel') || input.toLowerCase().includes('trip')) {
        suggestions.push("Share specific moments");
        suggestions.push("Focus on cultural differences");
        suggestions.push("Describe sensory details");
      } else {
        suggestions.push("Add specific details");
        suggestions.push("Include personal emotions");
        suggestions.push("Focus on unique moments");
      }
      
      return suggestions;
    }
    
    return [];
  };

  const enhanceInputWithSuggestion = async (originalInput: string, suggestion: string) => {
    setProcessingEnhancement(true);
    
    try {
      // Create a dedicated enhancement API endpoint call
      const response = await apiRequest('POST', '/api/enhance-input', {
        originalInput: originalInput,
        suggestion: suggestion,
        tone: selectedTone,
        format: selectedFormat,
        niche: selectedNiche
      });

      if (!response.ok) {
        throw new Error(`Enhancement failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Use the enhanced input text
      const enhancedInput = data.enhancedInput || originalInput;
      setInput(enhancedInput);
      setProcessingEnhancement(false);
      setShowPromptAssistant(false);
      
      toast({
        title: "Input enhanced!",
        description: `Applied: ${suggestion}`,
      });
      
    } catch (error) {
      console.error('Enhancement error:', error);
      setProcessingEnhancement(false);
      
      // Fallback to local enhancement if API fails
      const localEnhancement = applyLocalEnhancement(originalInput, suggestion);
      setInput(localEnhancement);
      setShowPromptAssistant(false);
      
      toast({
        title: "Enhancement applied locally",
        description: `Applied: ${suggestion}`,
      });
    }
  };

  const applyLocalEnhancement = (originalInput: string, suggestion: string) => {
    const enhancementTemplates = {
      'Emphasize nostalgia and memories': `${originalInput} - bringing back memories of childhood and simpler times`,
      'Add specific location details': `${originalInput} in the heart of the bustling city streets, surrounded by towering buildings and busy crowds`,
      'Focus on emotional contrast': `${originalInput}, heart pounding with excitement yet feeling a moment of peaceful clarity`,
      'Describe taste and texture': `${originalInput} - savoring the rich, warm flavors and satisfying textures`,
      'Add cultural significance': `${originalInput}, a tradition that connects generations and celebrates our shared heritage`,
      'Focus on visual appeal': `${originalInput} under the golden hour light, creating a picture-perfect moment`,
      'Share specific moments': `${originalInput} - that exact moment when everything clicked and made perfect sense`,
      'Focus on cultural differences': `${originalInput}, observing the fascinating differences in how people from different backgrounds experience this`,
      'Describe sensory details': `${originalInput} with the sounds of raindrops against the window, the smell of wet earth, and the cool air filling my lungs`,
      'Add specific details': `${originalInput} last Tuesday evening around 6 PM, when the weather was perfect and everything felt just right`,
      'Include personal emotions': `${originalInput}, feeling a deep mix of vulnerability and wonder, my heart racing with both fear and strange comfort`,
      'Focus on unique moments': `${originalInput} - something that rarely happens and made this experience truly special`
    };

    return enhancementTemplates[suggestion] || `${originalInput} with added depth and meaning`;
  };

  const dismissSuggestions = () => {
    setSuggestionsDismissed(true);
    setShowPromptAssistant(false);
    try {
      localStorage.setItem('ai-suggestions-dismissed', 'true');
    } catch (error) {
      console.error('Failed to save suggestion dismissal:', error);
    }
  };

  const resetSuggestions = () => {
    setSuggestionsDismissed(false);
    try {
      localStorage.removeItem('ai-suggestions-dismissed');
    } catch (error) {
      console.error('Failed to reset suggestion dismissal:', error);
    }
    
    toast({
      title: "Enhancement suggestions reset",
      description: "AI suggestions will now appear for vague inputs",
    });
  };

  const handleSmartEdit = async (messageId: string, platform: string, selectedText: string, editType: string) => {
    try {
      const editInstructions = {
        'concise': 'Make this text more concise and direct while keeping the meaning',
        'poetic': 'Rewrite this text in a more poetic, artistic style with elegant language',
        'humorous': 'Add a humorous twist to this text while keeping it relevant',
        'professional': 'Make this text more professional and polished',
        'emotional': 'Add more emotional depth and feeling to this text',
        'simplify': 'Simplify the language to be more accessible and clear'
      };

      const response = await apiRequest('POST', '/api/ai-chat', {
        messages: [],
        platforms: [platform],
        userQuery: `${editInstructions[editType as keyof typeof editInstructions]}: "${selectedText}"`,
        tone: editType === 'professional' ? 'Professional' : (editType === 'humorous' ? 'Humorous' : selectedTone),
        format: selectedFormat,
        niche: selectedNiche,
        includeEmojis: includeEmojis,
        emojiPack: selectedEmojiPack,
        length: selectedLength
      });

      const data = await response.json();
      const editedText = data.suggestedContent?.[0]?.content || selectedText;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              suggestedContent: msg.suggestedContent?.map(content => 
                content.platform === platform 
                  ? { 
                      ...content, 
                      content: content.content.replace(selectedText, editedText.trim())
                    }
                  : content
              ) 
            }
          : msg
      ));

      setEditingText(null);
      toast({
        title: "Text edited!",
        description: `Applied ${editType} editing to selected text`,
      });

    } catch (error) {
      console.error('Error editing text:', error);
      toast({
        title: "Edit failed",
        description: "Unable to edit text. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSentenceEdit = (messageId: string, platform: string, content: string, sentenceIndex: number) => {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const selectedSentence = sentences[sentenceIndex]?.trim();
    
    if (selectedSentence) {
      setEditingText({
        messageId,
        platform,
        selectedText: selectedSentence,
        sentenceIndex
      });
    }
  };

  const handleExtendVersion = async (messageId: string, platform: string, currentContent: string) => {
    try {
      const response = await apiRequest('POST', '/api/ai-chat', {
        messages: [],
        platforms: [platform],
        userQuery: `Expand this content into a more detailed version while maintaining the same tone and message: "${currentContent}"`,
        tone: selectedTone,
        format: selectedFormat,
        niche: selectedNiche,
        includeEmojis: includeEmojis,
        emojiPack: selectedEmojiPack,
        length: 'long'
      });

      const data = await response.json();
      const extendedContent = data.suggestedContent?.[0]?.content || currentContent;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              suggestedContent: msg.suggestedContent?.map(content => 
                content.platform === platform 
                  ? { 
                      ...content, 
                      content: extendedContent
                    }
                  : content
              ) 
            }
          : msg
      ));

      toast({
        title: "Content extended!",
        description: `Created longer version for ${platform}`,
      });

    } catch (error) {
      console.error('Error extending content:', error);
      toast({
        title: "Extension failed",
        description: "Unable to extend content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateImageFromText = async (messageId: string, prompt: string) => {
    try {
      // Find the message to get the original user query
      const targetMessage = messages.find(msg => msg.id === messageId);
      const userQuery = targetMessage?.originalUserQuery || '';
      
      console.log('🎨 Generating contextual image...');
      console.log('🎯 Original user query:', userQuery);
      console.log('🤖 AI response text:', prompt.substring(0, 100) + '...');
      
      // Update message to show image generation in progress
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              generatedImage: { 
                url: '', 
                prompt: userQuery ? `Contextual image for: ${userQuery}` : prompt.substring(0, 100) + '...', 
                isGenerating: true 
              } 
            }
          : msg
      ));

      const response = await apiRequest('POST', '/api/generate-image', {
        prompt: prompt, // Fallback prompt
        userQuery: userQuery, // User's original input for context
        aiResponse: prompt // AI-generated content for context
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        // Update message with generated image
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                generatedImage: { 
                  url: data.imageUrl, 
                  prompt: data.context || data.prompt || prompt.substring(0, 100),
                  isGenerating: false 
                } 
              }
            : msg
        ));

        toast({
          title: "Contextual Image Generated!",
          description: "Your AI-generated image is ready and matches your original request",
        });
      } else {
        throw new Error(data.message || 'Failed to generate image');
      }
    } catch (error: any) {
      console.error('❌ Error generating contextual image:', error);
      
      // Remove image generation indicator on error
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, generatedImage: undefined }
          : msg
      ));

      toast({
        title: "Image Generation Failed",
        description: error.message || "Unable to generate image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Only show suggestions if not dismissed and input is significantly different from last processed
    const suggestions = analyzeVagueInput(input);
    const inputChanged = input !== lastProcessedInput;
    
    if (suggestions.length > 0 && !showPromptAssistant && !suggestionsDismissed && inputChanged) {
      setPromptSuggestions(suggestions);
      setShowPromptAssistant(true);
      setLastProcessedInput(input);
      return;
    }

    // If we're proceeding with submission, mark input as processed
    setLastProcessedInput(input);
    setShowPromptAssistant(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date(),
      platforms: selectedPlatforms
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      type: 'ai',
      text: '',
      timestamp: new Date(),
      isGenerating: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await apiRequest('POST', '/api/ai-chat', {
        messages: messages.concat(userMessage),
        platforms: selectedPlatforms,
        userQuery: input,
        tone: selectedTone,
        format: selectedFormat,
        niche: selectedNiche,
        includeEmojis: includeEmojis,
        emojiPack: selectedEmojiPack,
        length: selectedLength,
        contentStyle: contentStyle,
        emotionalTone: emotionalTone,
        structurePreference: structurePreference
      });

      const data = await response.json();
      
      // Log the AI response for debugging
      console.log('🤖 AI Response received:', data);
      
      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: Date.now().toString(),
          type: 'ai',
          text: data.message,
          timestamp: new Date(),
          suggestedContent: data.suggestedContent,
          originalUserQuery: input // Store the user's original query for context
        }];
      });

      // Award XP for interaction
      setUserStats(prev => ({
        ...prev,
        xp: prev.xp + 10,
        dailyProgress: Math.min(prev.dailyProgress + 1, prev.dailyTarget)
      }));

      toast({
        title: "Response generated!",
        description: "+10 XP earned for AI interaction",
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove typing indicator and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        return [...filtered, {
          id: Date.now().toString(),
          type: 'ai',
          text: "I'm having trouble connecting right now. Let me help you with some quick content ideas instead! Try asking me about travel posts, business updates, or creative captions.",
          timestamp: new Date()
        }];
      });

      toast({
        title: "Connection issue",
        description: "Using offline mode - I can still help with basic content ideas!",
        variant: "destructive",
      });
    }

    setIsTyping(false);
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="flex items-start space-x-2 max-w-[85%] md:max-w-[80%]">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 md:p-4 rounded-2xl rounded-tr-md shadow-lg">
              <p className="text-sm md:text-base leading-relaxed">{message.text}</p>
            </div>
            <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-white shadow-md flex-shrink-0">
              <AvatarFallback className="bg-blue-500 text-white text-xs">
                <User className="w-4 h-4 md:w-5 md:h-5" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-start space-x-2 max-w-[85%] md:max-w-[80%]">
          <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-white shadow-md flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
              {message.isGenerating ? (
                <div className="flex space-x-1">
                  <div key="bounce-1" className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div key="bounce-2" className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div key="bounce-3" className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                </div>
              ) : (
                <Bot className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 p-3 md:p-4 rounded-2xl rounded-tl-md shadow-lg">
            {message.isGenerating ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="flex space-x-1">
                  <div key="thinking-1" className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div key="thinking-2" className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div key="thinking-3" className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            ) : (
              <div>
                <p className="text-sm md:text-base leading-relaxed text-gray-700 whitespace-pre-wrap">{message.text}</p>
                {message.suggestedContent && message.suggestedContent.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">✨ Generated content for your platforms:</p>
                    <div className="space-y-2">
                      {message.suggestedContent.map((content, index) => (
                        <div key={`${message.id}-content-${index}`} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {PLATFORM_ICONS[content.platform.toLowerCase() as keyof typeof PLATFORM_ICONS]}
                              <span className="text-xs font-medium text-gray-600 capitalize">{content.platform}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                onClick={() => shuffleIntroLine(message.id, content.platform)}
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
                                title="Shuffle intro line"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => handleExtendVersion(message.id, content.platform, content.content)}
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
                                title="Create extended version"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => regenerateContent(message.id, content.platform)}
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
                                title="Regenerate content"
                              >
                                <Shuffle className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 mb-2">
                            {content.content.split(/[.!?]+/).filter(s => s.trim()).map((sentence, index) => (
                              <span
                                key={`sentence-${index}`}
                                className="cursor-pointer hover:bg-blue-50 hover:shadow-sm rounded px-1 py-0.5 transition-colors duration-150"
                                onClick={() => handleSentenceEdit(message.id, content.platform, content.content, index)}
                                title="Click to edit this sentence"
                              >
                                {sentence.trim()}{index < content.content.split(/[.!?]+/).filter(s => s.trim()).length - 1 ? '. ' : ''}
                              </span>
                            ))}
                          </div>
                          {content.hashtags && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <p className="text-xs text-blue-600 font-medium">
                                {content.hashtags}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Create Image Button - Only show for AI messages with content */}
                {message.type === 'ai' && message.text && !message.isGenerating && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Button
                      onClick={() => generateImageFromText(message.id, message.text)}
                      disabled={message.generatedImage?.isGenerating}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      size="sm"
                    >
                      {message.generatedImage?.isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Image...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4" />
                          <span>Create Image</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Generated Image Display */}
                {message.generatedImage && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-medium text-gray-600">AI Generated Image</span>
                      </div>
                      
                      {message.generatedImage.isGenerating ? (
                        <div className="flex items-center justify-center py-8 bg-gray-100 rounded-lg">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Generating your image...</p>
                            <p className="text-xs text-gray-500 mt-1">This may take 10-30 seconds</p>
                          </div>
                        </div>
                      ) : message.generatedImage.url ? (
                        <div className="space-y-2">
                          <img 
                            src={message.generatedImage.url} 
                            alt={`Generated image: ${message.generatedImage.prompt}`}
                            className="w-full max-w-md rounded-lg shadow-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'bg-red-50 border border-red-200 rounded-lg p-4 text-center';
                              errorDiv.innerHTML = '<p class="text-red-600 text-sm">Failed to load image</p>';
                              target.parentNode?.appendChild(errorDiv);
                            }}
                          />
                          <p className="text-xs text-gray-500">Prompt: {message.generatedImage.prompt}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <MainHeader />
      
      <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
        {/* Header with XP and Level */}
        <Card className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white animate-float">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">AI Chat Creator</h1>
                  <p className="text-gray-600 text-sm">Your intelligent content assistant</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-lg text-gray-800">{userStats.xp} XP</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-purple-500" />
                    <span>Level {userStats.level}</span>
                  </div>
                </div>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${getCurrentLevelProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Challenge Bar */}
        <Card className="bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Daily Challenge</p>
                  <p className="text-sm opacity-90">Create {userStats.dailyTarget} posts to earn 50 XP</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-lg font-bold">{userStats.dailyProgress}/{userStats.dailyTarget}</div>
                  <div className="text-xs opacity-75">Posts today</div>
                </div>
                <Award className="w-8 h-8 opacity-75" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Selector */}
        <Card className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Select Platforms</h3>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {selectedPlatforms.length} selected
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {Object.entries(PLATFORM_ICONS).map(([platform, icon]) => (
                <Button
                  key={platform}
                  variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200
                    ${selectedPlatforms.includes(platform) 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 border-0" 
                      : "bg-white/80 hover:bg-white text-gray-700 border-gray-200"
                    }
                  `}
                  onClick={() => togglePlatform(platform)}
                >
                  {icon}
                  <span className="capitalize font-medium">{platform}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tone Selector */}
        <Card className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Tone</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {TONE_OPTIONS.map((tone) => (
                <Button
                  key={tone.id}
                  variant={selectedTone === tone.id ? "default" : "outline"}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 text-sm
                    ${selectedTone === tone.id 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 border-0" 
                      : "bg-white/80 hover:bg-white text-gray-700 border-gray-200"
                    }
                  `}
                  onClick={() => setSelectedTone(tone.id)}
                >
                  <span className="text-sm">{tone.icon}</span>
                  <span className="font-medium truncate">{tone.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Card className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="p-6">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between text-gray-700 hover:bg-white/50"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Advanced Options</span>
              </div>
              {showAdvancedOptions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
            
            {showAdvancedOptions && (
              <div className="mt-4 space-y-6">
                {/* Format Options */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Content Format</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {FORMAT_OPTIONS.map((format) => (
                      <Button
                        key={format.id}
                        variant={selectedFormat === format.id ? "default" : "outline"}
                        className={`
                          flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                          ${selectedFormat === format.id 
                            ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg shadow-green-500/25 border-0" 
                            : "bg-white/80 hover:bg-white text-gray-700 border-gray-200"
                          }
                        `}
                        onClick={() => setSelectedFormat(format.id)}
                      >
                        <span className="text-sm">{format.icon}</span>
                        <span className="font-medium truncate">{format.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Niche Selection */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Content Niche</h4>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {NICHE_OPTIONS.map((niche) => (
                      <Button
                        key={niche.id}
                        variant={selectedNiche === niche.id ? "default" : "outline"}
                        className={`
                          flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                          ${selectedNiche === niche.id 
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 border-0" 
                            : "bg-white/80 hover:bg-white text-gray-700 border-gray-200"
                          }
                        `}
                        onClick={() => setSelectedNiche(niche.id)}
                      >
                        <span className="text-sm">{niche.icon}</span>
                        <span className="font-medium truncate">{niche.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Emoji Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700">Include Emojis</h4>
                    <p className="text-xs text-gray-500">Toggle emoji usage in generated content</p>
                  </div>
                  <Switch
                    checked={includeEmojis}
                    onCheckedChange={setIncludeEmojis}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>

                {/* Emoji Pack Selection */}
                {includeEmojis && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Emoji Style</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {EMOJI_PACKS.map((pack) => (
                        <Button
                          key={pack.id}
                          variant={selectedEmojiPack === pack.id ? "default" : "outline"}
                          className={`
                            flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                            ${selectedEmojiPack === pack.id 
                              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25 border-0" 
                              : "bg-white/80 hover:bg-white text-gray-700 border-gray-200"
                            }
                          `}
                          onClick={() => setSelectedEmojiPack(pack.id)}
                        >
                          <span className="text-sm">{pack.icon}</span>
                          <span className="font-medium truncate">{pack.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Length Selection */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Content Length</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {LENGTH_OPTIONS.map((length) => (
                      <Button
                        key={length.id}
                        variant={selectedLength === length.id ? "default" : "outline"}
                        className={`
                          flex flex-col items-center space-y-1 px-3 py-3 rounded-lg transition-all duration-200 text-sm h-auto
                          ${selectedLength === length.id 
                            ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/25 border-0" 
                            : "bg-white/80 hover:bg-white text-gray-700 border-gray-200"
                          }
                        `}
                        onClick={() => setSelectedLength(length.id)}
                      >
                        <span className="text-lg">{length.icon}</span>
                        <span className="font-medium">{length.label}</span>
                        <span className="text-xs opacity-75 text-center">{length.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Content Quality Controls */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Content Quality</h4>
                    <Button
                      onClick={() => setShowContentQuality(!showContentQuality)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {showContentQuality ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  {showContentQuality && (
                    <div className="space-y-4 pl-3 border-l-2 border-blue-100">
                      {/* Content Style */}
                      <div>
                        <h5 className="text-xs font-semibold text-gray-600 mb-2">Content Style</h5>
                        <div className="grid grid-cols-1 gap-2">
                          {CONTENT_STYLE_OPTIONS.map(option => (
                            <Button
                              key={option.id}
                              variant={contentStyle === option.id ? "default" : "outline"}
                              className={`
                                flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-all duration-200 text-sm h-auto
                                ${contentStyle === option.id
                                  ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg shadow-green-500/25 border-0"
                                  : "bg-white/80 hover:bg-white text-gray-700 border-gray-200"
                                }
                              `}
                              onClick={() => setContentStyle(option.id)}
                            >
                              <span className="text-sm">{option.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs opacity-75">{option.description}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Emotional Tone */}
                      <div>
                        <h5 className="text-xs font-semibold text-gray-600 mb-2">Emotional Tone</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {EMOTIONAL_TONE_OPTIONS.map(option => (
                            <Button
                              key={option.id}
                              variant={emotionalTone === option.id ? "default" : "outline"}
                              className={`
                                flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-center transition-all duration-200 text-sm h-auto
                                ${emotionalTone === option.id
                                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 border-0"
                                  : "bg-white/80 hover:bg-white text-gray-700 border-gray-200"
                                }
                              `}
                              onClick={() => setEmotionalTone(option.id)}
                            >
                              <span className="text-sm">{option.icon}</span>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs opacity-75">{option.description}</div>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Structure Preference */}
                      <div>
                        <h5 className="text-xs font-semibold text-gray-600 mb-2">Content Structure</h5>
                        <div className="grid grid-cols-1 gap-2">
                          {STRUCTURE_OPTIONS.map(option => (
                            <Button
                              key={option.id}
                              variant={structurePreference === option.id ? "default" : "outline"}
                              className={`
                                flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-all duration-200 text-sm h-auto
                                ${structurePreference === option.id
                                  ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/25 border-0"
                                  : "bg-white/80 hover:bg-white text-gray-700 border-gray-200"
                                }
                              `}
                              onClick={() => setStructurePreference(option.id)}
                            >
                              <span className="text-sm">{option.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs opacity-75">{option.description}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Panel */}
        <Card className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="p-6">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between text-gray-700 hover:bg-white/50"
              onClick={() => setShowHelp(!showHelp)}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Need help? Try these prompts</span>
              </div>
              {showHelp ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
            
            {showHelp && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left justify-start bg-white/80 hover:bg-white text-gray-700 border-gray-200"
                      onClick={() => handleQuickPrompt(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
                
                {/* Enhancement Settings */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Enhancement Suggestions</span>
                    </div>
                    <Button
                      onClick={resetSuggestions}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-white/80 hover:bg-white text-gray-600 border-gray-200"
                    >
                      {suggestionsDismissed ? "Enable" : "Reset"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {suggestionsDismissed 
                      ? "Enhancement suggestions are disabled. Click 'Enable' to show them again."
                      : "Enhancement suggestions will appear for vague inputs. Click 'Reset' to clear preferences."
                    }
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardContent className="p-4 md:p-6">
            <div className="h-80 md:h-96 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
              {messages.map((message) => renderMessage(message))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <form onSubmit={handleSubmit} className="flex space-x-2 md:space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Write your post idea..."
                  className="pr-12 py-3 text-base bg-white/80 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                  disabled={isTyping}
                />
                <Zap className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              
              {/* Enhancement Trigger Button */}
              {input.trim() && (
                <Button
                  type="button"
                  onClick={() => {
                    const suggestions = analyzeVagueInput(input);
                    if (suggestions.length > 0) {
                      setPromptSuggestions(suggestions);
                      setShowPromptAssistant(true);
                    } else {
                      // For detailed inputs, show general enhancement options
                      setPromptSuggestions([
                        "Add specific details",
                        "Include personal emotions", 
                        "Focus on unique moments"
                      ]);
                      setShowPromptAssistant(true);
                    }
                  }}
                  disabled={isTyping}
                  className="px-3 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-yellow-500/25 min-h-[48px]"
                  title="Enhance your input with AI suggestions"
                >
                  <Lightbulb className="w-5 h-5" />
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="px-4 md:px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/25 min-h-[48px]"
              >
                <SendHorizontal className="w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Prompt Assistant Popup */}
        {showPromptAssistant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Let's make this more specific!</h3>
                </div>
                <Button
                  onClick={() => {
                    setShowPromptAssistant(false);
                    setSuggestionsDismissed(true);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Your input could be more detailed. Here are some suggestions to enhance it:
              </p>
              <div className="space-y-2 mb-4">
                {promptSuggestions.map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => enhanceInputWithSuggestion(input, suggestion)}
                    disabled={processingEnhancement}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-2">
                      {processingEnhancement ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-purple-500" />
                      )}
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowPromptAssistant(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={processingEnhancement}
                >
                  Continue anyway
                </Button>
                <Button
                  onClick={dismissSuggestions}
                  variant="outline"
                  className="text-xs"
                  disabled={processingEnhancement}
                >
                  Don't show again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Smart Editing Popup */}
        {editingText && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-2 mb-4">
                <Edit3 className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Edit Selected Text</h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 font-medium">Selected text:</p>
                <p className="text-sm text-gray-600 mt-1">"{editingText.selectedText}"</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  onClick={() => handleSmartEdit(editingText.messageId, editingText.platform, editingText.selectedText, 'concise')}
                  variant="outline"
                  className="text-sm"
                >
                  Make concise
                </Button>
                <Button
                  onClick={() => handleSmartEdit(editingText.messageId, editingText.platform, editingText.selectedText, 'poetic')}
                  variant="outline"
                  className="text-sm"
                >
                  Make poetic
                </Button>
                <Button
                  onClick={() => handleSmartEdit(editingText.messageId, editingText.platform, editingText.selectedText, 'humorous')}
                  variant="outline"
                  className="text-sm"
                >
                  Add humor
                </Button>
                <Button
                  onClick={() => handleSmartEdit(editingText.messageId, editingText.platform, editingText.selectedText, 'professional')}
                  variant="outline"
                  className="text-sm"
                >
                  Professional
                </Button>
                <Button
                  onClick={() => handleSmartEdit(editingText.messageId, editingText.platform, editingText.selectedText, 'emotional')}
                  variant="outline"
                  className="text-sm"
                >
                  Add emotion
                </Button>
                <Button
                  onClick={() => handleSmartEdit(editingText.messageId, editingText.platform, editingText.selectedText, 'simplify')}
                  variant="outline"
                  className="text-sm"
                >
                  Simplify
                </Button>
              </div>
              <Button
                onClick={() => setEditingText(null)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}