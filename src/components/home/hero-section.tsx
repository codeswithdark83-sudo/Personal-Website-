import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SocialLinks } from "@/components/layout/social-links";
import type { Profile } from "@/lib/content";
import type { SocialLink } from "@/types/content";

export function HeroSection({ profile, links }: { profile: Profile; links: SocialLink[] }) {
  return (
    <section className="glow">
      <div className="container-page grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:py-24">
        <div className="order-2 lg:order-1">
          <p style={{ "--d": "0ms" } as React.CSSProperties} className="rise text-xs font-medium uppercase tracking-[0.25em] text-accent">Hello, I&apos;m</p>
          <h1 style={{ "--d": "100ms" } as React.CSSProperties} className="rise mt-3 text-4xl font-semibold sm:text-5xl lg:text-6xl">{profile.displayName}</h1>
          <p style={{ "--d": "200ms" } as React.CSSProperties} className="rise mt-3 font-display text-xl sm:text-2xl">{profile.headline}</p>
          <p style={{ "--d": "300ms" } as React.CSSProperties} className="rise mt-5 max-w-xl text-base text-muted sm:text-lg">{profile.bio}</p>
          <div style={{ "--d": "400ms" } as React.CSSProperties} className="rise mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <ButtonLink href="/projects">View My Work</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">Hire Me</ButtonLink>
          </div>
          <div style={{ "--d": "500ms" } as React.CSSProperties} className="rise mt-6 flex flex-wrap items-center gap-4">
            <SocialLinks links={links} />
            {profile.resumeUrl ? (
              <a href={profile.resumeUrl} download className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-foreground">
                <Download className="size-4" aria-hidden /> Download Resume
              </a>
            ) : (
              <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-foreground">
                <Download className="size-4" aria-hidden /> Resume available on request
              </Link>
            )}
          </div>
        </div>
        <div className="order-1 mx-auto w-48 sm:w-64 lg:order-2 lg:w-full lg:max-w-sm">
          <div className="float-y glow-pulse relative aspect-square rounded-[2rem] border border-border bg-gradient-to-br from-accent-strong/40 to-elevated p-2">
            <div className="relative size-full overflow-hidden rounded-[1.6rem] bg-surface">
              <Image src={profile.avatarUrl ?? "/images/jatin-portrait.webp"} alt={`${profile.displayName} in his development workspace`} fill priority sizes="(min-width: 1024px) 24rem, 16rem" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
