"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleOneTap() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is already logged in or auth is loading, don't show One Tap
    if (user || loading) return;

    const showPrompt = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: () => {
            // Callback handles the credential if One Tap succeeds.
            // Handled separately or can be integrated with supabase.auth.signInWithIdToken
          }
        });
        
        window.google.accounts.id.prompt((notification: { isNotDisplayed: () => boolean; getNotDisplayedReason: () => string }) => {
          if (notification.isNotDisplayed()) {
            console.log("One Tap not displayed:", notification.getNotDisplayedReason());
          }
        });
      } else {
        setTimeout(showPrompt, 1000);
      }
    };

    showPrompt();

    return () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [user, loading]);

  return null;
}
