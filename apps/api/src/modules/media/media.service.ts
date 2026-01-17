import { GetMediaInput, MediaRepository } from '@media-scra/shared';

export class MediaService {
  constructor(private readonly repo: MediaRepository) {
  }

  async getAllMedia(input: GetMediaInput) {
    const { page, limit, type, search } = input;

    const offset = (page - 1) * limit;

    let whereSql = "WHERE 1=1";
    const args: any = { limit, offset };

    if (type) {
      whereSql += " AND m.type = @type";
      args.type = type;
    }

    if (search) {
      whereSql += " AND m.title LIKE @search";
      args.search = `%${search}%`;
    }
    const { rawItems, total } = this.repo.findAll(whereSql, args);

    const items = rawItems.map((item: any) => ({
      id: item.id,
      title: item.title || 'unknown',
      url: item.url,
      type: item.type,
      siteName: item.site_name
    }));

    return {
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}