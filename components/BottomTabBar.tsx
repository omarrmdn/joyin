"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  IoHome, IoHomeOutline,
  IoCalendar, IoCalendarOutline,
  IoAdd,
  IoChatbubbleEllipses, IoChatbubbleEllipsesOutline,
  IoPerson, IoPersonOutline
} from "react-icons/io5";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";

export function BottomTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t, locale } = useLanguage();

  const localizeHref = (href: string) => {
    if (href === "/") return locale === "" ? "/" : locale;
    return `${locale}${href}`;
  };

  const tabs = [
    { href: "/", label: t.home, iconFilled: IoHome, iconOutline: IoHomeOutline },
    { href: "/events", label: t.myEvents, iconFilled: IoCalendar, iconOutline: IoCalendarOutline },
    { href: "/create", isAdd: true },
    { href: "/messages", label: t.messages, iconFilled: IoChatbubbleEllipses, iconOutline: IoChatbubbleEllipsesOutline },
    { href: "/profile", label: t.you, iconFilled: IoPerson, iconOutline: IoPersonOutline },
  ];

  return (
    <nav className="bottom-tab-bar">
      {tabs.map((tab, i) => {
        const localizedPath = localizeHref(tab.href);
        const isActive = pathname === localizedPath || (pathname === "/" && tab.href === "/");

        const targetHref = (!user && tab.href !== "/") ? localizeHref("/login") : localizedPath;

        if (tab.isAdd) {
          return (
            <Link key="add" href={targetHref} className="tab-item-add" aria-label={t.createEvent}>
              <IoAdd size={32} />
            </Link>
          );
        }

        const Icon = isActive ? tab.iconFilled! : tab.iconOutline!;
        
        if (tab.href === "/profile" && user?.user_metadata?.avatar_url) {
          return (
            <Link key={tab.href} href={targetHref} className={`tab-item ${isActive ? "active" : ""}`}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", overflow: "hidden", 
                border: isActive ? "1px solid var(--primary)" : "1px solid var(--gray)"
              }}>
                <Image src={user.user_metadata.avatar_url} alt={t.profile} width={24} height={24} style={{objectFit: "cover"}} />
              </div>
              <span className="tab-item-label">{tab.label}</span>
            </Link>
          );
        }

        return (
          <Link key={tab.href} href={targetHref} className={`tab-item ${isActive ? "active" : ""}`}>
            <Icon size={24} />
            <span className="tab-item-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
