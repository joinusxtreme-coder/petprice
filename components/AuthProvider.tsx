'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (email: string, pass: string, username: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signInWithLine: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, needsConfirmation: false }),
  signInWithGoogle: async () => {},
  signInWithLine: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, pass: string): Promise<{ error: string | null }> {
    const { data, error } = await supabaseBrowser.auth.signInWithPassword({ email, password: pass });
    if (error) return { error: error.message };
    // onAuthStateChange より先に user をセットして画面遷移のタイミングズレを防ぐ
    if (data.session) setUser(data.session.user);
    return { error: null };
  }

  async function signUp(email: string, pass: string, username: string): Promise<{ error: string | null; needsConfirmation?: boolean }> {
    const { data, error } = await supabaseBrowser.auth.signUp({ email, password: pass });
    if (error) return { error: error.message };
    if (data.user) {
      await supabaseBrowser.from('user_profiles').insert({
        id: data.user.id,
        username,
      });
    }
    // セッションがない = メール確認が必要
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  }

  async function signInWithGoogle() {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function signInWithLine() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'line' as any,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function signOut() {
    await supabaseBrowser.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signInWithLine, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
