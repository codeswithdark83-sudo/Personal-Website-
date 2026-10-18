import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPosts, getProjects } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const pages: [string, number][] = [["", 1], ["/projects", 0.9], ["/services", 0.9], ["/about", 0.8], ["/credentials", 0.7], ["/blog", 0.7], ["/contact", 0.8], ["/privacy", 0.2]];
  return [
    ...pages.map(([path, priority]) => ({ url: `${siteConfig.url}${path}`, changeFrequency: "monthly" as const, priority })),
    ...projects.map((p) => ({ url: `${siteConfig.url}/projects/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...posts.map((p) => ({ url: `${siteConfig.url}/blog/${p.slug}`, lastModified: p.publishedAt, changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
