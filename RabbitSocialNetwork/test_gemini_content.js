import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function testGeminiContent() {
  console.log('🧪 Testing Gemini content generation...');
  
  try {
    const prompt = `Create an energetic, motivational Instagram post for fitness enthusiasts about: fitness motivation. 
    Include specific hashtags and keep it under 200 words.`;
    
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });
    
    console.log('✅ Full response structure:', JSON.stringify(result, null, 2));
    console.log('✅ Text property:', result.text);
    console.log('✅ Response candidates:', result.candidates);
    
    if (result.candidates && result.candidates.length > 0) {
      console.log('✅ First candidate:', result.candidates[0]);
      console.log('✅ First candidate content:', result.candidates[0].content);
    }
    
  } catch (error) {
    console.error('❌ Error testing Gemini:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
  }
}

testGeminiContent();