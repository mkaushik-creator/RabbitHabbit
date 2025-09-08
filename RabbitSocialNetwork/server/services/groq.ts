import Groq from "groq-sdk";
import { OnboardingInput, ContentGenerationResponse } from "@shared/schema";
import { AIChatRequest, AIChatResponse } from "./aiChat";
import { formatPlatformPrompt } from "../utils/contentFormatters";

// Multi-key rotation system for Groq
class GroqKeyManager {
  private keys: string[] = [];
  private currentKeyIndex = 0;
  private keyStatus: Map<string, { exhausted: boolean; resetTime?: Date }> = new Map();

  constructor() {
    // Load all available Groq API keys
    const key1 = process.env.GROQ_API_KEY;
    const key2 = process.env.GROQ_API_KEY_2;
    
    if (key1) {
      this.keys.push(key1);
      this.keyStatus.set(key1, { exhausted: false });
    }
    if (key2) {
      this.keys.push(key2);
      this.keyStatus.set(key2, { exhausted: false });
    }
    
    console.log(`🔑 Groq Key Manager initialized with ${this.keys.length} keys`);
  }

  getCurrentKey(): string | null {
    if (this.keys.length === 0) return null;
    
    // Check if current key is exhausted
    const currentKey = this.keys[this.currentKeyIndex];
    const status = this.keyStatus.get(currentKey);
    
    if (status?.exhausted) {
      // Try to find a non-exhausted key
      for (let i = 0; i < this.keys.length; i++) {
        const key = this.keys[i];
        const keyStatus = this.keyStatus.get(key);
        if (!keyStatus?.exhausted) {
          this.currentKeyIndex = i;
          console.log(`🔄 Switched to Groq API key ${i + 1}`);
          return key;
        }
      }
      // All keys are exhausted
      console.log('⚠️ All Groq API keys are exhausted');
      return null;
    }
    
    return currentKey;
  }

  markKeyExhausted(key: string, resetTime?: Date): void {
    this.keyStatus.set(key, { exhausted: true, resetTime });
    console.log(`❌ Groq API key ${this.keys.indexOf(key) + 1} marked as exhausted`);
    
    // Try to switch to next available key
    this.getCurrentKey();
  }

  markKeyActive(key: string): void {
    this.keyStatus.set(key, { exhausted: false });
    console.log(`✅ Groq API key ${this.keys.indexOf(key) + 1} marked as active`);
  }

  getStatus(): { total: number; active: number; exhausted: number } {
    const active = Array.from(this.keyStatus.values()).filter(s => !s.exhausted).length;
    const exhausted = this.keys.length - active;
    return { total: this.keys.length, active, exhausted };
  }
}

// Global key manager instance
const groqKeyManager = new GroqKeyManager();

// Define emoji pack mappings
const EMOJI_PACKS = {
  mixed: ['✨', '💫', '🌟', '❤️', '💯', '🔥', '🎉', '🎊', '💝', '🌈', '🎈', '🎆', '🎇', '💖', '🌸', '🌺', '🌻', '🌷', '🌹', '🌼'],
  nature: ['🌿', '🍃', '🌱', '🌳', '🌲', '🌴', '🌵', '🌾', '🌺', '🌸', '🌼', '🌻', '🌷', '🌹', '🌈', '⭐', '🌙', '☀️', '🌤️', '🌦️'],
  minimalist: ['✨', '•', '→', '↓', '↑', '←', '⭐', '◦', '▪', '▫', '♦', '♠', '♥', '♣', '⚡', '💫', '⚪', '⚫', '🔸', '🔹'],
  vibrant: ['🎉', '🎊', '🎈', '🎆', '🎇', '🔥', '💥', '⚡', '🌟', '✨', '💫', '🎀', '🎁', '🎯', '🎪', '🎨', '🎭', '🎪', '🎡', '🎢'],
  nostalgic: ['📸', '📷', '🎞️', '📹', '📽️', '🎬', '📺', '📻', '☎️', '📱', '💾', '💿', '📼', '📀', '🎙️', '📧', '📩', '💌', '📪', '📫'],
  professional: ['💼', '👔', '📊', '📈', '📉', '💻', '⌚', '📱', '💡', '🔧', '⚙️', '🎯', '📋', '📌', '🔍', '💰', '💳', '🏆', '🥇', '🏅']
};

function getEmojiForPack(pack: string): string {
  const packEmojis = EMOJI_PACKS[pack as keyof typeof EMOJI_PACKS] || EMOJI_PACKS.mixed;
  return packEmojis[Math.floor(Math.random() * packEmojis.length)];
}

// Function to format hashtags properly
function formatHashtags(rawHashtags: string): string {
  // Split by spaces and filter out empty strings
  const hashtags = rawHashtags.split(/\s+/).filter(tag => tag.trim());
  
  const formattedHashtags = hashtags.map(tag => {
    // Remove existing # if present
    let cleanTag = tag.replace(/^#+/, '');
    
    // If the tag is extremely long (over 25 characters), truncate it
    if (cleanTag.length > 25) {
      // Try to find a good breaking point
      const words = cleanTag.split(/(?=[A-Z])/);
      if (words.length > 1) {
        cleanTag = words.slice(0, 2).join('');
      } else {
        cleanTag = cleanTag.substring(0, 25);
      }
    }
    
    // Remove any non-alphanumeric characters except for common ones
    cleanTag = cleanTag.replace(/[^a-zA-Z0-9]/g, '');
    
    // Ensure it doesn't start with a number
    if (/^\d/.test(cleanTag)) {
      cleanTag = 'tag' + cleanTag;
    }
    
    // Add # back
    return '#' + cleanTag;
  }).filter(tag => tag.length > 1 && tag.length <= 30); // Filter out invalid tags
  
  // Limit to 5 hashtags maximum
  return formattedHashtags.slice(0, 5).join(' ');
}

// Function to generate intelligent hashtag suggestions
function generateIntelligentHashtags(content: string, platform: string, tone: string, niche: string): string {
  const baseHashtags = {
    instagram: ['#OceanConservation', '#SaveOurSeas', '#MarineLife'],
    linkedin: ['#SustainableBusiness', '#EnvironmentalLeadership', '#ClimateAction'],
    twitter: ['#OceanPollution', '#PlasticFree', '#MarineEcosystem'],
    x: ['#OceanPollution', '#PlasticFree', '#MarineEcosystem'],
    tiktok: ['#SaveTheOcean', '#EcoTok', '#MarineLife'],
    youtube: ['#OceanDocumentary', '#MarineConservation', '#PlasticPollution'],
    facebook: ['#OceanAwareness', '#MarineProtection', '#EnvironmentalAction']
  };

  const toneHashtags = {
    Professional: ['#BusinessInsights', '#CareerAdvice', '#Leadership'],
    Casual: ['#LifeStyle', '#Authentic', '#RealTalk'],
    Humorous: ['#Funny', '#Comedy', '#Laughs'],
    Inspirational: ['#Motivation', '#Inspiration', '#Success'],
    GenZ: ['#GenZ', '#Youth', '#Modern'],
    Educational: ['#Learning', '#Education', '#Knowledge'],
    Storytelling: ['#Stories', '#Narrative', '#Experience'],
    Bold: ['#Bold', '#Confidence', '#Fearless'],
    Authentic: ['#Authentic', '#RealLife', '#Honest'],
    Persuasive: ['#Influence', '#Impact', '#Results']
  };

  // Platform-specific hashtag variants to reduce redundancy
  const platformHashtagVariants = {
    instagram: {
      ocean: ['#OceanConservation', '#MarineLife', '#SaveOurSeas'],
      environment: ['#EcoWarrior', '#PlasticFree', '#GreenLiving'],
      action: ['#TakeAction', '#ProtectOurPlanet', '#OceanProtection']
    },
    linkedin: {
      business: ['#SustainableBusiness', '#EnvironmentalLeadership', '#GreenBusiness'],
      professional: ['#CorporateResponsibility', '#ESGStrategy', '#SustainableInnovation'],
      leadership: ['#ClimateLeadership', '#SustainableLeadership', '#EnvironmentalStrategy']
    },
    tiktok: {
      trending: ['#SaveTheOcean', '#EcoTok', '#MarineLife'],
      viral: ['#OceanVibes', '#PlasticFree', '#EcoWarrior'],
      action: ['#OceanAction', '#MarineProtection', '#EcoChallenge']
    },
    x: {
      urgent: ['#OceanCrisis', '#PlasticPollution', '#MarineEcosystem'],
      awareness: ['#OceanFacts', '#MarineConservation', '#EcoAlert'],
      action: ['#ActNow', '#SaveOurOceans', '#MarineProtection']
    },
    youtube: {
      documentary: ['#OceanDocumentary', '#MarineConservation', '#PlasticPollution'],
      educational: ['#OceanEducation', '#MarineScience', '#ConservationStory'],
      awareness: ['#OceanAwareness', '#MarineEcosystem', '#EnvironmentalImpact']
    },
    facebook: {
      community: ['#OceanCommunity', '#MarineProtection', '#EnvironmentalAction'],
      discussion: ['#OceanDiscussion', '#MarineAwareness', '#EcoSupport'],
      sharing: ['#OceanStories', '#MarineConservation', '#EnvironmentalSharing']
    }
  };

  const nicheHashtags = {
    travel: ['#TravelVibes', '#CityReflections', '#Journey'],
    food: ['#FoodCulture', '#Taste', '#Culinary'],
    tech: ['#TechLife', '#Innovation', '#Digital'],
    fitness: ['#FitnessJourney', '#Wellness', '#Health'],
    lifestyle: ['#LifestyleContent', '#PersonalGrowth', '#Mindfulness'],
    business: ['#BusinessGrowth', '#Entrepreneurship', '#Strategy'],
    creative: ['#CreativeProcess', '#Art', '#Design'],
    writer: ['#WritingLife', '#Literature', '#Storytelling']
  };

  // Content-based hashtag detection
  const contentHashtags = [];
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('ocean') || lowerContent.includes('sea') || lowerContent.includes('marine')) {
    contentHashtags.push('#OceanConservation', '#MarineLife', '#SaveOurSeas');
  }
  if (lowerContent.includes('pollution') || lowerContent.includes('plastic') || lowerContent.includes('waste')) {
    contentHashtags.push('#PlasticPollution', '#ZeroWaste', '#PollutionFree');
  }
  if (lowerContent.includes('coral') || lowerContent.includes('reef') || lowerContent.includes('ecosystem')) {
    contentHashtags.push('#CoralReef', '#MarineEcosystem', '#OceanHealth');
  }
  if (lowerContent.includes('climate') || lowerContent.includes('environment') || lowerContent.includes('sustainability')) {
    contentHashtags.push('#ClimateAction', '#Sustainability', '#EcoFriendly');
  }
  if (lowerContent.includes('beach') || lowerContent.includes('shore') || lowerContent.includes('coastline')) {
    contentHashtags.push('#BeachCleanup', '#CoastalProtection', '#OceanShores');
  }
  if (lowerContent.includes('future') || lowerContent.includes('generation') || lowerContent.includes('legacy')) {
    contentHashtags.push('#FutureGenerations', '#PlanetaryHealth', '#SustainableFuture');
  }
  if (lowerContent.includes('action') || lowerContent.includes('change') || lowerContent.includes('impact')) {
    contentHashtags.push('#TakeAction', '#ChangeTheWorld', '#PositiveImpact');
  }
  if (lowerContent.includes('shopping') || lowerContent.includes('retail')) {
    contentHashtags.push('#RetailTherapy', '#Shopping', '#SelfCare');
  }
  if (lowerContent.includes('creative') || lowerContent.includes('art') || lowerContent.includes('design')) {
    contentHashtags.push('#CreativeProcess', '#ArtisticJourney', '#DesignThinking');
  }
  if (lowerContent.includes('journey') || lowerContent.includes('experience')) {
    contentHashtags.push('#Journey', '#Experience', '#Growth');
  }

  // Combine hashtags intelligently with platform-specific variants
  const platformVariants = platformHashtagVariants[platform as keyof typeof platformHashtagVariants];
  const variantHashtags = platformVariants ? Object.values(platformVariants).flat() : [];
  
  // Randomly select from platform variants to avoid repetition
  const randomPlatformTags = variantHashtags.length > 0 
    ? variantHashtags.sort(() => 0.5 - Math.random()).slice(0, 2)
    : (baseHashtags[platform as keyof typeof baseHashtags] || ['#Content']).slice(0, 1);
  
  const selectedHashtags = [
    ...randomPlatformTags,
    ...(toneHashtags[tone as keyof typeof toneHashtags] || ['#Content']).slice(0, 1),
    ...(nicheHashtags[niche as keyof typeof nicheHashtags] || []).slice(0, 1),
    ...contentHashtags.slice(0, 2)
  ];

  // Remove duplicates and format
  const uniqueHashtags = [...new Set(selectedHashtags)];
  return uniqueHashtags.slice(0, 5).join(' ');
}

// Function to generate image prompts based on content themes
function generateImagePrompt(content: string, platform: string, originalQuery: string): string {
  const lowerContent = content.toLowerCase();
  const lowerQuery = originalQuery.toLowerCase();
  
  // Theme detection for image generation
  let imageTheme = '';
  let style = '';
  
  if (lowerContent.includes('ocean') || lowerContent.includes('sea') || lowerContent.includes('water')) {
    imageTheme = 'ocean conservation scene with marine life';
    style = 'environmental documentary style';
  } else if (lowerContent.includes('shopping') || lowerContent.includes('retail') || lowerContent.includes('store')) {
    imageTheme = 'modern retail shopping experience';
    style = 'lifestyle photography';
  } else if (lowerContent.includes('creative') || lowerContent.includes('art') || lowerContent.includes('design')) {
    imageTheme = 'creative workspace with artistic elements';
    style = 'artistic and inspiring';
  } else if (lowerContent.includes('business') || lowerContent.includes('work') || lowerContent.includes('professional')) {
    imageTheme = 'professional business environment';
    style = 'clean corporate photography';
  } else if (lowerContent.includes('nature') || lowerContent.includes('outdoor') || lowerContent.includes('landscape')) {
    imageTheme = 'natural landscape scene';
    style = 'nature photography';
  } else if (lowerContent.includes('food') || lowerContent.includes('cooking') || lowerContent.includes('restaurant')) {
    imageTheme = 'culinary scene with food presentation';
    style = 'food photography';
  } else if (lowerContent.includes('travel') || lowerContent.includes('journey') || lowerContent.includes('adventure')) {
    imageTheme = 'travel and adventure scene';
    style = 'travel photography';
  } else if (lowerContent.includes('technology') || lowerContent.includes('tech') || lowerContent.includes('digital')) {
    imageTheme = 'modern technology setup';
    style = 'tech photography';
  } else if (lowerContent.includes('fitness') || lowerContent.includes('health') || lowerContent.includes('workout')) {
    imageTheme = 'fitness and wellness scene';
    style = 'health and fitness photography';
  } else {
    // Default based on emotional tone
    if (lowerContent.includes('emotion') || lowerContent.includes('feel') || lowerContent.includes('heart')) {
      imageTheme = 'emotionally engaging human moment';
      style = 'authentic lifestyle photography';
    } else {
      imageTheme = 'modern lifestyle scene';
      style = 'contemporary social media photography';
    }
  }
  
  // Platform-specific style adjustments
  switch (platform.toLowerCase()) {
    case 'instagram':
      return `Create a visually striking ${imageTheme} in ${style} optimized for Instagram square format with warm, engaging lighting`;
    case 'linkedin':
      return `Professional ${imageTheme} in ${style} suitable for LinkedIn with business-appropriate composition and clean aesthetic`;
    case 'twitter':
    case 'x':
      return `Attention-grabbing ${imageTheme} in ${style} optimized for Twitter with bold, shareable visual elements`;
    case 'tiktok':
      return `Dynamic, vertical ${imageTheme} in ${style} perfect for TikTok with vibrant colors and engaging composition`;
    case 'youtube':
      return `Cinematic ${imageTheme} in ${style} suitable for YouTube thumbnail with compelling visual storytelling`;
    case 'facebook':
      return `Community-friendly ${imageTheme} in ${style} optimized for Facebook with relatable, authentic feel`;
    default:
      return `Engaging ${imageTheme} in ${style} with social media optimized composition and lighting`;
  }
}

// Note: Groq client is now created dynamically using the key manager for rotation

// Available Groq models (all free)
const GROQ_MODELS = {
  fast: "llama-3.1-8b-instant", // Fastest, good for quick responses
  balanced: "llama-3.3-70b-versatile", // Best balance of speed and quality
  creative: "mixtral-8x7b-32768", // Good for creative tasks
} as const;

export async function generateMultiPlatformContent(
  preferences: OnboardingInput
): Promise<ContentGenerationResponse> {
  console.log('🚀 Generating multi-platform content with Groq...');
  
  const response: ContentGenerationResponse = {};
  
  try {
    // Generate content for each platform in parallel
    const contentPromises = preferences.platforms.map(async (platform) => {
      const platformPrompt = formatPlatformPrompt(platform);
      
      const prompt = `Create engaging ${preferences.contentType} content for ${platform}:

Audience: ${preferences.audience}
Tone: ${preferences.tone}
Platform: ${platformPrompt}
Keywords: ${preferences.keywords || 'trending'}

Requirements:
- Write compelling, platform-optimized content
- Include relevant hashtags (3-5 hashtags)
- Keep it concise and engaging
- Match the specified tone and audience

Format your response as:
Content: [your main content here]
Hashtags: [hashtags separated by spaces]`;

      try {
        console.log(`🚀 Generating content for ${platform}...`);
        
        // Get current API key from key manager
        const currentApiKey = groqKeyManager.getCurrentKey();
        if (!currentApiKey) {
          throw new Error('No available Groq API keys');
        }

        // Create Groq client with current key
        const groq = new Groq({
          apiKey: currentApiKey,
        });

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are an expert social media content creator. Create engaging, platform-specific content that resonates with the target audience."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: GROQ_MODELS.balanced,
          temperature: 0.7,
          max_tokens: 500,
        });

        const content = chatCompletion.choices[0]?.message?.content || "";
        console.log(`✅ ${platform} content generated:`, content.substring(0, 100) + '...');

        // Parse content and hashtags
        const contentMatch = content.match(/Content:\s*(.*?)(?=\nHashtags:|$)/s);
        const hashtagMatch = content.match(/Hashtags:\s*(.*)/);
        
        const cleanContent = contentMatch ? contentMatch[1].trim() : content.split('\n')[0] || content;
        const hashtags = hashtagMatch ? hashtagMatch[1].trim() : '#social #content #creator';

        response[platform] = {
          content: cleanContent,
          hashtags: hashtags,
        };

        // Generate image prompt if requested
        if (preferences.includeImage) {
          response[platform].imagePrompt = `Create an engaging image for ${platform} about ${preferences.contentType} content, tone: ${preferences.tone}`;
        }

      } catch (error) {
        console.error(`Error generating content for ${platform}:`, error);
        // Fallback content for this platform
        response[platform] = {
          content: `Exciting ${preferences.contentType} content coming soon! Stay tuned for amazing updates.`,
          hashtags: '#social #content #creator'
        };
      }
    });

    await Promise.all(contentPromises);
    console.log('✅ All platform content generated successfully');

  } catch (error) {
    console.error('Error in Groq multi-platform generation:', error);
    throw new Error('Failed to generate content with Groq');
  }

  return response;
}

export async function generateChatResponse(
  request: AIChatRequest
): Promise<AIChatResponse> {
  console.log('🚀 Generating chat response with Groq...');
  console.log('🔧 GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
  console.log('🔧 GROQ_API_KEY length:', process.env.GROQ_API_KEY?.length || 0);

  try {
    // Get customization options from request with new enhanced parameters
    const selectedTone = request.tone || 'Casual';
    const selectedFormat = request.format || 'paragraph';
    const selectedNiche = request.niche || 'general';
    const includeEmojis = request.includeEmojis !== false;
    const emojiPack = request.emojiPack || 'mixed';
    const contentLength = request.length || 'medium';
    const contentStyle = request.contentStyle || 'story';
    const emotionalTone = request.emotionalTone || 'emotional';
    const structurePreference = request.structurePreference || 'short-sentences';
    
    // Define vivid, authentic tone-specific writing styles
    const toneInstructions = {
      'Professional': 'Write with polished expertise and industry authority. Use precise, confident language that demonstrates deep knowledge. Paint clear pictures of business scenarios and outcomes. Speak from experience, not theory.',
      'Casual': 'Write like you are sharing a genuine moment with a close friend. Use warm, personal language with vivid details that make scenes come alive. Capture real emotions and relatable experiences.',
      'Humorous': 'Create moments of genuine laughter through unexpected observations, clever wordplay, or amusing real-life situations. Show the funny side through specific, memorable details rather than generic jokes.',
      'GenZ': 'Write with authentic youth energy using current slang naturally. Capture the raw honesty and visual thinking of young voices. Reference real cultural moments and feelings, not forced trends.',
      'Inspirational': 'Share transformative moments and breakthroughs that stir deep emotions. Use powerful sensory details to show change happening. Speak to the heart with authentic victories and growth.',
      'Educational': 'Reveal knowledge through vivid examples and memorable scenarios. Paint clear pictures of before-and-after understanding. Share wisdom like a trusted mentor revealing life-changing insights.',
      'Storytelling': 'Craft immersive narratives with rich sensory details, emotional texture, and meaningful moments. Take readers on a journey they can see, feel, and experience alongside you.',
      'Bold': 'Command attention with fearless conviction and striking imagery. Use powerful language that cuts through noise. Make bold declarations backed by vivid proof and undeniable truth.',
      'Authentic': 'Share raw, honest moments with vulnerable details that reveal genuine humanity. Speak from the heart with real emotions, imperfections, and truth that others recognize in themselves.',
      'Persuasive': 'Build compelling cases through vivid examples and emotional proof. Show transformation and results in ways that make others feel the possibility. Use authentic stories to demonstrate value.'
    };
    
    const toneStyle = toneInstructions[selectedTone] || toneInstructions['Casual'];
    
    // Define format-specific instructions
    const formatInstructions = {
      'paragraph': 'Write in flowing, natural paragraph format with seamless transitions',
      'poetic': 'Create rhythmic, artistic prose with meaningful line breaks and evocative imagery',
      'bullet': 'Structure content with clear bullet points while maintaining natural flow',
      'concise': 'Craft brief, punchy content that delivers maximum impact in minimal words',
      'story': 'Develop a complete narrative arc with beginning, middle, and satisfying conclusion'
    };

    // Define niche-specific context
    const nicheContext = {
      'general': 'broad audience appeal',
      'writer': 'literary community with appreciation for craft and storytelling',
      'tech': 'technology enthusiasts who value innovation and technical insights',
      'food': 'culinary community passionate about flavors, recipes, and food culture',
      'travel': 'adventure seekers and culture enthusiasts',
      'fitness': 'health-conscious individuals focused on wellness and physical achievement',
      'lifestyle': 'individuals interested in personal development and modern living',
      'business': 'professionals and entrepreneurs focused on growth and success',
      'creative': 'artists, designers, and creative professionals'
    };

    const formatStyle = formatInstructions[selectedFormat] || formatInstructions['paragraph'];
    const nicheStyle = nicheContext[selectedNiche] || nicheContext['general'];

    // Define word count targets based on length
    const lengthTargets = {
      'short': '~50 words - Quick hooks & snappy content',
      'medium': '~100 words - Balanced storytelling',
      'long': '~200 words - Detailed reflections'
    };

    const wordTarget = lengthTargets[contentLength] || lengthTargets['medium'];

    const systemPrompt = `You are a masterful social media storyteller who creates vivid, authentic content with a distinct ${selectedTone.toLowerCase()} voice.

TONE MASTERY: ${toneStyle}

FORMAT STYLE: ${formatStyle}

NICHE FOCUS: Create content that resonates with ${nicheStyle}

CONTENT LENGTH TARGET: ${wordTarget}

ENHANCED STORYTELLING RULES:
- SMOOTH TRANSITIONS: Create natural, gradual flows between thoughts and emotions. Use transitional phrases like "As I stood there, my mind shifted from..." or "The moment transformed when..."
- DEEP PERSONAL REFLECTION: Add introspective questions that feel authentic and relatable: "What treasures will I uncover today? Will I find something that truly speaks to my evolving sense of self?"
- EMOTIONAL CONTRAST: Show internal conflict and moments of hesitation: "The fear of overspending contrasts with the joy of self-care, creating a balance of nerves and excitement"
- AUTHENTIC VULNERABILITY: Include genuine moments of uncertainty, growth, and self-discovery that readers can relate to personally
- GRADUAL EMOTIONAL JOURNEY: Build emotional intensity progressively, don't jump between feelings abruptly
- MEANINGFUL TRANSITIONS: Connect present moments to future possibilities naturally, showing internal transformation

PLATFORM-SPECIFIC GUIDELINES:
- INSTAGRAM: Create concise, impactful captions with quick hooks for engagement. Focus on visual storytelling and relatable moments
- LINKEDIN: Shift focus to personal growth and self-reflection in professional context: "A shopping trip isn't just about buying things; it's a chance to recharge and refocus, setting the tone for a successful week ahead"
- TWITTER/X: Keep punchy and shareable while maintaining depth. Use thread-worthy insights with emotional resonance
- TIKTOK: Create micro-content that's quick and punchy: "Retail therapy is my escape; discovering treasures while discovering myself"

CONTENT EXCELLENCE RULES:
- Write with vivid, sensory details that paint clear pictures in readers' minds
- Use original, authentic language - avoid cliché phrases and social media buzzwords
- ${includeEmojis ? `Use maximum 2 emojis from the ${emojiPack} theme, only if they truly enhance the message` : 'Do NOT use any emojis in the content'}
- Target ${contentLength === 'short' ? '~50 words for snappy hooks' : contentLength === 'long' ? '~200 words for detailed storytelling' : '~100 words for balanced content'}
- Show real moments and feelings rather than telling generic advice
- End with a satisfying reflection, insight, or invitation to savor the moment
- Adapt your voice completely to match the ${selectedTone.toLowerCase()} tone in every word choice
- Create unique openings - avoid repetitive sentence starters across platforms

BANNED ELEMENTS:
- Generic phrases like "Let's dive in", "Here's the thing", "At the end of the day"
- ${includeEmojis ? 'Excessive emoji use or scattered emoji placement' : 'Any emoji usage'}
- Stock social media language and buzzwords
- Rambling or overly long content
- Weak, forgettable endings
- Repetitive opening sentences across different platforms

Your mission: Transform "${request.userQuery}" into compelling ${selectedTone.toLowerCase()} content in ${selectedFormat} format for ${nicheStyle} that feels authentic, original, and emotionally resonant for each platform.`;
    
    // Debug: Log the raw request to understand the structure
    console.log('🔍 Raw request received:', JSON.stringify(request, null, 2));
    
    // Build conversation context with enhanced validation
    const messages = [
      { role: "system" as const, content: systemPrompt }
    ];
    
    // Handle the user query properly - create a direct user message
    if (request.userQuery && request.userQuery.trim()) {
      messages.push({
        role: "user" as const,
        content: request.userQuery.trim()
      });
    }
    
    // Add conversation history if available and valid - handle frontend message format
    if (Array.isArray(request.messages)) {
      request.messages.forEach((msg: any, index) => {
        console.log(`🔍 Processing message ${index}:`, msg);
        
        // Handle both frontend format (type/text) and backend format (role/content)
        let role = msg.role || (msg.type === 'user' ? 'user' : msg.type === 'ai' ? 'assistant' : 'user');
        let content = msg.content || msg.text || '';
        
        if (msg && 
            typeof msg === 'object' && 
            role && 
            typeof role === 'string' && 
            content && 
            typeof content === 'string' &&
            ['user', 'assistant', 'system'].includes(role)) {
          messages.push({
            role: role as "user" | "assistant" | "system",
            content: content.trim()
          });
        } else {
          console.warn(`⚠️ Skipping invalid message at index ${index}:`, msg);
        }
      });
    }
    
    console.log('🔍 Final Groq messages being sent:', JSON.stringify(messages, null, 2));

    // Get current API key from key manager
    const currentApiKey = groqKeyManager.getCurrentKey();
    if (!currentApiKey) {
      throw new Error('No available Groq API keys');
    }

    // Create Groq client with current key
    const groq = new Groq({
      apiKey: currentApiKey,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: GROQ_MODELS.balanced,
      temperature: 0.8,
      max_tokens: 800,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I'm here to help you create amazing social media content!";
    console.log('✅ Groq chat response generated:', aiResponse.substring(0, 200) + '...');
    console.log('📊 Groq response stats:', {
      length: aiResponse.length,
      model: GROQ_MODELS.balanced,
      platforms: request.platforms.length
    });

    // Generate platform-specific suggestions with enhanced prompts and retry logic
    const contentPromises = request.platforms.map(async (platform) => {
      try {
        // Get tone from request
        const selectedTone = request.tone || 'Casual';
        
        // Get emoji suggestions for the pack with platform-specific variations
        const platformEmojiVariants = {
          'instagram': ['✨', '🌟', '💫', '🎉', '💝'],
          'linkedin': ['💡', '🎯', '📊', '🔥', '💼'],
          'facebook': ['❤️', '🌈', '🎈', '💖', '🌸'],
          'tiktok': ['🔥', '💥', '⚡', '🌟', '🎊'],
          'x': ['💭', '🚀', '💡', '⚡', '🔥'],
          'youtube': ['🎬', '🎥', '📺', '🎪', '🎭']
        };
        
        const platformEmojis = platformEmojiVariants[platform.toLowerCase() as keyof typeof platformEmojiVariants] || 
                               EMOJI_PACKS[emojiPack as keyof typeof EMOJI_PACKS]?.slice(0, 5) || 
                               ['✨', '🌟', '💫', '🎉', '🔥'];
        
        const emojiSuggestions = includeEmojis 
          ? `Use platform-specific emojis: ${platformEmojis.join(' ')} (maximum 2 emojis that enhance the message)`
          : 'Do not use any emojis';
        
        // Platform-specific unique CTA variations to avoid repetition
        const platformCTAVariants = {
          'instagram': [
            'What inspires you most in moments like these?',
            'How do you find meaning in everyday experiences?',
            'What discoveries have shaped your perspective?',
            'How do you embrace creativity in your daily life?'
          ],
          'linkedin': [
            'How do you approach similar challenges in your work?',
            'What strategies have worked best for you?',
            'How has this shaped your professional journey?',
            'What lessons have you learned from similar experiences?'
          ],
          'facebook': [
            'What are your thoughts on this?',
            'How do you handle situations like this?',
            'What would you do differently?',
            'Share your experience in the comments!'
          ],
          'tiktok': [
            'Drop your thoughts below!',
            'What would you do?',
            'Tag someone who needs to see this!',
            'Who else relates to this?'
          ],
          'x': [
            'What are your thoughts?',
            'Let\'s change this together 💡',
            'What would you do differently?',
            'Share your perspective!'
          ],
          'youtube': [
            'What\'s your take on this story?',
            'How would you have handled this?',
            'What similar experiences have you had?',
            'Let me know your thoughts in the comments!'
          ]
        };
        
        // Create platform-specific prompts with enhanced content structure
        let platformStyle = "";
        let maxTokens = 300;
        let uniquePhrasingVariants = {
          'instagram': ['What creative gems will I uncover today?', 'What inspiration awaits me in this moment?', 'What discoveries will spark my next chapter?'],
          'linkedin': ['Embracing creativity today, one treasure at a time', 'Finding growth in unexpected places', 'Turning moments into meaningful progress'],
          'facebook': ['Sharing this beautiful moment with you', 'Here\'s what I learned today', 'Reflecting on this experience'],
          'tiktok': ['The magic happened when...', 'Plot twist:', 'Here\'s the tea:'],
          'x': ['Today I realized...', 'Quick thought:', 'Something shifted when...'],
          'youtube': ['Let me tell you about...', 'Here\'s the full story...', 'I want to share something with you...']
        };

        // Enhanced content structure instructions based on new parameters
        const structureInstructions = {
          'short-sentences': 'Break content into 1-2 short, readable sentences per paragraph. Give breathing space between thoughts.',
          'flowing-paragraphs': 'Create flowing narrative paragraphs with smooth transitions between ideas.',
          'bullet-points': 'Structure content with clear bullet points while maintaining natural flow.'
        };

        const contentStyleInstructions = {
          'story': 'Build a clear narrative arc: problem → emotional impact → call to action/reflection. Include emotional hooks.',
          'data-driven': 'Focus on facts, statistics, and logical arguments with supporting evidence.',
          'call-to-action': 'Emphasize actionable steps and direct engagement with strong CTAs.'
        };

        const emotionalToneInstructions = {
          'emotional': 'Include emotional hooks, feelings, and personal connection to create engagement.',
          'factual': 'Focus on objective information, data, and logical reasoning without emotional language.'
        };
        
        // Enhanced platform-specific instructions with content structure improvements
        switch (platform.toLowerCase()) {
          case 'linkedin':
            platformStyle = `Professional networking audience seeks insights and workplace reflection. 
            ${structureInstructions[structurePreference]} ${contentStyleInstructions[contentStyle]} ${emotionalToneInstructions[emotionalTone]}
            Connect personal moments to professional growth and business insights. End with engaging CTA: "How do you approach similar challenges in your work?" or "What strategies have worked best for you?" Focus on professional development and industry leadership.`;
            maxTokens = 300;
            break;
          case 'instagram':
            platformStyle = `Visual storytelling platform where relatable moments shine. 
            ${structureInstructions[structurePreference]} ${contentStyleInstructions[contentStyle]} ${emotionalToneInstructions[emotionalTone]}
            Create concise, clear captions with simplified phrasing for maximum engagement. Use light emojis for inspiration. End with engaging CTA: "What inspires you most in moments like these?" or "How do you find meaning in everyday experiences?" Focus on authentic vulnerability and visual storytelling with clear, accessible language.`;
            maxTokens = 250;
            break;
          case 'twitter':
          case 'x':
            platformStyle = `Concise thought-sharing platform for quick insights. 
            ${structureInstructions[structurePreference]} ${contentStyleInstructions[contentStyle]} ${emotionalToneInstructions[emotionalTone]}
            Create simplified, clear messaging that's shareable and impactful. Be punchy, thought-provoking, and direct. End with conversation-driven questions like "What are your thoughts?" or "Let's change this together 💡". Keep punchy and accessible while maintaining emotional depth.`;
            maxTokens = 180;
            break;
          case 'tiktok':
            platformStyle = `Entertainment-first platform for ULTRA-SHORT, punchy content. 
            ${structureInstructions[structurePreference]} ${contentStyleInstructions[contentStyle]} ${emotionalToneInstructions[emotionalTone]}
            Create micro-content under 80 characters that's snappy and engaging. Use hook-worthy openings that grab attention immediately. Keep it lightning-fast for quick attention spans. Target under 40 words maximum with clear, impactful messaging.`;
            maxTokens = 120;
            break;
          case 'youtube':
            platformStyle = `Long-form content platform where stories unfold with depth and personal reflection. 
            ${structureInstructions[structurePreference]} ${contentStyleInstructions[contentStyle]} ${emotionalToneInstructions[emotionalTone]}
            Create compelling narratives that draw viewers into deeper engagement. Add introspective elements and detailed personal insights. Develop full story arc with emotional journey and meaningful conclusions.`;
            maxTokens = 400;
            break;
          case 'facebook':
            platformStyle = `Community discussion platform for authentic sharing. 
            ${structureInstructions[structurePreference]} ${contentStyleInstructions[contentStyle]} ${emotionalToneInstructions[emotionalTone]}
            Foster genuine connections through relatable stories that inspire meaningful conversation. End with conversation-starting questions that encourage community engagement and shared experiences.`;
            maxTokens = 300;
            break;
          default:
            platformStyle = `Create compelling ${selectedTone.toLowerCase()} content that resonates with authentic emotion and vivid storytelling. 
            ${structureInstructions[structurePreference]} ${contentStyleInstructions[contentStyle]} ${emotionalToneInstructions[emotionalTone]}
            Use unique phrasing to avoid repetition across platforms.`;
            maxTokens = 280;
        }
        
        const wordLimit = contentLength === 'short' ? 50 : contentLength === 'long' ? 200 : 100;
        const lengthInstruction = contentLength === 'short' ? 'Keep it snappy and hook-focused' : 
                                  contentLength === 'long' ? 'Create detailed, reflective content with depth' : 
                                  'Balance brevity with engaging storytelling';
        
        // Enhanced platform-specific content prompts with structure improvements
        let platformPrompt = "";
        switch (platform.toLowerCase()) {
          case 'instagram':
            platformPrompt = `Create a clear, engaging Instagram post about "${request.userQuery}" (STRICT ${wordLimit} word limit - ${lengthInstruction}).

CONTENT STRUCTURE REQUIREMENTS:
- ${structureInstructions[structurePreference]}
- ${contentStyleInstructions[contentStyle]}
- ${emotionalToneInstructions[emotionalTone]}

PLATFORM REQUIREMENTS:
- Start with a simplified, clear opening that's easy to understand
- Use accessible language - avoid complex or flowery phrasing
- Use light emojis for inspiration (maximum 2)
- End with a unique CTA from these options: ${platformCTAVariants['instagram'].join(' OR ')}
- Focus on visual storytelling with relatable moments
- ${emojiSuggestions}

QUALITY STANDARDS:
- Avoid overstuffing information - give breathing space between thoughts
- Include emotional hooks (concern, realization, hope) for engagement
- Create distinct wording that avoids repetition from other platforms
- Use meaningful, targeted hashtags (4-5 maximum)

Format your response as:
Content: [Clear, structured Instagram post - target ${wordLimit} words with engaging CTA]
Hashtags: [4-5 meaningful hashtags relevant to the topic]`;
            break;
          case 'linkedin':
            platformPrompt = `Create a professional LinkedIn post about "${request.userQuery}" (STRICT ${wordLimit} word limit - ${lengthInstruction}).

CONTENT STRUCTURE REQUIREMENTS:
- ${structureInstructions[structurePreference]}
- ${contentStyleInstructions[contentStyle]}
- ${emotionalToneInstructions[emotionalTone]}

PLATFORM REQUIREMENTS:
- Connect to professional growth and business insights
- Use professional tone while maintaining accessibility
- End with a unique CTA from these options: ${platformCTAVariants['linkedin'].join(' OR ')}
- Focus on professional development and industry leadership
- ${emojiSuggestions}

QUALITY STANDARDS:
- Break down complex ideas into 1-2 short, readable sentences
- Build clear narrative: problem → emotional impact → professional action
- Create distinct professional perspective that avoids repetition
- Use meaningful, targeted hashtags (4-5 maximum)

Format your response as:
Content: [Professional LinkedIn post - target ${wordLimit} words with business-focused CTA]
Hashtags: [4-5 meaningful hashtags relevant to professional growth]`;
            break;
          case 'tiktok':
            platformPrompt = `Create an ultra-short TikTok post about "${request.userQuery}" (STRICT 40 words maximum - under 80 characters).

CONTENT STRUCTURE REQUIREMENTS:
- ${structureInstructions[structurePreference]}
- ${contentStyleInstructions[contentStyle]}
- ${emotionalToneInstructions[emotionalTone]}

PLATFORM REQUIREMENTS:
- Create punchy, snappy content that's lightning-fast
- Use simplified, clear messaging for quick attention spans
- Hook-worthy opening that grabs attention immediately
- ${emojiSuggestions}

QUALITY STANDARDS:
- Ultra-short content with maximum impact
- Avoid information overstuffing - one clear message
- Create distinct TikTok voice that avoids repetition
- Use meaningful, targeted hashtags (4-5 maximum)

Format your response as:
Content: [Ultra-short TikTok post - maximum 40 words with punchy hook]
Hashtags: [4-5 meaningful hashtags relevant to the topic]`;
            break;
          case 'x':
          case 'twitter':
            platformPrompt = `Create a concise Twitter/X post about "${request.userQuery}" (CRITICAL: MUST BE UNDER 240 CHARACTERS TOTAL - ${lengthInstruction}).

CONTENT STRUCTURE REQUIREMENTS:
- ${structureInstructions[structurePreference]}
- ${contentStyleInstructions[contentStyle]}
- ${emotionalToneInstructions[emotionalTone]}

PLATFORM REQUIREMENTS:
- CRITICAL: Keep total content under 240 characters including spaces
- Use simplified, clear messaging that's shareable and impactful
- Be punchy, thought-provoking, and direct
- End with a unique CTA from these options: ${platformCTAVariants['x'].join(' OR ')}
- Keep punchy and accessible while maintaining emotional depth
- ${emojiSuggestions}

QUALITY STANDARDS:
- Break content into short, impactful sentences
- Build clear narrative with emotional engagement
- Create distinct Twitter voice that avoids repetition
- Use meaningful, targeted hashtags (4-5 maximum)
- ABSOLUTE REQUIREMENT: Final post must be under 240 characters

Format your response as:
Content: [Clear Twitter/X post - UNDER 240 CHARACTERS with action-inspiring question]
Hashtags: [4-5 meaningful hashtags relevant to the topic]`;
            break;
          default:
            platformPrompt = `Create a ${selectedTone.toLowerCase()} ${platform} post about "${request.userQuery}" (STRICT ${wordLimit} word limit - ${lengthInstruction}).

PLATFORM CONTEXT: ${platformStyle}
TONE MASTERY: ${toneStyle}
FORMAT STYLE: ${formatStyle}
NICHE FOCUS: ${nicheStyle}
EMOJI USAGE: ${emojiSuggestions}

Format your response as:
Content: [Your ${selectedTone.toLowerCase()} post - target ${wordLimit} words]
Hashtags: [3-5 meaningful hashtags relevant to ${selectedNiche} niche]`;
        }
        
        // Retry logic for failed requests
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            // Get current API key from key manager for each platform request
            const currentApiKey = groqKeyManager.getCurrentKey();
            if (!currentApiKey) {
              throw new Error('No available Groq API keys');
            }

            // Create Groq client with current key
            const groq = new Groq({
              apiKey: currentApiKey,
            });

            const contentCompletion = await groq.chat.completions.create({
              messages: [
                { 
                  role: "system", 
                  content: `You are a masterful storyteller creating clear, engaging ${platform} content. ${platformStyle} 
                  
                  CRITICAL EXCELLENCE RULES:
                  - Start with a clear, simplified opening that's easy to understand
                  - Use accessible, straightforward language - avoid overly complex phrasing
                  - INCLUDE RELEVANT QUESTIONS: Add meaningful questions that inspire action and conversation
                  - SHOW REAL IMPACT: Focus on tangible consequences and authentic experiences
                  - Use original, specific language that's clear and impactful
                  - Include relatable human moments and genuine emotions
                  - NEVER use bullet points or numbered lists - create flowing, natural prose
                  - ${emojiSuggestions}
                  - End with a clear call-to-action or conversation-starting question
                  - Adapt completely to the chosen tone's voice while maintaining clarity
                  - STRICT WORD COUNT: Must be exactly ${wordLimit} words (±5 words maximum)
                  - ${lengthInstruction}
                  - Make each platform version unique with fresh perspective and simplified messaging`
                },
                { role: "user", content: platformPrompt }
              ],
              model: GROQ_MODELS.balanced,
              temperature: 0.9,
              max_tokens: maxTokens,
            });

            const fullResponse = contentCompletion.choices[0]?.message?.content || '';
            console.log(`✅ Generated content for ${platform}:`, fullResponse.substring(0, 100) + '...');
            
            // Parse the response to extract content and hashtags
            const contentMatch = fullResponse.match(/Content:\s*(.*?)(?=\nHashtags:|$)/s);
            const hashtagMatch = fullResponse.match(/Hashtags:\s*(.*?)$/s);
            
            const content = contentMatch ? contentMatch[1].trim() : fullResponse.trim();
            let hashtags = hashtagMatch ? hashtagMatch[1].trim() : '';
            
            // If no hashtags were generated or they're poor quality, use intelligent hashtag generation
            if (!hashtags || hashtags.length < 5) {
              hashtags = generateIntelligentHashtags(content, platform, selectedTone, selectedNiche);
            } else {
              // Format hashtags to fix extremely long ones
              hashtags = formatHashtags(hashtags);
            }

            // Generate image prompt based on content themes
            const imagePrompt = generateImagePrompt(content, platform, request.userQuery);
            
            // Enforce character limits for Twitter/X
            let finalContent = content;
            if (platform.toLowerCase() === 'x' || platform.toLowerCase() === 'twitter') {
              if (finalContent.length > 240) {
                finalContent = finalContent.substring(0, 237) + '...';
              }
            }

            return {
              platform,
              content: finalContent || `Unable to generate content for ${platform}`,
              hashtags: hashtags,
              imagePrompt: imagePrompt
            };
          } catch (error: any) {
            // Handle rate limit errors with key rotation
            if (error.status === 429 || error.message?.includes('rate limit')) {
              const currentKey = groqKeyManager.getCurrentKey();
              if (currentKey) {
                // Parse reset time from error message if available
                const resetTimeMatch = error.message?.match(/try again in (\d+)m(\d+)\.(\d+)s/);
                let resetTime;
                if (resetTimeMatch) {
                  const minutes = parseInt(resetTimeMatch[1]);
                  const seconds = parseInt(resetTimeMatch[2]);
                  resetTime = new Date(Date.now() + (minutes * 60 + seconds) * 1000);
                }
                
                groqKeyManager.markKeyExhausted(currentKey, resetTime);
                
                // Try again with next available key without incrementing retry count
                const nextKey = groqKeyManager.getCurrentKey();
                if (nextKey && nextKey !== currentKey) {
                  console.log(`🔄 Switching to next Groq API key for ${platform}...`);
                  continue; // Try again with new key
                }
              }
            }
            
            retryCount++;
            console.warn(`⚠️ Retry ${retryCount}/${maxRetries} for ${platform}:`, error.message);
            
            if (retryCount > maxRetries) {
              throw error;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      } catch (error) {
        console.error(`❌ Error generating content for ${platform}:`, error);
        // Return clear error instead of mock content
        return {
          platform,
          content: `Error: Unable to generate ${platform} content. Groq API may be temporarily unavailable. Please try again.`,
          hashtags: `#${platform.toLowerCase()}`
        };
      }
    });

    const suggestedContent = await Promise.all(contentPromises);

    return {
      message: aiResponse,
      suggestedContent: suggestedContent
    };

  } catch (error: any) {
    console.error('Groq chat error:', error);
    
    // Handle rate limit errors with key rotation
    if (error.status === 429 || error.message?.includes('rate limit')) {
      const currentKey = groqKeyManager.getCurrentKey();
      if (currentKey) {
        // Parse reset time from error message if available
        const resetTimeMatch = error.message?.match(/try again in (\d+)m(\d+)\.(\d+)s/);
        let resetTime;
        if (resetTimeMatch) {
          const minutes = parseInt(resetTimeMatch[1]);
          const seconds = parseInt(resetTimeMatch[2]);
          resetTime = new Date(Date.now() + (minutes * 60 + seconds) * 1000);
        }
        
        groqKeyManager.markKeyExhausted(currentKey, resetTime);
        
        // Try again with next available key
        const nextKey = groqKeyManager.getCurrentKey();
        if (nextKey && nextKey !== currentKey) {
          console.log('🔄 Retrying with next available Groq API key...');
          return generateChatResponse(request);
        }
      }
      
      const status = groqKeyManager.getStatus();
      throw new Error(`All Groq API keys exhausted (${status.exhausted}/${status.total}). Please try again later.`);
    }
    
    throw new Error('Failed to generate chat response with Groq');
  }
}

export async function generateImage(prompt: string): Promise<string | null> {
  // Groq doesn't support image generation, but we can create detailed image prompts
  console.log('📝 Creating detailed image prompt with Groq...');
  
  try {
    // Get current API key from key manager
    const currentApiKey = groqKeyManager.getCurrentKey();
    if (!currentApiKey) {
      console.log('❌ No available Groq API keys for image prompt generation');
      return null;
    }

    // Create Groq client with current key
    const groq = new Groq({
      apiKey: currentApiKey,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert at creating detailed, vivid image prompts for AI image generators. Create descriptive prompts that will produce high-quality, engaging images."
        },
        {
          role: "user",
          content: `Create a detailed image prompt for: ${prompt}. Include artistic style, composition, lighting, and visual elements that would make this image engaging and professional.`
        }
      ],
      model: GROQ_MODELS.creative,
      temperature: 0.9,
      max_tokens: 300,
    });

    const imagePrompt = chatCompletion.choices[0]?.message?.content || prompt;
    console.log('✅ Detailed image prompt created');
    
    // Return the enhanced prompt (this would be used with image generation services)
    return imagePrompt;
  } catch (error) {
    console.error('Error creating image prompt:', error);
    return null;
  }
}

// Enhanced content generation for fallback cases
function generateEnhancedPlatformContent(
  userQuery: string,
  platform: string,
  tone: string,
  format: string,
  includeEmojis: boolean,
  emojiPack: string,
  length: string,
  contentStyle: string,
  emotionalTone: string,
  structurePreference: string
): string {
  const wordTarget = length === 'short' ? 50 : length === 'long' ? 200 : 100;
  const emoji = includeEmojis ? getEmojiForPack(emojiPack) : '';
  
  // Structure-based content generation
  const structureTemplates = {
    'short-sentences': {
      opening: 'Today something shifted.',
      development: 'I realized that moments like these matter.',
      closing: 'What moments are shaping your perspective today?'
    },
    'flowing-paragraphs': {
      opening: 'There are moments when everything seems to align perfectly, and today was one of those days.',
      development: 'As I reflected on the experience, I found myself thinking about the deeper connections we make with our surroundings and how they shape our understanding of what truly matters.',
      closing: 'How do you find meaning in the small moments that make up your day?'
    },
    'bullet-points': {
      opening: 'Three things I learned today:',
      development: '• Every experience teaches us something new\n• Small moments often hold the biggest insights\n• Our perspective shapes our reality',
      closing: 'What lessons have you discovered recently?'
    }
  };

  // Content style templates
  const styleTemplates = {
    'story': {
      arc: 'problem → emotional impact → action/reflection',
      example: 'At first, I felt overwhelmed by the choices ahead. But then I realized that uncertainty isn\'t something to fear—it\'s an invitation to grow. Now I\'m embracing the unknown with curiosity instead of anxiety.'
    },
    'data-driven': {
      arc: 'fact → analysis → insight',
      example: 'Research shows that 73% of people feel more confident after taking action on their goals. This data reveals something profound about human nature—we thrive when we move from intention to action.'
    },
    'call-to-action': {
      arc: 'problem → solution → action step',
      example: 'Many of us struggle with finding balance in our daily routines. The solution starts with small, intentional choices. What\'s one small change you could make today?'
    }
  };

  // Platform-specific adaptations
  const platformAdaptations = {
    'instagram': {
      tone: 'visually engaging with light inspiration',
      cta: 'What inspires you most in moments like these?',
      style: 'clear, accessible language with authentic vulnerability'
    },
    'x': {
      tone: 'punchy and thought-provoking',
      cta: 'What are your thoughts on this?',
      style: 'direct and shareable with emotional depth'
    },
    'linkedin': {
      tone: 'professional growth focused',
      cta: 'How do you approach similar challenges in your work?',
      style: 'business context with personal reflection'
    },
    'tiktok': {
      tone: 'ultra-short and snappy',
      cta: 'Share your experience!',
      style: 'lightning-fast with punchy hooks'
    },
    'youtube': {
      tone: 'detailed storytelling',
      cta: 'What\'s your experience with this?',
      style: 'deeper context with personal reflection'
    }
  };

  const structure = structureTemplates[structurePreference as keyof typeof structureTemplates] || structureTemplates['short-sentences'];
  const style = styleTemplates[contentStyle as keyof typeof styleTemplates] || styleTemplates['story'];
  const adaptation = platformAdaptations[platform as keyof typeof platformAdaptations] || platformAdaptations['instagram'];

  // Generate content based on the parameters
  let content = '';
  
  if (platform === 'tiktok') {
    content = `${userQuery} hit different today ${emoji}. ${adaptation.cta}`;
  } else if (length === 'short') {
    content = `${structure.opening} ${userQuery} ${structure.development} ${emoji} ${adaptation.cta}`;
  } else {
    content = `${structure.opening}\n\n${userQuery} ${structure.development}\n\n${adaptation.cta} ${emoji}`;
  }

  // Trim to word target
  const words = content.split(' ');
  if (words.length > wordTarget) {
    content = words.slice(0, wordTarget).join(' ') + '...';
  }

  return content;
}

// Test function to verify Groq connection
export async function testGroqConnection(): Promise<boolean> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say hello in a creative way!"
        }
      ],
      model: GROQ_MODELS.fast,
      max_tokens: 50,
    });

    const response = chatCompletion.choices[0]?.message?.content;
    console.log('✅ Groq connection test successful:', response);
    return true;
  } catch (error) {
    console.error('❌ Groq connection test failed:', error);
    return false;
  }
}