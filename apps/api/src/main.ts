/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import cors from 'cors';

import { initDatabase, scrapeQueue } from '@media-scra/shared';
import siteRouter from './modules/sites/site.routes';
import mediaRouter from './modules/media/media.routes';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import testRouter from './modules/test/test.routes';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(scrapeQueue)],
  serverAdapter: serverAdapter,
});
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
// Increase payload limit if needed
initDatabase();

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});
app.use('/admin/queues', serverAdapter.getRouter());
app.use('/api/sites', siteRouter);
app.use('/api/media', mediaRouter);
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/api/test', testRouter);


const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
