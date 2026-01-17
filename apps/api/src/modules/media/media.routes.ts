import { Router } from 'express';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { validate } from '../../middlewares/validate.middleware';
import { GetMediaSchema } from './media.schema';
import { MediaRepository } from '@media-scra/shared';

const mediaRouter = Router();

const mediaRepo = new MediaRepository();
const mediaService = new MediaService(mediaRepo);
const mediaController = new MediaController(mediaService);
// GET /api/media/
mediaRouter.get(
  '/',
  // validate(GetMediaSchema, 'query'), // Validate query params
  (req, res) => mediaController.getAll(req, res)
);

export default mediaRouter;