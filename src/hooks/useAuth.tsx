import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/integrations/supabase/types";

// Move constants to separate file to fix react-refresh warning
import { AUTH_CONSTANTS } from "./authConstants";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const handleAuthChange = useCallback(async (session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      // Use requestIdleCallback for better performance instead of setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => fetchProfile(session.user.id));
      } else {
        setTimeout(() => fetchProfile(session.user.id), 0);
      }
    } else {
      setProfile(null);
    }
    
    setLoading(false);
  }, [fetchProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await handleAuthChange(session);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, [handleAuthChange]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  const isAdmin = useMemo(() => profile?.role === 'admin', [profile?.role]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    signIn,
    signOut,
    loading,
    isAdmin,
  }), [user, session, profile, signIn, signOut, loading, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};