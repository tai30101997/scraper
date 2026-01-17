import { db, MediaItem } from '@media-scra/shared';
export class MediaRepository {
  private readonly insertStmt = db.prepare(`
    INSERT INTO media (site_id, title, url, type) 
    VALUES (@siteId, @title, @url, @type)
  `);


  bulkInsert(items: MediaItem[]): void {
    const transaction = db.transaction((data: MediaItem[]) => {
      for (const item of data) {
        this.insertStmt.run(item);
      }
    });
    transaction(items);
  }
  findAll(whereSql: string, args: any) {
    const dataQuery = `
      SELECT m.*, s.name as site_name 
      FROM media m
      LEFT JOIN sites s ON m.site_id = s.id
      ${whereSql} 
      ORDER BY m.id DESC 
      LIMIT @limit OFFSET @offset
    `;

    const countQuery = `SELECT COUNT(*) as total FROM media m ${whereSql}`;

    const data = db.prepare(dataQuery).all(args);

    const { limit, offset, ...countArgs } = args;
    const totalResult = db.prepare(countQuery).get(countArgs) as { total: number };

    return {
      rawItems: data,
      total: totalResult.total
    };
  }
}