"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleOneTap() {
  const { user, signInWithIdToken, loading } = useAuth();
  const initializationStarted = useRef(false);

  useEffect(() => {
    // If user is already logged in or auth is loading, don't show One Tap
    if (user || loading) {
      initializationStarted.current = false;
      return;
    }

    // Prevent multiple initializations in the same session
    if (initializationStarted.current) return;

    const initializeOneTap = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        initializationStarted.current = true;
        
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true, // Opt-in to FedCM to resolve AbortError issues
        });

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log("One Tap not displayed:", notification.getNotDisplayedReason());
            initializationStarted.current = false; // Allow retry on next mount if not displayed
          } else if (notification.isSkippedMoment()) {
            console.log("One Tap skipped:", notification.getSkippedReason());
            initializationStarted.current = false;
          } else if (notification.isDismissedMoment()) {
            console.log("One Tap dismissed:", notification.getDismissedReason());
            // Don't reset initializationStarted here to honor user dismissal for this session
          }
        });
      } else {
        // Retry after a short delay if script hasn't loaded yet
        const timer = setTimeout(initializeOneTap, 1000);
        return () => clearTimeout(timer);
      }
    };

    const handleCredentialResponse = async (response: any) => {
      try {
        await signInWithIdToken(response.credential);
      } catch (error) {
        console.error("Error signing in with One Tap:", error);
        initializationStarted.current = false;
      }
    };

    initializeOneTap();

    // Cleanup: cancel the prompt if unmounting
    return () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [user, loading, signInWithIdToken]);

  return null;
}
