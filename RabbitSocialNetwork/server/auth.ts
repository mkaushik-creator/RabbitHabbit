import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { VerifyCallback } from "passport-oauth2";
import { AuthUser, AuthProvider } from "./types/auth";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Properly type the promisified scrypt function
const scryptAsync = promisify<(password: string | Buffer, salt: string | Buffer, keylen: number, callback: (err: Error | null, derivedKey: Buffer) => void) => void>(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
const buf = await scryptAsync(password, salt, 64, (err, key) => {});
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64, (err, key) => {});
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

const PostgresStore = connectPg(session as any);

declare global {
  namespace Express {
    // Extend Express User interface with our AuthUser type
    interface User extends AuthUser {}
  }
}

declare module "express-session" {
  interface SessionData {
    returnUrl?: string;
  }
}

export function setupAuth(app: Express) {
  // Set up session store
  const sessionStore = new PostgresStore({
    pool,
    tableName: "session",
    createTableIfMissing: true,
  });

  // Configure session middleware
  const sessionConfig = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: false, // Set to false for Replit development
      httpOnly: true,
      sameSite: "lax",
    },
  };

  // Set up session and passport
  app.use(session(sessionConfig) as Express.RequestHandler);
  app.use(passport.initialize() as Express.RequestHandler);
  app.use(passport.session() as Express.RequestHandler);

  // Configure OAuth Strategies
  // Use current dev domain for OAuth since that's what Google Console is configured for
  const getHost = () => {
    // Production deployment URL - when deployed to Replit
    if (process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT) {
      const prodHost = "https://rabbithabbit.replit.app";
      console.log("🚀 Using production domain for OAuth:", prodHost);
      return prodHost;
    }
    
    // Development domain (current session)
    if (process.env.REPLIT_DEV_DOMAIN) {
      const devHost = `https://${process.env.REPLIT_DEV_DOMAIN}`;
      console.log("🛠️ Using current dev domain for OAuth:", devHost);
      return devHost;
    }
    
    // Fallback to stable .replit.app domain
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      const replitAppHost = `https://${process.env.REPL_SLUG}--${process.env.REPL_OWNER}.replit.app`;
      console.log("Fallback to stable .replit.app domain for OAuth:", replitAppHost);
      return replitAppHost;
    }
    
    // Check if we have REPLIT_URLS environment variable (newer format)
    if (process.env.REPLIT_URLS) {
      try {
        const urls = JSON.parse(process.env.REPLIT_URLS);
        if (urls && urls.length > 0) {
          console.log("Using REPLIT_URLS:", urls[0]);
          return urls[0];
        }
      } catch (e) {
        console.log("Error parsing REPLIT_URLS:", e);
      }
    }
    
    // Fallback to dev domain if others don't work
    if (process.env.REPLIT_DEV_DOMAIN) {
      const devHost = `https://${process.env.REPLIT_DEV_DOMAIN}`;
      console.log("Using current dev domain:", devHost);
      return devHost;
    }
    
    // Check for custom domain
    if (process.env.REPLIT_DOMAIN) {
      return `https://${process.env.REPLIT_DOMAIN}`;
    }
    
    // Fallback for development
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    return process.env.NODE_ENV === 'production'
      ? 'https://your-app.replit.app'
      : `http://localhost:${port}`;
  };
  
  const host = getHost();
  console.log(`OAuth host configured as: ${host}`);
  console.log(`Google Client ID: ${process.env.GOOGLE_CLIENT_ID?.substring(0, 20)}...`);
  console.log(`Google Client Secret exists: ${!!process.env.GOOGLE_CLIENT_SECRET}`);
  console.log(`OAuth Callback URL will be: ${host}/auth/google/callback`);
  console.log(`⚠️  IMPORTANT: Update Google Console redirect URIs to include:`);
  console.log(`   ${host}/auth/google/callback`);
  console.log(`   Current domain: ${process.env.REPLIT_DEV_DOMAIN}`);
  
  // Also log environment variables for debugging
  console.log("Environment debug:");
  console.log(`REPL_SLUG: ${process.env.REPL_SLUG}`);
  console.log(`REPL_OWNER: ${process.env.REPL_OWNER}`);
  console.log(`REPLIT_URLS: ${process.env.REPLIT_URLS}`);
  console.log(`REPLIT_DEV_DOMAIN: ${process.env.REPLIT_DEV_DOMAIN}`);

  // Local Strategy for email/password authentication
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email: string, password: string, done: (error: any, user?: any, options?: any) => void) => {
        try {
          console.log("Local authentication attempt for email:", email);
          
          // Find user by email
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (!user) {
            console.log("User not found for email:", email);
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Check if user has a password (not OAuth-only)
          if (!user.password) {
            console.log("User exists but has no password (OAuth user)");
            return done(null, false, { message: 'Please use OAuth to login' });
          }

          // Verify password
          const isValidPassword = await comparePasswords(password, user.password);
          if (!isValidPassword) {
            console.log("Invalid password for user:", email);
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Create AuthUser object
          const authUser: AuthUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            provider: "email",
          };

          console.log("Local authentication successful for user:", user.id);
          return done(null, authUser);
        } catch (error) {
          console.error("Local authentication error:", error);
          return done(error);
        }
      }
    )
  );
    
  // Google OAuth Strategy
  const googleClientId = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
    
  console.log(`Using Google Client ID: ${googleClientId.substring(0, 20)}...`);
  console.log(`Google OAuth Callback URL configured as: ${host}/auth/google/callback`);
  console.log("⚠️  CRITICAL: The callback URL above must EXACTLY match Google Console redirect URIs");
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: `${host}/auth/google/callback`,
        scope: ["profile", "email"],
      },
      (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        console.log("=== Google OAuth Strategy Callback ===");
        console.log("Google OAuth callback received for profile:", profile.id);
        console.log("Profile data:", { 
          id: profile.id, 
          displayName: profile.displayName, 
          email: profile.emails?.[0]?.value 
        });

        // Simple approach: just return the profile directly like in the attachment
        return done(null, profile);
      }


    )
  );

  // Twitter OAuth Strategy (conditional on credentials availability)
  if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    passport.use(
      new TwitterStrategy(
        {
          consumerKey: process.env.TWITTER_CONSUMER_KEY,
          consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
          callbackURL: `${host}/api/auth/twitter/callback`,
          includeEmail: true,
        },
        async (token: string, tokenSecret: string, profile: any, done: VerifyCallback) => {
          try {
            // Check if user already exists
            const [existingUser] = await db
              .select()
              .from(users)
              .where(eq(users.providerId, profile.id))
              .limit(1);

            if (existingUser) {
              // Update user's tokens if needed
              await db
                .update(users)
                .set({
                  accessToken: token,
                  refreshToken: tokenSecret, // Twitter uses token secret instead of refresh token
                  updatedAt: new Date(),
                })
                .where(eq(users.id, existingUser.id));

              const user: AuthUser = {
                id: existingUser.id,
                username: existingUser.username,
                email: existingUser.email,
                fullName: existingUser.fullName,
                avatar: existingUser.avatar,
                provider: "twitter",
              };
              return done(null, user);
            }

            // Create new user
            const email = profile.emails && profile.emails[0]?.value;
            const username = profile.username || `twitter_${profile.id}`;

            const [newUser] = await db
              .insert(users)
              .values({
                username,
                email: email || `${username}@twitter.placeholder`,
                fullName: profile.displayName,
                avatar: profile.photos?.[0]?.value,
                provider: "twitter",
                providerId: profile.id,
                accessToken: token,
                refreshToken: tokenSecret,
              })
              .returning();

            const user: AuthUser = {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              fullName: newUser.fullName,
              avatar: newUser.avatar,
              provider: "twitter",
            };
            return done(null, user);
          } catch (error) {
            return done(error, undefined);
          }
        }
      )
    );
  }

  // Simple session handling like in the attachment
  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user.displayName || user.email);
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    console.log("Deserializing user:", user.displayName || user.email);
    done(null, user);
  });

  // Add debug middleware for all auth routes
  app.use("/api/auth/*", (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    console.log(`🔍 AUTH ROUTE: ${req.method} ${(req as import('express').Request).originalUrl}`);
    console.log("Query params:", req.query);
    next();
  });

  // Authentication routes with proper logging
  app.get("/api/auth/google", (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
    console.log("✅ GET /api/auth/google - Google OAuth initiation");
    console.log("Host:", req.get('host'));
    console.log("Protocol:", req.headers['x-forwarded-proto'] || (req as any).protocol);
    console.log("Full URL:", `${req.headers['x-forwarded-proto'] || (req as any).protocol}://${req.headers.host}`);
    console.log("Expected callback:", `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/auth/google/callback`);
    console.log("Referer:", req.headers.referer);
    
    // Store the return URL for after authentication
const referer = req.headers.referer;
    if (referer && referer.includes('riker.replit.dev')) {
      (req.session as any).returnUrl = referer.replace(/\/[^\/]*$/, '/dashboard');
      console.log("Stored return URL:", (req.session as any).returnUrl);
    }
    
    next();
  }, passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account" // Forces Google to show account selection screen
}) as import('express').RequestHandler);

  console.log("✅ Google OAuth strategy configured successfully");

  // Google OAuth callback route
  app.get('/auth/google/callback',
    (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
      console.log("🎯 CALLBACK HIT:", (req as any).originalUrl);
      console.log("🎯 Query params:", req.query);
      console.log("🎯 Headers:", { host: req.headers.host, referer: req.headers.referer });
      next();
    },
    passport.authenticate('google', { 
      failureRedirect: '/login?error=oauth_failed'
    }) as import('express').RequestHandler,
    (req: import('express').Request, res: import('express').Response) => {
      // Get the return URL from session if available
      const returnUrl = (req.session as any).returnUrl || '/';
      console.log("🎯 OAuth success, redirecting to:", returnUrl);
      res.redirect(returnUrl);
    }
  );

  // User info route
  app.get("/api/auth/user", (req: import('express').Request, res: import('express').Response) => {
    console.log("=== User Info Route ===");
    console.log("Session:", req.session);
    console.log("User:", req.user);
    console.log("Authenticated:", req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      console.log("User not authenticated");
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    console.log("Returning user info:", req.user);
    res.json(req.user);
  });

  // Simple /user route as requested
  app.get('/user', (req: import('express').Request, res: import('express').Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    res.json({
      name: req.user.displayName,
      email: req.user.emails?.[0]?.value,
      picture: req.user.photos?.[0]?.value
    });
  });

  // Logout route
  app.post("/api/auth/logout", (req: import('express').Request, res: import('express').Response) => {
    console.log("=== Logout Route ===");
    console.log("User before logout:", req.user);
    
    req.logout((err: Error | null) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      
      console.log("User logged out successfully");
      res.json({ message: "Logged out successfully" });
    });
  });

  // Twitter authentication routes (conditional)
  if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    app.get(
      "/api/auth/twitter",
      passport.authenticate("twitter") as import('express').RequestHandler
    );

    app.get(
      "/api/auth/twitter/callback",
      passport.authenticate("twitter", {
        failureRedirect: "/login",
        successRedirect: "/dashboard",
      }) as import('express').RequestHandler
    );
  }

  // Email/password registration route
  app.post("/api/auth/register", async (req: import('express').Request, res: import('express').Response) => {
    try {
      const { email, password, fullName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Generate username from email
      const username = email.split("@")[0] + "-" + Math.floor(Math.random() * 1000);

      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          email,
          fullName: fullName || null,
          avatar: null,
          provider: "email",
          providerId: email, // Use email as provider ID for email users
          password: hashedPassword,
        })
        .returning();

      // Create AuthUser object
      const authUser: AuthUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        avatar: newUser.avatar,
        provider: "email",
      };

      // Log in the user
      req.login(authUser, (err: Error | null) => {
        if (err) {
          console.error("Registration login error:", err);
          return res.status(500).json({ error: "Failed to login after registration" });
        }
        console.log("User registered and logged in:", authUser.id);
        return res.status(201).json(authUser);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // Email/password login route
  app.post("/api/auth/login", passport.authenticate("local", { session: true }), (req: import('express').Request, res: import('express').Response) => {
    console.log("Login successful for user:", req.user?.id);
    res.status(200).json(req.user);
  });

  // Demo login route - creates a dummy session without OAuth
  app.post("/api/auth/demo-login", async (req: import('express').Request, res: import('express').Response) => {
    try {
      // Create a demo user if it doesn't exist
      const demoUsername = "demo_user";
      const [existingDemoUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, demoUsername))
        .limit(1);

      let demoUser;
      if (existingDemoUser) {
        demoUser = existingDemoUser;
      } else {
        // Create the demo user
        const [newDemoUser] = await db
          .insert(users)
          .values({
            username: demoUsername,
            email: "demo@rabbithabbit.app",
            fullName: "Demo User",
            avatar: null,
            provider: "demo",
            providerId: "demo_id",
          })
          .returning();
        demoUser = newDemoUser;
      }

      // Create user object matching AuthUser type
      const authUser: AuthUser = {
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
        fullName: demoUser.fullName,
        avatar: demoUser.avatar,
        provider: "demo" as AuthProvider,
      };

      // Log in the user
      req.login(authUser, (err: Error | null) => {
        if (err) {
          console.error("Demo login error:", err);
          return res.status(500).json({ error: "Failed to login with demo user" });
        }
        return res.status(200).json(authUser);
      });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ error: "Failed to create demo user" });
    }
  });

  app.get("/api/auth/logout", (req: import('express').Request, res: import('express').Response) => {
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.redirect("/login");
    });
  });

  // Debug endpoint to check OAuth configuration
  app.get("/api/auth/debug", (req: import('express').Request, res: import('express').Response) => {
    res.json({
      host,
      googleCallbackUrl: `${host}/api/auth/google/callback`,
      hasGoogleCredentials: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      hasTwitterCredentials: !!(process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET),
      environment: process.env.NODE_ENV || 'development',
      replSlug: process.env.REPL_SLUG,
      replOwner: process.env.REPL_OWNER,
    });
  });

  app.get("/api/auth/user", (req: import('express').Request, res: import('express').Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(req.user);
  });
}