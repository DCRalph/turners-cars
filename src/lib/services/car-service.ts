import { db } from "~/server/db";
import type { CarData } from "../scrapers/turners";

export async function upsertCars(cars: CarData[]): Promise<{
  newCarsAdded: number;
  existingCarsUpdated: number;
}> {
  const now = new Date();

  let newCarsAdded = 0;
  let existingCarsUpdated = 0;

  // loop through cars and find duplicates of carID
  const duplicates: Record<string, CarData[]> = {};
  for (const car of cars) {
    if (duplicates[car.carId]) {
      duplicates[car.carId]!.push(car);
    } else {
      duplicates[car.carId] = [car];
    }
  }

  // fs.writeFileSync("cars.json", JSON.stringify(cars, null, 2));
  // fs.writeFileSync("duplicates.json", JSON.stringify(duplicates, null, 2));

  for (const car of cars) {
    try {
      // Check if car exists using the unique carId
      const existingCar = await db.cars.findFirst({
        where: { carId: car.carId },
      });

      if (!existingCar) {
        // Insert new record
        await db.cars.create({
          data: {
            scrapedFrom: car.scrapedFrom,
            carId: car.carId,
            carName: car.carName,
            carPrice: car.carPrice,
            odometer: car.odometer,
            location: car.location,
            photos: car.photos,
            detailUrl: car.detailUrl,
            added: now,
            lastSeen: now,
          },
        });
        console.log("Inserted car:", car.carId);
        newCarsAdded++;
      } else {
        // Update lastSeen timestamp for existing record
        await db.cars.update({
          where: { id: existingCar.id },
          data: { lastSeen: now },
        });
        console.log("Updated car:", car.carId);
        existingCarsUpdated++;
      }
    } catch (error) {
      console.error(`Error upserting car ${car.carId}:`, error);
    }
  }

  return { newCarsAdded, existingCarsUpdated };
}
