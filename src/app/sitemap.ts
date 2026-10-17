import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPosts, getProjects } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const staticPaths = ["", "/about", "/projects", "/services", "/credentials", "/blog", "/contact", "/privacy"];
  return [
    ...staticPaths.map((p) => ({ url: `${siteConfig.url}${p}` })),
    ...projects.map((p) => ({ url: `${siteConfig.url}/projects/${p.slug}` })),
    ...posts.map((p) => ({ url: `${siteConfig.url}/blog/${p.slug}` })),
  ];
}
