import { Mail } from "lucide-react";
import { GithubIcon, InstagramIcon, LinkedinIcon, WhatsappIcon } from "@/components/ui/brand-icons";
import type { SocialLink } from "@/types/content";

const icons = {
  github: GithubIcon, linkedin: LinkedinIcon, instagram: InstagramIcon, whatsapp: WhatsappIcon, email: Mail,
} as const;

/** Renders only links that are actually configured; renders nothing when none exist. */
export function SocialLinks({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Social links">
      {links.map((l) => {
        const Icon = icons[l.platform];
        return (
          <li key={l.platform}>
            <a href={l.url} target={l.platform === "email" ? undefined : "_blank"} rel="noopener noreferrer" aria-label={l.label}
              className="inline-flex size-11 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-accent hover:text-accent">
              <Icon className="size-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
