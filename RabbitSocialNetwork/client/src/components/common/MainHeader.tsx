import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Menu, X, Sun, Moon, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface MainHeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
  title?: string;
}

export default function MainHeader({ 
  showBackButton = false, 
  onBackClick,
  title = 'Rabbit' 
}: MainHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Get section title based on current location
  const getSectionTitle = () => {
    if (title && title !== 'Rabbit') return title;
    
    const pathTitles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/ai-chat': 'AI Chat Creator',
      '/post-generator': 'Post Generator',
      '/content-creation': 'Content Creation',
      '/platform-linking': 'Platform Connect',
      '/platform-connect': 'Platform Connect',
      '/collaborators': 'Tag Collaborators',
      '/hashtag-generator': 'Hashtag Generator',
      '/scheduler': 'Scheduler',
      '/history': 'Post History',
      '/profile': 'Profile',
      '/image-test': 'Image Tools',
      '/onboarding': 'Setup'
    };
    
    return pathTitles[location] || 'RabbitHabbit';
  };

  // Determine if we should show back button
  const shouldShowBackButton = showBackButton || (location !== '/dashboard' && location !== '/' && location !== '/login');

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate('/dashboard');
    }
  };

  const menuItems = [
    { label: 'Home', path: '/home' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'AI Chat Creator', path: '/ai-chat' },
    { label: 'Create Content', path: '/post-generator' },
    { label: 'Platform Linking', path: '/platform-linking' },
    { label: 'Post History', path: '/history' },
  ];

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-20 w-full">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {shouldShowBackButton && (
              <button
                onClick={handleBackClick}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Go back to dashboard"
              >
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-gradient-to-br from-[#5A67D8] to-[#ED64A6] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 hover:rotate-1">
                  <span className="text-white font-bold text-sm">🐰</span>
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-foreground">{getSectionTitle()}</h1>
                {location !== '/' && location !== '/dashboard' && (
                  <p className="text-xs text-muted-foreground">RabbitHabbit</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-foreground" /> : <Moon className="h-5 w-5 text-foreground" />}
            </button>
            
            {/* Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
            </button>
          </div>
        </div>
      </header>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 right-0 w-56 bg-card shadow-lg rounded-lg border border-border z-30 mr-4 overflow-hidden">
          {/* User Info Section */}
          {user && (
            <div className="px-4 py-3 border-b border-border bg-muted/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate" title={user?.fullName || user?.username || 'User'}>
                    {user?.fullName || user?.username || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'No email'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                  location === item.path 
                    ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                    : 'text-card-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout Section */}
          {user && (
            <div className="border-t border-border">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10" 
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}