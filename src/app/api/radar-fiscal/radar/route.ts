import { NextRequest, NextResponse } from 'next/server';
import { initialEmpresasRadar } from '@/lib/mockRadarFiscal';
import { EmpresaRadarFiscal } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      uf = '',
      municipio = '',
      regime = 'todos',
      statusRisco = 'todos',
      faixaDebito = 'todos',
      termoBusca = '',
      empresasCustomizadas = []
    } = body;

    // Combina a base pré-indexada com empresas adicionadas pelo usuário na sessão
    const todasEmpresas: EmpresaRadarFiscal[] = [
      ...empresasCustomizadas,
      ...initialEmpresasRadar.filter(
        baseEmp => !empresasCustomizadas.some((c: EmpresaRadarFiscal) => c.cnpj === baseEmp.cnpj)
      )
    ];

    let filtradas = todasEmpresas;

    // Filtro por Estado (UF)
    if (uf && uf !== 'TODOS') {
      filtradas = filtradas.filter(e => e.uf.toUpperCase() === uf.toUpperCase());
    }

    // Filtro por Município
    if (municipio && municipio.trim() !== '') {
      filtradas = filtradas.filter(e =>
        e.municipio.toLowerCase().includes(municipio.toLowerCase().trim())
      );
    }

    // Filtro por Regime Tributário
    if (regime === 'simples') {
      filtradas = filtradas.filter(e => e.optante_simples && !e.optante_mei);
    } else if (regime === 'mei') {
      filtradas = filtradas.filter(e => e.optante_mei);
    } else if (regime === 'outros') {
      filtradas = filtradas.filter(e => !e.optante_simples && !e.optante_mei);
    }

    // Filtro por Status de Risco Fiscal / ADE / PGFN
    if (statusRisco === 'ade_ativo') {
      filtradas = filtradas.filter(e => e.tem_ade_ativo);
    } else if (statusRisco === 'pgfn') {
      filtradas = filtradas.filter(e => e.tem_divida_pgfn && e.valor_divida_pgfn > 0);
    } else if (statusRisco === 'regular') {
      filtradas = filtradas.filter(e => !e.tem_ade_ativo && !e.tem_divida_pgfn);
    }

    // Filtro por Faixa de Débito
    if (faixaDebito === 'ate_10k') {
      filtradas = filtradas.filter(e => e.valor_divida_pgfn <= 10000);
    } else if (faixaDebito === '10k_50k') {
      filtradas = filtradas.filter(e => e.valor_divida_pgfn > 10000 && e.valor_divida_pgfn <= 50000);
    } else if (faixaDebito === '50k_150k') {
      filtradas = filtradas.filter(e => e.valor_divida_pgfn > 50000 && e.valor_divida_pgfn <= 150000);
    } else if (faixaDebito === 'acima_150k') {
      filtradas = filtradas.filter(e => e.valor_divida_pgfn > 150000);
    }

    // Filtro por Termo de Busca (Razão, Fantasia, CNPJ ou Sócio)
    if (termoBusca && termoBusca.trim() !== '') {
      const termo = termoBusca.toLowerCase().trim();
      filtradas = filtradas.filter(e =>
        e.razao_social.toLowerCase().includes(termo) ||
        (e.nome_fantasia && e.nome_fantasia.toLowerCase().includes(termo)) ||
        e.cnpj.includes(termo) ||
        (e.socio_principal && e.socio_principal.toLowerCase().includes(termo))
      );
    }

    // Estatísticas Consolidadas da Captação
    const totalEncontradas = filtradas.length;
    const totalComAde = filtradas.filter(e => e.tem_ade_ativo).length;
    const totalDividaPgfn = filtradas.reduce((acc, e) => acc + (e.valor_divida_pgfn || 0), 0);
    const totalSimples = filtradas.filter(e => e.optante_simples).length;
    const totalMei = filtradas.filter(e => e.optante_mei).length;
    const totalNovosLeads = filtradas.filter(e => e.status_contato === 'Novo').length;

    return NextResponse.json({
      success: true,
      empresas: filtradas,
      estatisticas: {
        totalEncontradas,
        totalComAde,
        totalDividaPgfn,
        totalSimples,
        totalMei,
        totalNovosLeads
      }
    });
  } catch (error: any) {
    console.error('[Radar Search Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao filtrar empresas no Radar Fiscal' },
      { status: 500 }
    );
  }
}
