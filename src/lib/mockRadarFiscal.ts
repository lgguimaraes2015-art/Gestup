import { EmpresaRadarFiscal, ModeloMensagemCaptação } from '@/types';

/**
 * Regra de Classificação do Usuário:
 * - Se for simples nacional mas não for MEI => apenas "Simples"
 * - Se for simples nacional mas for MEI => apenas "MEI"
 * - Se não for simples => "Regime Normal"
 */
export function classificarRegimeEmpresa(empresa: {
  optante_simples?: boolean;
  optante_mei?: boolean;
}): 'Simples' | 'MEI' | 'Regime Normal' {
  if (empresa.optante_simples && !empresa.optante_mei) {
    return 'Simples';
  }
  if (empresa.optante_mei) {
    return 'MEI';
  }
  return 'Regime Normal';
}

/**
 * Converte strings de agendamento ("2026-10-28 às 07:00" ou "28/10/2026 às 07:00") em objeto Date
 */
export function parseDataHoraAgendada(str?: string): Date | null {
  if (!str) return null;
  try {
    const cleaned = str.replace(' às ', ' ').replace(' as ', ' ').trim();
    if (cleaned.includes('/')) {
      const [dPart, tPart] = cleaned.split(' ');
      const [dia, mes, ano] = dPart.split('/').map(Number);
      const [hora, min] = (tPart || '00:00').split(':').map(Number);
      const dt = new Date(ano, mes - 1, dia, hora || 0, min || 0);
      return isNaN(dt.getTime()) ? null : dt;
    } else if (cleaned.includes('-')) {
      const [dPart, tPart] = cleaned.split(' ');
      const [ano, mes, dia] = dPart.split('-').map(Number);
      const [hora, min] = (tPart || '00:00').split(':').map(Number);
      const dt = new Date(ano, mes - 1, dia, hora || 0, min || 0);
      return isNaN(dt.getTime()) ? null : dt;
    }
  } catch {}
  return null;
}

export const initialModelosCaptação: ModeloMensagemCaptação[] = [
  {
    id: 'mod-ade-urgente',
    titulo: '🚨 Alerta Urgente ADE: Risco de Exclusão do Simples Nacional',
    descricao: 'Abordagem de alto impacto focada no prazo fatal do ADE da Receita Federal para evitar exclusão para o Lucro Presumido.',
    tipo_alvo: 'ADE_SIMPLES',
    texto: `🚨 *URGENTE: Notificação ADE Receita Federal / Simples Nacional*

Olá, *{socio}*! Tudo bem?

Aqui é da equipe de Gestão Tributária da *fin.up Consultoria*. Constatamos no sistema de monitoramento fiscal que a sua empresa *{empresa}* (CNPJ: {cnpj}) está com notificação de *Ato Declaratório Executivo (ADE)* da Receita Federal com prazo aproximado de *{prazo_dias} dias* para regularização antes do desenquadramento automático do Simples Nacional.

⚠️ *Atenção:* Se a exclusão ocorrer, a empresa será compulsoriamente transferida para o regime de Lucro Presumido a partir de 1º de janeiro, o que pode mais que triplicar os impostos sobre o faturamento.

A boa notícia é que podemos fazer um *Diagnóstico Fiscal Imediato* e aplicar um acordo de transação tributária junto à PGFN com até 70% de desconto em encargos e juros, mantendo sua empresa 100% regular no Simples.

Podemos agendar uma breve conversa ou simular o parcelamento para você agora mesmo?`
  },
  {
    id: 'mod-pgfn-transacao',
    titulo: '⚖️ Transação Tributária PGFN (Desconto de até 70% e 145x)',
    descricao: 'Focado em empresas com Dívida Ativa da União na PGFN elegíveis aos editais do Regularize.',
    tipo_alvo: 'DIVIDA_PGFN',
    texto: `⚖️ *Oportunidade PGFN: Redução de até 70% em Débitos Inscritos*

Olá, *{socio}*! Como vai?

A *fin.up Consultoria Tributária* identificou que a *{empresa}* possui débitos inscritos em Dívida Ativa da União junto à PGFN no valor consolidado de aproximadamente *R$ {valor_debito}* ({tipo_divida}).

Atualmente, o Ministério da Fazenda mantém aberto o edital de *Transação Tributária por Adesão*, que garante aos contribuintes:
✅ Redução de até 70% no valor de juros, multas e encargos legais;
✅ Parcelamento do saldo devedor em até 145 parcelas mensais;
✅ Emissão imediata da *Certidão Positiva com Efeitos de Negativa (CPEN)*, destravando financiamentos bancários e emissão de notas.

Nós elaboramos a simulação exata do desconto para sua empresa sem custo inicial. Podemos apresentar os cenários de economia para você hoje?`
  },
  {
    id: 'mod-mei-das',
    titulo: '🟢 Regularização de MEI: Evite o Desenquadramento e Dívida no CPF',
    descricao: 'Para microempreendedores individuais com débitos de DAS acumulados ou risco de baixa.',
    tipo_alvo: 'MEI_DAS',
    texto: `🟢 *Regularização de Débitos e Blindagem do seu MEI - fin.up*

Olá, *{socio}*! Tudo bem?

Identificamos que o seu MEI *{empresa}* (CNPJ: {cnpj}) em *{cidade}* possui pendências fiscais de guias DAS em aberto na Receita Federal.

Com as novas regras da Receita Federal e da Procuradoria da Fazenda, os débitos não regularizados são transferidos diretamente para o CPF do titular na Dívida Ativa da União, gerando protesto em cartório e bloqueio de benefícios do INSS.

Nós da *fin.up* fazemos o parcelamento especial com parcelas reduzidas e regularizamos sua situação de forma 100% digital e segura.

Gostaria de regularizar o seu CNPJ hoje mesmo? Posso te passar os valores aqui no WhatsApp!`
  },
  {
    id: 'mod-preventivo-blindagem',
    titulo: '💼 Diagnóstico Preventivo & Recuperação de Tributos',
    descricao: 'Abordagem institucional para empresas regulares ou com pequenas pendências para captação de contabilidade contínua.',
    tipo_alvo: 'PREVENTIVO',
    texto: `💼 *Diagnóstico Tributário & Recuperação de Impostos - fin.up*

Olá, *{socio}*! Sou especialista da *fin.up Consultoria & Gestão Contábil*.

Atendemos empresas de destaque do segmento de *{segmento}* na região de *{cidade}* e realizamos uma auditoria preventiva para identificar:
1. Risco de notificações e exclusões do Simples Nacional;
2. Oportunidades de recuperação de impostos pagos a maior nos últimos 5 anos (PIS/COFINS monofásico e ICMS-ST);
3. Redução legal da folha de pagamento e encargos.

Gostaria de receber um relatório de diagnóstico da *{empresa}* sem qualquer custo? Fico à disposição para enviar um resumo aqui mesmo!`
  }
];

const baseEmpresas: EmpresaRadarFiscal[] = [
  {
    id: 'rad-01',
    cnpj: '48.912.345/0001-82',
    razao_social: 'BELLAVITA DISTRIBUIDORA DE ALIMENTOS LTDA',
    nome_fantasia: 'BELLA VITA GOURMET',
    situacao_cadastral: 'Ativa',
    data_abertura: '2019-04-12',
    regime: 'Simples Nacional',
    optante_simples: true,
    optante_mei: false,
    tem_ade_ativo: true,
    data_ade: '2026-09-15',
    prazo_regularizacao_dias: 22,
    motivo_ade: 'Débitos tributários de DAS-Simples e Dívida Ativa da União sem parcelamento ativo.',
    tem_divida_pgfn: true,
    valor_divida_pgfn: 64850.00,
    tipo_divida_pgfn: 'Tributária',
    inscricoes_pgfn_count: 3,
    tem_divida_estadual: true,
    valor_divida_estadual: 12400.00,
    uf: 'SP',
    municipio: 'Campinas',
    bairro: 'Cambuí',
    logradouro: 'Rua Coronel Quirino',
    numero: '1240',
    cep: '13025-002',
    telefone: '(19) 3254-8890',
    whatsapp: '19981245566',
    email: 'financeiro@bellavitagourmet.com.br',
    cnae_principal_codigo: '46.39-7-01',
    cnae_principal_descricao: 'Comércio atacadista de produtos alimentícios em geral',
    segmento: 'Alimentação & Distribuição',
    socios: [
      { nome: 'Ricardo Silveira Fontes', qualificacao: '49-Sócio-Administrador' },
      { nome: 'Camila Mendonça Fontes', qualificacao: '22-Sócio' }
    ],
    socio_principal: 'Ricardo Silveira Fontes',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 4500.00,
    honorario_mensal_sugerido: 1800.00
  },
  {
    id: 'rad-02',
    cnpj: '36.781.992/0001-40',
    razao_social: 'AUTO MECANICA E AUTO ELETRICA HORTOLANDIA LTDA',
    nome_fantasia: 'CENTRO AUTOMOTIVO HORTOCAR',
    situacao_cadastral: 'Ativa',
    data_abertura: '2017-08-20',
    regime: 'Simples Nacional',
    optante_simples: true,
    optante_mei: false,
    tem_ade_ativo: true,
    data_ade: '2026-09-28',
    prazo_regularizacao_dias: 35,
    motivo_ade: 'Notificação ADE 2026: Débito de INSS Patronal e DAS não parcelado na PGFN.',
    tem_divida_pgfn: true,
    valor_divida_pgfn: 48320.00,
    tipo_divida_pgfn: 'Mista',
    inscricoes_pgfn_count: 4,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Hortolândia',
    bairro: 'Jardim Rosolém',
    logradouro: 'Rua Benedito Leite',
    numero: '450',
    cep: '13185-200',
    telefone: '(19) 3897-1234',
    whatsapp: '19992348877',
    email: 'hortocar.mecanica@gmail.com',
    cnae_principal_codigo: '45.20-0-01',
    cnae_principal_descricao: 'Serviços de manutenção e reparação mecânica de veículos automotores',
    segmento: 'Oficina & Automotivo',
    socios: [
      { nome: 'Marcos Vinicius de Souza', qualificacao: '49-Sócio-Administrador' }
    ],
    socio_principal: 'Marcos Vinicius de Souza',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 3200.00,
    honorario_mensal_sugerido: 1200.00
  },
  {
    id: 'rad-03',
    cnpj: '51.340.812/0001-19',
    razao_social: 'SUPERMERCADO E PADARIA VILA REAL SUMARE LTDA',
    nome_fantasia: 'PADARIA & EMPORIO VILA REAL',
    situacao_cadastral: 'Ativa',
    data_abertura: '2020-02-10',
    regime: 'Simples Nacional',
    optante_simples: true,
    optante_mei: false,
    tem_ade_ativo: true,
    data_ade: '2026-09-10',
    prazo_regularizacao_dias: 17,
    motivo_ade: 'Notificação ADE de Exclusão do Simples Nacional por débitos previdenciários e fazendários.',
    tem_divida_pgfn: true,
    valor_divida_pgfn: 112450.00,
    tipo_divida_pgfn: 'Mista',
    inscricoes_pgfn_count: 6,
    tem_divida_estadual: true,
    valor_divida_estadual: 28900.00,
    uf: 'SP',
    municipio: 'Sumaré',
    bairro: 'Nova Veneza',
    logradouro: 'Av. Brasil',
    numero: '890',
    cep: '13170-000',
    telefone: '(19) 3873-4500',
    whatsapp: '19988776655',
    email: 'contato@vilarealsumare.com.br',
    cnae_principal_codigo: '47.11-3-02',
    cnae_principal_descricao: 'Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios',
    segmento: 'Comércio Varejista & Alimentos',
    socios: [
      { nome: 'Fernando Henrique Castilho', qualificacao: '49-Sócio-Administrador' },
      { nome: 'Luciana Aparecida Castilho', qualificacao: '22-Sócio' }
    ],
    socio_principal: 'Fernando Henrique Castilho',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 7500.00,
    honorario_mensal_sugerido: 2500.00
  },
  {
    id: 'rad-04',
    cnpj: '42.119.554/0001-08',
    razao_social: 'LUCAS GABRIEL PINTO CONSTRUCOES MEI',
    nome_fantasia: 'LP ENGENHARIA E REFORMAS',
    situacao_cadastral: 'Ativa',
    data_abertura: '2021-06-15',
    regime: 'MEI',
    optante_simples: true,
    optante_mei: true,
    tem_ade_ativo: true,
    data_ade: '2026-10-01',
    prazo_regularizacao_dias: 38,
    motivo_ade: 'ADE Receita Federal: Guias DAS-MEI em aberto inscritas na Dívida Ativa da União.',
    tem_divida_pgfn: true,
    valor_divida_pgfn: 9840.00,
    tipo_divida_pgfn: 'Tributária',
    inscricoes_pgfn_count: 2,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Paulínia',
    bairro: 'Jardim Planalto',
    logradouro: 'Rua das Camélias',
    numero: '310',
    cep: '13140-100',
    telefone: '(19) 99122-3344',
    whatsapp: '19991223344',
    email: 'lucas.reformas.mei@outlook.com',
    cnae_principal_codigo: '43.99-1-03',
    cnae_principal_descricao: 'Obras de alvenaria e acabamentos da construção',
    segmento: 'Construção Civil & Reformas',
    socios: [
      { nome: 'Lucas Gabriel Pinto', qualificacao: 'Titular MEI' }
    ],
    socio_principal: 'Lucas Gabriel Pinto',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 1200.00,
    honorario_mensal_sugerido: 450.00
  },
  {
    id: 'rad-05',
    cnpj: '38.452.109/0001-77',
    razao_social: 'RESTAURANTE E PIZZARIA FORNO NOBRE DE AMERICANA LTDA',
    nome_fantasia: 'FORNO NOBRE PIZZAS',
    situacao_cadastral: 'Ativa',
    data_abertura: '2018-11-05',
    regime: 'Simples Nacional',
    optante_simples: true,
    optante_mei: false,
    tem_ade_ativo: true,
    data_ade: '2026-09-20',
    prazo_regularizacao_dias: 27,
    motivo_ade: 'Risco iminente de desenquadramento Simples Nacional por débitos na PGFN.',
    tem_divida_pgfn: true,
    valor_divida_pgfn: 53200.00,
    tipo_divida_pgfn: 'Tributária',
    inscricoes_pgfn_count: 3,
    tem_divida_estadual: true,
    valor_divida_estadual: 8700.00,
    uf: 'SP',
    municipio: 'Americana',
    bairro: 'Vila Frezzarin',
    logradouro: 'Rua Fortunato Faraone',
    numero: '760',
    cep: '13465-660',
    telefone: '(19) 3406-9900',
    whatsapp: '',
    whatsapp_valido: false,
    email: 'adm@fornonobrepizza.com.br',
    cnae_principal_codigo: '56.11-2-01',
    cnae_principal_descricao: 'Restaurantes e similares',
    segmento: 'Restaurantes & Gastronomia',
    socios: [
      { nome: 'Eduardo Zanetti Barbosa', qualificacao: '49-Sócio-Administrador' }
    ],
    socio_principal: 'Eduardo Zanetti Barbosa',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 3800.00,
    honorario_mensal_sugerido: 1500.00
  },
  {
    id: 'rad-06',
    cnpj: '31.980.123/0001-55',
    razao_social: 'TRANSVALE LOGISTICA E TRANSPORTES RODOVIARIOS LTDA',
    nome_fantasia: 'TRANSVALE EXPRESS',
    situacao_cadastral: 'Ativa',
    data_abertura: '2016-03-22',
    regime: 'Simples Nacional',
    optante_simples: true,
    optante_mei: false,
    tem_ade_ativo: false,
    tem_divida_pgfn: true,
    valor_divida_pgfn: 178900.00,
    tipo_divida_pgfn: 'Previdenciária',
    inscricoes_pgfn_count: 8,
    tem_divida_estadual: true,
    valor_divida_estadual: 45000.00,
    uf: 'SP',
    municipio: 'Campinas',
    bairro: 'Jardim do Trevo',
    logradouro: 'Av. Prestes Maia',
    numero: '1850',
    cep: '13040-000',
    telefone: '(19) 3772-8000',
    whatsapp: '19982334455',
    email: 'diretoria@transvaleexpress.com.br',
    cnae_principal_codigo: '49.30-2-02',
    cnae_principal_descricao: 'Transporte rodoviário de carga, exceto produtos perigosos e mudança, intermunicipal',
    segmento: 'Transportes & Logística',
    socios: [
      { nome: 'Wagner Antunes de Oliveira', qualificacao: '49-Sócio-Administrador' },
      { nome: 'Sergio Antunes de Oliveira', qualificacao: '22-Sócio' }
    ],
    socio_principal: 'Wagner Antunes de Oliveira',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 9800.00,
    honorario_mensal_sugerido: 3200.00
  },
  {
    id: 'rad-07',
    cnpj: '45.670.321/0001-90',
    razao_social: 'CLINICA MEDICA E DIAGNOSTICOS INTEGRADOS S/S',
    nome_fantasia: 'MED INTEGRADA CAMPINAS',
    situacao_cadastral: 'Ativa',
    data_abertura: '2021-01-18',
    regime: 'Lucro Presumido',
    optante_simples: false,
    optante_mei: false,
    tem_ade_ativo: false,
    tem_divida_pgfn: true,
    valor_divida_pgfn: 88400.00,
    tipo_divida_pgfn: 'Tributária',
    inscricoes_pgfn_count: 4,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Campinas',
    bairro: 'Nova Campinas',
    logradouro: 'Av. Dr. Jesuíno Marcondes Machado',
    numero: '950',
    cep: '13092-108',
    telefone: '(19) 3295-4400',
    whatsapp: '19997881100',
    email: 'gestao@medintegradacampinas.med.br',
    cnae_principal_codigo: '86.30-5-03',
    cnae_principal_descricao: 'Atividade médica ambulatorial restrita a consultas',
    segmento: 'Saúde & Clínicas Médicas',
    socios: [
      { nome: 'Dra. Patricia Alvarenga Leite', qualificacao: '49-Sócio-Administrador' },
      { nome: 'Dr. Leonardo Meirelles Prado', qualificacao: '22-Sócio' }
    ],
    socio_principal: 'Dra. Patricia Alvarenga Leite',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 6000.00,
    honorario_mensal_sugerido: 2200.00
  },
  {
    id: 'rad-08',
    cnpj: '53.882.119/0001-02',
    razao_social: 'JULIANA MARTINS DESIGN E INTERIORES MEI',
    nome_fantasia: 'STUDIO JM DESIGN',
    situacao_cadastral: 'Ativa',
    data_abertura: '2022-09-01',
    regime: 'MEI',
    optante_simples: true,
    optante_mei: true,
    tem_ade_ativo: true,
    data_ade: '2026-10-05',
    prazo_regularizacao_dias: 42,
    motivo_ade: 'Débitos de DAS-SIMEI pendentes de regularização com risco de inscrição em dívida ativa.',
    tem_divida_pgfn: true,
    valor_divida_pgfn: 6200.00,
    tipo_divida_pgfn: 'Tributária',
    inscricoes_pgfn_count: 1,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Indaiatuba',
    bairro: 'Jardim Esplanada',
    logradouro: 'Rua dos Indaiás',
    numero: '512',
    cep: '13330-000',
    telefone: '(19) 99876-5432',
    whatsapp: '19998765432',
    email: 'juliana.design.decor@gmail.com',
    cnae_principal_codigo: '74.10-2-02',
    cnae_principal_descricao: 'Design de interiores',
    segmento: 'Arquitetura & Design',
    socios: [
      { nome: 'Juliana Martins da Costa', qualificacao: 'Titular MEI' }
    ],
    socio_principal: 'Juliana Martins da Costa',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 900.00,
    honorario_mensal_sugerido: 450.00
  },
  {
    id: 'rad-09',
    cnpj: '33.551.442/0001-38',
    razao_social: 'TECHSOLUTIONS CONSULTORIA EM SOFTWARE E TI LTDA',
    nome_fantasia: 'TECHSOLUTIONS BRASIL',
    situacao_cadastral: 'Ativa',
    data_abertura: '2019-07-11',
    regime: 'Simples Nacional',
    optante_simples: true,
    optante_mei: false,
    tem_ade_ativo: true,
    data_ade: '2026-09-18',
    prazo_regularizacao_dias: 25,
    motivo_ade: 'Notificação ADE: Risco de exclusão por divergência em declarações de DAS e débitos PGFN.',
    tem_divida_pgfn: true,
    valor_divida_pgfn: 41200.00,
    tipo_divida_pgfn: 'Tributária',
    inscricoes_pgfn_count: 3,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Campinas',
    bairro: 'Barão Geraldo (Polo de Tecnologia)',
    logradouro: 'Rua Bertrand Russell',
    numero: '120',
    cep: '13083-865',
    telefone: '(19) 3289-7000',
    whatsapp: '19993322110',
    email: 'contato@techsolutionsbrasil.com.br',
    cnae_principal_codigo: '62.01-5-01',
    cnae_principal_descricao: 'Desenvolvimento de programas de computador sob encomenda',
    segmento: 'Tecnologia & Software',
    socios: [
      { nome: 'Guilherme Augusto Nogueira', qualificacao: '49-Sócio-Administrador' },
      { nome: 'Bruno Rafael Cordeiro', qualificacao: '22-Sócio' }
    ],
    socio_principal: 'Guilherme Augusto Nogueira',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 3500.00,
    honorario_mensal_sugerido: 1600.00
  },
  {
    id: 'rad-10',
    cnpj: '28.114.770/0001-64',
    razao_social: 'SERRARIA E COMERCIO DE MADEIRAS SAO ROQUE LTDA',
    nome_fantasia: 'MADEREIRA SAO ROQUE',
    situacao_cadastral: 'Ativa',
    data_abertura: '2015-05-30',
    regime: 'Simples Nacional',
    optante_simples: true,
    optante_mei: false,
    tem_ade_ativo: false,
    tem_divida_pgfn: true,
    valor_divida_pgfn: 94600.00,
    tipo_divida_pgfn: 'FGTS',
    inscricoes_pgfn_count: 5,
    tem_divida_estadual: true,
    valor_divida_estadual: 18200.00,
    uf: 'SP',
    municipio: 'Sumaré',
    bairro: 'Jardim Picerno',
    logradouro: 'Estrada Municipal Teodor Condiev',
    numero: '1400',
    cep: '13175-000',
    telefone: '(19) 3873-1990',
    whatsapp: '19981447788',
    email: 'vendas@madeireirasaoroque.com.br',
    cnae_principal_codigo: '47.44-0-02',
    cnae_principal_descricao: 'Comércio varejista de madeira e artefatos',
    segmento: 'Construção & Madeiras',
    socios: [
      { nome: 'Antonio Carlos Meneghetti', qualificacao: '49-Sócio-Administrador' }
    ],
    socio_principal: 'Antonio Carlos Meneghetti',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 5500.00,
    honorario_mensal_sugerido: 1800.00
  },
  {
    id: 'rad-11',
    cnpj: '44.810.923/0001-12',
    razao_social: 'VANGUARDA CONSULTORIA EMPRESARIAL LTDA',
    nome_fantasia: 'VANGUARDA GESTAO',
    situacao_cadastral: 'Ativa',
    data_abertura: '2021-03-15',
    regime: 'Simples',
    optante_simples: true,
    optante_mei: false,
    tem_ade_ativo: false,
    tem_divida_pgfn: false,
    valor_divida_pgfn: 0,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Campinas',
    bairro: 'Cambuí',
    logradouro: 'Rua Maria Monteiro',
    numero: '820',
    cep: '13025-151',
    telefone: '(19) 3251-4040',
    whatsapp: '',
    whatsapp_valido: false,
    email: 'contato@vanguardagestao.com.br',
    cnae_principal_codigo: '70.20-4-00',
    cnae_principal_descricao: 'Atividades de consultoria em gestão empresarial',
    segmento: 'Consultoria & Serviços',
    socios: [
      { nome: 'Marcelo Queiroz Faria', qualificacao: '49-Sócio-Administrador' }
    ],
    socio_principal: 'Marcelo Queiroz Faria',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 0,
    honorario_mensal_sugerido: 2200.00
  },
  {
    id: 'rad-12',
    cnpj: '52.190.432/0001-99',
    razao_social: 'MARIANA SILVA FOTOGRAFIA & EVENTOS MEI',
    nome_fantasia: 'MARI SILVA FOTOS',
    situacao_cadastral: 'Ativa',
    data_abertura: '2023-01-10',
    regime: 'MEI',
    optante_simples: true,
    optante_mei: true,
    tem_ade_ativo: false,
    tem_divida_pgfn: false,
    valor_divida_pgfn: 0,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Campinas',
    bairro: 'Taquaral',
    logradouro: 'Av. Heitor Penteado',
    numero: '1540',
    cep: '13087-000',
    telefone: '(19) 99188-7722',
    whatsapp: '19991887722',
    email: 'mariana.fotos.eventos@gmail.com',
    cnae_principal_codigo: '74.20-0-01',
    cnae_principal_descricao: 'Atividades de produção de fotografias',
    segmento: 'Eventos & Fotografia',
    socios: [
      { nome: 'Mariana Silva', qualificacao: 'Titular MEI' }
    ],
    socio_principal: 'Mariana Silva',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 0,
    honorario_mensal_sugerido: 400.00
  },
  {
    id: 'rad-13',
    cnpj: '21.450.880/0001-34',
    razao_social: 'GRUPO PAULISTA DE LOGISTICA E CARGAS S.A.',
    nome_fantasia: 'LOG PAULISTA',
    situacao_cadastral: 'Ativa',
    data_abertura: '2014-08-01',
    regime: 'Regime Normal',
    optante_simples: false,
    optante_mei: false,
    tem_ade_ativo: false,
    tem_divida_pgfn: false,
    valor_divida_pgfn: 0,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Campinas',
    bairro: 'Distrito Industrial',
    logradouro: 'Rua Comendador Aladino Selmi',
    numero: '4500',
    cep: '13069-090',
    telefone: '(19) 3746-9000',
    whatsapp: '19984556677',
    email: 'financeiro@logpaulista.com.br',
    cnae_principal_codigo: '52.11-7-99',
    cnae_principal_descricao: 'Depósitos de mercadorias para terceiros',
    segmento: 'Logística & Armazéns',
    socios: [
      { nome: 'Otávio Mesquita Guimarães', qualificacao: 'Diretor Presidente' }
    ],
    socio_principal: 'Otávio Mesquita Guimarães',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 0,
    honorario_mensal_sugerido: 5500.00
  },
  {
    id: 'rad-14',
    cnpj: '39.876.543/0001-21',
    razao_social: 'SOLUCOES HIDRAULICAS HORTOLANDIA LTDA',
    nome_fantasia: 'HIDRAULICA HORTOLANDIA',
    situacao_cadastral: 'Ativa',
    data_abertura: '2020-05-19',
    regime: 'Simples',
    optante_simples: true,
    optante_mei: false,
    tem_ade_ativo: false,
    tem_divida_pgfn: false,
    valor_divida_pgfn: 0,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Hortolândia',
    bairro: 'Jardim Amanda II',
    logradouro: 'Av. Santana',
    numero: '1100',
    cep: '13188-000',
    telefone: '(19) 3845-6677',
    whatsapp: '19993445588',
    email: 'vendas@hidraulicahorto.com.br',
    cnae_principal_codigo: '43.22-3-01',
    cnae_principal_descricao: 'Instalações hidráulicas, sanitárias e de gás',
    segmento: 'Construção & Instalações',
    socios: [
      { nome: 'Claudio Roberto Ramos', qualificacao: '49-Sócio-Administrador' }
    ],
    socio_principal: 'Claudio Roberto Ramos',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 0,
    honorario_mensal_sugerido: 1400.00
  },
  {
    id: 'rad-15',
    cnpj: '49.123.456/0001-78',
    razao_social: 'CARLOS EDUARDO PROGRAMACAO E SISTEMAS MEI',
    nome_fantasia: 'CEDU TECH',
    situacao_cadastral: 'Ativa',
    data_abertura: '2022-11-04',
    regime: 'MEI',
    optante_simples: true,
    optante_mei: true,
    tem_ade_ativo: false,
    tem_divida_pgfn: false,
    valor_divida_pgfn: 0,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Sumaré',
    bairro: 'Centro',
    logradouro: 'Rua Sete de Setembro',
    numero: '420',
    cep: '13170-015',
    telefone: '(19) 99766-5544',
    whatsapp: '19997665544',
    email: 'carloseduardo.tech@gmail.com',
    cnae_principal_codigo: '62.09-1-00',
    cnae_principal_descricao: 'Suporte técnico, manutenção e outros serviços em TI',
    segmento: 'Tecnologia & Suporte',
    socios: [
      { nome: 'Carlos Eduardo Nogueira', qualificacao: 'Titular MEI' }
    ],
    socio_principal: 'Carlos Eduardo Nogueira',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 0,
    honorario_mensal_sugerido: 450.00
  },
  {
    id: 'rad-16',
    cnpj: '18.990.112/0001-50',
    razao_social: 'LABORATORIO CLINICO BIOANALISE PAULINIA LTDA',
    nome_fantasia: 'BIOANALISE PAULINIA',
    situacao_cadastral: 'Ativa',
    data_abertura: '2016-09-12',
    regime: 'Regime Normal',
    optante_simples: false,
    optante_mei: false,
    tem_ade_ativo: false,
    tem_divida_pgfn: true,
    valor_divida_pgfn: 135000.00,
    tipo_divida_pgfn: 'Tributária',
    inscricoes_pgfn_count: 5,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Paulínia',
    bairro: 'Santa Cecília',
    logradouro: 'Av. José Paulino',
    numero: '2100',
    cep: '13140-000',
    telefone: '(19) 3874-2200',
    whatsapp: '19998114433',
    email: 'diretoria@bioanalisepaulinia.com.br',
    cnae_principal_codigo: '86.40-2-02',
    cnae_principal_descricao: 'Laboratórios clínicos',
    segmento: 'Saúde & Diagnósticos',
    socios: [
      { nome: 'Dra. Beatriz Helena Silveira', qualificacao: '49-Sócio-Administrador' }
    ],
    socio_principal: 'Dra. Beatriz Helena Silveira',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 8000.00,
    honorario_mensal_sugerido: 3500.00
  },
  {
    id: 'rad-17',
    cnpj: '27.654.321/0001-09',
    razao_social: 'DISTRIBUIDORA DE MEDICAMENTOS INDAIATUBA LTDA',
    nome_fantasia: 'DROGAFARMA INDAIATUBA',
    situacao_cadastral: 'Ativa',
    data_abertura: '2017-04-18',
    regime: 'Regime Normal',
    optante_simples: false,
    optante_mei: false,
    tem_ade_ativo: false,
    tem_divida_pgfn: false,
    valor_divida_pgfn: 0,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Indaiatuba',
    bairro: 'Parque Ecológico',
    logradouro: 'Av. Engenheiro Fábio Roberto Barnabé',
    numero: '3300',
    cep: '13331-000',
    telefone: '(19) 3834-5500',
    whatsapp: '19996554411',
    email: 'adm@drogafarmaindaia.com.br',
    cnae_principal_codigo: '46.44-3-01',
    cnae_principal_descricao: 'Comércio atacadista de medicamentos e drogas de uso humano',
    segmento: 'Farmacêutico & Distribuição',
    socios: [
      { nome: 'Paulo Henrique Duarte', qualificacao: '49-Sócio-Administrador' }
    ],
    socio_principal: 'Paulo Henrique Duarte',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 0,
    honorario_mensal_sugerido: 4200.00
  },
  {
    id: 'rad-18',
    cnpj: '41.332.211/0001-85',
    razao_social: 'EMPORIO E CAFE DA PRACA AMERICANA LTDA',
    nome_fantasia: 'CAFE DA PRACA AMERICANA',
    situacao_cadastral: 'Ativa',
    data_abertura: '2021-08-30',
    regime: 'Simples',
    optante_simples: true,
    optante_mei: false,
    tem_ade_ativo: false,
    tem_divida_pgfn: false,
    valor_divida_pgfn: 0,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Americana',
    bairro: 'Centro',
    logradouro: 'Rua Fernando de Camargo',
    numero: '310',
    cep: '13465-020',
    telefone: '(19) 3461-8822',
    whatsapp: '19998223311',
    email: 'contato@cafedapracaamericana.com.br',
    cnae_principal_codigo: '56.11-2-03',
    cnae_principal_descricao: 'Lanchonetes, casas de chá, de sucos e similares',
    segmento: 'Gastronomia & Café',
    socios: [
      { nome: 'Ana Paula Vasconcelos', qualificacao: '49-Sócio-Administrador' }
    ],
    socio_principal: 'Ana Paula Vasconcelos',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 0,
    honorario_mensal_sugerido: 1300.00
  },
  {
    id: 'rad-19',
    cnpj: '50.987.654/0001-10',
    razao_social: 'RODRIGO PEREIRA INSTALACOES ELETRICAS MEI',
    nome_fantasia: 'RP ELETRICA & ENERGIA',
    situacao_cadastral: 'Ativa',
    data_abertura: '2023-04-12',
    regime: 'MEI',
    optante_simples: true,
    optante_mei: true,
    tem_ade_ativo: false,
    tem_divida_pgfn: false,
    valor_divida_pgfn: 0,
    tem_divida_estadual: false,
    valor_divida_estadual: 0,
    uf: 'SP',
    municipio: 'Americana',
    bairro: 'Jardim Ipiranga',
    logradouro: 'Rua Igarapava',
    numero: '180',
    cep: '13468-520',
    telefone: '(19) 99933-2211',
    whatsapp: '19999332211',
    email: 'rodrigo.eletrica.mei@gmail.com',
    cnae_principal_codigo: '43.21-5-00',
    cnae_principal_descricao: 'Instalação e manutenção elétrica',
    segmento: 'Serviços Elétricos',
    socios: [
      { nome: 'Rodrigo Pereira', qualificacao: 'Titular MEI' }
    ],
    socio_principal: 'Rodrigo Pereira',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 0,
    honorario_mensal_sugerido: 450.00
  },
  {
    id: 'rad-20',
    cnpj: '15.789.012/0001-44',
    razao_social: 'CONSTRUTORA E INCORPORADORA METROPOLITANA LTDA',
    nome_fantasia: 'METROPOLITANA ENGENHARIA',
    situacao_cadastral: 'Ativa',
    data_abertura: '2012-10-05',
    regime: 'Regime Normal',
    optante_simples: false,
    optante_mei: false,
    tem_ade_ativo: false,
    tem_divida_pgfn: true,
    valor_divida_pgfn: 320000.00,
    tipo_divida_pgfn: 'Tributária',
    inscricoes_pgfn_count: 9,
    tem_divida_estadual: true,
    valor_divida_estadual: 75000.00,
    uf: 'SP',
    municipio: 'São Paulo',
    bairro: 'Itaim Bibi',
    logradouro: 'Av. Brigadeiro Faria Lima',
    numero: '3144',
    cep: '01451-000',
    telefone: '(11) 3040-5000',
    whatsapp: '11998770011',
    email: 'financeiro@metropolitanaeng.com.br',
    cnae_principal_codigo: '41.20-4-00',
    cnae_principal_descricao: 'Construção de edifícios',
    segmento: 'Construção Civil & Engenharia',
    socios: [
      { nome: 'Renato Siqueira Caldeira', qualificacao: '49-Sócio-Administrador' },
      { nome: 'Mauricio Siqueira Caldeira', qualificacao: '22-Sócio' }
    ],
    socio_principal: 'Renato Siqueira Caldeira',
    status_contato: 'Novo',
    mensagens_enviadas_count: 0,
    honorario_regularizacao_estimado: 18000.00,
    honorario_mensal_sugerido: 6500.00
  }
];

export const initialEmpresasRadar: EmpresaRadarFiscal[] = baseEmpresas.map(emp => {
  const zapLimpo = (emp.whatsapp || '').replace(/\D/g, '');
  const hasCelularZap = zapLimpo.length >= 10 && (zapLimpo.length === 11 ? zapLimpo[2] === '9' : true);
  const valido = emp.whatsapp_valido !== undefined ? emp.whatsapp_valido : (zapLimpo.length > 0 && hasCelularZap);
  return {
    ...emp,
    regime: classificarRegimeEmpresa(emp),
    whatsapp_valido: valido,
    whatsapp_verificado_em: valido ? '28/10/2026 12:00' : undefined,
    whatsapp_jid: valido && zapLimpo ? `55${zapLimpo}@s.whatsapp.net` : undefined
  };
});
