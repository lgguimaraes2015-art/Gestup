export const CLOUD_SYNC_KEYS = [
  'gestup_v2_tarefas',
  'gestup_v2_clientes',
  'gestup_v2_honorarios',
  'gestup_v2_colaboradores',
  'gestup_v2_declaracoes',
  'gestup_v2_contas_pagar',
  'gestup_v2_contas_receber',
  'gestup_v2_contas_bancarias',
  'gestup_v2_historico_ajustes_saldo',
  'gestup_v2_leads',
  'gestup_v2_modelos_mensagens',
  'gestup_v2_whatsapp_config',
  'gestup_v2_portal_documentos',
  'gestup_v2_portal_solicitacoes',
  'gestup_v2_radar_fiscal',
  'gestup_v2_dp_empresas_config',
  'gestup_v2_dp_funcionarios',
  'gestup_v2_dp_controle_vencimentos',
  'gestup_v2_dp_diario_bordo'
] as const;

export type CloudSyncKey = (typeof CLOUD_SYNC_KEYS)[number];

export type CloudSyncStatus = 'loading' | 'synced' | 'saving' | 'local_only' | 'error';

/**
 * Remove strings base64 muito pesadas apenas para o cache local (localStorage tem limite ~5MB),
 * evitando que QuotaExceededError bloqueie o salvamento de pagamentos e tarefas no celular.
 */
function stripHeavyBase64ForLocal(input: unknown): unknown {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    if (input.length > 20000 && (input.startsWith('data:') || /^[A-Za-z0-9+/=]{20000,}$/.test(input.slice(0, 20000)))) {
      return '';
    }
    return input;
  }
  if (Array.isArray(input)) {
    return input.map(stripHeavyBase64ForLocal);
  }
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if ((k === 'conteudo' || k === 'arquivo_conteudo') && typeof v === 'string' && v.length > 15000) {
        out[k] = '';
      } else {
        out[k] = stripHeavyBase64ForLocal(v);
      }
    }
    return out;
  }
  return input;
}

/**
 * Grava com segurança no localStorage. Se estourar o limite de 5MB do navegador/celular,
 * faz fallback removendo anexos base64 pesados do cache local para nunca perder alterações.
 */
export function safeLocalStorageSet(key: string, value: unknown): { ok: boolean; stripped: boolean } {
  if (typeof window === 'undefined') return { ok: false, stripped: false };
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true, stripped: false };
  } catch {
    try {
      const lighter = stripHeavyBase64ForLocal(value);
      localStorage.setItem(key, JSON.stringify(lighter));
      return { ok: true, stripped: true };
    } catch (err2) {
      console.error(`[GestUp Storage] Falha crítica ao salvar chave ${key} no localStorage:`, err2);
      return { ok: false, stripped: true };
    }
  }
}
