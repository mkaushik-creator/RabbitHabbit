import { OnboardingInput, ContentGenerationResponse } from "@shared/schema";
import { AIChatRequest, AIChatResponse } from "./aiChat";

// Mock content templates for different platforms and tones
const contentTemplates = {
  instagram: {
    professional: [
      "Sharing insights from today's work session. Sometimes the best solutions come from stepping back and looking at the bigger picture. What's your approach to problem-solving?",
      "Excited to announce our latest project milestone! Hard work and dedication always pay off. Grateful for the amazing team that makes it all possible.",
      "Monday motivation: Every expert was once a beginner. Keep pushing forward, embrace the learning process, and celebrate small wins along the way."
    ],
    casual: [
      "Just finished an amazing coffee and feeling ready to tackle the day! ☕ What's your go-to morning ritual?",
      "Weekend vibes: Sometimes the best ideas come when you're not actively looking for them. Nature walks are my secret weapon for creativity.",
      "That moment when everything just clicks... Anyone else love those 'aha!' moments?"
    ],
    witty: [
      "My relationship with Monday: It's complicated. But hey, at least coffee exists! How do you make peace with the start of the week?",
      "Plot twist: I actually enjoy debugging code. There's something satisfying about solving puzzles, even when they're created by past me.",
      "Life hack: If you can't find the motivation, create the environment where motivation finds you. Works 60% of the time, every time."
    ]
  },
  twitter: {
    professional: [
      "Key insight: The best leaders listen more than they speak. Active listening builds trust and uncovers opportunities others miss.",
      "Productivity tip: Time blocking isn't just about scheduling work—it's about protecting your energy for what matters most.",
      "Innovation happens at the intersection of curiosity and persistence. What's driving your curiosity today?"
    ],
    casual: [
      "Current mood: Optimistically caffeinated and ready to make things happen ☕",
      "Reminder: You don't have to be perfect, you just have to be consistent. Small daily actions compound into big results.",
      "Sometimes the universe aligns perfectly and you get a green light at every intersection. Today feels like one of those days."
    ],
    witty: [
      "My code works on my machine. My machine works in my house. Therefore, my house is the only place my code works. This is fine.",
      "Breaking: Local person discovers that taking breaks actually increases productivity. Scientists everywhere are shocked.",
      "I told my computer a joke about UDP, but it didn't get it. I told it a TCP joke, and it asked me to repeat it."
    ]
  },
  linkedin: {
    professional: [
      "Leadership lesson: The most successful teams aren't necessarily the most talented—they're the most aligned. When everyone understands the vision and their role in achieving it, magic happens.",
      "Reflecting on career growth: The skills that got you here won't necessarily get you there. Continuous learning and adaptability are your best investments.",
      "Industry insight: Companies that prioritize employee development see 34% higher retention rates. Investing in people isn't just good business—it's essential business."
    ],
    casual: [
      "Grateful for mentors who saw potential in me before I saw it in myself. Their belief became the foundation of my confidence. Who's been that person for you?",
      "Weekend project turned into a learning opportunity. Sometimes the best education comes from rolling up your sleeves and figuring it out as you go.",
      "Celebrating small wins today. Progress isn't always linear, but every step forward counts. What small victory are you celebrating?"
    ],
    witty: [
      "LinkedIn wisdom: Your network is your net worth. Also, your coffee consumption is directly proportional to your productivity. These are the facts.",
      "Career advice: Be yourself, unless you can be Batman. Then be Batman. (But seriously, authenticity is your superpower.)",
      "The secret to work-life balance: Realizing that some days work wins, some days life wins, and that's perfectly okay."
    ]
  }
};

const hashtagSets = {
  professional: ["#productivity", "#leadership", "#growth", "#innovation", "#success", "#teamwork", "#strategy"],
  casual: ["#motivation", "#inspiration", "#lifestyle", "#mindset", "#positivity", "#creativity", "#authentic"],
  witty: ["#humor", "#relatable", "#truth", "#mondaymood", "#worklife", "#funny", "#real"]
};

const imagePrompts = {
  professional: [
    "A clean, modern office workspace with natural lighting, minimalist desk setup, and plants",
    "Professional team meeting in a bright conference room with people collaborating",
    "Inspirational mountain landscape during sunrise symbolizing growth and achievement"
  ],
  casual: [
    "Cozy coffee shop scene with warm lighting and comfortable seating",
    "Person walking in nature on a peaceful trail surrounded by trees",
    "Beautiful sunset or sunrise over a calm lake reflecting golden light"
  ],
  witty: [
    "Funny office scene with cat sitting on laptop keyboard",
    "Creative workspace with colorful sticky notes and coffee mug",
    "Humorous representation of work-life balance with organized chaos"
  ]
};

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateHashtags(tone: string, platform: string, count: number = 5): string[] {
  const baseTags = hashtagSets[tone as keyof typeof hashtagSets] || hashtagSets.professional;
  const platformTags = {
    instagram: ["#instagood", "#photooftheday", "#instadaily"],
    twitter: ["#TwitterTips", "#ThoughtLeadership", "#Community"],
    linkedin: ["#ProfessionalGrowth", "#CareerAdvice", "#NetworkingTips"],
    facebook: ["#Community", "#Sharing", "#Connect"],
    tiktok: ["#ForYou", "#Trending", "#Creative"],
    youtube: ["#Content", "#Creator", "#Subscribe"]
  };
  
  const allTags = [...baseTags, ...(platformTags[platform as keyof typeof platformTags] || [])];
  const shuffled = [...allTags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function generateMockContent(preferences: OnboardingInput): Promise<ContentGenerationResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const response: ContentGenerationResponse = {};
  const tone = preferences.tone || 'professional';
  
  preferences.platforms.forEach(platform => {
    const platformKey = platform.toLowerCase();
    const templates = contentTemplates[platformKey as keyof typeof contentTemplates] || contentTemplates.instagram;
    const toneTemplates = templates[tone as keyof typeof templates] || templates.professional;
    
    const content = getRandomItem(toneTemplates);
    const hashtags = generateHashtags(tone, platformKey);
    const imagePrompt = getRandomItem(imagePrompts[tone as keyof typeof imagePrompts] || imagePrompts.professional);
    
    response[platform] = {
      content,
      hashtags: hashtags.join(' '),
      imagePrompt
    };
  });
  
  return response;
}

export async function generateMockChatResponse(request: AIChatRequest): Promise<AIChatResponse> {
  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
  
  const userQuery = request.userQuery.toLowerCase();
  const platforms = request.platforms;
  
  let message = "";
  let suggestedContent: { platform: string; content: string; hashtags?: string }[] = [];
  
  // Generate contextual response based on user query
  if (userQuery.includes('help') || userQuery.includes('ideas')) {
    message = "I'd love to help you brainstorm some content ideas! Based on your platforms, here are some suggestions that could work well:";
  } else if (userQuery.includes('hashtag')) {
    message = "Great question about hashtags! Here are some platform-specific hashtag strategies:";
  } else if (userQuery.includes('schedule') || userQuery.includes('time')) {
    message = "Timing is crucial for social media success! Here are some optimal posting suggestions:";
  } else {
    message = "That's an interesting point! Let me share some thoughts and content ideas that might help:";
  }
  
  // Generate platform-specific suggestions
  platforms.forEach(platform => {
    const platformKey = platform.toLowerCase();
    const templates = contentTemplates[platformKey as keyof typeof contentTemplates] || contentTemplates.instagram;
    const content = getRandomItem(templates.professional);
    const hashtags = generateHashtags('professional', platformKey, 3);
    
    suggestedContent.push({
      platform,
      content,
      hashtags: hashtags.join(' ')
    });
  });
  
  return {
    message,
    suggestedContent
  };
}

export async function generateMockImage(prompt: string): Promise<string> {
  // Simulate image generation delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  console.log('🎨 Mock AI generating contextual image for prompt:', prompt.substring(0, 100) + '...');
  
  // Generate contextually relevant placeholder based on prompt keywords
  let imageUrl = '';
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('chase') || promptLower.includes('chased') || promptLower.includes('chasing')) {
    if (promptLower.includes('idea') || promptLower.includes('innovation') || promptLower.includes('thought')) {
      imageUrl = `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center`; // Person brainstorming/thinking
    } else {
      imageUrl = `https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=center`; // Running person
    }
  } else if (promptLower.includes('dog') || promptLower.includes('puppy')) {
    imageUrl = `https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=center`; // Running with dogs
  } else if (promptLower.includes('animal') || promptLower.includes('welfare') || promptLower.includes('pet')) {
    imageUrl = `https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop&crop=center`; // Animal care
  } else if (promptLower.includes('food') || promptLower.includes('cook') || promptLower.includes('recipe')) {
    imageUrl = `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center`; // Food
  } else if (promptLower.includes('travel') || promptLower.includes('vacation') || promptLower.includes('explore')) {
    imageUrl = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop&crop=center`; // Travel
  } else if (promptLower.includes('work') || promptLower.includes('office') || promptLower.includes('business')) {
    imageUrl = `https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=400&h=400&fit=crop&crop=center`; // Business
  } else if (promptLower.includes('fitness') || promptLower.includes('gym') || promptLower.includes('exercise')) {
    imageUrl = `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center`; // Fitness
  } else if (promptLower.includes('nature') || promptLower.includes('outdoor') || promptLower.includes('hike')) {
    imageUrl = `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop&crop=center`; // Nature
  } else if (promptLower.includes('tech') || promptLower.includes('code') || promptLower.includes('computer')) {
    imageUrl = `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&fit=crop&crop=center`; // Technology
  } else {
    // Default contextual fallback - still better than random
    const imageId = Math.floor(Math.random() * 100) + 1;
    imageUrl = `https://picsum.photos/400/400?random=${imageId}`;
  }
  
  console.log('✅ Mock AI generated contextual image:', imageUrl);
  return imageUrl;
}