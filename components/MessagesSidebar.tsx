"use client";

import { IoSearchOutline } from "react-icons/io5";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useMessages } from "@/hooks/useMessages";
import { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Helper to parse date string safely as UTC
const parseUTCDate = (dateString: string) => {
  if (!dateString) return new Date();
  let str = dateString;
  if (str.includes(' ') && !str.includes('T')) {
    str = str.replace(' ', 'T');
  }
  if (!str.includes('Z') && !str.includes('+') && !/-\d{2}:?\d{2}$/.test(str)) {
    str += 'Z';
  }
  return new Date(str);
};

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  lastTimestamp: string;
  unread: boolean;
  unreadCount: number;
  avatar: string | null;
  otherUserId: string;
};

export function MessagesSidebar({ isRootPath }: { isRootPath: boolean }) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { messages, loading, markAsRead, markAllAsRead } = useMessages();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const formatTimeForList = (dateString: string) => {
    const date = parseUTCDate(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const mins = minutes < 10 ? `0${minutes}` : minutes;
        return `${hours}:${mins} ${ampm}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return t.yesterday;
    }
    
    const locale = language === "ar-EG" ? "ar-EG" : "en-US";

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      return date.toLocaleDateString(locale, { weekday: 'short' });
    }
    
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // Group messages into conversations
  const conversations = useMemo(() => {
    if (!messages) return [];

    const groups: Record<string, Conversation> = {};

    messages.forEach((msg) => {
      const isFromMe = msg.sender_id === user?.id;
      const otherUser = isFromMe ? msg.recipient : msg.sender;
      const otherUserId = isFromMe ? msg.recipient_id : msg.sender_id;
      const convId = `${otherUserId}`;

      if (!groups[convId]) {
        groups[convId] = {
          id: convId,
          name: otherUser?.name || "Unknown User",
          lastMessage: msg.body,
          time: formatTimeForList(msg.created_at),
          lastTimestamp: msg.created_at,
          unread: !isFromMe && !msg.read,
          unreadCount: (!isFromMe && !msg.read) ? 1 : 0,
          avatar: otherUser?.image_url || null,
          otherUserId,
        };
      } else {
          // Increment unread count if it's an unread message from the other person
          if (!isFromMe && !msg.read) {
              groups[convId].unreadCount = (groups[convId].unreadCount || 0) + 1;
          }
      }

      // Update last message info if this message is newer
      if (msg.created_at > groups[convId].lastTimestamp) {
        groups[convId].lastMessage = msg.body;
        groups[convId].time = formatTimeForList(msg.created_at);
        groups[convId].lastTimestamp = msg.created_at;
        groups[convId].unread = !isFromMe && !msg.read;
      }
    });

    // Sort conversations by last message timestamp
    return Object.values(groups).sort((a, b) => {
        return b.lastTimestamp.localeCompare(a.lastTimestamp);
    });
  }, [messages, user, language]);

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`messages-list-panel ${!isRootPath ? 'hidden-on-mobile' : ''}`}>
      <header className="messages-sidebar-header">
        <h1>{t.messages}</h1>
      </header>

      <div className="messages-search-box-wrapper">
        <div className="search-box dark-search">
            <IoSearchOutline size={18} className="search-icon" />
            <input 
            type="text" 
            placeholder={t.searchConversations} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      <div className="messages-list-content">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="loading-spinner" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((msg) => {
            const isActive = pathname?.includes(`/messages/chat/${msg.id}`);
            return (
                <div 
                  key={msg.id} 
                  className={`message-item-sidebar ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (msg.unread) {
                      const lastMsg = messages.find(m => 
                        m.recipient_id === user?.id && 
                        m.sender_id === msg.otherUserId && 
                        !m.read
                      );
                      if (lastMsg) markAsRead(lastMsg.id);
                    }
                    router.push(`/messages/chat/${msg.id}`);
                  }}
                >
                  <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--card-background)' }}>
                    <Image 
                      src={msg.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"} 
                      alt={msg.name} 
                      width={50} 
                      height={50} 
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                  <div className="message-content">
                    <div className="message-top">
                      <span className="message-name">{msg.name}</span>
                      <span className={`message-time ${msg.unread ? 'unread' : ''}`}>
                        {msg.time}
                      </span>
                    </div>
                    <div className="message-bottom">
                      <span className={`message-excerpt ${msg.unread ? 'unread-text' : ''}`}>
                        {msg.lastMessage}
                      </span>
                      {msg.unread && msg.unreadCount > 0 && (
                        <div className="unread-badge">{msg.unreadCount}</div>
                      )}
                    </div>
                  </div>
                </div>
            );
          })
        ) : (
          <div className="empty-text" style={{ textAlign: 'center', marginTop: 40 }}>
            {t.noMessagesFound}
          </div>
        )}
      </div>
    </div>
  );
}
