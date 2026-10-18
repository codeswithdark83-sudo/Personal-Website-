import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { BookOpen, Code2, Puzzle, Users } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Timeline } from "@/components/credentials/timeline";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getAbout, getEducation, getJourney, getProfile } from "@/lib/content";

export const metadata: Metadata = pageMetadata({ title: "About", description: "Background, journey and working principles.", path: "/about" });

const principles = [["Problem Solver", Puzzle], ["Team Player", Users], ["Continuous Learner", BookOpen], ["Clean Code", Code2]] as const;
const interests = ["Web Development", "Technology", "UI/UX", "Photography", "Travel"];

// Public content is cached and refreshed at most every 5 minutes; admin edits also revalidate on demand.
export const revalidate = 300;

export default async function AboutPage() {
  const [profile, about, journey, education] = await Promise.all([getProfile(), getAbout(), getJourney(), getEducation()]);
  return (
    <>
      <div className="glow border-b border-border/60">
        <div className="container-page grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2">
          <div className="space-y-8">
            <SectionHeading as="h1" eyebrow="About me" title={about.title} description={about.body} />
            <ul className="grid gap-3 xs:grid-cols-2">
              {principles.map(([label, Icon]) => (
                <li key={label} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium">
                  <Icon className="size-4 text-accent" aria-hidden />{label}
                </li>
              ))}
            </ul>
          </div>
          <Image src="/images/about-workspace.webp" alt="A plant beside a laptop displaying code" width={554} height={436} priority sizes="(min-width: 1024px) 36rem, 100vw" className="h-auto w-full max-w-xl justify-self-center rounded-2xl border border-border lg:justify-self-end" />
        </div>
      </div>
      <div className="container-page grid gap-10 py-12 md:grid-cols-2">
        <section aria-labelledby="journey"><h2 id="journey" className="mb-5 text-xl font-semibold">My Journey</h2><Timeline entries={journey} empty="No journey entries yet." /></section>
        <div className="space-y-10">
          <section aria-labelledby="edu"><h2 id="edu" className="mb-5 text-xl font-semibold">Education</h2><Timeline entries={education} empty="No education added yet." /></section>
          <Card>
            <h2 className="text-xl font-semibold">Interests</h2>
            <ul className="mt-4 flex flex-wrap gap-2">{interests.map((i) => <li key={i}><Badge className="px-3 py-1 text-sm">{i}</Badge></li>)}</ul>
          </Card>
        </div>
        <div className="flex flex-col gap-3 xs:flex-row md:col-span-2">
          <ButtonLink href="/contact">Hire Me</ButtonLink>
          {profile.resumeUrl && <a href={profile.resumeUrl} download className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-medium">Download Resume</a>}
        </div>
      </div>
    </>
  );
}
