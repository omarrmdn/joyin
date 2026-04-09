"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  Calendar, 
  PlusSquare, 
  MessageCircle, 
  User, 
  Bell,
  Settings,
  LogOut
} from "lucide-react";
import { UserButton, useClerk } from "@clerk/nextjs";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Explore", href: "/explore" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: PlusSquare, label: "Create", href: "/create" },
  { icon: MessageCircle, label: "Messages", href: "/messages" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <div className="sidebar">
      <div className="logo-container">
        <h1 className="logo-text">JOI<span>NO</span></h1>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={24} className="nav-item-icon" strokeWidth={isActive ? 2.5 : 2} />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-container">
          <UserButton afterSignOutUrl="/" />
          <div className="user-details">
            <span className="user-name">My Account</span>
          </div>
        </div>
        
        <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
          <Settings size={24} className="nav-item-icon" />
          <span className="nav-label">Settings</span>
        </Link>
        
        <button onClick={() => signOut()} className="nav-item logout-btn">
          <LogOut size={24} className="nav-item-icon" />
          <span className="nav-label">Logout</span>
        </button>
      </div>

      <style jsx global>{`
        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
        }

        .user-profile-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          margin-bottom: 0.5rem;
        }

        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .logout-btn {
          width: 100%;
          text-align: left;
          color: #ff4444 !important;
        }

        .logout-btn:hover {
          background-color: rgba(255, 68, 68, 0.1) !important;
        }

        @media (max-width: 768px) {
          .nav-label, .user-details {
            display: none;
          }
          .nav-item {
            justify-content: center;
            padding: 1rem;
          }
          .user-profile-container {
            justify-content: center;
          }
          .logo-text {
            text-align: center;
            padding: 0;
            font-size: 1.25rem;
          }
        }

        @media (max-width: 640px) {
          .sidebar {
            width: 100%;
            height: 70px;
            bottom: 0;
            top: auto;
            flex-direction: row;
            padding: 0 1rem;
            border-right: none;
            border-top: 1px solid var(--border);
            justify-content: space-around;
          }
          .logo-container, .sidebar-footer, .nav-label {
            display: none;
          }
          .nav-menu {
            flex-direction: row;
            width: 100%;
            justify-content: space-around;
            height: 100%;
            align-items: center;
          }
          .nav-item {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
