"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (user) {
      router.push("/explore");
    } else {
      // Trigger Google sign-in via GIS prompt
      signInWithGoogle();
    }
  }, [user, loading, router, signInWithGoogle]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh' 
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
