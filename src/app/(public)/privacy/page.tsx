import type { Metadata } from "next";
import { Markdown } from "@/components/content/markdown";
import { getSettings } from "@/lib/data/public";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8">
      <h1 className="font-display text-6xl">Privacy Policy</h1>
      <div className="mt-8">
        <Markdown content={settings.privacyBody} />
      </div>
    </article>
  );
}
