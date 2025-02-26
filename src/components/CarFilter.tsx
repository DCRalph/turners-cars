"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
// import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { type cars } from "@prisma/client";

interface CarFilterProps {
  cars: cars[];
  onFilter: (filteredCars: cars[]) => void;
}

interface Tag {
  name: string;
  searchTerm: string;
}

export function CarFilter({ cars, onFilter }: CarFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Define your available tags.
  const availableTags: Tag[] = [
    { name: "Subaru", searchTerm: "subaru" },
    { name: "Honda", searchTerm: "honda" },
    { name: "Turbo", searchTerm: "turbo" },
    { name: "Legacy", searchTerm: "legacy" },
    { name: "STI", searchTerm: "sti" },
    { name: "WRX", searchTerm: "wrx" },
    { name: "Accord", searchTerm: "accord" },
    { name: "Civic", searchTerm: "civic" },
  ];

  /**
   * Applies filters by combining the typed search term and any selected tag search terms.
   * All terms in the combined list must be present in the car's name (or id).
   */
  const applyFilters = (
    searchTerm: string,
    min: string,
    max: string,
    loc: string,
    tags: string[] = [],
  ) => {
    let filtered = [...cars];

    // Combine the search input with selected tags.
    const searchTerms: string[] = [];
    if (searchTerm) searchTerms.push(searchTerm);
    if (tags.length > 0) searchTerms.push(...tags);

    if (searchTerms.length > 0) {
      filtered = filtered.filter((car) =>
        searchTerms.every((term) =>
          car.carName?.toLowerCase().includes(term.toLowerCase()),
        ),
      );
    }

    if (min) {
      filtered = filtered.filter((car) => {
        const priceNum = parseInt(car.carPrice?.replace(/[^0-9]/g, "") ?? "0");
        return priceNum >= parseInt(min);
      });
    }

    if (max) {
      filtered = filtered.filter((car) => {
        const priceNum = parseInt(car.carPrice?.replace(/[^0-9]/g, "") ?? "0");
        return priceNum <= parseInt(max);
      });
    }

    if (loc) {
      filtered = filtered.filter((car) =>
        car.location?.toLowerCase().includes(loc.toLowerCase()),
      );
    }

    onFilter(filtered);
  };

  // Update the URL query parameters based on filter state.
  const updateUrl = () => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);
    if (location) params.set("loc", location);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    router.replace("?" + params.toString());
  };

  // When filter state changes, update the URL query string.
  useEffect(() => {
    updateUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, minPrice, maxPrice, location, selectedTags]);

  // When component mounts, read existing query parameters (if any)
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const min = searchParams.get("min") ?? "";
    const max = searchParams.get("max") ?? "";
    const loc = searchParams.get("loc") ?? "";
    const tagsParam = searchParams.get("tags") ?? "";

    setSearch(q);
    setMinPrice(min);
    setMaxPrice(max);
    setLocation(loc);
    if (tagsParam) {
      setSelectedTags(tagsParam.split(","));
    }
    // Apply filters based on initial URL values.
    applyFilters(q, min, max, loc, tagsParam ? tagsParam.split(",") : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array runs this effect only once on mount.

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters(value, minPrice, maxPrice, location, selectedTags);
  };

  const handleReset = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
    setSelectedTags([]);
    onFilter(cars);
  };

  const handleTagToggle = (tag: Tag) => {
    let updatedTags: string[] = [];
    if (selectedTags.includes(tag.searchTerm)) {
      updatedTags = selectedTags.filter((t) => t !== tag.searchTerm);
    } else {
      updatedTags = [...selectedTags, tag.searchTerm];
    }
    setSelectedTags(updatedTags);
    applyFilters(search, minPrice, maxPrice, location, updatedTags);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search input and tag pills container */}
      <div className="flex flex-col items-center gap-4">
        {/* Search input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search cars..."
              className="pl-10"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                onClick={() => handleSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle>Filter Cars</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 pb-0">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Filter by location"
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          applyFilters(
                            search,
                            minPrice,
                            maxPrice,
                            e.target.value,
                            selectedTags,
                          );
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="min-price">Min Price</Label>
                        <Input
                          id="min-price"
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => {
                            setMinPrice(e.target.value);
                            applyFilters(
                              search,
                              e.target.value,
                              maxPrice,
                              location,
                              selectedTags,
                            );
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="max-price">Max Price</Label>
                        <Input
                          id="max-price"
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => {
                            setMaxPrice(e.target.value);
                            applyFilters(
                              search,
                              minPrice,
                              e.target.value,
                              location,
                              selectedTags,
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DrawerFooter>
                  <Button
                    onClick={() =>
                      applyFilters(
                        search,
                        minPrice,
                        maxPrice,
                        location,
                        selectedTags,
                      )
                    }
                  >
                    Apply Filters
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                  <Button variant="ghost" onClick={handleReset}>
                    Reset All
                  </Button>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        {/* Tag Pills */}
        <div className="mx-8 flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Button
              key={tag.searchTerm}
              variant={
                selectedTags.includes(tag.searchTerm) ? "default" : "outline"
              }
              size="sm"
              onClick={() => handleTagToggle(tag)}
              className="rounded-full"
            >
              {tag.name}
            </Button>
          ))}
          {/* <Link href="https://www.xvideos.com/gay" target="_blank">
            <Button variant={"outline"} size="sm" className="rounded-full">
              EV
            </Button>
          </Link> */}
        </div>
      </div>
    </div>
  );
}
