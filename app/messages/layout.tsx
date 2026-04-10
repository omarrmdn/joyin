"use client";

import { TopBar } from "@/components/TopBar";
import { MessagesSidebar } from "@/components/MessagesSidebar";
import { usePathname } from "next/navigation";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRootPath = pathname === "/messages";

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar />
      </div>
      <div className="messages-split-view">
        <MessagesSidebar isRootPath={isRootPath} />
        <div className={`messages-chat-panel ${isRootPath ? 'hidden-on-mobile' : ''}`}>
          {children}
        </div>
      </div>
    </>
  );
}
