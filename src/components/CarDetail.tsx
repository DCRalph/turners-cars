// components/CarDetail.tsx
import { type cars } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, MapPin, Calendar, Clock, Tag, Info } from "lucide-react";
import { CarGallery } from "./CarGallery";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";

interface CarDetailProps {
  car: cars;
}

export function CarDetail({ car }: CarDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-3xl font-bold">{car.carName ?? "Unknown Car"}</h1>
          {car.carPrice && (
            <p className="mt-1 text-2xl font-semibold">{car.carPrice}</p>
          )}
        </div>
        {car.detailUrl && (
          <Button asChild variant="outline">
            <Link
              href={car.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Original Listing
            </Link>
          </Button>
        )}
      </div>

      <CarGallery photos={car.photos} carName={car.carName} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Car Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {car.odometer && (
              <div className="flex items-center gap-2">
                <Info className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Odometer:</span> {car.odometer}
              </div>
            )}
            {car.location && (
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span className="font-medium">Location:</span> {car.location}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Tag className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">Car ID:</span> {car.carId}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Listing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">Added:</span>{" "}
              {formatDistanceToNow(car.added, { addSuffix: true })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">Last seen:</span>{" "}
              {formatDistanceToNow(car.lastSeen, { addSuffix: true })}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">Added date:</span>{" "}
              {car.added.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span className="font-medium">Last seen date:</span>{" "}
              {car.lastSeen.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
