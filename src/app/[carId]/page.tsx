// app/[carId]/page.tsx
import { api } from "~/trpc/server";
import { CarDetail } from "~/components/CarDetail";

import { notFound } from "next/navigation";
import BackButton from "~/components/BackButton";

interface CarPageProps {
  params: {
    carId: string;
  };
}

export default async function CarPage({ params }: CarPageProps) {
  const car = await api.cars.getCarById({ carId: params.carId });

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
