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
          ux_mode: "popup", // Explicitly use popup for better mobile support
          itp_support: true, // Support for Safari/iOS
          use_fedcm_for_prompt: false, // Avoid FedCM issues on mobile
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
          window.google.accounts.id.renderButton(containerRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            text: "signin_with",
            shape: "pill",
            locale: language.split('-')[0], // 'ar' or 'en'
            width: 280, // Fixed width helps on mobile
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
      className="google-signin-container"
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
