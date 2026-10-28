import { NextRequest, NextResponse } from 'next/server';

export interface CheckNumberResult {
  number: string;
  raw: string;
  exists: boolean;
  jid?: string;
  name?: string;
  tipo?: 'celular' | 'fixo' | 'invalido';
  reason?: string;
}

// Normaliza números brasileiros para validação
function normalizarNumero(num: string): { e164: string; tipo: 'celular' | 'fixo' | 'invalido'; clean: string } {
  let clean = String(num || '').replace(/\D/g, '');
  if (clean.startsWith('55') && clean.length >= 12) {
    clean = clean.slice(2);
  }

  if (clean.length === 11 && clean[2] === '9') {
    return { e164: `55${clean}`, tipo: 'celular', clean };
  } else if (clean.length === 10 && ['2', '3', '4', '5'].includes(clean[2])) {
    return { e164: `55${clean}`, tipo: 'fixo', clean };
  } else if (clean.length === 10) {
    // Número antigo de 8 dígitos ou celular sem o 9
    return { e164: `55${clean}`, tipo: 'fixo', clean };
  } else if (clean.length >= 8) {
    return { e164: `55${clean}`, tipo: 'fixo', clean };
  }
  return { e164: clean, tipo: 'invalido', clean };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      numbers,
      apiUrl = 'https://evolution-api-production-ed7c.up.railway.app',
      apiKey = '68A885CD-5F29-4269-949C-8AEB4D149393',
      instanceName = 'gestup'
    } = body;

    if (!Array.isArray(numbers) || numbers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'A lista de números é obrigatória.' },
        { status: 400 }
      );
    }

    const baseUrl = String(apiUrl).trim().replace(/\/+$/, '');
    const cleanInstance = encodeURIComponent(instanceName.trim());
    const cleanKey = apiKey.trim();

    // Mapeia e prepara números
    const mapeamento = numbers.map(raw => {
      const norm = normalizarNumero(raw);
      return {
        raw,
        ...norm
      };
    });

    // Filtra apenas números com estrutura válida para checar na API
    const numerosParaChecarApi = mapeamento
      .filter(m => m.tipo !== 'invalido')
      .map(m => m.e164);

    let apiResultados: any[] = [];
    let apiSucesso = false;

    if (numerosParaChecarApi.length > 0) {
      try {
        const checkEndpoint = `${baseUrl}/chat/whatsappNumbers/${cleanInstance}`;
        console.log(`[WhatsApp Check] Consultando ${numerosParaChecarApi.length} números no endpoint ${checkEndpoint}`);

        const response = await fetch(checkEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': cleanKey
          },
          body: JSON.stringify({ numbers: numerosParaChecarApi }),
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            apiResultados = data;
            apiSucesso = true;
          }
        } else {
          console.warn('[WhatsApp Check] Resposta não OK da Evolution API:', response.status);
        }
      } catch (err) {
        console.warn('[WhatsApp Check] Erro de conexão com a Evolution API:', err);
      }
    }

    // Monta o mapa de resultados
    const mapaApi = new Map<string, { exists: boolean; jid?: string; name?: string }>();
    apiResultados.forEach(item => {
      const numClean = String(item.number || '').replace(/\D/g, '');
      mapaApi.set(numClean, {
        exists: Boolean(item.exists),
        jid: item.jid,
        name: item.name
      });
    });

    // Compila os resultados finais
    const resultados: CheckNumberResult[] = mapeamento.map(m => {
      if (m.tipo === 'invalido') {
        return {
          number: m.clean,
          raw: m.raw,
          exists: false,
          tipo: 'invalido',
          reason: 'Número incompleto ou formato inválido'
        };
      }

      // Se obtivemos resposta da API oficial
      if (apiSucesso && mapaApi.has(m.e164)) {
        const info = mapaApi.get(m.e164)!;
        return {
          number: m.e164,
          raw: m.raw,
          exists: info.exists,
          jid: info.jid,
          name: info.name,
          tipo: m.tipo,
          reason: info.exists ? 'WhatsApp ativo verificado' : (m.tipo === 'fixo' ? 'Telefone fixo sem WhatsApp' : 'Sem conta no WhatsApp')
        };
      }

      // Fallback inteligente caso a Evolution API esteja temporariamente inacessível
      if (m.tipo === 'fixo') {
        return {
          number: m.e164,
          raw: m.raw,
          exists: false,
          tipo: 'fixo',
          reason: 'Telefone fixo (não suporta WhatsApp padrão)'
        };
      }

      // Celular com DDD e 9º dígito
      const isProvavelWhatsapp = m.tipo === 'celular' && m.clean.length === 11 && m.clean[2] === '9';
      return {
        number: m.e164,
        raw: m.raw,
        exists: isProvavelWhatsapp,
        tipo: m.tipo,
        reason: isProvavelWhatsapp ? 'Celular válido (Estimado)' : 'Sem WhatsApp ativo'
      };
    });

    const comWhatsApp = resultados.filter(r => r.exists).length;
    const semWhatsApp = resultados.length - comWhatsApp;

    return NextResponse.json({
      success: true,
      total: resultados.length,
      comWhatsApp,
      semWhatsApp,
      origemValidacao: apiSucesso ? 'evolution_api_oficial' : 'validador_inteligente_fallback',
      resultados
    });
  } catch (error: any) {
    console.error('[WhatsApp Check Numbers] Erro:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha ao validar números no WhatsApp' },
      { status: 500 }
    );
  }
}
