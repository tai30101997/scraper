import {
  MediaRepository,
  REDIS_CONFIG,
  SCRAPE_QUEUE,
  SiteRepository,
  SiteStatus,
  extractMediaFromHtml,
  initDatabase
} from '@media-scra/shared';
import axios from 'axios';
import { Job, Worker } from 'bullmq';

initDatabase();

const mediaRepo = new MediaRepository();
const siteRepo = new SiteRepository();

const worker = new Worker(
  SCRAPE_QUEUE,
  async (job: Job) => {
    const { url, siteId } = job.data;
    console.log(`[Worker] Processing: ${url}`);

    try {
      const { data: html } = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      // 3. Process and Collect Media
      const media = extractMediaFromHtml(html, url, siteId);

      if (media.length > 0) {
        mediaRepo.bulkInsert(media);
        console.log(`[Worker] Stored ${media.length} items`);
      }

      await siteRepo.updateStatus(siteId, SiteStatus.ACTIVE);

    } catch (error: any) {
      console.error(`[Worker Error] ${url}: ${error.message}`);
      await siteRepo.updateStatus(siteId, SiteStatus.INACTIVE);
      throw error;
    }
  },
  {
    ...REDIS_CONFIG,
    concurrency: process.env['MAX_CONCURRENT_PAGES'] ? parseInt(process.env['MAX_CONCURRENT_PAGES']) : 50,
    limiter: { max: 50, duration: 1000 }
  }
);

worker.on('completed', (job) => console.log(`[Worker] Job ${job.id} done`));
worker.on('failed', (job, err) => console.error(`[Worker] Job ${job?.id} failed: ${err.message}`));

console.log('Media Scraper Worker is running...');