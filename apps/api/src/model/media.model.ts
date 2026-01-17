import { MediaType } from "@media-scra/shared";

export interface Media {
  id?: number;
  site_id: number;
  title: string | null;
  url: string;
  type: MediaType;
  createdAt?: string;
}