import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ContentCreation from "@/pages/ContentCreation";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import PostGenerator from "@/pages/PostGenerator";
import PostGeneratorAI from "@/pages/PostGeneratorAI";
import ModernPostGenerator from "@/pages/ModernPostGenerator";
import PlatformConnect from "@/pages/PlatformConnect";
import PlatformLinking from "@/pages/PlatformLinking";
import Collaborators from "@/pages/Collaborators";
import HashtagGenerator from "@/pages/HashtagGenerator";
import Scheduler from "@/pages/Scheduler";
import History from "@/pages/History";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import AIChat from "@/pages/AIChat";
import ImageTest from "@/pages/ImageTest";
import MainHeader from "@/components/common/MainHeader";
import MainNav from "@/components/common/MainNav";

function Router() {
  console.log("Router initialized");
  const [location] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Don't show back button on login page and home
  const showBackButton = location !== "/" && location !== "/login";
  
  // Hide navigation on login page and home page
  const showNavigation = location !== "/login" && location !== "/home";
  
  // Set the title based on the current route
  const getTitle = () => {
    switch (location) {
      case "/":
        return "Welcome to RabbitHabbit";
      case "/platform-connect":
        return "Connect Platforms";
      case "/collaborators":
        return "Tag Collaborators";
      case "/hashtag-generator":
        return "Hashtag Generator";
      case "/scheduler":
        return "Schedule Posts";
      case "/dashboard":
        return "Dashboard";
      case "/post-generator":
        return "AI Post Generator";
      case "/history":
        return "Post History";
      case "/login":
        return "Sign In";
      case "/profile":
        return "Your Profile";
      case "/ai-chat":
        return "AI Chat Creator";
      case "/image-test":
        return "Image Generation Test";
      default:
        return "RabbitHabbit";
    }
  };
  
  return (
    <>
      <main className="w-full">
        <Switch>
          {/* Public routes - redirect to dashboard if authenticated */}
          <Route path="/login">
            <PublicRoute>
              <Login />
            </PublicRoute>
          </Route>
          
          {/* Root route - always shows public landing page */}
          <Route path="/">
            <Home />
          </Route>
          
          {/* Public Home page - ALWAYS shows public landing page */}
          <Route path="/home">
            <Home />
          </Route>
          
          {/* Protected routes - require authentication */}
          <Route path="/create">
            <ProtectedRoute>
              <ContentCreation />
            </ProtectedRoute>
          </Route>
          
          <Route path="/onboarding">
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          </Route>
          
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          
          <Route path="/post-generator">
            <ProtectedRoute>
              <ModernPostGenerator />
            </ProtectedRoute>
          </Route>
          
          <Route path="/platform-connect">
            <ProtectedRoute>
              <PlatformConnect />
            </ProtectedRoute>
          </Route>
          
          <Route path="/platform-linking">
            <ProtectedRoute>
              <PlatformLinking />
            </ProtectedRoute>
          </Route>
          
          <Route path="/collaborators">
            <ProtectedRoute>
              <Collaborators />
            </ProtectedRoute>
          </Route>
          
          <Route path="/hashtag-generator">
            <ProtectedRoute>
              <HashtagGenerator />
            </ProtectedRoute>
          </Route>
          
          <Route path="/scheduler">
            <ProtectedRoute>
              <Scheduler />
            </ProtectedRoute>
          </Route>
          
          <Route path="/history">
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          </Route>
          
          <Route path="/profile">
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Route>
          
          <Route path="/ai-chat">
            <ProtectedRoute>
              <AIChat />
            </ProtectedRoute>
          </Route>
          
          <Route path="/image-test">
            <ImageTest />
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </main>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="w-full bg-background min-h-screen relative">
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
