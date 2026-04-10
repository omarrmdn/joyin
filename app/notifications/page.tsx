"use client";

import { TopBar } from "@/components/TopBar";
import { IoPeople, IoCloseCircle, IoAlarm, IoMail, IoSparkles, IoKey, IoRefresh, IoBarChart, IoNotifications, IoNotificationsOffOutline, IoCheckmarkDone } from "react-icons/io5";

import { useNotifications } from "@/hooks/useNotifications";
import { useRouter } from "next/navigation";

const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date((!dateString.includes('Z') && !dateString.includes('+')) ? dateString + 'Z' : dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

export default function NotificationsPage() {
  const { notifications, loading, markAllAsRead, markAsRead } = useNotifications();
  const router = useRouter();

  const handleNotificationTap = (notif: any) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    
    // Navigate based on notification type and data
    const { type, data } = notif;
    if (!data) return;

    switch (type) {
      case "new_attendee":
      case "attendee_cancel":
      case "event_stats":
      case "reminder_12hr":
      case "reminder_2hr":
      case "reminder_24hr":
      case "new_event":
      case "event_access":
      case "recommendation":
      case "event_update":
        if (data.event_id) {
          router.push(`/explore/${data.event_id}`);
        }
        break;

      case "question":
      case "message":
        if (data.event_id) {
          router.push(`/explore/${data.event_id}`);
        } else {
          router.push("/messages");
        }
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_attendee":
        return IoPeople;
      case "attendee_cancel":
      case "event_canceled":
        return IoCloseCircle;
      case "reminder_24hr":
      case "reminder_12hr":
      case "reminder_2hr":
        return IoAlarm;
      case "question":
      case "message":
        return IoMail;
      case "new_event":
      case "recommendation":
        return IoSparkles;
      case "event_access":
        return IoKey;
      case "event_update":
        return IoRefresh;
      case "event_stats":
        return IoBarChart;
      default:
        return IoNotifications;
    }
  };

  return (
    <>
      <div className="topbar-wrapper">
        <TopBar />
      </div>

      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications</h1>
          {notifications.length > 0 && (
            <button className="mark-read-btn" onClick={markAllAsRead}>
              <IoCheckmarkDone size={18} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="loading-spinner" style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => {
              const Icon = getNotificationIcon(notif.type);
              const timeAgo = formatTimeAgo(notif.created_at);
              
              return (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.read ? "unread" : ""}`}
                  onClick={() => handleNotificationTap(notif)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="notif-icon-container">
                    <Icon size={24} color="var(--primary)" />
                  </div>

                  <div className="notif-content">
                    <div className="notif-row">
                      <span className="notif-title">{notif.title}</span>
                      <span className="notif-time">{timeAgo}</span>
                    </div>
                    <p className="notif-body">
                      {notif.body}
                    </p>
                  </div>

                  {!notif.read && <div className="notif-unread-dot" />}
                </div>
              );
            })
          ) : (
            <div className="notifications-empty">
              <div className="empty-icon-circle">
                <IoNotificationsOffOutline size={64} />
              </div>
              <h3>No notifications</h3>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
