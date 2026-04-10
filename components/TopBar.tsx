"use client";

import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/hooks/useNotifications";
import { IoNotificationsOutline, IoLogInOutline, IoLocationOutline, IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";
import TopbarLogo from "./TopbarLogo";

export function TopBar() {
  const { user, signInWithGoogle } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <div className="topbar-container">
      {/* Mobile-only header row: Logo + Notifications */}
      <div className="mobile-only topbar-mobile-header">
        <Link href="/" className="topbar-logo-link">
          <TopbarLogo className="topbar-logo-svg" />
        </Link>
        <Link href="/notifications" className="icon-btn notification-btn" aria-label="Notifications">
          <IoNotificationsOutline size={28} />
          {unreadCount > 0 && <span className="notification-badge" />}
        </Link>
      </div>

      <div className="topbar-inner">
        {/* Left: Logo (Desktop uses Sidebar, mobile uses the row above) */}
        <Link href="/" className="topbar-logo-link desktop-only">
          <TopbarLogo className="topbar-logo-svg" />
        </Link>

        {/* Center: Search (Desktop & Mobile styled separately in CSS) */}
        <div className="topbar-search">
          <IoSearchOutline size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search events..."
            className="search-input"
          />
          <button className="location-btn" aria-label="Near me">
            <IoLocationOutline size={18} />
          </button>
        </div>

        {/* Right: Actions (Desktop only - Mobile uses Bottom Nav for profile) */}
        <div className="topbar-actions desktop-only">
          {/* Notifications (Desktop version) */}
          <Link href="/notifications" className="icon-btn notification-btn" aria-label="Notifications">
            <IoNotificationsOutline size={20} />
            {unreadCount > 0 && <span className="notification-badge" />}
          </Link>

          {/* Profile / Auth */}
          {user ? (
            <Link href="/profile" className="profile-link">
              {user.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  width={36}
                  height={36}
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-fallback">
                  {(user.email?.[0] || "U").toUpperCase()}
                </div>
              )}
            </Link>
          ) : (
            <button onClick={() => signInWithGoogle()} className="signin-btn">
              <IoLogInOutline size={18} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
