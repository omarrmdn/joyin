"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { signInWithIdToken } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const initializeGoogle = () => {
      if (typeof window !== "undefined" && window.google?.accounts?.id && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          ux_mode: "popup",
          itp_support: true,
          auto_select: false,
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

        // The HTML API (g_id_signin class) will handle the rendering,
        // but we can also manually trigger it to be sure.
        if (containerRef.current) {
          window.google.accounts.id.renderButton(containerRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            text: "signin_with",
            shape: "pill",
            locale: language.split('-')[0],
            width: 280,
          });
        }
        clearInterval(interval);
      }
    };

    interval = setInterval(initializeGoogle, 500);
    initializeGoogle();

    return () => clearInterval(interval);
  }, [signInWithIdToken, language]);

  return (
    <div 
      ref={containerRef} 
      className="google-signin-container g_id_signin"
      data-type="standard"
      data-shape="pill"
      data-theme="outline"
      data-text="signin_with"
      data-size="large"
      data-logo_alignment="left"
      data-width="280"
      style={{ 
        minHeight: "44px", 
        width: "100%", 
        maxWidth: "320px",
        display: "flex", 
        justifyContent: "center",
        overflow: "visible" 
      }}
    />
  );
}
