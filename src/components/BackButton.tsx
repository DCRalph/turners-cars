"use client";

import { Button } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
      <ChevronLeft className="mr-2 h-4 w-4" />
      Back to listings
    </Button>
  );
}
