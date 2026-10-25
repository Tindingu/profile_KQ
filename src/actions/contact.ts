"use server";
import { contactSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/security";
import { db } from "@/lib/db";
import { headers } from "next/headers";
export async function submitContact(input: unknown) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "Vui lòng kiểm tra các trường thông tin." };
  try {
    const ip =
      (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
    if (
      !(await rateLimit(`contact-ip:${ip}`, 10, 60 * 60 * 1000)) ||
      !(await rateLimit(
        `contact-email:${parsed.data.email.toLowerCase()}`,
        3,
        60 * 60 * 1000,
      ))
    )
      return {
        ok: false,
        error: "Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau.",
      };
    const { website, eventDate, ...data } = parsed.data;
    void website;
    const row = await db.contactSubmission.create({
      data: { ...data, eventDate: eventDate ? new Date(eventDate) : null },
    });
    if (
      process.env.RESEND_API_KEY &&
      process.env.EMAIL_FROM &&
      process.env.ADMIN_NOTIFY_EMAIL
    ) {
      let status = "FAILED";
      try {
        const result = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: process.env.ADMIN_NOTIFY_EMAIL,
            subject: `Booking mới: ${data.name}`,
            text: `${data.name}\n${data.email}\n${data.phone}\n${data.service}\n${data.message}`,
          }),
          signal: AbortSignal.timeout(8000),
        });
        status = result.ok ? "SENT" : "FAILED";
      } catch {}
      await db.contactSubmission.update({
        where: { id: row.id },
        data: { notificationStatus: status },
      });
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Chưa gửi được yêu cầu. Vui lòng thử lại." };
  }
}
