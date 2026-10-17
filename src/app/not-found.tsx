import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="container-page flex min-h-dvh flex-col items-center justify-center text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Page not found</h1>
      <p className="mt-2 text-muted">The page you&apos;re looking for doesn&apos;t exist or has been unpublished.</p>
      <ButtonLink href="/" className="mt-6">Back home</ButtonLink>
    </main>
  );
}
