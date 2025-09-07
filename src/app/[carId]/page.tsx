// app/[carId]/page.tsx
import { Suspense } from "react";
import { api } from "~/trpc/server";
import { CarDetail } from "~/components/CarDetail";
import BackButton from "~/components/BackButton";
import { DetailPageSkeleton } from "~/components/ui/enhanced-skeleton";
import { notFound } from "next/navigation";

export const revalidate = 300;

export default async function CarPage({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  const { carId } = await params;

  const car = await api.cars.getCarById({ carId });

  if (!car) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <BackButton />

        <Suspense fallback={<DetailPageSkeleton />}>
          <CarDetail car={car} />
        </Suspense>
      </div>
    </div>
  );
}
