"use server";

import { prisma } from "@/lib/db";
import { sendContactMail } from "@/lib/mail";
import { isRateLimited, recordRateLimit } from "@/lib/rate-limit";
import { CONTACT_MAX_ATTEMPTS, CONTACT_WINDOW_MS } from "@/lib/constants";
import { contactSchema } from "@/lib/validators/contact";

export async function submitContact(_state: { message: string; ok: boolean }, formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    company: formData.get("company") || "",
    startedAt: formData.get("startedAt"),
  });
  if (!parsed.success) return { ok: false, message: "Check the form and try again." };
  if (parsed.data.company.trim()) return { ok: true, message: "Message received." };
  if (Date.now() - parsed.data.startedAt < 1500) return { ok: true, message: "Message received." };
  const email = parsed.data.email.toLowerCase();
  if (await isRateLimited("contact", email, CONTACT_MAX_ATTEMPTS, CONTACT_WINDOW_MS)) {
    return { ok: false, message: "Too many messages from this address. Try again later." };
  }
  await recordRateLimit("contact", email);
  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });
  await sendContactMail(parsed.data).catch(() => undefined);
  return { ok: true, message: "Message received. It is stored for the studio to read." };
}
