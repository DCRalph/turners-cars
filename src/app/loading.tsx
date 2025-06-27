import {
  FilterSkeleton,
  CarCardSkeleton,
} from "~/components/ui/enhanced-skeleton";

export default function Loading() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center py-10">
      <div className="mb-8 space-y-2 text-center">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-5 w-96 animate-pulse rounded bg-muted" />
      </div>

      <div className="w-full max-w-7xl">
        <FilterSkeleton />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <CarCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
