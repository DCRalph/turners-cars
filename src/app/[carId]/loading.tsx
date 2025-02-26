// app/[carId]/loading.tsx
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CarLoading() {
  return (
    <main className="container mx-auto py-10 flex flex-col items-center">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/" className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to listings
        </Link>
      </Button>

      <div className="w-full max-w-4xl space-y-6">
        <div className="space-y-2 flex flex-col items-center">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/4" />
        </div>

        <Skeleton className="aspect-video w-full rounded-lg" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-lg border p-6">
            <Skeleton className="h-6 w-1/3" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>

          <div className="space-y-3 rounded-lg border p-6">
            <Skeleton className="h-6 w-1/3" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
