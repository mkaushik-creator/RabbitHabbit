import { generateChatResponse as routerGenerateChatResponse } from "./aiRouter";
import { formatPlatformPrompt } from "../utils/contentFormatters";

// Interface for the AI chat request
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIChatRequest {
  messages: ChatMessage[];
  platforms: string[];
  userQuery: string;
  tone?: string;
  format?: string;
  niche?: string;
  includeEmojis?: boolean;
  emojiPack?: string;
  length?: string;
  contentStyle?: 'story' | 'data-driven' | 'call-to-action';
  emotionalTone?: 'emotional' | 'factual';
  structurePreference?: 'short-sentences' | 'flowing-paragraphs' | 'bullet-points';
}

export interface AIChatResponse {
  message: string;
  suggestedContent: {
    platform: string;
    content: string;
    hashtags?: string;
    contentRating?: number; // 1-5 star rating for content quality
    narrativeStructure?: 'problem-impact-action' | 'hook-story-cta' | 'data-insight-action';
    imagePrompt?: string; // Optional image generation prompt based on content themes
  }[];
}

// Function to generate chat responses with content suggestions
export async function generateChatResponse(
  request: AIChatRequest
): Promise<AIChatResponse> {
  // Use the AI router to automatically select the best available provider
  return routerGenerateChatResponse(request);
}

// Function to simulate posting to social media platforms
export async function simulatePostToSocialMedia(
  platform: string,
  content: string
): Promise<boolean> {
  // In a real application, this would connect to the respective platform's API
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      console.log(`Posted to ${platform}: ${content.substring(0, 50)}...`);
      resolve(true);
    }, 1500);
  });
}