import OpenAI from "openai";
import { OnboardingInput, ContentGenerationResponse } from "@shared/schema";
import { formatPlatformPrompt } from "../utils/contentFormatters";
import { generateMockContent, generateMockImage } from "./mockAI";

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY is not set. Content generation will use fallback content.");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Main function to generate content for multiple platforms
export async function generateMultiPlatformContent(
  preferences: OnboardingInput
): Promise<ContentGenerationResponse> {
  // Use mock AI for development/testing to avoid API costs
  if (!process.env.OPENAI_API_KEY || process.env.NODE_ENV === 'development') {
    console.log("🎭 Using mock AI for content generation (cost-free testing)");
    return generateMockContent(preferences);
  }
  
  try {
    const { contentType, audience, tone, platforms, imageOption, customKeywords } = preferences;
    
    // Create system prompt
    const systemPrompt = `You are an expert social media content creator specializing in creating tailored, platform-optimized content. 
Generate content ONLY for the exact platforms selected by the user, ensuring the content matches their preferences.`;

    // Build the user prompt based on content type
    let contentPrompt = '';
    if (contentType === 'Custom' && customKeywords) {
      contentPrompt = `Custom content based on these keywords/ideas: ${customKeywords}`;
    } else {
      contentPrompt = `Content type: ${contentType}`;
    }

    // Create user prompt
    const userPrompt = `IMPORTANT: Create content ONLY for these specific platforms: ${platforms.join(', ')}
${contentPrompt}
Target audience: ${audience}
Tone: ${tone}
Image option: ${imageOption}
${customKeywords ? `Custom keywords/ideas: ${customKeywords}` : ''}

For each platform, provide 3 different content options that follow the platform's best practices and format.
Include appropriate hashtags for each platform and an image prompt that would work well with the content.

${platforms.map(platform => formatPlatformPrompt(platform)).join('\n\n')}

Return the content in JSON format with platform keys matching ONLY the selected platforms (lowercase), 
and each platform should have an array of content options with 'content', 'hashtags', and 'imagePrompt' fields.
DO NOT generate content for platforms not in the list.`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
    });

    // Parse the JSON response
    const content = JSON.parse(response.choices[0].message.content || '{}');
    
    // For demonstration purposes, if there's an API key issue or the model returns unexpected format,
    // provide minimal fallback content so the app doesn't break
    if (!content || Object.keys(content).length === 0) {
      return getFallbackContent(platforms);
    }
    
    return content;
  } catch (error: any) {
    console.error("Error generating content with OpenAI:", error);
    
    // Check if this is a quota or billing issue
    if (error?.code === 'insufficient_quota' || error?.status === 429) {
      console.warn("⚠️ OpenAI quota exceeded - user needs to add credits to their account");
    }
    
    return getFallbackContent(preferences.platforms);
  }
}

// Fallback content if OpenAI API fails
function getFallbackContent(platforms: string[]): ContentGenerationResponse {
  const response: ContentGenerationResponse = {};
  
  platforms.forEach(platform => {
    const platformKey = platform.toLowerCase() as keyof ContentGenerationResponse;
    
    response[platformKey] = [
      {
        content: `This is a sample ${platform} post. When connected to OpenAI, this will generate real content based on your preferences.`,
        hashtags: "#Sample #Content #AI",
        imagePrompt: "A professional looking sample image for demonstration purposes"
      },
      {
        content: `Another example post for ${platform}. Connect your OpenAI API key to generate customized content.`,
        hashtags: "#Example #Demo #Content",
        imagePrompt: "A creative visualization of AI-generated content"
      },
      {
        content: `Third option for ${platform}. With a valid OpenAI API key, you'll get varied content options.`,
        hashtags: "#Options #Variety #ContentCreation",
        imagePrompt: "Multiple content ideas represented visually"
      }
    ];
  });
  
  return response;
}

// Function to generate an image using DALL-E
export async function generateImage(prompt: string): Promise<string | null> {
  // Use OpenAI DALL-E with proper API key
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OpenAI API key not configured, skipping image generation");
    return null;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  try {
    // Validate and clean the prompt
    if (!prompt || prompt.trim().length === 0) {
      console.error("Empty or invalid prompt provided");
      return null;
    }

    // Clean and enhance the prompt for better DALL-E 3 compatibility
    let cleanPrompt = prompt.trim();
    
    // Remove markdown formatting and problematic content
    cleanPrompt = cleanPrompt.replace(/\*\*/g, '').replace(/[#@]/g, '').trim();
    
    // Remove phrases that might trigger content policy
    cleanPrompt = cleanPrompt.replace(/\b(showing|depicting|image of|photo of|visual of)\b/gi, '');
    
    // Simple, descriptive prompts work better for DALL-E
    if (cleanPrompt.length < 15) {
      cleanPrompt = `${cleanPrompt}, professional photography style`;
    } else if (cleanPrompt.length > 200) {
      // Keep it concise for better results
      cleanPrompt = cleanPrompt.substring(0, 200) + '...';
    }
    
    // Make it more natural and less directive
    cleanPrompt = cleanPrompt.replace(/^A realistic, high-quality social media image/, '');
    cleanPrompt = cleanPrompt.replace(/^A professional image/, '');
    cleanPrompt = cleanPrompt.trim();
    
    // Final cleanup - just the core subject
    if (cleanPrompt.startsWith('showing:') || cleanPrompt.startsWith('depicting:')) {
      cleanPrompt = cleanPrompt.substring(cleanPrompt.indexOf(':') + 1).trim();
    }

    console.log("🎨 Generating DALL-E image with enhanced prompt:", cleanPrompt.substring(0, 120) + "...");

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: cleanPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    if (!response.data || response.data.length === 0) {
      console.error("❌ No image data returned from DALL-E");
      return null;
    }

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      console.error("❌ Image URL not found in response");
      return null;
    }
    console.log("✅ DALL-E image generated successfully");
    return imageUrl;
  } catch (error: any) {
    console.error("❌ Error generating image with DALL-E:", error);
    
    // Handle specific OpenAI errors and throw user-friendly messages
    if (error.status === 400) {
      throw new Error("Invalid prompt for image generation. Please try a different description.");
    } else if (error.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    } else if (error.status === 401) {
      throw new Error("OpenAI API key is invalid or expired. Please check your configuration.");
    } else if (error.status === 500) {
      throw new Error("OpenAI service temporarily unavailable. Please try again later.");
    } else {
      throw new Error(`Image generation failed: ${error.message || 'Unknown error'}`);
    }
  }
}
