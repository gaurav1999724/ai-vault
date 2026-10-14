"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useFavoriteSlugs } from "@/lib/favorites-client";
import { Heart, Search } from "lucide-react";
import { LogoMark } from "@/components/site/logo-mark";
import { MobileNavigation } from "@/components/site/mobile-navigation";
import { SearchDialog } from "@/components/site/search-dialog";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/images", label: "AI Images" },
  { href: "/videos", label: "AI Videos" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ instagramUrl, handle }: { instagramUrl: string | null; handle: string | null }) {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const favorites = useFavoriteSlugs().length;
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return (
    <header className={cn("fixed inset-x-0 top-0 z-40 transition-colors duration-300", solid ? "bg-background/85 backdrop-blur-md" : "bg-transparent")}>
      <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-4 px-5 md:px-8">
        <Link href="/" data-cursor="link" className="flex items-center gap-3 text-ink">
          <LogoMark />
          <span className="leading-none">
            <span className="block text-[10px] tracking-[0.28em] text-muted">AI CREATIVE</span>
            <span className="font-display text-2xl">Vault</span>
          </span>
        </Link>
        <nav className="mx-auto hidden items-center gap-6 lg:flex" aria-label="Primary">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} data-cursor="link" aria-current={active ? "page" : undefined} className="relative py-2 text-sm text-ink/80 hover:text-ink">
                {link.label}
                {active ? <span className="absolute inset-x-0 -bottom-0.5 h-px bg-cyan" /> : null}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" aria-label="Search creations" data-cursor="link" className="icon-disc grid h-11 w-11 place-items-center" onClick={() => setSearchOpen(true)}>
            <Search size={16} />
          </button>
          <Link href="/favorites" aria-label={`Favorites, ${favorites} saved`} data-cursor="link" className="icon-disc relative grid h-11 w-11 place-items-center">
            <Heart size={16} className={favorites > 0 ? "fill-violet text-violet" : undefined} />
            {favorites > 0 ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-background px-1.5 py-0.5 text-[10px] leading-none tracking-[0.08em] text-cyan shadow-[0_0_0_1px_rgb(93_228_255/0.55)]">
                {favorites}
              </span>
            ) : null}
          </Link>
          {instagramUrl ? (
            <a href={instagramUrl} target="_blank" rel="noreferrer" data-cursor="link" className="hidden items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm text-background sm:inline-flex">
              Follow{handle ? ` @${handle.replace(/^@/, "")}` : ""}
            </a>
          ) : null}
          <MobileNavigation links={links} />
        </div>
      </div>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}

export function HeaderFallback() {
  return <div className="h-20" />;
}
