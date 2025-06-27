import { scrapeTurners } from "../scrapers/turners";
import { upsertCars } from "./car-service";
import type { CarData } from "../scrapers/turners";

// Configuration for scraping websites
const SCRAPING_CONFIG = [
  // {
  //   type: "turners",
  //   url: "https://www.turners.co.nz/Cars/Used-Cars-for-Sale/subaru/?sortorder=6&pagesize=110&pageno={}&searchfor=sti&issearchsimilar=true&make=subaru",
  // },
  // {
  //   type: "turners",
  //   url: "https://www.turners.co.nz/Cars/Used-Cars-for-Sale/subaru/legacy/?sortorder=6&pagesize=110&pageno={}&issearchsimilar=true&make=subaru&models=legacy",
  // },
  // {
  //   type: "turners",
  //   url: "https://www.turners.co.nz/Cars/Used-Cars-for-Sale/honda/?sortorder=6&pagesize=110&pageno={}&issearchsimilar=true&make=honda&models=accord%2Ccivic",
  // },
  // {
  //   type: "turners",
  //   url: "https://www.turners.co.nz/Cars/Used-Cars-for-Sale/subaru/impreza/?sortorder=6&pagesize=110&pageno={}&issearchsimilar=true&make=Subaru&models=Impreza",
  // },
  {
    type: "turners",
    url: "https://www.turners.co.nz/Cars/Used-Cars-for-Sale/?sortorder=6%2CDESC&pagesize=110&pageno={}&issearchsimilar=true",
  },
];

// Map scraper type to function
const SCRAPER_FUNCTIONS = {
  turners: scrapeTurners,
  // Add additional mappings when supporting more scrapers
};

export interface ScrapingStats {
  totalCarsProcessed: number;
  newCarsAdded: number;
  existingCarsUpdated: number;
  errors: string[];
  duration: number;
  startTime: Date;
  endTime: Date;
}

export async function runFullScraping(): Promise<ScrapingStats> {
  const startTime = new Date();
  const errors: string[] = [];
  let totalCarsProcessed = 0;

  console.log("Starting full scraping process...");

  try {
    const allCars: CarData[] = [];

    for (const config of SCRAPING_CONFIG) {
      const scraperType = config.type as keyof typeof SCRAPER_FUNCTIONS;
      const urlTemplate = config.url;

      if (scraperType in SCRAPER_FUNCTIONS) {
        console.log(
          `Scraping site of type '${scraperType}' with URL: ${urlTemplate}`,
        );

        try {
          const cars = await SCRAPER_FUNCTIONS[scraperType](urlTemplate);
          allCars.push(...cars);
          console.log(`Scraped ${cars.length} cars from ${scraperType}`);
        } catch (error) {
          const errorMessage = `Error scraping ${scraperType}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(errorMessage);
          errors.push(errorMessage);
        }
      } else {
        const errorMessage = `No scraper available for type '${scraperType}'`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    totalCarsProcessed = allCars.length;
    console.log(`Total cars scraped: ${totalCarsProcessed}`);

    // Upsert cars to database
    if (allCars.length > 0) {
      console.log("Upserting cars to database...");
      await upsertCars(allCars);
      console.log("Database operations completed");
    }
  } catch (error) {
    const errorMessage = `Critical error during scraping: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage);
    errors.push(errorMessage);
  }

  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();

  const stats: ScrapingStats = {
    totalCarsProcessed,
    newCarsAdded: 0, // We would need to track this separately in upsertCars
    existingCarsUpdated: 0, // We would need to track this separately in upsertCars
    errors,
    duration,
    startTime,
    endTime,
  };

  console.log("Scraping completed:", {
    totalCarsProcessed: stats.totalCarsProcessed,
    duration: `${duration}ms`,
    errors: stats.errors.length,
  });

  return stats;
}

export async function runSingleSiteScraping(
  scraperType: keyof typeof SCRAPER_FUNCTIONS,
  urlTemplate: string,
): Promise<CarData[]> {
  console.log(`Scraping single site of type '${scraperType}'...`);

  if (!(scraperType in SCRAPER_FUNCTIONS)) {
    throw new Error(`No scraper available for type '${scraperType}'`);
  }

  const cars = await SCRAPER_FUNCTIONS[scraperType](urlTemplate);

  if (cars.length > 0) {
    await upsertCars(cars);
  }

  return cars;
}
