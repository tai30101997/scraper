import { db, SiteStatus } from '@media-scra/shared';

export class SiteRepository {
  async findOrCreate(url: string): Promise<number> {
    const domainName = new URL(url).hostname;

    const insertStmt = db.prepare(
      "INSERT OR IGNORE INTO sites (name, url, status) VALUES (?, ?, 'processing')"
    );
    insertStmt.run(domainName, url);

    const selectStmt = db.prepare("SELECT id FROM sites WHERE url = ?");
    const site = selectStmt.get(url) as { id: number };
    return site.id;
  }
  async updateStatus(siteId: number, status: SiteStatus): Promise<boolean> {
    const stmt = db.prepare("UPDATE sites SET status = ? WHERE id = ?");
    const result = stmt.run(status, siteId);
    return result.changes > 0;
  }
}