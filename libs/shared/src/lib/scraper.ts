import {
  MediaItem, MediaType,
  NOISE,
  VIDEO_HOSTS
} from '@media-scra/shared';
import * as cheerio from 'cheerio';
export const extractMediaFromHtml = (html: string, url: string, siteId: number): MediaItem[] => {
  const $ = cheerio.load(html);
  const mediaItems: MediaItem[] = [];
  const baseUrl = new URL(url).origin;

  // 1. Process Images
  $('img').each((_, el) => {
    let src = ($(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-original')) as string;
    if (!src) return;

    if (NOISE.some(p => src.toLowerCase().includes(p)) || src.startsWith('data:')) return;

    // Normalize URL
    if (src.startsWith('//')) src = `https:${src}`;
    else if (src.startsWith('/')) src = baseUrl + src;
    else if (!src.startsWith('http')) src = `${baseUrl}/${src}`;

    // Get original quality
    src = src.replace(/\/zoom\/\d+_\d+\//, '/');

    const title = $(el).attr('alt')?.trim() || $(el).attr('title')?.trim();
    if (title && title.length > 5) {
      mediaItems.push({ siteId, title, url: src, type: MediaType.IMAGE });
    }
  });

  //  Process Videos & Iframes
  $('video source, video, iframe').each((_, el) => {
    let vSrc = ($(el).attr('src') || $(el).attr('data-src')) as string;
    if (!vSrc) return;

    const isVideoHost = VIDEO_HOSTS.some(p => vSrc.includes(p));
    if (!isVideoHost || vSrc.includes('ads')) return;

    if (vSrc.startsWith('//')) vSrc = `https:${vSrc}`;
    else if (vSrc.startsWith('/')) vSrc = baseUrl + vSrc;

    mediaItems.push({
      siteId,
      title: $('h1').first().text().trim() || 'Video Content',
      url: vSrc,
      type: MediaType.VIDEO
    });
  });

  //  prevent Deduplicate
  return [...new Map(mediaItems.map(item => [item.url, item])).values()];
};