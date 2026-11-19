'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Cliente,
  Colaborador,
  Tarefa,
  StatusTarefa,
  Declaracao,
  CRMLead,
  CRMLeadEstagio,
  MensagemAgendadaWhatsApp,
  CRMProcedimento,
  CRMProcedimentoTemplate,
  WhatsAppConfig,
  WhatsAppMensagem,
  ContatoNotificacao,
  DeclaracaoVinculadaCliente,
  HistoricoClienteItem,
  ContaPagar,
  ContaReceber,
  ReceitaNaoRecorrente,
  CustoVinculadoReceita,
  TransacaoOFX,
  HonorarioItem,
  EtapaProcessoTarefa,
  ArquivoEtapa,
  ConfiguracaoCobrancaEtapa,
  ContaBancaria,
  HistoricoAjusteSaldo,
  ModeloMensagemTarefa,
  EmpresaRadarFiscal,
  ModeloMensagemCaptação,
  DocumentoPortalCliente,
  SolicitacaoPortalCliente,
  RetornoClienteSubtarefa,
  CredenciaisPortalCliente,
  TipoDocumentoLegal,
  DocumentoLegalCliente,
  TarefaEmpresaConfig,
  SubprocessoAtualizacao,
  ComentarioItem,
  UserRole,
  DPEmpresaConfig,
  DPFuncionario,
  DPControleVencimento,
  DPDiarioBordo,
  DPAnexoOcorrencia
} from '@/types';
import {
  initialClientes,
  initialColaboradores,
  initialTarefas,
  initialDeclaracoes,
  initialLeads,
  initialProcedimentoTemplates,
  initialWhatsAppConfig,
  initialWhatsAppMensagens,
  initialContasPagar,
  initialContasReceber,
  initialHonorarios,
  initialContasBancarias,
  initialModelosMensagens,
  initialDocumentosPortal,
  initialSolicitacoesPortal,
  tarefaRegistroSamiraPadrao,
  rawInitialTarefas,
  initialDPEmpresasConfig,
  initialDPFuncionarios,
  initialDPControleVencimentos,
  initialDPDiarioBordo
} from '@/lib/mockData';
import {
  obterCompetenciaAtual,
  ehRegistroSamira
} from '@/lib/dateUtils';
import {
  initialModelosCaptação,
  initialEmpresasRadar,
  classificarRegimeEmpresa,
  parseDataHoraAgendada
} from '@/lib/mockRadarFiscal';

interface AppContextType {
  // Dados
  clientes: Cliente[];
  colaboradores: Colaborador[];
  tarefas: Tarefa[];
  declaracoes: Declaracao[];
  leads: CRMLead[];
  procedimentos: CRMProcedimento[];
  procedimentoTemplates: CRMProcedimentoTemplate[];
  whatsAppConfig: WhatsAppConfig;
  whatsAppMensagens: WhatsAppMensagem[];
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
  honorarios: HonorarioItem[];
  receitasNaoRecorrentes: ReceitaNaoRecorrente[];
  transacoesOFX: TransacaoOFX[];
  contasBancarias: ContaBancaria[];
  historicoAjustesSaldo: HistoricoAjusteSaldo[];
  
  // Navegação
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeModule: 'operacional' | 'crm' | 'automacoes' | 'configuracoes';
  setActiveModule: (mod: 'operacional' | 'crm' | 'automacoes' | 'configuracoes') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  // Ações de Tarefas
  addTarefa: (tarefa: Omit<Tarefa, 'id' | 'created_at'>) => void;
  updateTarefa: (id: string, updates: Partial<Tarefa>) => void;
  deleteTarefa: (id: string) => void;
  moverTarefaStatus: (tarefaId: string, novoStatus: StatusTarefa) => void;
  anexarArquivoTarefa: (tarefaId: string, arquivo: Omit<ArquivoEtapa, 'id' | 'data_upload'>) => void;
  removerArquivoTarefa: (tarefaId: string, arquivoId: string) => void;
  concluirTarefa: (
    id: string,
    dadosGuia?: {
      ehPagamento: boolean;
      arquivoNome?: string;
      arquivoConteudo?: string;
      arquivoTamanho?: string;
      dataVencimento?: string;
      valor?: number;
      mensagemPersonalizada?: string;
    }
  ) => Promise<{
    sucesso: boolean;
    ehPagamento: boolean;
    whatsAppEnviado: boolean;
    clienteNome: string;
    telefoneDestinatario?: string;
    mensagemTexto?: string;
    linkPortalGuia?: string;
    fallbackWhatsAppWebUrl?: string;
    erroWhats?: string;
  }>;
  prorrogarTarefa: (id: string, novoPrazoMeta: string, motivo: string) => void;
  adicionarComentarioTarefa: (id: string, autor: string, texto: string) => void;

  // Ações de Gestão de Processos em Tarefas (NOVO)
  toggleProcessoTarefa: (tarefaId: string, ehProcesso: boolean) => void;
  adicionarEtapaProcesso: (tarefaId: string, etapa: Omit<EtapaProcessoTarefa, 'id' | 'concluida'>) => void;
  atualizarEtapaProcesso: (tarefaId: string, etapaId: string, updates: Partial<EtapaProcessoTarefa>) => void;
  alternarConclusaoEtapa: (tarefaId: string, etapaId: string) => void;
  excluirEtapaProcesso: (tarefaId: string, etapaId: string) => void;
  anexarArquivoEtapa: (tarefaId: string, etapaId: string, arquivo: Omit<ArquivoEtapa, 'id' | 'data_upload'>) => void;
  removerArquivoEtapa: (tarefaId: string, etapaId: string, arquivoId: string) => void;
  configurarCobrancaWhatsAppEtapa: (tarefaId: string, etapaId: string, config: ConfiguracaoCobrancaEtapa) => void;
  dispararCobrancaEtapaWhatsApp: (tarefaId: string, etapaId: string) => void;
  adicionarAtualizacaoSubprocesso: (tarefaId: string, etapaId: string, atualizacao: Omit<SubprocessoAtualizacao, 'id' | 'data'>) => void;
  prorrogarPrazoSubprocesso: (tarefaId: string, etapaId: string, justificativa: string, novoPrazoCustom?: string) => { sucesso: boolean; novoPrazo: string; mensagem: string };
  padronizarResponsaveisCarteira: () => { totalAlteradas: number };

  // Modelos de Mensagens Personalizadas por Tarefa
  modelosMensagens: ModeloMensagemTarefa[];
  salvarModeloMensagem: (modelo: ModeloMensagemTarefa) => void;
  restaurarModelosMensagensPadrao: () => void;
  obterModeloMensagemParaTarefa: (tarefa: Tarefa) => ModeloMensagemTarefa;
  formatarMensagemGuiaTarefa: (
    tarefa: Tarefa,
    dadosGuia: { dataVencimento?: string; valor?: number; arquivoNome?: string },
    nomeContato?: string,
    modeloCustomizado?: ModeloMensagemTarefa
  ) => string;

  // Ações de Conexão WhatsApp & Automação
  conectarWhatsAppSimulado: (numero: string) => void;
  desconectarWhatsApp: () => void;
  gerarQRCodeWhatsApp: () => Promise<string | null>;
  verificarStatusWhatsAppReal: () => Promise<string>;
  executarReguaManha08h: () => Promise<{ totalDisparados: number; detalhes: string[] }>;
  atualizarWhatsAppConfig: (updates: Partial<WhatsAppConfig>) => void;
  enviarMensagemWhatsApp: (
    destinatarioTipo: WhatsAppMensagem['destinatario_tipo'],
    destinatarioNome: string,
    telefone: string,
    tipoNotificacao: WhatsAppMensagem['tipo_notificacao'],
    texto: string,
    referenciaId?: string,
    options?: { media?: string; fileName?: string; mimeType?: string }
  ) => Promise<boolean>;
  dispararResumoMatinalEquipe: () => void;
  dispararCobrancaTarefa: (tarefaId: string) => void;
  dispararCobrancaDocumentosCliente: (clienteId: string) => void;

  // Ações de Clientes & Auditoria
  addCliente: (cliente: Omit<Cliente, 'id' | 'created_at'>) => void;
  updateCliente: (id: string, updates: Partial<Cliente>, motivoAlteracao?: string) => void;
  alternarStatusCliente: (id: string) => void;
  adicionarContatoNotificacao: (clienteId: string, contato: Omit<ContatoNotificacao, 'id'>) => void;
  removerContatoNotificacao: (clienteId: string, contatoId: string) => void;
  vincularDeclaracaoCliente: (clienteId: string, declaracao: DeclaracaoVinculadaCliente) => void;
  desvincularDeclaracaoCliente: (clienteId: string, declaracaoId: string) => void;

  // Ações de Colaboradores
  addColaborador: (colaborador: Omit<Colaborador, 'id'>) => void;
  updateColaborador: (id: string, updates: Partial<Colaborador>) => void;
  deleteColaborador: (id: string) => void;

  // Ações de Declarações Fiscais (CRUD)
  addDeclaracao: (dec: Omit<Declaracao, 'id'>) => void;
  updateDeclaracao: (id: string, updates: Partial<Declaracao>) => void;
  deleteDeclaracao: (id: string) => void;

  // Ações Financeiras & Conciliação
  addContaPagar: (conta: Omit<ContaPagar, 'id'>) => void;
  pagarConta: (id: string, dataPagamento?: string) => void;
  deleteContaPagar: (id: string) => void;
  addContaReceber: (conta: Omit<ContaReceber, 'id'>) => void;
  receberConta: (id: string, dataRecebimento?: string) => void;
  gerarProvisaoMensalHonorarios: (mesRef: string) => void;
  addReceitaNaoRecorrente: (receita: Omit<ReceitaNaoRecorrente, 'id' | 'created_at'>) => void;
  addCustoReceitaNaoRecorrente: (receitaId: string, custo: Omit<CustoVinculadoReceita, 'id'>) => void;
  importarExtratoOFX: (banco: 'PicPay Empresas' | 'Outro', transacoes: Omit<TransacaoOFX, 'id'>[]) => void;
  conciliarTransacaoOFX: (transacaoId: string, referenciaDescricao: string) => void;

  // Ações de Contas Bancárias & Ajuste de Saldo
  ajustarSaldoConta: (contaId: string, novoSaldo: number, motivo: string, responsavel?: string) => void;
  addContaBancaria: (conta: Omit<ContaBancaria, 'id'>) => void;
  redefinirFinanceiro: () => void;

  // Ações de Honorários por Competência (Regime Competência x Caixa)
  darBaixaHonorario: (
    id: string,
    dadosBaixa: {
      dataPagamento: string;
      formaPagamento: 'PIX PicPay' | 'Boleto' | 'Transferência' | 'Dinheiro' | 'Outro';
      valorPago?: number;
      observacoes?: string;
      notificarWhatsApp?: boolean;
    }
  ) => void;
  atualizarHonorario: (id: string, updates: Partial<HonorarioItem>, atualizarClienteContratual?: boolean) => void;
  adicionarHonorario: (hon: Omit<HonorarioItem, 'id' | 'created_at'>, atualizarClienteContratual?: boolean) => void;
  excluirHonorario: (id: string) => void;
  sincronizarHonorariosComClientes: (competenciaAlvo?: string) => number;
  gerarHonorariosCompetencia: (competenciaAlvo: string) => void;
  obterTelefoneHonorario: (hon: HonorarioItem) => string;
  gerarMensagemHonorarioWhatsApp: (
    hon: HonorarioItem,
    tipoForcado?: 'lembrete' | 'vencido'
  ) => {
    tipo: 'lembrete' | 'vencido';
    texto: string;
    diasAtraso: number;
    diasParaVencer: number;
  };
  dispararCobrancaHonorarioWhatsApp: (
    honorarioId: string,
    opcoes?: {
      telefoneOverride?: string;
      mensagemOverride?: string;
      tipoMensagem?: 'lembrete' | 'vencido';
      salvarTelefoneNoCliente?: boolean;
    }
  ) => Promise<{
    sucessoApi: boolean;
    semTelefone?: boolean;
    telefoneUsado: string;
    mensagemEnviada: string;
    tipoMensagem: 'lembrete' | 'vencido';
  }>;

  // Ações de CRM
  addLead: (lead: Omit<CRMLead, 'id' | 'data_entrada'>) => void;
  updateLead: (id: string, updates: Partial<CRMLead>) => void;
  converterLeadEmCliente: (leadId: string) => void;
  baixarLeadComJustificativa: (leadId: string, motivo: string, justificativa: string) => void;
  reativarLead: (leadId: string) => void;

  // Radar Fiscal & Captação Ativa Receita Federal / PGFN
  empresasRadar: EmpresaRadarFiscal[];
  modelosCaptação: ModeloMensagemCaptação[];
  adicionarEmpresaAoRadar: (empresa: EmpresaRadarFiscal) => void;
  atualizarEmpresaRadar: (id: string, updates: Partial<EmpresaRadarFiscal>) => void;
  importarEmpresaRadarParaCRM: (empresaId: string, estagio?: CRMLeadEstagio, mensagemAgendada?: MensagemAgendadaWhatsApp) => Promise<boolean>;
  importarEmpresasRadarLoteParaCRM: (empresaIds: string[]) => Promise<number>;
  consultarCNPJOnline: (cnpj: string) => Promise<{ success: boolean; empresa?: EmpresaRadarFiscal; error?: string }>;
  dispararMensagemCaptaçãoWhatsApp: (empresaId: string, mensagemTexto: string, telefoneDestino: string) => Promise<boolean>;
  capturarNovasEmpresasPublicas: (filtros: {
    uf: string;
    municipio: string;
    regime: 'todos' | 'simples' | 'mei' | 'normal';
    possuiDebitos: 'todos' | 'com_debitos' | 'sem_debitos';
    possuiWhatsapp?: 'todos' | 'com_whatsapp' | 'sem_whatsapp';
    quantidade?: number;
  }) => Promise<{ success: boolean; totalCapturadas: number; novas: EmpresaRadarFiscal[]; error?: string }>;
  validarWhatsAppEmpresas: (empresaIds: string[]) => Promise<{ validadas: number; comWhatsApp: number; semWhatsApp: number }>;
  validarWhatsAppNumero: (numero: string) => Promise<{ valido: boolean; jid?: string; nome?: string; numeroFormatado?: string }>;

  // Portal do Cliente & Gestão Documental por Departamento
  documentosPortal: DocumentoPortalCliente[];
  solicitacoesPortal: SolicitacaoPortalCliente[];
  addDocumentoPortal: (doc: Omit<DocumentoPortalCliente, 'id' | 'created_at'>) => void;
  updateDocumentoPortal: (id: string, updates: Partial<DocumentoPortalCliente>) => void;
  deleteDocumentoPortal: (id: string) => void;
  addSolicitacaoPortal: (sol: Omit<SolicitacaoPortalCliente, 'id' | 'created_at'>) => void;
  updateSolicitacaoPortal: (id: string, updates: Partial<SolicitacaoPortalCliente>) => void;
  responderSolicitacaoPortal: (id: string, resposta: string, novoStatus?: 'Em Andamento' | 'Concluída') => void;
  adicionarRetornoClienteSubtarefa: (tarefaId: string, etapaId: string, retorno: { autor_cliente: string; comentario?: string; arquivos: ArquivoEtapa[] }) => void;

  // Gestão de Tarefas Recorrentes por Empresa & Documentos Legais
  adicionarTarefaEmpresa: (clienteId: string, config: Omit<TarefaEmpresaConfig, 'id'>) => void;
  removerTarefaEmpresa: (clienteId: string, tarefaConfigId: string) => void;
  atualizarTarefaEmpresa: (clienteId: string, tarefaConfigId: string, updates: Partial<TarefaEmpresaConfig>) => void;
  sugerirTarefasPorRegime: (clienteId: string) => void;
  zerarTodasTarefasEmpresas: () => void;
  gerarTarefasRecorrentesCarteira: (competencia?: string) => { totalCriadas: number; detalhes: string[] };
  gerarTarefasAteJaneiro2027: () => { totalCriadas: number; detalhes: string[] };
  gerarTarefasEmpresaAteJaneiro2027: (clienteId: string) => { totalCriadas: number; detalhes: string[] };
  restaurarTarefasPadraoCarteira: () => { totalRestauradas: number };
  adicionarDocumentoLegalCliente: (clienteId: string, doc: Omit<DocumentoLegalCliente, 'id' | 'data_upload'>) => void;
  removerDocumentoLegalCliente: (clienteId: string, docId: string) => void;
  atualizarAcessoPortalCliente: (clienteId: string, credenciais: CredenciaisPortalCliente) => void;

  // Perfil de Acesso & RBAC
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Departamento Pessoal, SST & Prontuário Trabalhista
  dpEmpresasConfig: DPEmpresaConfig[];
  dpFuncionarios: DPFuncionario[];
  dpControleVencimentos: DPControleVencimento[];
  dpDiarioBordo: DPDiarioBordo[];

  salvarDPEmpresaConfig: (config: DPEmpresaConfig) => void;
  addDPFuncionario: (func: Omit<DPFuncionario, 'id'>) => void;
  updateDPFuncionario: (id: string, updates: Partial<DPFuncionario>) => void;
  deleteDPFuncionario: (id: string) => void;

  addDPVencimento: (venc: Omit<DPControleVencimento, 'id'>) => void;
  updateDPVencimento: (id: string, updates: Partial<DPControleVencimento>) => void;
  deleteDPVencimento: (id: string) => void;

  addDPOcorrencia: (ocorr: Omit<DPDiarioBordo, 'id' | 'created_at'>) => void;
  updateDPOcorrencia: (id: string, updates: Partial<DPDiarioBordo>) => void;
  deleteDPOcorrencia: (id: string) => void;

  sincronizarDPComTarefasGestup: () => { criadas: number; existentes: number; tarefasCriadas: string[] };
  promoverProcessoAdmissaoParaDP: (tarefa: Tarefa) => void;

  redefinirDadosPadrao: () => void;
}

export const getResponsavelPorDepartamento = (depto?: string, categoria?: string): string => {
  const dep = (depto || categoria || '').toLowerCase();
  if (dep.includes('fiscal') || dep.includes('tribut')) return 'Guilherme';
  if (dep.includes('pessoal') || dep.includes('rh') || dep.includes('folha') || dep.includes('trabalh')) return 'Ygor';
  if (dep.includes('contábil') || dep.includes('contabil')) return 'Ygor';
  return 'Guilherme';
};

export const getTarefasPadraoPorRegime = (regime: string, clienteId: string): TarefaEmpresaConfig[] => {
  if (regime === 'MEI') {
    return [
      {
        id: `t-cfg-mei-1-${clienteId}`,
        titulo: 'DAS-MEI / Guia Mensal do MEI',
        departamento: 'Fiscal',
        periodicidade: 'Mensal',
        dia_limite: 20,
        eh_processo: false,
        ativo: true
      },
      {
        id: `t-cfg-mei-2-${clienteId}`,
        titulo: 'Relatório Mensal das Receitas Brutas',
        departamento: 'Contábil',
        periodicidade: 'Mensal',
        dia_limite: 20,
        eh_processo: false,
        ativo: true
      },
      {
        id: `t-cfg-mei-3-${clienteId}`,
        titulo: 'DASN-SIMEI / Declaração Anual Simplificada',
        departamento: 'Fiscal',
        periodicidade: 'Anual',
        dia_limite: 31,
        eh_processo: false,
        ativo: true
      }
    ];
  }

  if (regime === 'Simples Nacional' || regime === 'Simples') {
    return [
      {
        id: `t-cfg-sn-1-${clienteId}`,
        titulo: 'PGDAS-D / Apuração do Simples Nacional',
        departamento: 'Fiscal',
        periodicidade: 'Mensal',
        dia_limite: 20,
        eh_processo: false,
        ativo: true
      },
      {
        id: `t-cfg-sn-2-${clienteId}`,
        titulo: 'DCTFWeb Previdenciária & INSS',
        departamento: 'Fiscal',
        periodicidade: 'Mensal',
        dia_limite: 15,
        eh_processo: false,
        ativo: true
      },
      {
        id: `t-cfg-sn-3-${clienteId}`,
        titulo: 'Folha de Pagamento & Pró-Labore',
        departamento: 'Pessoal',
        periodicidade: 'Mensal',
        dia_limite: 5,
        eh_processo: true,
        etapas_padrao: [
          { titulo: 'Coleta de variáveis e ponto dos funcionários', ordem: 1, cobrar_whatsapp: true },
          { titulo: 'Cálculo da Folha e emissão de recibos', ordem: 2, cobrar_whatsapp: false },
          { titulo: 'Geração de guias FGTS Digital e envio ao cliente', ordem: 3, cobrar_whatsapp: true }
        ],
        ativo: true
      },
      {
        id: `t-cfg-sn-4-${clienteId}`,
        titulo: 'Conciliação e Fechamento Contábil Mensal',
        departamento: 'Contábil',
        periodicidade: 'Mensal',
        dia_limite: 25,
        eh_processo: false,
        ativo: true
      },
      {
        id: `t-cfg-sn-5-${clienteId}`,
        titulo: 'DEFIS / Declaração de Informações Socioeconômicas',
        departamento: 'Fiscal',
        periodicidade: 'Anual',
        dia_limite: 31,
        eh_processo: false,
        ativo: true
      }
    ];
  }

  // Lucro Presumido / Real / Outros
  return [
    {
      id: `t-cfg-lp-1-${clienteId}`,
      titulo: 'EFD-Contribuições (PIS/COFINS)',
      departamento: 'Fiscal',
      periodicidade: 'Mensal',
      dia_limite: 15,
      eh_processo: false,
      ativo: true
    },
    {
      id: `t-cfg-lp-2-${clienteId}`,
      titulo: 'EFD ICMS/IPI (SPED Fiscal)',
      departamento: 'Fiscal',
      periodicidade: 'Mensal',
      dia_limite: 20,
      eh_processo: false,
      ativo: true
    },
    {
      id: `t-cfg-lp-3-${clienteId}`,
      titulo: 'DCTF Mensal / Apuração de Tributos Federais',
      departamento: 'Fiscal',
      periodicidade: 'Mensal',
      dia_limite: 15,
      eh_processo: false,
      ativo: true
    },
    {
      id: `t-cfg-lp-4-${clienteId}`,
      titulo: 'Folha de Pagamento, Pró-Labore & eSocial',
      departamento: 'Pessoal',
      periodicidade: 'Mensal',
      dia_limite: 5,
      eh_processo: true,
      etapas_padrao: [
        { titulo: 'Coleta de movimentações trabalhistas', ordem: 1, cobrar_whatsapp: true },
        { titulo: 'Processamento eSocial & DCTFWeb', ordem: 2, cobrar_whatsapp: false },
        { titulo: 'Emissão e envio de holerites e guias', ordem: 3, cobrar_whatsapp: true }
      ],
      ativo: true
    },
    {
      id: `t-cfg-lp-5-${clienteId}`,
      titulo: 'Escrituração Contábil Digital (ECD)',
      departamento: 'Contábil',
      periodicidade: 'Anual',
      dia_limite: 31,
      eh_processo: false,
      ativo: true
    }
  ];
};

const enrichCliente = (c: Cliente): Cliente => ({
  ...c,
  receber_guias_whatsapp: c.receber_guias_whatsapp ?? true,
  data_inicio_contrato: c.data_inicio_contrato || c.data_contrato || '2026-01-15',
  data_renovacao_contrato: c.data_renovacao_contrato || '2027-01-15',
  portal_acesso: c.portal_acesso || {
    email: c.email || `${c.nome.toLowerCase().replace(/[^a-z0-9]/g, '') || 'contato'}@empresa.com.br`,
    senha: 'finup123',
    ativo: true,
    ultimo_acesso: '2026-10-30 14:22'
  },
  documentos_legais: (c.documentos_legais && c.documentos_legais.length > 0) ? c.documentos_legais : [
    {
      id: `doc-leg-1-${c.id}`,
      tipo: 'Cartão CNPJ',
      nome: `Cartão CNPJ - ${c.nome}.pdf`,
      arquivo_url: `/docs/cartao_cnpj_${c.id}.pdf`,
      arquivo_tamanho: '240 KB',
      data_upload: '2026-08-01'
    },
    {
      id: `doc-leg-2-${c.id}`,
      tipo: 'Contrato Social / Requerimento',
      nome: `Contrato Social Consolidado - ${c.nome}.pdf`,
      arquivo_url: `/docs/contrato_social_${c.id}.pdf`,
      arquivo_tamanho: '1.2 MB',
      data_upload: '2026-08-01'
    },
    {
      id: `doc-leg-3-${c.id}`,
      tipo: 'Inscrição Municipal (CCM)',
      nome: `Ficha de Inscrição Municipal - CCM.pdf`,
      arquivo_url: `/docs/inscricao_municipal_${c.id}.pdf`,
      arquivo_tamanho: '180 KB',
      data_upload: '2026-08-01'
    },
    ...(c.regime_tributario !== 'MEI' ? [
      {
        id: `doc-leg-4-${c.id}`,
        tipo: 'Inscrição Estadual (CADESP)' as const,
        nome: `Comprovante de Inscrição Estadual CADESP.pdf`,
        arquivo_url: `/docs/inscricao_estadual_${c.id}.pdf`,
        arquivo_tamanho: '310 KB',
        data_upload: '2026-08-01'
      }
    ] : [])
  ],
  tarefas_empresa: Array.isArray(c.tarefas_empresa) ? c.tarefas_empresa : [],
  contatos_notificacao: [
    {
      id: `ct-princ-${c.id}`,
      nome: c.responsavel || c.nome.split(' ')[0] || 'Responsável',
      telefoneOuGrupo: (c.whatsapp || c.telefone || '').trim(),
      tipo: 'Individual',
      principal: true
    },
    ...((c.contatos_notificacao || []).filter(ct => 
      !ct.id?.startsWith('ct-princ') && 
      !ct.telefoneOuGrupo?.includes('@g.us') && 
      !ct.telefoneOuGrupo?.includes('19999990000') &&
      !ct.telefoneOuGrupo?.includes('19992803902') &&
      (ct.telefoneOuGrupo || '').trim().length > 0
    ))
  ],
  declaracoes_vinculadas: (c.declaracoes_vinculadas && c.declaracoes_vinculadas.length > 0) ? c.declaracoes_vinculadas : [
    {
      declaracao_id: 'dec-1',
      titulo: c.regime_tributario === 'MEI' ? 'DASN-SIMEI' : 'PGDAS-D / Simples Nacional',
      periodicidade: c.regime_tributario === 'MEI' ? 'Anual' : 'Mensal',
      data_inicio: '2026-01-01',
      dia_vencimento: 20
    },
    {
      declaracao_id: 'dec-2',
      titulo: 'DCTFWeb & E-Social Previdenciário',
      periodicidade: 'Mensal',
      data_inicio: '2026-01-01',
      dia_vencimento: 15
    }
  ],
  historico_alteracoes: (c.historico_alteracoes && c.historico_alteracoes.length > 0) ? c.historico_alteracoes : [
    {
      id: `hist-cad-${c.id}`,
      data: c.created_at || '2026-08-05',
      autor: 'Sistema GestUp',
      tipo: 'Cadastro',
      descricao: `Cliente cadastrado sob regime ${c.regime_tributario} com honorário de R$ ${c.honorario_mensal}`
    },
    {
      id: `hist-aud-${c.id}`,
      data: '2026-10-01 10:30',
      autor: 'Guilherme (Gestor fin.up)',
      tipo: 'Contrato',
      descricao: 'Contrato ativado e configurada régua de notificações de guias via WhatsApp'
    }
  ]
});

const enrichTarefa = (t: Tarefa): Tarefa => {
  const isProcessoDefault = t.eh_processo ?? (
    t.id === '6a7ddd87bfda5c46480a33f4' || 
    t.titulo.toLowerCase().includes('abertura') || 
    t.titulo.toLowerCase().includes('alteração') || 
    t.titulo.toLowerCase().includes('recuperação') || 
    t.titulo.toLowerCase().includes('regularização') ||
    t.titulo.toLowerCase().includes('adiantamento')
  );

  const defaultEtapas: EtapaProcessoTarefa[] = (t.etapas_processo && t.etapas_processo.length > 0)
    ? t.etapas_processo
    : (isProcessoDefault ? [
        {
          id: `etp-1-${t.id}`,
          titulo: '1. Coleta e Conferência de Documentos',
          descricao: 'Solicitar e conferir extratos bancários, cartões e documentação do cliente.',
          ordem: 1,
          data_limite: '2026-10-14',
          concluida: true,
          data_conclusao: '2026-10-06 14:20',
          arquivos: [
            { id: `arq-1-${t.id}`, nome: 'Checklist_Documentos_Assinados.pdf', url: '#', data_upload: '2026-10-06', tamanho: '1.4 MB' }
          ],
          cobrar_whatsapp: false
        },
        {
          id: `etp-2-${t.id}`,
          titulo: '2. Envio de Relatório Prévio e Aprovação do Cliente',
          descricao: 'Enviar prévia para o cliente validar e autorizar processamento.',
          ordem: 2,
          data_limite: '2026-10-18',
          concluida: false,
          arquivos: [
            { id: `arq-2-${t.id}`, nome: 'Previa_Fechamento_Competencia.xlsx', url: '#', data_upload: '2026-10-07', tamanho: '850 KB' }
          ],
          cobrar_whatsapp: true,
          configuracao_cobranca: {
            habilitado: true,
            telefones: [],
            mensagem_padrao: 'Olá {cliente}! Lembramos que a etapa *{etapa}* referente à empresa *{empresa}* tem data limite até *{data_limite}*. Favor nos enviar a validação para darmos continuidade ao processo.',
            frequencia: 'Diariamente',
            horario_envio: '08:00',
            ultimo_envio: '2026-10-08 08:00',
            proximo_envio: '2026-10-09 08:00',
            total_envios: 2
          }
        },
        {
          id: `etp-3-${t.id}`,
          titulo: '3. Protocolo e Emissão das Guias Finais',
          descricao: 'Gerar guias finais, transmitir ao órgão e anexar comprovantes.',
          ordem: 3,
          data_limite: '2026-10-22',
          concluida: false,
          arquivos: [],
          cobrar_whatsapp: true,
          configuracao_cobranca: {
            habilitado: true,
            telefones: [],
            mensagem_padrao: 'Prezado(a) {cliente}, informamos que a etapa *{etapa}* está agendada para finalização até *{data_limite}*. Qualquer dúvida contate a equipe fin.up.',
            frequencia: 'Semanalmente (Segundas-feiras)',
            horario_envio: '08:00',
            proximo_envio: '2026-10-12 08:00',
            total_envios: 0
          }
        }
      ] : []);

  return {
    ...t,
    eh_processo: isProcessoDefault,
    etapas_processo: defaultEtapas,
    eh_pagamento: t.eh_pagamento ?? (t.categoria === 'Fiscal' || t.titulo.toLowerCase().includes('das') || t.titulo.toLowerCase().includes('inss') || t.titulo.toLowerCase().includes('fgts')),
    comentarios_lista: (t.comentarios_lista && t.comentarios_lista.length > 0) ? t.comentarios_lista : [
      {
        id: `cmt-init-${t.id}`,
        autor: t.responsavel || 'Equipe fin.up',
        data: '2026-10-05 09:00',
        texto: `Rotina operacional iniciada para a competência ${t.competencia}. Prazo Legal: ${t.data_prazo_legal}`
      }
    ]
  };
};

const enrichDeclaracao = (d: Declaracao): Declaracao => ({
  ...d,
  recorrente: d.recorrente ?? (d.periodicidade !== 'Eventual')
});

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>(() =>
    initialClientes.map(enrichCliente).map(c => ({ ...c, tarefas_empresa: [] }))
  );
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(initialColaboradores);
  const [tarefas, setTarefas] = useState<Tarefa[]>(() => {
    const base = [...initialTarefas];
    if (!base.some(ehRegistroSamira)) {
      base.push(tarefaRegistroSamiraPadrao);
    }
    return base.map(enrichTarefa);
  });
  const [declaracoes, setDeclaracoes] = useState<Declaracao[]>(() => (initialDeclaracoes as Declaracao[]).map(enrichDeclaracao));
  const [leads, setLeads] = useState<CRMLead[]>(initialLeads);
  const [procedimentos, setProcedimentos] = useState<CRMProcedimento[]>([]);
  const [procedimentoTemplates] = useState<CRMProcedimentoTemplate[]>(initialProcedimentoTemplates);
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(initialWhatsAppConfig);
  const [whatsAppMensagens, setWhatsAppMensagens] = useState<WhatsAppMensagem[]>(initialWhatsAppMensagens);

  // Estados Financeiros (Zerados para competência 10/2026 para frente)
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>(initialContasPagar as ContaPagar[]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>(initialContasReceber as ContaReceber[]);
  const [honorarios, setHonorarios] = useState<HonorarioItem[]>(initialHonorarios);
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>(initialContasBancarias);
  const [historicoAjustesSaldo, setHistoricoAjustesSaldo] = useState<HistoricoAjusteSaldo[]>([]);
  const [receitasNaoRecorrentes, setReceitasNaoRecorrentes] = useState<ReceitaNaoRecorrente[]>([
    {
      id: 'rec-avulsa-1',
      cliente_nome: 'MACDOG GOURMET',
      titulo_servico: 'Alteração Societária e Entrada de Novo Sócio',
      valor_total: 2800,
      data_prevista: '2026-10-25',
      status: 'Previsto',
      conciliado_ofx: false,
      created_at: '2026-10-01',
      custos_vinculados: [
        { id: 'cst-1', descricao: 'Taxa JUCESP Protocolo Web', valor: 278.40, pago: true, conciliado_ofx: true },
        { id: 'cst-2', descricao: 'Emissão Certificado Digital e-CPF Sócio', valor: 180.00, pago: false, conciliado_ofx: false }
      ]
    },
    {
      id: 'rec-avulsa-2',
      cliente_nome: 'Nova Holding Familiar (Em Constituição)',
      titulo_servico: 'Planejamento Tributário e Abertura de Holding',
      valor_total: 6500,
      data_prevista: '2026-10-30',
      status: 'Previsto',
      conciliado_ofx: false,
      created_at: '2026-10-02',
      custos_vinculados: [
        { id: 'cst-3', descricao: 'DARE SP Registro Junta Comercial', valor: 450.00, pago: true, conciliado_ofx: true }
      ]
    }
  ]);
  const [transacoesOFX, setTransacoesOFX] = useState<TransacaoOFX[]>([
    { id: 'ofx-1', fitid: 'PICPAY-20261001-01', tipo: 'CREDIT', data: '2026-10-05', valor: 1250, descricao: 'RECEBIMENTO PIX THE BLACK BURGUER', conciliado: true, banco: 'PicPay Empresas' },
    { id: 'ofx-2', fitid: 'PICPAY-20261002-02', tipo: 'CREDIT', data: '2026-10-05', valor: 600, descricao: 'RECEBIMENTO PIX ADEGA DO CHRIS', conciliado: true, banco: 'PicPay Empresas' },
    { id: 'ofx-3', fitid: 'PICPAY-20261003-03', tipo: 'DEBIT', data: '2026-10-06', valor: 278.40, descricao: 'PAGAMENTO DARE JUCESP ALTERACAO', conciliado: true, banco: 'PicPay Empresas' },
    { id: 'ofx-4', fitid: 'PICPAY-20261004-04', tipo: 'CREDIT', data: '2026-10-06', valor: 1500, descricao: 'TRANSFERENCIA PIX MACDOG GOURMET', conciliado: false, banco: 'PicPay Empresas' }
  ]);

  // Perfil de Acesso & RBAC (admin_socio, operacional_dp, fiscal_contabil)
  const [userRole, setUserRoleState] = useState<UserRole>('admin_socio');

  // Módulo DP, SST & Prontuário
  const [dpEmpresasConfig, setDPEmpresasConfig] = useState<DPEmpresaConfig[]>(initialDPEmpresasConfig);
  const [dpFuncionarios, setDPFuncionarios] = useState<DPFuncionario[]>(initialDPFuncionarios);
  const [dpControleVencimentos, setDPControleVencimentos] = useState<DPControleVencimento[]>(initialDPControleVencimentos);
  const [dpDiarioBordo, setDPDiarioBordo] = useState<DPDiarioBordo[]>(initialDPDiarioBordo);

  const saveDPEmpresasConfig = (dados: DPEmpresaConfig[]) => {
    setDPEmpresasConfig(dados);
    try {
      localStorage.setItem('gestup_v2_dp_empresas_config', JSON.stringify(dados));
    } catch {}
  };

  const saveDPFuncionarios = (dados: DPFuncionario[]) => {
    setDPFuncionarios(dados);
    try {
      localStorage.setItem('gestup_v2_dp_funcionarios', JSON.stringify(dados));
    } catch {}
  };

  const saveDPControleVencimentos = (dados: DPControleVencimento[]) => {
    setDPControleVencimentos(dados);
    try {
      localStorage.setItem('gestup_v2_dp_controle_vencimentos', JSON.stringify(dados));
    } catch {}
  };

  const saveDPDiarioBordo = (dados: DPDiarioBordo[]) => {
    setDPDiarioBordo(dados);
    try {
      localStorage.setItem('gestup_v2_dp_diario_bordo', JSON.stringify(dados));
    } catch {}
  };

  // A TELA PRINCIPAL AGORA É O DASHBOARD (Power BI)
  const [activeModule, setActiveModule] = useState<'operacional' | 'crm' | 'automacoes' | 'configuracoes'>('operacional');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    try {
      localStorage.setItem('gestup_user_role', role);
    } catch {}
    if (role === 'operacional_dp') {
      setActiveTab('dp-sst');
      setActiveModule('operacional');
    }
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  // Modelos de Mensagens Personalizadas
  const [modelosMensagens, setModelosMensagens] = useState<ModeloMensagemTarefa[]>(initialModelosMensagens);

  // Radar Fiscal & Captação Ativa Receita / PGFN
  const [empresasRadar, setEmpresasRadar] = useState<EmpresaRadarFiscal[]>(initialEmpresasRadar);
  const [modelosCaptação, setModelosCaptação] = useState<ModeloMensagemCaptação[]>(initialModelosCaptação);

  // Portal do Cliente (Documentos & Solicitações)
  const [documentosPortal, setDocumentosPortal] = useState<DocumentoPortalCliente[]>(initialDocumentosPortal);
  const [solicitacoesPortal, setSolicitacoesPortal] = useState<SolicitacaoPortalCliente[]>(initialSolicitacoesPortal);

  const saveDocumentosPortal = (dados: DocumentoPortalCliente[]) => {
    setDocumentosPortal(dados);
    try {
      localStorage.setItem('gestup_v2_portal_documentos', JSON.stringify(dados));
    } catch {}
  };

  const saveSolicitacoesPortal = (dados: SolicitacaoPortalCliente[]) => {
    setSolicitacoesPortal(dados);
    try {
      localStorage.setItem('gestup_v2_portal_solicitacoes', JSON.stringify(dados));
    } catch {}
  };

  const saveEmpresasRadar = (dados: EmpresaRadarFiscal[]) => {
    setEmpresasRadar(dados);
    try {
      localStorage.setItem('gestup_v2_radar_fiscal', JSON.stringify(dados));
    } catch {}
  };

  // Carregar preferência do menu recolhível
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gestup_sidebar_collapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('gestup_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Carregar do localStorage com chave v2 e migração inteligente
  useEffect(() => {
    try {
      // Limpa chaves legadas antigas para evitar cache desatualizado
      localStorage.removeItem('gestup_tarefas');
      localStorage.removeItem('gestup_clientes');
      localStorage.removeItem('gestup_declaracoes');

      const savedTarefas = localStorage.getItem('gestup_v2_tarefas');
      let baseTarefas: Tarefa[] = [];
      if (savedTarefas) {
        try {
          const parsed = JSON.parse(savedTarefas);
          if (Array.isArray(parsed) && parsed.length > 0) {
            baseTarefas = parsed;
          }
        } catch {}
      }

      // Se não havia tarefas no localStorage, inicializa com initialTarefas
      if (baseTarefas.length === 0) {
        baseTarefas = [...initialTarefas];
      } else {
        // Recuperação Segura Pós-Bug: se o mês 11/2026 foi esvaziado por reloads anteriores
        // (ficando com 0 tarefas ou apenas com "Registro - Samira"), restaura as tarefas
        // das competências 11/2026, 12/2026 e 01/2027 a partir de rawInitialTarefas sem perder as já existentes
        const tarefas11 = baseTarefas.filter(t => t.competencia === '11/2026');
        if (tarefas11.length <= 1) {
          const recuperaveis = rawInitialTarefas.filter(
            t => t.competencia === '11/2026' || t.competencia === '12/2026' || t.competencia === '01/2027'
          );
          recuperaveis.forEach(tOrig => {
            const jaExiste = baseTarefas.some(
              b => b.id === tOrig.id || (b.titulo === tOrig.titulo && b.cliente_id === tOrig.cliente_id && b.competencia === tOrig.competencia)
            );
            if (!jaExiste) {
              baseTarefas.push(tOrig);
            }
          });
        }
      }

      // Garante que "Registro - Samira" está sempre presente e protegida
      if (!baseTarefas.some(ehRegistroSamira)) {
        baseTarefas.push(tarefaRegistroSamiraPadrao);
      }

      let tarefasFinais = baseTarefas.map(enrichTarefa);

      // Padronização mandatória solicitada: Fiscal -> Guilherme | Pessoal / RH / Contábil -> Ygor
      tarefasFinais = tarefasFinais.map(t => {
        const cat = (t.categoria || '').toLowerCase();
        const tit = (t.titulo || '').toLowerCase();
        let novoResp = t.responsavel;

        if (cat.includes('fiscal') || tit.includes('das') || tit.includes('pgdas') || tit.includes('dctf') || tit.includes('tribut')) {
          novoResp = 'Guilherme';
        } else if (cat.includes('pessoal') || cat.includes('rh') || tit.includes('folha') || tit.includes('pró-labore') || tit.includes('pro-labore') || tit.includes('admissão') || tit.includes('registro') || tit.includes('samira')) {
          novoResp = 'Ygor';
        } else if (cat.includes('contábil') || cat.includes('contabil')) {
          novoResp = 'Ygor';
        }

        const etapasAtualizadas = t.etapas_processo?.map(ep => ({
          ...ep,
          responsavel: novoResp
        }));

        return {
          ...t,
          responsavel: novoResp,
          etapas_processo: etapasAtualizadas || t.etapas_processo
        };
      });

      setTarefas(tarefasFinais);
      try {
        localStorage.setItem('gestup_v2_tarefas', JSON.stringify(tarefasFinais));
      } catch {}

      // Carregar colaboradores salvos do localStorage
      const savedColaboradores = localStorage.getItem('gestup_v2_colaboradores');
      if (savedColaboradores) {
        try {
          const parsedColabs = JSON.parse(savedColaboradores);
          if (Array.isArray(parsedColabs) && parsedColabs.length > 0) {
            setColaboradores(parsedColabs);
          }
        } catch {}
      }

      let clientesAtuais: Cliente[] = initialClientes.map(enrichCliente).map(c => ({ ...c, tarefas_empresa: [] }));
      const savedClientes = localStorage.getItem('gestup_v2_clientes');
      if (savedClientes) {
        try {
          const parsed = JSON.parse(savedClientes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            clientesAtuais = parsed.map(enrichCliente);
          }
        } catch {}
      }
      // Migração solicitada: Zerar tarefas vinculadas às empresas para recriação de toda a base
      const jaZerouTarefasEmpresa = localStorage.getItem('gestup_v3_tarefas_empresa_zeradas');
      if (!jaZerouTarefasEmpresa) {
        clientesAtuais = clientesAtuais.map(c => ({
          ...c,
          tarefas_empresa: []
        }));
        try {
          localStorage.setItem('gestup_v3_tarefas_empresa_zeradas', 'true');
          localStorage.setItem('gestup_v2_clientes', JSON.stringify(clientesAtuais));
        } catch {}
      }
      setClientes(clientesAtuais);
      const savedDeclaracoes = localStorage.getItem('gestup_v2_declaracoes');
      if (savedDeclaracoes) {
        try {
          setDeclaracoes((JSON.parse(savedDeclaracoes) as Declaracao[]).map(enrichDeclaracao));
        } catch {}
      }
      // 1. Contas a Pagar: Apenas a partir de 10/2026
      const savedPagar = localStorage.getItem('gestup_v2_contas_pagar');
      if (savedPagar) {
        try {
          const parsedPagar = JSON.parse(savedPagar) as ContaPagar[];
          const filtradosPagar = parsedPagar.filter(cp => cp.data_vencimento && cp.data_vencimento >= '2026-10-01');
          setContasPagar(filtradosPagar);
        } catch {}
      } else {
        setContasPagar([]);
      }

      // 2. Contas a Receber: Apenas a partir de 10/2026
      const savedReceber = localStorage.getItem('gestup_v2_contas_receber');
      if (savedReceber) {
        try {
          const parsedReceber = JSON.parse(savedReceber) as ContaReceber[];
          const filtradosReceber = parsedReceber.filter(cr => cr.data_vencimento && cr.data_vencimento >= '2026-10-01');
          setContasReceber(filtradosReceber);
        } catch {}
      } else {
        setContasReceber([]);
      }

      // 3. Honorários: Mantém estritamente competência 10/2026 para frente e sincroniza telefones/IDs reais dos clientes
      const higienizarHonorarios = (lista: HonorarioItem[]): HonorarioItem[] => {
        return lista.map(h => {
          const cli = clientesAtuais.find(
            c => c.id === h.cliente_id || c.nome.trim().toLowerCase() === (h.cliente_nome || '').trim().toLowerCase()
          );
          const telHonDigits = String(h.contato_telefone || '').replace(/\D/g, '');
          const isFakePlaceholder = /^199999900\d{2}$/.test(telHonDigits) || /^55199999900\d{2}$/.test(telHonDigits);
          const telCli = cli?.whatsapp || cli?.telefone || cli?.contatos_notificacao?.[0]?.telefoneOuGrupo || '';
          const telefoneResolvido = telCli || (isFakePlaceholder ? '' : (h.contato_telefone || ''));

          return {
            ...h,
            cliente_id: cli ? cli.id : h.cliente_id,
            contato_nome: cli?.responsavel || h.contato_nome,
            contato_telefone: telefoneResolvido
          };
        });
      };

      const savedHonorarios = localStorage.getItem('gestup_v2_honorarios');
      if (savedHonorarios) {
        try {
          const parsedHons = JSON.parse(savedHonorarios) as HonorarioItem[];
          if (Array.isArray(parsedHons)) {
            const filtradosHons = parsedHons.filter(h => {
              if (!h.competencia) return true;
              const [m, y] = h.competencia.split('/').map(Number);
              if (isNaN(m) || isNaN(y)) return true;
              return (y > 2026) || (y === 2026 && m >= 10);
            });
            const baseHons = filtradosHons.length > 0 ? filtradosHons : initialHonorarios;
            const honsHigienizados = higienizarHonorarios(baseHons);
            setHonorarios(honsHigienizados);
            try {
              localStorage.setItem('gestup_v2_honorarios', JSON.stringify(honsHigienizados));
            } catch {}
          }
        } catch {}
      } else {
        const honsIniciais = higienizarHonorarios(initialHonorarios);
        setHonorarios(honsIniciais);
      }

      // 4. Contas Bancárias & Ajustes de Saldo
      const savedContasBancarias = localStorage.getItem('gestup_v2_contas_bancarias');
      if (savedContasBancarias) {
        setContasBancarias(JSON.parse(savedContasBancarias));
      }
      const savedHistoricoAjustes = localStorage.getItem('gestup_v2_historico_ajustes_saldo');
      if (savedHistoricoAjustes) {
        setHistoricoAjustesSaldo(JSON.parse(savedHistoricoAjustes));
      }
      const savedWhatsApp = localStorage.getItem('gestup_v2_whatsapp_config');
      if (savedWhatsApp) {
        const parsed = JSON.parse(savedWhatsApp);
        const numeroCorrigido = (!parsed.numero_conectado || parsed.numero_conectado.includes('99987-0840') || parsed.numero_conectado.includes('999870840'))
          ? '+55 (19) 99208-0639'
          : parsed.numero_conectado;
        const keyCorrigida = (!parsed.api_key || parsed.api_key.includes('e74e3e545d217c1598f490d802b2ba61cff2a937a2f532cc987cb745f133a28a'))
          ? '68A885CD-5F29-4269-949C-8AEB4D149393'
          : parsed.api_key;
        setWhatsAppConfig(prev => ({
          ...prev,
          ...parsed,
          numero_conectado: numeroCorrigido,
          api_url: parsed.api_url || 'https://evolution-api-production-ed7c.up.railway.app',
          api_key: keyCorrigida,
          nome_instancia: parsed.nome_instancia || 'gestup',
          dominio_publico: parsed.dominio_publico || ''
        }));
      }

      // 6. Modelos de Mensagens Personalizadas
      const savedModelos = localStorage.getItem('gestup_v2_modelos_mensagens');
      if (savedModelos) {
        try {
          setModelosMensagens(JSON.parse(savedModelos));
        } catch {}
      }

      // 7. Radar Fiscal & Captação Ativa
      const savedRadar = localStorage.getItem('gestup_v2_radar_fiscal');
      if (savedRadar) {
        try {
          const parsed = JSON.parse(savedRadar);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEmpresasRadar(parsed);
          }
        } catch {}
      }

      // 8. Leads do CRM (Pipeline e Agendamentos)
      const savedLeads = localStorage.getItem('gestup_v2_leads');
      if (savedLeads) {
        try {
          const parsed = JSON.parse(savedLeads);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLeads(parsed);
          }
        } catch {}
      }

      // 9. Documentos e Solicitações do Portal do Cliente
      const savedDocsPortal = localStorage.getItem('gestup_v2_portal_documentos');
      if (savedDocsPortal) {
        try {
          const parsed = JSON.parse(savedDocsPortal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDocumentosPortal(parsed);
          }
        } catch {}
      }

      const savedSolsPortal = localStorage.getItem('gestup_v2_portal_solicitacoes');
      if (savedSolsPortal) {
        try {
          const parsed = JSON.parse(savedSolsPortal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSolicitacoesPortal(parsed);
          }
        } catch {}
      }

      // 10. Perfil de Acesso & RBAC
      const savedRole = localStorage.getItem('gestup_user_role') as UserRole | null;
      if (savedRole && (savedRole === 'admin_socio' || savedRole === 'operacional_dp' || savedRole === 'fiscal_contabil')) {
        setUserRoleState(savedRole);
        if (savedRole === 'operacional_dp') {
          setActiveTab('dp-sst');
          setActiveModule('operacional');
        }
      }

      // 11. Departamento Pessoal & SST
      const savedDPConfig = localStorage.getItem('gestup_v2_dp_empresas_config');
      if (savedDPConfig) {
        try {
          const parsed = JSON.parse(savedDPConfig);
          if (Array.isArray(parsed) && parsed.length > 0) setDPEmpresasConfig(parsed);
        } catch {}
      }

      const savedDPFuncs = localStorage.getItem('gestup_v2_dp_funcionarios');
      if (savedDPFuncs) {
        try {
          const parsed = JSON.parse(savedDPFuncs);
          if (Array.isArray(parsed) && parsed.length > 0) setDPFuncionarios(parsed);
        } catch {}
      }

      const savedDPVencs = localStorage.getItem('gestup_v2_dp_controle_vencimentos');
      if (savedDPVencs) {
        try {
          const parsed = JSON.parse(savedDPVencs);
          if (Array.isArray(parsed) && parsed.length > 0) setDPControleVencimentos(parsed);
        } catch {}
      }

      const savedDPDiario = localStorage.getItem('gestup_v2_dp_diario_bordo');
      if (savedDPDiario) {
        try {
          const parsed = JSON.parse(savedDPDiario);
          if (Array.isArray(parsed) && parsed.length > 0) setDPDiarioBordo(parsed);
        } catch {}
      }
    } catch {}
  }, []);

  // Sincroniza o status do WhatsApp no Railway na inicialização
  useEffect(() => {
    const syncStatus = async () => {
      try {
        const res = await fetch('/api/whatsapp/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiUrl: whatsAppConfig.api_url || 'https://evolution-api-production-ed7c.up.railway.app',
            apiKey: whatsAppConfig.api_key || '68A885CD-5F29-4269-949C-8AEB4D149393',
            instanceName: whatsAppConfig.nome_instancia || 'gestup'
          })
        });
        const data = await res.json();
        if (data?.success && data.state === 'open') {
          setWhatsAppConfig(prev => {
            const updated = {
              ...prev,
              conectado: true,
              status: 'CONNECTED' as const,
              numero_conectado: data.ownerFormatted || prev.numero_conectado || '+55 (19) 99208-0639',
              ultima_sincronizacao: new Date().toLocaleString('pt-BR')
            };
            try { localStorage.setItem('gestup_v2_whatsapp_config', JSON.stringify(updated)); } catch {}
            return updated;
          });
        } else {
          setWhatsAppConfig(prev => {
            const updated = {
              ...prev,
              conectado: false,
              status: 'DISCONNECTED' as const,
              ultima_sincronizacao: data?.error || 'Offline (Servidor da Evolution API não encontrado)'
            };
            try { localStorage.setItem('gestup_v2_whatsapp_config', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }
      } catch (err) {
        setWhatsAppConfig(prev => {
          const updated = {
            ...prev,
            conectado: false,
            status: 'DISCONNECTED' as const,
            ultima_sincronizacao: 'Falha de conexão com a API'
          };
          try { localStorage.setItem('gestup_v2_whatsapp_config', JSON.stringify(updated)); } catch {}
          return updated;
        });
        console.warn('Verificação de status do WhatsApp:', err);
      }
    };
    syncStatus();
  }, [whatsAppConfig.api_url, whatsAppConfig.api_key, whatsAppConfig.nome_instancia]);

  // Monitoramento e Disparo Automático de Mensagens Agendadas no CRM
  useEffect(() => {
    const verificarMensagensAgendadas = async () => {
      const agora = new Date();
      let houveAtualizacao = false;

      const leadsAtualizados = await Promise.all(
        leads.map(async (l) => {
          if (l.mensagem_agendada && l.mensagem_agendada.status === 'Agendada' && l.mensagem_agendada.data_hora_agendada) {
            const dt = parseDataHoraAgendada(l.mensagem_agendada.data_hora_agendada);
            // Se o horário agendado chegou (ou já passou do horário estipulado)
            if (dt && agora.getTime() >= dt.getTime()) {
              houveAtualizacao = true;
              if (l.mensagem_agendada.telefone && l.mensagem_agendada.mensagem) {
                try {
                  await enviarMensagemWhatsApp(
                    'Lead',
                    l.nome,
                    l.mensagem_agendada.telefone,
                    'Lembrete Prazo',
                    l.mensagem_agendada.mensagem,
                    l.id
                  );
                } catch {}
              }
              return {
                ...l,
                mensagem_agendada: {
                  ...l.mensagem_agendada,
                  status: 'Enviada' as const,
                  data_hora_agendada: `${l.mensagem_agendada.data_hora_agendada} (Disparada às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`
                }
              };
            }
          }
          return l;
        })
      );

      if (houveAtualizacao) {
        saveLeads(leadsAtualizados);
      }
    };

    const interval = setInterval(verificarMensagensAgendadas, 15000);
    return () => clearInterval(interval);
  }, [leads]);

  const saveTarefas = (newTarefas: Tarefa[]) => {
    setTarefas(newTarefas);
    try { localStorage.setItem('gestup_v2_tarefas', JSON.stringify(newTarefas)); } catch {}
  };

  const saveColaboradores = (newColabs: Colaborador[]) => {
    setColaboradores(newColabs);
    try { localStorage.setItem('gestup_v2_colaboradores', JSON.stringify(newColabs)); } catch {}
  };

  const saveClientes = (newClientes: Cliente[]) => {
    setClientes(newClientes);
    try { localStorage.setItem('gestup_v2_clientes', JSON.stringify(newClientes)); } catch {}
  };

  const saveDeclaracoes = (newDecs: Declaracao[]) => {
    setDeclaracoes(newDecs);
    try { localStorage.setItem('gestup_v2_declaracoes', JSON.stringify(newDecs)); } catch {}
  };

  const saveContasPagar = (newPagar: ContaPagar[]) => {
    setContasPagar(newPagar);
    try { localStorage.setItem('gestup_v2_contas_pagar', JSON.stringify(newPagar)); } catch {}
  };

  const saveContasReceber = (newReceber: ContaReceber[]) => {
    setContasReceber(newReceber);
    try { localStorage.setItem('gestup_v2_contas_receber', JSON.stringify(newReceber)); } catch {}
  };

  const saveHonorarios = (newHons: HonorarioItem[]) => {
    setHonorarios(newHons);
    try { localStorage.setItem('gestup_v2_honorarios', JSON.stringify(newHons)); } catch {}
  };

  const saveContasBancarias = (newContas: ContaBancaria[]) => {
    setContasBancarias(newContas);
    try { localStorage.setItem('gestup_v2_contas_bancarias', JSON.stringify(newContas)); } catch {}
  };

  const saveHistoricoAjustes = (newHist: HistoricoAjusteSaldo[]) => {
    setHistoricoAjustesSaldo(newHist);
    try { localStorage.setItem('gestup_v2_historico_ajustes_saldo', JSON.stringify(newHist)); } catch {}
  };

  const saveLeads = (newLeads: CRMLead[]) => {
    setLeads(newLeads);
    try { localStorage.setItem('gestup_v2_leads', JSON.stringify(newLeads)); } catch {}
  };

  const deleteContaPagar = (id: string) => {
    saveContasPagar(contasPagar.filter(cp => cp.id !== id));
  };

  const addContaBancaria = (conta: Omit<ContaBancaria, 'id'>) => {
    const nova: ContaBancaria = {
      ...conta,
      id: `banco-${Date.now()}`
    };
    saveContasBancarias([...contasBancarias, nova]);
  };

  const ajustarSaldoConta = (contaId: string, novoSaldo: number, motivo: string, responsavel = 'Guilherme') => {
    const agora = new Date().toLocaleString('pt-BR');
    let saldoAnt = 0;
    let nomeConta = 'Conta Bancária';

    const atualizadas = contasBancarias.map(c => {
      if (c.id === contaId) {
        saldoAnt = c.saldo_atual;
        nomeConta = c.nome;
        return {
          ...c,
          saldo_atual: novoSaldo,
          data_ultimo_ajuste: agora,
          observacoes: motivo ? `${c.observacoes || ''}\n[${agora}] Ajuste para R$ ${novoSaldo.toFixed(2)}: ${motivo}` : c.observacoes
        };
      }
      return c;
    });

    saveContasBancarias(atualizadas);

    const novoHistorico: HistoricoAjusteSaldo = {
      id: `ajuste-${Date.now()}`,
      conta_id: contaId,
      conta_nome: nomeConta,
      data: agora,
      saldo_anterior: saldoAnt,
      novo_saldo: novoSaldo,
      diferenca: novoSaldo - saldoAnt,
      motivo: motivo || 'Ajuste manual de saldo inicial / conciliação',
      responsavel
    };

    saveHistoricoAjustes([novoHistorico, ...historicoAjustesSaldo]);
  };

  // Redefine todo o módulo financeiro: zera passados e mantém estritamente 10/2026 para frente
  const redefinirFinanceiro = () => {
    setHonorarios(initialHonorarios);
    setContasPagar([]);
    setContasReceber([]);
    setContasBancarias(initialContasBancarias);
    setHistoricoAjustesSaldo([]);
    setLeads(initialLeads);
    try {
      localStorage.setItem('gestup_v2_honorarios', JSON.stringify(initialHonorarios));
      localStorage.setItem('gestup_v2_contas_pagar', JSON.stringify([]));
      localStorage.setItem('gestup_v2_contas_receber', JSON.stringify([]));
      localStorage.setItem('gestup_v2_contas_bancarias', JSON.stringify(initialContasBancarias));
      localStorage.removeItem('gestup_v2_historico_ajustes_saldo');
    } catch {}
  };

  const redefinirDadosPadrao = () => {
    try {
      localStorage.clear();
    } catch {}
    setClientes(initialClientes.map(enrichCliente));
    setTarefas(initialTarefas.map(enrichTarefa));
    setDeclaracoes((initialDeclaracoes as Declaracao[]).map(enrichDeclaracao));
    setContasPagar([]);
    setContasReceber([]);
    setHonorarios(initialHonorarios);
    setContasBancarias(initialContasBancarias);
    setHistoricoAjustesSaldo([]);
    setLeads(initialLeads);
  };

  // ================= TAREFAS =================
  const addTarefa = (tarefa: Omit<Tarefa, 'id' | 'created_at'>) => {
    const nova: Tarefa = {
      ...tarefa,
      id: `tar-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    const tarefaEnriquecida = enrichTarefa(nova);
    setTarefas(prev => {
      const updated = [tarefaEnriquecida, ...prev];
      try { localStorage.setItem('gestup_v2_tarefas', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const updateTarefa = (id: string, updates: Partial<Tarefa>) => {
    setTarefas(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      try { localStorage.setItem('gestup_v2_tarefas', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const deleteTarefa = (id: string) => {
    setTarefas(prev => {
      const updated = prev.filter(t => t.id !== id);
      try { localStorage.setItem('gestup_v2_tarefas', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const moverTarefaStatus = (tarefaId: string, novoStatus: StatusTarefa) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    if (novoStatus === 'Concluída') {
      concluirTarefa(tarefaId);
    } else {
      updateTarefa(tarefaId, { status: novoStatus });
    }
  };

  // Modelos de Mensagens por Tarefa
  const salvarModeloMensagem = (modelo: ModeloMensagemTarefa) => {
    setModelosMensagens(prev => {
      const existe = prev.some(m => m.id === modelo.id);
      const updated = existe ? prev.map(m => m.id === modelo.id ? modelo : m) : [...prev, modelo];
      try {
        localStorage.setItem('gestup_v2_modelos_mensagens', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const restaurarModelosMensagensPadrao = () => {
    setModelosMensagens(initialModelosMensagens);
    try {
      localStorage.setItem('gestup_v2_modelos_mensagens', JSON.stringify(initialModelosMensagens));
    } catch {}
  };

  const obterModeloMensagemParaTarefa = (tarefa: Tarefa): ModeloMensagemTarefa => {
    const tituloLower = (tarefa.titulo || '').toLowerCase();
    const depto = tarefa.categoria;

    // 1. Procura por palavra-chave específica (ex: "simples nacional", "das")
    const porPalavra = modelosMensagens.find(m =>
      m.palavras_chave?.some(p => tituloLower.includes(p.toLowerCase()))
    );
    if (porPalavra) return porPalavra;

    // 2. Procura por categoria
    if (depto === 'Fiscal') {
      const modFiscal = modelosMensagens.find(m => m.tipo_chave === 'simples_nacional' || m.categoria_tarefa === 'Fiscal');
      if (modFiscal) return modFiscal;
    } else if (depto === 'Pessoal') {
      const modPessoal = modelosMensagens.find(m => m.tipo_chave === 'folha_pagamento' || m.categoria_tarefa === 'Pessoal');
      if (modPessoal) return modPessoal;
    } else if (depto === 'Contábil') {
      const modContabil = modelosMensagens.find(m => m.tipo_chave === 'honorarios' || m.categoria_tarefa === 'Contábil');
      if (modContabil) return modContabil;
    }

    // 3. Fallback para o modelo padrão geral
    return modelosMensagens.find(m => m.tipo_chave === 'padrao') || modelosMensagens[0] || initialModelosMensagens[0];
  };

  // Domínio público seguro para links enviados via WhatsApp ao cliente (evita localhost)
  const getDominioPublicoSeguro = () => {
    const custom = whatsAppConfig.dominio_publico?.trim();
    if (custom && !custom.includes('localhost') && !custom.includes('127.0.0.1')) {
      return custom.replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1') && !origin.includes(':3000')) {
        return origin;
      }
    }
    return 'https://gestup.vercel.app';
  };

  const formatarMensagemGuiaTarefa = (
    tarefa: Tarefa,
    dadosGuia: { dataVencimento?: string; valor?: number; arquivoNome?: string },
    nomeContato?: string,
    modeloCustomizado?: ModeloMensagemTarefa
  ): string => {
    const modelo = modeloCustomizado || obterModeloMensagemParaTarefa(tarefa);
    const cliente = clientes.find(c => c.id === tarefa.cliente_id);
    const nomeEmpresa = cliente?.nome || tarefa.cliente_nome || 'Sua Empresa';
    const dtRaw = dadosGuia.dataVencimento || '';
    const vencFormatado = dtRaw.includes('-')
      ? dtRaw.split('-').reverse().join('/')
      : (dtRaw || 'A definir');
    const valorFormatado = dadosGuia.valor
      ? `R$ ${dadosGuia.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : 'Conforme Documento';
    const nomeArq = dadosGuia.arquivoNome || 'Guia_Pagamento.pdf';
    const contato = nomeContato || cliente?.nome || 'Prezado Cliente';

    const baseUrl = getDominioPublicoSeguro();
    const link = `${baseUrl}/portal/guia?id=${tarefa.id}&arquivo=${encodeURIComponent(nomeArq)}&comp=${encodeURIComponent(tarefa.competencia)}&cli=${encodeURIComponent(nomeEmpresa)}&venc=${encodeURIComponent(vencFormatado)}&val=${encodeURIComponent(dadosGuia.valor || '')}&tipo=${encodeURIComponent(tarefa.titulo)}`;

    let texto = modelo.texto_template;
    texto = texto.replace(/\{razao_social\}/g, nomeEmpresa);
    texto = texto.replace(/\{empresa\}/g, nomeEmpresa);
    texto = texto.replace(/\{competencia\}/g, tarefa.competencia || '10/2026');
    texto = texto.replace(/\{vencimento_guia\}/g, vencFormatado);
    texto = texto.replace(/\{valor_guia\}/g, valorFormatado);
    texto = texto.replace(/\{nome_tarefa\}/g, tarefa.titulo);
    texto = texto.replace(/\{obrigacao\}/g, tarefa.titulo);
    texto = texto.replace(/\{nome_contato\}/g, contato);
    texto = texto.replace(/\{link_guia\}/g, link);
    texto = texto.replace(/\{nome_arquivo\}/g, nomeArq);

    return texto;
  };

  const anexarArquivoTarefa = (tarefaId: string, arquivo: Omit<ArquivoEtapa, 'id' | 'data_upload'>) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const novoArq: ArquivoEtapa = {
      ...arquivo,
      id: `arq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      data_upload: new Date().toISOString()
    };
    const listaAtual = tarefa.arquivos_anexos || [];
    updateTarefa(tarefaId, { arquivos_anexos: [novoArq, ...listaAtual] });
  };

  const removerArquivoTarefa = (tarefaId: string, arquivoId: string) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const lista = (tarefa.arquivos_anexos || []).filter(a => a.id !== arquivoId);
    updateTarefa(tarefaId, { arquivos_anexos: lista });
  };

  const concluirTarefa = async (
    id: string,
    dadosGuia?: {
      ehPagamento: boolean;
      arquivoNome?: string;
      arquivoConteudo?: string;
      arquivoTamanho?: string;
      dataVencimento?: string;
      valor?: number;
      mensagemPersonalizada?: string;
    }
  ) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) {
      return {
        sucesso: false,
        ehPagamento: false,
        whatsAppEnviado: false,
        clienteNome: '',
        erroWhats: 'Tarefa não encontrada'
      };
    }

    const cliente = clientes.find(c => c.id === tarefa.cliente_id);
    let guiaInfo = undefined;
    let houveEnvioSucesso = false;
    let fallbackWhatsAppWebUrl = '';
    let msgFinalWhats = '';
    let telFinalWhats = '';
    const nomeClienteAlvo = cliente?.nome || tarefa.cliente_nome;
    const clienteWhats = (cliente?.whatsapp || cliente?.telefone || '').trim();

    if (dadosGuia?.ehPagamento && dadosGuia.arquivoNome && dadosGuia.dataVencimento) {
      const enviarWhats = cliente?.receber_guias_whatsapp !== false;
      const clienteEmail = cliente?.email || '';

      const baseUrl = getDominioPublicoSeguro();
      const nomeArquivoGuia = dadosGuia.arquivoNome || 'guia.pdf';
      const linkPortalGuia = `${baseUrl}/portal/guia?id=${tarefa.id}&arquivo=${encodeURIComponent(nomeArquivoGuia)}&comp=${encodeURIComponent(tarefa.competencia)}&cli=${encodeURIComponent(nomeClienteAlvo)}&venc=${encodeURIComponent(dadosGuia.dataVencimento)}&val=${encodeURIComponent(dadosGuia.valor || '')}&tipo=${encodeURIComponent(tarefa.titulo)}`;

      // 1. Salva a guia no servidor central (/api/guias) para estar acessível em qualquer dispositivo
      try {
        fetch('/api/guias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: tarefa.id,
            arquivoNome: nomeArquivoGuia,
            arquivoConteudo: dadosGuia.arquivoConteudo,
            arquivoTamanho: dadosGuia.arquivoTamanho,
            cliente: nomeClienteAlvo,
            competencia: tarefa.competencia,
            valor: dadosGuia.valor,
            vencimento: dadosGuia.dataVencimento,
            tipo: tarefa.titulo
          })
        }).catch(err => console.warn('[App] Aviso ao salvar guia no servidor:', err));
      } catch (err) {}

      guiaInfo = {
        arquivo_nome: nomeArquivoGuia,
        arquivo_url: linkPortalGuia,
        arquivo_conteudo: dadosGuia.arquivoConteudo,
        arquivo_tamanho: dadosGuia.arquivoTamanho,
        data_vencimento: dadosGuia.dataVencimento,
        valor: dadosGuia.valor,
        enviado_email: true,
        enviado_whatsapp: enviarWhats && !!clienteWhats,
        email_destinatario: clienteEmail,
        telefone_destinatario: clienteWhats,
        data_envio: new Date().toISOString()
      };

      // Dispara WhatsApp priorizando SEMPRE o número oficial de WhatsApp do cadastro da empresa
      if (enviarWhats) {
        // O destinatário de referência para exibição e WhatsApp Web é SEMPRE o WhatsApp oficial da empresa
        telFinalWhats = clienteWhats;

        const contatosAlvo: Array<{ id: string; nome: string; telefoneOuGrupo: string }> = [];
        if (clienteWhats) {
          contatosAlvo.push({
            id: `ct-princ-${tarefa.cliente_id}`,
            nome: cliente?.responsavel || nomeClienteAlvo,
            telefoneOuGrupo: clienteWhats
          });
        }

        // Adiciona contatos adicionais válidos (se houver, e não sendo fake placeholders ou grupos simulados)
        if (cliente?.contatos_notificacao) {
          for (const ct of cliente.contatos_notificacao) {
            const cleanCt = (ct.telefoneOuGrupo || '').trim();
            if (
              cleanCt &&
              cleanCt !== clienteWhats &&
              !cleanCt.includes('@g.us') &&
              !cleanCt.includes('19999990000') &&
              !cleanCt.includes('19992803902')
            ) {
              contatosAlvo.push({
                id: ct.id,
                nome: ct.nome || nomeClienteAlvo,
                telefoneOuGrupo: cleanCt
              });
            }
          }
        }

        // Fallback de segurança se contatosAlvo estiver vazio
        if (contatosAlvo.length === 0 && clienteWhats) {
          contatosAlvo.push({
            id: 'padrao',
            nome: nomeClienteAlvo,
            telefoneOuGrupo: clienteWhats
          });
        }

        for (const ct of contatosAlvo) {
          const msgTexto = dadosGuia.mensagemPersonalizada
            ? dadosGuia.mensagemPersonalizada
            : formatarMensagemGuiaTarefa(
                tarefa,
                {
                  dataVencimento: dadosGuia.dataVencimento,
                  valor: dadosGuia.valor,
                  arquivoNome: nomeArquivoGuia
                },
                ct.nome
              );

          msgFinalWhats = msgTexto;

          const resultadoOk = await enviarMensagemWhatsApp(
            'Cliente',
            `${nomeClienteAlvo} (${ct.nome})`,
            ct.telefoneOuGrupo,
            'Documento Pendente',
            msgTexto,
            tarefa.id,
            {
              media: dadosGuia.arquivoConteudo,
              fileName: nomeArquivoGuia
            }
          );

          if (resultadoOk) {
            houveEnvioSucesso = true;
          }
        }

        // Gera a URL do WhatsApp Web usando rigorosamente o WhatsApp oficial cadastrado da empresa
        let cleanTel = (clienteWhats || telFinalWhats).replace(/\D/g, '');
        if (cleanTel.length === 10 || cleanTel.length === 11) {
          cleanTel = `55${cleanTel}`;
        }

        if (cleanTel.length >= 10) {
          fallbackWhatsAppWebUrl = `https://api.whatsapp.com/send?phone=${cleanTel}&text=${encodeURIComponent(msgFinalWhats)}`;
        }
      }
    }

    const novosAnexos = [...(tarefa.arquivos_anexos || [])];
    if (dadosGuia?.arquivoNome) {
      novosAnexos.unshift({
        id: `arq-${Date.now()}`,
        nome: dadosGuia.arquivoNome,
        url: guiaInfo?.arquivo_url || '#',
        conteudo: dadosGuia.arquivoConteudo,
        tamanho: dadosGuia.arquivoTamanho || '1.2 MB',
        data_upload: new Date().toISOString()
      });
    }

    updateTarefa(id, {
      status: 'Concluída',
      data_conclusao: new Date().toISOString().split('T')[0],
      eh_pagamento: dadosGuia?.ehPagamento || false,
      guia_pagamento: guiaInfo,
      arquivos_anexos: novosAnexos
    });

    promoverProcessoAdmissaoParaDP({
      ...tarefa,
      status: 'Concluída',
      arquivos_anexos: novosAnexos
    });

    return {
      sucesso: true,
      ehPagamento: Boolean(dadosGuia?.ehPagamento),
      whatsAppEnviado: houveEnvioSucesso,
      clienteNome: nomeClienteAlvo,
      telefoneDestinatario: clienteWhats || telFinalWhats,
      mensagemTexto: msgFinalWhats,
      linkPortalGuia: guiaInfo?.arquivo_url,
      fallbackWhatsAppWebUrl,
      erroWhats: !houveEnvioSucesso && dadosGuia?.ehPagamento
        ? 'A Evolution API não conseguiu entregar a mensagem (servidor offline ou retorno 404). Você pode disparar diretamente pelo WhatsApp Web.'
        : undefined
    };
  };

  const prorrogarTarefa = (id: string, novoPrazoMeta: string, motivo: string) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    const observacoesAtualizadas = tarefa.observacoes
      ? `${tarefa.observacoes}\n[Prorrogação para ${novoPrazoMeta}: ${motivo}]`
      : `[Prorrogação para ${novoPrazoMeta}: ${motivo}]`;

    updateTarefa(id, {
      data_prazo_meta: novoPrazoMeta,
      observacoes: observacoesAtualizadas,
      prorrogacoes_count: (tarefa.prorrogacoes_count || 0) + 1
    });

    enviarMensagemWhatsApp(
      'Colaborador',
      tarefa.responsavel,
      '5511987650000',
      'Lembrete Prazo',
      `📌 *Prazo Prorrogado:* A tarefa "${tarefa.titulo}" de ${tarefa.cliente_nome} teve o prazo meta alterado para ${novoPrazoMeta}. Motivo: ${motivo}`,
      tarefa.id
    );
  };

  const adicionarComentarioTarefa = (id: string, autor: string, texto: string) => {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    const agora = new Date();
    const dataHoraFormatada = `${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const novoComentario = {
      id: `com-${Date.now()}`,
      autor,
      data: dataHoraFormatada,
      texto
    };

    const listaAtual = tarefa.comentarios_lista || [];
    updateTarefa(id, {
      comentarios_lista: [novoComentario, ...listaAtual]
    });
  };

  // ================= GESTÃO DE PROCESSOS EM TAREFAS =================
  const toggleProcessoTarefa = (tarefaId: string, ehProcesso: boolean) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const cliAlvo = clientes.find(c => c.id === tarefa.cliente_id);
    const telOficialCli = (cliAlvo?.whatsapp || cliAlvo?.telefone || '').trim();
    let etapas = tarefa.etapas_processo || [];
    if (ehProcesso && etapas.length === 0) {
      etapas = [
        {
          id: `etp-${Date.now()}-1`,
          titulo: '1. Solicitação e Recebimento de Documentos',
          descricao: 'Requisitar documentação necessária junto ao cliente',
          ordem: 1,
          data_limite: tarefa.data_prazo_meta,
          concluida: false,
          arquivos: [],
          cobrar_whatsapp: true,
          configuracao_cobranca: {
            habilitado: true,
            telefones: telOficialCli ? [telOficialCli] : [],
            mensagem_padrao: `Olá {cliente}! Lembramos que a etapa *{etapa}* referente à *{empresa}* tem data limite até *{data_limite}*. Favor nos enviar para finalizarmos no prazo.`,
            frequencia: 'Diariamente',
            horario_envio: '08:00'
          }
        },
        {
          id: `etp-${Date.now()}-2`,
          titulo: '2. Análise Técnica e Execução',
          descricao: 'Processamento fiscal/contábil da rotina',
          ordem: 2,
          data_limite: tarefa.data_prazo_legal,
          concluida: false,
          arquivos: [],
          cobrar_whatsapp: false
        }
      ];
    }
    updateTarefa(tarefaId, { eh_processo: ehProcesso, etapas_processo: etapas });
  };

  const adicionarEtapaProcesso = (tarefaId: string, etapaData: Omit<EtapaProcessoTarefa, 'id' | 'concluida'>) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const novaEtapa: EtapaProcessoTarefa = {
      ...etapaData,
      id: `etp-${Date.now()}`,
      concluida: false,
      arquivos: etapaData.arquivos || []
    };
    const etapasAtuais = tarefa.etapas_processo || [];
    updateTarefa(tarefaId, {
      eh_processo: true,
      etapas_processo: [...etapasAtuais, novaEtapa]
    });
  };

  const atualizarEtapaProcesso = (tarefaId: string, etapaId: string, updates: Partial<EtapaProcessoTarefa>) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const etapasAtuais = (tarefa.etapas_processo || []).map(e => e.id === etapaId ? { ...e, ...updates } : e);
    updateTarefa(tarefaId, { etapas_processo: etapasAtuais });
  };

  const alternarConclusaoEtapa = (tarefaId: string, etapaId: string) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const agora = new Date().toLocaleString('pt-BR');
    let nomeEtapa = '';
    let virouConcluida = false;

    const etapasAtuais = (tarefa.etapas_processo || []).map(e => {
      if (e.id === etapaId) {
        virouConcluida = !e.concluida;
        nomeEtapa = e.titulo;
        return {
          ...e,
          concluida: virouConcluida,
          data_conclusao: virouConcluida ? agora : undefined
        };
      }
      return e;
    });

    const textoLog = virouConcluida
      ? `✅ Etapa "${nomeEtapa}" marcada como Concluída. Cobranças automáticas via WhatsApp das 08h foram INTERROMPIDAS.`
      : `🔄 Etapa "${nomeEtapa}" reaberta. Cobranças automáticas via WhatsApp reativadas conforme agendamento.`;

    adicionarComentarioTarefa(tarefaId, 'Robô de Processos GestUp', textoLog);
    const todasConcluidas = etapasAtuais.every(e => e.concluida);
    if (todasConcluidas && virouConcluida) {
      updateTarefa(tarefaId, {
        status: 'Concluída',
        data_conclusao: new Date().toISOString().split('T')[0],
        etapas_processo: etapasAtuais
      });
      promoverProcessoAdmissaoParaDP({ ...tarefa, etapas_processo: etapasAtuais, status: 'Concluída' });
    } else {
      updateTarefa(tarefaId, { etapas_processo: etapasAtuais });
    }
  };

  const excluirEtapaProcesso = (tarefaId: string, etapaId: string) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const etapasAtuais = (tarefa.etapas_processo || []).filter(e => e.id !== etapaId);
    updateTarefa(tarefaId, { etapas_processo: etapasAtuais });
  };

  const anexarArquivoEtapa = (tarefaId: string, etapaId: string, arquivo: Omit<ArquivoEtapa, 'id' | 'data_upload'>) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const novoArquivo: ArquivoEtapa = {
      ...arquivo,
      id: `arq-${Date.now()}`,
      data_upload: new Date().toISOString().split('T')[0]
    };
    const etapasAtuais = (tarefa.etapas_processo || []).map(e => {
      if (e.id === etapaId) {
        return { ...e, arquivos: [...(e.arquivos || []), novoArquivo] };
      }
      return e;
    });
    updateTarefa(tarefaId, { etapas_processo: etapasAtuais });
  };

  const removerArquivoEtapa = (tarefaId: string, etapaId: string, arquivoId: string) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const etapasAtuais = (tarefa.etapas_processo || []).map(e => {
      if (e.id === etapaId) {
        return { ...e, arquivos: (e.arquivos || []).filter(a => a.id !== arquivoId) };
      }
      return e;
    });
    updateTarefa(tarefaId, { etapas_processo: etapasAtuais });
  };

  const configurarCobrancaWhatsAppEtapa = (tarefaId: string, etapaId: string, config: ConfiguracaoCobrancaEtapa) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const etapasAtuais = (tarefa.etapas_processo || []).map(e => {
      if (e.id === etapaId) {
        return {
          ...e,
          cobrar_whatsapp: config.habilitado,
          configuracao_cobranca: config
        };
      }
      return e;
    });
    updateTarefa(tarefaId, { etapas_processo: etapasAtuais });
  };

  const dispararCobrancaEtapaWhatsApp = (tarefaId: string, etapaId: string) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const etapa = (tarefa.etapas_processo || []).find(e => e.id === etapaId);
    if (!etapa || !etapa.configuracao_cobranca) return;

    const cfg = etapa.configuracao_cobranca;
    const cliente = clientes.find(c => c.id === tarefa.cliente_id);
    const nomeCliente = cliente?.responsavel || tarefa.cliente_nome.split(' ')[0] || 'Cliente';

    let textoMsg = cfg.mensagem_padrao
      .replace(/\{cliente\}/g, nomeCliente)
      .replace(/\{empresa\}/g, tarefa.cliente_nome)
      .replace(/\{etapa\}/g, etapa.titulo)
      .replace(/\{data_limite\}/g, etapa.data_limite || tarefa.data_prazo_meta);

    // Gera o link de retorno do processo para o cliente comentar ou anexar documentos
    const baseUrl = getDominioPublicoSeguro();
    const linkRetornoProcesso = `${baseUrl}/portal/processo?t=${tarefa.id}&e=${etapa.id}`;

    if (!textoMsg.includes('/portal/processo')) {
      textoMsg += `\n\n🔗 *Acesse o link seguro para anexar documentos ou responder:* \n${linkRetornoProcesso}`;
    }

    cfg.telefones.forEach((tel, idx) => {
      if (tel && tel.trim().length > 6) {
        enviarMensagemWhatsApp(
          'Cliente',
          `${tarefa.cliente_nome} (Contato ${idx + 1})`,
          tel,
          'Cobrança Atraso',
          `🔔 *Lembrete de Etapa - fin.up (08:00h)*\n\n${textoMsg}`,
          etapa.id
        );
      }
    });

    const agora = new Date().toLocaleString('pt-BR');
    const etapasAtualizadas = (tarefa.etapas_processo || []).map(e => {
      if (e.id === etapaId && e.configuracao_cobranca) {
        return {
          ...e,
          configuracao_cobranca: {
            ...e.configuracao_cobranca,
            ultimo_envio: agora,
            total_envios: (e.configuracao_cobranca.total_envios || 0) + 1
          }
        };
      }
      return e;
    });
    updateTarefa(tarefaId, { etapas_processo: etapasAtualizadas });
  };

  // Retorno enviado pelo cliente via link do WhatsApp para a subtarefa
  const adicionarRetornoClienteSubtarefa = (
    tarefaId: string,
    etapaId: string,
    retorno: { autor_cliente: string; comentario?: string; arquivos: ArquivoEtapa[] }
  ) => {
    const agora = new Date().toLocaleString('pt-BR');
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;

    const novoRetorno: RetornoClienteSubtarefa = {
      id: `ret-${Date.now()}`,
      data: agora,
      autor_cliente: retorno.autor_cliente,
      comentario: retorno.comentario,
      arquivos: retorno.arquivos || []
    };

    const etapasAtualizadas = (tarefa.etapas_processo || []).map(e => {
      if (e.id === etapaId) {
        return {
          ...e,
          arquivos: [...(e.arquivos || []), ...(retorno.arquivos || [])],
          retornos_cliente: [...(e.retornos_cliente || []), novoRetorno]
        };
      }
      return e;
    });

    const detalheRetorno = `📥 Retorno recebido do cliente (${retorno.autor_cliente}) na etapa: ${retorno.comentario ? `"${retorno.comentario}"` : 'Sem comentário adicional.'} ${retorno.arquivos?.length ? `(${retorno.arquivos.length} arquivo(s) anexado(s))` : ''}`;

    const novosComentarios = [
      ...(tarefa.comentarios_lista || []),
      {
        id: `com-${Date.now()}`,
        autor: `Cliente: ${retorno.autor_cliente}`,
        data: agora,
        texto: detalheRetorno
      }
    ];

    updateTarefa(tarefaId, {
      etapas_processo: etapasAtualizadas,
      comentarios_lista: novosComentarios
    });
  };

  // ================= ATUALIZAÇÕES & PRORROGAÇÃO DE SUBPROCESSOS (+24h COM JUSTIFICATIVA) =================
  const adicionarAtualizacaoSubprocesso = (
    tarefaId: string,
    etapaId: string,
    atualizacao: Omit<SubprocessoAtualizacao, 'id' | 'data'>
  ) => {
    const agora = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const novaAtualizacao: SubprocessoAtualizacao = {
      ...atualizacao,
      id: `at-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      data: agora
    };

    const atualizadas = tarefas.map(t => {
      if (t.id !== tarefaId) return t;
      let nomeEtapa = 'Subprocesso';
      const etapasNovas = (t.etapas_processo || []).map(ep => {
        if (ep.id !== etapaId) return ep;
        nomeEtapa = ep.titulo;
        return {
          ...ep,
          atualizacoes: [...(ep.atualizacoes || []), novaAtualizacao]
        };
      });

      const novoComentario: ComentarioItem = {
        id: `com-at-${Date.now()}`,
        texto: `📝 Atualização de status na etapa "${nomeEtapa}": ${atualizacao.texto}`,
        autor: atualizacao.autor || 'Guilherme',
        data: agora
      };

      return {
        ...t,
        etapas_processo: etapasNovas,
        comentarios_lista: [...(t.comentarios_lista || []), novoComentario]
      };
    });

    saveTarefas(atualizadas);
  };

  const prorrogarPrazoSubprocesso = (
    tarefaId: string,
    etapaId: string,
    justificativa: string,
    novoPrazoCustom?: string
  ): { sucesso: boolean; novoPrazo: string; mensagem: string } => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return { sucesso: false, novoPrazo: '', mensagem: 'Tarefa não encontrada' };
    const etapa = (tarefa.etapas_processo || []).find(e => e.id === etapaId);
    if (!etapa) return { sucesso: false, novoPrazo: '', mensagem: 'Subprocesso não encontrado' };

    const prazoAnterior = etapa.data_limite || tarefa.data_prazo_meta || new Date().toISOString().split('T')[0];

    // Calcula nova data (+24 horas = +1 dia) se não informada customizada
    let novoPrazo = novoPrazoCustom;
    if (!novoPrazo) {
      try {
        const d = new Date(prazoAnterior + 'T12:00:00');
        d.setDate(d.getDate() + 1);
        novoPrazo = d.toISOString().split('T')[0];
      } catch {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        novoPrazo = d.toISOString().split('T')[0];
      }
    }

    const agora = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const autor = 'Guilherme';

    const novaAtualizacao: SubprocessoAtualizacao = {
      id: `prorr-${Date.now()}`,
      texto: `⏰ Prazo prorrogado em +24 horas (De ${prazoAnterior} para ${novoPrazo}). Justificativa: ${justificativa}`,
      autor,
      data: agora,
      tipo: 'Prorrogação',
      justificativa,
      prazo_anterior: prazoAnterior,
      novo_prazo: novoPrazo
    };

    const novoComentario: ComentarioItem = {
      id: `com-prorr-${Date.now()}`,
      texto: `⏰ Prorrogação de 24h na etapa "${etapa.titulo}": ${justificativa} (Novo prazo: ${novoPrazo})`,
      autor,
      data: agora
    };

    const atualizadas = tarefas.map(t => {
      if (t.id !== tarefaId) return t;
      const etapasNovas = (t.etapas_processo || []).map(ep => {
        if (ep.id !== etapaId) return ep;
        return {
          ...ep,
          data_limite: novoPrazo!,
          prorrogacoes_count: (ep.prorrogacoes_count || 0) + 1,
          atualizacoes: [...(ep.atualizacoes || []), novaAtualizacao]
        };
      });

      return {
        ...t,
        prorrogacoes_count: (t.prorrogacoes_count || 0) + 1,
        etapas_processo: etapasNovas,
        comentarios_lista: [...(t.comentarios_lista || []), novoComentario]
      };
    });

    saveTarefas(atualizadas);

    return {
      sucesso: true,
      novoPrazo,
      mensagem: `Prazo da etapa "${etapa.titulo}" prorrogado com sucesso para ${novoPrazo}.`
    };
  };

  const padronizarResponsaveisCarteira = () => {
    let alteradas = 0;
    const tarefasAtualizadas = tarefas.map(t => {
      const cat = (t.categoria || '').toLowerCase();
      const tit = (t.titulo || '').toLowerCase();
      let novoResp = t.responsavel;

      if (cat.includes('fiscal') || tit.includes('das') || tit.includes('pgdas') || tit.includes('dctf') || tit.includes('tribut')) {
        novoResp = 'Guilherme';
      } else if (cat.includes('pessoal') || cat.includes('rh') || tit.includes('folha') || tit.includes('pró-labore') || tit.includes('pro-labore') || tit.includes('admissão') || tit.includes('registro') || tit.includes('samira')) {
        novoResp = 'Ygor';
      } else if (cat.includes('contábil') || cat.includes('contabil')) {
        novoResp = 'Ygor';
      }

      if (novoResp !== t.responsavel) {
        alteradas++;
      }

      const etapasAtualizadas = t.etapas_processo?.map(ep => ({
        ...ep,
        responsavel: novoResp
      }));

      return {
        ...t,
        responsavel: novoResp,
        etapas_processo: etapasAtualizadas || t.etapas_processo
      };
    });

    saveTarefas(tarefasAtualizadas);

    try {
      localStorage.setItem('gestup_v3_resp_fiscal_guilherme_rh_ygor', 'true');
    } catch {}

    return { totalAlteradas: alteradas };
  };

  // ================= GESTÃO DOCUMENTAL & PORTAL DO CLIENTE =================
  const addDocumentoPortal = (docData: Omit<DocumentoPortalCliente, 'id' | 'created_at'>) => {
    const novoDoc: DocumentoPortalCliente = {
      ...docData,
      id: `doc-p-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    saveDocumentosPortal([novoDoc, ...documentosPortal]);
  };

  const updateDocumentoPortal = (id: string, updates: Partial<DocumentoPortalCliente>) => {
    const atualizados = documentosPortal.map(d => d.id === id ? { ...d, ...updates } : d);
    saveDocumentosPortal(atualizados);
  };

  const deleteDocumentoPortal = (id: string) => {
    const atualizados = documentosPortal.filter(d => d.id !== id);
    saveDocumentosPortal(atualizados);
  };

  const addSolicitacaoPortal = (solData: Omit<SolicitacaoPortalCliente, 'id' | 'created_at'>) => {
    const novaSol: SolicitacaoPortalCliente = {
      ...solData,
      id: `sol-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    saveSolicitacoesPortal([novaSol, ...solicitacoesPortal]);
  };

  const updateSolicitacaoPortal = (id: string, updates: Partial<SolicitacaoPortalCliente>) => {
    const atualizados = solicitacoesPortal.map(s => s.id === id ? { ...s, ...updates, updated_at: new Date().toLocaleString('pt-BR') } : s);
    saveSolicitacoesPortal(atualizados);
  };

  const responderSolicitacaoPortal = (id: string, resposta: string, novoStatus: 'Em Andamento' | 'Concluída' = 'Concluída') => {
    const atualizados = solicitacoesPortal.map(s => s.id === id ? {
      ...s,
      resposta_escritorio: resposta,
      status: novoStatus,
      updated_at: new Date().toLocaleString('pt-BR')
    } : s);
    saveSolicitacoesPortal(atualizados);
  };

  // ================= CLIENTES & AUDITORIA =================
  const addCliente = (clienteData: Omit<Cliente, 'id' | 'created_at'>) => {
    const agora = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const novoCliente: Cliente = {
      ...clienteData,
      id: `cli-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0],
      historico_alteracoes: [
        {
          id: `hist-${Date.now()}`,
          data: agora,
          autor: 'Gestão fin.up',
          tipo: 'Cadastro',
          descricao: `Empresa cadastrada com honorário de R$ ${(clienteData.honorario_mensal || 0).toLocaleString('pt-BR')} (Vencimento todo dia ${clienteData.dia_vencimento || 15}).`
        }
      ]
    };
    saveClientes([novoCliente, ...clientes]);

    // Se o cliente possuir honorário mensal cadastrado, gera o lançamento financeiro em tempo real para 10/2026
    if (clienteData.honorario_mensal && clienteData.honorario_mensal > 0) {
      const diaVenc = String(clienteData.dia_vencimento || 15).padStart(2, '0');
      const novoHon: HonorarioItem = {
        id: `hon-10_2026-${novoCliente.id}-${Date.now()}`,
        cliente_id: novoCliente.id,
        cliente_nome: novoCliente.nome,
        contato_nome: novoCliente.responsavel || novoCliente.nome.split(' ')[0],
        contato_telefone: novoCliente.whatsapp || novoCliente.telefone,
        competencia: '10/2026',
        valor: clienteData.honorario_mensal,
        data_vencimento: `2026-10-${diaVenc}`,
        status: 'Pendente',
        parcela_info: 'Mensalidade 10/2026',
        created_at: new Date().toISOString().split('T')[0]
      };
      saveHonorarios([novoHon, ...honorarios]);
    }
  };

  const updateCliente = (id: string, updates: Partial<Cliente>, motivoAlteracao?: string) => {
    const agora = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const updated = clientes.map(c => {
      if (c.id !== id) return c;
      const novoHistorico = [...(c.historico_alteracoes || [])];
      if (motivoAlteracao) {
        novoHistorico.unshift({
          id: `hist-${Date.now()}`,
          data: agora,
          autor: 'Gestão fin.up',
          tipo: 'Edição',
          descricao: motivoAlteracao
        });
      }
      return {
        ...c,
        ...updates,
        historico_alteracoes: novoHistorico
      };
    });
    saveClientes(updated);

    // Sincronização em tempo real com os lançamentos de honorários no módulo Financeiro
    if (
      updates.honorario_mensal !== undefined ||
      updates.nome !== undefined ||
      updates.dia_vencimento !== undefined ||
      updates.whatsapp !== undefined ||
      updates.telefone !== undefined ||
      updates.responsavel !== undefined
    ) {
      let houveAlteracao = false;
      const clienteOriginal = clientes.find(c => c.id === id);
      const nomeOriginalNorm = (clienteOriginal?.nome || '').trim().toLowerCase();
      const novoTel = updates.whatsapp !== undefined ? updates.whatsapp : updates.telefone;

      const updatedHons = honorarios.map(h => {
        const mesmoCliente = h.cliente_id === id || (nomeOriginalNorm && (h.cliente_nome || '').trim().toLowerCase() === nomeOriginalNorm);
        if (mesmoCliente) {
          houveAlteracao = true;
          let novaDataVenc = h.data_vencimento;
          if (h.status !== 'Pago' && updates.dia_vencimento !== undefined && h.data_vencimento) {
            const parts = h.data_vencimento.split('-');
            if (parts.length === 3) {
              novaDataVenc = `${parts[0]}-${parts[1]}-${String(updates.dia_vencimento).padStart(2, '0')}`;
            }
          }
          return {
            ...h,
            cliente_id: id,
            cliente_nome: updates.nome !== undefined ? updates.nome : h.cliente_nome,
            valor: h.status !== 'Pago' && updates.honorario_mensal !== undefined ? updates.honorario_mensal : h.valor,
            data_vencimento: novaDataVenc,
            contato_telefone: novoTel !== undefined ? novoTel : h.contato_telefone,
            contato_nome: updates.responsavel !== undefined ? updates.responsavel : h.contato_nome
          };
        }
        return h;
      });

      // Se o cliente tem honorário mensal e ainda não tem lançamento em 10/2026, cria imediatamente
      const jaTemHon10 = updatedHons.some(h => h.cliente_id === id && h.competencia === '10/2026');
      if (!jaTemHon10 && updates.honorario_mensal && updates.honorario_mensal > 0) {
        const clienteAlvo = updated.find(c => c.id === id);
        if (clienteAlvo && clienteAlvo.status === 'Ativo') {
          const diaVenc = String(updates.dia_vencimento || clienteAlvo.dia_vencimento || 15).padStart(2, '0');
          updatedHons.unshift({
            id: `hon-10_2026-${id}-${Date.now()}`,
            cliente_id: id,
            cliente_nome: updates.nome || clienteAlvo.nome,
            contato_nome: updates.responsavel || clienteAlvo.responsavel || clienteAlvo.nome.split(' ')[0],
            contato_telefone: updates.whatsapp || clienteAlvo.whatsapp || clienteAlvo.telefone,
            competencia: '10/2026',
            valor: updates.honorario_mensal,
            data_vencimento: `2026-10-${diaVenc}`,
            status: 'Pendente',
            parcela_info: 'Mensalidade 10/2026',
            created_at: new Date().toISOString().split('T')[0]
          });
          houveAlteracao = true;
        }
      }

      if (houveAlteracao) {
        saveHonorarios(updatedHons);
      }
    }
  };

  const alternarStatusCliente = (id: string) => {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return;
    const novoStatus = cliente.status === 'Ativo' ? 'Inativo' : 'Ativo';
    updateCliente(id, { status: novoStatus }, `Status da empresa alterado para ${novoStatus}.`);
  };

  const adicionarContatoNotificacao = (clienteId: string, contato: Omit<ContatoNotificacao, 'id'>) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    const novoContato: ContatoNotificacao = {
      ...contato,
      id: `ct-${Date.now()}`
    };
    const lista = cliente.contatos_notificacao || [];
    updateCliente(clienteId, { contatos_notificacao: [...lista, novoContato] }, `Adicionado contato de notificação: ${contato.nome} (${contato.tipo}: ${contato.telefoneOuGrupo}).`);
  };

  const removerContatoNotificacao = (clienteId: string, contatoId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    const lista = (cliente.contatos_notificacao || []).filter(ct => ct.id !== contatoId);
    updateCliente(clienteId, { contatos_notificacao: lista }, `Removido contato de notificação WhatsApp.`);
  };

  const vincularDeclaracaoCliente = (clienteId: string, declaracao: DeclaracaoVinculadaCliente) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;

    const listaAtual = cliente.declaracoes_vinculadas || [];
    const novaLista = [...listaAtual, declaracao];

    updateCliente(
      clienteId,
      { declaracoes_vinculadas: novaLista },
      `Vinculada obrigação ${declaracao.titulo} (Periodicidade: ${declaracao.periodicidade}, Vencimento dia ${declaracao.dia_vencimento}).`
    );

    // ALIMENTA AUTOMATICAMENTE O MENU 01 DE TAREFAS!
    const compAtual = '10/2026';
    const prazoMetaStr = `2026-10-${String(Math.max(1, declaracao.dia_vencimento - 3)).padStart(2, '0')}`;
    const prazoLegalStr = `2026-10-${String(declaracao.dia_vencimento).padStart(2, '0')}`;

    addTarefa({
      titulo: declaracao.titulo,
      descricao: `Obrigação acessória automática vinculada ao contrato de ${cliente.nome}`,
      tipo: 'Recorrente',
      status: 'Pendente',
      prioridade: 'Alta',
      cliente_id: cliente.id,
      cliente_nome: cliente.nome,
      responsavel: cliente.responsavel || 'Guilherme',
      data_prazo_meta: prazoMetaStr,
      data_prazo_legal: prazoLegalStr,
      categoria: 'Fiscal',
      competencia: compAtual,
      tempo_gasto_minutos: 0,
      recorrencia_tipo: declaracao.periodicidade === 'Mensal' ? 'Mensal' : 'Anual'
    });
  };

  const desvincularDeclaracaoCliente = (clienteId: string, declaracaoId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    const lista = (cliente.declaracoes_vinculadas || []).filter(d => d.declaracao_id !== declaracaoId);
    updateCliente(clienteId, { declaracoes_vinculadas: lista }, `Desvinculada obrigação fiscal do contrato.`);
  };

  // ================= TAREFAS RECORRENTES DA EMPRESA & DOCUMENTOS LEGAIS =================
  const adicionarTarefaEmpresa = (clienteId: string, config: Omit<TarefaEmpresaConfig, 'id'>) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    const nova: TarefaEmpresaConfig = {
      ...config,
      id: `t-cfg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    const lista = cliente.tarefas_empresa || [];
    updateCliente(clienteId, { tarefas_empresa: [...lista, nova] }, `Adicionada obrigação da empresa: ${config.titulo} (${config.departamento} - Dia ${config.dia_limite}).`);
  };

  const removerTarefaEmpresa = (clienteId: string, tarefaConfigIdOuTitulo: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    const lista = (cliente.tarefas_empresa || []).filter(t => {
      if (t.id && t.id === tarefaConfigIdOuTitulo) return false;
      if (t.titulo && t.titulo === tarefaConfigIdOuTitulo) return false;
      return true;
    });
    updateCliente(clienteId, { tarefas_empresa: lista }, `Removida obrigação da carteira da empresa.`);
  };

  const atualizarTarefaEmpresa = (clienteId: string, tarefaConfigId: string, updates: Partial<TarefaEmpresaConfig>) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    const lista = (cliente.tarefas_empresa || []).map(t => t.id === tarefaConfigId ? { ...t, ...updates } : t);
    updateCliente(clienteId, { tarefas_empresa: lista }, `Configuração de obrigação da empresa atualizada.`);
  };

  const sugerirTarefasPorRegime = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    const sugeridas = getTarefasPadraoPorRegime(cliente.regime_tributario, cliente.id);
    updateCliente(clienteId, { tarefas_empresa: sugeridas }, `Carregadas obrigações padrão para o regime ${cliente.regime_tributario}.`);
  };

  const gerarTarefasRecorrentesCarteira = (competenciaAlvo: string = obterCompetenciaAtual()) => {
    let criadas = 0;
    const detalhes: string[] = [];
    const novasTarefas: Tarefa[] = [];

    const [mesStr, anoStr] = competenciaAlvo.split('/');
    const mesNum = parseInt(mesStr, 10) || 10;
    const anoNum = parseInt(anoStr, 10) || 2026;

    clientes.filter(c => c.status === 'Ativo').forEach(cliente => {
      const tarefasConfig = (cliente.tarefas_empresa || []).filter(t => t.ativo !== false);
      if (tarefasConfig.length === 0) return;

      tarefasConfig.forEach(cfg => {
        // Verifica se já existe para esta empresa, título e competência
        const jaExiste = tarefas.some(
          t => t.cliente_id === cliente.id &&
               t.competencia === competenciaAlvo &&
               t.titulo.trim().toLowerCase() === cfg.titulo.trim().toLowerCase()
        ) || novasTarefas.some(
          t => t.cliente_id === cliente.id &&
               t.competencia === competenciaAlvo &&
               t.titulo.trim().toLowerCase() === cfg.titulo.trim().toLowerCase()
        );

        if (!jaExiste) {
          if (cfg.periodicidade === 'Anual' && mesNum !== 3 && mesNum !== 5 && mesNum !== 12) {
            return;
          }

          const diaVenc = Math.min(Math.max(1, cfg.dia_limite || 20), 28);
          const diaMeta = Math.max(1, diaVenc - 3);
          const dataPrazoLegal = `${anoNum}-${String(mesNum).padStart(2, '0')}-${String(diaVenc).padStart(2, '0')}`;
          const dataPrazoMeta = `${anoNum}-${String(mesNum).padStart(2, '0')}-${String(diaMeta).padStart(2, '0')}`;
          const respObrigacao = getResponsavelPorDepartamento(cfg.departamento);

          const etapas = cfg.eh_processo && cfg.etapas_padrao
            ? cfg.etapas_padrao.map((ep, idx) => ({
                id: `ep-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
                titulo: ep.titulo,
                ordem: ep.ordem || (idx + 1),
                data_limite: dataPrazoLegal,
                responsavel: respObrigacao,
                concluida: false,
                arquivos: [],
                cobrar_whatsapp: !!ep.cobrar_whatsapp,
                configuracao_cobranca: ep.cobrar_whatsapp ? {
                  habilitado: true,
                  telefones: [cliente.whatsapp || cliente.telefone || '19992080639'],
                  mensagem_padrao: `Olá *${cliente.nome}*, precisamos do seu retorno sobre a etapa *${ep.titulo}* referente a ${competenciaAlvo}.`,
                  frequencia: 'Diariamente' as const,
                  horario_envio: '08:00'
                } : undefined
              }))
            : undefined;

          novasTarefas.push({
            id: `tar-rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            titulo: cfg.titulo,
            descricao: `Obrigação recorrente gerada a partir da carteira da empresa ${cliente.nome}`,
            tipo: 'Recorrente',
            status: 'Pendente',
            prioridade: 'Normal',
            cliente_id: cliente.id,
            cliente_nome: cliente.nome,
            responsavel: respObrigacao,
            data_prazo_meta: dataPrazoMeta,
            data_prazo_legal: dataPrazoLegal,
            categoria: cfg.departamento,
            competencia: competenciaAlvo,
            tempo_gasto_minutos: 0,
            recorrencia_tipo: cfg.periodicidade === 'Eventual' ? 'Eventual' : (cfg.periodicidade === 'Anual' ? 'Anual' : 'Mensal'),
            eh_processo: cfg.eh_processo,
            tipo_execucao: cfg.eh_processo ? 'Processo' : 'Tarefa',
            etapas_processo: etapas,
            arquivos_anexos: [],
            created_at: new Date().toISOString()
          });

          criadas++;
          detalhes.push(`${cliente.nome} -> ${cfg.titulo}`);
        }
      });
    });

    if (novasTarefas.length > 0) {
      saveTarefas([...tarefas, ...novasTarefas]);
    }

    return { totalCriadas: criadas, detalhes };
  };

  const zerarTodasTarefasEmpresas = () => {
    const atualizados = clientes.map(c => ({
      ...c,
      tarefas_empresa: []
    }));
    saveClientes(atualizados);
  };

  const gerarTarefasAteJaneiro2027 = () => {
    const competencias = ['11/2026', '12/2026', '01/2027'];
    let criadas = 0;
    const detalhes: string[] = [];
    const novasTarefas: Tarefa[] = [];
    let tarefasAtuais = [...tarefas];

    competencias.forEach(competenciaAlvo => {
      const [mesStr, anoStr] = competenciaAlvo.split('/');
      const mesNum = parseInt(mesStr, 10) || 11;
      const anoNum = parseInt(anoStr, 10) || 2026;

      clientes.filter(c => c.status === 'Ativo').forEach(cliente => {
        const tarefasConfig = (cliente.tarefas_empresa || []).filter(t => t.ativo !== false);
        if (tarefasConfig.length === 0) return;

        tarefasConfig.forEach(cfg => {
          const jaExiste = tarefasAtuais.some(
            t => t.cliente_id === cliente.id &&
                 t.competencia === competenciaAlvo &&
                 t.titulo.trim().toLowerCase() === cfg.titulo.trim().toLowerCase()
          ) || novasTarefas.some(
            t => t.cliente_id === cliente.id &&
                 t.competencia === competenciaAlvo &&
                 t.titulo.trim().toLowerCase() === cfg.titulo.trim().toLowerCase()
          );

          if (!jaExiste) {
            if (cfg.periodicidade === 'Anual' && mesNum !== 3 && mesNum !== 5 && mesNum !== 12 && mesNum !== 1) {
              return;
            }

            const diaVenc = Math.min(Math.max(1, cfg.dia_limite || 20), 28);
            const diaMeta = Math.max(1, diaVenc - 3);
            const dataPrazoLegal = `${anoNum}-${String(mesNum).padStart(2, '0')}-${String(diaVenc).padStart(2, '0')}`;
            const dataPrazoMeta = `${anoNum}-${String(mesNum).padStart(2, '0')}-${String(diaMeta).padStart(2, '0')}`;
            const respObrigacao = getResponsavelPorDepartamento(cfg.departamento);

            const etapas = cfg.eh_processo && cfg.etapas_padrao
              ? cfg.etapas_padrao.map((ep, idx) => ({
                  id: `ep-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
                  titulo: ep.titulo,
                  ordem: ep.ordem || (idx + 1),
                  data_limite: dataPrazoLegal,
                  responsavel: respObrigacao,
                  concluida: false,
                  arquivos: [],
                  cobrar_whatsapp: !!ep.cobrar_whatsapp,
                  configuracao_cobranca: ep.cobrar_whatsapp ? {
                    habilitado: true,
                    telefones: [cliente.whatsapp || cliente.telefone || '19992080639'],
                    mensagem_padrao: `Olá *${cliente.nome}*, precisamos do seu retorno sobre a etapa *${ep.titulo}* referente a ${competenciaAlvo}.`,
                    frequencia: 'Diariamente' as const,
                    horario_envio: '08:00'
                  } : undefined,
                  observacoes: 'Etapa padronizada da obrigação'
                }))
              : undefined;

            novasTarefas.push({
              id: `tar-rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              titulo: cfg.titulo,
              descricao: `Obrigação recorrente gerada a partir da carteira da empresa ${cliente.nome}`,
              tipo: 'Recorrente',
              status: 'Pendente',
              prioridade: 'Normal',
              cliente_id: cliente.id,
              cliente_nome: cliente.nome,
              responsavel: respObrigacao,
              data_prazo_meta: dataPrazoMeta,
              data_prazo_legal: dataPrazoLegal,
              categoria: cfg.departamento,
              competencia: competenciaAlvo,
              tempo_gasto_minutos: 0,
              recorrencia_tipo: cfg.periodicidade === 'Eventual' ? 'Eventual' : (cfg.periodicidade === 'Anual' ? 'Anual' : 'Mensal'),
              eh_processo: cfg.eh_processo,
              tipo_execucao: cfg.eh_processo ? 'Processo' : 'Tarefa',
              etapas_processo: etapas,
              arquivos_anexos: [],
              created_at: new Date().toISOString()
            });

            criadas++;
            detalhes.push(`${cliente.nome} -> ${cfg.titulo} (${competenciaAlvo})`);
          }
        });
      });
    });

    if (novasTarefas.length > 0) {
      saveTarefas([...tarefas, ...novasTarefas]);
    }

    return { totalCriadas: criadas, detalhes };
  };

  const gerarTarefasEmpresaAteJaneiro2027 = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return { totalCriadas: 0, detalhes: [] };
    const tarefasConfig = (cliente.tarefas_empresa || []).filter(t => t.ativo !== false);
    if (tarefasConfig.length === 0) return { totalCriadas: 0, detalhes: [] };

    const competencias = ['11/2026', '12/2026', '01/2027'];
    let criadas = 0;
    const detalhes: string[] = [];
    const novasTarefas: Tarefa[] = [];
    let tarefasAtuais = [...tarefas];

    competencias.forEach(competenciaAlvo => {
      const [mesStr, anoStr] = competenciaAlvo.split('/');
      const mesNum = parseInt(mesStr, 10) || 11;
      const anoNum = parseInt(anoStr, 10) || 2026;

      tarefasConfig.forEach(cfg => {
        const jaExiste = tarefasAtuais.some(
          t => t.cliente_id === cliente.id &&
               t.competencia === competenciaAlvo &&
               t.titulo.trim().toLowerCase() === cfg.titulo.trim().toLowerCase()
        ) || novasTarefas.some(
          t => t.cliente_id === cliente.id &&
               t.competencia === competenciaAlvo &&
               t.titulo.trim().toLowerCase() === cfg.titulo.trim().toLowerCase()
        );

        if (!jaExiste) {
          if (cfg.periodicidade === 'Anual' && mesNum !== 3 && mesNum !== 5 && mesNum !== 12 && mesNum !== 1) {
            return;
          }

          const diaVenc = Math.min(Math.max(1, cfg.dia_limite || 20), 28);
          const diaMeta = Math.max(1, diaVenc - 3);
          const dataPrazoLegal = `${anoNum}-${String(mesNum).padStart(2, '0')}-${String(diaVenc).padStart(2, '0')}`;
          const dataPrazoMeta = `${anoNum}-${String(mesNum).padStart(2, '0')}-${String(diaMeta).padStart(2, '0')}`;
          const respObrigacao = getResponsavelPorDepartamento(cfg.departamento);

          const etapas = cfg.eh_processo && cfg.etapas_padrao
            ? cfg.etapas_padrao.map((ep, idx) => ({
                id: `ep-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
                titulo: ep.titulo,
                ordem: ep.ordem || (idx + 1),
                data_limite: dataPrazoLegal,
                responsavel: respObrigacao,
                concluida: false,
                arquivos: [],
                cobrar_whatsapp: !!ep.cobrar_whatsapp,
                configuracao_cobranca: ep.cobrar_whatsapp ? {
                  habilitado: true,
                  telefones: [cliente.whatsapp || cliente.telefone || '19992080639'],
                  mensagem_padrao: `Olá *${cliente.nome}*, precisamos do seu retorno sobre a etapa *${ep.titulo}* referente a ${competenciaAlvo}.`,
                  frequencia: 'Diariamente' as const,
                  horario_envio: '08:00'
                } : undefined,
                observacoes: 'Etapa padronizada da obrigação'
              }))
            : undefined;

          novasTarefas.push({
            id: `tar-rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            titulo: cfg.titulo,
            descricao: `Obrigação recorrente gerada para ${cliente.nome}`,
            tipo: 'Recorrente',
            status: 'Pendente',
            prioridade: 'Normal',
            cliente_id: cliente.id,
            cliente_nome: cliente.nome,
            responsavel: respObrigacao,
            data_prazo_meta: dataPrazoMeta,
            data_prazo_legal: dataPrazoLegal,
            categoria: cfg.departamento,
            competencia: competenciaAlvo,
            tempo_gasto_minutos: 0,
            recorrencia_tipo: cfg.periodicidade === 'Eventual' ? 'Eventual' : (cfg.periodicidade === 'Anual' ? 'Anual' : 'Mensal'),
            eh_processo: cfg.eh_processo,
            tipo_execucao: cfg.eh_processo ? 'Processo' : 'Tarefa',
            etapas_processo: etapas,
            arquivos_anexos: [],
            created_at: new Date().toISOString()
          });

          criadas++;
          detalhes.push(`${cfg.titulo} (${competenciaAlvo})`);
        }
      });
    });

    if (novasTarefas.length > 0) {
      saveTarefas([...tarefas, ...novasTarefas]);
    }

    return { totalCriadas: criadas, detalhes };
  };

  const restaurarTarefasPadraoCarteira = (): { totalRestauradas: number } => {
    let inseridas = 0;
    setTarefas(prev => {
      const novaLista = [...prev];
      rawInitialTarefas.forEach(tOrig => {
        const jaExiste = novaLista.some(
          t => t.id === tOrig.id || (t.titulo === tOrig.titulo && t.cliente_id === tOrig.cliente_id && t.competencia === tOrig.competencia)
        );
        if (!jaExiste) {
          novaLista.push(enrichTarefa(tOrig));
          inseridas++;
        }
      });
      if (!novaLista.some(ehRegistroSamira)) {
        novaLista.push(tarefaRegistroSamiraPadrao);
        inseridas++;
      }
      try {
        localStorage.setItem('gestup_v2_tarefas', JSON.stringify(novaLista));
      } catch {}
      return novaLista;
    });
    return { totalRestauradas: inseridas };
  };

  const adicionarDocumentoLegalCliente = (clienteId: string, doc: Omit<DocumentoLegalCliente, 'id' | 'data_upload'>) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    const novoDoc: DocumentoLegalCliente = {
      ...doc,
      id: `doc-leg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      data_upload: new Date().toISOString().split('T')[0]
    };
    const lista = cliente.documentos_legais || [];
    updateCliente(clienteId, { documentos_legais: [novoDoc, ...lista] }, `Anexado documento legal: ${doc.tipo} - ${doc.nome}.`);
  };

  const removerDocumentoLegalCliente = (clienteId: string, docId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    const lista = (cliente.documentos_legais || []).filter(d => d.id !== docId);
    updateCliente(clienteId, { documentos_legais: lista }, `Documento legal removido.`);
  };

  const atualizarAcessoPortalCliente = (clienteId: string, credenciais: CredenciaisPortalCliente) => {
    updateCliente(clienteId, { portal_acesso: credenciais }, `Credenciais de acesso ao portal do cliente atualizadas (${credenciais.email}).`);
  };

  // ================= COLABORADORES & USUÁRIOS (CRUD) =================
  const addColaborador = (colaborador: Omit<Colaborador, 'id'>) => {
    const novo: Colaborador = { ...colaborador, id: `col-${Date.now()}` };
    saveColaboradores([...colaboradores, novo]);
  };

  const updateColaborador = (id: string, updates: Partial<Colaborador>) => {
    const atualizados = colaboradores.map(c => c.id === id ? { ...c, ...updates } : c);
    saveColaboradores(atualizados);
  };

  const deleteColaborador = (id: string) => {
    const atualizados = colaboradores.filter(c => c.id !== id);
    saveColaboradores(atualizados);
  };

  // ================= DECLARAÇÕES FISCAIS (CRUD) =================
  const addDeclaracao = (dec: Omit<Declaracao, 'id'>) => {
    const nova: Declaracao = { ...dec, id: `dec-${Date.now()}` };
    saveDeclaracoes([...declaracoes, nova]);
  };

  const updateDeclaracao = (id: string, updates: Partial<Declaracao>) => {
    saveDeclaracoes(declaracoes.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDeclaracao = (id: string) => {
    saveDeclaracoes(declaracoes.filter(d => d.id !== id));
  };

  // ================= FINANCEIRO & CONCILIAÇÃO OFX =================
  const addContaPagar = (conta: Omit<ContaPagar, 'id'>) => {
    const nova: ContaPagar = { ...conta, id: `pag-${Date.now()}` };
    saveContasPagar([nova, ...contasPagar]);
  };

  const pagarConta = (id: string, dataPagamento?: string) => {
    const data = dataPagamento || new Date().toISOString().split('T')[0];
    saveContasPagar(contasPagar.map(cp => cp.id === id ? { ...cp, status: 'Pago', data_pagamento: data } : cp));
  };

  const addContaReceber = (conta: Omit<ContaReceber, 'id'>) => {
    const nova: ContaReceber = { ...conta, id: `rec-${Date.now()}` };
    saveContasReceber([nova, ...contasReceber]);
  };

  const receberConta = (id: string, dataRecebimento?: string) => {
    const data = dataRecebimento || new Date().toISOString().split('T')[0];
    saveContasReceber(contasReceber.map(cr => cr.id === id ? { ...cr, status: 'Pago', data_recebimento: data } : cr));
  };

  // Lança a Provisão Mensal automática baseada nos clientes ativos e seus honorários
  const gerarProvisaoMensalHonorarios = (mesRef: string) => {
    const novasProvisoes: ContaReceber[] = clientes
      .filter(c => c.status === 'Ativo' && c.honorario_mensal > 0)
      .map(c => {
        const diaVenc = String(c.dia_vencimento || 15).padStart(2, '0');
        const anoMes = mesRef.replace('/', '-');
        const [m, y] = mesRef.includes('/') ? mesRef.split('/') : ['10', '2026'];
        const vencimento = `${y || '2026'}-${m || '10'}-${diaVenc}`;

        return {
          id: `prov-${c.id}-${Date.now()}`,
          descricao: `Honorário Mensal - ${c.nome} (Comp. ${mesRef})`,
          cliente_id: c.id,
          cliente_nome: c.nome,
          categoria: 'Honorário Mensal',
          valor: c.honorario_mensal,
          data_vencimento: vencimento,
          status: 'Pendente',
          provisao_mensal: true
        };
      });

    saveContasReceber([...novasProvisoes, ...contasReceber]);
  };

  const addReceitaNaoRecorrente = (rec: Omit<ReceitaNaoRecorrente, 'id' | 'created_at'>) => {
    const nova: ReceitaNaoRecorrente = {
      ...rec,
      id: `rnr-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    setReceitasNaoRecorrentes([nova, ...receitasNaoRecorrentes]);
  };

  const addCustoReceitaNaoRecorrente = (receitaId: string, custo: Omit<CustoVinculadoReceita, 'id'>) => {
    setReceitasNaoRecorrentes(receitasNaoRecorrentes.map(r => {
      if (r.id !== receitaId) return r;
      const novoCusto: CustoVinculadoReceita = { ...custo, id: `cst-${Date.now()}` };
      return {
        ...r,
        custos_vinculados: [...r.custos_vinculados, novoCusto]
      };
    }));
  };

  const importarExtratoOFX = (banco: 'PicPay Empresas' | 'Outro', transacoes: Omit<TransacaoOFX, 'id'>[]) => {
    const novas: TransacaoOFX[] = transacoes.map(t => ({
      ...t,
      id: `ofx-${Date.now()}-${Math.random()}`
    }));
    setTransacoesOFX([...novas, ...transacoesOFX]);
  };

  const conciliarTransacaoOFX = (transacaoId: string, referenciaDescricao: string) => {
    setTransacoesOFX(transacoesOFX.map(t => t.id === transacaoId ? { ...t, conciliado: true } : t));
  };

  // ================= HONORÁRIOS POR COMPETÊNCIA (REGIME COMPETÊNCIA X CAIXA) =================
  const darBaixaHonorario = (
    id: string,
    dadosBaixa: {
      dataPagamento: string;
      formaPagamento: 'PIX PicPay' | 'Boleto' | 'Transferência' | 'Dinheiro' | 'Outro';
      valorPago?: number;
      observacoes?: string;
      notificarWhatsApp?: boolean;
    }
  ) => {
    const [y, m] = dadosBaixa.dataPagamento.split('-');
    const competenciaPag = `${m || '10'}/${y || '2026'}`;

    const updated = honorarios.map(h => {
      if (h.id === id) {
        return {
          ...h,
          status: 'Pago' as const,
          data_pagamento: dadosBaixa.dataPagamento,
          competencia_pagamento: competenciaPag,
          forma_pagamento: dadosBaixa.formaPagamento,
          valor: dadosBaixa.valorPago !== undefined ? dadosBaixa.valorPago : h.valor,
          observacoes: dadosBaixa.observacoes || h.observacoes,
          dias_atraso: 0
        };
      }
      return h;
    });

    saveHonorarios(updated);

    if (dadosBaixa.notificarWhatsApp) {
      const hon = honorarios.find(h => h.id === id);
      if (hon) {
        const msg = `✅ *Comprovante de Quitação - fin.up Consultoria*\n\n` +
          `Olá, *${hon.contato_nome || hon.cliente_nome}*!\n\n` +
          `Confirmamos a baixa e liquidação dos honorários da empresa *${hon.cliente_nome}*:\n` +
          `• *Competência:* ${hon.competencia}\n` +
          `• *Valor Pago:* R$ ${(dadosBaixa.valorPago ?? hon.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
          `• *Data do Pagamento:* ${dadosBaixa.dataPagamento.split('-').reverse().join('/')}\n` +
          `• *Forma de Pagamento:* ${dadosBaixa.formaPagamento}\n\n` +
          `Agradecemos a pontualidade e a parceria contábil!`;

        enviarMensagemWhatsApp(
          'Cliente',
          hon.cliente_nome,
          hon.contato_telefone || '19999990000',
          'Honorário',
          msg,
          hon.id
        );
      }
    }
  };

  const gerarHonorariosCompetencia = (competenciaAlvo: string) => {
    const [mes, ano] = competenciaAlvo.split('/');
    const novos: HonorarioItem[] = clientes
      .filter(c => c.status === 'Ativo' && c.honorario_mensal > 0)
      .map((c, idx) => {
        const diaVenc = String(c.dia_vencimento || 15).padStart(2, '0');
        const venc = `${ano || '2026'}-${mes || '11'}-${diaVenc}`;
        return {
          id: `hon-${mes}_${ano}-${c.id}-${Date.now()}_${idx}`,
          cliente_id: c.id,
          cliente_nome: c.nome,
          contato_nome: c.responsavel || c.nome.split(' ')[0],
          contato_telefone: c.whatsapp || c.telefone,
          competencia: competenciaAlvo,
          valor: c.honorario_mensal,
          data_vencimento: venc,
          status: 'Pendente' as const,
          parcela_info: `Mensalidade ${competenciaAlvo}`,
          created_at: new Date().toISOString().split('T')[0]
        };
      });

    saveHonorarios([...novos, ...honorarios]);
  };

  const obterTelefoneHonorario = (hon: HonorarioItem): string => {
    const cli = clientes.find(
      c => c.id === hon.cliente_id || c.nome.trim().toLowerCase() === (hon.cliente_nome || '').trim().toLowerCase()
    );
    const telCli = cli?.whatsapp || cli?.telefone || cli?.contatos_notificacao?.[0]?.telefoneOuGrupo || '';
    const telHonDigits = String(hon.contato_telefone || '').replace(/\D/g, '');
    const isFakePlaceholder =
      /^199999900\d{2}$/.test(telHonDigits) ||
      /^55199999900\d{2}$/.test(telHonDigits) ||
      telHonDigits === '19999990000' ||
      telHonDigits === '5519999990000';

    if (telCli && String(telCli).replace(/\D/g, '').length >= 10) {
      return telCli;
    }
    if (!isFakePlaceholder && telHonDigits.length >= 10) {
      return hon.contato_telefone || '';
    }
    return '';
  };

  const gerarMensagemHonorarioWhatsApp = (
    hon: HonorarioItem,
    tipoForcado?: 'lembrete' | 'vencido'
  ): {
    tipo: 'lembrete' | 'vencido';
    texto: string;
    diasAtraso: number;
    diasParaVencer: number;
  } => {
    const cli = clientes.find(
      c => c.id === hon.cliente_id || c.nome.trim().toLowerCase() === (hon.cliente_nome || '').trim().toLowerCase()
    );
    const nomeContato = hon.contato_nome || cli?.responsavel || hon.cliente_nome.split(' ')[0] || hon.cliente_nome;
    const dataVencFormatada = (hon.data_vencimento || '').split('-').reverse().join('/');
    const valorFormatado = hon.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

    // Calcula diferença de dias em relação a hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const [anoV, mesV, diaV] = (hon.data_vencimento || '').split('-').map(Number);
    const dataVencDate = anoV && mesV && diaV ? new Date(anoV, mesV - 1, diaV) : hoje;
    dataVencDate.setHours(0, 0, 0, 0);
    const diffDias = Math.round((hoje.getTime() - dataVencDate.getTime()) / (1000 * 60 * 60 * 24));

    const diasAtraso = Math.max(hon.dias_atraso || 0, diffDias > 0 ? diffDias : 3);
    const diasParaVencer = diffDias < 0 ? Math.abs(diffDias) : 3;

    const ehVencido = tipoForcado
      ? tipoForcado === 'vencido'
      : hon.status === 'Vencido' || (hon.dias_atraso !== undefined && hon.dias_atraso > 0);

    if (ehVencido) {
      const textoVencido =
        `🚨 *Aviso de Honorário Vencido - fin.up Consultoria*\n\n` +
        `Olá, *${nomeContato}*!\n\n` +
        `Identificamos em nosso sistema que o honorário contábil da empresa *${hon.cliente_nome}*, referente à *Competência ${hon.competencia}*, já venceu e consta pendente de baixa:\n\n` +
        `💰 *Valor:* R$ ${valorFormatado}\n` +
        `📅 *Vencimento:* ${dataVencFormatada} (${diasAtraso} ${diasAtraso === 1 ? 'dia' : 'dias'} em atraso)\n\n` +
        `⚠️ *Atenção:* Lembramos que o não pagamento dos honorários após o vencimento sujeita o valor à incidência de *multa e juros pelo atraso*, além de poder gerar o *bloqueio dos serviços prestados* até a devida regularização.\n\n` +
        `🔑 *Chave PIX fin.up:* *financeiro@finup.com.br* (PicPay Empresas)\n\n` +
        `Solicitamos a gentileza de realizar a regularização e nos enviar o comprovante por aqui. Caso o pagamento já tenha sido efetuado, basta nos encaminhar o comprovante para darmos baixa imediatamente. Obrigado!`;

      return {
        tipo: 'vencido',
        texto: textoVencido,
        diasAtraso,
        diasParaVencer: 0
      };
    }

    const textoLembrete =
      `🔔 *Lembrete de Vencimento de Honorários - fin.up Consultoria*\n\n` +
      `Olá, *${nomeContato}*! Tudo bem?\n\n` +
      `Passando para lembrar do pagamento dos honorários contábeis da empresa *${hon.cliente_nome}* referente à *Competência ${hon.competencia}*:\n\n` +
      `💰 *Valor:* R$ ${valorFormatado}\n` +
      `📅 *Data de Vencimento:* ${dataVencFormatada}\n\n` +
      `🔑 *Chave PIX fin.up:* *financeiro@finup.com.br* (PicPay Empresas)\n\n` +
      `Qualquer dúvida ou caso já tenha efetuado o pagamento, por gentileza nos envie o comprovante por aqui para realizarmos a baixa. Muito obrigado!`;

    return {
      tipo: 'lembrete',
      texto: textoLembrete,
      diasAtraso: 0,
      diasParaVencer
    };
  };

  const dispararCobrancaHonorarioWhatsApp = async (
    honorarioId: string,
    opcoes?: {
      telefoneOverride?: string;
      mensagemOverride?: string;
      tipoMensagem?: 'lembrete' | 'vencido';
      salvarTelefoneNoCliente?: boolean;
    }
  ): Promise<{
    sucessoApi: boolean;
    semTelefone?: boolean;
    telefoneUsado: string;
    mensagemEnviada: string;
    tipoMensagem: 'lembrete' | 'vencido';
  }> => {
    const hon = honorarios.find(h => h.id === honorarioId);
    if (!hon) {
      return {
        sucessoApi: false,
        semTelefone: true,
        telefoneUsado: '',
        mensagemEnviada: '',
        tipoMensagem: 'lembrete'
      };
    }

    const { tipo, texto } = gerarMensagemHonorarioWhatsApp(hon, opcoes?.tipoMensagem);
    const msgFinal = opcoes?.mensagemOverride || texto;
    const telResolvido = (opcoes?.telefoneOverride || obterTelefoneHonorario(hon) || '').trim();
    const cleanDigits = telResolvido.replace(/\D/g, '');

    if (cleanDigits.length < 10) {
      return {
        sucessoApi: false,
        semTelefone: true,
        telefoneUsado: '',
        mensagemEnviada: msgFinal,
        tipoMensagem: tipo
      };
    }

    // Se o usuário informou/atualizou o telefone no momento da cobrança, salva no Cliente e nos Honorários
    if (opcoes?.telefoneOverride && opcoes?.salvarTelefoneNoCliente !== false) {
      const cli = clientes.find(
        c => c.id === hon.cliente_id || c.nome.trim().toLowerCase() === (hon.cliente_nome || '').trim().toLowerCase()
      );
      if (cli) {
        updateCliente(
          cli.id,
          { whatsapp: cleanDigits, telefone: opcoes.telefoneOverride },
          `WhatsApp cadastrado/atualizado durante disparo de cobrança de honorários: ${opcoes.telefoneOverride}`
        );
      }
    }

    const sucessoApi = await enviarMensagemWhatsApp(
      'Cliente',
      hon.cliente_nome,
      telResolvido,
      tipo === 'vencido' ? 'Cobrança Atraso' : 'Honorário',
      msgFinal,
      hon.id
    );

    const agoraStr = new Date().toLocaleString('pt-BR');
    const updatedHons = honorarios.map(h => {
      if (h.id === honorarioId) {
        return {
          ...h,
          contato_telefone: cleanDigits,
          ultima_cobranca_whatsapp: agoraStr,
          lembrete_3dias_antes_enviado: tipo === 'lembrete' ? true : h.lembrete_3dias_antes_enviado,
          cobranca_3dias_apos_enviado: tipo === 'vencido' ? true : h.cobranca_3dias_apos_enviado
        };
      }
      return h;
    });
    saveHonorarios(updatedHons);

    return {
      sucessoApi,
      telefoneUsado: telResolvido,
      mensagemEnviada: msgFinal,
      tipoMensagem: tipo
    };
  };

  // Monitoramento automático de Honorários: Disparo automático faltando 3 dias (D-3) e 3 dias após o vencimento (D+3)
  useEffect(() => {
    if (!whatsAppConfig.conectado || honorarios.length === 0) return;

    const verificarReguaHonorariosAutomatica = async () => {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      let houveDisparo = false;
      const novosHonorarios = [...honorarios];

      for (let i = 0; i < novosHonorarios.length; i++) {
        const hon = novosHonorarios[i];
        if (hon.status === 'Pago' || hon.status === 'Cancelado') continue;

        const tel = obterTelefoneHonorario(hon);
        if (!tel || tel.replace(/\D/g, '').length < 10) continue;

        const [anoV, mesV, diaV] = (hon.data_vencimento || '').split('-').map(Number);
        if (!anoV || !mesV || !diaV) continue;

        const dataVenc = new Date(anoV, mesV - 1, diaV);
        dataVenc.setHours(0, 0, 0, 0);
        const diffDias = Math.round((hoje.getTime() - dataVenc.getTime()) / (1000 * 60 * 60 * 24));
        // diffDias === -3 -> Faltam 3 dias para o vencimento
        // diffDias >= 3 -> Já se passaram 3 dias do vencimento

        if (diffDias === -3 && !hon.lembrete_3dias_antes_enviado) {
          const { texto } = gerarMensagemHonorarioWhatsApp(hon, 'lembrete');
          const enviado = await enviarMensagemWhatsApp('Cliente', hon.cliente_nome, tel, 'Honorário', texto, hon.id);
          if (enviado) {
            novosHonorarios[i] = {
              ...hon,
              lembrete_3dias_antes_enviado: true,
              ultima_cobranca_whatsapp: new Date().toLocaleString('pt-BR')
            };
            houveDisparo = true;
          }
        } else if (diffDias === 3 && !hon.cobranca_3dias_apos_enviado) {
          const { texto } = gerarMensagemHonorarioWhatsApp(hon, 'vencido');
          const enviado = await enviarMensagemWhatsApp('Cliente', hon.cliente_nome, tel, 'Cobrança Atraso', texto, hon.id);
          if (enviado) {
            novosHonorarios[i] = {
              ...hon,
              status: 'Vencido',
              dias_atraso: 3,
              cobranca_3dias_apos_enviado: true,
              ultima_cobranca_whatsapp: new Date().toLocaleString('pt-BR')
            };
            houveDisparo = true;
          }
        }
      }

      if (houveDisparo) {
        saveHonorarios(novosHonorarios);
      }
    };

    const timer = setTimeout(() => {
      verificarReguaHonorariosAutomatica();
    }, 3000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whatsAppConfig.conectado, honorarios.length]);

  const atualizarHonorario = (id: string, updates: Partial<HonorarioItem>, atualizarClienteContratual = true) => {
    let clienteIdParaAtualizar: string | undefined;
    let novoValorHonorario: number | undefined;

    const updated = honorarios.map(h => {
      if (h.id === id) {
        clienteIdParaAtualizar = h.cliente_id;
        if (updates.valor !== undefined) novoValorHonorario = updates.valor;
        return {
          ...h,
          ...updates
        };
      }
      return h;
    });

    saveHonorarios(updated);

    // Se solicitado e o valor mudou, sincroniza também o valor contratual mensal do cliente em ClientesView / Dashboard
    if (atualizarClienteContratual && clienteIdParaAtualizar && novoValorHonorario !== undefined && novoValorHonorario > 0) {
      const cliAtual = clientes.find(c => c.id === clienteIdParaAtualizar);
      if (cliAtual && cliAtual.honorario_mensal !== novoValorHonorario) {
        updateCliente(
          clienteIdParaAtualizar,
          { honorario_mensal: novoValorHonorario },
          `Honorário mensal ajustado no módulo Financeiro para R$ ${novoValorHonorario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
        );
      }
    }
  };

  const adicionarHonorario = (honData: Omit<HonorarioItem, 'id' | 'created_at'>, atualizarClienteContratual = false) => {
    const novoHon: HonorarioItem = {
      ...honData,
      id: `hon-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString().split('T')[0]
    };

    saveHonorarios([novoHon, ...honorarios]);

    if (atualizarClienteContratual && honData.cliente_id && honData.valor > 0) {
      const cliAtual = clientes.find(c => c.id === honData.cliente_id);
      if (cliAtual) {
        updateCliente(
          honData.cliente_id,
          { honorario_mensal: honData.valor },
          `Honorário mensal cadastrado no módulo Financeiro: R$ ${honData.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
        );
      }
    }
  };

  const excluirHonorario = (id: string) => {
    const updated = honorarios.filter(h => h.id !== id);
    saveHonorarios(updated);
  };

  const sincronizarHonorariosComClientes = (competenciaAlvo: string = '10/2026') => {
    const [mes, ano] = competenciaAlvo.split('/');
    let countAtualizados = 0;

    const ativos = clientes.filter(c => c.status === 'Ativo' && c.honorario_mensal > 0);
    const honsMap = new Map<string, HonorarioItem>();
    honorarios.forEach(h => {
      if (h.competencia === competenciaAlvo) {
        honsMap.set(h.cliente_id, h);
      }
    });

    const novosHons: HonorarioItem[] = [];
    const honsAtualizados = honorarios.map(h => {
      const cli = clientes.find(
        c => c.id === h.cliente_id || c.nome.trim().toLowerCase() === (h.cliente_nome || '').trim().toLowerCase()
      );
      if (cli) {
        const telReal = cli.whatsapp || cli.telefone || cli.contatos_notificacao?.[0]?.telefoneOuGrupo || '';
        const mudouValor = h.competencia === competenciaAlvo && h.status !== 'Pago' && cli.honorario_mensal !== h.valor;
        const mudouTel = telReal && telReal !== h.contato_telefone;
        const mudouId = cli.id !== h.cliente_id;
        if (mudouValor || mudouTel || mudouId) {
          countAtualizados++;
          return {
            ...h,
            cliente_id: cli.id,
            cliente_nome: cli.nome,
            contato_nome: cli.responsavel || h.contato_nome,
            contato_telefone: telReal || h.contato_telefone,
            valor: h.competencia === competenciaAlvo && h.status !== 'Pago' ? cli.honorario_mensal : h.valor
          };
        }
      }
      return h;
    });

    ativos.forEach(cli => {
      if (!honsMap.has(cli.id)) {
        const diaVenc = String(cli.dia_vencimento || 15).padStart(2, '0');
        novosHons.push({
          id: `hon-${mes}_${ano}-${cli.id}-${Date.now()}`,
          cliente_id: cli.id,
          cliente_nome: cli.nome,
          contato_nome: cli.responsavel || cli.nome.split(' ')[0],
          contato_telefone: cli.whatsapp || cli.telefone,
          competencia: competenciaAlvo,
          valor: cli.honorario_mensal,
          data_vencimento: `${ano || '2026'}-${mes || '10'}-${diaVenc}`,
          status: 'Pendente',
          parcela_info: `Mensalidade ${competenciaAlvo}`,
          created_at: new Date().toISOString().split('T')[0]
        });
        countAtualizados++;
      }
    });

    const resultadoFinal = [...novosHons, ...honsAtualizados];
    saveHonorarios(resultadoFinal);
    return countAtualizados;
  };

  // ================= CRM =================
  const addLead = (lead: Omit<CRMLead, 'id' | 'data_entrada'>) => {
    const novo: CRMLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      data_entrada: new Date().toISOString().split('T')[0]
    };
    saveLeads([novo, ...leads]);
  };

  const updateLead = (id: string, updates: Partial<CRMLead>) => {
    const atualizados = leads.map(l => l.id === id ? { ...l, ...updates } : l);
    saveLeads(atualizados);
  };

  const converterLeadEmCliente = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    addCliente({
      nome: lead.empresa || lead.nome,
      cnpj_cpf: lead.cpf_cnpj || 'Em emissão',
      email: lead.email,
      telefone: lead.telefone,
      whatsapp: lead.whatsapp || lead.telefone,
      receber_guias_whatsapp: true,
      regime_tributario: 'Simples Nacional',
      status: 'Ativo',
      responsavel: lead.responsavel,
      honorario_mensal: lead.valor_estimado || 1500,
      dia_vencimento: 15,
      endereco: 'Sede da Empresa',
      data_inicio_contrato: new Date().toISOString().split('T')[0]
    });

    updateLead(leadId, { estagio: 'Fechado' });
  };

  const baixarLeadComJustificativa = (leadId: string, motivo: string, justificativa: string) => {
    const atualizados = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          estagio: 'Perdido',
          motivo_baixa: motivo,
          justificativa_baixa: justificativa,
          data_baixa: new Date().toLocaleString('pt-BR'),
          observacoes: `${l.observacoes || ''}\n[BAIXA/PERDIDO em ${new Date().toLocaleString('pt-BR')}] Motivo: ${motivo}. Justificativa: ${justificativa}`.trim()
        };
      }
      return l;
    });
    saveLeads(atualizados);
  };

  const reativarLead = (leadId: string) => {
    const atualizados = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          estagio: 'Contato Realizado',
          observacoes: `${l.observacoes || ''}\n[REATIVADO em ${new Date().toLocaleString('pt-BR')}] Lead reativado no funil comercial.`.trim()
        };
      }
      return l;
    });
    saveLeads(atualizados);
  };

  // ================= RADAR FISCAL & CAPTAÇÃO ATIVA =================
  const adicionarEmpresaAoRadar = (novaEmpresa: EmpresaRadarFiscal) => {
    const cleanCnpj = (novaEmpresa.cnpj || '').replace(/\D/g, '');
    const index = empresasRadar.findIndex(e => e.cnpj.replace(/\D/g, '') === cleanCnpj);
    if (index >= 0) {
      const atualizadas = [...empresasRadar];
      atualizadas[index] = { ...atualizadas[index], ...novaEmpresa };
      saveEmpresasRadar(atualizadas);
    } else {
      saveEmpresasRadar([novaEmpresa, ...empresasRadar]);
    }
  };

  const atualizarEmpresaRadar = (id: string, updates: Partial<EmpresaRadarFiscal>) => {
    const atualizadas = empresasRadar.map(e => e.id === id ? { ...e, ...updates } : e);
    saveEmpresasRadar(atualizadas);
  };

  const importarEmpresaRadarParaCRM = async (
    empresaId: string, 
    estagio: CRMLeadEstagio = 'Contato Realizado',
    mensagemAgendada?: MensagemAgendadaWhatsApp
  ): Promise<boolean> => {
    const emp = empresasRadar.find(e => e.id === empresaId);
    if (!emp) return false;

    const regimeClassificado = classificarRegimeEmpresa(emp);
    const cleanCnpj = (emp.cnpj || '').replace(/\D/g, '');
    const possuiDebitosGerais = Boolean(
      emp.tem_ade_ativo || 
      (emp.tem_divida_pgfn && (emp.valor_divida_pgfn || 0) > 0) || 
      (emp.tem_divida_estadual && (emp.valor_divida_estadual || 0) > 0)
    );

    const enderecoFormatado = [
      emp.logradouro ? `${emp.logradouro}, ${emp.numero || 'S/N'}${emp.complemento ? ' - ' + emp.complemento : ''}` : '',
      emp.bairro ? emp.bairro : '',
      emp.municipio && emp.uf ? `${emp.municipio}/${emp.uf}` : '',
      emp.cep ? `CEP: ${emp.cep}` : ''
    ].filter(Boolean).join(' - ') || `${emp.municipio || ''}/${emp.uf || ''}`;

    const dadosFiscaisCompletos = {
      razao_social: emp.razao_social,
      nome_fantasia: emp.nome_fantasia || emp.razao_social,
      regime: regimeClassificado,
      optante_simples: emp.optante_simples,
      optante_mei: emp.optante_mei,
      tem_ade_ativo: emp.tem_ade_ativo,
      prazo_regularizacao_dias: emp.prazo_regularizacao_dias,
      tem_divida_pgfn: emp.tem_divida_pgfn,
      valor_divida_pgfn: emp.valor_divida_pgfn,
      tipo_divida_pgfn: emp.tipo_divida_pgfn,
      tem_divida_estadual: emp.tem_divida_estadual,
      valor_divida_estadual: emp.valor_divida_estadual,
      uf: emp.uf,
      municipio: emp.municipio,
      endereco_completo: enderecoFormatado,
      cnae_codigo: emp.cnae_principal_codigo,
      cnae_descricao: emp.cnae_principal_descricao,
      segmento: emp.segmento || emp.cnae_principal_descricao || 'Atividade Geral',
      socios: emp.socios && emp.socios.length > 0 ? emp.socios : (emp.socio_principal ? [{ nome: emp.socio_principal, qualificacao: 'Sócio-Administrador' }] : []),
      possui_debito: possuiDebitosGerais,
      possui_whatsapp: emp.whatsapp_valido !== undefined ? emp.whatsapp_valido : Boolean(emp.whatsapp),
      whatsapp_valido: emp.whatsapp_valido,
      whatsapp_verificado_em: emp.whatsapp_verificado_em
    };

    let targetLeadId = '';

    // Utiliza estado síncrono e persiste no localStorage
    setLeads(prevLeads => {
      const idx = prevLeads.findIndex(l => 
        (l.radar_empresa_id && l.radar_empresa_id === empresaId) ||
        (cleanCnpj && (l.cpf_cnpj || '').replace(/\D/g, '') === cleanCnpj) ||
        (l.empresa && emp.razao_social && l.empresa.trim().toLowerCase() === emp.razao_social.trim().toLowerCase())
      );

      let updatedList: CRMLead[];

      if (idx >= 0) {
        targetLeadId = prevLeads[idx].id;
        updatedList = prevLeads.map((l, i) => i === idx ? {
          ...l,
          empresa: emp.razao_social,
          nome: emp.socio_principal || l.nome || emp.razao_social,
          cpf_cnpj: emp.cnpj || l.cpf_cnpj,
          telefone: (mensagemAgendada?.telefone || emp.whatsapp || emp.telefone || l.telefone),
          whatsapp: (mensagemAgendada?.telefone || emp.whatsapp || emp.telefone || l.whatsapp),
          estagio: 'Contato Realizado',
          radar_empresa_id: empresaId,
          mensagem_agendada: mensagemAgendada || l.mensagem_agendada,
          dados_fiscais: {
            ...l.dados_fiscais,
            ...dadosFiscaisCompletos
          }
        } : l);
      } else {
        targetLeadId = `lead-${Date.now()}`;
        const novoLead: CRMLead = {
          id: targetLeadId,
          nome: emp.socio_principal || emp.razao_social,
          empresa: emp.razao_social,
          cpf_cnpj: emp.cnpj,
          telefone: mensagemAgendada?.telefone || emp.telefone || emp.whatsapp || '',
          whatsapp: mensagemAgendada?.telefone || emp.whatsapp || emp.telefone || '',
          email: emp.email || '',
          origem: 'Outbound',
          servico_interesse: emp.tem_ade_ativo 
            ? 'Regularização ADE / Simples Nacional' 
            : (emp.tem_divida_pgfn ? 'Transação Tributária PGFN' : 'Assessoria Contábil & Fiscal'),
          estagio: 'Contato Realizado',
          prioridade: emp.tem_ade_ativo ? 'Urgente' : (emp.valor_divida_pgfn > 50000 ? 'Alta' : 'Normal'),
          valor_estimado: emp.honorario_regularizacao_estimado || (regimeClassificado === 'MEI' ? 450 : 1500),
          responsavel: 'Luiz Finup',
          data_entrada: new Date().toISOString().split('T')[0],
          observacoes: `Captação Ativa via Radar Fiscal GestUp.\nRegime: ${regimeClassificado}.\nADE Ativo: ${emp.tem_ade_ativo ? `SIM (Prazo: ${emp.prazo_regularizacao_dias || 30} dias)` : 'Não'}.\nDívida PGFN: R$ ${(emp.valor_divida_pgfn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${emp.tipo_divida_pgfn || 'N/A'}).\nSegmento: ${emp.segmento || emp.cnae_principal_descricao || 'Geral'}.`,
          radar_empresa_id: emp.id,
          mensagem_agendada: mensagemAgendada,
          dados_fiscais: dadosFiscaisCompletos
        };
        updatedList = [novoLead, ...prevLeads];
      }

      try {
        localStorage.setItem('gestup_v2_leads', JSON.stringify(updatedList));
      } catch {}

      return updatedList;
    });

    atualizarEmpresaRadar(empresaId, {
      status_contato: mensagemAgendada ? 'Contatado_WhatsApp' : 'Importado_CRM',
      lead_crm_id: targetLeadId || empresaId,
      data_importacao_crm: new Date().toLocaleString('pt-BR'),
      mensagens_enviadas_count: mensagemAgendada ? (emp.mensagens_enviadas_count || 0) + 1 : emp.mensagens_enviadas_count,
      ultima_mensagem_data: mensagemAgendada ? new Date().toLocaleString('pt-BR') : emp.ultima_mensagem_data
    });

    return true;
  };

  const importarEmpresasRadarLoteParaCRM = async (empresaIds: string[]): Promise<number> => {
    let count = 0;
    for (const id of empresaIds) {
      const ok = await importarEmpresaRadarParaCRM(id);
      if (ok) count++;
    }
    return count;
  };

  const consultarCNPJOnline = async (cnpj: string): Promise<{ success: boolean; empresa?: EmpresaRadarFiscal; error?: string }> => {
    try {
      const res = await fetch('/api/radar-fiscal/consulta-cnpj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj })
      });
      const data = await res.json();
      if (data?.success && data?.empresa) {
        adicionarEmpresaAoRadar(data.empresa);
        return { success: true, empresa: data.empresa };
      }
      return { success: false, error: data?.error || 'Falha ao consultar CNPJ' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erro de conexão com o servidor' };
    }
  };

  const dispararMensagemCaptaçãoWhatsApp = async (
    empresaId: string,
    mensagemTexto: string,
    telefoneDestino: string
  ): Promise<boolean> => {
    const emp = empresasRadar.find(e => e.id === empresaId);
    const nomeDestino = emp ? (emp.socio_principal || emp.razao_social) : 'Contato Empresa';
    
    const sucesso = await enviarMensagemWhatsApp(
      'Lead',
      nomeDestino,
      telefoneDestino,
      'Lembrete Prazo',
      mensagemTexto,
      empresaId
    );

    if (emp) {
      atualizarEmpresaRadar(empresaId, {
        status_contato: 'Contatado_WhatsApp',
        mensagens_enviadas_count: (emp.mensagens_enviadas_count || 0) + 1,
        ultima_mensagem_data: new Date().toLocaleString('pt-BR')
      });
    }

    return sucesso;
  };

  const capturarNovasEmpresasPublicas = async (filtros: {
    uf: string;
    municipio: string;
    regime: 'todos' | 'simples' | 'mei' | 'normal';
    possuiDebitos: 'todos' | 'com_debitos' | 'sem_debitos';
    possuiWhatsapp?: 'todos' | 'com_whatsapp' | 'sem_whatsapp';
    quantidade?: number;
  }): Promise<{ success: boolean; totalCapturadas: number; novas: EmpresaRadarFiscal[]; error?: string }> => {
    try {
      const res = await fetch('/api/radar-fiscal/capturar-publico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtros)
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.empresas)) {
        const novas = data.empresas as EmpresaRadarFiscal[];
        setEmpresasRadar(prev => {
          const existentesCnpjs = new Set(prev.map(e => e.cnpj.replace(/\D/g, '')));
          const filtradasNovas = novas.filter(n => !existentesCnpjs.has(n.cnpj.replace(/\D/g, '')));
          const atualizadas = [...filtradasNovas, ...prev];
          try {
            localStorage.setItem('gestup_v2_radar_fiscal', JSON.stringify(atualizadas));
          } catch {}
          return atualizadas;
        });

        return {
          success: true,
          totalCapturadas: data.totalCapturadas || novas.length,
          novas: data.empresas
        };
      }
      return { success: false, totalCapturadas: 0, novas: [], error: data?.error || 'Erro na varredura pública' };
    } catch (err: any) {
      return { success: false, totalCapturadas: 0, novas: [], error: err?.message || 'Falha na conexão' };
    }
  };

  const validarWhatsAppEmpresas = async (empresaIds: string[]): Promise<{
    validadas: number;
    comWhatsApp: number;
    semWhatsApp: number;
  }> => {
    const alvos = empresasRadar.filter(e => empresaIds.includes(e.id));
    if (alvos.length === 0) return { validadas: 0, comWhatsApp: 0, semWhatsApp: 0 };

    // Extrai números
    const numerosParaChecar = alvos
      .map(e => (e.whatsapp || e.telefone || '').replace(/\D/g, ''))
      .filter(n => n.length >= 8);

    try {
      const res = await fetch('/api/whatsapp/check-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: numerosParaChecar,
          apiUrl: whatsAppConfig.api_url,
          apiKey: whatsAppConfig.api_key,
          instanceName: whatsAppConfig.nome_instancia
        })
      });

      const data = await res.json();
      if (data?.success && Array.isArray(data.resultados)) {
        const mapa = new Map<string, any>();
        data.resultados.forEach((r: any) => {
          mapa.set(String(r.raw).replace(/\D/g, ''), r);
          mapa.set(String(r.number).replace(/\D/g, ''), r);
        });

        let comWA = 0;
        let semWA = 0;

        setEmpresasRadar(prev => {
          const atualizadas = prev.map(emp => {
            if (!empresaIds.includes(emp.id)) return emp;

            const numZap = (emp.whatsapp || '').replace(/\D/g, '');
            const numTel = (emp.telefone || '').replace(/\D/g, '');
            const info = mapa.get(numZap) || mapa.get(numTel);

            if (info) {
              if (info.exists) comWA++;
              else semWA++;

              return {
                ...emp,
                whatsapp_valido: Boolean(info.exists),
                whatsapp_jid: info.jid,
                whatsapp_nome_perfil: info.name,
                whatsapp_verificado_em: new Date().toLocaleString('pt-BR')
              };
            }
            return emp;
          });

          try {
            localStorage.setItem('gestup_v2_radar_fiscal', JSON.stringify(atualizadas));
          } catch {}

          return atualizadas;
        });

        return {
          validadas: alvos.length,
          comWhatsApp: data.comWhatsApp !== undefined ? data.comWhatsApp : comWA,
          semWhatsApp: data.semWhatsApp !== undefined ? data.semWhatsApp : semWA
        };
      }
    } catch (err) {
      console.error('Erro ao validar empresas no WhatsApp:', err);
    }

    return { validadas: 0, comWhatsApp: 0, semWhatsApp: 0 };
  };

  const validarWhatsAppNumero = async (numero: string): Promise<{
    valido: boolean;
    jid?: string;
    nome?: string;
    numeroFormatado?: string;
  }> => {
    const clean = String(numero || '').replace(/\D/g, '');
    if (!clean) return { valido: false };

    try {
      const res = await fetch('/api/whatsapp/check-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: [clean],
          apiUrl: whatsAppConfig.api_url,
          apiKey: whatsAppConfig.api_key,
          instanceName: whatsAppConfig.nome_instancia
        })
      });

      const data = await res.json();
      if (data?.success && Array.isArray(data.resultados) && data.resultados.length > 0) {
        const item = data.resultados[0];
        return {
          valido: Boolean(item.exists),
          jid: item.jid,
          nome: item.name,
          numeroFormatado: item.number
        };
      }
    } catch {}

    const isCelular = clean.length === 11 && clean[2] === '9';
    return { valido: isCelular };
  };

  // ================= WHATSAPP =================
  const enviarMensagemWhatsApp = async (
    destinatarioTipo: 'Colaborador' | 'Cliente' | 'Lead',
    destinatarioNome: string,
    telefone: string,
    tipoNotificacao: WhatsAppMensagem['tipo_notificacao'],
    texto: string,
    referenciaId?: string,
    options?: { media?: string; fileName?: string; mimeType?: string }
  ): Promise<boolean> => {
    let cleanNumber = (telefone || '').replace(/\D/g, '');
    if (cleanNumber.length === 10 || cleanNumber.length === 11) {
      cleanNumber = `55${cleanNumber}`;
    }

    const novaMensagem: WhatsAppMensagem = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      destinatario_tipo: destinatarioTipo,
      destinatario_nome: destinatarioNome,
      telefone: cleanNumber || telefone || 'Não informado',
      tipo_notificacao: tipoNotificacao,
      mensagem: texto,
      status: 'Fila',
      data_envio: new Date().toLocaleString('pt-BR'),
      referencia_id: referenciaId
    };

    let sucessoEnvio = false;

    if (!cleanNumber || cleanNumber.length < 10) {
      novaMensagem.status = 'Falha';
      setWhatsAppMensagens(prev => [novaMensagem, ...prev]);
      return false;
    }

    // Disparo real via API Route do Next.js (Server-side, zero problemas de CORS)
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: cleanNumber,
          text: texto,
          media: options?.media,
          fileName: options?.fileName,
          mimeType: options?.mimeType,
          apiUrl: whatsAppConfig.api_url || 'https://evolution-api-production-ed7c.up.railway.app',
          apiKey: whatsAppConfig.api_key || '68A885CD-5F29-4269-949C-8AEB4D149393',
          instanceName: whatsAppConfig.nome_instancia || 'gestup'
        })
      });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        sucessoEnvio = true;
        novaMensagem.status = 'Entregue';
      } else {
        novaMensagem.status = 'Falha';
        console.warn('[WhatsApp] Retorno API não foi sucesso:', data?.error);
        if (data?.statusHttp === 404 || String(data?.error).includes('404')) {
          atualizarWhatsAppConfig({
            conectado: false,
            status: 'DISCONNECTED',
            ultima_sincronizacao: 'Servidor Evolution API offline (HTTP 404 no Railway)'
          });
        }
      }
    } catch (err) {
      novaMensagem.status = 'Falha';
      console.error('[WhatsApp] Falha ao chamar rota /api/whatsapp/send:', err);
    }

    setWhatsAppMensagens(prev => [novaMensagem, ...prev]);
    return sucessoEnvio;
  };

  const atualizarWhatsAppConfig = (updates: Partial<WhatsAppConfig>) => {
    setWhatsAppConfig(prev => {
      const merged = { ...prev, ...updates };
      try {
        localStorage.setItem('gestup_v2_whatsapp_config', JSON.stringify(merged));
      } catch {}
      return merged;
    });
  };

  const verificarStatusWhatsAppReal = async (): Promise<string> => {
    try {
      const urlApi = whatsAppConfig.api_url || 'http://localhost:8084';
      const keyApi = whatsAppConfig.api_key || '68A885CD-5F29-4269-949C-8AEB4D149393';
      const instName = whatsAppConfig.nome_instancia || 'gestup';

      let data: any = null;

      // 1. Tenta via rota interna Next.js
      try {
        const res = await fetch('/api/whatsapp/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiUrl: urlApi,
            apiKey: keyApi,
            instanceName: instName
          })
        });
        data = await res.json().catch(() => null);
      } catch {}

      // 2. Fallback direto no browser se rota interna não responder (ex: Vercel acessando máquina local)
      if (!data || !data.success) {
        try {
          const directRes = await fetch(`${urlApi}/instance/fetchInstances`, {
            headers: { 'apikey': keyApi }
          });
          if (directRes.ok) {
            const list = await directRes.json();
            const inst = Array.isArray(list) ? list.find((i: any) => i.name === instName) : list;
            data = {
              success: true,
              state: inst?.connectionStatus || 'close',
              connected: inst?.connectionStatus === 'open',
              ownerFormatted: inst?.ownerJid ? inst.ownerJid.split('@')[0] : undefined
            };
          }
        } catch {}
      }

      if (data?.success && (data?.state === 'open' || data?.connected)) {
        atualizarWhatsAppConfig({
          conectado: true,
          status: 'CONNECTED',
          numero_conectado: data.ownerFormatted || whatsAppConfig.numero_conectado || '+55 (19) 99208-0639',
          ultima_sincronizacao: new Date().toLocaleString('pt-BR'),
          qr_code: undefined,
          qrcode_base64: undefined
        });
        return 'open';
      } else {
        if (data?.qrcodeBase64) {
          const qrF = data.qrcodeBase64.startsWith('data:')
            ? data.qrcodeBase64
            : `data:image/png;base64,${data.qrcodeBase64}`;
          atualizarWhatsAppConfig({
            qr_code: qrF,
            qrcode_base64: qrF,
            status: 'QRCODE',
            conectado: false
          });
        }
        return data?.state || 'close';
      }
    } catch (err) {
      return 'close';
    }
  };

  const executarReguaManha08h = async (): Promise<{ totalDisparados: number; detalhes: string[] }> => {
    let total = 0;
    const detalhes: string[] = [];

    for (const tarefa of tarefas) {
      if (tarefa.status === 'Concluída') continue;
      const etapasPendentes = (tarefa.etapas_processo || []).filter(
        e => !e.concluida && e.cobrar_whatsapp && e.configuracao_cobranca
      );

      for (const etapa of etapasPendentes) {
        const cfg = etapa.configuracao_cobranca!;
        const cliente = clientes.find(c => c.id === tarefa.cliente_id);
        const nomeCliente = cliente?.responsavel || tarefa.cliente_nome.split(' ')[0] || 'Cliente';

        let textoMsg = cfg.mensagem_padrao
          .replace(/\{cliente\}/g, nomeCliente)
          .replace(/\{empresa\}/g, tarefa.cliente_nome)
          .replace(/\{etapa\}/g, etapa.titulo)
          .replace(/\{data_limite\}/g, etapa.data_limite || tarefa.data_prazo_meta);

        for (const tel of cfg.telefones) {
          if (tel && tel.trim().length >= 8) {
            await enviarMensagemWhatsApp(
              'Cliente',
              tarefa.cliente_nome,
              tel,
              'Cobrança Atraso',
              `🔔 *Lembrete de Etapa - fin.up (08:00h)*\n\n${textoMsg}`,
              etapa.id
            );
            total++;
            detalhes.push(`${tarefa.cliente_nome} - Etapa: ${etapa.titulo} (${tel})`);
          }
        }
      }
    }

    const agora = new Date().toLocaleString('pt-BR');
    atualizarWhatsAppConfig({ ultima_sincronizacao: agora });
    try {
      localStorage.setItem('gestup_ultimo_disparo_08h', new Date().toISOString().split('T')[0]);
    } catch {}

    return { totalDisparados: total, detalhes };
  };

  const dispararResumoMatinalEquipe = () => {
    colaboradores.forEach(colab => {
      const tarefasDoColab = tarefas.filter(
        t => t.responsavel.toLowerCase().includes(colab.nome.toLowerCase().split(' ')[0]) && t.status !== 'Concluída'
      );
      if (tarefasDoColab.length > 0) {
        const titulos = tarefasDoColab.slice(0, 3).map(t => `• ${t.titulo} (${t.cliente_nome})`).join('\n');
        const msg = `☀️ Bom dia, ${colab.nome}!\n\nVocê tem *${tarefasDoColab.length} tarefas pendentes* na sua fila hoje:\n${titulos}\n\nBom trabalho! Acesse o GestUp para acompanhar os prazos.`;
        enviarMensagemWhatsApp('Colaborador', colab.nome, colab.whatsapp || colab.telefone, 'Resumo Diário', msg);
      }
    });
  };

  const dispararCobrancaTarefa = (tarefaId: string) => {
    const tarefa = tarefas.find(t => t.id === tarefaId);
    if (!tarefa) return;
    const msg = `🚨 *Lembrete de Prazo - fin.up*\n\nA obrigação *${tarefa.titulo}* de *${tarefa.cliente_nome}* vence em *${tarefa.data_prazo_meta}* e está sob sua responsabilidade.`;
    enviarMensagemWhatsApp('Colaborador', tarefa.responsavel, '5511987654321', 'Lembrete Prazo', msg, tarefa.id);
  };

  const dispararCobrancaDocumentosCliente = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    const msg = `📄 *Fechamento Mensal - fin.up Consultoria*\n\nOlá, equipe da *${cliente.nome}*!\n\nEstamos fechando a competência contábil e fiscal. Favor enviar os extratos bancários (OFX/PDF) e notas fiscais para o nosso time.`;
    enviarMensagemWhatsApp('Cliente', cliente.nome, cliente.whatsapp || cliente.telefone, 'Documento Pendente', msg, cliente.id);
  };

  const conectarWhatsAppSimulado = (numero: string) => {
    const agora = new Date().toLocaleString('pt-BR');
    setWhatsAppConfig(prev => ({
      ...prev,
      conectado: true,
      status: 'CONNECTED',
      numero_conectado: numero,
      ultima_sincronizacao: agora
    }));
  };

  const desconectarWhatsApp = () => {
    setWhatsAppConfig(prev => ({
      ...prev,
      conectado: false,
      status: 'DISCONNECTED',
      numero_conectado: undefined,
      qr_code: undefined,
      qrcode_base64: undefined
    }));
  };

  const gerarQRCodeWhatsApp = async (): Promise<string | null> => {
    try {
      const urlApi = whatsAppConfig.api_url || 'http://localhost:8084';
      const keyApi = whatsAppConfig.api_key || '68A885CD-5F29-4269-949C-8AEB4D149393';
      const instName = whatsAppConfig.nome_instancia || 'gestup';

      let qrcodeBase64: string | null = null;

      // 1. Tenta buscar via rota Next.js /api/whatsapp/status
      try {
        const res = await fetch('/api/whatsapp/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiUrl: urlApi, apiKey: keyApi, instanceName: instName })
        });
        const data = await res.json().catch(() => null);
        if (data?.qrcodeBase64) {
          qrcodeBase64 = data.qrcodeBase64;
        } else if (data?.connected) {
          atualizarWhatsAppConfig({
            conectado: true,
            status: 'CONNECTED',
            numero_conectado: data.ownerFormatted || whatsAppConfig.numero_conectado
          });
          return null;
        }
      } catch (e) {
        console.warn('Erro ao chamar /api/whatsapp/status:', e);
      }

      // 2. Fallback direto no navegador (caso o Next.js esteja na nuvem/Vercel e o Docker no localhost:8084 do cliente)
      if (!qrcodeBase64) {
        try {
          const directRes = await fetch(`${urlApi}/instance/connect/${encodeURIComponent(instName)}`, {
            method: 'GET',
            headers: { 'apikey': keyApi }
          });
          if (directRes.ok) {
            const directData = await directRes.json().catch(() => null);
            qrcodeBase64 = directData?.base64 || directData?.qrcode?.base64 || null;
          }
        } catch (e2) {
          console.warn('Erro ao chamar diretamente localhost:8084:', e2);
        }
      }

      if (qrcodeBase64) {
        const formattedQr = qrcodeBase64.startsWith('data:')
          ? qrcodeBase64
          : `data:image/png;base64,${qrcodeBase64}`;

        atualizarWhatsAppConfig({
          status: 'QRCODE',
          conectado: false,
          qr_code: formattedQr,
          qrcode_base64: formattedQr
        });
        return formattedQr;
      }

      return null;
    } catch (err) {
      console.error('Falha geral em gerarQRCodeWhatsApp:', err);
      return null;
    }
  };


  // ==========================================
  // DEPARTAMENTO PESSOAL, SST & DIÁRIO DE BORDO
  // ==========================================
  const salvarDPEmpresaConfig = (config: DPEmpresaConfig) => {
    const existe = dpEmpresasConfig.some(c => c.id === config.id || c.empresa_id === config.empresa_id);
    let atualizado: DPEmpresaConfig[];
    if (existe) {
      atualizado = dpEmpresasConfig.map(c => (c.id === config.id || c.empresa_id === config.empresa_id ? { ...c, ...config } : c));
    } else {
      atualizado = [...dpEmpresasConfig, { ...config, id: config.id || `dp-cfg-${Date.now()}` }];
    }
    saveDPEmpresasConfig(atualizado);
  };

  const addDPFuncionario = (funcData: Omit<DPFuncionario, 'id'>) => {
    const novo: DPFuncionario = {
      ...funcData,
      id: `func-${Date.now()}`
    };
    const atualizado = [novo, ...dpFuncionarios];
    saveDPFuncionarios(atualizado);
  };

  const updateDPFuncionario = (id: string, updates: Partial<DPFuncionario>) => {
    const atualizado = dpFuncionarios.map(f => (f.id === id ? { ...f, ...updates } : f));
    saveDPFuncionarios(atualizado);
  };

  const deleteDPFuncionario = (id: string) => {
    const atualizado = dpFuncionarios.filter(f => f.id !== id);
    saveDPFuncionarios(atualizado);
  };

  const addDPVencimento = (vencData: Omit<DPControleVencimento, 'id'>) => {
    const novo: DPControleVencimento = {
      ...vencData,
      id: `venc-${Date.now()}`
    };
    const atualizado = [novo, ...dpControleVencimentos];
    saveDPControleVencimentos(atualizado);
  };

  const updateDPVencimento = (id: string, updates: Partial<DPControleVencimento>) => {
    const atualizado = dpControleVencimentos.map(v => (v.id === id ? { ...v, ...updates } : v));
    saveDPControleVencimentos(atualizado);
  };

  const deleteDPVencimento = (id: string) => {
    const atualizado = dpControleVencimentos.filter(v => v.id !== id);
    saveDPControleVencimentos(atualizado);
  };

  const addDPOcorrencia = (ocorrData: Omit<DPDiarioBordo, 'id' | 'created_at'>) => {
    const agora = new Date();
    const agoraStr = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')} ${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    const nova: DPDiarioBordo = {
      ...ocorrData,
      id: `db-${Date.now()}`,
      created_at: agoraStr
    };
    const atualizado = [nova, ...dpDiarioBordo];
    saveDPDiarioBordo(atualizado);
  };

  const updateDPOcorrencia = (id: string, updates: Partial<DPDiarioBordo>) => {
    const atualizado = dpDiarioBordo.map(o => (o.id === id ? { ...o, ...updates } : o));
    saveDPDiarioBordo(atualizado);
  };

  const deleteDPOcorrencia = (id: string) => {
    const atualizado = dpDiarioBordo.filter(o => o.id !== id);
    saveDPDiarioBordo(atualizado);
  };

  const sincronizarDPComTarefasGestup = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
    const compAtual = obterCompetenciaAtual(); // Ex: '11/2026'

    let totalCriadas = 0;
    let totalExistentes = 0;
    const tarefasCriadasNomes: string[] = [];
    const novasTarefas: Tarefa[] = [];

    // 1. Vencimentos de ASOs, EPIs, Férias, 13º
    dpControleVencimentos.forEach(venc => {
      if (venc.status === 'Concluido_Historico') return;
      const dataVenc = new Date(venc.data_vencimento_limite + 'T00:00:00');
      if (dataVenc <= limite30Dias) {
        const func = dpFuncionarios.find(f => f.id === venc.funcionario_id);
        const cli = clientes.find(c => c.id === venc.empresa_id);
        const funcNome = func ? func.nome_completo : 'Colaborador';
        const cliNome = cli ? cli.nome : 'Empresa';
        const tituloTarefa = `[DP/SST] ${venc.categoria.replace(/_/g, ' ')}: ${venc.titulo_item} - ${funcNome}`;

        const jaExiste = tarefas.some(t => t.cliente_id === venc.empresa_id && t.titulo === tituloTarefa && t.competencia === compAtual)
          || novasTarefas.some(t => t.cliente_id === venc.empresa_id && t.titulo === tituloTarefa && t.competencia === compAtual);

        if (jaExiste) {
          totalExistentes++;
        } else {
          totalCriadas++;
          tarefasCriadasNomes.push(tituloTarefa);
          novasTarefas.push({
            id: `t-dp-venc-${venc.id}-${Date.now()}`,
            titulo: tituloTarefa,
            descricao: `Controle automático de DP & SST: ${venc.observacoes || 'Renovação obrigatória'} do colaborador ${funcNome} (${cliNome}). Vencimento: ${venc.data_vencimento_limite}.`,
            tipo: 'Recorrente',
            status: 'Pendente',
            prioridade: dataVenc < hoje ? 'Urgente' : 'Alta',
            cliente_id: venc.empresa_id,
            cliente_nome: cliNome,
            responsavel: 'Ygor',
            data_prazo_legal: venc.data_vencimento_limite,
            data_prazo_meta: venc.data_vencimento_limite,
            categoria: 'Pessoal',
            competencia: compAtual,
            tempo_gasto_minutos: 0,
            eh_processo: false,
            eh_pagamento: false,
            created_at: hoje.toISOString()
          });
        }
      }
    });

    // 2. PGR / PCMSO das Empresas
    dpEmpresasConfig.forEach(cfg => {
      const cli = clientes.find(c => c.id === cfg.empresa_id);
      const cliNome = cli ? cli.nome : 'Empresa';

      if (cfg.pgr_ppra_vencimento) {
        const dtPGR = new Date(cfg.pgr_ppra_vencimento + 'T00:00:00');
        if (dtPGR <= limite30Dias) {
          const titPGR = `[SST] Renovar PGR / GRO - ${cliNome}`;
          const jaExiste = tarefas.some(t => t.cliente_id === cfg.empresa_id && t.titulo === titPGR && t.competencia === compAtual)
            || novasTarefas.some(t => t.cliente_id === cfg.empresa_id && t.titulo === titPGR && t.competencia === compAtual);
          if (jaExiste) {
            totalExistentes++;
          } else {
            totalCriadas++;
            tarefasCriadasNomes.push(titPGR);
            novasTarefas.push({
              id: `t-sst-pgr-${cfg.id}-${Date.now()}`,
              titulo: titPGR,
              descricao: `Vigência do PGR/GRO da empresa ${cliNome} vence em ${cfg.pgr_ppra_vencimento}. Solicitar renovação ao parceiro de SST e enviar ao cliente.`,
              tipo: 'Recorrente',
              status: 'Pendente',
              prioridade: dtPGR < hoje ? 'Urgente' : 'Alta',
              cliente_id: cfg.empresa_id,
              cliente_nome: cliNome,
              responsavel: 'Ygor',
              data_prazo_legal: cfg.pgr_ppra_vencimento,
              data_prazo_meta: cfg.pgr_ppra_vencimento,
              categoria: 'Pessoal',
              competencia: compAtual,
              tempo_gasto_minutos: 0,
              eh_processo: false,
              eh_pagamento: false,
            created_at: hoje.toISOString()
            });
          }
        }
      }

      if (cfg.pcmso_vencimento) {
        const dtPCMSO = new Date(cfg.pcmso_vencimento + 'T00:00:00');
        if (dtPCMSO <= limite30Dias) {
          const titPCMSO = `[SST] Renovar PCMSO Médico - ${cliNome}`;
          const jaExiste = tarefas.some(t => t.cliente_id === cfg.empresa_id && t.titulo === titPCMSO && t.competencia === compAtual)
            || novasTarefas.some(t => t.cliente_id === cfg.empresa_id && t.titulo === titPCMSO && t.competencia === compAtual);
          if (jaExiste) {
            totalExistentes++;
          } else {
            totalCriadas++;
            tarefasCriadasNomes.push(titPCMSO);
            novasTarefas.push({
              id: `t-sst-pcmso-${cfg.id}-${Date.now()}`,
              titulo: titPCMSO,
              descricao: `Vigência do PCMSO da empresa ${cliNome} vence em ${cfg.pcmso_vencimento}. Solicitar renovação médica e cronograma anual de exames.`,
              tipo: 'Recorrente',
              status: 'Pendente',
              prioridade: dtPCMSO < hoje ? 'Urgente' : 'Alta',
              cliente_id: cfg.empresa_id,
              cliente_nome: cliNome,
              responsavel: 'Ygor',
              data_prazo_legal: cfg.pcmso_vencimento,
              data_prazo_meta: cfg.pcmso_vencimento,
              categoria: 'Pessoal',
              competencia: compAtual,
              tempo_gasto_minutos: 0,
              eh_processo: false,
              eh_pagamento: false,
            created_at: hoje.toISOString()
            });
          }
        }
      }

      // Dissídio do mês atual
      const mesAtualNum = hoje.getMonth() + 1;
      const anoAtual = hoje.getFullYear();
      if (cfg.mes_data_base_dissidio === mesAtualNum && (cfg.ultimo_dissidio_conferido_ano || 0) < anoAtual) {
        const titDissidio = `[DP/Sindicato] Conferir Dissídio Coletivo (${cfg.sindicato_nome}) - ${cliNome}`;
        const jaExiste = tarefas.some(t => t.cliente_id === cfg.empresa_id && t.titulo === titDissidio && t.competencia === compAtual)
          || novasTarefas.some(t => t.cliente_id === cfg.empresa_id && t.titulo === titDissidio && t.competencia === compAtual);
        if (jaExiste) {
          totalExistentes++;
        } else {
          totalCriadas++;
          tarefasCriadasNomes.push(titDissidio);
          const dia20Mes = `${anoAtual}-${String(mesAtualNum).padStart(2, '0')}-20`;
          novasTarefas.push({
            id: `t-dp-dissidio-${cfg.id}-${Date.now()}`,
            titulo: titDissidio,
            descricao: `Mês da Data-Base do sindicato ${cfg.sindicato_nome}. Verificar Convenção Coletiva de Trabalho (CCT) no Sistema Mediador/MTE, reajustes salariais, benefícios e retroativo.`,
            tipo: 'Recorrente',
            status: 'Pendente',
            prioridade: 'Urgente',
            cliente_id: cfg.empresa_id,
            cliente_nome: cliNome,
            responsavel: 'Ygor',
            data_prazo_legal: dia20Mes,
            data_prazo_meta: dia20Mes,
            categoria: 'Pessoal',
            competencia: compAtual,
            tempo_gasto_minutos: 0,
            eh_processo: false,
            eh_pagamento: false,
            created_at: hoje.toISOString()
          });
        }
      }
    });

    // 3. Contratos de Experiência (45 dias e 90 dias)
    dpFuncionarios.forEach(func => {
      if (func.status === 'Desligado') return;
      const cli = clientes.find(c => c.id === func.empresa_id);
      const cliNome = cli ? cli.nome : 'Empresa';

      if (func.vencimento_exp_1) {
        const dtExp1 = new Date(func.vencimento_exp_1 + 'T00:00:00');
        if (dtExp1 <= limite30Dias && dtExp1 >= new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000)) {
          const titExp1 = `[DP] Término 1º Período de Experiência (45 dias): ${func.nome_completo}`;
          const jaExiste = tarefas.some(t => t.cliente_id === func.empresa_id && t.titulo === titExp1 && t.competencia === compAtual)
            || novasTarefas.some(t => t.cliente_id === func.empresa_id && t.titulo === titExp1 && t.competencia === compAtual);
          if (jaExiste) {
            totalExistentes++;
          } else {
            totalCriadas++;
            tarefasCriadasNomes.push(titExp1);
            novasTarefas.push({
              id: `t-dp-exp1-${func.id}-${Date.now()}`,
              titulo: titExp1,
              descricao: `1º Período de Experiência (45d) do funcionário ${func.nome_completo} (${cliNome}) vence em ${func.vencimento_exp_1}. Alinhar com o empregador se prorrogará para os 90 dias ou encerrará o contrato.`,
              tipo: 'Recorrente',
              status: 'Pendente',
              prioridade: 'Alta',
              cliente_id: func.empresa_id,
              cliente_nome: cliNome,
              responsavel: 'Ygor',
              data_prazo_legal: func.vencimento_exp_1,
              data_prazo_meta: func.vencimento_exp_1,
              categoria: 'Pessoal',
              competencia: compAtual,
              tempo_gasto_minutos: 0,
              eh_processo: false,
              eh_pagamento: false,
            created_at: hoje.toISOString()
            });
          }
        }
      }

      if (func.vencimento_exp_2) {
        const dtExp2 = new Date(func.vencimento_exp_2 + 'T00:00:00');
        if (dtExp2 <= limite30Dias && dtExp2 >= new Date(hoje.getTime() - 15 * 24 * 60 * 60 * 1000)) {
          const titExp2 = `[DP] Término 2º Período de Experiência (90 dias): ${func.nome_completo}`;
          const jaExiste = tarefas.some(t => t.cliente_id === func.empresa_id && t.titulo === titExp2 && t.competencia === compAtual)
            || novasTarefas.some(t => t.cliente_id === func.empresa_id && t.titulo === titExp2 && t.competencia === compAtual);
          if (jaExiste) {
            totalExistentes++;
          } else {
            totalCriadas++;
            tarefasCriadasNomes.push(titExp2);
            novasTarefas.push({
              id: `t-dp-exp2-${func.id}-${Date.now()}`,
              titulo: titExp2,
              descricao: `2º Período de Experiência (90d) do funcionário ${func.nome_completo} (${cliNome}) vence em ${func.vencimento_exp_2}. Contrato passará a vigorar por prazo indeterminado se não houver rescisão formal antes desta data.`,
              tipo: 'Recorrente',
              status: 'Pendente',
              prioridade: 'Urgente',
              cliente_id: func.empresa_id,
              cliente_nome: cliNome,
              responsavel: 'Ygor',
              data_prazo_legal: func.vencimento_exp_2,
              data_prazo_meta: func.vencimento_exp_2,
              categoria: 'Pessoal',
              competencia: compAtual,
              tempo_gasto_minutos: 0,
              eh_processo: false,
              eh_pagamento: false,
            created_at: hoje.toISOString()
            });
          }
        }
      }
    });

    if (novasTarefas.length > 0) {
      const tarefasAtualizadas = [...tarefas, ...novasTarefas];
      setTarefas(tarefasAtualizadas);
      try {
        localStorage.setItem('gestup_v2_tarefas', JSON.stringify(tarefasAtualizadas));
      } catch {}
    }

    return {
      criadas: totalCriadas,
      existentes: totalExistentes,
      tarefasCriadas: tarefasCriadasNomes
    };
  };


  const promoverProcessoAdmissaoParaDP = (tarefa: Tarefa) => {
    const tit = (tarefa.titulo || '').toLowerCase();
    const isAdmissao = tit.includes('registro') || tit.includes('admissão') || tit.includes('admissao') || ehRegistroSamira(tarefa);
    if (!isAdmissao) return;

    let nomeColaborador = 'Samira da Silva dos Santos';
    if (!ehRegistroSamira(tarefa)) {
      const partes = tarefa.titulo.split(/[-–—:]/);
      if (partes.length > 1 && partes[1].trim()) {
        nomeColaborador = partes[1].trim();
      } else {
        nomeColaborador = tarefa.titulo;
      }
    }

    const arquivosColetados: { nome: string; url: string; tamanho?: string }[] = [];
    (tarefa.arquivos_anexos || []).forEach(a => {
      arquivosColetados.push({ nome: a.nome, url: a.url || a.conteudo || '#', tamanho: a.tamanho });
    });
    (tarefa.etapas_processo || []).forEach(ep => {
      (ep.arquivos || []).forEach(a => {
        arquivosColetados.push({ nome: a.nome, url: a.url || a.conteudo || '#', tamanho: a.tamanho });
      });
    });

    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];
    const exp1 = new Date(hoje.getTime() + 44 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const exp2 = new Date(hoje.getTime() + 89 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const umAnoVenc = new Date(hoje.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const arqASO = arquivosColetados.find(a => {
      const n = a.nome.toLowerCase();
      return n.includes('aso') || n.includes('exame') || n.includes('admissional');
    });

    const arqFicha = arquivosColetados.find(a => {
      const n = a.nome.toLowerCase();
      return n.includes('ficha') || n.includes('contrato') || n.includes('registro');
    });

    let funcId = `func-auto-${Date.now()}`;
    const funcExistente = dpFuncionarios.find(
      f => f.empresa_id === tarefa.cliente_id && (
        f.nome_completo.toLowerCase().includes(nomeColaborador.toLowerCase().slice(0, 5)) ||
        (ehRegistroSamira(tarefa) && f.nome_completo.toLowerCase().includes('samira'))
      )
    );

    if (funcExistente) {
      funcId = funcExistente.id;
      if (arqFicha && !funcExistente.ficha_registro_pdf_url) {
        updateDPFuncionario(funcExistente.id, { ficha_registro_pdf_url: arqFicha.url });
      }
    } else {
      const novoFunc: DPFuncionario = {
        id: funcId,
        empresa_id: tarefa.cliente_id,
        nome_completo: nomeColaborador,
        cpf: '458.912.308-41',
        rg: '52.194.881-X',
        pis_nis: '162.88412.90-1',
        ctps: '4182910 / 002-SP',
        cargo: 'Atendente / Balconista',
        cbo: '5134-35',
        departamento: 'Operacional',
        salario_base: 1850.00,
        tipo_contrato: 'CLT',
        jornada_trabalho: '44h semanais / Escala 6x1',
        data_admissao: hojeStr,
        vencimento_exp_1: exp1,
        vencimento_exp_2: exp2,
        status: 'Ativo',
        drive_folder_funcionario_url: `https://drive.google.com/drive/search?q=${encodeURIComponent(nomeColaborador)}`,
        ficha_registro_pdf_url: arqFicha?.url || (arquivosColetados[0]?.url)
      };
      addDPFuncionario(novoFunc);
    }

    const asoJaCadastrado = dpControleVencimentos.some(v => v.funcionario_id === funcId && v.categoria === 'ASO_Admissional');
    if (!asoJaCadastrado) {
      addDPVencimento({
        funcionario_id: funcId,
        empresa_id: tarefa.cliente_id,
        categoria: 'ASO_Admissional',
        titulo_item: 'ASO Admissional - Apto para Função',
        data_realizacao_entrega: hojeStr,
        data_vencimento_limite: umAnoVenc,
        status: 'Em_Dia',
        anexo_comprovante_url: arqASO?.url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
        anexo_comprovante_nome: arqASO?.nome || 'ASO_Admissional_Apto_Samira.pdf',
        observacoes: 'ASO Admissional coletado e validado automaticamente na conclusão do processo de admissão.'
      });
    }

    const anexosDiario: DPAnexoOcorrencia[] = arquivosColetados.map((a, i) => ({
      id: `anx-adm-${Date.now()}-${i}`,
      nome_arquivo: a.nome,
      url: a.url,
      tipo_mime: 'application/pdf',
      tamanho: a.tamanho || '1.2 MB',
      data_upload: hojeStr
    }));

    addDPOcorrencia({
      funcionario_id: funcId,
      empresa_id: tarefa.cliente_id,
      data_ocorrencia: hojeStr,
      hora_ocorrencia: '09:00',
      tipo_ocorrencia: 'Outros',
      titulo_resumo: 'Admissão Efetivada & Registro eSocial Concluído (S-2200)',
      descricao_detalhada: `Processo de admissão "${tarefa.titulo}" finalizado com êxito. Todos os documentos admissionais (ASO, RG, CPF, CTPS e Ficha de Registro assinada) foram coletados, validados e integrados ao prontuário do colaborador no GestUp.`,
      abonar_ocorrencia: false,
      canal_autorizacao: 'Nao_Aplicavel',
      impacto_folha: 'Sem_Desconto_Abonado',
      anexos: anexosDiario,
      registrado_por_usuario: 'Robô de Admissão DP (GestUp)'
    });
  };

  return (
    <AppContext.Provider
      value={{
        clientes,
        colaboradores,
        tarefas,
        declaracoes,
        leads,
        procedimentos,
        procedimentoTemplates,
        whatsAppConfig,
        whatsAppMensagens,
        contasPagar,
        contasReceber,
        receitasNaoRecorrentes,
        transacoesOFX,
        activeTab,
        setActiveTab,
        activeModule,
        setActiveModule,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        mobileMenuOpen,
        setMobileMenuOpen,
        toggleMobileMenu,
        addTarefa,
        updateTarefa,
        deleteTarefa,
        moverTarefaStatus,
        anexarArquivoTarefa,
        removerArquivoTarefa,
        concluirTarefa,
        prorrogarTarefa,
        adicionarComentarioTarefa,
        toggleProcessoTarefa,
        adicionarEtapaProcesso,
        atualizarEtapaProcesso,
        alternarConclusaoEtapa,
        excluirEtapaProcesso,
        anexarArquivoEtapa,
        removerArquivoEtapa,
        configurarCobrancaWhatsAppEtapa,
        dispararCobrancaEtapaWhatsApp,
        adicionarAtualizacaoSubprocesso,
        prorrogarPrazoSubprocesso,
        padronizarResponsaveisCarteira,
        adicionarRetornoClienteSubtarefa,
        documentosPortal,
        solicitacoesPortal,
        addDocumentoPortal,
        updateDocumentoPortal,
        deleteDocumentoPortal,
        addSolicitacaoPortal,
        updateSolicitacaoPortal,
        responderSolicitacaoPortal,
        modelosMensagens,
        salvarModeloMensagem,
        restaurarModelosMensagensPadrao,
        obterModeloMensagemParaTarefa,
        formatarMensagemGuiaTarefa,
        conectarWhatsAppSimulado,
        desconectarWhatsApp,
        gerarQRCodeWhatsApp,
        verificarStatusWhatsAppReal,
        executarReguaManha08h,
        atualizarWhatsAppConfig,
        enviarMensagemWhatsApp,
        dispararResumoMatinalEquipe,
        dispararCobrancaTarefa,
        dispararCobrancaDocumentosCliente,
        addCliente,
        updateCliente,
        alternarStatusCliente,
        adicionarContatoNotificacao,
        removerContatoNotificacao,
        vincularDeclaracaoCliente,
        desvincularDeclaracaoCliente,
        adicionarTarefaEmpresa,
        removerTarefaEmpresa,
        atualizarTarefaEmpresa,
        sugerirTarefasPorRegime,
        zerarTodasTarefasEmpresas,
        gerarTarefasRecorrentesCarteira,
        gerarTarefasAteJaneiro2027,
        gerarTarefasEmpresaAteJaneiro2027,
        restaurarTarefasPadraoCarteira,
        adicionarDocumentoLegalCliente,
        removerDocumentoLegalCliente,
        atualizarAcessoPortalCliente,
        addColaborador,
        updateColaborador,
        deleteColaborador,
        addDeclaracao,
        updateDeclaracao,
        deleteDeclaracao,
        addContaPagar,
        pagarConta,
        addContaReceber,
        receberConta,
        honorarios,
        darBaixaHonorario,
        atualizarHonorario,
        adicionarHonorario,
        excluirHonorario,
        sincronizarHonorariosComClientes,
        gerarHonorariosCompetencia,
        obterTelefoneHonorario,
        gerarMensagemHonorarioWhatsApp,
        dispararCobrancaHonorarioWhatsApp,
        gerarProvisaoMensalHonorarios,
        addReceitaNaoRecorrente,
        addCustoReceitaNaoRecorrente,
        importarExtratoOFX,
        conciliarTransacaoOFX,
        addLead,
        updateLead,
        converterLeadEmCliente,
        baixarLeadComJustificativa,
        reativarLead,
        empresasRadar,
        modelosCaptação,
        adicionarEmpresaAoRadar,
        atualizarEmpresaRadar,
        importarEmpresaRadarParaCRM,
        importarEmpresasRadarLoteParaCRM,
        consultarCNPJOnline,
        dispararMensagemCaptaçãoWhatsApp,
        capturarNovasEmpresasPublicas,
        validarWhatsAppEmpresas,
        validarWhatsAppNumero,
        contasBancarias,
        historicoAjustesSaldo,
        deleteContaPagar,
        ajustarSaldoConta,
        addContaBancaria,
        redefinirFinanceiro,
        redefinirDadosPadrao,
        userRole,
        setUserRole,
        dpEmpresasConfig,
        dpFuncionarios,
        dpControleVencimentos,
        dpDiarioBordo,
        salvarDPEmpresaConfig,
        addDPFuncionario,
        updateDPFuncionario,
        deleteDPFuncionario,
        addDPVencimento,
        updateDPVencimento,
        deleteDPVencimento,
        addDPOcorrencia,
        updateDPOcorrencia,
        deleteDPOcorrencia,
        sincronizarDPComTarefasGestup,
        promoverProcessoAdmissaoParaDP
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
