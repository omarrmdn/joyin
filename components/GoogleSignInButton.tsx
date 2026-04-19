"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { signInWithIdToken } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeGoogle = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            ux_mode: "popup",
            itp_support: true,
            callback: async (response: any) => {
              if (response.credential) {
                try {
                  await signInWithIdToken(response.credential);
                } catch (err) {
                  console.error("Error authenticating:", err);
                }
              }
            },
          });

          if (containerRef.current) {
            window.google.accounts.id.renderButton(containerRef.current, {
              theme: "outline",
              size: "large",
              type: "standard",
              text: "signin_with",
              shape: "pill",
              locale: language.split('-')[0],
              width: 280, // Target mobile-friendly width
            });
          }
        } catch (e) {
          console.error("GSI Init error:", e);
        }
      } else {
        timeoutId = setTimeout(initializeGoogle, 500);
      }
    };

    initializeGoogle();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [signInWithIdToken, language]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        minHeight: "44px", 
        width: "100%", 
        display: "flex", 
        justifyContent: "center",
        overflow: "visible" 
      }}
    />
  );
}
