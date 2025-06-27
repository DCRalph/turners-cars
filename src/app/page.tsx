import { Suspense } from "react";
import CarListingsClient from "~/app/home";
import { FilterSkeleton } from "~/components/ui/enhanced-skeleton";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="py-12 text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight lg:text-5xl">
          Car Listings
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover amazing cars from trusted sellers
        </p>
      </div>

      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-7xl px-4">
            <FilterSkeleton />
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="mb-4 aspect-video rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="h-3 w-2/3 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <CarListingsClient />
      </Suspense>
    </div>
  );
}
