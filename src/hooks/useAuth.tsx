import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

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
    
    // Get initial session
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in, fetching profile...');
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed, ensuring profile is loaded...');
          if (!user) {
            await fetchUserProfile(session.user.id);
          }
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔍 Checking for existing session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('✅ Found existing session for user:', session.user.id);
        await fetchUserProfile(session.user.id);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
        throw new Error(error.message);
      }
      
      if (!data.session || !data.user) {
        throw new Error('No session created during sign in');
      }

      console.log('✅ Sign in successful for user:', data.user.id);
      
      // Wait a moment for the session to be fully established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fetch the user profile
      await fetchUserProfile(data.user.id);
      
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

      // Create auth user with email confirmation disabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            name: name.trim(),
            phone: phone.trim(),
            role: role
          }
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('No user created during signup');
      }

      console.log('✅ Auth user created:', authData.user.id);

      // If we have a session (email confirmation disabled), create the profile
      if (authData.session) {
        console.log('📋 Creating user profile...');
        
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            role,
            name: name.trim(),
            phone: phone.trim(),
          })
          .select()
          .single();

        if (profileError) {
          console.error('❌ Profile creation error:', profileError);
          // Clean up auth user if profile creation fails
          await supabase.auth.signOut();
          throw new Error(`Failed to create profile: ${profileError.message}`);
        }
        
        console.log('✅ User profile created:', profileData);
        setUser(profileData);
      } else {
        // If no session (email confirmation required), inform user
        throw new Error('Please check your email and click the confirmation link to complete signup');
      }
      
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
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