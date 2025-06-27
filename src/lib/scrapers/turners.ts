import * as cheerio from "cheerio";

export interface CarData {
  scrapedFrom: string;
  carId: string;
  carName: string | null;
  carPrice: string | null;
  odometer: string | null;
  location: string | null;
  photos: string[];
  detailUrl: string | null;
}

export interface ScrapingResult {
  cars: CarData[];
  totalResults: number | null;
}

export async function getTurnersCarData(url: string): Promise<ScrapingResult> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to retrieve page: ${response.status}`);
      return { cars: [], totalResults: null };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const carList: CarData[] = [];

    // Find all product cards using the "data-goodnumber" attribute
    $("div[data-goodnumber]").each((_, element) => {
      const card = $(element);
      const car: CarData = {
        scrapedFrom: "turners",
        
        carId: "",
        carName: null,
        carPrice: null,
        odometer: null,
        location: null,
        photos: [],
        detailUrl: null,
      };

      // Extract host from URL (e.g., "www.turners.co.nz")
      const host = new URL(url).host;

      // Use the data-goodnumber as the unique identifier (carId)
      const goodNumber = card.attr("data-goodnumber");
      if (goodNumber) {
        car.carId = `${host}_${goodNumber}`;
      }

      // Extract the title and detail URL
      const titleTag = card.find("a.product-summary-title");
      if (titleTag.length > 0) {
        car.carName = titleTag.attr("title") ?? null;
        const detailUrl = titleTag.attr("href");
        if (detailUrl) {
          car.detailUrl = `https://www.turners.co.nz${detailUrl}`;
        }
      }

      // Extract the price
      const priceTag = card.find('span[itemprop="price"]');
      if (priceTag.length > 0) {
        car.carPrice = priceTag.text().trim() || null;
      }

      // Extract location (from the "location" block)
      const locationDiv = card.find("div.location");
      if (locationDiv.length > 0) {
        const locValue = locationDiv.find("div.value");
        if (locValue.length > 0) {
          car.location = locValue.text().trim() || null;
        }
      }

      // Extract odometer reading (from the "odometer" block)
      const odometerDiv = card.find("div.odometer");
      if (odometerDiv.length > 0) {
        const odoSpan = odometerDiv.find('span[itemprop="value"]');
        if (odoSpan.length > 0) {
          car.odometer = odoSpan.text().trim() || null;
        }
      }

      // Extract photos (scan within product-summary-images)
      const photos: string[] = [];
      const imageContainer = card.find("div.product-summary-images");
      if (imageContainer.length > 0) {
        imageContainer.find("img").each((_, img) => {
          const imgEl = $(img);
          let photoUrl: string | undefined;

          // Check for lazy-load attributes first
          if (imgEl.attr("data-original")) {
            photoUrl = imgEl.attr("data-original");
          } else if (imgEl.attr("data-splide-lazy")) {
            photoUrl = imgEl.attr("data-splide-lazy");
          } else {
            photoUrl = imgEl.attr("src");
          }

          if (photoUrl) {
            photoUrl = photoUrl.replace("_gallery", "");
            if (!photos.includes(photoUrl)) {
              photos.push(photoUrl);
            }
          }
        });
      }
      car.photos = photos;

      if (car.carId) {
        carList.push(car);
      }
    });

    // Extract pagination information from the page-size-tracker
    let totalResults: number | null = null;
    const pageTrackerDiv = $(".page-size-tracker");
    if (pageTrackerDiv.length > 0) {
      const text = pageTrackerDiv.text().trim();
      // e.g. "1 - 110 of 256"
      const regex = /of\s+(\d+)/;
      const match = regex.exec(text);
      if (match?.[1]) {
        totalResults = parseInt(match[1], 10);
      }
    }

    return { cars: carList, totalResults };
  } catch (error) {
    console.error("Error scraping Turners data:", error);
    return { cars: [], totalResults: null };
  }
}

export async function scrapeTurners(
  urlTemplate: string,
  pageSize = 110,
): Promise<CarData[]> {
  let page = 1;
  const allCars: CarData[] = [];
  let totalResults: number | null = null;

  while (true) {
    const url = urlTemplate.replace("{}", page.toString());
    console.log(`Scraping Turners page ${page}: ${url}`);

    const result = await getTurnersCarData(url);
    allCars.push(...result.cars);

    if (result.totalResults !== null) {
      totalResults = result.totalResults;
      const totalPages = Math.ceil(totalResults / pageSize);

      if (page >= totalPages) {
        break;
      } else {
        page += 1;
      }
    } else {
      // If we cannot determine total_results, exit the loop
      break;
    }

    // Add a small delay to be respectful to the server
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return allCars;
}
