"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { usePathname } from "next/navigation";

export default function GoogleSignInButton() {
  const { signInWithIdToken } = useAuth();
  const { language } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    // Define the callback globally so the HTML API can find it
    (window as any).handleGoogleResponse = async (response: any) => {
      if (response.credential) {
        try {
          await signInWithIdToken(response.credential);
        } catch (err) {
          console.error("Auth error:", err);
        }
      }
    };
  }, [signInWithIdToken]);

  return (
    <div key={pathname} style={{ 
      minHeight: "44px", 
      width: "100%", 
      display: "flex", 
      justifyContent: "center" 
    }}>
      {/* Google Identity Services HTML API Configuration */}
      <div 
        id="g_id_onload"
        data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleGoogleResponse"
        data-auto_prompt="false"
        data-itp_support="true"
      />
      
      {/* The actual button rendered by GIS script */}
      <div 
        className="g_id_signin"
        data-type="standard"
        data-shape="pill"
        data-theme="outline"
        data-text="signin_with"
        data-size="large"
        data-logo_alignment="left"
        data-width="280"
        data-locale={language.split('-')[0]}
      />
    </div>
  );
}
