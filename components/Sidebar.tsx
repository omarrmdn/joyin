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
  const { t, locale } = useLanguage();

  const localizeHref = (href: string) => {
    if (href === "/") return locale === "" ? "/" : locale;
    return `${locale}${href}`;
  };

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
        <Link href={localizeHref("/")}>
           <TopbarLogo className="sidebar-logo-svg" />
        </Link>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const localizedPath = localizeHref(item.href);
          const isActive = pathname === localizedPath || (pathname === "/" && item.href === "/");
          const Icon = isActive ? item.iconFilled : item.iconOutline;
          const targetHref = (!user && item.href !== "/") ? `${localizeHref("/login")}?redirect=${encodeURIComponent(localizedPath)}` : localizedPath;
          return (
            <Link 
              key={item.href} 
              href={targetHref}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              {item.href === "/profile" && user?.user_metadata?.avatar_url ? (
                <div className="nav-item-icon" style={{
                  width: 24, height: 24, borderRadius: "50%", overflow: "hidden", 
                  border: isActive ? "1px solid var(--primary)" : "1px solid var(--gray)"
                }}>
                  <Image src={user.user_metadata.avatar_url} alt={t.profile} width={24} height={24} style={{objectFit: "cover"}} />
                </div>
              ) : (
                <Icon size={24} className="nav-item-icon" />
              )}
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
