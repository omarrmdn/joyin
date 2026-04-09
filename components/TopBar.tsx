"use client";

import { Search, Bell, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";

export function TopBar() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <div className="top-bar glass">
      <div className="mobile-logo">
        <h1 className="logo-text-small">JOI<span>NO</span></h1>
      </div>

      <div className="right-controls">
        <button className="control-btn">
          <Search size={22} />
        </button>
        <button className="control-btn">
          <Bell size={22} />
        </button>
        {user ? (
          user.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt="Profile"
              width={28}
              height={28}
              style={{ borderRadius: "50%", border: "2px solid var(--border)" }}
            />
          ) : (
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--primary)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}>
              {(user.email?.[0] || "U").toUpperCase()}
            </div>
          )
        ) : (
          <button className="control-btn" onClick={() => signInWithGoogle()}>
            <LogIn size={22} />
          </button>
        )}
      </div>

      <style jsx>{`
        .top-bar {
          display: none;
          height: 60px;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 0 1rem;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
        }

        .logo-text-small {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .logo-text-small span {
          color: var(--primary);
        }

        .right-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .control-btn {
          color: var(--secondary-text);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .top-bar {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
