import Link from "next/link";
import { cacheLife } from "next/cache";
import { LogoMark } from "@/components/site/logo-mark";
import { SocialLinks } from "@/components/site/social-links";
import type { PublicProfile, PublicSettings } from "@/types/content";

async function copyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const links = [
  ["Home", "/"],
  ["Explore", "/explore"],
  ["Images", "/images"],
  ["Videos", "/videos"],
  ["Tutorials", "/tutorials"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export async function SiteFooter({ settings, profile }: { settings: PublicSettings; profile: PublicProfile }) {
  const year = await copyrightYear();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark />
            <span className="font-display text-3xl">{settings.websiteTitle}</span>
          </Link>
          <p className="mt-4 max-w-md text-muted">{settings.footerText}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          {links.map(([label, href]) => (
            <Link key={href} href={href} data-cursor="link" className="hover:text-cyan">
              {label}
            </Link>
          ))}
        </nav>
        <div className="space-y-4 text-sm">
          <SocialLinks profile={profile} />
          <div className="flex flex-col gap-2">
            <Link href="/privacy" className="hover:text-cyan">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-cyan">Terms of Use</Link>
            <Link href="/contact" className="hover:text-cyan">Contact</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-5 py-5 text-xs tracking-[0.16em] text-muted md:px-8">
        © {year} {settings.websiteTitle}
      </div>
    </footer>
  );
}
