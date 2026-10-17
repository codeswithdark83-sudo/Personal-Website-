// Fallback site config. Real values come from the admin-managed `site_settings` / `social_links`
// tables once Supabase is configured. Nothing here is invented personal data.
export const siteConfig = {
  name: "Jatin Kr. Koli",
  headline: "Full Stack Developer",
  description:
    "Portfolio of Jatin Kr. Koli, a full stack developer building modern, scalable and user-friendly web applications.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  coffeeUrl: "https://buymeacoffee.com/codeswithdb",
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/credentials", label: "Credentials" },
  { href: "/contact", label: "Contact" },
] as const;
