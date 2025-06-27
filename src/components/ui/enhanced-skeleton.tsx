"use client";

import { cn } from "~/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "shimmer" | "pulse";
}

export function EnhancedSkeleton({
  className,
  variant = "shimmer",
  ...props
}: SkeletonProps) {
  const baseClasses = "rounded-md bg-muted";

  const variants = {
    default: "animate-pulse",
    shimmer:
      "animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
    pulse: "animate-pulse-slow",
  };

  return (
    <div className={cn(baseClasses, variants[variant], className)} {...props} />
  );
}

export function CarCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border bg-card p-0 shadow-sm">
      <EnhancedSkeleton className="aspect-video w-full rounded-t-lg" />
      <div className="p-4">
        <EnhancedSkeleton className="h-6 w-3/4" />
        <div className="mt-2 space-y-2">
          <EnhancedSkeleton className="h-5 w-1/2" />
          <EnhancedSkeleton className="h-4 w-2/3" />
          <EnhancedSkeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="flex justify-between">
          <EnhancedSkeleton className="h-3 w-1/4" />
          <EnhancedSkeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div className="space-y-2">
          <EnhancedSkeleton className="h-8 w-64" />
          <EnhancedSkeleton className="h-6 w-32" />
        </div>
        <EnhancedSkeleton className="h-10 w-40" />
      </div>

      <EnhancedSkeleton className="aspect-video w-full rounded-lg" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border p-6">
          <EnhancedSkeleton className="h-6 w-1/3" />
          {Array.from({ length: 3 }).map((_, i) => (
            <EnhancedSkeleton key={i} className="h-5 w-full" />
          ))}
        </div>
        <div className="space-y-3 rounded-lg border p-6">
          <EnhancedSkeleton className="h-6 w-1/3" />
          {Array.from({ length: 4 }).map((_, i) => (
            <EnhancedSkeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <EnhancedSkeleton className="h-10 w-64" />
          <EnhancedSkeleton className="h-10 w-24" />
          <EnhancedSkeleton className="h-10 w-10" />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <EnhancedSkeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
