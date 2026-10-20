import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      number,
      text,
      media, // Data URL ou URL pública do documento (ex: data:application/pdf;base64,...)
      fileName,
      mimeType = 'application/pdf',
      apiUrl = 'https://evolution-api-production-ed7c.up.railway.app',
      apiKey = '68A885CD-5F29-4269-949C-8AEB4D149393',
      instanceName = 'gestup'
    } = body;

    if (!number || (!text && !media)) {
      return NextResponse.json(
        { success: false, error: 'Número e mensagem ou documento são obrigatórios.' },
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
    const cleanInstance = encodeURIComponent(instanceName.trim());

    // Se houver arquivo anexo (mídia), tenta enviar via sendMedia primeiro
    if (media) {
      try {
        const mediaEndpoint = `${baseUrl}/message/sendMedia/${cleanInstance}`;
        console.log(`[WhatsApp API] Tentando enviar documento/mídia para ${cleanNumber} via ${mediaEndpoint}`);

        const mediaResponse = await fetch(mediaEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey.trim()
          },
          body: JSON.stringify({
            number: cleanNumber,
            mediatype: 'document',
            mimetype: mimeType,
            caption: text || '',
            media: media,
            fileName: fileName || 'Guia_Pagamento.pdf',
            delay: 1200
          })
        });

        const mediaData = await mediaResponse.json().catch(() => null);

        if (mediaResponse.ok) {
          console.log(`[WhatsApp API] Mídia enviada com sucesso para ${cleanNumber}`);
          return NextResponse.json({
            success: true,
            mediaSent: true,
            messageId: mediaData?.key?.id,
            data: mediaData
          });
        }

        console.warn('[WhatsApp API] Falha no envio de mídia, tentando fallback para sendText:', mediaData);
      } catch (mediaErr) {
        console.warn('[WhatsApp API] Exceção no envio de mídia, fallback para sendText:', mediaErr);
      }
    }

    // Envio de texto (padrão ou fallback)
    const textEndpoint = `${baseUrl}/message/sendText/${cleanInstance}`;
    console.log(`[WhatsApp API] Disparando mensagem de texto para ${cleanNumber} via ${textEndpoint}`);

    const response = await fetch(textEndpoint, {
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
      console.error('[WhatsApp API] Erro ao enviar mensagem de texto:', response.status, data);
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
