"use client";

import { useState } from "react";
import { type cars } from "@prisma/client";
import { CarCard } from "~/components/CarCard";
import { CarFilter } from "~/components/CarFilter";
import { Button } from "~/components/ui/button";

export default function CarFilterClient({ cars }: { cars: cars[] }) {
  const [filteredCars, setFilteredCars] = useState<cars[]>(cars);

  return (
    <>
      <CarFilter cars={cars} onFilter={setFilteredCars} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredCars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="py-20 text-center">
          <h2 className="mb-2 text-2xl font-semibold">No cars found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search filters.
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          className="btn btn-primary"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          back to top
        </Button>
      </div>
    </>
  );
}
