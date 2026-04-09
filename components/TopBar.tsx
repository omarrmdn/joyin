"use client";

import { Search, Bell, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function TopBar() {
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
        <UserButton />
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
