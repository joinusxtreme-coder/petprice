'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (email: string, pass: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
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
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password: pass });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signUp(email: string, pass: string, username: string): Promise<{ error: string | null }> {
    const { data, error } = await supabaseBrowser.auth.signUp({ email, password: pass });
    if (error) return { error: error.message };
    if (data.user) {
      await supabaseBrowser.from('user_profiles').insert({
        id: data.user.id,
        username,
      });
    }
    return { error: null };
  }

  async function signOut() {
    await supabaseBrowser.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
