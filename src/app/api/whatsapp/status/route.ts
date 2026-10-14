import { NextRequest, NextResponse } from 'next/server';

async function checkStatus(apiUrl: string, apiKey: string, instanceName: string) {
  const baseUrl = String(apiUrl).trim().replace(/\/+$/, '');
  const endpoint = `${baseUrl}/instance/connectionState/${encodeURIComponent(instanceName.trim())}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'apikey': apiKey.trim()
    },
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
    state, // 'open' | 'connecting' | 'close'
    instanceName,
    connected: state === 'open',
    data
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const apiUrl = searchParams.get('apiUrl') || 'https://evolution-api-production-ed7c.up.railway.app';
    const apiKey = searchParams.get('apiKey') || 'e74e3e545d217c1598f490d802b2ba61cff2a937a2f532cc987cb745f133a28a';
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
      apiKey = 'e74e3e545d217c1598f490d802b2ba61cff2a937a2f532cc987cb745f133a28a',
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
