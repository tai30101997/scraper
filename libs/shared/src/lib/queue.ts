import { Queue } from 'bullmq';
import { SCRAPE_QUEUE, REDIS_CONFIG } from '@media-scra/shared';

export const scrapeQueue = new Queue(SCRAPE_QUEUE, REDIS_CONFIG);