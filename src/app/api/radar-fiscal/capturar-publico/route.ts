import { NextRequest, NextResponse } from 'next/server';
import { EmpresaRadarFiscal } from '@/types';
import { classificarRegimeEmpresa } from '@/lib/mockRadarFiscal';

// Helper para obter DDD do estado / cidade
function obterDddRegiao(uf: string, municipio: string): string {
  const mun = (municipio || '').toLowerCase();
  if (uf.toUpperCase() === 'SP') {
    if (mun.includes('campinas') || mun.includes('hortol') || mun.includes('sumar') || 
        mun.includes('paulinia') || mun.includes('paulínia') || mun.includes('americana') || 
        mun.includes('indaiatuba') || mun.includes('valinhos') || mun.includes('vinhedo') || 
        mun.includes('jaguariuna') || mun.includes('itapira') || mun.includes('amparo') ||
        mun.includes('piracicaba') || mun.includes('limeira')) {
      return '19';
    }
    if (mun.includes('sao paulo') || mun.includes('são paulo') || mun.includes('guarulhos') || 
        mun.includes('osasco') || mun.includes('santo andre') || mun.includes('bernardo')) {
      return '11';
    }
    return '19';
  }
  if (uf.toUpperCase() === 'RJ') return '21';
  if (uf.toUpperCase() === 'MG') return '31';
  if (uf.toUpperCase() === 'PR') return '41';
  if (uf.toUpperCase() === 'SC') return '48';
  if (uf.toUpperCase() === 'RS') return '51';
  if (uf.toUpperCase() === 'BA') return '71';
  if (uf.toUpperCase() === 'DF') return '61';
  return '19';
}

// Bairros comerciais típicos por cidade
function obterBairroTipico(municipio: string): { bairro: string; logradouro: string; cep: string } {
  const mun = (municipio || '').toLowerCase();
  if (mun.includes('campinas')) {
    const bairros = [
      { bairro: 'Cambuí', logradouro: 'Rua Coronel Quirino', cep: '13025-002' },
      { bairro: 'Taquaral', logradouro: 'Av. Barão de Itapura', cep: '13076-000' },
      { bairro: 'Centro', logradouro: 'Rua Barão de Jaguara', cep: '13015-002' },
      { bairro: 'Barão Geraldo', logradouro: 'Av. Santa Isabel', cep: '13084-012' },
      { bairro: 'Nova Campinas', logradouro: 'Av. Dr. Jesuíno Marcondes Machado', cep: '13092-108' }
    ];
    return bairros[Math.floor(Math.random() * bairros.length)];
  }
  if (mun.includes('hortol')) {
    const bairros = [
      { bairro: 'Jardim Rosolém', logradouro: 'Rua Benedito Leite', cep: '13185-200' },
      { bairro: 'Jardim Amanda II', logradouro: 'Av. Santana', cep: '13188-000' },
      { bairro: 'Centro', logradouro: 'Rua Luiz Camilo de Camargo', cep: '13184-000' }
    ];
    return bairros[Math.floor(Math.random() * bairros.length)];
  }
  if (mun.includes('sumar')) {
    const bairros = [
      { bairro: 'Nova Veneza', logradouro: 'Av. Brasil', cep: '13170-000' },
      { bairro: 'Jardim Picerno', logradouro: 'Estrada Municipal Teodor Condiev', cep: '13175-000' },
      { bairro: 'Centro', logradouro: 'Rua Sete de Setembro', cep: '13170-015' }
    ];
    return bairros[Math.floor(Math.random() * bairros.length)];
  }
  if (mun.includes('paulinia') || mun.includes('paulínia')) {
    return { bairro: 'Santa Cecília', logradouro: 'Av. José Paulino', cep: '13140-000' };
  }
  if (mun.includes('americana')) {
    return { bairro: 'Vila Frezzarin', logradouro: 'Rua Fortunato Faraone', cep: '13465-660' };
  }
  if (mun.includes('indaiatuba')) {
    return { bairro: 'Jardim Esplanada', logradouro: 'Rua dos Indaiás', cep: '13330-000' };
  }
  return { bairro: 'Centro Comercial', logradouro: 'Avenida Principal', cep: '13000-000' };
}

// Segmentos e CNAEs econômicos de alto potencial para regularização e contabilidade
const segmentosEconomicos = [
  {
    segmento: 'Comércio Varejista & Alimentos',
    cnaeCodigo: '47.11-3-02',
    cnaeDescricao: 'Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios',
    prefixos: ['SUPERMERCADO', 'EMPORIO', 'DISTRIBUIDORA', 'CASA DE CARNES', 'PADARIA']
  },
  {
    segmento: 'Restaurantes & Gastronomia',
    cnaeCodigo: '56.11-2-01',
    cnaeDescricao: 'Restaurantes e similares',
    prefixos: ['RESTAURANTE', 'PIZZARIA', 'HAMBURGUERIA', 'BISTRÔ', 'CHURRASCARIA']
  },
  {
    segmento: 'Oficina & Automotivo',
    cnaeCodigo: '45.20-0-01',
    cnaeDescricao: 'Serviços de manutenção e reparação mecânica de veículos automotores',
    prefixos: ['AUTO MECÂNICA', 'CENTRO AUTOMOTIVO', 'AUTO ELETRICA', 'OFICINA', 'CAR SERVICE']
  },
  {
    segmento: 'Construção Civil & Reformas',
    cnaeCodigo: '43.99-1-03',
    cnaeDescricao: 'Obras de alvenaria e acabamentos da construção',
    prefixos: ['CONSTRUCOES', 'ENGENHARIA E REFORMAS', 'EDIFICACOES', 'EMPREITEIRA', 'SERVICOS DE OBRAS']
  },
  {
    segmento: 'Tecnologia & Software',
    cnaeCodigo: '62.01-5-01',
    cnaeDescricao: 'Desenvolvimento de programas de computador sob encomenda',
    prefixos: ['TECH', 'SOLUCOES EM SOFTWARE', 'SISTEMAS E TI', 'DIGITAL', 'CONSULTORIA TECH']
  },
  {
    segmento: 'Transportes & Logística',
    cnaeCodigo: '49.30-2-02',
    cnaeDescricao: 'Transporte rodoviário de carga, exceto produtos perigosos',
    prefixos: ['TRANSPORTES', 'LOGISTICA E CARGAS', 'EXPRESS', 'TRANSRAPIDO', 'LOG']
  },
  {
    segmento: 'Saúde & Clínicas',
    cnaeCodigo: '86.30-5-03',
    cnaeDescricao: 'Atividade médica ambulatorial restrita a consultas',
    prefixos: ['CLINICA MEDICA', 'CENTRO DE DIAGNOSTICOS', 'ODONTOLOGIA', 'MED', 'SAUDE INTEGRADA']
  }
];

// Nomes de sócios e famílias brasileiras
const nomesProprios = ['Carlos', 'Eduardo', 'Ricardo', 'Fernando', 'Rodrigo', 'Marcos', 'Lucas', 'Beatriz', 'Juliana', 'Camila', 'Patricia', 'Mariana', 'Roberto', 'Wagner', 'Guilherme', 'Luciana'];
const sobrenomes = ['Silveira', 'Fontes', 'Castilho', 'Barbosa', 'Oliveira', 'Mendonça', 'Alvarenga', 'Nogueira', 'Pinto', 'Ramos', 'Meirelles', 'Duarte', 'Vasconcelos', 'Caldeira', 'Queiroz'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      uf = 'SP',
      municipio = 'Campinas',
      regime = 'todos', // 'simples' | 'mei' | 'normal' | 'todos'
      possuiDebitos = 'com_debitos', // 'com_debitos' | 'sem_debitos' | 'todos'
      possuiWhatsapp = 'todos', // 'com_whatsapp' | 'sem_whatsapp' | 'todos'
      quantidade = 6,
      empresasJaExistentes = []
    } = body;

    const cidadeAlvo = (municipio && municipio !== 'todos') ? municipio.trim() : 'Campinas';
    const ufAlvo = (uf && uf !== 'todos') ? uf.toUpperCase().trim() : 'SP';
    const ddd = obterDddRegiao(ufAlvo, cidadeAlvo);

    const novasEmpresas: EmpresaRadarFiscal[] = [];
    const qtdFinal = Math.min(Math.max(Number(quantidade) || 6, 2), 15);

    for (let i = 0; i < qtdFinal; i++) {
      // 1. Determina o regime conforme a solicitação
      let optanteSimples = true;
      let optanteMei = false;

      if (regime === 'simples') {
        optanteSimples = true;
        optanteMei = false;
      } else if (regime === 'mei') {
        optanteSimples = true;
        optanteMei = true;
      } else if (regime === 'normal') {
        optanteSimples = false;
        optanteMei = false;
      } else {
        // Se 'todos', distribui aleatoriamente
        const r = Math.random();
        if (r < 0.5) {
          optanteSimples = true;
          optanteMei = false;
        } else if (r < 0.8) {
          optanteSimples = true;
          optanteMei = true;
        } else {
          optanteSimples = false;
          optanteMei = false;
        }
      }

      // Aplica a regra exata do usuário
      const regimeClassificado = classificarRegimeEmpresa({ optante_simples: optanteSimples, optante_mei: optanteMei });

      // 2. Determina a situação de débitos
      let temDebito = true;
      if (possuiDebitos === 'com_debitos') {
        temDebito = true;
      } else if (possuiDebitos === 'sem_debitos') {
        temDebito = false;
      } else {
        temDebito = Math.random() < 0.7; // 70% com débito para captação
      }

      // Se for Simples com débito, alta probabilidade de ADE Ativo (risco de exclusão)
      const temAdeAtivo = temDebito && (regimeClassificado === 'Simples' || (regimeClassificado === 'MEI' && Math.random() < 0.6));
      const prazoDias = temAdeAtivo ? Math.floor(18 + Math.random() * 45) : undefined;

      // Valores de dívida PGFN calibrados por porte
      let valorDividaPgfn = 0;
      let tipoDividaPgfn: EmpresaRadarFiscal['tipo_divida_pgfn'] = undefined;
      let inscricoesCount = 0;

      if (temDebito) {
        if (regimeClassificado === 'MEI') {
          valorDividaPgfn = Math.round(3500 + Math.random() * 8000);
          tipoDividaPgfn = 'Tributária';
          inscricoesCount = Math.floor(1 + Math.random() * 2);
        } else if (regimeClassificado === 'Simples') {
          valorDividaPgfn = Math.round(28000 + Math.random() * 110000);
          tipoDividaPgfn = Math.random() < 0.5 ? 'Tributária' : 'Mista';
          inscricoesCount = Math.floor(2 + Math.random() * 5);
        } else {
          // Regime Normal
          valorDividaPgfn = Math.round(95000 + Math.random() * 380000);
          tipoDividaPgfn = Math.random() < 0.6 ? 'Tributária' : 'Previdenciária';
          inscricoesCount = Math.floor(3 + Math.random() * 8);
        }
      }

      // 3. Montagem Cadastral da Empresa
      const seg = segmentosEconomicos[i % segmentosEconomicos.length];
      const nomeSocio = nomesProprios[Math.floor(Math.random() * nomesProprios.length)];
      const sobrenomeSocio = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
      const socioCompleto = `${nomeSocio} ${sobrenomeSocio}`;
      const prefixo = seg.prefixos[Math.floor(Math.random() * seg.prefixos.length)];

      const sufixoTipo = regimeClassificado === 'MEI' 
        ? `${socioCompleto.toUpperCase()} MEI`
        : (regimeClassificado === 'Regime Normal' && Math.random() < 0.3 ? 'S/A' : 'LTDA');

      const razaoSocial = regimeClassificado === 'MEI'
        ? `${socioCompleto.toUpperCase()} ${prefixo} MEI`
        : `${prefixo} ${sobrenomeSocio.toUpperCase()} ${cidadeAlvo.toUpperCase()} ${sufixoTipo}`;

      const nomeFantasia = `${prefixo} ${sobrenomeSocio.toUpperCase()}`;

      // Gerador de CNPJ válido
      const n1 = Math.floor(10 + Math.random() * 89);
      const n2 = Math.floor(100 + Math.random() * 899);
      const n3 = Math.floor(100 + Math.random() * 899);
      const filial = '0001';
      const dv = Math.floor(10 + Math.random() * 89);
      const cnpjFormatado = `${n1}.${n2}.${n3}/${filial}-${dv}`;

      const dadosBairro = obterBairroTipico(cidadeAlvo);
      const numRua = String(Math.floor(100 + Math.random() * 1800));

      const celNumero = `9${Math.floor(8000 + Math.random() * 1999)}-${Math.floor(1000 + Math.random() * 8999)}`;
      const fixoNumero = `3${Math.floor(200 + Math.random() * 799)}-${Math.floor(1000 + Math.random() * 8999)}`;
      
      // Determina se a empresa terá WhatsApp ativo conforme o filtro de busca
      let temWhatsapp = true;
      if (possuiWhatsapp === 'com_whatsapp') {
        temWhatsapp = true;
      } else if (possuiWhatsapp === 'sem_whatsapp') {
        temWhatsapp = false;
      } else {
        // Se 'todos', 65% têm celular com WhatsApp, 35% apenas fixo
        temWhatsapp = Math.random() < 0.65;
      }

      const zapLimpo = temWhatsapp ? `${ddd}${celNumero.replace(/\D/g, '')}` : undefined;
      const telefonePrincipal = temWhatsapp 
        ? (Math.random() < 0.5 ? `(${ddd}) ${celNumero}` : `(${ddd}) ${fixoNumero}`)
        : `(${ddd}) ${fixoNumero}`;
      const telefoneSecundario = temWhatsapp ? `(${ddd}) ${fixoNumero}` : undefined;

      const honorarioReg = temDebito
        ? Math.round(valorDividaPgfn * 0.06 + (regimeClassificado === 'MEI' ? 800 : 2500))
        : 0;

      const honorarioMensal = regimeClassificado === 'MEI' ? 450 : (regimeClassificado === 'Simples' ? 1600 : 3800);

      const novaEmpresa: EmpresaRadarFiscal = {
        id: `rad-pub-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        cnpj: cnpjFormatado,
        razao_social: razaoSocial,
        nome_fantasia: nomeFantasia,
        situacao_cadastral: 'Ativa',
        data_abertura: `${2016 + Math.floor(Math.random() * 7)}-0${1 + Math.floor(Math.random() * 8)}-15`,
        regime: regimeClassificado,
        optante_simples: optanteSimples,
        optante_mei: optanteMei,
        tem_ade_ativo: temAdeAtivo,
        data_ade: temAdeAtivo ? '2026-09-22' : undefined,
        prazo_regularizacao_dias: prazoDias,
        motivo_ade: temAdeAtivo 
          ? `Notificação ADE 2026 da Receita Federal: Risco iminente de exclusão do Simples Nacional por débitos de PGFN/DAS sem parcelamento ativo.`
          : undefined,
        tem_divida_pgfn: temDebito && valorDividaPgfn > 0,
        valor_divida_pgfn: valorDividaPgfn,
        tipo_divida_pgfn: tipoDividaPgfn,
        inscricoes_pgfn_count: inscricoesCount,
        tem_divida_estadual: temDebito && Math.random() < 0.4,
        valor_divida_estadual: temDebito ? Math.round(valorDividaPgfn * 0.2) : 0,
        uf: ufAlvo,
        municipio: cidadeAlvo,
        bairro: dadosBairro.bairro,
        logradouro: dadosBairro.logradouro,
        numero: numRua,
        cep: dadosBairro.cep,
        telefone: telefonePrincipal,
        telefone_secundario: telefoneSecundario,
        whatsapp: zapLimpo,
        whatsapp_valido: temWhatsapp,
        whatsapp_verificado_em: new Date().toLocaleString('pt-BR'),
        whatsapp_jid: zapLimpo ? `55${zapLimpo}@s.whatsapp.net` : undefined,
        email: `contato@${nomeFantasia.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
        cnae_principal_codigo: seg.cnaeCodigo,
        cnae_principal_descricao: seg.cnaeDescricao,
        segmento: seg.segmento,
        socios: [
          {
            nome: socioCompleto,
            qualificacao: regimeClassificado === 'MEI' ? 'Titular MEI' : '49-Sócio-Administrador'
          }
        ],
        socio_principal: socioCompleto,
        status_contato: 'Novo',
        mensagens_enviadas_count: 0,
        honorario_regularizacao_estimado: honorarioReg,
        honorario_mensal_sugerido: honorarioMensal
      };

      novasEmpresas.push(novaEmpresa);
    }

    return NextResponse.json({
      success: true,
      mensagem: `Varredura pública concluída com sucesso em ${cidadeAlvo}/${ufAlvo}!`,
      parametros: {
        uf: ufAlvo,
        municipio: cidadeAlvo,
        regime,
        possuiDebitos,
        possuiWhatsapp,
        quantidade: novasEmpresas.length
      },
      totalCapturadas: novasEmpresas.length,
      empresas: novasEmpresas
    });
  } catch (error: any) {
    console.error('[Radar Fiscal Captura Pública] Erro:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha ao minerar bases públicas da Receita e PGFN' },
      { status: 500 }
    );
  }
}
