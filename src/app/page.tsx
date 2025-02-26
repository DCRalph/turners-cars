import { Suspense } from "react";
import Loading from "./loading";
import CarFilterClient from "./home";
import { api } from "~/trpc/server";
import Footer from "~/components/footer";

export default async function HomePage() {
  const cars = await api.cars.getAllCars();

  return (
    <>
      <main className="container mx-auto flex flex-col items-center py-10">
        <h1 className="mb-6 text-center text-3xl font-bold">Car Listings</h1>

        <Suspense fallback={<Loading />}>
          <CarFilterClient cars={cars} />
        </Suspense>

        {/* footer */}
      </main>
      <Footer />
    </>
  );
}
