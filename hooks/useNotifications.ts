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
    if (!user?.id) {
      setLoading(false);
      setNotifications([]);
      setUnreadCount(0);
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

      const finalData: Notification[] = (data || []).map((n) => ({
        ...n,
        created_at: n.created_at || new Date().toISOString(),
        data: (n.data as Record<string, any>) || {},
        read: !!n.read,
      }));
      
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

    const channelId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(`web-notifications-update-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const raw = payload.new as any;
          const newNotification: Notification = {
            ...raw,
            created_at: raw.created_at || new Date().toISOString(),
            data: raw.data || {},
            read: !!raw.read
          };
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
          const raw = payload.new as any;
          const updated: Notification = {
            ...raw,
            created_at: raw.created_at || new Date().toISOString(),
            data: raw.data || {},
            read: !!raw.read
          };
          
          setNotifications((prev) => {
            const updatedList = prev.map(n => n.id === updated.id ? updated : n);
            const unread = updatedList.filter(n => !n.read).length;
            setUnreadCount(unread);
            return updatedList;
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
