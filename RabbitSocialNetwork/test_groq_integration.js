// Test script for Groq integration
import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

async function testGroqIntegration() {
  console.log('🧪 Testing Groq AI integration...');
  
  // Check if API key is available
  if (!process.env.GROQ_API_KEY) {
    console.log('❌ GROQ_API_KEY not found in environment variables');
    console.log('📝 To set up Groq:');
    console.log('1. Visit https://console.groq.com');
    console.log('2. Create free account (no credit card required)');
    console.log('3. Generate API key in console');
    console.log('4. Add to Replit Secrets as GROQ_API_KEY');
    return;
  }

  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    console.log('✅ Groq client initialized');
    console.log('🚀 Testing chat completion...');

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that responds concisely."
        },
        {
          role: "user",
          content: "Create a motivational Instagram post about fitness in 2 sentences with hashtags."
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 200,
    });

    const response = chatCompletion.choices[0]?.message?.content;
    console.log('✅ Success! Groq response:');
    console.log('📝 Generated content:', response);
    
    // Test content generation endpoint
    console.log('\n🧪 Testing content generation API...');
    const contentTest = await fetch('http://localhost:5000/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: 'motivational',
        audience: 'fitness-enthusiasts', 
        tone: 'energetic',
        platforms: ['instagram'],
        keywords: 'fitness motivation',
        includeImage: false,
        imageOption: 'none'
      })
    });

    if (contentTest.ok) {
      const contentResult = await contentTest.json();
      console.log('✅ Content generation API working!');
      console.log('📝 Generated:', contentResult);
    } else {
      console.log('❌ Content generation API error:', contentTest.status);
    }

    // Test chat API
    console.log('\n🧪 Testing chat API...');
    const chatTest = await fetch('http://localhost:5000/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello!' }],
        platforms: ['instagram'],
        userQuery: 'Create content about productivity'
      })
    });

    if (chatTest.ok) {
      const chatResult = await chatTest.json();
      console.log('✅ Chat API working!');
      console.log('📝 Response:', chatResult.message.substring(0, 100) + '...');
    } else {
      console.log('❌ Chat API error:', chatTest.status);
    }

  } catch (error) {
    console.error('❌ Groq test failed:', error.message);
    if (error.message.includes('401')) {
      console.log('🔑 Invalid API key. Please check your GROQ_API_KEY');
    } else if (error.message.includes('429')) {
      console.log('⏰ Rate limit reached. Try again in a moment.');
    } else {
      console.log('🌐 Network or API error. Check your connection.');
    }
  }
}

// Run the test
testGroqIntegration().catch(console.error);