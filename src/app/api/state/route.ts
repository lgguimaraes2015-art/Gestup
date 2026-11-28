import { NextRequest, NextResponse } from 'next/server';
import { ensureGestupSchema, getDbPool, isDatabaseConfigured } from '@/lib/db';
import { CLOUD_SYNC_KEYS } from '@/lib/cloudSync';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const ALLOWED_KEYS_SET = new Set<string>(CLOUD_SYNC_KEYS);
const HISTORY_KEYS_SET = new Set<string>([
  'gestup_v2_honorarios',
  'gestup_v2_tarefas',
  'gestup_v2_clientes'
]);

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0'
};

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        data: {},
        keyTimestamps: {},
        updatedAt: null,
        keysCount: 0,
        reason: 'NO_DATABASE_URL'
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  }

  try {
    await ensureGestupSchema();
    const pool = getDbPool();
    const result = await pool.query<{
      key: string;
      value: unknown;
      updated_at: Date;
    }>('SELECT key, value, updated_at FROM gestup_state');

    const data: Record<string, unknown> = {};
    const keyTimestamps: Record<string, string> = {};
    let latestMs = 0;

    for (const row of result.rows) {
      if (ALLOWED_KEYS_SET.has(row.key)) {
        data[row.key] = row.value;
        const iso = row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString();
        keyTimestamps[row.key] = iso;
        const ts = new Date(iso).getTime();
        if (ts > latestMs) latestMs = ts;
      }
    }

    return NextResponse.json(
      {
        configured: true,
        data,
        keyTimestamps,
        updatedAt: latestMs > 0 ? new Date(latestMs).toISOString() : null,
        keysCount: Object.keys(data).length
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao ler banco de dados';
    console.error('[API /api/state GET] Erro:', message);
    return NextResponse.json(
      {
        configured: true,
        error: message,
        data: {},
        keyTimestamps: {},
        updatedAt: null,
        keysCount: 0
      },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: 'Banco de dados na nuvem ainda não está conectado na Vercel (falta POSTGRES_URL ou DATABASE_URL).'
      },
      { status: 503, headers: NO_CACHE_HEADERS }
    );
  }

  let body: { updates?: Record<string, unknown> } | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, configured: true, error: 'Payload JSON inválido.' },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  }

  const updates = body?.updates;
  if (!updates || typeof updates !== 'object') {
    return NextResponse.json(
      { ok: false, configured: true, error: 'Campo "updates" é obrigatório.' },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  }

  const entries = Object.entries(updates).filter(([k]) => ALLOWED_KEYS_SET.has(k));
  if (entries.length === 0) {
    return NextResponse.json(
      { ok: true, configured: true, savedKeys: [], keyTimestamps: {}, updatedAt: new Date().toISOString() },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  }

  try {
    await ensureGestupSchema();
    const pool = getDbPool();
    const client = await pool.connect();
    const keyTimestamps: Record<string, string> = {};

    try {
      await client.query('BEGIN');
      for (const [key, value] of entries) {
        const serialized = JSON.stringify(value);
        const upsertRes = await client.query<{ updated_at: Date }>(
          `INSERT INTO gestup_state (key, value, updated_at)
           VALUES ($1, $2::jsonb, NOW())
           ON CONFLICT (key)
           DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
           RETURNING updated_at`,
          [key, serialized]
        );
        const tsIso = upsertRes.rows[0]?.updated_at
          ? new Date(upsertRes.rows[0].updated_at).toISOString()
          : new Date().toISOString();
        keyTimestamps[key] = tsIso;

        // Backup automático de versões críticas no Postgres (mantém as últimas 25 versões por chave)
        if (HISTORY_KEYS_SET.has(key)) {
          await client.query(
            `INSERT INTO gestup_state_history (key, value, saved_at) VALUES ($1, $2::jsonb, NOW())`,
            [key, serialized]
          );
          await client.query(
            `DELETE FROM gestup_state_history
             WHERE key = $1
               AND id NOT IN (
                 SELECT id FROM gestup_state_history
                 WHERE key = $1
                 ORDER BY saved_at DESC
                 LIMIT 25
               )`,
            [key]
          );
        }
      }
      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK').catch(() => {});
      throw txErr;
    } finally {
      client.release();
    }

    return NextResponse.json(
      {
        ok: true,
        configured: true,
        savedKeys: entries.map(([k]) => k),
        keyTimestamps,
        updatedAt: new Date().toISOString()
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao gravar no banco de dados';
    console.error('[API /api/state POST] Erro:', message);
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: message
      },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
