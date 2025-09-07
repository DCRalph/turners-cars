"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "~/components/ui/carousel";
import { Button } from "~/components/ui/button";

interface CarGalleryProps {
  photos: string[];
  carName: string | null;
}

export function CarGallery({ photos, carName }: CarGalleryProps) {
  // Hold a reference to the carousel API
  const [api, setApi] = useState<CarouselApi | null>(null);
  // Current slide index (0-based) and the total count
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(photos.length);

  useEffect(() => {
    if (!api) return;
    // Initialize the total count and current slide
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    // Listen to the "select" event to update the current slide index
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    api.on("select", onSelect);

    return () => {
      // If your carousel API supports it, clean up the event listener here.
      // For example: api.off("select", onSelect);
    };
  }, [api]);

  if (!photos || photos.length === 0) {
    return (
      <div className="bg-muted flex h-[400px] w-full items-center justify-center rounded-lg">
        <span className="text-muted-foreground">No images available</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Number indicator above the carousel */}
      <div className="mb-2 text-center text-sm font-medium">
        {current + 1} / {count}
      </div>

      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="-ml-4">
          {photos.map((photo, index) => (
            <CarouselItem key={index} className="pl-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={photo}
                  alt={`${carName ?? "Car"} image ${index + 1} of ${photos.length}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious>
          <Button variant="outline" size="icon">
            <span className="sr-only">Previous</span>
          </Button>
        </CarouselPrevious>

        <CarouselNext>
          <Button variant="outline" size="icon">
            <span className="sr-only">Next</span>
          </Button>
        </CarouselNext>
      </Carousel>

      {/* Dot navigation at the bottom */}
      <div className="mt-4 flex justify-center gap-2">
        {photos.map((_, index) => (
          <Button
            key={index}
            className={`h-3 w-3 rounded-full p-2 transition-all ${index === current ? "bg-primary w-6" : "bg-muted"
              }`}
            onClick={() => {
              if (api) {
                api.scrollTo(index);
              }
            }}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
