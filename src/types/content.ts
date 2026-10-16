export type SectionBlock = { id: string; title: string; body: string };

export type Project = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  projectType: string;
  technologies: string[];
  featured: boolean;
  liveUrl?: string;
  repositoryUrl?: string;
  timeline?: string;
  role?: string;
  sections: SectionBlock[];
  /** True while the entry is sample content that must be replaced with real work. */
  coverUrl?: string;
  isPlaceholder: boolean;
};

export type Service = {
  slug: string;
  title: string;
  description: string;
  icon: "monitor" | "code" | "layers" | "cart" | "plug" | "wrench";
  deliverables: string[];
  targetClient?: string;
  pricingNote?: string;
  timelineNote?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingMinutes: number;
  body: string;
  coverUrl?: string;
  isPlaceholder: boolean;
};

export type SkillGroup = { category: string; skills: string[] };
export type TimelineEntry = { title: string; subtitle: string; period: string; description?: string; url?: string };

export type SocialLink = { platform: "github" | "linkedin" | "instagram" | "whatsapp" | "email"; url: string; label: string };
