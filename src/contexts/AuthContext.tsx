import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { full_name: string; user_type: 'patient' | 'doctor' }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create it now
        await createMissingProfile(userId);
      } else if (data) {
        setProfile(data);
      } else {
        console.log('No profile found, creating one...');
        await createMissingProfile(userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMissingProfile = async (userId: string) => {
    try {
      // Get user info from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: user.email!,
            full_name: user.user_metadata?.full_name || '',
            user_type: (user.user_metadata?.user_type as 'patient' | 'doctor') || 'patient',
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating missing profile:', error);
      } else {
        setProfile(data);
        console.log('Created missing profile successfully');
      }
    } catch (error) {
      console.error('Error in createMissingProfile:', error);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: { full_name: string; user_type: 'patient' | 'doctor' }
  ) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            user_type: userData.user_type,
          }
        }
      });

      if (error) {
        return { error };
      }

      // If user was created successfully, ensure profile exists
      if (data.user && !error) {
        try {
          // Wait a moment for the trigger to potentially create the profile
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if profile was created by trigger
          const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle(); // Use maybeSingle to avoid throwing on no rows

          // If no profile exists, create it manually as fallback
          if (!existingProfile) {
            console.log('Trigger failed, creating profile manually');
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: data.user.id,
                  email: data.user.email!,
                  full_name: userData.full_name,
                  user_type: userData.user_type,
                }
              ]);

            if (profileError) {
              console.error('Error creating profile manually:', profileError);
              // Don't fail if RLS policy prevents insertion - user was still created
              console.log('User created successfully, profile creation may have been handled by trigger');
            }
          } else {
            console.log('Profile created successfully by trigger');
          }
        } catch (profileError) {
          console.error('Profile creation process error:', profileError);
          // Don't return error - user account was created successfully
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: new Error('Database error saving new user') };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('AuthContext: Starting signIn process...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout - please try again')), 10000)
      );
      
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const { error } = await Promise.race([signInPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('AuthContext: SignIn error:', error);
        return { error };
      }
      
      console.log('AuthContext: SignIn successful');
      return { error: null };
    } catch (error) {
      console.error('AuthContext: SignIn exception:', error);
      return { error };
    } finally {
      console.log('AuthContext: SignIn process completed');
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
