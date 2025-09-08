// AI Configuration with multiple providers
export const AI_CONFIG = {
  // Preferred AI provider priority (first available will be used)
  PREFERRED_PROVIDERS: ['groq', 'gemini', 'anthropic', 'openai', 'huggingface'] as const,
  
  // Set to false to use real AI APIs, true for mock AI
  USE_MOCK_AI: false,
  
  // Provider configurations
  PROVIDERS: {
    openai: {
      enabled: () => !!process.env.OPENAI_API_KEY,
      name: 'OpenAI GPT-4o',
      free: false
    },
    gemini: {
      enabled: () => !!process.env.GEMINI_API_KEY,
      name: 'Google Gemini 2.5 Flash',
      free: true // 15 requests/minute free
    },
    anthropic: {
      enabled: () => !!process.env.ANTHROPIC_API_KEY,
      name: 'Anthropic Claude',
      free: true // Good free tier
    },
    groq: {
      enabled: () => !!process.env.GROQ_API_KEY,
      name: 'Groq Llama 3.3 70B',
      free: true // Completely free, no credit card required
    },
    huggingface: {
      enabled: () => !!process.env.HUGGING_FACE_TOKEN,
      name: 'Hugging Face Llama 3',
      free: true // Free tier with monthly credits
    }
  },
  
  // Get the first available provider
  get activeProvider() {
    if (this.USE_MOCK_AI) return 'mock';
    
    for (const provider of this.PREFERRED_PROVIDERS) {
      if (this.PROVIDERS[provider].enabled()) {
        return provider;
      }
    }
    return 'mock'; // Fallback to mock if no providers available
  },
  
  // Check if we should use mock AI
  get shouldUseMockAI() {
    return this.USE_MOCK_AI || this.activeProvider === 'mock';
  }
};

// Helper function to check if we should use mock AI
export function shouldUseMockAI(): boolean {
  return AI_CONFIG.shouldUseMockAI;
}

// Get active AI provider info
export function getActiveProvider() {
  const provider = AI_CONFIG.activeProvider;
  if (provider === 'mock') {
    return { name: 'Mock AI', free: true };
  }
  return AI_CONFIG.PROVIDERS[provider as keyof typeof AI_CONFIG.PROVIDERS];
}