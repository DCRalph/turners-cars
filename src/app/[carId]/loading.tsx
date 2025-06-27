// app/[carId]/loading.tsx
import { DetailPageSkeleton } from "~/components/ui/enhanced-skeleton";
import { Button } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CarLoading() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center py-10">
      <div className="w-full max-w-4xl">
        <Button variant="ghost" asChild className="mb-6 animate-pulse">
          <Link href="/" className="flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to listings
          </Link>
        </Button>

        <DetailPageSkeleton />
      </div>
    </main>
  );
}
