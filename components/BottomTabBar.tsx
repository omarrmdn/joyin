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
import Image from "next/image";

const tabs = [
  { href: "/", label: "Home", iconFilled: IoHome, iconOutline: IoHomeOutline },
  { href: "/events", label: "My events", iconFilled: IoCalendar, iconOutline: IoCalendarOutline },
  { href: "/create", isAdd: true },
  { href: "/messages", label: "Messages", iconFilled: IoChatbubbleEllipses, iconOutline: IoChatbubbleEllipsesOutline },
  { href: "/profile", label: "You", iconFilled: IoPerson, iconOutline: IoPersonOutline },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="bottom-tab-bar">
      {tabs.map((tab, i) => {
        const isActive = pathname === tab.href;

        if (tab.isAdd) {
          return (
            <Link key="add" href={tab.href} className="tab-item-add" aria-label="Create Event">
              <IoAdd size={32} />
            </Link>
          );
        }

        const Icon = isActive ? tab.iconFilled! : tab.iconOutline!;
        
        // Special render for profile image
        if (tab.href === "/profile" && user?.user_metadata?.avatar_url) {
          return (
            <Link key={tab.href} href={tab.href} className={`tab-item ${isActive ? "active" : ""}`}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", overflow: "hidden", 
                border: isActive ? "1px solid var(--primary)" : "1px solid var(--gray)"
              }}>
                <Image src={user.user_metadata.avatar_url} alt="Profile" width={24} height={24} style={{objectFit: "cover"}} />
              </div>
              <span className="tab-item-label">{tab.label}</span>
            </Link>
          );
        }

        return (
          <Link key={tab.href} href={tab.href} className={`tab-item ${isActive ? "active" : ""}`}>
            <Icon size={24} />
            <span className="tab-item-label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
