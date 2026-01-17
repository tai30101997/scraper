import { Router } from 'express';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { SiteRepository } from '@media-scra/shared';
import { validate } from '../../middlewares/validate.middleware';
import { CreateSiteSchema } from './site.schema';


const siteRouter = Router();

const siteRepo = new SiteRepository();
const siteService = new SiteService(siteRepo);
const siteController = new SiteController(siteService);

siteRouter.post(
  '/scrape',
  validate(CreateSiteSchema,),
  (req, res) => siteController.handleScrape(req, res)
);
export default siteRouter;