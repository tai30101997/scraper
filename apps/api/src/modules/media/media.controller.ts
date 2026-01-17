import { Request, Response } from 'express';
import { MediaService } from './media.service';
import { GetMediaInput } from 'libs/shared/src/lib/core/types';

export class MediaController {
  constructor(private readonly service: MediaService) { }

  async getAll(req: Request, res: Response) {
    try {
      const query = req.query;
      let input: GetMediaInput = {
        page: query.page ? parseInt(query.page as string, 10) : 1,
        limit: query.limit ? parseInt(query.limit as string, 10) : 10,
        type: query.type as string | undefined,
        search: query.search as string | undefined,
      };
      // 2. Call service
      const result = await this.service.getAllMedia(input);
      // 3. Response
      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
  }
}