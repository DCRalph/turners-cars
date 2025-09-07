import { Suspense } from "react";
import CarListingsClient from "~/app/home";
import { FilterSkeleton } from "~/components/ui/enhanced-skeleton";
import { HydrateClient, api } from "~/trpc/server";

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Prefetch the current page on the server for instant hydration on the client
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);
  const limit = 24;
  const offset = (page - 1) * limit;

  await api.cars.getAllCars.prefetch({
    limit,
    offset,
    sortBy: "lastSeen",
    sortOrder: "desc",
  });

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

      <HydrateClient>
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
      </HydrateClient>
    </div>
  );
}
