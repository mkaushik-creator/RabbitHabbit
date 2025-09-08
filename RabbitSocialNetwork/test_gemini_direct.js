import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function testGemini() {
  console.log('🧪 Testing Gemini API directly...');
  
  try {
    // Try different API approaches
    console.log('🔍 Testing with generateText method...');
    const model = ai.models.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Write a short motivational fitness post for Instagram with hashtags.");
    
    console.log('📊 Alternative test...');
    const result2 = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Write a short motivational fitness post for Instagram with hashtags.",
      config: {
        maxOutputTokens: 200,
        temperature: 0.7,
      }
    });

    console.log('✅ Method 1 response:', JSON.stringify(result, null, 2));
    console.log('📝 Method 1 text:', result.response?.text());
    
    console.log('✅ Method 2 response:', JSON.stringify(result2, null, 2));
    console.log('📝 Method 2 text:', result2.text);
    
    const textContent1 = result.response?.text();
    const textContent2 = result2.text;
    
    console.log('📝 Final text 1:', textContent1);
    console.log('📝 Final text 2:', textContent2);
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
  }
}

testGemini();