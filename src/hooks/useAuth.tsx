import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authClient } from '../lib/auth-client';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  role: 'agent' | 'renter';
  name: string;
  phone: string;
  photo_url?: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string, role: 'renter' | 'agent') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthProvider: Initializing auth state...');
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔍 Checking for existing session...');
      const session = await authClient.getSession();
      
      if (session.data?.user) {
        console.log('✅ Found existing session for user:', session.data.user.id);
        await fetchUserProfile(session.data.user.id);
      } else {
        console.log('ℹ️ No existing session found');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('📋 Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching user profile:', error);
        if (error.code === 'PGRST116') {
          console.log('ℹ️ User profile not found - user may need to complete signup');
          setUser(null);
        }
        setLoading(false);
        return;
      }

      if (data) {
        console.log('✅ User profile loaded:', data);
        setUser(data);
      } else {
        console.log('⚠️ No user profile data returned');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Unexpected error fetching profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Starting sign in process for:', email);
    setLoading(true);
    
    try {
      // Validate inputs
      if (!email.trim() || !password) {
        throw new Error('Email and password are required');
      }

      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      
      if (result.error) {
        console.error('❌ Sign in error:', result.error);
        throw new Error(result.error.message || 'Failed to sign in');
      }
      
      if (!result.data?.user) {
        throw new Error('No user data returned during sign in');
      }

      console.log('✅ Sign in successful for user:', result.data.user.id);
      
      // Fetch the user profile from our users table
      await fetchUserProfile(result.data.user.id);
      
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string, role: 'renter' | 'agent') => {
    console.log('📝 Starting signup process for:', email, 'as', role);
    setLoading(true);
    
    try {
      // Validate inputs
      if (!email.trim() || !password || !name.trim() || !phone.trim()) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Create auth user with BetterAuth
      const result = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim(),
        role,
      });

      if (result.error) {
        console.error('❌ Auth signup error:', result.error);
        throw new Error(result.error.message || 'Failed to create account');
      }

      if (!result.data?.user) {
        throw new Error('No user created during signup');
      }

      console.log('✅ Auth user created:', result.data.user.id);

      // Create profile in our users table
      console.log('📋 Creating user profile...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: result.data.user.id,
          role,
          name: name.trim(),
          phone: phone.trim(),
          photo_url: null,
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        // Try to clean up auth user if profile creation fails
        await authClient.signOut();
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }
      
      console.log('✅ User profile created:', profileData);
      setUser(profileData);
      
    } catch (error) {
      console.error('❌ Signup failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('👋 Signing out user...');
    setLoading(true);
    
    try {
      const result = await authClient.signOut();
      if (result.error) {
        console.error('❌ Sign out error:', result.error);
        throw new Error(result.error.message || 'Failed to sign out');
      }
      
      console.log('✅ Sign out successful');
      setUser(null);
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    console.log('📝 Updating user profile:', updates);

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile update error:', error);
        throw error;
      }

      console.log('✅ Profile updated:', data);
      setUser(data);
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};