// SAMPLE CONTENT ONLY. Every entry here is a placeholder shown until real data exists in Supabase.
// Replace via the admin dashboard — nothing below describes real work, employers or results.
import type { BlogPost, Project, Service, SkillGroup, TimelineEntry, SectionBlock } from "@/types/content";

const TODO = "Sample text — replace this section with your real content in the admin dashboard.";

const caseTitles = [
  "Project overview", "Project type and timeline", "Problem statement", "Goals and requirements",
  "Intended users", "My role and responsibilities", "Planning and design decisions",
  "Technical stack and reasoning", "System architecture", "Database design and relationships",
  "APIs and integrations", "Main features", "Implementation process", "Technical challenges",
  "Solutions and trade-offs", "Testing and quality assurance", "Deployment", "Verified results",
  "Lessons learned", "Future improvements",
];

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const sections: SectionBlock[] = caseTitles.map((title) => ({ id: slugify(title), title, body: TODO }));

const base = { sections, isPlaceholder: true, featured: false, projectType: "Web Application" };

export const placeholderProjects: Project[] = [
  { ...base, slug: "taskflow", title: "TaskFlow", summary: "Productivity web app (sample entry).", category: "Productivity", technologies: ["Next.js", "Supabase", "Tailwind CSS"], featured: true, timeline: "Sample", role: "Full Stack Developer" },
  { ...base, slug: "ecomstore", title: "EcomStore", summary: "E-commerce platform (sample entry).", category: "E-commerce", technologies: ["Next.js", "Stripe", "Tailwind CSS"], featured: true },
  { ...base, slug: "blognest", title: "BlogNest", summary: "Blog platform (sample entry).", category: "Content", technologies: ["Next.js", "Supabase", "Markdown"], featured: true },
  { ...base, slug: "weatherpro", title: "WeatherPro", summary: "Weather dashboard (sample entry).", category: "Dashboard", technologies: ["React", "API", "Tailwind CSS"] },
  { ...base, slug: "fittrack", title: "FitTrack", summary: "Fitness tracker (sample entry).", category: "Productivity", technologies: ["Next.js", "Supabase", "Tailwind CSS"] },
  { ...base, slug: "portfolio-cms", title: "Portfolio CMS", summary: "Content management system (sample entry).", category: "Content", technologies: ["Next.js", "Supabase"] },
];

export const placeholderServices: Service[] = [
  { slug: "responsive-websites", icon: "monitor", title: "Responsive Website Development", description: "Modern, mobile-friendly and fast websites.", deliverables: ["Responsive layouts", "Cross-browser testing"] },
  { slug: "frontend", icon: "code", title: "Frontend Development", description: "Beautiful and interactive user interfaces with React and Next.js.", deliverables: ["Component library", "Accessible UI"] },
  { slug: "full-stack", icon: "layers", title: "Full Stack Web Applications", description: "End-to-end web applications with a modern tech stack.", deliverables: ["Database design", "Authentication", "Deployment"] },
  { slug: "ecommerce", icon: "cart", title: "E-commerce Websites", description: "Secure and scalable online stores.", deliverables: ["Catalog", "Checkout integration"] },
  { slug: "api-integrations", icon: "plug", title: "API Integrations", description: "Connect third-party services and tools.", deliverables: ["Integration code", "Error handling"] },
  { slug: "maintenance", icon: "wrench", title: "Website Maintenance", description: "Keep your website secure, updated and running smoothly.", deliverables: ["Updates", "Bug fixes"] },
];

export const placeholderSkills: SkillGroup[] = [
  { category: "Frontend", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML", "CSS"] },
  { category: "Backend", skills: ["Node.js", "Express.js", "Supabase", "PostgreSQL", "REST APIs"] },
  { category: "Tools & Others", skills: ["Git", "GitHub", "Docker", "VS Code", "Vercel", "Figma"] },
];

export const placeholderEducation: TimelineEntry[] = [
  { title: "Your Degree / Qualification", subtitle: "Your Institution", period: "Year – Year", description: "Add your verified education details in the admin dashboard." },
];

export const placeholderJourney: TimelineEntry[] = [
  { period: "Building now", title: "Creating modern web applications and exploring new technologies.", subtitle: "" },
  { period: "Full stack focus", title: "Learning across frontend, backend, APIs, and databases.", subtitle: "" },
  { period: "Getting started", title: "Started with HTML, CSS, and JavaScript, then kept building.", subtitle: "" },
];

export const placeholderPosts: BlogPost[] = [
  { slug: "sample-article", title: "Sample article — replace me", excerpt: "This is a placeholder post. Write and publish real articles from the admin dashboard.", category: "Web Development", tags: ["sample"], publishedAt: "2026-01-01", readingMinutes: 1, body: TODO, isPlaceholder: true },
];

export const processSteps = [
  { title: "Discover", text: "We talk through goals, users and constraints." },
  { title: "Design", text: "Wireframes and a UI direction you can react to." },
  { title: "Build", text: "Iterative development with regular check-ins." },
  { title: "Launch", text: "Testing, deployment and handover." },
];
