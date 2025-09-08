import { HfInference } from '@huggingface/inference';
import { OnboardingInput, ContentGenerationResponse } from "@shared/schema";
import { AIChatRequest, AIChatResponse } from "./aiChat";
import { formatPlatformPrompt } from "../utils/contentFormatters";

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGING_FACE_TOKEN || "");

// Available Hugging Face models (all free)
const HF_MODELS = {
  fast: "microsoft/DialoGPT-medium", // Fast conversational model
  balanced: "meta-llama/Meta-Llama-3-8B-Instruct", // Good balance
  creative: "mistralai/Mixtral-8x7B-Instruct-v0.1", // Creative tasks
  textgen: "HuggingFaceH4/zephyr-7b-beta", // Text generation
} as const;

export async function generateMultiPlatformContent(
  preferences: OnboardingInput
): Promise<ContentGenerationResponse> {
  console.log('🚀 Generating multi-platform content with Hugging Face...');
  
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

Write compelling, platform-optimized content with relevant hashtags (3-5 hashtags).
Keep it concise and engaging for the target audience.

Format: Content first, then hashtags on new lines with # symbols.`;

      try {
        console.log(`🚀 Generating content for ${platform}...`);
        
        const result = await hf.textGeneration({
          model: HF_MODELS.balanced,
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
            repetition_penalty: 1.1,
          }
        });

        const content = result.generated_text || "";
        console.log(`✅ ${platform} content generated:`, content.substring(0, 100) + '...');

        // Parse content and hashtags
        const lines = content.split('\n');
        const hashtagLines = lines.filter(line => line.includes('#'));
        const contentLines = lines.filter(line => !line.includes('#') && line.trim());
        
        const cleanContent = contentLines.slice(0, 3).join(' ').trim() || 
                           `Exciting ${preferences.contentType} content for ${platform}! Stay tuned for amazing updates.`;
        const hashtags = hashtagLines.length > 0 ? 
                        hashtagLines.join(' ') : 
                        '#social #content #creator';

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
    console.error('Error in Hugging Face multi-platform generation:', error);
    throw new Error('Failed to generate content with Hugging Face');
  }

  return response;
}

export async function generateChatResponse(
  request: AIChatRequest
): Promise<AIChatResponse> {
  console.log('🚀 Generating chat response with Hugging Face...');

  try {
    const systemPrompt = "You are an expert social media content creator and marketing assistant. Help users create engaging content for their social media platforms.";
    
    // Build conversation context
    const conversationContext = request.messages.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const prompt = `${systemPrompt}

Conversation:
${conversationContext}

User query: ${request.userQuery}

Please provide helpful advice for creating content on: ${request.platforms.join(', ')}`;

    const result = await hf.textGeneration({
      model: HF_MODELS.balanced,
      inputs: prompt,
      parameters: {
        max_new_tokens: 400,
        temperature: 0.8,
        do_sample: true,
        top_p: 0.9,
      }
    });

    const aiResponse = result.generated_text || "I'm here to help you create amazing social media content!";
    console.log('✅ Hugging Face chat response generated');

    // Generate platform-specific suggestions
    const contentPromises = request.platforms.map(async (platform) => {
      try {
        const contentPrompt = `Create a short, engaging ${platform} post about: ${request.userQuery}. Include relevant hashtags.`;
        
        const contentResult = await hf.textGeneration({
          model: HF_MODELS.fast,
          inputs: contentPrompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.8,
          }
        });

        const content = contentResult.generated_text || "";
        const hashtagMatch = content.match(/#\w+/g);
        const hashtags = hashtagMatch ? hashtagMatch.join(' ') : '#social #content #creator';
        const cleanContent = content.replace(/#\w+/g, '').trim();

        return {
          platform,
          content: cleanContent || `Great ${platform} post idea coming up!`,
          hashtags: hashtags
        };
      } catch (error) {
        console.error(`Error generating content for ${platform}:`, error);
        return {
          platform,
          content: `Great ${platform} post idea coming up!`,
          hashtags: '#social #content #creator'
        };
      }
    });

    const suggestedContent = await Promise.all(contentPromises);

    return {
      message: aiResponse,
      suggestedContent: suggestedContent
    };

  } catch (error) {
    console.error('Hugging Face chat error:', error);
    throw new Error('Failed to generate chat response with Hugging Face');
  }
}

export async function generateImage(prompt: string): Promise<string | null> {
  console.log('🎨 Generating contextual image with Hugging Face...');
  console.log('🎯 Input prompt:', prompt.substring(0, 100) + '...');
  
  try {
    // Use a more reliable Stable Diffusion model with enhanced prompt
    const enhancedPrompt = `High quality, professional social media image: ${prompt}. Vibrant colors, engaging composition, suitable for social platforms.`;
    console.log('🔧 Enhanced prompt:', enhancedPrompt.substring(0, 100) + '...');
    
    // Use a simpler, more reliable approach with basic text-to-image
    console.log('🔄 Trying basic Hugging Face text-to-image...');
    
    try {
      const result = await hf.textToImage({
        model: "black-forest-labs/FLUX.1-dev", // Try FLUX first
        inputs: enhancedPrompt
      });
      console.log('✅ Successfully used FLUX.1-dev model');
      return result;
    } catch (fluxError) {
      console.warn('⚠️ FLUX model failed, trying alternatives...', fluxError.message);
      
      // Try a simpler approach - use the inference API without specific parameters
      try {
        const fallbackResult = await hf.textToImage({
          inputs: cleanPrompt.substring(0, 100) // Keep it simple
        });
        console.log('✅ Successfully used fallback Hugging Face model');
        return fallbackResult;
      } catch (fallbackError) {
        console.warn('⚠️ Fallback model also failed:', fallbackError.message);
        throw new Error('All Hugging Face models unavailable');
      }
    }

    // Convert blob to base64 for display
    const arrayBuffer = await result.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log('✅ Hugging Face image generated successfully');
    return dataUrl;
  } catch (error: any) {
    console.error('❌ Hugging Face image generation error:', error);
    
    // Handle specific errors with user-friendly messages
    if (error.message?.includes('Model is currently loading')) {
      throw new Error('Image model is loading. Please try again in 30 seconds.');
    } else if (error.message?.includes('rate limit')) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.message?.includes('unauthorized') || error.status === 401) {
      throw new Error('Hugging Face API key required for image generation.');
    } else {
      throw new Error(`Image generation failed: ${error.message || 'Service temporarily unavailable'}`);
    }
  }
}

// Test function to verify Hugging Face connection
export async function testHuggingFaceConnection(): Promise<boolean> {
  try {
    const result = await hf.textGeneration({
      model: HF_MODELS.fast,
      inputs: "Say hello in a creative way!",
      parameters: {
        max_new_tokens: 50,
      }
    });

    const response = result.generated_text;
    console.log('✅ Hugging Face connection test successful:', response);
    return true;
  } catch (error) {
    console.error('❌ Hugging Face connection test failed:', error);
    return false;
  }
}