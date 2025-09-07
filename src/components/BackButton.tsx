"use client";

import { Button } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBack = () => {
    const hasHistory = typeof window !== "undefined" && window.history.length > 1;
    const sameOriginReferrer =
      typeof document !== "undefined" && document.referrer.startsWith(window.location.origin);

    if (hasHistory && sameOriginReferrer) {
      router.back();
      return;
    }

    const fallbackPage = searchParams.get("page") ?? "1";
    router.push(`/?page=${fallbackPage}`);
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
          Back
        </div>
      </Button>
    </div>
  );
}
