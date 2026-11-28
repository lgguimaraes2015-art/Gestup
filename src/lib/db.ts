import { Pool } from 'pg';

const globalForDb = globalThis as unknown as {
  __gestupPgPool?: Pool;
  __gestupSchemaReady?: boolean;
};

export function getDatabaseUrl(): string | null {
  const url =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.NEON_DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    '';

  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isDatabaseConfigured(): boolean {
  return getDatabaseUrl() !== null;
}

export function getDbPool(): Pool {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error('NO_DATABASE_URL');
  }

  if (!globalForDb.__gestupPgPool) {
    const isLocal =
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1');

    globalForDb.__gestupPgPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 10000,
      ssl: isLocal ? undefined : { rejectUnauthorized: false }
    });
  }

  return globalForDb.__gestupPgPool;
}

export async function ensureGestupSchema(): Promise<void> {
  if (globalForDb.__gestupSchemaReady) return;
  const pool = getDbPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gestup_state (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  globalForDb.__gestupSchemaReady = true;
}
