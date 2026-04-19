"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { signInWithIdToken } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    const initializeGoogle = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                await signInWithIdToken(response.credential);
              } catch (err) {
                console.error("Error authenticating with Supabase:", err);
              }
            }
          },
        });

        if (containerRef.current) {
          // Clear any previous button render
          containerRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(containerRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            text: "signin_with",
            shape: "pill",
            width: 280,
            locale: language.split('-')[0],
          });
        }
      } else {
        setTimeout(initializeGoogle, 500);
      }
    };

    initializeGoogle();
  }, [signInWithIdToken, language]);

  return (
    <div 
      ref={containerRef} 
      style={{ minHeight: "44px", display: "flex", justifyContent: "center" }}
    />
  );
}

