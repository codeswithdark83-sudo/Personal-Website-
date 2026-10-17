import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Safe Markdown: react-markdown does not render raw HTML by default (no rehype-raw), so authored content
 * cannot inject scripts. Links are forced to rel="noopener noreferrer" and external ones open in a new tab.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-custom space-y-4 text-muted [&_a]:text-accent [&_a]:underline [&_code]:rounded [&_code]:bg-elevated [&_code]:px-1 [&_code]:font-mono [&_code]:text-sm [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-surface [&_pre]:p-4 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_table]:block [&_table]:overflow-x-auto [&_img]:max-w-full [&_img]:rounded-lg">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: c }) => {
            const external = !!href && /^https?:\/\//i.test(href);
            const safe = !!href && /^(https?:|mailto:|\/|#)/i.test(href);
            return safe ? <a href={href} rel="noopener noreferrer" target={external ? "_blank" : undefined}>{c}</a> : <span>{c}</span>;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
