import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/page-header";
import { CredentialsTabs } from "@/components/credentials/credentials-tabs";
import { getCertifications, getEducation, getExperience, getSkills } from "@/lib/content";

export const metadata: Metadata = pageMetadata({ title: "Credentials", description: "Skills, education, certifications and experience.", path: "/credentials" });

// Public content is cached and refreshed at most every 5 minutes; admin edits also revalidate on demand.
export const revalidate = 300;

export default async function CredentialsPage() {
  const [skills, education, certifications, experience] = await Promise.all([getSkills(), getEducation(), getCertifications(), getExperience()]);
  return (
    <>
      <PageHeader title="Credentials" description="My skills, education, certifications and professional experience." />
      <div className="container-page py-10">
        <CredentialsTabs skills={skills} education={education} certifications={certifications} experience={experience} />
      </div>
    </>
  );
}
