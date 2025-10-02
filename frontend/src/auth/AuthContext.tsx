import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const ANON_RECOMMENDATION_LIMIT = Number(process.env.REACT_APP_ANON_RECOMMENDATION_LIMIT ?? '5');
const AUTH_RECOMMENDATION_LIMIT = Number(process.env.REACT_APP_AUTH_RECOMMENDATION_LIMIT ?? '25');

interface AuthContextValue {
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  accessToken: string | null;
  isSupabaseReady: boolean;
  recommendationLimit: number;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error) {
          console.error('Failed to restore session', error);
          setSession(null);
        } else {
          setSession(data.session ?? null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Unable to sign in.');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const accessToken = session?.access_token ?? null;
    return {
      isLoading,
      user: session?.user ?? null,
      session,
      accessToken,
      isSupabaseReady: isSupabaseConfigured,
      recommendationLimit: session ? AUTH_RECOMMENDATION_LIMIT : ANON_RECOMMENDATION_LIMIT,
      signInWithGoogle,
      signOut
    };
  }, [isLoading, session, signInWithGoogle, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
