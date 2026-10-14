import { NextRequest, NextResponse } from 'next/server';

function formatPhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('55')) {
    // 55 19 992080639 -> +55 (19) 99208-0639
    const ddd = digits.slice(2, 4);
    const num = digits.slice(4);
    if (num.length === 9) {
      return `+55 (${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
    }
    return `+55 (${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`;
  }
  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const num = digits.slice(2);
    return `+55 (${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
  }
  return raw;
}

async function checkStatus(apiUrl: string, apiKey: string, instanceName: string) {
  const baseUrl = String(apiUrl).trim().replace(/\/+$/, '');
  const cleanKey = apiKey.trim();
  const cleanInstance = instanceName.trim();

  // 1. Tenta buscar detalhes completos da instância via fetchInstances
  try {
    const instancesUrl = `${baseUrl}/instance/fetchInstances`;
    const instResponse = await fetch(instancesUrl, {
      method: 'GET',
      headers: { 'apikey': cleanKey },
      cache: 'no-store'
    });

    if (instResponse.ok) {
      const instances = await instResponse.json();
      if (Array.isArray(instances)) {
        const found = instances.find((i: any) => i.name === cleanInstance);
        if (found) {
          const state = found.connectionStatus || 'open';
          const rawOwner = found.ownerJid ? found.ownerJid.replace('@s.whatsapp.net', '') : null;
          const ownerFormatted = rawOwner ? formatPhoneBR(rawOwner) : '+55 (19) 99208-0639';

          return NextResponse.json({
            success: true,
            state,
            instanceName: cleanInstance,
            connected: state === 'open',
            ownerJid: found.ownerJid,
            ownerNumber: rawOwner,
            ownerFormatted,
            profileName: found.profileName || 'Finup Consultoria',
            profilePicUrl: found.profilePicUrl || null,
            token: found.token,
            data: found
          });
        }
      }
    }
  } catch (err) {
    console.warn('[WhatsApp Status] Falha ao chamar fetchInstances, tentando fallback:', err);
  }

  // 2. Fallback: connectionState
  const endpoint = `${baseUrl}/instance/connectionState/${encodeURIComponent(cleanInstance)}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 'apikey': cleanKey },
    cache: 'no-store'
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      {
        success: false,
        state: 'disconnected',
        error: data?.error || `HTTP ${response.status}`,
        details: data
      },
      { status: response.status }
    );
  }

  const state = data?.instance?.state || 'unknown';

  return NextResponse.json({
    success: true,
    state,
    instanceName: cleanInstance,
    connected: state === 'open',
    ownerFormatted: '+55 (19) 99208-0639',
    profileName: 'Finup Consultoria',
    data
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const apiUrl = searchParams.get('apiUrl') || 'https://evolution-api-production-ed7c.up.railway.app';
    const apiKey = searchParams.get('apiKey') || '68A885CD-5F29-4269-949C-8AEB4D149393';
    const instanceName = searchParams.get('instanceName') || 'gestup';

    return await checkStatus(apiUrl, apiKey, instanceName);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, state: 'disconnected', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      apiUrl = 'https://evolution-api-production-ed7c.up.railway.app',
      apiKey = '68A885CD-5F29-4269-949C-8AEB4D149393',
      instanceName = 'gestup'
    } = body;

    return await checkStatus(apiUrl, apiKey, instanceName);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, state: 'disconnected', error: error.message },
      { status: 500 }
    );
  }
}
