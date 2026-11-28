import { Pool } from 'pg';

const globalForDb = globalThis as unknown as {
  __gestupPgPool?: Pool;
  __gestupSchemaReady?: boolean;
};

export function getDatabaseUrl(): string | null {
  const direct =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.STORAGE_POSTGRES_URL ||
    process.env.STORAGE_DATABASE_URL ||
    process.env.STORAGE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.NEON_DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    '';

  if (direct.trim().length > 0) {
    return direct.trim();
  }

  // Fallback automático: detecta qualquer variável criada pela Vercel com Custom Prefix (ex: STORAGE_DATABASE_URL)
  for (const [key, val] of Object.entries(process.env)) {
    if (
      val &&
      /^(postgres|postgresql):\/\//i.test(val.trim()) &&
      /(POSTGRES|DATABASE|STORAGE|NEON|SUPABASE)/i.test(key)
    ) {
      return val.trim();
    }
  }

  return null;
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
    CREATE TABLE IF NOT EXISTS gestup_state_history (
      id BIGSERIAL PRIMARY KEY,
      key TEXT NOT NULL,
      value JSONB NOT NULL,
      saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_gestup_state_history_key_saved
      ON gestup_state_history (key, saved_at DESC);
  `);
  globalForDb.__gestupSchemaReady = true;
}
