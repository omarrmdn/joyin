"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { signInWithIdToken } = useAuth();
  const { language, t } = useLanguage();
  const [buttonRendered, setButtonRendered] = useState(false);
  const initializedRef = useRef(false);

  const googleCallback = useRef(async (response: any) => {
    if (response.credential) {
      try {
        await signInWithIdToken(response.credential);
      } catch (err) {
        console.error("Error authenticating with Supabase:", err);
      }
    }
  });

  // Keep callback ref up to date
  useEffect(() => {
    googleCallback.current = async (response: any) => {
      if (response.credential) {
        try {
          await signInWithIdToken(response.credential);
        } catch (err) {
          console.error("Error authenticating with Supabase:", err);
        }
      }
    };
  }, [signInWithIdToken]);

  // Try rendering the native GIS button
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15;

    const tryRender = () => {
      attempts++;
      const gis = (window as any).google?.accounts?.id;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (gis && clientId) {
        if (!initializedRef.current) {
          gis.initialize({
            client_id: clientId,
            callback: (response: any) => googleCallback.current(response),
          });
          initializedRef.current = true;
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = "";
          gis.renderButton(containerRef.current, {
            theme: "outline",
            size: "large",
            type: "standard",
            text: "signin_with",
            shape: "pill",
            width: 280,
            locale: language.split("-")[0],
          });

          // Check if something was actually rendered
          requestAnimationFrame(() => {
            if (containerRef.current && containerRef.current.children.length > 0) {
              setButtonRendered(true);
            }
          });
        }
      } else if (attempts < maxAttempts) {
        setTimeout(tryRender, 400);
      }
    };

    tryRender();
  }, [language]);

  // Custom fallback click: call prompt() which shows One Tap / account chooser
  const handleFallbackClick = () => {
    const gis = (window as any).google?.accounts?.id;
    if (gis) {
      gis.prompt();
    }
  };

  return (
    <div style={{ minHeight: "44px", display: "flex", justifyContent: "center", width: "100%" }}>
      {/* Native GIS rendered button */}
      <div
        ref={containerRef}
        style={{
          display: buttonRendered ? "flex" : "none",
          justifyContent: "center",
        }}
      />

      {/* Custom fallback button */}
      {!buttonRendered && (
        <button
          onClick={handleFallbackClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            width: "280px",
            height: "44px",
            borderRadius: "25px",
            border: "1px solid var(--border)",
            background: "#ffffff",
            color: "#1f1f1f",
            fontSize: "14px",
            fontWeight: 500,
            fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
            cursor: "pointer",
            transition: "background 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f7f8f8";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>{t.continueWithGoogle || "Sign in with Google"}</span>
        </button>
      )}
    </div>
  );
}
