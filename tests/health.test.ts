import { describe, it, expect } from 'vitest';
import { getHealthStatus } from '../src/lib/server/health.ts';

describe('getHealthStatus', () => {
  it('returns db: ok when dbPing resolves', async () => {
    const result = await getHealthStatus(async () => {});
    expect(result).toEqual({ status: 'ok', db: 'ok' });
  });

  it('returns db: error message when dbPing rejects', async () => {
    const result = await getHealthStatus(async () => {
      throw new Error('Connection refused');
    });
    expect(result.status).toBe('ok');
    expect(result.db).toBe('Connection refused');
  });

  it('returns db: stringified error when a non-Error is thrown', async () => {
    const result = await getHealthStatus(async () => {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw 'timeout';
    });
    expect(result.status).toBe('ok');
    expect(result.db).toBe('timeout');
  });
});
