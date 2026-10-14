import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { getProfile, getSettings } from "@/lib/data/public";

export const metadata: Metadata = { title: "Contact", description: "Send a note to the studio." };

export default async function ContactPage() {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);
  const email = settings.contactEmail || profile.contactEmail;
  return (
    <div className="mx-auto grid max-w-[1440px] gap-12 px-5 pb-24 pt-32 md:px-8 lg:grid-cols-2">
      <div>
        <h1 className="font-display text-7xl">Contact</h1>
        <p className="mt-5 max-w-md text-lg text-muted">
          Messages are checked on the server and stored for the administrator. Email delivery runs only when SMTP is configured.
        </p>
        {email ? <a className="mt-6 inline-block text-cyan" href={`mailto:${email}`}>{email}</a> : null}
      </div>
      <ContactForm />
    </div>
  );
}
