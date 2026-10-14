import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      number,
      text,
      apiUrl = 'https://evolution-api-production-ed7c.up.railway.app',
      apiKey = 'e74e3e545d217c1598f490d802b2ba61cff2a937a2f532cc987cb745f133a28a',
      instanceName = 'gestup'
    } = body;

    if (!number || !text) {
      return NextResponse.json(
        { success: false, error: 'Número e mensagem são obrigatórios.' },
        { status: 400 }
      );
    }

    // Limpa e formata o número brasileiro (garantindo DDI 55)
    let cleanNumber = String(number).replace(/\D/g, '');
    if (cleanNumber.length === 10 || cleanNumber.length === 11) {
      cleanNumber = `55${cleanNumber}`;
    }

    // Normaliza a URL da API
    const baseUrl = String(apiUrl).trim().replace(/\/+$/, '');
    const endpoint = `${baseUrl}/message/sendText/${encodeURIComponent(instanceName.trim())}`;

    console.log(`[WhatsApp API] Disparando mensagem para ${cleanNumber} via ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey.trim()
      },
      body: JSON.stringify({
        number: cleanNumber,
        text: text,
        delay: 1200
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('[WhatsApp API] Erro ao enviar mensagem:', response.status, data);
      return NextResponse.json(
        {
          success: false,
          error: data?.response?.message || data?.error || `Falha HTTP ${response.status}`,
          details: data
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.key?.id,
      data
    });
  } catch (error: any) {
    console.error('[WhatsApp API] Erro interno:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
