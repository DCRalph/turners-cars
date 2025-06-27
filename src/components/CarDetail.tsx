"use client";

// components/CarDetail.tsx
import { type cars } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  Tag,
  Info,
  Car,
  DollarSign,
  Eye,
  // Share2,
  // Heart,
  // Bookmark,
  Gauge,
  CheckCircle,
  TrendingUp,
  Star,
} from "lucide-react";
import { CarGallery } from "./CarGallery";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import Link from "next/link";

interface CarDetailProps {
  car: cars;
}

export function CarDetail({ car }: CarDetailProps) {
  const isNew =
    car.added &&
    new Date().getTime() - car.added.getTime() < 3 * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div>
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-background via-background to-muted/20 p-6 shadow-lg md:p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="relative">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-start">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
                    {car.carName ?? "Unknown Car"}
                  </h1>
                  {isNew && (
                    <div>
                      <Badge
                        variant="destructive"
                        className="animate-pulse text-sm shadow-lg"
                      >
                        <Star className="mr-1 h-3 w-3" />
                        New Listing
                      </Badge>
                    </div>
                  )}
                </div>

                {car.carPrice && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-4xl font-bold text-primary">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        {car.carPrice}
                      </span>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Competitive
                    </Badge>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  {car.location && (
                    <div className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{car.location}</span>
                    </div>
                  )}
                  {car.odometer && (
                    <div className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1">
                      <Gauge className="h-4 w-4 text-primary" />
                      <span className="font-medium">{car.odometer}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      Listed{" "}
                      {formatDistanceToNow(car.added, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-2 transition-all duration-200 hover:scale-105 hover:border-primary/50 hover:bg-primary/5"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-2 transition-all duration-200 hover:scale-105 hover:border-red-500/50 hover:bg-red-500/5 hover:text-red-500"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-2 transition-all duration-200 hover:scale-105 hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-500"
                >
                  <Bookmark className="h-4 w-4" />
                </Button> */}
                {car.detailUrl && (
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-primary to-primary/90 px-6 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                  >
                    <Link
                      href={car.detailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Original
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Image Gallery */}
      <div>
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <CarGallery photos={car.photos ?? []} carName={car.carName ?? ""} />
        </div>
      </div>

      {/* Enhanced Detailed Information */}
      <div>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted/50 p-1 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Info className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Car className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 rounded-lg transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="group">
                <Card className="h-full border-0 bg-gradient-to-br from-background to-muted/20 shadow-lg transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {car.carName && (
                      <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-semibold">{car.carName}</span>
                      </div>
                    )}
                    {car.odometer && (
                      <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                        <span className="text-muted-foreground">Odometer:</span>
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{car.odometer}</span>
                        </div>
                      </div>
                    )}
                    {car.carPrice && (
                      <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 p-3">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="text-lg font-bold text-primary">
                          {car.carPrice}
                        </span>
                      </div>
                    )}
                    {car.location && (
                      <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                        <span className="text-muted-foreground">Location:</span>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{car.location}</span>
                        </div>
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                      <span className="text-muted-foreground">Car ID:</span>
                      <Badge variant="outline" className="font-mono">
                        {car.carId}
                      </Badge>
                    </div>
                    {car.scrapedFrom && (
                      <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                        <span className="text-muted-foreground">Source:</span>
                        <Badge variant="secondary" className="capitalize">
                          {car.scrapedFrom}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="group">
                <Card className="h-full border-0 bg-gradient-to-br from-background to-muted/20 shadow-lg transition-all duration-300 hover:shadow-xl group-hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      Location & Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {car.location && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span className="text-lg font-semibold">
                            {car.location}
                          </span>
                        </div>
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <div className="rounded-lg bg-muted/30 p-4">
                        <p className="mb-2 text-sm text-muted-foreground">
                          Interested in this vehicle? Contact the seller
                          directly for more information.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <CheckCircle className="h-4 w-4" />
                          <span>Verified listing</span>
                        </div>
                      </div>
                      {car.detailUrl && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full rounded-lg border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 transition-all duration-200 hover:border-primary/40 hover:from-primary/10 hover:to-primary/20"
                        >
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-8">
            <div>
              <Card className="border-0 bg-gradient-to-br from-background to-muted/20 shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Tag className="h-6 w-6 text-primary" />
                    </div>
                    Detailed Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="h-1 w-8 rounded-full bg-primary" />
                        <h4 className="text-lg font-semibold">
                          Basic Information
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-4">
                          <span className="font-medium text-muted-foreground">
                            Vehicle Name:
                          </span>
                          <span className="font-semibold">
                            {car.carName ?? "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-4">
                          <span className="font-medium text-muted-foreground">
                            Odometer:
                          </span>
                          <div className="flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-primary" />
                            <span className="font-semibold">
                              {car.odometer ?? "Not specified"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 p-4">
                          <span className="font-medium text-muted-foreground">
                            Price:
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {car.carPrice ?? "Not specified"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="h-1 w-8 rounded-full bg-primary" />
                        <h4 className="text-lg font-semibold">
                          Location & Availability
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-4">
                          <span className="font-medium text-muted-foreground">
                            Location:
                          </span>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-semibold">
                              {car.location ?? "Not specified"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-4">
                          <span className="font-medium text-muted-foreground">
                            Photos:
                          </span>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" />
                            <span className="font-semibold">
                              {car.photos?.length ?? 0} available
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-green-500/10 p-4">
                          <span className="font-medium text-muted-foreground">
                            Status:
                          </span>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-semibold text-green-600">
                              Available
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-8">
            <div>
              <Card className="border-0 bg-gradient-to-br from-background to-muted/20 shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    Listing History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg">
                        <Calendar className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold">Listed</span>
                          <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/10 text-xs"
                          >
                            {formatDistanceToNow(car.added, {
                              addSuffix: true,
                            })}
                          </Badge>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-4">
                          <p className="text-sm text-muted-foreground">
                            Vehicle was first added to our system on{" "}
                            <span className="font-semibold text-foreground">
                              {car.added.toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted shadow-lg">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold">
                            Last Updated
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {formatDistanceToNow(car.lastSeen, {
                              addSuffix: true,
                            })}
                          </Badge>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-4">
                          <p className="text-sm text-muted-foreground">
                            Last seen on{" "}
                            <span className="font-semibold text-foreground">
                              {car.lastSeen.toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-1 w-8 rounded-full bg-primary" />
                      <h4 className="text-lg font-semibold">
                        Tracking Information
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between rounded-lg bg-muted/40 p-4">
                        <span className="font-medium text-muted-foreground">
                          First Seen:
                        </span>
                        <span className="font-semibold">
                          {car.added.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-muted/40 p-4">
                        <span className="font-medium text-muted-foreground">
                          Last Seen:
                        </span>
                        <span className="font-semibold">
                          {car.lastSeen.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
