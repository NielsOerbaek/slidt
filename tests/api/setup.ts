import { execSync } from 'child_process';

export async function setup() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL must be set for integration tests.\n' +
      'Start test DB: docker compose up -d postgres-test\n' +
      'Then run: DATABASE_URL=postgres://slidt:slidt@localhost:5433/slidt_test pnpm test:integration'
    );
  }
  execSync('pnpm drizzle-kit migrate', {
    env: { ...process.env },
    stdio: 'inherit',
  });
}

export async function teardown() {
  // nothing — leave DB in place for inspection
}
