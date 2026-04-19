"use client";

import { IoChatbubblesOutline } from "react-icons/io5";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const { t } = useLanguage();

  return (
    <div className="empty-chat-state">
      <IoChatbubblesOutline size={64} className="empty-chat-icon" />
      <h2>{t.yourMessages}</h2>
      <p>{t.selectConversation}</p>
    </div>
  );
}
