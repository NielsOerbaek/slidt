export interface HealthStatus {
  status: 'ok';
  db: 'ok' | string;
}

/**
 * Returns a health status object.
 * Accepts an injectable `dbPing` so the function is unit-testable without a live DB.
 * The HTTP status is always 200 — even a DB error only changes `db` field,
 * so uptime monitors continue to get a valid response.
 */
export async function getHealthStatus(
  dbPing: () => Promise<void>,
): Promise<HealthStatus> {
  try {
    await dbPing();
    return { status: 'ok', db: 'ok' };
  } catch (err) {
    return {
      status: 'ok',
      db: err instanceof Error ? err.message : String(err),
    };
  }
}
