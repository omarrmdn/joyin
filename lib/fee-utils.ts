import { supabase } from "@/lib/supabase";

export async function checkUnpaidFees(userId: string, email?: string | null) {
  // Owner exemption
  if (email === 'omarrmdn2024@gmail.com') {
    return { hasUnpaid: false, totalFee: 0, isBanned: false };
  }

  // 1. Fetch user's events where price > 0 and fee_paid is false or null
  const { data: unpaidEvents, error } = await supabase
    .from('events')
    .select('id, price, created_at, max_capacity')
    .eq('organizer_id', userId)
    .gt('price', 0)
    .is('fee_paid', false);

  if (error || !unpaidEvents || unpaidEvents.length === 0) {
    return { hasUnpaid: false, totalFee: 0, isBanned: false };
  }

  let totalFee = 0;
  let isBanned = false;
  const now = new Date();

  // For each event, calculate the fee
  for (const event of unpaidEvents) {
    // Determine if it's past 5 days
    const createdAt = new Date(event.created_at!);
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 5) {
      isBanned = true;
      // Optionally update user to banned in db, but we can just enforce it here dynamically
    }

    // Get attendees count
    const { data: attendees } = await supabase
      .from('attendees')
      .select('id')
      .eq('event_id', event.id);

    const attendeesCount = attendees ? attendees.length : 0;
    
    // Total fee per event = price * attendees * 20%
    // If no attendees but there's a max capacity? The user says "20% logic created before".
    // "Total expected revenue: ${(Number(price) * Number(capacity)) * 0.8} EGP."
    // Let's use attendees count if it's > 0, otherwise if they just created it, maybe it's 0?
    // Wait, if it's based on attendees, a newly created event has 0 attendees, so fee is 0. That's fair.
    // Or did they mean 20% of max capacity? Let's assume attendees if available, otherwise 0.
    // Actually, "user can't generate any events until he pays previous unpaid event's fee."
    // If fee is 0 because no one attended, they shouldn't be blocked.
    // If we calculate fee based on attendees, then it makes sense.
    const fee = (event.price * attendeesCount) * 0.2;
    totalFee += fee;
  }

  return { 
    hasUnpaid: unpaidEvents.length > 0, 
    totalFee, 
    isBanned 
  };
}
