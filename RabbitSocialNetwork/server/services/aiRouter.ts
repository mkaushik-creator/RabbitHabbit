import { OnboardingInput, ContentGenerationResponse } from "@shared/schema";
import { AIChatRequest, AIChatResponse } from "./aiChat";
import { AI_CONFIG, getActiveProvider } from "../config/ai";

// Import all AI providers
import * as OpenAI from "./openai";
import * as Gemini from "./gemini";
import * as Anthropic from "./anthropic";
import * as Groq from "./groq";
import * as HuggingFace from "./huggingface";
import * as Replicate from "./replicate";
import * as Unsplash from "./unsplash";
import * as MockAI from "./mockAI";

// AI Provider interface
interface AIProvider {
  generateMultiPlatformContent(preferences: OnboardingInput): Promise<ContentGenerationResponse>;
  generateChatResponse(request: AIChatRequest): Promise<AIChatResponse>;
  generateImage(prompt: string): Promise<string | null>;
}

// Provider implementations
const providers: Record<string, AIProvider> = {
  openai: {
    generateMultiPlatformContent: OpenAI.generateMultiPlatformContent,
    generateChatResponse: OpenAI.generateChatResponse || generateFallbackChatResponse,
    generateImage: OpenAI.generateImage
  },
  gemini: {
    generateMultiPlatformContent: Gemini.generateMultiPlatformContent,
    generateChatResponse: Gemini.generateChatResponse,
    generateImage: Gemini.generateImage
  },
  anthropic: {
    generateMultiPlatformContent: Anthropic.generateMultiPlatformContent,
    generateChatResponse: Anthropic.generateChatResponse,
    generateImage: Anthropic.generateImage
  },
  groq: {
    generateMultiPlatformContent: Groq.generateMultiPlatformContent,
    generateChatResponse: Groq.generateChatResponse,
    generateImage: Groq.generateImage
  },
  huggingface: {
    generateMultiPlatformContent: HuggingFace.generateMultiPlatformContent,
    generateChatResponse: HuggingFace.generateChatResponse,
    generateImage: HuggingFace.generateImage
  },
  replicate: {
    generateMultiPlatformContent: Replicate.generateMultiPlatformContent,
    generateChatResponse: Replicate.generateChatResponse,
    generateImage: Replicate.generateImage
  },
  unsplash: {
    generateMultiPlatformContent: Unsplash.generateMultiPlatformContent,
    generateChatResponse: Unsplash.generateChatResponse,
    generateImage: Unsplash.generateImage
  },
  mock: {
    generateMultiPlatformContent: MockAI.generateMockContent,
    generateChatResponse: MockAI.generateMockChatResponse,
    generateImage: MockAI.generateMockImage
  }
};

// Fallback chat response for providers that don't support it
async function generateFallbackChatResponse(request: AIChatRequest): Promise<AIChatResponse> {
  return {
    message: "I'm here to help you create amazing social media content! What would you like to create today?",
    suggestedContent: request.platforms.map(platform => ({
      platform,
      content: `Great ${platform} post idea coming up!`,
      hashtags: '#social #content #creator'
    }))
  };
}

// Main AI router functions
export async function generateMultiPlatformContent(
  preferences: OnboardingInput
): Promise<ContentGenerationResponse> {
  const activeProvider = AI_CONFIG.activeProvider;
  const provider = providers[activeProvider];
  
  if (!provider) {
    throw new Error(`Unknown AI provider: ${activeProvider}`);
  }

  console.log(`🤖 Using AI provider: ${getActiveProvider().name}`);
  
  try {
    return await provider.generateMultiPlatformContent(preferences);
  } catch (error) {
    console.error(`Error with ${activeProvider} provider:`, error);
    
    // Fallback to mock AI if the current provider fails
    if (activeProvider !== 'mock') {
      console.log('🔄 Falling back to mock AI...');
      return await providers.mock.generateMultiPlatformContent(preferences);
    }
    
    throw error;
  }
}

export async function generateChatResponse(
  request: AIChatRequest
): Promise<AIChatResponse> {
  const activeProvider = AI_CONFIG.activeProvider;
  const provider = providers[activeProvider];
  
  if (!provider) {
    throw new Error(`Unknown AI provider: ${activeProvider}`);
  }

  console.log(`🤖 Using AI provider for chat: ${getActiveProvider().name}`);
  
  try {
    const response = await provider.generateChatResponse(request);
    console.log(`✅ Successfully generated chat response with ${activeProvider}`);
    return response;
  } catch (error) {
    console.error(`❌ Error with ${activeProvider} provider:`, error);
    
    // Check if it's a temporary server error and try fallback providers
    if (error.status === 503 && activeProvider === 'groq') {
      console.log('⚠️ Groq servers temporarily unavailable (503), trying fallback providers...');
      
      // Try other providers in order if they have API keys
      const fallbackProviders = ['gemini', 'anthropic', 'openai'];
      for (const fallbackProvider of fallbackProviders) {
        const apiKeyName = `${fallbackProvider.toUpperCase()}_API_KEY`;
        if (providers[fallbackProvider] && process.env[apiKeyName]) {
          try {
            console.log(`🔄 Trying fallback provider: ${fallbackProvider}`);
            const response = await providers[fallbackProvider].generateChatResponse(request);
            console.log(`✅ Successfully used fallback provider: ${fallbackProvider}`);
            return response;
          } catch (fallbackError) {
            console.warn(`⚠️ Fallback provider ${fallbackProvider} also failed:`, fallbackError.message);
            continue;
          }
        }
      }
    }
    
    // If all real providers fail, return a clear error message instead of mock data
    return {
      message: `I'm experiencing technical difficulties connecting to AI services. The error was: ${error.message}. Please try again in a moment.`,
      suggestedContent: request.platforms.map(platform => ({
        platform,
        content: `Unable to generate ${platform} content due to AI service unavailability. Please try again.`,
        hashtags: `#${platform.toLowerCase()}`
      }))
    };
  }
}

export async function generateImage(prompt: string): Promise<string | null> {
  console.log(`🎨 Starting image generation with prompt: ${prompt.substring(0, 50)}...`);
  
  // Try providers in order: OpenAI (if API key), Replicate (if API key), Unsplash (contextual), then mock
  const imageProviders = ['openai', 'replicate', 'unsplash', 'mock'];
  
  for (const provider of imageProviders) {
    if (!providers[provider]) continue;
    
    // Skip providers without API keys
    if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
      console.log('⏭️ Skipping OpenAI - no API key configured');
      continue;
    }
    
    if (provider === 'replicate' && !process.env.REPLICATE_API_TOKEN) {
      console.log('⏭️ Skipping Replicate - no API token configured');
      continue;
    }
    
    try {
      console.log(`🤖 Trying image generation with: ${provider}`);
      const response = await providers[provider].generateImage(prompt);
      
      if (response) {
        console.log(`✅ Successfully generated image with ${provider}`);
        return response;
      } else {
        console.log(`⚠️ ${provider} returned null result, trying next provider...`);
      }
    } catch (error: any) {
      console.error(`❌ Error with ${provider} provider:`, error.message);
      
      // If it's the last provider, throw the error
      if (provider === imageProviders[imageProviders.length - 1]) {
        throw error;
      }
      
      console.log(`🔄 Trying next provider...`);
      continue;
    }
  }
  
  throw new Error('All image generation providers failed');
}

// Helper function to get current AI provider info
export function getCurrentAIProvider() {
  return {
    provider: AI_CONFIG.activeProvider,
    info: getActiveProvider()
  };
}