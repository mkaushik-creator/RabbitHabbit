
console.log('Testing Gemini API key...');
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY starts with:', process.env.GEMINI_API_KEY?.substring(0, 10) || 'none');

