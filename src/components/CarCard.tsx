"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatDistance, differenceInDays } from "date-fns";
import Image from "next/image";
import { type cars } from "@prisma/client";
import { MapPin, Calendar, Clock, Eye, DollarSign } from "lucide-react";
import Link from "next/link";

interface CarCardProps {
  car: cars;
}

export function CarCard({ car }: CarCardProps) {
  const isNew = differenceInDays(new Date(), car.added) < 3;

  return (
    <div className="h-full">
      <Link href={`/${car.carId}`} className="block h-full">
        <Card className="group h-full overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg dark:hover:shadow-primary/5">
          <CardHeader className="relative aspect-video overflow-hidden p-0">
            <div className="relative h-full w-full">
              {car.photos && car.photos.length > 0 ? (
                <Image
                  src={car.photos[0] ?? ""}
                  alt={car.carName ?? "Car image"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-muted-foreground">
                    No image available
                  </span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="absolute left-2 top-2 z-10 flex gap-1">
              {isNew && (
                <Badge variant="destructive" className="text-xs font-bold">
                  New
                </Badge>
              )}
              {car.photos && car.photos.length > 1 && (
                <Badge variant="secondary" className="text-xs">
                  +{car.photos.length - 1} photos
                </Badge>
              )}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
          </CardHeader>

          <CardContent className="p-4">
            <CardTitle className="line-clamp-2 text-lg leading-tight transition-colors duration-200 group-hover:text-primary">
              {car.carName ?? "Unknown Car"}
            </CardTitle>

            <CardDescription className="mt-3 space-y-2">
              {car.carPrice && (
                <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                  <DollarSign className="h-4 w-4" />
                  {car.carPrice}
                </div>
              )}

              <div className="space-y-1 text-sm">
                {car.odometer && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {car.odometer}
                  </div>
                )}
                {car.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{car.location}</span>
                  </div>
                )}
              </div>
            </CardDescription>
          </CardContent>

          <CardFooter className="border-t bg-muted/20 p-4 text-xs text-muted-foreground">
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Added{" "}
                  {formatDistance(car.added, new Date(), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  Seen{" "}
                  {formatDistance(car.lastSeen, new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  );
}
