import { HeroSection } from "@/components/home/hero-section";
import { Highlights } from "@/components/home/highlights";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { SkillsOverview } from "@/components/home/skills-overview";
import { ServicesPreview } from "@/components/home/services-preview";
import { WorkProcess } from "@/components/home/work-process";
import { ContactCTA } from "@/components/home/contact-cta";
import { getFeaturedProjects, getProfile, getServices, getSkills, getSocialLinks } from "@/lib/content";

// Public content is cached and refreshed at most every 5 minutes; admin edits also revalidate on demand.
export const revalidate = 300;

export default async function HomePage() {
  const [profile, links, featured, skills, services] = await Promise.all([
    getProfile(), getSocialLinks(), getFeaturedProjects(), getSkills(), getServices(),
  ]);
  return (
    <>
      <HeroSection profile={profile} links={links} />
      <Highlights />
      <FeaturedProjects projects={featured} />
      <SkillsOverview groups={skills} />
      <ServicesPreview services={services} />
      <WorkProcess />
      <ContactCTA />
    </>
  );
}
