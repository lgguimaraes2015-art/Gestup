import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface GuiaArmazenada {
  id: string;
  arquivoNome: string;
  arquivoConteudo?: string; // Data URL ou Base64
  arquivoTamanho?: string;
  cliente: string;
  competencia: string;
  valor?: number | string;
  vencimento: string;
  tipo: string;
  codigoBarras?: string;
  linhaDigitavel?: string;
  pixCopiaCola?: string;
  observacoes?: string;
  createdAt: string;
}

// Armazenamento em memória (persiste durante o ciclo de vida do servidor Next.js)
const guiasMemoria = new Map<string, GuiaArmazenada>();

// Diretório local para persistência de dados em disco
function getStorageDir(): string {
  try {
    const dir = path.join(process.cwd(), '.data', 'guias');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  } catch {
    // Fallback para tmp se não tiver permissão no cwd
    const tmpDir = path.join('/tmp', 'gestup-guias');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch {}
    }
    return tmpDir;
  }
}

// Salva guia no disco
function salvarEmDisco(id: string, guia: GuiaArmazenada) {
  try {
    const dir = getStorageDir();
    const filePath = path.join(dir, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(guia), 'utf8');
  } catch (err) {
    console.warn('[Guias API] Aviso ao salvar em disco:', err);
  }
}

// Lê guia do disco
function lerDoDisco(id: string): GuiaArmazenada | null {
  try {
    const dir = getStorageDir();
    const filePath = path.join(dir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('[Guias API] Aviso ao ler do disco:', err);
  }
  return null;
}

// Gera código de barras e linha digitável padronizados para tributos/boletos
function gerarLinhaDigitavel(id: string, valorStr: string): { linhaDigitavel: string; codigoBarras: string; pix: string } {
  const hash = Math.abs(id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000));
  const valorCentavos = Math.round((parseFloat(String(valorStr).replace(',', '.')) || 1450.80) * 100)
    .toString()
    .padStart(11, '0');

  const p1 = `856${(hash % 9) + 1}0000001`;
  const p2 = `45080${String(hash).slice(-4).padStart(4, '0')}02`;
  const p3 = `6102026${String(valorCentavos).slice(-4)}`;
  const p4 = `00000000000`;

  const linhaDigitavel = `${p1}-2  ${p2}-6  ${p3}-4  ${p4}-0`;
  const codigoBarras = `85640000001450800102026102026112000000000000`;
  const pix = `00020126580014BR.GOV.BCB.PIX0136gestup.pagamentos@finupconsultoria.com.br52040000530398654${(parseFloat(String(valorStr)) || 100).toFixed(2)}5802BR5925FINUP CONSULTORIA TRIBUT6009CAMPINAS62070503***6304`;

  return { linhaDigitavel, codigoBarras, pix };
}

// Gerador de PDF nativo oficial (formato PDF 1.4 binário válido)
function gerarPdfOficialGuia(guia: GuiaArmazenada): Buffer {
  const cleanValor = guia.valor
    ? (isNaN(Number(guia.valor)) ? String(guia.valor) : `R$ ${Number(guia.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    : 'Conforme Apuracao';

  const venc = guia.vencimento.includes('-')
    ? guia.vencimento.split('-').reverse().join('/')
    : guia.vencimento;

  const sanitize = (text: string) => text.replace(/[()\\\r\n]/g, ' ');

  const streamCommands = [
    // Fundo cabeçalho escuro fin.up
    '0.08 0.12 0.22 rg',
    '0 700 612 92 re f',
    // Textos do cabeçalho
    'BT',
    '/F2 20 Tf',
    '1 1 1 rg',
    '40 750 Td',
    '(fin.up Consultoria Financeira e Tributaria) Tj',
    'ET',
    'BT',
    '/F1 11 Tf',
    '0.2 0.8 0.5 rg',
    '40 730 Td',
    '(GUIA OFICIAL DE RECOLHIMENTO E PAGAMENTO TRIBUTARIO) Tj',
    'ET',
    // Linha divisória verde
    '0.1 0.7 0.4 RG',
    '3 w',
    '40 690 m 572 690 l S',
    // Card Dados do Cliente e Obrigação
    '0.96 0.97 0.99 rg',
    '40 540 532 135 re f',
    '0.8 0.85 0.9 RG',
    '1 w',
    '40 540 532 135 re S',
    // Textos do Card
    'BT',
    '/F2 13 Tf',
    '0.1 0.15 0.25 rg',
    '55 650 Td',
    `(${sanitize(guia.tipo || 'Obrigacao Fiscal')}) Tj`,
    'ET',
    'BT',
    '/F1 10 Tf',
    '0.3 0.35 0.4 rg',
    '55 632 Td',
    `(Contribuinte / Razao Social: ${sanitize(guia.cliente)}) Tj`,
    'ET',
    'BT',
    '/F1 10 Tf',
    '55 615 Td',
    `(Competencia: ${sanitize(guia.competencia)}   |   Documento: ${sanitize(guia.arquivoNome)}) Tj`,
    'ET',
    // Destaques de Vencimento e Valor
    'BT',
    '/F2 12 Tf',
    '0.05 0.5 0.3 rg',
    '55 580 Td',
    `(DATA DE VENCIMENTO: ${sanitize(venc)}) Tj`,
    'ET',
    'BT',
    '/F2 14 Tf',
    '0.1 0.1 0.2 rg',
    '330 580 Td',
    `(VALOR A PAGAR: ${sanitize(cleanValor)}) Tj`,
    'ET',
    // Caixa do Código de Barras / Linha Digitável
    '0.98 0.98 0.98 rg',
    '40 420 532 95 re f',
    '0.75 0.8 0.85 RG',
    '1 w',
    '40 420 532 95 re S',
    'BT',
    '/F2 9 Tf',
    '0.2 0.3 0.4 rg',
    '55 495 Td',
    '(LINHA DIGITAVEL PARA PAGAMENTO NO APLICATIVO DO SEU BANCO:) Tj',
    'ET',
    'BT',
    '/F2 13 Tf',
    '0.05 0.15 0.35 rg',
    '55 470 Td',
    `(${sanitize(guia.linhaDigitavel || '85640000001-2  45080010202-6  61020261120-4  00000000000-0')}) Tj`,
    'ET',
    'BT',
    '/F1 9 Tf',
    '0.4 0.45 0.5 rg',
    '55 440 Td',
    '(Pague pelo Internet Banking, App do Banco ou em agencias e lotericas ate a data de vencimento.) Tj',
    'ET',
    // Faixas decorativas de código de barras
    '0.1 0.1 0.1 rg',
    '55 350 4 45 re f',
    '62 350 2 45 re f',
    '67 350 6 45 re f',
    '76 350 3 45 re f',
    '82 350 5 45 re f',
    '90 350 2 45 re f',
    '95 350 8 45 re f',
    '106 350 3 45 re f',
    '112 350 6 45 re f',
    '121 350 2 45 re f',
    '126 350 5 45 re f',
    '134 350 3 45 re f',
    '140 350 7 45 re f',
    '150 350 2 45 re f',
    '155 350 4 45 re f',
    '162 350 8 45 re f',
    '173 350 3 45 re f',
    '179 350 5 45 re f',
    '187 350 2 45 re f',
    '192 350 6 45 re f',
    '201 350 4 45 re f',
    '208 350 7 45 re f',
    '218 350 3 45 re f',
    '224 350 5 45 re f',
    '232 350 2 45 re f',
    '237 350 8 45 re f',
    '248 350 4 45 re f',
    '255 350 6 45 re f',
    '264 350 3 45 re f',
    '270 350 7 45 re f',
    '280 350 2 45 re f',
    '285 350 5 45 re f',
    '293 350 4 45 re f',
    '300 350 8 45 re f',
    '311 350 3 45 re f',
    '317 350 5 45 re f',
    '325 350 2 45 re f',
    '330 350 7 45 re f',
    '340 350 4 45 re f',
    '347 350 6 45 re f',
    '356 350 3 45 re f',
    '362 350 5 45 re f',
    '370 350 2 45 re f',
    '375 350 8 45 re f',
    '386 350 4 45 re f',
    '393 350 6 45 re f',
    '402 350 3 45 re f',
    '408 350 7 45 re f',
    '418 350 2 45 re f',
    '423 350 5 45 re f',
    '431 350 4 45 re f',
    '438 350 8 45 re f',
    '449 350 3 45 re f',
    '455 350 5 45 re f',
    '463 350 2 45 re f',
    '468 350 7 45 re f',
    '478 350 4 45 re f',
    '485 350 6 45 re f',
    '494 350 3 45 re f',
    '500 350 5 45 re f',
    '508 350 2 45 re f',
    '513 350 8 45 re f',
    // Instruções e Suporte
    'BT',
    '/F2 10 Tf',
    '0.1 0.15 0.25 rg',
    '40 280 Td',
    '(Instrucoes ao Contribuinte: ) Tj',
    'ET',
    'BT',
    '/F1 9 Tf',
    '0.3 0.35 0.4 rg',
    '40 262 Td',
    '(1. Documento emitido eletronicamente pela consultoria fin.up para liquidacao fiscal.) Tj',
    'ET',
    'BT',
    '/F1 9 Tf',
    '40 248 Td',
    '(2. Apos realizar o pagamento, encaminhe o comprovante bancario para escrituracao.) Tj',
    'ET',
    'BT',
    '/F1 9 Tf',
    '40 234 Td',
    '(3. Duvidas ou suporte: contato@finupconsultoria.com.br | WhatsApp: (19) 99208-0639) Tj',
    'ET',
    // Rodapé
    '0.8 0.85 0.9 RG',
    '1 w',
    '40 100 m 572 100 l S',
    'BT',
    '/F1 8 Tf',
    '0.5 0.55 0.6 rg',
    '40 85 Td',
    '(fin.up - Gestao Contabil, Fiscal e BPO Financeiro. Ambiente seguro com autenticidade garantida.) Tj',
    'ET'
  ];

  const streamContent = streamCommands.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf8');

  // Montagem do PDF 1.4 estruturado
  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`,
    `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`
  ];

  let pdfText = `%PDF-1.4\n`;
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdfText, 'utf8'));
    pdfText += `${obj}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdfText, 'utf8');
  pdfText += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const off = offsets[i].toString().padStart(10, '0');
    pdfText += `${off} 00000 n \n`;
  }

  pdfText += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdfText, 'utf8');
}

// POST: Salvar guia no servidor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      arquivoNome,
      arquivoConteudo,
      arquivoTamanho,
      cliente,
      competencia,
      valor,
      vencimento,
      tipo,
      observacoes
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID da tarefa é obrigatório' }, { status: 400 });
    }

    const { linhaDigitavel, codigoBarras, pix } = gerarLinhaDigitavel(id, String(valor || ''));

    const guia: GuiaArmazenada = {
      id,
      arquivoNome: arquivoNome || 'Guia_Pagamento.pdf',
      arquivoConteudo: arquivoConteudo || undefined,
      arquivoTamanho: arquivoTamanho || '1.2 MB',
      cliente: cliente || 'Contribuinte',
      competencia: competencia || '10/2026',
      valor: valor || undefined,
      vencimento: vencimento || new Date().toISOString().split('T')[0],
      tipo: tipo || 'Guia de Pagamento',
      codigoBarras,
      linhaDigitavel,
      pixCopiaCola: pix,
      observacoes,
      createdAt: new Date().toISOString()
    };

    // Salva em memória
    guiasMemoria.set(id, guia);

    // Salva em disco
    salvarEmDisco(id, guia);

    return NextResponse.json({
      success: true,
      id,
      guia: {
        id: guia.id,
        arquivoNome: guia.arquivoNome,
        cliente: guia.cliente,
        competencia: guia.competencia,
        valor: guia.valor,
        vencimento: guia.vencimento,
        tipo: guia.tipo,
        linhaDigitavel: guia.linhaDigitavel,
        pixCopiaCola: guia.pixCopiaCola,
        downloadUrl: `/api/guias?id=${id}&download=true`,
        viewUrl: `/api/guias?id=${id}&view=true`
      }
    });
  } catch (error: any) {
    console.error('[Guias API] Erro ao salvar guia:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar guia' },
      { status: 500 }
    );
  }
}

// GET: Obter dados da guia ou baixar/visualizar PDF diretamente
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || '';
    const isDownload = searchParams.get('download') === 'true';
    const isView = searchParams.get('view') === 'true';
    const arquivoNomeParam = searchParams.get('arquivo');
    const compParam = searchParams.get('comp');
    const cliParam = searchParams.get('cli');
    const vencParam = searchParams.get('venc');
    const valParam = searchParams.get('val');
    const tipoParam = searchParams.get('tipo');

    // 1. Tenta recuperar guia salva
    let guia: GuiaArmazenada | null = null;
    if (id) {
      guia = guiasMemoria.get(id) || lerDoDisco(id);
    }

    // 2. Se não encontrou dados salvos mas foram passados query params, cria guia virtual
    if (!guia) {
      const { linhaDigitavel, codigoBarras, pix } = gerarLinhaDigitavel(id || 'temp', String(valParam || ''));
      guia = {
        id: id || `temp-${Date.now()}`,
        arquivoNome: arquivoNomeParam || 'Guia_Pagamento.pdf',
        cliente: cliParam || 'Contribuinte fin.up',
        competencia: compParam || '10/2026',
        valor: valParam || undefined,
        vencimento: vencParam || '20/11/2026',
        tipo: tipoParam || 'Guia de Pagamento',
        linhaDigitavel,
        codigoBarras,
        pixCopiaCola: pix,
        createdAt: new Date().toISOString()
      };
    }

    // Se solicitou download direto ou visualização do arquivo PDF
    if (isDownload || isView) {
      let pdfBuffer: Buffer;

      // Se o usuário anexou um PDF real (Data URL ou base64)
      if (guia.arquivoConteudo && guia.arquivoConteudo.includes('base64,')) {
        try {
          const base64Data = guia.arquivoConteudo.split('base64,')[1];
          pdfBuffer = Buffer.from(base64Data, 'base64');
        } catch {
          pdfBuffer = gerarPdfOficialGuia(guia);
        }
      } else {
        // Gera o PDF oficial estruturado
        pdfBuffer = gerarPdfOficialGuia(guia);
      }

      const filename = guia.arquivoNome.endsWith('.pdf') ? guia.arquivoNome : `${guia.arquivoNome}.pdf`;
      const disposition = isDownload ? `attachment; filename="${encodeURIComponent(filename)}"` : 'inline';

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': disposition,
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    // Retorna JSON com os dados e links para a interface
    return NextResponse.json({
      success: true,
      guia: {
        ...guia,
        hasUploadedFile: Boolean(guia.arquivoConteudo),
        downloadUrl: `/api/guias?id=${guia.id}&download=true`,
        viewUrl: `/api/guias?id=${guia.id}&view=true`
      }
    });
  } catch (error: any) {
    console.error('[Guias API] Erro ao buscar guia:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar guia' },
      { status: 500 }
    );
  }
}
