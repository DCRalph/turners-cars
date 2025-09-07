import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

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
  let browser;
  try {
    console.log(`Launching browser for URL: ${url}`);

    // Launch browser with headless mode
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
      userDataDir: "./userData",
    });

    const page = await browser.newPage();

    // Set user agent to mimic a real browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0",
    );

    console.log(`Navigating to page: ${url}`);

    // Navigate to the page
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    console.log(`Waiting 3 seconds for dynamic content to load...`);

    // Wait 3 seconds for dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Extract the HTML content
    const html = await page.content();

    console.log(`HTML extracted, parsing with cheerio...`);

    // fs.writeFileSync(`html-pages/turners-${Math.random()}.html`, html);

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
      } else {
        console.error("No goodnumber found for car");
      }

      // Extract the title and detail URL
      const titleTag = card.find("a.product-summary-title");
      if (titleTag.length > 0) {
        car.carName = titleTag.attr("title") ?? null;
        const detailUrl = titleTag.attr("href");
        if (detailUrl) {
          car.detailUrl = `https://www.turners.co.nz${detailUrl}`;
          // car.carId = `${host}_${car.detailUrl}`;
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
  } finally {
    // Always close the browser, even if an error occurred
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
    }
  }
}

export async function scrapeTurners(
  urlTemplate: string,
  pageSize = 110,
): Promise<CarData[]> {
  let pageNumber = 1;
  const allCars: CarData[] = [];
  let totalResults: number | null = null;
  let totalDuplicates = 0;
  let totalFound = 0;

  let browser;
  try {
    console.log("Launching browser for click-based pagination scraping...");
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
      userDataDir: "./userData",
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0",
    );

    const initialUrl = urlTemplate
      .replace("{pagesize}", pageSize.toString())
      .replace("{pageno}", pageNumber.toString());

    console.log(`Navigating to initial page: ${initialUrl}`);
    await page.goto(initialUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    while (true) {
      console.log(`Waiting 3 seconds for dynamic content to load on page ${pageNumber}...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const html = await page.content();
      const $ = cheerio.load(html);

      const host = new URL(page.url()).host;
      const pageCars: CarData[] = [];

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

        const goodNumber = card.attr("data-goodnumber");
        if (goodNumber) {
          car.carId = `${host}_${goodNumber}`;
        }

        const titleTag = card.find("a.product-summary-title");
        if (titleTag.length > 0) {
          car.carName = titleTag.attr("title") ?? null;
          const detailUrl = titleTag.attr("href");
          if (detailUrl) {
            car.detailUrl = `https://www.turners.co.nz${detailUrl}`;
          }
        }

        const priceTag = card.find('span[itemprop="price"]');
        if (priceTag.length > 0) {
          car.carPrice = priceTag.text().trim() || null;
        }

        const locationDiv = card.find("div.location");
        if (locationDiv.length > 0) {
          const locValue = locationDiv.find("div.value");
          if (locValue.length > 0) {
            car.location = locValue.text().trim() || null;
          }
        }

        const odometerDiv = card.find("div.odometer");
        if (odometerDiv.length > 0) {
          const odoSpan = odometerDiv.find('span[itemprop="value"]');
          if (odoSpan.length > 0) {
            car.odometer = odoSpan.text().trim() || null;
          }
        }

        const photos: string[] = [];
        const imageContainer = card.find("div.product-summary-images");
        if (imageContainer.length > 0) {
          imageContainer.find("img").each((_, img) => {
            const imgEl = $(img);
            let photoUrl: string | undefined;

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
          pageCars.push(car);
        }
      });

      let pageTotalResults: number | null = null;
      const pageTrackerDiv = $(".page-size-tracker");
      if (pageTrackerDiv.length > 0) {
        const text = pageTrackerDiv.text().trim();
        const regex = /of\s+(\d+)/;
        const match = regex.exec(text);
        if (match?.[1]) {
          pageTotalResults = parseInt(match[1], 10);
        }
      }

      const existingCarIds = new Set(allCars.map((car) => car.carId));
      const newCars = pageCars.filter((car) => !existingCarIds.has(car.carId));
      const duplicates = pageCars.filter((car) => existingCarIds.has(car.carId));
      allCars.push(...newCars);

      totalFound += pageCars.length;
      totalDuplicates += duplicates.length;
      if (pageTotalResults !== null) totalResults = pageTotalResults;

      console.log(`\n📄 Page ${pageNumber} Stats:`);
      console.log(`  → Found on this page: ${pageCars.length}`);
      console.log(`  → Unique on this page: ${newCars.length}`);
      console.log(`  → Duplicates on this page: ${duplicates.length}`);
      console.log(`\n📊 Total Stats:`);
      console.log(`  → Total found: ${totalFound}`);
      console.log(`  → Total unique: ${allCars.length}`);
      console.log(`  → Total duplicates: ${totalDuplicates}`);
      console.log(`  → Available results: ${totalResults ?? "unknown"}`);
      console.log("─".repeat(50));

      const hasNext = await page.evaluate(() => {
        const nextLi = document.querySelector("li.next-page");
        if (!nextLi) return false;
        const isDisabled = nextLi.classList.contains("disabled") || nextLi.classList.contains("unavailable");
        const anchor = nextLi.querySelector<HTMLAnchorElement>("a.results-pagelink");
        if (!anchor) return false;
        return !isDisabled;
      });

      if (!hasNext) {
        break;
      }

      console.log("Clicking next page button...");
      await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => undefined),
        page.evaluate(() => {
          const el = document.querySelector<HTMLElement>("li.next-page a.results-pagelink");
          el?.click();
        }),
      ]);

      // Fallback wait in case navigation didn't occur (AJAX pagination)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      pageNumber += 1;
    }

    return allCars;
  } catch (error) {
    console.error("Error during click-based pagination scraping:", error);
    return allCars;
  } finally {
    if (browser) {
      console.log("Closing browser (click-based pagination)...");
      await browser.close();
    }
  }
}
