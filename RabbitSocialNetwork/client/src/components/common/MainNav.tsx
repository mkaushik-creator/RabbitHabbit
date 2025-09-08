import { useLocation } from 'wouter';
import { Home, LayoutGrid, Share2, History, User, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function MainNav() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Create appropriate navigation items based on authentication state
  const getNavItems = () => {
    const baseItems = [
      {
        path: '/home',
        label: 'Home',
        icon: Home
      },
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: LayoutGrid
      },
      {
        path: '/platform-connect',
        label: 'Post',
        icon: Share2,
        primary: true
      },
      {
        path: '/history',
        label: 'History',
        icon: History
      }
    ];

    // Add either login or profile based on auth state
    if (isAuthenticated) {
      baseItems.push({
        path: '/profile',
        label: 'Profile',
        icon: User
      });
    } else {
      baseItems.push({
        path: '/login',
        label: 'Login',
        icon: LogIn
      });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto px-2 py-2">
        <div className="flex justify-between items-center">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center py-1 px-3 rounded-lg transition-colors",
                item.primary ? "relative" : "",
                location === item.path 
                  ? "text-primary" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              {item.primary ? (
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center -mt-6 shadow-md">
                  <item.icon className="w-5 h-5" />
                </div>
              ) : (
                <item.icon className="w-5 h-5" />
              )}
              <span className={cn(
                "text-xs mt-1", 
                item.primary ? "mt-2" : ""
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}