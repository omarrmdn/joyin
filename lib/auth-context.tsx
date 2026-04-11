"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithIdToken: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

interface CredentialResponse {
  credential: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initializationStarted = useRef(false);

  const syncUser = useCallback(async (user: User | null) => {
    if (!user) return;
    
    // Check if user exists in public.users to avoid unnecessary upserts if preferred,
    // but upsert is generally safer for metadata sync.
    await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0],
      image_url: user.user_metadata?.avatar_url || null,
      date_signed_in: new Date().toISOString(),
      currency_code: 'EGP' // Default for this app
    }, { onConflict: 'id' });
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) syncUser(session.user);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) syncUser(session.user);
        setLoading(false);
      }
    );

    // Initialize Google Identity Services
    const initializeGis = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id && !initializationStarted.current) {
        initializationStarted.current = true;
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: async (response: CredentialResponse) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
            });
            if (error) console.error("Error signing in with Google ID Token:", error);
          },
          use_fedcm_for_prompt: true,
        });
      } else if (typeof window !== "undefined" && !window.google?.accounts?.id) {
        // Check if script is already in document to avoid double loading
        if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) return;

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGis;
        document.head.appendChild(script);
      }
    };

    initializeGis();

    return () => {
      subscription.unsubscribe();
    };
  }, [syncUser]);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : process.env.NEXT_PUBLIC_SITE_URL + "/auth/callback";

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  }, []);

  const signInWithIdToken = useCallback(async (idToken: string) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithIdToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
