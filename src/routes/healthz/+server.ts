import { json } from '@sveltejs/kit';
import { getHealthStatus } from '$lib/server/health.ts';
import { db, users } from '$lib/server/db/index.ts';
import { sql } from 'drizzle-orm';

export async function GET() {
  const status = await getHealthStatus(async () => {
    // A lightweight SELECT that exercises the connection and confirms the schema is up.
    await db.select({ ping: sql<number>`1` }).from(users).limit(1);
  });
  return json(status);
}
