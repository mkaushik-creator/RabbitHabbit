import { OnboardingInput } from '../../shared/schema';
import { ContentGenerationResponse } from '../../shared/schema';
import { AIChatRequest, AIChatResponse } from './aiChat';

export async function generateMultiPlatformContent(
  preferences: OnboardingInput
): Promise<ContentGenerationResponse> {
  // Unsplash doesn't do text generation, only image search
  const response: ContentGenerationResponse = {};
  return response;
}

export async function generateChatResponse(
  request: AIChatRequest
): Promise<AIChatResponse> {
  // Unsplash doesn't do text generation, only image search
  throw new Error('Unsplash service is for image search only');
}

export async function generateImage(prompt: string): Promise<string | null> {
  console.log('🎨 Generating contextual image with Unsplash search...');
  console.log('🎯 Input prompt:', prompt.substring(0, 100) + '...');

  try {
    // Extract keywords from the prompt for better search
    let searchQuery = prompt.trim();
    
    // Remove common prefixes that don't help with search
    searchQuery = searchQuery.replace(/^(A realistic, high-quality social media image|A professional image|High quality, professional social media image)/, '');
    searchQuery = searchQuery.replace(/\b(showing|depicting|of)\b/gi, '');
    
    // Clean up the query
    searchQuery = searchQuery.replace(/[^\w\s]/g, ' ').trim();
    
    // Extract meaningful keywords (first 3 words are usually most relevant)
    const keywords = searchQuery.split(/\s+/).filter(word => word.length > 2).slice(0, 3);
    const finalQuery = keywords.join(' ') || 'professional';
    
    console.log('🔍 Unsplash search query:', finalQuery);
    
    // Use Unsplash's source API for dynamic images
    const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(finalQuery)}`;
    
    console.log('✅ Unsplash contextual image generated:', imageUrl);
    return imageUrl;

  } catch (error: any) {
    console.error('❌ Error generating image with Unsplash:', error);
    throw new Error(`Unsplash image search failed: ${error.message || 'Unknown error'}`);
  }
}

export async function testUnsplashConnection(): Promise<boolean> {
  try {
    const result = await generateImage('test image');
    return result !== null;
  } catch (error) {
    console.error('❌ Unsplash connection test failed:', error);
    return false;
  }
}