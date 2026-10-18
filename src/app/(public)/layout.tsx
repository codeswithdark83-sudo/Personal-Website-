import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CursorFollower } from "@/components/ui/cursor-follower";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground">
        Skip to content
      </a>
      <div className="scroll-progress" aria-hidden />
      <CursorFollower />
      <SiteHeader />
      <main id="main" className="min-h-[70dvh]">{children}</main>
      <SiteFooter />
    </>
  );
}
