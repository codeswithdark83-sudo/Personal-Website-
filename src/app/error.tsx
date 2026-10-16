"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page flex min-h-[60dvh] flex-col items-center justify-center text-center" role="alert">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted">An unexpected error occurred. Please try again.</p>
      <Button onClick={reset} className="mt-6">Try again</Button>
    </div>
  );
}
