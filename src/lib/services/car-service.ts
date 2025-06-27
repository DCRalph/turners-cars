import { db } from "~/server/db";
import type { CarData } from "../scrapers/turners";

export async function upsertCars(cars: CarData[]): Promise<void> {
  const now = new Date();

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
      } else {
        // Update lastSeen timestamp for existing record
        await db.cars.update({
          where: { id: existingCar.id },
          data: { lastSeen: now },
        });
        console.log("Updated car:", car.carId);
      }
    } catch (error) {
      console.error(`Error upserting car ${car.carId}:`, error);
    }
  }
}

export async function getCarCount(): Promise<number> {
  return await db.cars.count();
}

export async function getRecentlySeenCars(hours = 24): Promise<number> {
  const since = new Date();
  since.setHours(since.getHours() - hours);

  return await db.cars.count({
    where: {
      lastSeen: {
        gte: since,
      },
    },
  });
}
