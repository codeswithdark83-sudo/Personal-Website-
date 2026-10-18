import { HeroSection } from "@/components/home/hero-section";
import { Highlights } from "@/components/home/highlights";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { SkillsOverview } from "@/components/home/skills-overview";
import { ServicesPreview } from "@/components/home/services-preview";
import { WorkProcess } from "@/components/home/work-process";
import { ContactCTA } from "@/components/home/contact-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { getFeaturedProjects, getProfile, getServices, getSkills, getSocialLinks } from "@/lib/content";

// Public content is cached and refreshed at most every 5 minutes; admin edits also revalidate on demand.
export const revalidate = 300;

export default async function HomePage() {
  const [profile, links, featured, skills, services] = await Promise.all([
    getProfile(), getSocialLinks(), getFeaturedProjects(), getSkills(), getServices(),
  ]);
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url },
          {
            "@type": "Person", name: profile.displayName, jobTitle: profile.headline, url: siteConfig.url, description: profile.bio,
            sameAs: links.filter((l) => /^https?:/.test(l.url) && l.platform !== "whatsapp").map((l) => l.url),
          },
        ],
      }} />
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
