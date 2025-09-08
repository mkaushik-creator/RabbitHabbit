import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";

// AuthUser interface that matches the server AuthUser type
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  avatar: string | null;
  provider: 'google' | 'apple' | 'twitter' | 'email' | 'demo';
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider: 'google' | 'apple' | 'twitter' | 'email' | 'demo', credentials?: { email: string; password: string }) => Promise<void>;
  register: (credentials: { email: string; password: string; fullName?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch the current user from the server
  const { 
    data: userData,
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
    enabled: isInitialized, // Only run after we've checked localStorage
  });

  // Initialize from localStorage on app load
  useEffect(() => {
    const initializeAuth = () => {
      console.log('🔄 Initializing authentication from localStorage...');
      // Check if user data exists in localStorage
      const storedUser = localStorage.getItem('rabbit_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          console.log('✅ Found stored user:', parsedUser.username);
          setUser(parsedUser);
        } catch (error) {
          console.error('❌ Failed to parse stored user data:', error);
          localStorage.removeItem('rabbit_user');
        }
      } else {
        console.log('❌ No stored user found in localStorage');
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  // Update user state when server data changes
  useEffect(() => {
    if (userData) {
      console.log('🔧 Raw user data from server:', userData);
      
      // Transform Google OAuth profile to our User interface
      const transformedUser: User = {
        id: parseInt(userData.id) || 0,
        username: userData.displayName || userData.name?.givenName || 'User',
        email: userData.emails?.[0]?.value || userData.email || '',
        fullName: userData.displayName || userData.name?.givenName || null,
        avatar: userData.photos?.[0]?.value || userData.picture || null,
        provider: 'google'
      };
      
      console.log('✅ Transformed user for display:', transformedUser);
      setUser(transformedUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('rabbit_user', JSON.stringify(transformedUser));
    } else if (isInitialized) {
      // Only clear if we've initialized (not on first load)
      console.log('❌ Server session invalid, clearing local storage');
      setUser(null);
      localStorage.removeItem('rabbit_user');
    }
  }, [userData, isInitialized]);

  // Display toast on error
  useEffect(() => {
    if (error) {
      console.error('Auth error:', error);
      toast({
        title: 'Authentication Error',
        description: 'There was a problem with authentication. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Login function that redirects to OAuth or handles email/demo login
  const login = async (provider: 'google' | 'apple' | 'twitter' | 'email' | 'demo', credentials?: { email: string; password: string }): Promise<void> => {
    try {
      switch (provider) {
        case 'google':
          // Redirect to Google OAuth endpoint
          window.location.href = '/api/auth/google';
          break;
        case 'demo':
          // Call the demo login API directly
          const response = await apiRequest('POST', '/api/auth/demo-login');
          const userData = await response.json();
          const demoUser = userData as User;
          setUser(demoUser);
          localStorage.setItem('rabbit_user', JSON.stringify(demoUser));
          console.log('✅ Demo login successful, session saved');
          break;
        case 'apple':
          toast({
            title: 'Not Implemented',
            description: 'Apple login is not currently available.',
            variant: 'destructive',
          });
          break;
        case 'twitter':
          // Redirect to Twitter OAuth endpoint
          window.location.href = '/api/auth/twitter';
          break;
        case 'email':
          if (!credentials) {
            throw new Error('Email and password are required for email login');
          }
          // Call the email login API
          const loginResponse = await apiRequest('POST', '/api/auth/login', credentials);
          const loginUserData = await loginResponse.json();
          const emailUser = loginUserData as User;
          setUser(emailUser);
          localStorage.setItem('rabbit_user', JSON.stringify(emailUser));
          await refetch(); // Refresh the user data
          break;
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast({
        title: 'Login Failed',
        description: `Could not log in with ${provider}. Please try again.`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Register function for email/password
  const register = async (credentials: { email: string; password: string; fullName?: string }): Promise<void> => {
    try {
      const response = await apiRequest('POST', '/api/auth/register', credentials);
      const userData = await response.json();
      const registeredUser = userData as User;
      setUser(registeredUser);
      localStorage.setItem('rabbit_user', JSON.stringify(registeredUser));
      await refetch(); // Refresh the user data
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created and you are now logged in.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Logout function that calls the logout API
  const logout = async () => {
    try {
      await apiRequest('GET', '/api/auth/logout');
      setUser(null);
      localStorage.removeItem('rabbit_user');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, clear local state
      setUser(null);
      localStorage.removeItem('rabbit_user');
      toast({
        title: 'Logout Failed',
        description: 'There was a problem logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: !isInitialized || isLoading, // Loading until initialized and server check complete
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}