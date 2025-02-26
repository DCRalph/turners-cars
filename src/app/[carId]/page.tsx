// app/[carId]/page.tsx
import { api } from "~/trpc/server";
import { CarDetail } from "~/components/CarDetail";

import { notFound } from "next/navigation";
import BackButton from "~/components/BackButton";

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
    <main className="container mx-auto flex flex-col items-center py-10">
      <BackButton />

      <CarDetail car={car} />
    </main>
  );
}
