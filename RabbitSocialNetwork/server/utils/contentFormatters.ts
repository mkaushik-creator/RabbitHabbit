/**
 * Format platform-specific prompt instructions for OpenAI
 */
export function formatPlatformPrompt(platform: string): string {
  const normalizedPlatform = platform.toLowerCase();
  
  if (normalizedPlatform === 'linkedin') {
    return `LinkedIn content guidelines:
- Professional and business-focused
- Length: 1-3 paragraphs (up to 1,300 characters)
- Avoid excessive hashtags (3-5 max)
- Include a call to action
- Address specific professional pain points
- Share industry insights or career advice
- Reference relevant professional experiences
- Image prompt should be professional, clean, and business-appropriate`;
  }
  
  if (normalizedPlatform === 'twitter' || normalizedPlatform === 'x') {
    return `Twitter (X) content guidelines:
- Keep under 280 characters
- Concise and engaging
- Include 1-2 hashtags maximum
- Incorporate timely or trending topics when relevant
- Ask thought-provoking questions
- Use short, impactful sentences
- Can be formatted as a thread (connect multiple tweets)
- Image prompt should be attention-grabbing for the Twitter feed`;
  }
  
  if (normalizedPlatform === 'instagram') {
    return `Instagram content guidelines:
- Visually focused (image prompt is very important)
- Engaging first 1-2 sentences before line break
- Include relevant emojis
- Use line breaks to separate thoughts
- Tell a visual story that resonates with the audience
- Focus on aspirational or relatable content
- Include 5-10 relevant hashtags
- Image prompt should be visually appealing, colorful and Instagram-worthy`;
  }
  
  if (normalizedPlatform === 'discord') {
    return `Discord content guidelines:
- Conversational and community-focused
- Can include formatting like bold, italic using markdown
- Can include emojis and mentions
- Pose questions to spark discussion
- Use casual, friendly tone even for professional topics
- Reference community in-jokes or shared experiences when appropriate
- Encourage engagement and discussion
- Image prompt should relate to gaming, tech, or community-specific themes`;
  }
  
  if (normalizedPlatform === 'tiktok') {
    return `TikTok content guidelines:
- Extremely concise script format
- Eye-catching opener (first 3 seconds are crucial)
- Conversational, energetic tone
- Structure as a hook, value, call-to-action
- Keep total script under 30 seconds when read aloud
- Include trending sounds or hashtag suggestions
- Image prompt should be very eye-catching, trendy and attention-grabbing`;
  }
  
  return `${platform} content guidelines:
- Create engaging content appropriate for the platform
- Include hashtags if relevant
- Adjust tone to match platform expectations
- Focus on content that performs well on this platform
- Suggest an appropriate image prompt that would work well with the content`;
}

/**
 * Format content based on platform requirements
 * This would be used if we needed to post-process the OpenAI output
 */
export function formatContent(content: string, platform: string): string {
  const normalizedPlatform = platform.toLowerCase();
  
  if (normalizedPlatform === 'twitter' && content.length > 280) {
    return content.substring(0, 277) + '...';
  }
  
  return content;
}
