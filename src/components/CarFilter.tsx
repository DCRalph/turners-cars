"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Filter,
  RotateCcw,
  Calendar,
  DollarSign,
  Car,
} from "lucide-react";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";

interface CarFilterProps {
  onFilter: (filters: {
    search: string;
    sortBy: "added" | "lastSeen" | "carPrice" | "carName";
    sortOrder: "asc" | "desc";
  }) => void;
}

interface Tag {
  name: string;
  searchTerm: string;
  category: "brand" | "model" | "feature";
  icon?: React.ReactNode;
}

const availableTags: Tag[] = [
  {
    name: "Subaru",
    searchTerm: "subaru",
    category: "brand",
    icon: <Car className="h-3 w-3" />,
  },
  {
    name: "Honda",
    searchTerm: "honda",
    category: "brand",
    icon: <Car className="h-3 w-3" />,
  },
  {
    name: "Toyota",
    searchTerm: "toyota",
    category: "brand",
    icon: <Car className="h-3 w-3" />,
  },
  {
    name: "Mazda",
    searchTerm: "mazda",
    category: "brand",
    icon: <Car className="h-3 w-3" />,
  },
  { name: "Legacy", searchTerm: "legacy", category: "model" },
  { name: "WRX", searchTerm: "wrx", category: "model" },
  { name: "STI", searchTerm: "sti", category: "model" },
  { name: "Accord", searchTerm: "accord", category: "model" },
  { name: "Civic", searchTerm: "civic", category: "model" },
  { name: "Turbo", searchTerm: "turbo", category: "feature" },
  { name: "Manual", searchTerm: "manual", category: "feature" },
  { name: "AWD", searchTerm: "awd", category: "feature" },
];

const sortOptions = [
  {
    value: "lastSeen",
    label: "Latest",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    value: "added",
    label: "Recently Added",
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    value: "carPrice",
    label: "Price",
    icon: <DollarSign className="h-4 w-4" />,
  },
  { value: "carName", label: "Name", icon: <Car className="h-4 w-4" /> },
];

export function CarFilter({ onFilter }: CarFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "added" | "lastSeen" | "carPrice" | "carName"
  >("lastSeen");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    "all" | "brand" | "model" | "feature"
  >("all");

  // Apply filters callback triggers the parent onFilter method.
  const applyFilters = useCallback(() => {
    const searchTerms: string[] = [];
    if (search) searchTerms.push(search);
    if (selectedTags.length > 0) searchTerms.push(...selectedTags);

    onFilter({
      search: searchTerms.join(" "),
      sortBy,
      sortOrder,
    });
  }, [search, selectedTags, sortBy, sortOrder, onFilter]);

  // Updates the URL params without refreshing the page.
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (search) params.set("q", search);
    if (sortBy !== "lastSeen") params.set("sortBy", sortBy);
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));

    const newUrl = params.toString() ? `?${params.toString()}` : "/";
    router.replace(newUrl, { scroll: false });
  }, [search, sortBy, sortOrder, selectedTags, router]);

  // Sync local state with URL search parameters on mount.
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const sortByParam =
      (searchParams.get("sortBy") as typeof sortBy) ?? "lastSeen";
    const sortOrderParam =
      (searchParams.get("sortOrder") as typeof sortOrder) ?? "desc";
    const tagsParam = searchParams.get("tags") ?? "";

    setSearch(q);
    setSortBy(sortByParam);
    setSortOrder(sortOrderParam);
    if (tagsParam) {
      setSelectedTags(tagsParam.split(",").filter(Boolean));
    }
  }, [searchParams]);

  // Update URL and apply filters when filter state changes.
  useEffect(() => {
    updateUrl();
    applyFilters();
  }, [updateUrl, applyFilters]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);

  const handleReset = () => {
    setSearch("");
    setSortBy("lastSeen");
    setSortOrder("desc");
    setSelectedTags([]);
    setActiveCategory("all");
  };

  const handleTagToggle = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag.searchTerm)
        ? prev.filter((t) => t !== tag.searchTerm)
        : [...prev, tag.searchTerm],
    );
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Filter available tags based on the active category
  const filteredTags =
    activeCategory === "all"
      ? availableTags
      : availableTags.filter((tag) => tag.category === activeCategory);

  return (
    <div className="sticky top-0 z-20 mb-6 border-b bg-background/95 pb-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="space-y-4">
        {/* Main Search and Controls */}
        <div className="flex flex-col gap-4 pt-8 lg:flex-row lg:items-center">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-md lg:flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Search cars by name, brand, model..."
              className="pl-10 pr-10"
              value={search}
              onChange={handleSearchChange}
            />
            {search && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex items-center gap-2 lg:flex-shrink-0">
            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(
                  value as "added" | "lastSeen" | "carPrice" | "carName",
                )
              }
            >
              <SelectTrigger className="w-[140px] sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(({ value, label, icon }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="hidden sm:inline">{label}</span>
                      <span className="sm:hidden">{label.split(" ")[0]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="shrink-0"
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              aria-label="Toggle sort order"
            >
              <ArrowUpDown
                className={`h-4 w-4 transition-transform ${
                  sortOrder === "desc" ? "rotate-180" : ""
                }`}
              />
            </Button>

            <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative shrink-0"
                >
                  <Filter className="h-4 w-4" />
                  {selectedTags.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                    >
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-md">
                  <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                      <SlidersHorizontal className="h-5 w-5" />
                      Advanced Filters
                    </DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4 pb-0">
                    <Tabs
                      value={activeCategory}
                      onValueChange={(value) =>
                        setActiveCategory(
                          value as "all" | "brand" | "model" | "feature",
                        )
                      }
                    >
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all" className="text-xs">
                          All
                        </TabsTrigger>
                        <TabsTrigger value="brand" className="text-xs">
                          Brands
                        </TabsTrigger>
                        <TabsTrigger value="model" className="text-xs">
                          Models
                        </TabsTrigger>
                        <TabsTrigger value="feature" className="text-xs">
                          Features
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value={activeCategory} className="mt-4">
                        <div className="grid grid-cols-2 gap-2">
                          {filteredTags.map((tag) => (
                            <Button
                              key={tag.searchTerm}
                              variant={
                                selectedTags.includes(tag.searchTerm)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => handleTagToggle(tag)}
                              className="justify-start text-xs"
                            >
                              {tag.icon && (
                                <span className="mr-1">{tag.icon}</span>
                              )}
                              {tag.name}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button>Apply Filters</Button>
                    </DrawerClose>
                    <Button
                      variant="ghost"
                      onClick={handleReset}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset All
                    </Button>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Active Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {selectedTags.map((tagTerm) => {
              const tag = availableTags.find((t) => t.searchTerm === tagTerm);
              return (
                <div key={tagTerm}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer transition-colors hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTag(tagTerm)}
                  >
                    {tag?.icon && <span className="mr-1">{tag.icon}</span>}
                    {tag?.name ?? tagTerm}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
