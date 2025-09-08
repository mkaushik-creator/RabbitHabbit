const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();

// Request logging middleware - MUST be first
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('Query params:', req.query);
  }
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  console.log('Google OAuth Strategy callback executed');
  console.log('Profile:', profile.displayName, profile.emails[0].value);
  
  // In a real app, you would save user to database here
  const user = {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails[0].value,
    avatar: profile.photos[0].value
  };
  
  return done(null, user);
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  console.log('Serializing user:', user.id);
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  console.log('Deserializing user:', user.id);
  done(null, user);
});

// Routes
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <h1>Welcome ${req.user.name}!</h1>
      <p>Email: ${req.user.email}</p>
      <img src="${req.user.avatar}" alt="Avatar" style="width: 100px; height: 100px; border-radius: 50%;">
      <br><br>
      <a href="/profile">Profile</a> | <a href="/logout">Logout</a>
    `);
  } else {
    res.send(`
      <h1>Google OAuth Test</h1>
      <p>You are not logged in.</p>
      <a href="/auth/google">Login with Google</a>
    `);
  }
});

// Start Google OAuth
app.get('/auth/google', (req, res, next) => {
  console.log('Starting Google OAuth...');
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback - THIS IS THE CRITICAL ROUTE
app.get('/auth/google/callback', 
  (req, res, next) => {
    console.log('=== GOOGLE CALLBACK ROUTE HIT ===');
    console.log('Query params:', req.query);
    console.log('URL:', req.url);
    
    if (req.query.error) {
      console.log('OAuth error:', req.query.error);
      return res.redirect('/?error=' + req.query.error);
    }
    
    if (!req.query.code) {
      console.log('No authorization code received');
      return res.redirect('/?error=no_code');
    }
    
    console.log('Authorization code received, proceeding with Passport authentication...');
    next();
  },
  passport.authenticate('google', { failureRedirect: '/?error=auth_failed' }),
  (req, res) => {
    console.log('=== OAUTH SUCCESS ===');
    console.log('Authenticated user:', req.user);
    res.redirect('/profile');
  }
);

// Profile route (protected)
app.get('/profile', (req, res) => {
  console.log('Profile route accessed');
  console.log('Authenticated:', req.isAuthenticated());
  console.log('User:', req.user);
  
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  
  res.send(`
    <h1>Profile</h1>
    <p><strong>Name:</strong> ${req.user.name}</p>
    <p><strong>Email:</strong> ${req.user.email}</p>
    <p><strong>Google ID:</strong> ${req.user.id}</p>
    <img src="${req.user.avatar}" alt="Avatar" style="width: 150px; height: 150px; border-radius: 50%;">
    <br><br>
    <a href="/">Home</a> | <a href="/logout">Logout</a>
  `);
});

// Logout route
app.get('/logout', (req, res) => {
  console.log('Logout route accessed');
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    console.log('User logged out successfully');
    res.redirect('/');
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).send(`
    <h1>404 - Not Found</h1>
    <p>Route: ${req.method} ${req.originalUrl}</p>
    <p>This route does not exist.</p>
    <a href="/">Go Home</a>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send(`
    <h1>Server Error</h1>
    <p>${err.message}</p>
    <a href="/">Go Home</a>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`OAuth callback URL: http://localhost:${PORT}/auth/google/callback`);
  console.log('Make sure your Google OAuth redirect URI is set to the callback URL above');
});