"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { signInWithIdToken } = useAuth();
  const { language } = useLanguage();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let scriptLoaded = false;
    let isMounted = true;

    // Callback to run when Google successfully returns a token
    const handleCredentialResponse = async (response: any) => {
      if (response.credential) {
        try {
          await signInWithIdToken(response.credential);
        } catch (err) {
          console.error("Auth error:", err);
        }
      }
    };

    // Render the button
    const initGoogle = () => {
      if (!isMounted) return;
      if (!(window as any).google?.accounts?.id) {
        setErrorMsg("Google API not loaded");
        return;
      }
      
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setErrorMsg("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
        return;
      }

      if (containerRef.current) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            context: "signin",
            ux_mode: "popup",
            itp_support: true,
          });
          
          (window as any).google.accounts.id.renderButton(
            containerRef.current,
            { 
              type: "standard", 
              shape: "pill", 
              theme: "outline", 
              text: "signin_with", 
              size: "large", 
              logo_alignment: "left", 
              width: 280,
              locale: language.split('-')[0]
            }
          );
        } catch (e: any) {
          console.error("GIS render error:", e);
          setErrorMsg(e.message || "Error rendering google button");
        }
      }
    };

    const loadScriptAndInit = () => {
      if ((window as any).google?.accounts?.id) {
        initGoogle();
        return;
      }

      // If script tag doesn't exist, inject it
      if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogle();
        script.onerror = () => setErrorMsg("Failed to load Google script");
        document.head.appendChild(script);
      } else {
        // Polling to wait for the existing GSI script to load
        const checkInterval = setInterval(() => {
          if ((window as any).google?.accounts?.id) {
            clearInterval(checkInterval);
            initGoogle();
          }
        }, 100);
        
        // Timeout after 5s
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!(window as any).google?.accounts?.id && isMounted) {
            setErrorMsg("Timeout loading Google script");
          }
        }, 5000);
      }
    };

    loadScriptAndInit();

    return () => {
      isMounted = false;
    };
  }, [signInWithIdToken, language]);

  return (
    <div style={{ 
      minHeight: "44px", 
      width: "100%", 
      display: "flex", 
      flexDirection: "column",
      alignItems: "center" 
    }}>
      <div ref={containerRef}></div>
      {errorMsg && <p style={{ color: 'red', fontSize: '12px', marginTop: '8px' }}>Google Auth Error: {errorMsg}</p>}
    </div>
  );
}
