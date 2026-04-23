import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { runSeed } from '../../scripts/seed.ts';
import { db, slideTypes, themes } from '../../src/lib/server/db/index.ts';
import { cleanDB } from './helpers.ts';
import { eq } from 'drizzle-orm';

describe('runSeed', () => {
  beforeEach(cleanDB);
  afterEach(cleanDB);

  it('inserts all 13 built-in slide types', async () => {
    await runSeed();
    const rows = await db.select().from(slideTypes).where(eq(slideTypes.scope, 'global'));
    expect(rows.length).toBeGreaterThanOrEqual(13);
    const names = rows.map((r) => r.name);
    expect(names).toContain('title');
    expect(names).toContain('content');
    expect(names).toContain('agenda');
    expect(names).toContain('appendix-list');
  });

  it('inserts the ANTAL-Theta default theme', async () => {
    await runSeed();
    const rows = await db
      .select()
      .from(themes)
      .where(eq(themes.name, 'antal-theta-default'));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.tokens['--ood-deep-violet']).toBe('#6E31FF');
  });

  it('is idempotent — running twice does not duplicate', async () => {
    await runSeed();
    await runSeed();
    const stRows = await db.select().from(slideTypes).where(eq(slideTypes.name, 'title'));
    expect(stRows).toHaveLength(1);
    const thRows = await db.select().from(themes).where(eq(themes.name, 'antal-theta-default'));
    expect(thRows).toHaveLength(1);
  });
});
