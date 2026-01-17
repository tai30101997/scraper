import * as dotenv from 'dotenv';

dotenv.config();

export interface MediaItem {
  siteId: number;
  title: string;
  url: string;
  type: MediaType;
}
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}
export enum SiteStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROCESSING = 'processing',
}
export const SCRAPE_QUEUE = 'scrape-media';
export const QUEUE_NAME = 'scrape';
export type ValidationLocation = 'body' | 'query' | 'params';

export const REDIS_CONFIG = {
  connection: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: Number(process.env['REDIS_PORT']) || 6379,
    maxRetriesPerRequest: null
  }
};
export interface GetMediaInput {
  page: number;
  limit: number;
  type?: string;
  search?: string;
};
export const NOISE = ['favicon', 'logo', 'icon', 'avatar', 'btn', 'loading', 'ads'];
export const VIDEO_HOSTS = ['youtube.com', 'vccorp.vn', 'mediacdn.vn', '.mp4'];


