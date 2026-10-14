import type { Metadata } from "next";
import { Suspense } from "react";
import { HeaderFallback, SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CustomCursor } from "@/components/site/custom-cursor";
import { SmoothScrollProvider } from "@/components/site/smooth-scroll-provider";
import { getProfile, getSettings } from "@/lib/data/public";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: { default: settings.defaultSeoTitle, template: `%s · ${settings.websiteTitle}` },
    description: settings.defaultSeoDescription,
    icons: settings.faviconUrl ? { icon: settings.faviconUrl } : undefined,
    openGraph: {
      siteName: settings.websiteTitle,
      description: settings.defaultSeoDescription,
      images: settings.socialImageUrl ? [settings.socialImageUrl] : undefined,
    },
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);
  return (
    <SmoothScrollProvider>
      <div className="grain pointer-events-none fixed inset-0 z-20" />
      <CustomCursor />
      <Suspense fallback={<HeaderFallback />}>
        <SiteHeader instagramUrl={profile.instagramUrl} handle={settings.instagramHandle} />
      </Suspense>
      <main id="content">{children}</main>
      <SiteFooter settings={settings} profile={profile} />
    </SmoothScrollProvider>
  );
}
