import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export type NotificationType =
  | "new_attendee"
  | "attendee_cancel"
  | "event_canceled"
  | "reminder_12hr"
  | "reminder_2hr"
  | "event_access"
  | "question"
  | "new_event"
  | "event_stats"
  | "recommendation"
  | "event_update"
  | "message"
  | "reminder_24hr" // This one is from mock data but standardizing
  | string;

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
  sent_at: string | null;
}

export function useNotifications() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    // Mock Data for Testing UI
    const mockNotifications: Notification[] = [
      {
        id: "mock1",
        user_id: "mock-user",
        title: "New Follower",
        body: "Michael Chen started following you. Check out their profile and upcoming events.",
        type: "new_attendee",
        data: { user_id: 'michael' },
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false,
        sent_at: null,
      },
      {
        id: "mock2",
        user_id: "mock-user",
        title: "Event Update",
        body: "The location for 'Design Workshop 2024' has been updated to Room 4B.",
        type: "event_update",
        data: { event_id: 'workshop-123' },
        created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        read: true,
        sent_at: null,
      },
      {
        id: "mock3",
        user_id: "mock-user",
        title: "Reminder",
        body: "Your event 'Startup Pitch Night' starts tomorrow at 6:00 PM.",
        type: "reminder_24hr",
        data: { event_id: 'startup-pitch' },
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        read: false,
        sent_at: null,
      },
      {
        id: "mock4",
        user_id: "mock-user",
        title: "New Message",
        body: "Elena Rodriguez sent you a message about the upcoming Meetup.",
        type: "message",
        data: { message_id: 'msg_1' },
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        read: true,
        sent_at: null,
      },
      {
        id: "mock5",
        user_id: "mock-user",
        title: "Weekly Stats",
        body: "Your events reached 450 people this week. Keep up the great work!",
        type: "event_stats",
        data: {},
        created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        read: true,
        sent_at: null,
      }
    ];

    if (!user?.id) {
      setLoading(false);
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.read).length);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("[useNotifications] Supabase error:", error);
        throw error;
      }

      const finalData = data && data.length > 0 ? data : mockNotifications;
      setNotifications(finalData);
      const unread = finalData.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ... (markAsRead and markAllAsRead remain the same below this, we'll just update useEffect)
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchNotifications();
    }
  }, [authLoading, fetchNotifications]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("web_notifications_list_update")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) => prev.map(n => n.id === updated.id ? updated : n));
          
          setNotifications(prev => {
            const unread = prev.filter(n => !n.read).length;
            setUnreadCount(unread);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
