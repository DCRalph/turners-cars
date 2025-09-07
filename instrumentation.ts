import * as cron from "node-cron";

// This function will be called when the Next.js runtime is instrumented
export async function register() {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_SCRAPING === "true"
  ) {
    // Import modules only when needed to avoid circular dependencies
    const { runFullScraping } = await import(
      "./src/lib/services/scraping-service"
    );

    console.log("Turners Car Scraping Instrumentation Started");

    cron.schedule(
      // "*/15 * * * *", // every 15 minutes
      "0 */2 * * *", // every 2 hours
      async () => {
        console.log("Starting scheduled car scraping...");

        try {
          const stats = await runFullScraping();
          console.log("✅ Scheduled scraping completed successfully:", {
            totalCarsProcessed: stats.totalCarsProcessed,
            duration: `${stats.duration}ms`,
            errors: stats.errors.length,
            timestamp: new Date().toISOString(),
          });

          if (stats.errors.length > 0) {
            console.warn("⚠️ Scraping completed with errors:", stats.errors);
          }
        } catch (error) {
          console.error("❌ Scheduled scraping failed:", error);
        }
      },
      {
        timezone: "Pacific/Auckland", // New Zealand timezone
      },
    );

    // Optional: Run scraping immediately on startup in development
    if (
      process.env.NODE_ENV === "development" &&
      process.env.RUN_SCRAPING_ON_START === "true"
    ) {
      console.log("🔧 Running initial scraping in development mode...");

      // Add a small delay to ensure the database is ready
      setTimeout(() => {
        void (async () => {
          try {
            const stats = await runFullScraping();
            console.log("✅ Initial scraping completed:", {
              totalCarsProcessed: stats.totalCarsProcessed,
              duration: `${stats.duration}ms`,
            });
          } catch (error) {
            console.error("❌ Initial scraping failed:", error);
          }
        })();
      }, 5000); // 5 second delay
    }

    console.log("Car scraping scheduled");
  } else {
    console.log(
      "Car scraping disabled",
    );
  }
}
