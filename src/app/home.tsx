"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Head from "next/head";
import { type cars } from "@prisma/client";
import { CarCard } from "~/components/CarCard";
import { CarFilter } from "~/components/CarFilter";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import {
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  CarCardSkeleton,
  FilterSkeleton,
} from "~/components/ui/enhanced-skeleton";

function CarsGrid({ cars }: { cars: cars[] }) {
  // Additional safety: deduplicate cars at render time
  const uniqueCars = useMemo(() => {
    const seen = new Set();
    return cars.filter((car) => {
      if (seen.has(car.id)) {
        return false;
      }
      seen.add(car.id);
      return true;
    });
  }, [cars]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {uniqueCars.map((car) => (
        <div key={`car-${car.id}-${car.carId}`}>
          <CarCard car={car} />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  isLoading,
  onReset,
}: {
  isLoading: boolean;
  onReset: () => void;
}) {
  if (isLoading) return null;

  return (
    <div className="py-20 text-center">
      <div>
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-2xl font-semibold">No cars found</h2>
        <p className="mb-4 text-muted-foreground">
          Try adjusting your search filters to find more results.
        </p>
        <Button onClick={onReset} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}

function LoadingError({
  error,
  onRetry,
}: {
  error: { message: string };
  onRetry: () => void;
}) {
  return (
    <div className="py-20 text-center">
      <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
      <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
      <p className="mb-4 text-muted-foreground">{error.message}</p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

function Pagination({
  currentPage,
  total,
  limit,
  onPageChange,
}: {
  currentPage: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => (
          <div key={index}>
            {page === "..." ? (
              <span className="px-3 py-2 text-sm text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function CarListingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "added" | "lastSeen" | "carPrice" | "carName"
  >("lastSeen");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const initialPage = useMemo(() => {
    const p = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(p) && p > 0 ? p : 1;
  }, [searchParams]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const limit = 24;

  const queryConfig = useMemo(
    () => ({
      limit,
      offset: (currentPage - 1) * limit,
      search,
      sortBy,
      sortOrder,
    }),
    [currentPage, limit, search, sortBy, sortOrder],
  );

  const {
    data,
    isLoading: isQueryLoading,
    error,
    refetch,
  } = api.cars.getAllCars.useQuery(queryConfig, {
    staleTime: 60_000,
    placeholderData: (prev) => prev,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const utils = api.useUtils();

  // Prefetch next and previous page data to warm the cache
  useEffect(() => {
    const nextPage = currentPage + 1;
    const prevPage = currentPage - 1;

    const tasks: Promise<unknown>[] = [];

    // Prefetch next page if there might be more
    if (data?.hasMore) {
      tasks.push(
        utils.cars.getAllCars.prefetch({
          limit,
          offset: (nextPage - 1) * limit,
          search,
          sortBy,
          sortOrder,
        }),
      );
    }

    // Prefetch previous page if applicable
    if (prevPage >= 1) {
      tasks.push(
        utils.cars.getAllCars.prefetch({
          limit,
          offset: (prevPage - 1) * limit,
          search,
          sortBy,
          sortOrder,
        }),
      );
    }

    if (tasks.length > 0) {
      void Promise.all(tasks);
    }
  }, [currentPage, data?.hasMore, limit, search, sortBy, sortOrder, utils.cars.getAllCars]);

  // Compute image URLs from next and previous page to preload
  const preloadImageUrls = useMemo(() => {
    const urls = new Set<string>();

    const nextPage = currentPage + 1;
    const prevPage = currentPage - 1;

    if (data?.hasMore) {
      const nextData = utils.cars.getAllCars.getData({
        limit,
        offset: (nextPage - 1) * limit,
        search,
        sortBy,
        sortOrder,
      });
      nextData?.cars.forEach((c) => {
        if (c.photos?.[0]) urls.add(c.photos[0]);
      });
    }

    if (prevPage >= 1) {
      const prevData = utils.cars.getAllCars.getData({
        limit,
        offset: (prevPage - 1) * limit,
        search,
        sortBy,
        sortOrder,
      });
      prevData?.cars.forEach((c) => {
        if (c.photos?.[0]) urls.add(c.photos[0]);
      });
    }

    return Array.from(urls);
  }, [currentPage, data?.hasMore, limit, search, sortBy, sortOrder, utils.cars.getAllCars]);

  // Keep state in sync when URL changes (e.g., browser back/forward within list)
  useEffect(() => {
    const p = Number(searchParams.get("page") ?? "1");
    const next = Number.isFinite(p) && p > 0 ? p : 1;
    if (next !== currentPage) setCurrentPage(next);
  }, [searchParams, currentPage]);

  // Reset to first page when filters change (do not depend on searchParams to avoid loops)
  useEffect(() => {
    setCurrentPage(1);
    router.replace(`${pathname}?page=1`);
  }, [pathname, router, search, sortBy, sortOrder]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handleFilterChange = useCallback(
    (filters: {
      search: string;
      sortBy: "added" | "lastSeen" | "carPrice" | "carName";
      sortOrder: "asc" | "desc";
    }) => {
      setSearch(filters.search);
      setSortBy(filters.sortBy);
      setSortOrder(filters.sortOrder);
    },
    [],
  );

  const handleReset = useCallback(() => {
    setSearch("");
    setSortBy("lastSeen");
    setSortOrder("desc");
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const cars = data?.cars ?? [];
  const total = data?.total ?? 0;
  const isLoading = isQueryLoading && !data;

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Preload next/prev grid thumbnails */}
      <Head>
        {preloadImageUrls.map((href) => (
          <link key={href} rel="preload" as="image" href={href} />
        ))}
      </Head>
      <Suspense fallback={<FilterSkeleton />}>
        <CarFilter onFilter={handleFilterChange} />
      </Suspense>

      {/* Stats */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {total > 0
              ? `${total.toLocaleString()} Cars Found`
              : "No Cars Found"}
          </h2>
          {search && (
            <Badge variant="outline" className="text-sm">
              {`Searching: "${search}"`}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          disabled={isLoading || isRefreshing}
          aria-busy={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isRefreshing ? "Refreshing" : "Refresh"}
        </Button>
      </div>

      {/* Content */}
      {error ? (
        <LoadingError error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CarCardSkeleton key={i} />
          ))}
        </div>
      ) : cars.length === 0 ? (
        <EmptyState isLoading={isLoading} onReset={handleReset} />
      ) : (
        <>
          <CarsGrid cars={cars} />
          <Pagination
            currentPage={currentPage}
            total={total}
            limit={limit}
            onPageChange={handlePageChange}
          />
          {/* background fetching indicator omitted to minimize layout shifts */}
        </>
      )}
    </div>
  );
}
