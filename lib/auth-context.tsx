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
          use_fedcm_for_prompt: false,
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
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap prompt can't be shown (e.g. user dismissed it before),
          // fall back to rendering a button in a temporary container
          const container = document.createElement("div");
          container.id = "google-signin-fallback";
          container.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;";
          const inner = document.createElement("div");
          inner.style.cssText = "background:var(--card-background,#1a1a1a);padding:40px;border-radius:20px;min-width:320px;display:flex;flex-direction:column;align-items:center;gap:20px;";
          const title = document.createElement("p");
          title.textContent = "Sign in with Google";
          title.style.cssText = "color:#fff;font-size:18px;font-weight:600;margin:0;";
          const btnContainer = document.createElement("div");
          btnContainer.id = "google-signin-fallback-btn";
          const closeBtn = document.createElement("button");
          closeBtn.textContent = "✕";
          closeBtn.style.cssText = "position:absolute;top:20px;right:20px;background:none;border:none;color:#fff;font-size:24px;cursor:pointer;";
          closeBtn.onclick = () => container.remove();
          inner.appendChild(title);
          inner.appendChild(btnContainer);
          container.appendChild(closeBtn);
          container.appendChild(inner);
          container.onclick = (e) => { if (e.target === container) container.remove(); };
          document.body.appendChild(container);
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: 280,
            text: "continue_with",
            shape: "rectangular",
          });
        }
      });
    }
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
