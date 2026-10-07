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
  TransacaoOFX
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
  initialContasReceber
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
  receitasNaoRecorrentes: ReceitaNaoRecorrente[];
  transacoesOFX: TransacaoOFX[];
  
  // Navegação
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeModule: 'operacional' | 'crm' | 'automacoes' | 'configuracoes';
  setActiveModule: (mod: 'operacional' | 'crm' | 'automacoes' | 'configuracoes') => void;

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

  // Ações de CRM
  addLead: (lead: Omit<CRMLead, 'id' | 'data_entrada'>) => void;
  updateLead: (id: string, updates: Partial<CRMLead>) => void;
  converterLeadEmCliente: (leadId: string) => void;

  // Ações de WhatsApp
  enviarMensagemWhatsApp: (
    destinatarioTipo: 'Colaborador' | 'Cliente' | 'Lead',
    destinatarioNome: string,
    telefone: string,
    tipoNotificacao: WhatsAppMensagem['tipo_notificacao'],
    texto: string,
    referenciaId?: string
  ) => void;
  atualizarWhatsAppConfig: (updates: Partial<WhatsAppConfig>) => void;
  dispararResumoMatinalEquipe: () => void;
  dispararCobrancaTarefa: (tarefaId: string) => void;
  dispararCobrancaDocumentosCliente: (clienteId: string) => void;
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

const enrichTarefa = (t: Tarefa): Tarefa => ({
  ...t,
  eh_pagamento: t.eh_pagamento ?? (t.categoria === 'Fiscal' || t.titulo.toLowerCase().includes('das') || t.titulo.toLowerCase().includes('inss') || t.titulo.toLowerCase().includes('fgts')),
  comentarios_lista: (t.comentarios_lista && t.comentarios_lista.length > 0) ? t.comentarios_lista : [
    {
      id: `cmt-init-${t.id}`,
      autor: t.responsavel || 'Equipe fin.up',
      data: '2026-10-05 09:00',
      texto: `Rotina operacional iniciada para a competência ${t.competencia}. Prazo Legal: ${t.data_prazo_legal}`
    }
  ]
});

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
    } catch {}
  }, []);

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

  const redefinirDadosPadrao = () => {
    try {
      localStorage.clear();
    } catch {}
    setClientes(initialClientes.map(enrichCliente));
    setTarefas(initialTarefas.map(enrichTarefa));
    setDeclaracoes((initialDeclaracoes as Declaracao[]).map(enrichDeclaracao));
    setContasPagar(initialContasPagar as ContaPagar[]);
    setContasReceber(initialContasReceber as ContaReceber[]);
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
  const enviarMensagemWhatsApp = (
    destinatarioTipo: 'Colaborador' | 'Cliente' | 'Lead',
    destinatarioNome: string,
    telefone: string,
    tipoNotificacao: WhatsAppMensagem['tipo_notificacao'],
    texto: string,
    referenciaId?: string
  ) => {
    const novaMensagem: WhatsAppMensagem = {
      id: `msg-${Date.now()}`,
      destinatario_tipo: destinatarioTipo,
      destinatario_nome: destinatarioNome,
      telefone: telefone.replace(/\D/g, '') || '5511999999999',
      tipo_notificacao: tipoNotificacao,
      mensagem: texto,
      status: 'Entregue',
      data_envio: new Date().toLocaleString('pt-BR'),
      referencia_id: referenciaId
    };
    setWhatsAppMensagens(prev => [novaMensagem, ...prev]);
  };

  const atualizarWhatsAppConfig = (updates: Partial<WhatsAppConfig>) => {
    setWhatsAppConfig(prev => ({ ...prev, ...updates }));
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
        addTarefa,
        updateTarefa,
        deleteTarefa,
        moverTarefaStatus,
        concluirTarefa,
        prorrogarTarefa,
        adicionarComentarioTarefa,
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
        gerarProvisaoMensalHonorarios,
        addReceitaNaoRecorrente,
        addCustoReceitaNaoRecorrente,
        importarExtratoOFX,
        conciliarTransacaoOFX,
        addLead,
        updateLead,
        converterLeadEmCliente,
        enviarMensagemWhatsApp,
        atualizarWhatsAppConfig,
        dispararResumoMatinalEquipe,
        dispararCobrancaTarefa,
        dispararCobrancaDocumentosCliente,
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
