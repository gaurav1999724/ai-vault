import "server-only";
import nodemailer from "nodemailer";

export function mailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

export async function sendContactMail(input: { name: string; email: string; subject: string; message: string }) {
  if (!mailConfigured()) return false;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.CONTACT_TO || process.env.SMTP_FROM,
    replyTo: input.email,
    subject: `[AI Creative Vault] ${input.subject}`,
    text: `${input.name} <${input.email}>\n\n${input.message}`,
  });
  return true;
}
