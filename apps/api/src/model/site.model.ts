export interface Site {
  id?: number;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'processing';
  createdAt: string;
}