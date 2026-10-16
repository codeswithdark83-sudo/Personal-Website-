import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { BlogBrowser } from "@/components/blog/blog-browser";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = { title: "Blog", description: "Tech insights, development tips and thoughts on web development.", alternates: { canonical: "/blog" } };

// Public content is cached and refreshed at most every 5 minutes; admin edits also revalidate on demand.
export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHeader title="Blog" description="Tech insights, development tips and thoughts on web development." />
      <div className="container-page py-10"><BlogBrowser posts={posts} /></div>
    </>
  );
}
