import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { onboardingInputSchema, contentGenerationResponseSchema } from "@shared/schema";
import { generateMultiPlatformContent, generateChatResponse, generateImage, getCurrentAIProvider } from "./services/aiRouter";
import { simulatePostToSocialMedia, AIChatRequest } from "./services/aiChat";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { WebSocketServer } from 'ws';

export async function registerRoutes(app: Express): Promise<Server> {
  // Test route to verify external access
  app.get("/api/test", (req, res) => {
    console.log("Test route accessed from:", req.get('host'));
    res.json({ message: "External access working", host: req.get('host') });
  });

  // Set up authentication FIRST (including session middleware)
  setupAuth(app);

  // Google OAuth callback route - AFTER session setup
  app.get('/auth/google/callback',
    (req: any, res: any, next: any) => {
      console.log("🎯 CALLBACK HIT:", req.originalUrl);
      console.log("🎯 Query params:", req.query);
      console.log("🎯 Headers:", { host: req.get('host'), referer: req.get('referer') });
      next();
    },
    passport.authenticate('google', { 
      failureRedirect: '/login?error=oauth_failed'
    }),
    (req: any, res: any) => {
      // Custom redirect logic to ensure proper navigation
      console.log("🎯 OAuth success, redirecting to home page");
      res.redirect('/'); // Redirect to home page instead of dashboard
    }
  );

  // OAuth configuration page with detailed troubleshooting
  app.get("/oauth-config", (req, res) => {
    const currentHost = req.get('host');
    const callbackUrl = `https://${currentHost}/auth/google/callback`;
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Google OAuth Configuration</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .url-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .url { font-family: 'Monaco', 'Menlo', monospace; font-size: 14px; word-break: break-all; color: #0066cc; }
            .step { margin: 15px 0; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; }
            .success { color: #155724; background: #d4edda; border-left: 4px solid #28a745; }
            .copy-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px; }
            .copy-btn:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔧 Google OAuth Configuration</h1>
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <strong>⚠️ REDIRECT URI MISMATCH ERROR DETECTED</strong><br>
                This means the callback URL in Google Console doesn't match the current domain.
            </div>
            <p>Follow these steps to fix the "Error 400: redirect_uri_mismatch":</p>
            
            <h2>📋 Callback URL to Add</h2>
            <div class="url-box">
                <div class="url" id="callbackUrl">${callbackUrl}</div>
                <button class="copy-btn" onclick="copyToClipboard()">Copy URL</button>
            </div>
            
            <div style="background: #e3f2fd; border: 1px solid #1976d2; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <strong>🔑 SETTING UP NEW GOOGLE OAUTH CLIENT</strong><br>
                Creating fresh credentials will eliminate any configuration issues.<br>
                <br>
                <strong>Callback URL for new client:</strong><br>
                <code>${callbackUrl}</code><br>
                <br>
                <strong>STEPS:</strong> Create new OAuth client and use the URL above as the redirect URI.
            </div>
            
            <h2>🔗 Google Console Steps</h2>
            <div class="step">
                <strong>1.</strong> Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Google Cloud Console</a>
            </div>
            <div class="step">
                <strong>2.</strong> Select your project
            </div>
            <div class="step">
                <strong>3.</strong> Click "CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
            </div>
            <div class="step">
                <strong>4.</strong> Choose "Web application" as application type
            </div>
            <div class="step">
                <strong>5.</strong> In "Authorized redirect URIs" section:
                <ul>
                    <li><strong>ADD:</strong> <code>${callbackUrl}</code></li>
                </ul>
            </div>
            <div class="step success">
                <strong>6.</strong> Click <strong>CREATE</strong> and copy the Client ID and Client Secret
            </div>
            <div class="step success">
                <strong>7.</strong> Update your environment secrets with the new credentials
            </div>
            <div class="step important" style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 10px 0;">
                <strong>8. IMPORTANT:</strong> Delete the old OAuth client to avoid conflicts:
                <ul>
                    <li>Find: <code>647150764797-5m5uk6h4gie50l0h1a7pbav9vh0cuh48.apps.googleusercontent.com</code></li>
                    <li>Click delete/trash icon to remove it completely</li>
                    <li>This prevents caching conflicts between old and new credentials</li>
                </ul>
            </div>
            
            <h2>📊 Configuration for New OAuth Client</h2>
            <div style="background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p><strong>Current Domain:</strong> <code>${currentHost}</code></p>
                <p><strong>Required Callback URL:</strong> <code>${callbackUrl}</code></p>
                <p><strong>Application Type:</strong> Web application</p>
                <p><strong>Environment Secrets to Update:</strong></p>
                <ul>
                    <li>GOOGLE_CLIENT_ID</li>
                    <li>GOOGLE_CLIENT_SECRET</li>
                </ul>
            </div>
            
            <h2>🧪 Test the Fix</h2>
            <p>After updating Google Console (wait 2-3 minutes for changes to propagate):</p>
            <ol>
                <li>Go to the <a href="/login">Login Page</a></li>
                <li>Click "Sign in with Google"</li>
                <li>Complete Google OAuth flow</li>
                <li>Should redirect to Dashboard successfully</li>
            </ol>
            
            <h2>🔍 Troubleshooting redirect_uri_mismatch</h2>
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p><strong>If you're still getting the error after adding the URL:</strong></p>
                <ol>
                    <li><strong>Wait 5 minutes</strong> - Google changes can take time to propagate</li>
                    <li><strong>Clear browser cache</strong> or use incognito mode</li>
                    <li><strong>Check for typos</strong> - The URL must match exactly (including https://)</li>
                    <li><strong>Verify in Google Console</strong> - Refresh the page to confirm your changes saved</li>
                </ol>
            </div>
            
            <h2>⚡ Troubleshooting Steps</h2>
            <div style="background: #e3f2fd; border: 1px solid #1976d2; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p><strong>Since the URL is correct, try these steps:</strong></p>
                <ol>
                    <li><strong>Wait 5-10 minutes</strong> for Google's changes to fully propagate</li>
                    <li><strong>Clear your browser cache</strong> completely</li>
                    <li><strong>Try in incognito/private mode</strong> to avoid cached OAuth states</li>
                    <li><strong>Check for extra characters</strong> - ensure no hidden spaces in Google Console URL</li>
                </ol>
            </div>
            <a href="/login" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Test Google Login Now</a>
            
            <h2>🔧 Still Not Working?</h2>
            <p>If the error persists after waiting and clearing cache, there might be a Google Console propagation delay. This can take up to 10 minutes in some cases.</p>
        </div>
        
        <script>
            function copyToClipboard() {
                const text = document.getElementById('callbackUrl').textContent;
                navigator.clipboard.writeText(text).then(() => {
                    const btn = document.querySelector('.copy-btn');
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    btn.style.background = '#28a745';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '#007bff';
                    }, 2000);
                });
            }
        </script>
    </body>
    </html>`;
    res.send(html);
  });
  
  // Debug endpoint to check OAuth configuration
  app.get("/api/oauth/debug", (req, res) => {
    const currentHost = req.get('host');
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const fullUrl = `${protocol}://${currentHost}`;
    
    res.json({
      environment: process.env.NODE_ENV,
      host: currentHost,
      protocol: protocol,
      fullUrl: fullUrl,
      callbackUrl: `${fullUrl}/auth/google/callback`,
      googleClientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "...",
      replit: {
        slug: process.env.REPL_SLUG,
        owner: process.env.REPL_OWNER,
        devDomain: process.env.REPLIT_DEV_DOMAIN
      },
      headers: {
        host: req.get('host'),
        origin: req.get('origin'),
        referer: req.get('referer')
      }
    });
  });

  // Serve static debug page
  app.get("/oauth-debug", (req, res) => {
    res.sendFile(process.cwd() + "/oauth-debug.html");
  });

  // Quick test page
  app.get("/test-oauth", (req, res) => {
    res.sendFile(process.cwd() + "/quick-test.html");
  });
  
  // Complete onboarding - save user preferences
  app.post("/api/complete-onboarding", async (req, res) => {
    try {
      // Validate the input data
      const validatedData = onboardingInputSchema.parse(req.body);
      const { contentType, audience, tone, platforms, imageOption, customKeywords } = validatedData;

      // Save preferences to storage
      const preferences = await storage.createContentPreferences({
        userId: req.user?.id || null,
        contentType,
        audience,
        tone,
        platforms,
        imageOption
      });

      console.log("Onboarding completed for user:", req.user?.id || "anonymous");
      console.log("Preferences saved:", preferences);

      return res.json({
        success: true,
        message: "Onboarding completed successfully",
        preferences
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.toString() });
      }
      
      console.error("Onboarding completion error:", error);
      return res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });
  
  // Generate content from preferences
  app.post("/api/generate-content", async (req, res) => {
    try {
      // Validate the input data
      const validatedData = onboardingInputSchema.parse(req.body);
      const { contentType, audience, tone, platforms, imageOption, customKeywords } = validatedData;

      // Generate content using OpenAI
      const generatedContent = await generateMultiPlatformContent({
        contentType,
        audience, 
        tone,
        platforms,
        imageOption,
        customKeywords
      });

      // Save preferences and content to storage
      const preferences = await storage.createContentPreferences({
        userId: req.user?.id || null,
        contentType,
        audience,
        tone,
        platforms,
        imageOption
      });

      // Save each platform's content
      await Promise.all(
        Object.entries(generatedContent).map(async ([platform, contents]) => {
          if (contents && contents.length > 0) {
            for (const content of contents) {
              await storage.createGeneratedContent({
                userId: req.user?.id || null,
                preferencesId: preferences.id,
                platform,
                content: content.content,
                imageUrl: null, // Will be generated separately
                hashtags: content.hashtags || null,
                additionalData: { imagePrompt: content.imagePrompt },
                scheduled: false,
                scheduledFor: null,
                published: false
              });
            }
          }
        })
      );

      return res.json(generatedContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedError = fromZodError(error as z.ZodError);
        return res.status(400).json({ message: "Invalid input data", details: formattedError });
      }
      
      console.error("Content generation error:", error);
      return res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Get content history
  app.get("/api/content-history", async (req, res) => {
    try {
      const history = await storage.getContentHistory();
      return res.json(history);
    } catch (error) {
      console.error("Error fetching content history:", error);
      return res.status(500).json({ message: "Failed to fetch content history" });
    }
  });

  // AI Chat - Generate response
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const chatRequest: AIChatRequest = req.body;
      
      // Validate the input
      if (!chatRequest.messages || !chatRequest.platforms || !chatRequest.userQuery) {
        return res.status(400).json({ 
          message: "Invalid request. Must include messages, platforms, and userQuery." 
        });
      }
      
      // Generate AI chat response
      const response = await generateChatResponse(chatRequest);
      return res.json(response);
    } catch (error) {
      console.error("AI chat error:", error);
      return res.status(500).json({ 
        message: "Failed to generate chat response",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Generate Image from AI response with contextual information
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, userQuery, aiResponse } = req.body;
      
      console.log('🚀 Contextual image generation request:');
      console.log('📝 userQuery:', userQuery);
      console.log('🤖 aiResponse length:', aiResponse?.length || 0);
      console.log('⚡ fallback prompt:', prompt);
      
      // Build contextual prompt - PRIORITIZE USER'S ORIGINAL INPUT
      let finalPrompt = '';
      let contextSource = '';
      
      if (userQuery && userQuery.trim() && userQuery.trim().length > 3) {
        // Use user's exact original input - this is the most important context
        finalPrompt = `A realistic, high-quality social media image showing: ${userQuery.trim()}. Bright, vibrant colors, professional photography style, suitable for social platforms.`;
        contextSource = 'user query';
        console.log('✅ PRIMARY: Using user original input for image context');
      } else if (aiResponse && aiResponse.trim()) {
        // Extract meaningful content from AI response
        const cleanResponse = aiResponse.replace(/\*\*/g, '').replace(/[#@]\w+/g, '').replace(/https?:\/\/\S+/g, '').trim();
        const sentences = cleanResponse.split(/[.!?]/);
        const firstMeaningfulSentence = sentences.find(s => s.trim().length > 20) || sentences[0] || cleanResponse.substring(0, 100);
        finalPrompt = `A realistic, high-quality social media image depicting: ${firstMeaningfulSentence.trim()}. Professional, vibrant, engaging composition suitable for social platforms.`;
        contextSource = 'AI response';
        console.log('🔄 SECONDARY: Using AI response for context:', firstMeaningfulSentence.substring(0, 50) + '...');
      } else if (prompt && prompt.trim()) {
        // Final fallback
        finalPrompt = prompt.trim();
        contextSource = 'fallback prompt';
        console.log('⚠️ FALLBACK: Using basic prompt');
      } else {
        return res.status(400).json({ 
          error: 'No content provided for image generation' 
        });
      }

      console.log('🎨 Final contextual prompt:', finalPrompt.substring(0, 120) + '...');
      console.log('📊 Context source:', contextSource);
      
      const imageUrl = await generateImage(finalPrompt);
      
      if (!imageUrl) {
        return res.status(500).json({ 
          error: 'Failed to generate image',
          message: 'Image generation service returned no result'
        });
      }

      console.log('✅ Contextual image generated successfully:', imageUrl.substring(0, 50) + '...');

      res.json({ 
        imageUrl,
        prompt: finalPrompt.substring(0, 100) + (finalPrompt.length > 100 ? '...' : ''),
        context: contextSource,
        userInput: userQuery || 'not provided',
        success: true
      });
    } catch (error) {
      console.error('❌ Error generating contextual image:', error);
      res.status(500).json({ 
        error: 'Failed to generate image',
        message: error.message || 'Unknown error occurred'
      });
    }
  });

  // Enhance user input with AI suggestion
  app.post("/api/enhance-input", async (req, res) => {
    try {
      const { originalInput, suggestion, tone, format, niche } = req.body;
      
      if (!originalInput || !suggestion) {
        return res.status(400).json({ 
          success: false,
          message: "Original input and suggestion are required" 
        });
      }
      
      const enhancementPrompts = {
        'Emphasize nostalgia and memories': `Rewrite this input to emphasize vivid nostalgic memories and emotional depth: "${originalInput}"`,
        'Add specific location details': `Rewrite this input to include rich location and environmental context: "${originalInput}"`,
        'Focus on emotional contrast': `Rewrite this input to emphasize emotional contrasts and feelings: "${originalInput}"`,
        'Describe taste and texture': `Rewrite this input to include detailed sensory descriptions of taste and texture: "${originalInput}"`,
        'Add cultural significance': `Rewrite this input to include cultural context and significance: "${originalInput}"`,
        'Focus on visual appeal': `Rewrite this input to emphasize visual details and aesthetic appeal: "${originalInput}"`,
        'Share specific moments': `Rewrite this input to focus on specific moments and interactions: "${originalInput}"`,
        'Focus on cultural differences': `Rewrite this input to highlight cultural differences and perspectives: "${originalInput}"`,
        'Describe sensory details': `Rewrite this input to include vivid sensory descriptions: "${originalInput}"`,
        'Add specific details': `Rewrite this input to include specific details about when, where, and why: "${originalInput}"`,
        'Include personal emotions': `Rewrite this input to include personal emotions and thoughts: "${originalInput}"`,
        'Focus on unique moments': `Rewrite this input to emphasize what made this moment unique: "${originalInput}"`
      };

      const enhancementPrompt = enhancementPrompts[suggestion] || `Enhance and expand this input: "${originalInput}"`;
      
      // Create a simpler request for input enhancement
      const enhancementRequest = {
        messages: [],
        platforms: ['general'],
        userQuery: enhancementPrompt,
        tone: tone || 'Professional',
        format: format || 'paragraph',
        niche: niche || 'general',
        includeEmojis: false,
        emojiPack: 'mixed',
        length: 'medium'
      };

      // Generate enhanced input using AI
      const chatResponse = await generateChatResponse(enhancementRequest);
      
      // Extract the enhanced input from the response
      const enhancedInput = chatResponse.message || originalInput;
      
      return res.json({
        success: true,
        enhancedInput: enhancedInput,
        originalInput: originalInput,
        suggestion: suggestion
      });
    } catch (error) {
      console.error("Error enhancing input:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to enhance input",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Post to platform - Save post to database
  app.post("/api/post-to-platform", async (req, res) => {
    try {
      const { content, platforms, scheduledFor } = req.body;
      
      if (!content || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Content and platforms array are required" 
        });
      }
      
      // Create a post record in the database
      const postData = {
        userId: req.user?.id || null,
        content: content.trim(),
        platforms: platforms,
        status: "posted" as const,
        scheduledFor: scheduledFor || null
      };
      
      // Save to post history
      const savedPost = await storage.createPost(postData);
      
      console.log(`Post saved to database:`, savedPost);
      
      // Simulate posting to each platform
      const platformResults = [];
      for (const platform of platforms) {
        try {
          await simulatePostToSocialMedia(platform, content);
          platformResults.push({ platform, success: true });
        } catch (error) {
          platformResults.push({ platform, success: false, error: error.message });
        }
      }
      
      return res.json({
        success: true,
        message: `Successfully posted to ${platforms.join(', ')}`,
        post: savedPost,
        platformResults
      });
    } catch (error) {
      console.error("Error posting to platform:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to post to platform",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get post history - Fetch user's post history
  app.get("/api/post-history", async (req, res) => {
    try {
      const userId = req.user?.id || null;
      
      // Fetch post history from database
      const posts = await storage.getPostHistory();
      
      // Transform posts to match frontend interface
      const transformedPosts = posts.map(post => ({
        id: post.id.toString(),
        content: post.content,
        platforms: post.platforms,
        status: post.status,
        timestamp: new Date(post.createdAt).toLocaleString(),
        scheduled: post.scheduledFor ? new Date(post.scheduledFor).toLocaleString() : undefined
      }));
      
      return res.json(transformedPosts);
    } catch (error) {
      console.error("Error fetching post history:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to fetch post history",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Schedule post - Save scheduled post to database
  app.post("/api/schedule-post", async (req, res) => {
    try {
      const { platforms, content, scheduledFor } = req.body;
      
      if (!platforms || !content || !scheduledFor) {
        return res.status(400).json({ 
          success: false,
          message: "Platforms, content, and scheduledFor are required" 
        });
      }
      
      // Create scheduled post records in the database
      const postData = {
        userId: req.user?.id || null,
        content: content.trim(),
        platforms: Array.isArray(platforms) ? platforms : [platforms],
        status: "scheduled" as const,
        scheduledFor: new Date(scheduledFor)
      };
      
      const savedPost = await storage.createPost(postData);
      
      console.log(`Scheduled post saved to database:`, savedPost);
      
      return res.json({
        success: true,
        message: `Successfully scheduled post for ${platforms.length > 1 ? 'multiple platforms' : platforms[0]}`,
        post: savedPost
      });
    } catch (error) {
      console.error("Error scheduling post:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to schedule post",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get AI provider status - Show which AI service is currently active
  app.get("/api/ai-status", (req, res) => {
    try {
      const providerInfo = getCurrentAIProvider();
      
      return res.json({
        success: true,
        provider: providerInfo.provider,
        name: providerInfo.info.name,
        isFree: providerInfo.info.free,
        status: providerInfo.provider === 'mock' ? 'fallback' : 'active'
      });
    } catch (error) {
      console.error("Error getting AI provider status:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get AI provider status",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Generate image using AI
  app.post("/api/generate-image", async (req, res) => {
    console.log("🚀 POST /api/generate-image - Request received");
    console.log("Request body:", req.body);
    
    try {
      const { prompt, userQuery, aiResponse } = req.body;
      
      // Create contextual image prompt from available information
      let imagePrompt = '';
      
      if (userQuery && userQuery.trim()) {
        // Use user's original query as the primary context
        imagePrompt = `A realistic, high-quality social media image depicting: ${userQuery.trim()}. Professional, vibrant, engaging composition suitable for social platforms.`;
        console.log("🎯 Using user query for image context:", userQuery.trim());
      } else if (aiResponse && aiResponse.trim()) {
        // Extract key concepts from AI response
        const cleanResponse = aiResponse.replace(/[#@]\w+/g, '').replace(/https?:\/\/\S+/g, '').trim();
        const firstSentence = cleanResponse.split('.')[0] || cleanResponse.substring(0, 150);
        imagePrompt = `A realistic, high-quality social media image illustrating: ${firstSentence}. Professional, vibrant, engaging composition suitable for social platforms.`;
        console.log("🤖 Using AI response for image context:", firstSentence);
      } else if (prompt && prompt.trim()) {
        // Fallback to provided prompt
        imagePrompt = `A realistic, high-quality social media image: ${prompt.trim()}. Professional, vibrant, engaging composition suitable for social platforms.`;
        console.log("📝 Using provided prompt for image context:", prompt.trim());
      } else {
        console.log("❌ No valid context provided for image generation");
        return res.status(400).json({ 
          success: false,
          message: "Please provide either a prompt, user query, or AI response for contextual image generation" 
        });
      }

      console.log("🎨 Final image prompt:", imagePrompt.substring(0, 100) + "...");
      console.log("🔄 Calling AI image generation...");
      
      // Use the AI router for image generation
      const imageUrl = await generateImage(imagePrompt);
      
      if (imageUrl) {
        console.log("✅ Image generated successfully, sending response");
        return res.json({ 
          success: true, 
          imageUrl,
          prompt: imagePrompt.substring(0, 100) + (imagePrompt.length > 100 ? '...' : ''),
          context: userQuery || aiResponse || prompt
        });
      } else {
        console.log("❌ Image generation returned null/empty");
        return res.status(500).json({ 
          success: false,
          message: "Failed to generate contextual image. Please try a different description." 
        });
      }
    } catch (error: any) {
      console.error("❌ Image generation error:", error);
      
      // Provide more specific error messages based on error type
      let errorMessage = "Failed to generate image";
      if (error.message?.includes('content policy') || error.status === 400) {
        errorMessage = "The image prompt may violate content guidelines. Please try a different description.";
      } else if (error.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again in a few moments.";
      } else if (error.status === 401) {
        errorMessage = "API authentication failed. Please check configuration.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return res.status(500).json({ 
        success: false,
        message: errorMessage 
      });
    }
  });

  // Post to platform
  app.post("/api/post-to-platform", async (req, res) => {
    try {
      const { platform, content } = req.body;
      
      if (!platform || !content) {
        return res.status(400).json({ message: "Platform and content are required" });
      }
      
      // In a real application, this would connect to the platform's API
      const success = await simulatePostToSocialMedia(platform, content);
      
      if (success) {
        // Save to history
        // If we don't have a preferencesId, use 0 as a placeholder for AI chat content
        await storage.createGeneratedContent({
          userId: req.user?.id || null,
          preferencesId: 0, // Use 0 for AI chat content that doesn't have preferences
          platform,
          content,
          imageUrl: null,
          hashtags: null,
          additionalData: { source: "ai-chat" },
          scheduled: false,
          scheduledFor: null,
          published: true
        });
        
        return res.json({ success: true, message: `Posted to ${platform} successfully!` });
      } else {
        return res.status(500).json({ message: `Failed to post to ${platform}` });
      }
    } catch (error) {
      console.error("Error posting to platform:", error);
      return res.status(500).json({ 
        message: "Failed to post content", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Platform status endpoint - check which platforms have credentials configured
  app.get("/api/platform-status", (req, res) => {
    const platformStatus = {
      twitter: {
        hasCredentials: !!(process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET),
        connected: false // TODO: Check if user has connected this platform
      },
      instagram: {
        hasCredentials: !!(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET),
        connected: false
      },
      linkedin: {
        hasCredentials: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
        connected: false
      },
      tiktok: {
        hasCredentials: !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET),
        connected: false
      },
      facebook: {
        hasCredentials: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
        connected: false
      },
      youtube: {
        hasCredentials: !!(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET),
        connected: false
      }
    };

    res.json(platformStatus);
  });

  // Platform disconnection endpoint
  app.post("/api/platforms/:platformId/disconnect", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { platformId } = req.params;
    
    // TODO: Implement actual platform disconnection logic
    // For now, just return success
    res.json({ success: true, message: `Disconnected from ${platformId}` });
  });

  // Get user's post history endpoint
  app.get("/api/post-history", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get posts from posts table for the authenticated user
      const posts = await storage.getPostsByUserId(req.user.id);
      
      // Transform posts to match the expected frontend format
      const transformedHistory = posts.map((post) => {
        // Format timestamp in IST (UTC+5:30)
        const timestamp = new Date(post.createdAt).toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return {
          id: `post-${post.id}`,
          content: post.content,
          platforms: post.platforms,
          status: post.status,
          timestamp,
          scheduled: post.scheduledFor ? 
            new Date(post.scheduledFor).toLocaleDateString('en-IN', {
              timeZone: 'Asia/Kolkata',
              weekday: 'long',
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : undefined
        };
      });

      res.json(transformedHistory);
    } catch (error) {
      console.error("Error fetching post history:", error);
      res.status(500).json({ message: "Failed to fetch post history" });
    }
  });

  // Dashboard route for OAuth success
  app.get("/dashboard", (req, res) => {
    console.log("🎯 Dashboard accessed");
    console.log("🎯 User:", req.user);
    console.log("🎯 Authenticated:", req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dashboard - RabbitHabbit</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
            .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>🎉 Welcome, ${req.user?.displayName || 'User'}!</h1>
            <p><strong>Google OAuth login successful!</strong></p>
            <p><strong>Email:</strong> ${req.user?.emails?.[0]?.value || 'N/A'}</p>
            <p><strong>ID:</strong> ${req.user?.id || 'N/A'}</p>
            <hr>
            <a href="/" class="btn">Go to RabbitHabbit App</a>
            <a href="/logout" class="btn" style="background: #dc3545;">Logout</a>
          </div>
        </body>
      </html>
    `);
  });

  // Logout route
  app.get("/logout", (req, res) => {
    req.logout((err) => {
      if (err) console.error("Logout error:", err);
      res.redirect('/');
    });
  });

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', async (message) => {
      try {
        // Parse the incoming message
        const data = JSON.parse(message.toString());
        
        if (data.type === 'chat') {
          // Process chat message
          const chatResponse = await generateChatResponse({
            messages: data.messages,
            platforms: data.platforms,
            userQuery: data.userQuery
          });
          
          // Send response back to client
          if (ws.readyState === 1) { // WebSocket.OPEN
            ws.send(JSON.stringify({
              type: 'chat_response',
              data: chatResponse
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        if (ws.readyState === 1) { // WebSocket.OPEN
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process message'
          }));
        }
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
