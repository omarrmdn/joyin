"use client";

import { IoChatbubblesOutline } from "react-icons/io5";
import { useLanguage } from "@/lib/language-context";

export default function MessagesPage() {
  const { t } = useLanguage();

  return (
    <div className="empty-chat-state">
      <IoChatbubblesOutline size={64} className="empty-chat-icon" />
      <h2>{t.yourMessages}</h2>
      <p>{t.selectConversation}</p>
    </div>
  );
}
