import { QUEUE_NAME, scrapeQueue, SiteRepository } from '@media-scra/shared';
import { Queue } from 'bullmq';
export class SiteService {
  private scrapeQueue: Queue = scrapeQueue;

  constructor(private readonly siteRepo: SiteRepository) { }

  async processUrls(urls: string[]) {
    if (!urls || urls.length === 0) return null;

    const domainToIdMap = new Map<string, number>();
    const allJobs: any[] = [];

    for (const link of urls) {
      try {
        const hostname = new URL(link).hostname;

        let siteId: number;
        if (domainToIdMap.has(hostname)) {
          siteId = domainToIdMap.get(hostname)!;
        } else {
          siteId = await this.siteRepo.findOrCreate(link);
          domainToIdMap.set(hostname, siteId);
        }
        allJobs.push({
          name: QUEUE_NAME,
          data: {
            url: link,
            siteId: siteId
          }, opts: {
            attempts: 3, // Number of retry attempts
            backoff: {
              type: 'exponential', // Exponential backoff strategy
              delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
          }
        });
      } catch (e) {
        console.error(`Error ${link}`);
      }
    }

    if (allJobs.length > 0) {
      await this.scrapeQueue.addBulk(allJobs);
    }

    return Array.from(domainToIdMap.values());
  }
}