/**
 * Gray placeholder shapes shown for a split second while a pick or
 * profile page streams in (the <Suspense> fallback).
 */
export function ArticleSkeleton({ narrow = false }: { narrow?: boolean }) {
  return (
    <div
      aria-busy="true"
      role="status"
      aria-label="Loading"
      className={`mx-auto animate-pulse px-4 pt-10 sm:px-6 sm:pt-14 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}
    >
      <div className="h-4 w-32 rounded bg-surface-alt" />
      <div className="mt-8 h-6 w-40 rounded-full bg-surface-alt" />
      <div className="mt-5 h-12 w-3/4 rounded-lg bg-surface-alt" />
      <div className="mt-4 h-6 w-2/3 rounded bg-surface-alt" />
      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-surface-alt" />
        ))}
      </div>
    </div>
  );
}
