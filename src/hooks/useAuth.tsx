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
    // Get initial session
    getProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (session?.user) {
          await getProfile();
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        console.log('Auth user found:', authUser.id);
        const { data: profiles, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id);
        
        if (error) {
          console.error('Error fetching profile:', error);
        } else if (profiles && profiles.length > 0) {
          console.log('Profile found:', profiles[0]);
          setUser(profiles[0]);
        } else {
          console.log('Profile not found for user:', authUser.id);
          setUser(null);
        }
      } else {
        console.log('No auth user found');
        setUser(null);
      }
    } catch (error) {
      console.error('Error in getProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
    
    console.log('Sign in successful:', data.user?.id);
  };

  const signUp = async (email: string, password: string, name: string, phone: string, role: 'renter' | 'agent') => {
    console.log('Starting signup process...');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined // Disable email confirmation
      }
    });

    if (error) {
      console.error('Auth signup error:', error);
      throw error;
    }

    if (data.user && data.session) {
      console.log('User created:', data.user.id);
      
      // Small delay to ensure session is established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        // Create user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            role,
            name,
            phone,
          })
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Clean up auth user if profile creation fails
          await supabase.auth.signOut();
          throw profileError;
        }
        
        console.log('Profile created:', profile);
        setUser(profile);
      } catch (profileError) {
        console.error('Profile creation failed:', profileError);
        await supabase.auth.signOut();
        throw profileError;
      }
    } else if (data.user && !data.session) {
      throw new Error('Please check your email to confirm your account');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};