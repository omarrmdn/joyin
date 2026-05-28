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

function getCachedSession() {
  if (typeof window === "undefined") return null;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const value = localStorage.getItem(key);
        if (value) {
          const parsed = JSON.parse(value);
          if (parsed && parsed.user && parsed.access_token) {
            const expiresAt = parsed.expires_at;
            if (expiresAt && expiresAt > Date.now() / 1000) {
              return parsed;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error reading cached session", e);
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const cached = getCachedSession();
  const [user, setUser] = useState<User | null>(cached?.user ?? null);
  const [session, setSession] = useState<Session | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
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

    return () => {
      subscription.unsubscribe();
    };
  }, [syncUser]);

  const signInWithIdToken = useCallback(async (idToken: string) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // Navigate to /login page which renders the GoogleSignInButton (popup-based).
    // This avoids using Supabase OAuth redirect (which shows supabase.co on Google consent)
    // and avoids One Tap/FedCM prompt() which fails on localhost.
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
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
