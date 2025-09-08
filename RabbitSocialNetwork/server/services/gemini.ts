import { GoogleGenAI } from "@google/genai";
import { OnboardingInput, ContentGenerationResponse } from "@shared/schema";
import { AIChatRequest, AIChatResponse } from "./aiChat";
import { formatPlatformPrompt } from "../utils/contentFormatters";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Retry function for handling rate limits and overload errors
async function retryGeminiRequest(requestFn: () => Promise<any>, maxRetries = 2): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error: any) {
      if ((error.status === 503 || error.status === 429) && i < maxRetries - 1) {
        const delay = Math.min(2000 * Math.pow(2, i), 10000); // Exponential backoff: 2s, 4s, max 10s
        console.log(`🔄 Gemini API ${error.status === 503 ? 'overloaded' : 'rate limited'}, retrying (${i + 1}/${maxRetries}) in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

export async function generateMultiPlatformContent(
  preferences: OnboardingInput
): Promise<ContentGenerationResponse> {
  const response: ContentGenerationResponse = {};

  try {
    // Generate all platform content in parallel for better performance
    const contentPromises = preferences.platforms.map(async (platform) => {
      const platformPrompt = formatPlatformPrompt(platform);
      
      const prompt = `Create engaging ${preferences.contentType} content for ${platform}:
- Audience: ${preferences.audience}
- Tone: ${preferences.tone}
- ${platformPrompt}
- Keywords: ${preferences.keywords || 'trending'}

Format: Content first, then hashtags on separate lines with # symbols.
Keep it concise and engaging.`;

      try {
        console.log(`🚀 Generating content for ${platform} with prompt:`, prompt.substring(0, 100) + '...');
        
        const result = await retryGeminiRequest(() => genAI.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt
        }));

        console.log(`🔍 ${platform} Raw Gemini Response:`, JSON.stringify(result, null, 2));
        const responseText = result.text || "";
        console.log(`🔍 ${platform} Response text:`, responseText);

        const content = responseText;
        
        // Extract hashtags from content (look for # symbols)
        const hashtagMatch = content.match(/#\w+/g);
        const hashtags = hashtagMatch ? hashtagMatch.join(' ') : '';
        
        // Remove hashtags from main content for cleaner display
        const cleanContent = content.replace(/#\w+/g, '').trim();

        console.log(`🔍 ${platform} Processed content:`, cleanContent);
        console.log(`🔍 ${platform} Extracted hashtags:`, hashtags);

        return {
          platform,
          data: {
            content: cleanContent,
            hashtags: hashtags
          }
        };
      } catch (error) {
        console.error(`Error generating content for ${platform}:`, error);
        return {
          platform,
          data: {
            content: `Great ${platform} content coming soon!`,
            hashtags: '#social #content #creator'
          }
        };
      }
    });

    // Wait for all platform content to be generated
    const results = await Promise.all(contentPromises);
    
    // Convert results to response format
    results.forEach(result => {
      response[result.platform] = result.data;
    });

    // Generate image if requested
    if (preferences.includeImage && preferences.platforms.length > 0) {
      try {
        const imagePrompt = `Create an image for ${preferences.contentType} content about ${preferences.keywords || 'social media'}`;
        const imageUrl = await generateImage(imagePrompt);
        
        if (imageUrl) {
          // Add image to first platform
          const firstPlatform = preferences.platforms[0];
          if (response[firstPlatform]) {
            response[firstPlatform].imageUrl = imageUrl;
          }
        }
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }

    return response;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate content with Gemini');
  }
}

export async function generateChatResponse(
  request: AIChatRequest
): Promise<AIChatResponse> {
  try {
    const systemPrompt = `You are RabbitHabbit, an AI social media content creator. Help users create engaging content for platforms: ${request.platforms.join(', ')}.

Respond naturally and provide specific, actionable suggestions. Always include platform-optimized content suggestions.`;

    const conversationContext = request.messages.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const prompt = `${systemPrompt}\n\nConversation:\n${conversationContext}\n\nUser query: ${request.userQuery}

Please provide a helpful response and suggest specific content for each platform: ${request.platforms.join(', ')}`;

    const result = await retryGeminiRequest(() => genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    }));

    console.log('🔍 Gemini API Response:', result);
    const responseText = result.text || "";
    console.log('🔍 Response text:', responseText);
    const aiResponse = responseText || "I'm here to help you create amazing social media content!";

    // Get enhanced configuration options
    const { 
      contentStyle = 'story', 
      emotionalTone = 'emotional', 
      structurePreference = 'short-sentences',
      includeEmojis = true,
      emojiPack = 'nature',
      length = 'medium'
    } = request;

    // Platform-specific emoji variants to avoid repetition
    const platformEmojiVariants = {
      'instagram': ['✨', '🌟', '💫', '🎉', '💝'],
      'linkedin': ['💡', '🎯', '📊', '🔥', '💼'],
      'facebook': ['❤️', '🌈', '🎈', '💖', '🌸'],
      'tiktok': ['🔥', '💥', '⚡', '🌟', '🎊'],
      'x': ['💭', '🚀', '💡', '⚡', '🔥'],
      'youtube': ['🎬', '🎥', '📺', '🎪', '🎭']
    };

    // Platform-specific unique CTA variations
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

    // Generate platform-specific suggestions with enhanced features
    const contentPromises = request.platforms.map(async (platform) => {
      try {
        const platformEmojis = platformEmojiVariants[platform.toLowerCase() as keyof typeof platformEmojiVariants] || ['✨', '🌟', '💫'];
        const ctaOptions = platformCTAVariants[platform.toLowerCase() as keyof typeof platformCTAVariants] || ['What are your thoughts?'];
        const randomCTA = ctaOptions[Math.floor(Math.random() * ctaOptions.length)];
        
        const emojiSuggestion = includeEmojis 
          ? `Use platform-specific emojis: ${platformEmojis.join(' ')} (maximum 2 emojis that enhance the message)`
          : 'Do not use any emojis';

        let platformPrompt = '';
        let characterLimit = '';

        switch (platform.toLowerCase()) {
          case 'instagram':
            platformPrompt = `Create engaging Instagram content about "${request.userQuery}" with storytelling approach.

PLATFORM REQUIREMENTS:
- Use accessible language and visual storytelling
- ${emojiSuggestion}
- End with: ${randomCTA}
- Focus on relatable moments and personal connection
- Target ${length} length content

Format: Content on one line, then Hashtags: [4-5 hashtags]`;
            break;

          case 'linkedin':
            platformPrompt = `Create professional LinkedIn content about "${request.userQuery}" with business insights.

PLATFORM REQUIREMENTS:
- Professional tone with accessibility
- ${emojiSuggestion}
- End with: ${randomCTA}
- Focus on professional growth and industry leadership
- Target ${length} length content

Format: Content on one line, then Hashtags: [4-5 hashtags]`;
            break;

          case 'x':
          case 'twitter':
            characterLimit = 'CRITICAL: Keep total content under 240 characters including spaces';
            platformPrompt = `Create concise Twitter/X content about "${request.userQuery}" (${characterLimit}).

PLATFORM REQUIREMENTS:
- ${characterLimit}
- Be punchy, thought-provoking, and direct
- ${emojiSuggestion}
- End with: ${randomCTA}
- Keep accessible while maintaining emotional depth

Format: Content on one line, then Hashtags: [4-5 hashtags]`;
            break;

          case 'tiktok':
            platformPrompt = `Create ultra-short TikTok content about "${request.userQuery}" (maximum 40 words).

PLATFORM REQUIREMENTS:
- Maximum 40 words, under 80 characters
- Start with punchy hook that grabs attention
- ${emojiSuggestion}
- End with: ${randomCTA}
- Ultra-engaging and shareable

Format: Content on one line, then Hashtags: [4-5 hashtags]`;
            break;

          default:
            platformPrompt = `Create engaging ${platform} content about "${request.userQuery}".

PLATFORM REQUIREMENTS:
- ${emojiSuggestion}
- End with: ${randomCTA}
- Target ${length} length content

Format: Content on one line, then Hashtags: [4-5 hashtags]`;
        }
        
        const contentResult = await retryGeminiRequest(() => genAI.models.generateContent({
          model: "gemini-1.5-flash",
          contents: platformPrompt
        }));

        const content = contentResult.text || "";
        
        // Parse response to separate content and hashtags
        const lines = content.split('\n');
        let mainContent = '';
        let hashtags = '';
        
        for (const line of lines) {
          if (line.toLowerCase().includes('hashtags:')) {
            hashtags = line.replace(/hashtags:\s*/i, '').trim();
          } else if (line.trim() && !line.toLowerCase().includes('content:')) {
            mainContent = line.trim();
            break;
          }
        }
        
        // If no hashtags found, extract from content
        if (!hashtags) {
          const hashtagMatch = content.match(/#\w+/g);
          hashtags = hashtagMatch ? hashtagMatch.join(' ') : '#social #content #creator';
          mainContent = content.replace(/#\w+/g, '').trim();
        }

        // Enforce character limits for Twitter/X
        if (platform.toLowerCase() === 'x' || platform.toLowerCase() === 'twitter') {
          if (mainContent.length > 240) {
            mainContent = mainContent.substring(0, 237) + '...';
          }
        }

        // Generate image prompt based on content themes
        const imagePrompt = `Create a visually appealing image for ${platform} about ${request.userQuery}. Style: ${contentStyle}, mood: ${emotionalTone}. The image should complement the content: ${mainContent.substring(0, 100)}`;

        return {
          platform,
          content: mainContent || `Great ${platform} content coming soon!`,
          hashtags: hashtags || '#social #content #creator',
          imagePrompt: imagePrompt
        };
      } catch (error) {
        console.error(`Error generating content for ${platform}:`, error);
        return {
          platform,
          content: `Great ${platform} content coming soon!`,
          hashtags: '#social #content #creator',
          imagePrompt: `Create a ${platform} image about ${request.userQuery}`
        };
      }
    });

    const suggestedContent = await Promise.all(contentPromises);

    return {
      message: aiResponse,
      suggestedContent
    };
  } catch (error) {
    console.error('Gemini chat error:', error);
    throw new Error('Failed to generate chat response with Gemini');
  }
}

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    // Using Gemini 2.0 Flash for image generation
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return null;
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      return null;
    }

    for (const part of content.parts) {
      if (part.inlineData && part.inlineData.data) {
        // Convert base64 to data URL
        const imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        return imageData;
      }
    }

    return null;
  } catch (error) {
    console.error('Gemini image generation error:', error);
    return null;
  }
}