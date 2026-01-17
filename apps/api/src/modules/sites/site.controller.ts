import { Request, Response } from 'express';
import { SiteService } from './site.service';

export class SiteController {
  constructor(private readonly siteService: SiteService) { }

  async handleScrape(req: Request, res: Response) {
    // Input ["https://abc.com/p1", "https://abc.com/p2", ...]
    const { urls } = req.body;

    if (!Array.isArray(urls)) {
      return res.status(400).json({ success: false, message: 'Input must be an array of URLs' });
    }
    if (urls.length === 0) {
      return res.status(400).json({ success: false, message: 'URL array cannot be empty' });
    }

    try {
      const siteId = await this.siteService.processUrls(urls);
      return res.status(200).json({
        success: true,
        message: `${urls.length} URLs queued successfully`,
        siteId
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Error queueing URLs' });
    }
  }
}