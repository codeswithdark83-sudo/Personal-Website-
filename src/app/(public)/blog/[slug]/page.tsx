import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostView } from "@/components/blog/post-view";
import { JsonLd } from "@/components/seo/json-ld";
import { getPost, getPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() { return (await getPosts()).map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? pageMetadata({ title: post.title, description: post.excerpt, path: `/blog/${post.slug}`, type: "article", publishedTime: post.publishedAt, tags: post.tags }) : {};
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.excerpt,
        datePublished: post.publishedAt, author: { "@type": "Person", name: siteConfig.name },
        mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`, keywords: post.tags.join(", "),
      }} />
      <PostView post={post} />
    </>
  );
}
