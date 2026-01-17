export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}
export interface MediaItemDetail {
  siteId: number;
  title: string;
  url: string;
  type: MediaType;
  siteName?: string;
}
export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}
