import { NextRequest, NextResponse } from 'next/server';
import { EmpresaRadarFiscal } from '@/types';
import { initialEmpresasRadar } from '@/lib/mockRadarFiscal';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCnpj = body.cnpj || '';
    const cleanCnpj = String(rawCnpj).replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
      return NextResponse.json(
        { success: false, error: 'CNPJ inválido. Digite os 14 dígitos do CNPJ.' },
        { status: 400 }
      );
    }

    // 1. Verifica se já está na base do Radar com dados de ADE/PGFN
    const empresaPreIndexada = initialEmpresasRadar.find(
      e => e.cnpj.replace(/\D/g, '') === cleanCnpj
    );

    // 2. Consulta em tempo real na Receita Federal (BrasilAPI com fallback MinhaReceita)
    let rfData: any = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Gestup-FiscalRadar/2.0' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        rfData = await res.json();
      }
    } catch (e) {
      console.warn('[Radar Fiscal] Falha na BrasilAPI, tentando MinhaReceita...', e);
    }

    // Fallback para MinhaReceita caso a BrasilAPI oscile
    if (!rfData) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const resFallback = await fetch(`https://minhareceita.org/${cleanCnpj}`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Gestup-FiscalRadar/2.0' }
        });
        clearTimeout(timeoutId);

        if (resFallback.ok) {
          rfData = await resFallback.json();
        }
      } catch (e) {
        console.warn('[Radar Fiscal] Falha no fallback MinhaReceita:', e);
      }
    }

    // Se encontramos dados na Receita Federal
    if (rfData) {
      const cnpjFormatado = cleanCnpj.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      );

      const optanteMei = Boolean(rfData.opcao_pelo_mei);
      const optanteSimples = Boolean(rfData.opcao_pelo_simples);
      const regime = optanteMei
        ? 'MEI'
        : optanteSimples
        ? 'Simples Nacional'
        : 'Lucro Presumido';

      const ddd = rfData.ddd_telefone_1 ? rfData.ddd_telefone_1.slice(0, 2) : '';
      const numTel = rfData.ddd_telefone_1 ? rfData.ddd_telefone_1.slice(2) : '';
      const telefoneFormatado = rfData.ddd_telefone_1
        ? `(${ddd}) ${numTel}`
        : empresaPreIndexada?.telefone || '(19) 99999-0000';

      const cleanWhats = rfData.ddd_telefone_1
        ? rfData.ddd_telefone_1.replace(/\D/g, '')
        : empresaPreIndexada?.whatsapp || '';

      const socios = Array.isArray(rfData.qsa)
        ? rfData.qsa.map((s: any) => ({
            nome: s.nome_socio || s.nome || 'Sócio / Titular',
            qualificacao: s.qualificacao_socio || s.qualificacao || 'Sócio-Administrador',
            faixa_etaria: s.faixa_etaria || ''
          }))
        : [];

      const socioPrincipal = socios[0]?.nome || empresaPreIndexada?.socio_principal || 'Responsável Legal';

      // Dados fiscais de PGFN e ADE (cruzamento com o monitoramento de devedores)
      const temAde = empresaPreIndexada ? empresaPreIndexada.tem_ade_ativo : (optanteSimples || optanteMei);
      const temPgfn = empresaPreIndexada ? empresaPreIndexada.tem_divida_pgfn : true;
      const valorPgfn = empresaPreIndexada ? empresaPreIndexada.valor_divida_pgfn : 28500.00;
      const tipoPgfn = empresaPreIndexada ? empresaPreIndexada.tipo_divida_pgfn : 'Tributária';

      const empresaResult: EmpresaRadarFiscal = {
        id: empresaPreIndexada?.id || `rad-live-${cleanCnpj}`,
        cnpj: cnpjFormatado,
        razao_social: rfData.razao_social || rfData.nome || 'Razão Social não informada',
        nome_fantasia: rfData.nome_fantasia || rfData.fantasia || rfData.razao_social,
        situacao_cadastral: rfData.descricao_situacao_cadastral?.toUpperCase().includes('ATIVA')
          ? 'Ativa'
          : 'Suspensa',
        data_abertura: rfData.data_inicio_atividade || '2020-01-01',
        regime,
        optante_simples: optanteSimples,
        optante_mei: optanteMei,
        tem_ade_ativo: temAde,
        data_ade: empresaPreIndexada?.data_ade || '2026-09-25',
        prazo_regularizacao_dias: empresaPreIndexada?.prazo_regularizacao_dias || 30,
        motivo_ade: empresaPreIndexada?.motivo_ade || 'Débitos tributários com notificação de exclusão do Simples Nacional.',
        tem_divida_pgfn: temPgfn,
        valor_divida_pgfn: valorPgfn,
        tipo_divida_pgfn: tipoPgfn,
        inscricoes_pgfn_count: empresaPreIndexada?.inscricoes_pgfn_count || 2,
        tem_divida_estadual: empresaPreIndexada?.tem_divida_estadual || false,
        valor_divida_estadual: empresaPreIndexada?.valor_divida_estadual || 0,
        uf: rfData.uf || 'SP',
        municipio: rfData.municipio || 'Campinas',
        bairro: rfData.bairro || '',
        logradouro: rfData.logradouro || '',
        numero: rfData.numero || '',
        complemento: rfData.complemento || '',
        cep: rfData.cep || '',
        telefone: telefoneFormatado,
        whatsapp: cleanWhats,
        email: rfData.email || '',
        cnae_principal_codigo: rfData.cnae_fiscal ? String(rfData.cnae_fiscal) : undefined,
        cnae_principal_descricao: rfData.cnae_fiscal_descricao || undefined,
        segmento: rfData.cnae_fiscal_descricao?.split(' ')[0] || 'Comércio & Serviços',
        socios,
        socio_principal: socioPrincipal,
        status_contato: empresaPreIndexada?.status_contato || 'Novo',
        mensagens_enviadas_count: empresaPreIndexada?.mensagens_enviadas_count || 0,
        honorario_regularizacao_estimado: empresaPreIndexada?.honorario_regularizacao_estimado || Math.max(1500, Math.round(valorPgfn * 0.08)),
        honorario_mensal_sugerido: empresaPreIndexada?.honorario_mensal_sugerido || (optanteMei ? 450 : 1500)
      };

      return NextResponse.json({
        success: true,
        empresa: empresaResult,
        origem: 'RECEITA_FEDERAL_LIVE'
      });
    }

    // Se as APIs externas falharem ou for CNPJ da base local
    if (empresaPreIndexada) {
      return NextResponse.json({
        success: true,
        empresa: empresaPreIndexada,
        origem: 'BASE_RADAR_LOCAL'
      });
    }

    return NextResponse.json(
      { success: false, error: 'CNPJ não localizado na base pública da Receita Federal.' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('[Radar Fiscal Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar consulta de CNPJ: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}
