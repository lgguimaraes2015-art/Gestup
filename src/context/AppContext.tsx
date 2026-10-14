'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Cliente,
  Colaborador,
  Tarefa,
  StatusTarefa,
  Declaracao,
  CRMLead,
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
  ConfiguracaoCobrancaEtapa
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
  initialHonorarios
} from '@/lib/mockData';

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
  
  // Navegação
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeModule: 'operacional' | 'crm' | 'automacoes' | 'configuracoes';
  setActiveModule: (mod: 'operacional' | 'crm' | 'automacoes' | 'configuracoes') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;

  // Ações de Tarefas
  addTarefa: (tarefa: Omit<Tarefa, 'id' | 'created_at'>) => void;
  updateTarefa: (id: string, updates: Partial<Tarefa>) => void;
  deleteTarefa: (id: string) => void;
  moverTarefaStatus: (tarefaId: string, novoStatus: StatusTarefa) => void;
  concluirTarefa: (
    id: string,
    dadosGuia?: {
      ehPagamento: boolean;
      arquivoNome?: string;
      dataVencimento?: string;
      valor?: number;
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
    referenciaId?: string
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
  addContaReceber: (conta: Omit<ContaReceber, 'id'>) => void;
  receberConta: (id: string, dataRecebimento?: string) => void;
  gerarProvisaoMensalHonorarios: (mesRef: string) => void;
  addReceitaNaoRecorrente: (receita: Omit<ReceitaNaoRecorrente, 'id' | 'created_at'>) => void;
  addCustoReceitaNaoRecorrente: (receitaId: string, custo: Omit<CustoVinculadoReceita, 'id'>) => void;
  importarExtratoOFX: (banco: 'PicPay Empresas' | 'Outro', transacoes: Omit<TransacaoOFX, 'id'>[]) => void;
  conciliarTransacaoOFX: (transacaoId: string, referenciaDescricao: string) => void;

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
  gerarHonorariosCompetencia: (competenciaAlvo: string) => void;
  dispararCobrancaHonorarioWhatsApp: (honorarioId: string) => void;

  // Ações de CRM
  addLead: (lead: Omit<CRMLead, 'id' | 'data_entrada'>) => void;
  updateLead: (id: string, updates: Partial<CRMLead>) => void;
  converterLeadEmCliente: (leadId: string) => void;

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
            telefones: ['19992803902', '19999870840'],
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

  // Estados Financeiros
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>(initialContasPagar as ContaPagar[]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>(initialContasReceber as ContaReceber[]);
  const [honorarios, setHonorarios] = useState<HonorarioItem[]>(initialHonorarios);
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
        const parsed = JSON.parse(savedTarefas);
        if (parsed.length >= 50) setTarefas(parsed.map(enrichTarefa));
      }
      const savedClientes = localStorage.getItem('gestup_v2_clientes');
      if (savedClientes) {
        const parsed = JSON.parse(savedClientes);
        if (parsed.length >= 10) setClientes(parsed.map(enrichCliente));
      }
      const savedDeclaracoes = localStorage.getItem('gestup_v2_declaracoes');
      if (savedDeclaracoes) setDeclaracoes((JSON.parse(savedDeclaracoes) as Declaracao[]).map(enrichDeclaracao));
      const savedPagar = localStorage.getItem('gestup_v2_contas_pagar');
      if (savedPagar) setContasPagar(JSON.parse(savedPagar));
      const savedReceber = localStorage.getItem('gestup_v2_contas_receber');
      if (savedReceber) setContasReceber(JSON.parse(savedReceber));
      const savedHonorarios = localStorage.getItem('gestup_v2_honorarios');
      if (savedHonorarios) setHonorarios(JSON.parse(savedHonorarios));
      const savedWhatsApp = localStorage.getItem('gestup_v2_whatsapp_config');
      if (savedWhatsApp) {
        const parsed = JSON.parse(savedWhatsApp);
        setWhatsAppConfig(prev => ({
          ...prev,
          ...parsed,
          api_url: parsed.api_url || 'https://evolution-api-production-ed7c.up.railway.app',
          api_key: parsed.api_key || 'e74e3e545d217c1598f490d802b2ba61cff2a937a2f532cc987cb745f133a28a',
          nome_instancia: parsed.nome_instancia || 'gestup'
        }));
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
            apiKey: whatsAppConfig.api_key || 'e74e3e545d217c1598f490d802b2ba61cff2a937a2f532cc987cb745f133a28a',
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

  const redefinirDadosPadrao = () => {
    try {
      localStorage.clear();
    } catch {}
    setClientes(initialClientes.map(enrichCliente));
    setTarefas(initialTarefas.map(enrichTarefa));
    setDeclaracoes((initialDeclaracoes as Declaracao[]).map(enrichDeclaracao));
    setContasPagar(initialContasPagar as ContaPagar[]);
    setContasReceber(initialContasReceber as ContaReceber[]);
    setHonorarios(initialHonorarios);
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

  const concluirTarefa = (
    id: string,
    dadosGuia?: {
      ehPagamento: boolean;
      arquivoNome?: string;
      dataVencimento?: string;
      valor?: number;
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

      guiaInfo = {
        arquivo_nome: dadosGuia.arquivoNome,
        arquivo_url: `https://gestup.app/portal/guias/${encodeURIComponent(dadosGuia.arquivoNome)}`,
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
          : [{ id: 'padrao', nome: cliente?.nome || 'Cliente', telefoneOuGrupo: clienteWhats, tipo: 'Individual', principal: true }];

        const dataVencFormatada = dadosGuia.dataVencimento.split('-').reverse().join('/');
        const valorFormatado = dadosGuia.valor
          ? `💰 *Valor:* R$ ${dadosGuia.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
          : '';

        const nomeArquivoGuia = dadosGuia.arquivoNome || 'guia.pdf';

        contatosAlvo.forEach(ct => {
          const msgTexto = `📄 *Guia de Pagamento Disponível - fin.up Consultoria*\n\n` +
            `Olá, *${ct.nome}*!\n\n` +
            `A obrigação *${tarefa.titulo}* da empresa *${cliente?.nome || tarefa.cliente_nome}* (Competência ${tarefa.competencia}) foi concluída e a guia está liberada.\n\n` +
            `📅 *Vencimento:* ${dataVencFormatada}\n` +
            valorFormatado +
            `📎 *Documento:* ${nomeArquivoGuia}\n\n` +
            `🔗 *Acesse ou baixe a sua guia diretamente pelo link:*\n` +
            `https://gestup.app/portal/guias/${encodeURIComponent(nomeArquivoGuia)}\n\n` +
            `Favor providenciar o pagamento até o vencimento para evitar encargos. Estamos à disposição!`;

          enviarMensagemWhatsApp(
            'Cliente',
            `${cliente?.nome} (${ct.nome})`,
            ct.telefoneOuGrupo,
            'Documento Pendente',
            msgTexto,
            tarefa.id
          );
        });
      }
    }

    updateTarefa(id, {
      status: 'Concluída',
      data_conclusao: new Date().toISOString().split('T')[0],
      eh_pagamento: dadosGuia?.ehPagamento || false,
      guia_pagamento: guiaInfo
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

  // ================= WHATSAPP =================
  const enviarMensagemWhatsApp = async (
    destinatarioTipo: 'Colaborador' | 'Cliente' | 'Lead',
    destinatarioNome: string,
    telefone: string,
    tipoNotificacao: WhatsAppMensagem['tipo_notificacao'],
    texto: string,
    referenciaId?: string
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
          apiUrl: whatsAppConfig.api_url || 'https://evolution-api-production-ed7c.up.railway.app',
          apiKey: whatsAppConfig.api_key || 'e74e3e545d217c1598f490d802b2ba61cff2a937a2f532cc987cb745f133a28a',
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
          apiKey: whatsAppConfig.api_key || 'e74e3e545d217c1598f490d802b2ba61cff2a937a2f532cc987cb745f133a28a',
          instanceName: whatsAppConfig.nome_instancia || 'gestup'
        })
      });
      const data = await res.json().catch(() => null);
      if (data?.success && data?.state === 'open') {
        atualizarWhatsAppConfig({
          conectado: true,
          status: 'CONNECTED',
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
        addTarefa,
        updateTarefa,
        deleteTarefa,
        moverTarefaStatus,
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
