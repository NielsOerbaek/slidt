import type { PageServerLoad } from './$types.js';
import { db, slideTypes } from '$lib/server/db/index.ts';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  const global = await db
    .select()
    .from(slideTypes)
    .where(eq(slideTypes.scope, 'global'));
  return { slideTypes: global };
};
