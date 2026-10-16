import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/layout/page-header";
import { Timeline } from "@/components/credentials/timeline";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getAbout, getEducation, getJourney, getProfile } from "@/lib/content";

export const metadata: Metadata = { title: "About", description: "Background, journey and working principles.", alternates: { canonical: "/about" } };

const principles = ["Problem Solver", "Team Player", "Continuous Learner", "Clean Code"];
const interests = ["Web Development", "Technology", "UI/UX", "Photography", "Travel"];

// Public content is cached and refreshed at most every 5 minutes; admin edits also revalidate on demand.
export const revalidate = 300;

export default async function AboutPage() {
  const [profile, about, journey, education] = await Promise.all([getProfile(), getAbout(), getJourney(), getEducation()]);
  return (
    <>
      <PageHeader eyebrow="About me" title={about.title} description={about.body} />
      <div className="container-page space-y-14 py-10">
        <ul className="grid gap-3 xs:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => <li key={p} className="rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium">{p}</li>)}
        </ul>
        <Image src="/images/about-workspace.webp" alt="A plant beside a laptop displaying code" width={554} height={436} sizes="(min-width: 768px) 36rem, 100vw" className="mx-auto h-auto w-full max-w-xl rounded-2xl border border-border" />
        <div className="grid gap-10 md:grid-cols-2">
          <section aria-labelledby="journey"><h2 id="journey" className="mb-5 text-xl font-semibold">My Journey</h2><Timeline entries={journey} empty="No journey entries yet." /></section>
          <section aria-labelledby="edu"><h2 id="edu" className="mb-5 text-xl font-semibold">Education</h2><Timeline entries={education} empty="No education added yet." /></section>
        </div>
        <Card>
          <h2 className="text-xl font-semibold">Interests</h2>
          <ul className="mt-4 flex flex-wrap gap-2">{interests.map((i) => <li key={i}><Badge className="px-3 py-1 text-sm">{i}</Badge></li>)}</ul>
        </Card>
        <div className="flex flex-col gap-3 xs:flex-row">
          <ButtonLink href="/contact">Hire Me</ButtonLink>
          {profile.resumeUrl && <a href={profile.resumeUrl} download className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-5 text-sm font-medium">Download Resume</a>}
        </div>
      </div>
    </>
  );
}
