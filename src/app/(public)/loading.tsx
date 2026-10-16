export default function Loading() {
  return (
    <div className="container-page py-16" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 animate-pulse rounded bg-elevated" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-xl bg-surface" />)}
      </div>
    </div>
  );
}
