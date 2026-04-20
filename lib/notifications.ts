import { supabase } from "./supabase";

/**
 * Create a notification record in Supabase for a target user.
 * Mirrors the mobile createNotification logic with idempotency check.
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    // Idempotency: skip if an identical notification was created in the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("type", type)
      .eq("title", title)
      .eq("body", body)
      .gt("created_at", thirtySecondsAgo)
      .maybeSingle();

    if (existing) {
      console.log(`[Notification] Duplicate detected within 30s. Skipping. ID: ${existing.id}`);
      return { success: true, notificationId: existing.id };
    }

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        body,
        data: data || {},
        read: false,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Notification] Insert error:", error);
      throw error;
    }

    console.log(`[Notification] Created. ID: ${notification?.id}`);
    return { success: true, notificationId: notification?.id };
  } catch (error: any) {
    // Suppress known schema check errors
    if (error?.message?.includes("notifications_type_check")) {
      return { success: false, error: "type_not_supported" };
    }
    console.error("[Notification] Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify the event organizer that a new attendee joined their event.
 */
export async function notifyNewAttendee(
  eventId: string,
  organizerId: string,
  attendeeName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("title")
      .eq("id", eventId)
      .single();

    if (eventError) throw eventError;

    const result = await createNotification(
      organizerId,
      "new_attendee",
      "New attendee!",
      `${attendeeName} joined your event "${event.title}"`,
      { event_id: eventId, event_title: event.title }
    );

    return { success: result.success, error: result.error };
  } catch (error: any) {
    console.error("[notifyNewAttendee] Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify the event organizer that an attendee cancelled.
 */
export async function notifyAttendeeCancellation(
  eventId: string,
  organizerId: string,
  attendeeName: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("title")
      .eq("id", eventId)
      .single();

    if (eventError) throw eventError;

    const body = reason
      ? `${attendeeName} cancelled attendance for "${event.title}". Reason: ${reason}`
      : `${attendeeName} cancelled attendance for "${event.title}"`;

    const result = await createNotification(
      organizerId,
      "attendee_cancel",
      `Attendee cancelled: ${event.title}`,
      body,
      { event_id: eventId, event_title: event.title, cancellation_reason: reason }
    );

    return { success: result.success, error: result.error };
  } catch (error: any) {
    console.error("[notifyAttendeeCancellation] Error:", error);
    return { success: false, error: error.message };
  }
}
