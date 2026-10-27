import { EmpresaRadarFiscal, ModeloMensagemCaptação } from '@/types';

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

export const initialEmpresasRadar: EmpresaRadarFiscal[] = [
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
    whatsapp: '19996541122',
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
  }
];
