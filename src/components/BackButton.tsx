"use client";

import { Button } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        onClick={handleBack}
        className="group hover:bg-accent"
      >
        <div className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to listings
        </div>
      </Button>
    </div>
  );
}
