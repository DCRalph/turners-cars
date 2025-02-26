// app/not-found.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center gap-6 py-20 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold">Car Not Found</h2>
      <p className="text-muted-foreground max-w-md">
        {"The car listing you're looking for doesn't exist or may have been removed."}
      </p>
      <Button asChild>
        <Link href="/">Return to Listings</Link>
      </Button>
    </div>
  );
}
