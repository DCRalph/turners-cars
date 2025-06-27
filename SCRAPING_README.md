# Turners Car Scraping System

This Next.js application includes a comprehensive car scraping system that automatically collects car listings from Turners.co.nz and stores them in a PostgreSQL database.

## Features

- **Automated Scraping**: Runs every 6 hours using Next.js instrumentation
- **Manual Scraping**: API endpoints for manual triggering
- **Data Persistence**: Upserts car data with timestamps
- **Pagination Support**: Handles multiple pages of results
- **Error Handling**: Comprehensive error handling and logging
- **tRPC Integration**: APIs for accessing scraped data

## Setup

### Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Enable scraping in development
ENABLE_SCRAPING=true

# Run scraping immediately on startup in development
RUN_SCRAPING_ON_START=true

# Database connection (already configured in your project)
DATABASE_URL="your-database-url"
```

### Database Schema

The scraping system uses the existing `cars` table in your Prisma schema:

```prisma
model cars {
  id        Int      @id @default(autoincrement())
  carId     String   // Unique identifier: "hostname_goodnumber"
  carName   String?
  carPrice  String?
  odometer  String?
  location  String?
  photos    String[] // Array of photo URLs
  detailUrl String?
  added     DateTime // When first scraped
  lastSeen  DateTime // Last time seen in scraping
}
```

## Usage

### Automatic Scraping

The scraping system runs automatically:

- **Production**: Starts automatically when the app is deployed
- **Development**: Only runs if `ENABLE_SCRAPING=true` is set

Schedule: Every 6 hours (0, 6, 12, 18 hours) in New Zealand timezone

### Manual Scraping

#### API Endpoints

**GET /api/scrape** - Get scraping statistics

```bash
curl http://localhost:3000/api/scrape
```

**POST /api/scrape** - Trigger full scraping

```bash
curl -X POST http://localhost:3000/api/scrape
```

**POST /api/scrape?action=single** - Scrape a single URL

```bash
curl -X POST "http://localhost:3000/api/scrape?action=single&scraperType=turners&urlTemplate=https://..."
```

#### tRPC Endpoints

```typescript
// Get all cars with pagination and filtering
const cars = await api.cars.getAllCars.query({
  limit: 20,
  offset: 0,
  search: "subaru",
  sortBy: "lastSeen",
  sortOrder: "desc",
});

// Get a specific car by carId
const car = await api.cars.getCarById.query({
  carId: "www.turners.co.nz_12345",
});

// Get scraping statistics
const stats = await api.cars.getStats.query();
```

## Configuration

### Scraping URLs

The scraping targets are configured in `src/lib/services/scraping-service.ts`:

```typescript
const SCRAPING_CONFIG = [
  {
    type: "turners",
    url: "https://www.turners.co.nz/Cars/Used-Cars-for-Sale/subaru/?sortorder=6&pagesize=110&pageno={}&searchfor=sti&issearchsimilar=true&make=subaru",
  },
  // Add more configurations as needed
];
```

### Scheduling

Modify the cron schedule in `instrumentation.ts`:

```typescript
// Current: every 6 hours
cron.schedule("0 */6 * * *", async () => {
  // Scraping logic
});

// Examples:
// Every hour: '0 * * * *'
// Every day at 2 AM: '0 2 * * *'
// Every Monday at 9 AM: '0 9 * * 1'
```

## Data Flow

1. **Scraping**: Cheerio parses HTML and extracts car data
2. **Processing**: Data is normalized and structured
3. **Storage**: Upsert operation either:
   - Inserts new cars with `added` and `lastSeen` timestamps
   - Updates `lastSeen` timestamp for existing cars
4. **Access**: tRPC APIs provide structured access to data

## File Structure

```
src/
├── lib/
│   ├── scrapers/
│   │   └── turners.ts          # Turners scraping logic
│   └── services/
│       ├── scraping-service.ts # Main scraping orchestration
│       └── car-service.ts      # Database operations
├── app/api/scrape/
│   └── route.ts                # Manual scraping API
└── server/api/routers/
    └── cars.ts                 # tRPC car APIs
instrumentation.ts              # Next.js instrumentation & scheduling
```

## Monitoring

### Logs

The system provides detailed logging:

- 🚀 Scraping started
- ✅ Scraping completed successfully
- ⚠️ Warnings for partial failures
- ❌ Errors for failures

### Statistics

Monitor scraping performance via:

```typescript
// Get current statistics
const stats = await fetch("/api/scrape").then((r) => r.json());

// Statistics include:
// - totalCars: Total cars in database
// - recentCars: Cars seen in last 24 hours
// - lastUpdated: Last update timestamp
```

## Error Handling

The system includes comprehensive error handling:

- **Network errors**: Retries and graceful degradation
- **Parsing errors**: Logs and continues with other cars
- **Database errors**: Logs and continues with other cars
- **Rate limiting**: Built-in delays between requests

## Adding New Scrapers

To add support for other car websites:

1. Create a new scraper in `src/lib/scrapers/`
2. Add the scraper to `SCRAPER_FUNCTIONS` in `scraping-service.ts`
3. Add configuration to `SCRAPING_CONFIG`

Example:

```typescript
// src/lib/scrapers/example-site.ts
export async function scrapeExampleSite(
  urlTemplate: string,
): Promise<CarData[]> {
  // Implementation
}

// src/lib/services/scraping-service.ts
const SCRAPER_FUNCTIONS = {
  turners: scrapeTurners,
  exampleSite: scrapeExampleSite, // Add new scraper
};
```

## Performance Considerations

- **Rate Limiting**: 1-second delay between page requests
- **Batch Processing**: Processes all cars in memory before database operations
- **Efficient Queries**: Uses upsert operations to minimize database hits
- **Background Processing**: Runs in separate process via instrumentation

## Troubleshooting

### Common Issues

1. **Scraping not starting**: Check `ENABLE_SCRAPING` environment variable
2. **Database errors**: Verify `DATABASE_URL` and run `npm run db:push`
3. **Network timeouts**: Check internet connection and website availability
4. **Memory issues**: Reduce `pagesize` in URL configurations

### Debugging

Enable debug logging:

```typescript
// In scraping-service.ts
console.log("Debug:", { cars: allCars.length, errors: errors.length });
```

### Testing

Test individual components:

```bash
# Test manual scraping
curl -X POST http://localhost:3000/api/scrape

# Test database connection
npm run db:studio
```
