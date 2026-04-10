"use client";

import { IoChatbubblesOutline } from "react-icons/io5";

export default function MessagesPage() {
  return (
    <div className="empty-chat-state">
      <IoChatbubblesOutline size={64} className="empty-chat-icon" />
      <h2>Your Messages</h2>
      <p>Select a conversation from the sidebar to view your chat or start messaging.</p>
    </div>
  );
}
