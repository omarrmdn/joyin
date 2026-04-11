"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  IoHome, IoHomeOutline,
  IoCalendar, IoCalendarOutline,
  IoAddCircle, IoAddCircleOutline,
  IoChatbubbleEllipses, IoChatbubbleEllipsesOutline,
  IoPerson, IoPersonOutline,
  IoLogOutOutline
} from "react-icons/io5";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import TopbarLogo from "./TopbarLogo";

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { iconFilled: IoHome, iconOutline: IoHomeOutline, label: t.home, href: "/" },
    { iconFilled: IoAddCircle, iconOutline: IoAddCircleOutline, label: t.create, href: "/create" },
    { iconFilled: IoCalendar, iconOutline: IoCalendarOutline, label: t.myEvents, href: "/events" },
    { iconFilled: IoChatbubbleEllipses, iconOutline: IoChatbubbleEllipsesOutline, label: t.messages, href: "/messages" },
    { iconFilled: IoPerson, iconOutline: IoPersonOutline, label: t.profile, href: "/profile" },
  ];

  return (
    <div className="sidebar desktop-only">
      <div className="logo-container">
        <Link href="/">
           <TopbarLogo className="sidebar-logo-svg" />
        </Link>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.iconFilled : item.iconOutline;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={24} className="nav-item-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <Link href="/profile" className="user-profile-link">
            <div className="user-profile-container">
              {user.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt={t.profile}
                  width={36}
                  height={36}
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-fallback">
                  <IoPersonOutline size={18} />
                </div>
              )}
              <div className="user-details">
                <span className="user-name">
                  {user.user_metadata?.full_name || user.email?.split("@")[0] || t.myAccount}
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>

    </div>
  );
}
