import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { formatDistance, differenceInDays } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { type cars } from "@prisma/client";

interface CarCardProps {
  car: cars;
}

export function CarCard({ car }: CarCardProps) {
  const isNew = differenceInDays(new Date(), car.added) < 3;
  // const isNew = true;

  return (
    <Link href={`/${car.carId}`} className="block h-full">
      <Card className="hover:border-primary/50 h-full transition-colors">
        <CardHeader className="relative aspect-video overflow-hidden rounded-t-lg p-0">
          {isNew && (
            <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-1 font-bold text-white">
              New
            </span>
          )}
          {car.photos && car.photos.length > 0 ? (
            <Image
              src={car.photos[0] ?? ""}
              alt={car.carName ?? "Car image"}
              fill
              className="object-cover !m-0"
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="truncate text-lg">
            {car.carName ?? "Unknown Car"}
          </CardTitle>
          <CardDescription className="mt-2 flex flex-col gap-1">
            {car.carPrice && (
              <div className="text-foreground font-semibold">
                {car.carPrice}
              </div>
            )}
            {car.odometer && <div>{car.odometer}</div>}
            {car.location && <div>{car.location}</div>}
          </CardDescription>
        </CardContent>
        <CardFooter className="text-muted-foreground p-4 pt-0 text-sm">
          <div className="flex w-full justify-between">
            <span>
              Added:{" "}
              {formatDistance(car.added, new Date(), { addSuffix: true })}
            </span>
            <span>
              Last seen:{" "}
              {formatDistance(car.lastSeen, new Date(), { addSuffix: true })}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
