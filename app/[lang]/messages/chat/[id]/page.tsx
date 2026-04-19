"use client";

import { TopBar } from "@/components/TopBar";
import { IoSend, IoChevronBack, IoClose } from "react-icons/io5";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useMessages, DBMessage } from "@/hooks/useMessages";
import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

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

const formatTimeForBubble = (dateString: string) => {
  const date = parseUTCDate(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${displayMinutes} ${ampm}`;
};

type Conversation = {
  id: string;
  name: string;
  role: string | null;
  lastMessage: string;
  lastTimestamp: string;
  avatar: string | null;
  otherUserId: string;
  lastEventId: string | null;
  eventOrganizerId: string | null;
  messages: any[];
};

export default function ChatPage() {
  const { user } = useAuth();
  const { messages, loading, sendMessage, markAsRead } = useMessages();
  const router = useRouter();
  const params = useParams();
  
  const idParam = params?.id;
  const selectedConversationId = Array.isArray(idParam) ? idParam[0] : idParam;

  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const requestRef = useRef<number | null>(null);

  const scrollToBottom = (smooth = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  const conversations = useMemo(() => {
    if (!messages) return [];

    const groups: Record<string, Conversation> = {};

    messages.forEach((msg: DBMessage) => {
      const isFromMe = msg.sender_id === user?.id;
      const otherUser = isFromMe ? msg.recipient : msg.sender;
      const otherUserId = isFromMe ? msg.recipient_id : msg.sender_id;
      const eventId = msg.event_id;
      const convId = `${otherUserId}`;

      if (!groups[convId]) {
        groups[convId] = {
            id: convId,
            name: otherUser?.name || "Unknown User",
            role: msg.event?.title || "General",
            lastMessage: msg.body,
            lastTimestamp: msg.created_at,
            avatar: otherUser?.image_url || null,
            otherUserId,
            lastEventId: eventId ?? null,
            eventOrganizerId: msg.event?.organizer_id || null,
            messages: [],
        };
      }

      if (msg.created_at > groups[convId].lastTimestamp) {
          groups[convId].lastTimestamp = msg.created_at;
          groups[convId].role = msg.event?.title || "General";
          groups[convId].lastEventId = eventId ?? null;
          groups[convId].eventOrganizerId = msg.event?.organizer_id || null;
      }

      groups[convId].messages.push({
        id: msg.id,
        text: msg.body,
        time: formatTimeForBubble(msg.created_at),
        timestamp: msg.created_at,
        fromMe: isFromMe,
        link: msg.event_link,
        type: msg.message_type,
        subject: msg.subject,
        unread: !isFromMe && !msg.read,
      });
    });

    Object.values(groups).forEach(conv => {
        conv.messages.sort((a, b) => a.timestamp.localeCompare(b.timestamp)); 
    });

    return Object.values(groups);
  }, [messages, user]);

  const selectedConversation = useMemo(() => 
    conversations.find(c => c.id === selectedConversationId), 
    [conversations, selectedConversationId]
  );
  
  const isOrganizer = !!(user?.id && selectedConversation?.eventOrganizerId && user.id === selectedConversation.eventOrganizerId);
  const headerSubtitle = isOrganizer
    ? "Attendee"
    : `Organizer of ${selectedConversation?.role || "Event"}`;

  useEffect(() => {
    if (selectedConversation) {
        selectedConversation.messages.forEach(msg => {
            if (msg.unread && msg.id && user) {
                markAsRead(msg.id);
            }
        });
    }
  }, [selectedConversation, user, markAsRead]);

  useEffect(() => {
    requestRef.current = window.requestAnimationFrame(() => {
        scrollToBottom();
    });
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
  }, [selectedConversation?.messages?.length]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    try {
        await sendMessage({
            body: inputValue.trim(),
            recipient_id: selectedConversation.otherUserId,
            event_id: selectedConversation.lastEventId ?? null,
            message_type: 'general',
        });
        setInputValue("");
    } catch (err) {
        console.error("Failed to send message:", err);
    } finally {
        setIsSending(false);
        scrollToBottom(true);
    }
  };

  if (!selectedConversation && loading) {
      return (
          <div className="chat-container">
              <div className="flex items-center justify-center h-full w-full">
                  <div className="loading-spinner" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
          </div>
      )
  }

  if (!selectedConversation) {
      return (
          <div className="flex bg-black flex-col items-center justify-center h-full w-full p-8 text-center text-secondary-text">
              <p>Chat not found.</p>
              <button onClick={() => router.push("/messages")} className="mt-4 text-primary font-bold">Go Back to Messages</button>
          </div>
      );
  }

  return (
      <div className="chat-container">
        <div className="chat-header">
            <button className="chat-back-btn desktop-invisible" onClick={() => router.push("/messages")}>
                <IoChevronBack size={24} className="rtl-flip" />
            </button>
            <div className="chat-header-info">
                {selectedConversation.avatar ? (
                    <Image 
                        src={selectedConversation.avatar} 
                        alt={selectedConversation.name} 
                        width={48} 
                        height={48} 
                        className="chat-header-avatar"
                    />
                ) : (
                    <div className="chat-header-avatar-fallback">
                        {selectedConversation.name[0].toUpperCase()}
                    </div>
                )}
                <div className="chat-header-text">
                    <span className="chat-header-name">{selectedConversation.name}</span>
                    <span className="chat-header-role">{headerSubtitle}</span>
                </div>
            </div>
            <button 
                className="chat-back-btn hidden-on-mobile" 
                onClick={() => router.push("/messages")}
                style={{ marginLeft: 'auto' }}
            >
                <IoClose size={24} />
            </button>
        </div>

        <div className="chat-messages-area">
            {selectedConversation.messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble-wrapper ${msg.fromMe ? 'from-me' : 'from-other'}`}>
                    <div className="chat-bubble">
                        {msg.text}
                    </div>
                    <span className="chat-bubble-time">{msg.time}</span>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
            <input 
                type="text" 
                className="chat-input"
                placeholder="Type your message..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
            <button 
                type="submit" 
                className="chat-send-btn" 
                disabled={!inputValue.trim() || isSending}
            >
                {isSending ? (
                   <div className="loading-spinner" style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--white)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                    <IoSend size={18} />
                )}
            </button>
        </form>
      </div>
  );
}
