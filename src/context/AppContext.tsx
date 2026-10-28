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
  ModeloMensagemCaptação
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
  initialModelosMensagens
} from '@/lib/mockData';
import {
  initialModelosCaptação,
  initialEmpresasRadar,
  classificarRegimeEmpresa
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
  ) => void;
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
  gerarQRCodeWhatsApp: () => void;
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
  dispararCobrancaHonorarioWhatsApp: (honorarioId: string) => void;

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
    quantidade?: number;
  }) => Promise<{ success: boolean; totalCapturadas: number; novas: EmpresaRadarFiscal[]; error?: string }>;

  redefinirDadosPadrao: () => void;
}

const enrichCliente = (c: Cliente): Cliente => ({
  ...c,
  receber_guias_whatsapp: c.receber_guias_whatsapp ?? true,
  data_inicio_contrato: c.data_inicio_contrato || c.data_contrato || '2026-01-15',
  data_renovacao_contrato: c.data_renovacao_contrato || '2027-01-15',
  contatos_notificacao: (c.contatos_notificacao && c.contatos_notificacao.length > 0) ? c.contatos_notificacao : [
    {
      id: `ct-princ-${c.id}`,
      nome: c.responsavel || c.nome.split(' ')[0] || 'Responsável',
      telefoneOuGrupo: c.whatsapp || c.telefone || '19999990000',
      tipo: 'Individual',
      principal: true
    },
    {
      id: `ct-grp-${c.id}`,
      nome: `Grupo Fiscal / Financeiro ${c.nome.split(' ')[0]}`,
      telefoneOuGrupo: `1203630${c.id.slice(0, 8)}@g.us`,
      tipo: 'Grupo',
      principal: false
    }
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
            telefones: ['19992803902', '19992080639'],
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
            telefones: ['19992803902'],
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
  const [clientes, setClientes] = useState<Cliente[]>(() => initialClientes.map(enrichCliente));
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(initialColaboradores);
  const [tarefas, setTarefas] = useState<Tarefa[]>(() => initialTarefas.map(enrichTarefa));
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

  // A TELA PRINCIPAL AGORA É O DASHBOARD (Power BI)
  const [activeModule, setActiveModule] = useState<'operacional' | 'crm' | 'automacoes' | 'configuracoes'>('operacional');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  // Modelos de Mensagens Personalizadas
  const [modelosMensagens, setModelosMensagens] = useState<ModeloMensagemTarefa[]>(initialModelosMensagens);

  // Radar Fiscal & Captação Ativa Receita / PGFN
  const [empresasRadar, setEmpresasRadar] = useState<EmpresaRadarFiscal[]>(initialEmpresasRadar);
  const [modelosCaptação, setModelosCaptação] = useState<ModeloMensagemCaptação[]>(initialModelosCaptação);

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
      if (savedTarefas) {
        try {
          const parsed = JSON.parse(savedTarefas);
          if (Array.isArray(parsed) && parsed.length > 0) setTarefas(parsed.map(enrichTarefa));
        } catch {}
      }
      const savedClientes = localStorage.getItem('gestup_v2_clientes');
      if (savedClientes) {
        try {
          const parsed = JSON.parse(savedClientes);
          if (Array.isArray(parsed) && parsed.length > 0) setClientes(parsed.map(enrichCliente));
        } catch {}
      }
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

      // 3. Honorários: Mantém estritamente competência 10/2026 para frente
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
            setHonorarios(filtradosHons.length > 0 ? filtradosHons : initialHonorarios);
          }
        } catch {}
      } else {
        setHonorarios(initialHonorarios);
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
        }
      } catch (err) {
        console.warn('Verificação de status do WhatsApp:', err);
      }
    };
    syncStatus();
  }, [whatsAppConfig.api_url, whatsAppConfig.api_key, whatsAppConfig.nome_instancia]);

  const saveTarefas = (newTarefas: Tarefa[]) => {
    setTarefas(newTarefas);
    try { localStorage.setItem('gestup_v2_tarefas', JSON.stringify(newTarefas)); } catch {}
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
  };

  // ================= TAREFAS =================
  const addTarefa = (tarefa: Omit<Tarefa, 'id' | 'created_at'>) => {
    const nova: Tarefa = {
      ...tarefa,
      id: `tar-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0]
    };
    saveTarefas([nova, ...tarefas]);
  };

  const updateTarefa = (id: string, updates: Partial<Tarefa>) => {
    const updated = tarefas.map(t => t.id === id ? { ...t, ...updates } : t);
    saveTarefas(updated);
  };

  const deleteTarefa = (id: string) => {
    saveTarefas(tarefas.filter(t => t.id !== id));
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

    const baseUrl = whatsAppConfig.dominio_publico || (typeof window !== 'undefined' ? window.location.origin : 'https://gestup.vercel.app');
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

  const concluirTarefa = (
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
    if (!tarefa) return;

    const cliente = clientes.find(c => c.id === tarefa.cliente_id);
    let guiaInfo = undefined;

    if (dadosGuia?.ehPagamento && dadosGuia.arquivoNome && dadosGuia.dataVencimento) {
      const enviarWhats = cliente?.receber_guias_whatsapp !== false;
      const clienteWhats = cliente?.whatsapp || cliente?.telefone || '';
      const clienteEmail = cliente?.email || '';

      const baseUrl = whatsAppConfig.dominio_publico || (typeof window !== 'undefined' ? window.location.origin : 'https://gestup.vercel.app');
      const nomeArquivoGuia = dadosGuia.arquivoNome || 'guia.pdf';
      const linkPortalGuia = `${baseUrl}/portal/guia?id=${tarefa.id}&arquivo=${encodeURIComponent(nomeArquivoGuia)}&comp=${encodeURIComponent(tarefa.competencia)}&cli=${encodeURIComponent(cliente?.nome || tarefa.cliente_nome)}&venc=${encodeURIComponent(dadosGuia.dataVencimento)}&val=${encodeURIComponent(dadosGuia.valor || '')}&tipo=${encodeURIComponent(tarefa.titulo)}`;

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

      // Dispara WhatsApp para o contato principal e contatos extras/grupos cadastrados
      if (enviarWhats) {
        const contatosAlvo = cliente?.contatos_notificacao?.length
          ? cliente.contatos_notificacao
          : [{ id: 'padrao', nome: cliente?.nome || 'Cliente', telefoneOuGrupo: clienteWhats, tipo: 'Individual' as const, principal: true }];

        contatosAlvo.forEach(ct => {
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

          enviarMensagemWhatsApp(
            'Cliente',
            `${cliente?.nome || tarefa.cliente_nome} (${ct.nome})`,
            ct.telefoneOuGrupo,
            'Documento Pendente',
            msgTexto,
            tarefa.id,
            {
              media: dadosGuia.arquivoConteudo,
              fileName: nomeArquivoGuia
            }
          );
        });
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
            telefones: ['19992803902'],
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
    updateTarefa(tarefaId, { etapas_processo: etapasAtuais });
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
      updates.responsavel !== undefined
    ) {
      let houveAlteracao = false;
      const updatedHons = honorarios.map(h => {
        if (h.cliente_id === id && h.status !== 'Pago') {
          houveAlteracao = true;
          let novaDataVenc = h.data_vencimento;
          if (updates.dia_vencimento !== undefined && h.data_vencimento) {
            const parts = h.data_vencimento.split('-');
            if (parts.length === 3) {
              novaDataVenc = `${parts[0]}-${parts[1]}-${String(updates.dia_vencimento).padStart(2, '0')}`;
            }
          }
          return {
            ...h,
            cliente_nome: updates.nome !== undefined ? updates.nome : h.cliente_nome,
            valor: updates.honorario_mensal !== undefined ? updates.honorario_mensal : h.valor,
            data_vencimento: novaDataVenc,
            contato_telefone: updates.whatsapp !== undefined ? updates.whatsapp : h.contato_telefone,
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

  // ================= COLABORADORES =================
  const addColaborador = (colaborador: Omit<Colaborador, 'id'>) => {
    const novo: Colaborador = { ...colaborador, id: `col-${Date.now()}` };
    setColaboradores([...colaboradores, novo]);
  };

  const updateColaborador = (id: string, updates: Partial<Colaborador>) => {
    setColaboradores(colaboradores.map(c => c.id === id ? { ...c, ...updates } : c));
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

  const dispararCobrancaHonorarioWhatsApp = (honorarioId: string) => {
    const hon = honorarios.find(h => h.id === honorarioId);
    if (!hon) return;

    const dataVencFormatada = hon.data_vencimento.split('-').reverse().join('/');
    const atrasoTexto = (hon.dias_atraso && hon.dias_atraso > 0)
      ? ` Constatamos que a obrigação venceu em *${dataVencFormatada}* (${hon.dias_atraso} dias em atraso).`
      : ` Lembramos que o vencimento é em *${dataVencFormatada}*.`;

    const msg = `🔔 *Lembrete de Honorários Contábeis - fin.up Consultoria*\n\n` +
      `Olá, *${hon.contato_nome || hon.cliente_nome}*!\n\n` +
      `Passando para alinhar os honorários contábeis da empresa *${hon.cliente_nome}* referente à *Competência ${hon.competencia}*.\n\n` +
      `💰 *Valor:* R$ ${hon.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `📅 *Vencimento:* ${dataVencFormatada}\n` +
      atrasoTexto + `\n\n` +
      `Chave PIX fin.up: *financeiro@finup.com.br* (PicPay Empresas)\n\n` +
      `Qualquer dúvida ou caso já tenha efetuado o pagamento, por favor nos envie o comprovante. Obrigado!`;

    enviarMensagemWhatsApp(
      'Cliente',
      hon.cliente_nome,
      hon.contato_telefone || '19999990000',
      'Honorário',
      msg,
      hon.id
    );
  };

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
      if (h.competencia === competenciaAlvo && h.status !== 'Pago') {
        const cli = clientes.find(c => c.id === h.cliente_id);
        if (cli && cli.honorario_mensal !== h.valor) {
          countAtualizados++;
          return {
            ...h,
            valor: cli.honorario_mensal,
            cliente_nome: cli.nome
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
    setLeads([novo, ...leads]);
  };

  const updateLead = (id: string, updates: Partial<CRMLead>) => {
    setLeads(leads.map(l => l.id === id ? { ...l, ...updates } : l));
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
    setLeads(prev => prev.map(l => {
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
    }));
  };

  const reativarLead = (leadId: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          estagio: 'Contato Realizado',
          observacoes: `${l.observacoes || ''}\n[REATIVADO em ${new Date().toLocaleString('pt-BR')}] Lead reativado no funil comercial.`.trim()
        };
      }
      return l;
    }));
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
    const leadExistente = leads.find(l => (l.cpf_cnpj || '').replace(/\D/g, '') === cleanCnpj);
    
    const idLead = leadExistente ? leadExistente.id : `lead-${Date.now()}`;
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
      possui_debito: possuiDebitosGerais
    };

    if (leadExistente) {
      setLeads(prev => prev.map(l => l.id === leadExistente.id ? {
        ...l,
        estagio: estagio || l.estagio,
        mensagem_agendada: mensagemAgendada || l.mensagem_agendada,
        dados_fiscais: {
          ...l.dados_fiscais,
          ...dadosFiscaisCompletos
        }
      } : l));
    } else {
      const novoLead: CRMLead = {
        id: idLead,
        nome: emp.socio_principal || emp.razao_social,
        empresa: emp.razao_social,
        cpf_cnpj: emp.cnpj,
        telefone: emp.telefone || emp.whatsapp || '',
        whatsapp: emp.whatsapp || emp.telefone || '',
        email: emp.email || '',
        origem: 'Outbound',
        servico_interesse: emp.tem_ade_ativo 
          ? 'Regularização ADE / Simples Nacional' 
          : (emp.tem_divida_pgfn ? 'Transação Tributária PGFN' : 'Assessoria Contábil & Fiscal'),
        estagio: estagio,
        prioridade: emp.tem_ade_ativo ? 'Urgente' : (emp.valor_divida_pgfn > 50000 ? 'Alta' : 'Normal'),
        valor_estimado: emp.honorario_regularizacao_estimado || (regimeClassificado === 'MEI' ? 450 : 1500),
        responsavel: 'Luiz Finup',
        data_entrada: new Date().toISOString().split('T')[0],
        observacoes: `Captação Ativa via Radar Fiscal GestUp.\nRegime: ${regimeClassificado}.\nADE Ativo: ${emp.tem_ade_ativo ? `SIM (Prazo: ${emp.prazo_regularizacao_dias || 30} dias)` : 'Não'}.\nDívida PGFN: R$ ${(emp.valor_divida_pgfn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${emp.tipo_divida_pgfn || 'N/A'}).\nSegmento: ${emp.segmento || emp.cnae_principal_descricao || 'Geral'}.`,
        radar_empresa_id: emp.id,
        mensagem_agendada: mensagemAgendada,
        dados_fiscais: dadosFiscaisCompletos
      };
      setLeads(prev => [novoLead, ...prev]);
    }

    atualizarEmpresaRadar(empresaId, {
      status_contato: mensagemAgendada ? 'Contatado_WhatsApp' : 'Importado_CRM',
      lead_crm_id: idLead,
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
      telefone: cleanNumber || '5511999999999',
      tipo_notificacao: tipoNotificacao,
      mensagem: texto,
      status: 'Entregue',
      data_envio: new Date().toLocaleString('pt-BR'),
      referencia_id: referenciaId
    };

    let sucessoEnvio = false;

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
        console.warn('[WhatsApp] Retorno API não foi sucesso:', data?.error);
      }
    } catch (err) {
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
      const res = await fetch('/api/whatsapp/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: whatsAppConfig.api_url || 'https://evolution-api-production-ed7c.up.railway.app',
          apiKey: whatsAppConfig.api_key || '68A885CD-5F29-4269-949C-8AEB4D149393',
          instanceName: whatsAppConfig.nome_instancia || 'gestup'
        })
      });
      const data = await res.json().catch(() => null);
      if (data?.success && data?.state === 'open') {
        atualizarWhatsAppConfig({
          conectado: true,
          status: 'CONNECTED',
          numero_conectado: data.ownerFormatted || whatsAppConfig.numero_conectado || '+55 (19) 99208-0639',
          ultima_sincronizacao: new Date().toLocaleString('pt-BR')
        });
        return 'open';
      } else {
        return data?.state || 'disconnected';
      }
    } catch (err) {
      console.warn('Erro ao checar status:', err);
      return 'error';
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
      numero_conectado: undefined
    }));
  };

  const gerarQRCodeWhatsApp = () => {
    setWhatsAppConfig(prev => ({
      ...prev,
      status: 'QRCODE',
      conectado: false
    }));
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
        addColaborador,
        updateColaborador,
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
        contasBancarias,
        historicoAjustesSaldo,
        deleteContaPagar,
        ajustarSaldoConta,
        addContaBancaria,
        redefinirFinanceiro,
        redefinirDadosPadrao
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
