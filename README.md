---
## 📦 Applications

### 🌐 Web (`apps/web`)
Next.js dashboard providing:
- URL submission interface
- Real-time media monitoring
- Job progress tracking (Waiting / Active)
- Media filtering (Image / Video)

---

### 🚪 API (`apps/api`)
Gateway service responsible for:
- Receiving scrape requests
- Validating and normalizing URLs
- Dispatching jobs to Redis queues
- Exposing paginated media APIs

---

### ⚙️ Worker (`apps/worker`)
The core extraction engine:
- Consumes jobs from Redis (BullMQ)
- Fetches HTML content
- Extracts images and videos using Cheerio
- Normalizes and deduplicates media
- Persists results into SQLite

Designed for high concurrency with minimal memory usage.

---

## 📚 Shared Library (`libs/shared`)

The shared library acts as the core brain of the system.

### `repositories/`
Data access abstraction:
- `media.repository.ts`
- `site.repository.ts`

### `scraper.ts`
- HTML parsing
- Media filtering and normalization
- URL resolution and deduplication

### `queue.ts`
Centralized Redis / BullMQ configuration shared across services.

QUEUE UI 

http://localhost:3333/admin/queues/queue/scrape-media?status=waiting

### `db.ts`
SQLite lifecycle management optimized for write-heavy workloads.

---

--- RUN ON DEVELOP 
  
  "start": "nx run-many -t serve -p web-app api worker --parallel=3"

  "api": "nx serve api"

  "worker": "nx serve worker"

  "web": "nx serve web-app"

## 🐳 Docker Deployment

The full stack can be deployed using Docker Compose.

### Run Entire System
```bash
docker compose up -d --build

Run Services Individually

docker compose up -d --build api
docker compose up -d --build worker
docker compose up -d --build web
docker compose up 

🧪 Load Testing — 5,000 Concurrent URLs

UI-Based Test
	1.	Open the Web Dashboard
	2.	Trigger the 5,000 URL test
	3.	Observe Redis queue depth, worker throughput, and system resource usage

API-Based Trigger
POST /sites/scrape
{
  "urls": [
    "https://kenh14.vn/star.chn",
    "https://kenh14.vn/musik.chn",
    "https://kenh14.vn/cinet.chn"
  ]
}

Monitoring & Debugging

 # Visualize Nx dependency graph
npx nx graph

# Monitor Redis queue activity
docker compose exec redis redis-cli monitor

# Inspect container resource usage
docker stats

# Reset Redis queue
docker compose exec redis redis-cli flushall