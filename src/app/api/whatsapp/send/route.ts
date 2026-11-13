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

    // Limpa e formata o número brasileiro (garantindo DDI 55)
    let cleanNumber = String(number || '').replace(/\D/g, '');
    if (cleanNumber.length === 10 || cleanNumber.length === 11) {
      cleanNumber = `55${cleanNumber}`;
    }

    const fallbackUrl = cleanNumber
      ? `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text || '')}`
      : undefined;

    if (!cleanNumber || cleanNumber.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Número de telefone inválido ou não informado.',
          fallbackUrl
        },
        { status: 400 }
      );
    }

    if (!text && !media) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mensagem ou documento são obrigatórios para o envio.',
          fallbackUrl
        },
        { status: 400 }
      );
    }

    // Normaliza a URL da API
    const baseUrl = String(apiUrl || '').trim().replace(/\/+$/, '');
    const cleanInstance = encodeURIComponent((instanceName || 'gestup').trim());
    const cleanKey = String(apiKey || '').trim();

    // 1. Se houver arquivo anexo (mídia), tenta enviar via sendMedia primeiro
    if (media && baseUrl) {
      try {
        const mediaEndpoint = `${baseUrl}/message/sendMedia/${cleanInstance}`;
        console.log(`[WhatsApp API] Tentando enviar documento para ${cleanNumber} via ${mediaEndpoint}`);

        const mediaResponse = await fetch(mediaEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': cleanKey
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

        if (mediaResponse.ok && !mediaData?.error) {
          console.log(`[WhatsApp API] Mídia enviada com sucesso para ${cleanNumber}`);
          return NextResponse.json({
            success: true,
            mediaSent: true,
            messageId: mediaData?.key?.id,
            data: mediaData
          });
        }

        console.warn('[WhatsApp API] Falha no envio de mídia, tentando fallback para sendText:', mediaResponse.status, mediaData);
      } catch (mediaErr) {
        console.warn('[WhatsApp API] Exceção no envio de mídia, fallback para sendText:', mediaErr);
      }
    }

    // 2. Envio de texto (padrão ou fallback de mídia)
    if (baseUrl) {
      const textEndpoint = `${baseUrl}/message/sendText/${cleanInstance}`;
      console.log(`[WhatsApp API] Disparando mensagem de texto para ${cleanNumber} via ${textEndpoint}`);

      try {
        const response = await fetch(textEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': cleanKey
          },
          body: JSON.stringify({
            number: cleanNumber,
            text: text,
            delay: 1200
          })
        });

        const data = await response.json().catch(() => null);

        if (response.ok && !data?.error) {
          return NextResponse.json({
            success: true,
            messageId: data?.key?.id,
            data
          });
        }

        // Se o Railway retornou 404 (Application not found / Serviço desativado)
        const erroMsg = data?.message || data?.response?.message || data?.error || `Falha HTTP ${response.status}`;
        console.error('[WhatsApp API] Erro ao enviar mensagem de texto:', response.status, erroMsg);

        return NextResponse.json(
          {
            success: false,
            error: response.status === 404
              ? `Servidor da Evolution API no Railway não encontrado (HTTP 404 - Application not found). O serviço pode estar desativado ou com novo domínio.`
              : erroMsg,
            statusHttp: response.status,
            fallbackUrl,
            details: data
          },
          { status: 200 } // Retorna 200 com success: false para o frontend tratar amigavelmente
        );
      } catch (fetchErr: any) {
        console.error('[WhatsApp API] Falha de conexão com o servidor da API:', fetchErr);
        return NextResponse.json({
          success: false,
          error: `Não foi possível conectar ao servidor da Evolution API (${baseUrl}): ${fetchErr.message}`,
          fallbackUrl
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'URL da Evolution API não configurada.',
      fallbackUrl
    });
  } catch (error: any) {
    console.error('[WhatsApp API] Erro interno:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro interno no servidor de envio'
      },
      { status: 500 }
    );
  }
}
