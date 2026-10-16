import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Markdown } from "@/components/ui/markdown";
import type { BlogPost } from "@/types/content";

export function PostView({ post, preview = false }: { post: BlogPost; preview?: boolean }) {
  return (
    <article className="container-page max-w-3xl py-10 sm:py-14">
      {!preview && <Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />}
      <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm text-muted"><time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time> · {post.readingMinutes} min read · {post.category}</p>
      {post.coverUrl && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl border border-border">
          <Image src={post.coverUrl} alt="" fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" priority />
        </div>
      )}
      <div className="mt-8 text-base leading-relaxed"><Markdown>{post.body}</Markdown></div>
    </article>
  );
}
