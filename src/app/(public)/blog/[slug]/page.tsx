import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostView } from "@/components/blog/post-view";
import { getPost, getPosts } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() { return (await getPosts()).map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt, alternates: { canonical: `/blog/${post.slug}` } } : {};
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return <PostView post={post} />;
}
