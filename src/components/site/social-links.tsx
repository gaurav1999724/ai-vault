import type { PublicProfile } from "@/types/content";

export function socialItems(profile: Pick<PublicProfile, "instagramUrl" | "youtubeUrl" | "githubUrl" | "otherSocial">) {
  const items: { label: string; href: string }[] = [];
  if (profile.instagramUrl) items.push({ label: "Instagram", href: profile.instagramUrl });
  if (profile.youtubeUrl) items.push({ label: "YouTube", href: profile.youtubeUrl });
  if (profile.githubUrl) items.push({ label: "GitHub", href: profile.githubUrl });
  for (const item of profile.otherSocial) items.push({ label: item.label, href: item.url });
  return items;
}

export function SocialLinks({ profile }: { profile: Pick<PublicProfile, "instagramUrl" | "youtubeUrl" | "githubUrl" | "otherSocial"> }) {
  const items = socialItems(profile);
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
      {items.map((item) => (
        <li key={item.label}>
          <a data-cursor="link" className="text-muted hover:text-cyan" href={item.href} target="_blank" rel="noreferrer">
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
