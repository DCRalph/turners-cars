import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="container mx-auto py-10 flex flex-col items-center">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
          </div>
        ))}
      </div>
    </main>
  );
}
