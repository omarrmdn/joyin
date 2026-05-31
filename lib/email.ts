"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = "Joyin <notifications@joyin.online>"; // Update domain if needed

export async function sendEventCanceledEmail(
  toEmail: string,
  eventTitle: string
) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_api_key_here") {
    console.log(`[Email Mock] Event Canceled sent to ${toEmail} for event: ${eventTitle}`);
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      reply_to: "joyin.app@outlook.com",
      subject: "Event Canceled",
      html: `<p>Hello,</p><p>We wanted to let you know that the event <strong>"${eventTitle}"</strong> has been canceled by the organizer.</p><p>Thank you,<br/>The Joyin Team</p>`,
    });

    if (error) {
      console.error("[sendEventCanceledEmail] Error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("[sendEventCanceledEmail] Exception:", error);
    return { success: false, error };
  }
}

export async function sendSupportMessageEmail(
  toEmail: string,
  title: string,
  message: string
) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_api_key_here") {
    console.log(`[Email Mock] Support Message sent to ${toEmail}: ${title}`);
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      reply_to: "joyin.app@outlook.com",
      subject: `Joyin Support: ${title}`,
      html: `<p>Hello,</p><p>${message}</p><p>Thank you,<br/>The Joyin Team</p>`,
    });

    if (error) {
      console.error("[sendSupportMessageEmail] Error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("[sendSupportMessageEmail] Exception:", error);
    return { success: false, error };
  }
}

export async function sendFeeWarningEmail(toEmail: string, feeAmount: number) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_api_key_here") {
    console.log(`[Email Mock] Fee Warning sent to ${toEmail} for amount: ${feeAmount} EGP`);
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      reply_to: "joyin.app@outlook.com",
      subject: "Warning: Unpaid Fees for Past Events",
      html: `<p>Hello,</p><p>You have unpaid fees of <strong>${feeAmount} EGP</strong> from your previously organized events.</p><p>Please settle these fees as soon as possible to avoid account restrictions.</p><p>Thank you,<br/>The Joyin Team</p>`,
    });

    if (error) {
      console.error("[sendFeeWarningEmail] Error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("[sendFeeWarningEmail] Exception:", error);
    return { success: false, error };
  }
}

export async function sendBannedEmail(toEmail: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "your_resend_api_key_here") {
    console.log(`[Email Mock] Banned Email sent to ${toEmail}`);
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      reply_to: "joyin.app@outlook.com",
      subject: "Account Restricted due to Unpaid Fees",
      html: `<p>Hello,</p><p>Your account has been restricted from joining or creating events because your unpaid fees have been overdue for more than 5 days.</p><p>You can currently only browse events. Please pay your outstanding fees via the checkout page to restore your full account privileges.</p><p>Thank you,<br/>The Joyin Team</p>`,
    });

    if (error) {
      console.error("[sendBannedEmail] Error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (error) {
    console.error("[sendBannedEmail] Exception:", error);
    return { success: false, error };
  }
}
