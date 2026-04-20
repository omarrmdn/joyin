"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import TopbarLogo from "@/components/TopbarLogo";
import { useActions } from "@/hooks/use-actions";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const { t, localizeHref } = useLanguage();
  const { logAction } = useActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (loading) return;
    if (user) {
      logAction({ action_type: 'login' });
      const redirectTo = searchParams.get('redirect');
      router.push(redirectTo || localizeHref("/"));
    }
  }, [user, loading, router, logAction, localizeHref, searchParams]);

  if (loading || !mounted) {
    return (
      <div style={{ 
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999,
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'var(--background)'
      }}>
        <div style={{ 
          width: 32, 
          height: 32, 
          border: '3px solid var(--border)', 
          borderTopColor: 'var(--primary)', 
          borderRadius: '50%', 
          animation: 'spin 0.8s linear infinite' 
        }} />
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      zIndex: 9999,
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '24px',
      backgroundColor: 'var(--background)',
      fontFamily: 'inherit',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--card-background)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '48px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Brand / Logo */}
        <div style={{ marginBottom: '32px' }}>
          <TopbarLogo style={{ height: '56px', width: 'auto' }} />
        </div>

        <h1 style={{ 
          fontSize: '22px', 
          fontWeight: 600, 
          color: 'var(--foreground)',
          marginBottom: '32px'
        }}>
          {t.signIn}
        </h1>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <GoogleSignInButton />
        </div>

        {/* Footer / Terms */}
        <div style={{ textAlign: 'center', color: 'var(--secondary-text)', fontSize: '12px', lineHeight: '1.6' }}>
          {t.termsAgreement} <br />
          <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>{t.termsOfService}</a>
        </div>
      </div>
    </div>
  );
}
