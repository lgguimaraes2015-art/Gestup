'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CRMLead, CRMLeadEstagio, MensagemAgendadaWhatsApp } from '@/types';
import { parseDataHoraAgendada } from '@/lib/mockRadarFiscal';
import {
  TrendingUp,
  DollarSign,
  Building,
  ArrowRight,
  MessageSquare,
  Sparkles,
  X,
  Target,
  ShieldAlert,
  MapPin,
  Calendar,
  Tag,
  CheckCircle2,
  Users,
  RotateCcw,
  Archive,
  UserX,
  FileText,
  ExternalLink,
  Send,
  Copy,
  Check,
  Edit3,
  Eye,
  Clock,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface CRMLeadsViewProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const estagios: CRMLeadEstagio[] = [
  'Novo Lead',
  'Contato Realizado',
  'Qualificação',
  'Proposta Enviada',
  'Negociação',
  'Fechado'
];

export function CRMLeadsView({ modalOpen, setModalOpen }: CRMLeadsViewProps) {
  const {
    leads,
    addLead,
    updateLead,
    converterLeadEmCliente,
    baixarLeadComJustificativa,
    reativarLead,
    colaboradores,
    enviarMensagemWhatsApp,
    validarWhatsAppNumero,
    empresasRadar,
    setActiveTab
  } = useApp();

  const [novoNome, setNovoNome] = useState('');
  const [novoEmpresa, setNovoEmpresa] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoServico, setNovoServico] = useState('Consultoria Financeira & BPO');
  const [novoValor, setNovoValor] = useState(2500);
  const [novoResponsavel, setNovoResponsavel] = useState(colaboradores[0]?.nome || '');

  // Feedback de Onboarding
  const [leadConvertidoFeedback, setLeadConvertidoFeedback] = useState<string | null>(null);

  // Modo de visualização: Funil Ativo vs Leads Baixados
  const [modoExibicao, setModoExibicao] = useState<'funil' | 'baixados'>('funil');

  // Modal de Baixa de Lead com Justificativa
  const [modalBaixaOpen, setModalBaixaOpen] = useState(false);
  const [leadParaBaixar, setLeadParaBaixar] = useState<CRMLead | null>(null);
  const [motivoBaixa, setMotivoBaixa] = useState('Sem interesse no momento');
  const [justificativaBaixa, setJustificativaBaixa] = useState('');

  // Modal de Visualização e Edição de Mensagem WhatsApp
  const [modalMensagemOpen, setModalMensagemOpen] = useState(false);
  const [leadMensagemAtivo, setLeadMensagemAtivo] = useState<CRMLead | null>(null);
  const [textoMensagemEditavel, setTextoMensagemEditavel] = useState('');
  const [telefoneDestinoMensagem, setTelefoneDestinoMensagem] = useState('');
  const [dataHoraAgendamento, setDataHoraAgendamento] = useState('');
  const [statusAgendamento, setStatusAgendamento] = useState<'Agendada' | 'Enviada' | 'Cancelada'>('Agendada');
  const [abaVisualizacaoModal, setAbaVisualizacaoModal] = useState<'editor' | 'preview'>('editor');
  const [feedbackMensagem, setFeedbackMensagem] = useState<string | null>(null);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);
  const [copiadoFeedback, setCopiadoFeedback] = useState(false);
  const [validandoNumeroCRM, setValidandoNumeroCRM] = useState(false);
  const [feedbackNumeroCRM, setFeedbackNumeroCRM] = useState<{ valido: boolean; msg: string } | null>(null);

  const leadsAtivos = leads.filter(l => l.estagio !== 'Perdido');
  const leadsBaixados = leads.filter(l => l.estagio === 'Perdido');

  const valorTotalPipeline = leadsAtivos
    .filter(l => l.estagio !== 'Fechado')
    .reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

  const valorFechado = leadsAtivos
    .filter(l => l.estagio === 'Fechado')
    .reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

  // Gerador de mensagem padrão de abordagem se não houver mensagem agendada prévia
  const gerarMensagemPadraoLead = (lead: CRMLead): string => {
    const primeiroNome = lead.nome ? lead.nome.split(' ')[0] : 'Empreendedor(a)';
    const nomeEmpresa = lead.empresa || lead.nome;

    if (lead.dados_fiscais?.tem_ade_ativo) {
      return `Olá, ${primeiroNome}! Tudo bem? Sou Luiz da fin.up contabilidade.\n\nIdentificamos que a empresa ${nomeEmpresa} possui notificação de ADE na Receita Federal com prazo de regularização de aproximadamente ${lead.dados_fiscais.prazo_regularizacao_dias || 30} dias para evitar a exclusão do Simples Nacional.\n\nPoderíamos agendar um alinhamento rápido para te apresentar um plano de regularização e parcelamento especial?`;
    }

    if (lead.dados_fiscais?.tem_divida_pgfn && (lead.dados_fiscais.valor_divida_pgfn || 0) > 0) {
      const valorFormatado = (lead.dados_fiscais.valor_divida_pgfn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      return `Olá, ${primeiroNome}! Sou Luiz da equipe de Gestão Tributária da fin.up.\n\nConstatamos inscrições de Dívida Ativa da União (PGFN) no valor aproximado de R$ ${valorFormatado} vinculadas ao CNPJ da ${nomeEmpresa}.\n\nEstão abertos editais com até 70% de desconto em juros e multas para transação tributária. Gostaria de uma simulação gratuita?`;
    }

    return `Olá, ${primeiroNome}! Tudo bem? Sou Luiz da fin.up.\n\nGostaria de saber como podemos avançar na proposta de ${lead.servico_interesse || 'Assessoria Contábil & Financeira'} para a ${nomeEmpresa}!\n\nPodemos conversar hoje para tirar qualquer dúvida?`;
  };

  // Substituição dinâmica de TAGs para visualização e envio
  const resolverTagsMensagem = (texto: string, lead: CRMLead | null): string => {
    if (!texto || !lead) return texto || '';
    const primeiroNome = lead.nome ? lead.nome.split(' ')[0] : 'Empreendedor(a)';
    const nomeEmpresa = lead.empresa || lead.nome;
    const valorDebito = (lead.dados_fiscais?.valor_divida_pgfn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const diasAde = lead.dados_fiscais?.prazo_regularizacao_dias ? String(lead.dados_fiscais.prazo_regularizacao_dias) : '30';

    return texto
      .replace(/{socio}/g, primeiroNome)
      .replace(/{empresa}/g, nomeEmpresa)
      .replace(/{cnpj}/g, lead.cpf_cnpj || '')
      .replace(/{cidade}/g, lead.dados_fiscais?.municipio || '')
      .replace(/{regime}/g, lead.dados_fiscais?.regime || 'Simples Nacional')
      .replace(/{valor_debito}/g, `R$ ${valorDebito}`)
      .replace(/{prazo_dias}/g, diasAde)
      .replace(/{servico}/g, lead.servico_interesse || 'Assessoria Contábil')
      .replace(/{cnae}/g, lead.dados_fiscais?.cnae_descricao || lead.dados_fiscais?.segmento || 'Atividade Comercial');
  };

  // Regra Estrita: Verifica se a mensagem já foi enviada ou se o horário de disparo já foi atingido
  const isMensagemJaEnviada = (lead: CRMLead | null): boolean => {
    if (!lead?.mensagem_agendada) return false;
    if (lead.mensagem_agendada.status === 'Enviada') return true;
    if (lead.mensagem_agendada.status === 'Agendada' && lead.mensagem_agendada.data_hora_agendada) {
      const dt = parseDataHoraAgendada(lead.mensagem_agendada.data_hora_agendada);
      if (dt && new Date().getTime() >= dt.getTime()) return true;
    }
    return false;
  };

  // Abrir Modal de Visualização & Edição de Mensagem
  const handleAbrirModalMensagem = (lead: CRMLead) => {
    setLeadMensagemAtivo(lead);
    const msg = lead.mensagem_agendada?.mensagem || gerarMensagemPadraoLead(lead);
    setTextoMensagemEditavel(msg);
    setTelefoneDestinoMensagem(lead.whatsapp || lead.telefone || '');
    setDataHoraAgendamento(lead.mensagem_agendada?.data_hora_agendada || '');
    const jaEnviada = isMensagemJaEnviada(lead);
    setStatusAgendamento(jaEnviada ? 'Enviada' : (lead.mensagem_agendada?.status || 'Agendada'));
    setFeedbackMensagem(null);
    setFeedbackNumeroCRM(
      lead.dados_fiscais?.whatsapp_valido === true
        ? { valido: true, msg: '✓ WhatsApp ativo verificado' }
        : (lead.dados_fiscais?.whatsapp_valido === false ? { valido: false, msg: '⚠️ Contato cadastrado sem WhatsApp (Fixo)' } : null)
    );
    setAbaVisualizacaoModal(jaEnviada ? 'preview' : 'editor');
    setModalMensagemOpen(true);
  };

  // Validar número avulso no CRM via Evolution API
  const handleValidarNumeroCRM = async () => {
    if (!telefoneDestinoMensagem.trim()) return;
    setValidandoNumeroCRM(true);
    setFeedbackNumeroCRM(null);

    const res = await validarWhatsAppNumero(telefoneDestinoMensagem);
    setValidandoNumeroCRM(false);

    if (res.valido) {
      setFeedbackNumeroCRM({
        valido: true,
        msg: res.nome ? `✓ WhatsApp ativo confirmado! Perfil: ${res.nome}` : `✓ WhatsApp ativo confirmado para este número!`
      });
    } else {
      setFeedbackNumeroCRM({
        valido: false,
        msg: `❌ Este número não possui conta WhatsApp ativa (ou é telefone fixo).`
      });
    }
  };

  // Salvar Alterações na Mensagem do Lead (Permitido estritamente antes do horário de disparo)
  const handleSalvarMensagemLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadMensagemAtivo) return;

    if (isMensagemJaEnviada(leadMensagemAtivo)) {
      setFeedbackMensagem('⚠️ Mensagem já disparada ou com horário de agendamento atingido. Edição bloqueada por auditoria.');
      return;
    }

    const agendamentoAtualizado: MensagemAgendadaWhatsApp = {
      id: leadMensagemAtivo.mensagem_agendada?.id || `msg-${Date.now()}`,
      data_hora_agendada: dataHoraAgendamento || leadMensagemAtivo.mensagem_agendada?.data_hora_agendada || new Date().toLocaleString('pt-BR'),
      telefone: telefoneDestinoMensagem,
      mensagem: textoMensagemEditavel,
      status: statusAgendamento,
      created_at: leadMensagemAtivo.mensagem_agendada?.created_at || new Date().toLocaleString('pt-BR')
    };

    updateLead(leadMensagemAtivo.id, {
      whatsapp: telefoneDestinoMensagem,
      telefone: telefoneDestinoMensagem,
      mensagem_agendada: agendamentoAtualizado
    });

    setFeedbackMensagem('✓ Mensagem e agendamento atualizados com sucesso no lead!');
    setTimeout(() => {
      setModalMensagemOpen(false);
      setFeedbackMensagem(null);
      setLeadMensagemAtivo(null);
    }, 1500);
  };

  // Disparo Imediato pela Evolution API a partir do CRM
  const handleDispararPeloApp = async () => {
    if (!leadMensagemAtivo || !telefoneDestinoMensagem) return;
    setEnviandoMensagem(true);
    setFeedbackMensagem(null);

    const textoFinal = resolverTagsMensagem(textoMensagemEditavel, leadMensagemAtivo);

    const ok = await enviarMensagemWhatsApp(
      'Lead',
      leadMensagemAtivo.nome,
      telefoneDestinoMensagem,
      'Lembrete Prazo',
      textoFinal,
      leadMensagemAtivo.id
    );

    const agendamentoAtualizado: MensagemAgendadaWhatsApp = {
      id: leadMensagemAtivo.mensagem_agendada?.id || `msg-${Date.now()}`,
      data_hora_agendada: new Date().toLocaleString('pt-BR'),
      telefone: telefoneDestinoMensagem,
      mensagem: textoFinal,
      status: 'Enviada',
      created_at: leadMensagemAtivo.mensagem_agendada?.created_at || new Date().toLocaleString('pt-BR')
    };

    updateLead(leadMensagemAtivo.id, {
      whatsapp: telefoneDestinoMensagem,
      telefone: telefoneDestinoMensagem,
      mensagem_agendada: agendamentoAtualizado
    });

    setEnviandoMensagem(false);
    if (ok) {
      setFeedbackMensagem('🚀 Mensagem disparada com sucesso via WhatsApp oficial!');
    } else {
      setFeedbackMensagem('Instância oficial remota offline. Utilize o botão "Abrir no WhatsApp Web"!');
    }

    setTimeout(() => {
      setModalMensagemOpen(false);
      setFeedbackMensagem(null);
      setLeadMensagemAtivo(null);
    }, 2000);
  };

  // Gerar link direto wa.me com a mensagem editada
  const gerarLinkWaMe = (): string => {
    if (!leadMensagemAtivo) return '#';
    let clean = (telefoneDestinoMensagem || '').replace(/\D/g, '');
    if (clean.length === 10 || clean.length === 11) clean = `55${clean}`;
    const textoFinal = resolverTagsMensagem(textoMensagemEditavel, leadMensagemAtivo);
    return `https://wa.me/${clean}?text=${encodeURIComponent(textoFinal)}`;
  };

  // Copiar mensagem
  const handleCopiarMensagem = () => {
    const textoFinal = resolverTagsMensagem(textoMensagemEditavel, leadMensagemAtivo);
    navigator.clipboard.writeText(textoFinal);
    setCopiadoFeedback(true);
    setTimeout(() => setCopiadoFeedback(false), 2000);
  };

  // Inserir TAG personalizada no editor
  const handleInserirTagNoTexto = (tag: string) => {
    setTextoMensagemEditavel(prev => {
      const espaco = prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
      return `${prev}${espaco}${tag}`;
    });
  };

  const handleSalvarNovoLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoTelefone) return;

    addLead({
      nome: novoNome,
      empresa: novoEmpresa || novoNome,
      telefone: novoTelefone,
      whatsapp: novoTelefone,
      email: novoEmail,
      origem: 'Indicação',
      servico_interesse: novoServico,
      estagio: 'Novo Lead',
      prioridade: 'Normal',
      valor_estimado: novoValor,
      responsavel: novoResponsavel,
      data_proximo_followup: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
    });

    setModalOpen(false);
    setNovoNome('');
    setNovoEmpresa('');
    setNovoTelefone('');
    setNovoEmail('');
  };

  const handleConverter = (lead: CRMLead) => {
    converterLeadEmCliente(lead.id);
    setLeadConvertidoFeedback(`🎉 Parabéns! O lead "${lead.empresa || lead.nome}" foi convertido em cliente. O Onboarding foi gerado na Operação e o WhatsApp de boas-vindas foi disparado!`);
    setTimeout(() => setLeadConvertidoFeedback(null), 6000);
  };

  const handleAbrirModalBaixa = (lead: CRMLead) => {
    setLeadParaBaixar(lead);
    setMotivoBaixa('Sem interesse no momento');
    setJustificativaBaixa('');
    setModalBaixaOpen(true);
  };

  const handleConfirmarBaixa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadParaBaixar) return;
    baixarLeadComJustificativa(
      leadParaBaixar.id,
      motivoBaixa,
      justificativaBaixa || 'Sem justificativa adicional informada.'
    );
    setModalBaixaOpen(false);
    setLeadParaBaixar(null);
  };

  return (
    <div className="space-y-6">
      {/* Alerta de Conversão com Sucesso */}
      {leadConvertidoFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <p className="text-xs font-semibold">{leadConvertidoFeedback}</p>
          </div>
          <button
            onClick={() => setLeadConvertidoFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner de Integração com Radar Fiscal */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-sm">Radar Fiscal & Captação Ativa Receita/PGFN</h4>
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {empresasRadar ? empresasRadar.filter(e => e.tem_ade_ativo).length : 0} empresas com ADE Ativo
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Identifique empresas em risco de exclusão do Simples Nacional ou com Dívida Ativa da União e importe para o funil em 1 clique.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('radar-fiscal')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-xs whitespace-nowrap self-end sm:self-center"
        >
          <span>Abrir Radar Fiscal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 1. CARDS DE MÉTRICAS DO PIPELINE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pipeline Ativo</p>
            <p className="text-2xl font-bold text-brand-blue dark:text-blue-400 mt-1">
              R$ {valorTotalPipeline.toLocaleString('pt-BR')}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Oportunidades em aberto</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-brand-blue dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contratos Fechados</p>
            <p className="text-2xl font-bold text-brand-green dark:text-emerald-400 mt-1">
              R$ {valorFechado.toLocaleString('pt-BR')}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Convertidos em receita mensal</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-brand-green dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total de Oportunidades</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{leadsAtivos.length}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {leadsBaixados.length > 0 ? `${leadsBaixados.length} baixados / descartados` : 'No funil comercial'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SELETOR DE MODO: FUNIL ATIVO VS LEADS BAIXADOS */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setModoExibicao('funil')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              modoExibicao === 'funil'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Funil Ativo</span>
            <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-1.5 py-0.2 rounded-full text-[10px]">
              {leadsAtivos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setModoExibicao('baixados')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              modoExibicao === 'baixados'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Leads Baixados</span>
            {leadsBaixados.length > 0 && (
              <span className="bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-1.5 py-0.2 rounded-full text-[10px]">
                {leadsBaixados.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. QUADRO KANBAN DE LEADS ATIVOS */}
      {modoExibicao === 'funil' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {estagios.map(estagio => {
            const leadsEstagio = leadsAtivos.filter(l => {
              if (estagio === 'Contato Realizado') {
                return (
                  l.estagio === 'Contato Realizado' ||
                  (l as any).estagio === 'Contato' ||
                  (Boolean(l.mensagem_agendada) && !['Novo Lead', 'Qualificação', 'Proposta Enviada', 'Negociação', 'Fechado', 'Perdido'].includes(l.estagio))
                );
              }
              return l.estagio === estagio;
            });
            const totalEstagio = leadsEstagio.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

            return (
              <div
                key={estagio}
                className="bg-slate-100/80 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[250px] flex flex-col"
              >
                {/* Topo da Coluna */}
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate" title={estagio}>
                    {estagio}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    estagio === 'Contato Realizado'
                      ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300'
                      : estagio === 'Fechado'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                  }`}>
                    {leadsEstagio.length}
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 px-1 mb-2.5">
                  R$ {totalEstagio.toLocaleString('pt-BR')}
                </p>

                {/* Cards de Leads */}
                <div className="space-y-3 flex-1">
                  {leadsEstagio.map(lead => (
                    <div
                      key={lead.id}
                      className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-xs hover:shadow-md transition-all space-y-2.5 text-xs"
                    >
                      {/* Topo do Card */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate" title={lead.empresa || lead.nome}>
                            {lead.empresa || lead.nome}
                          </h4>
                          {lead.cpf_cnpj && (
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                              CNPJ: {lead.cpf_cnpj}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-brand-green bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/50 flex-shrink-0">
                          R$ {lead.valor_estimado?.toLocaleString('pt-BR')}
                        </span>
                      </div>

                      {/* Badges de Regime & Débitos */}
                      <div className="flex flex-wrap items-center gap-1">
                        {lead.dados_fiscais?.regime && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                            lead.dados_fiscais.regime === 'Simples'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : lead.dados_fiscais.regime === 'MEI'
                              ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300'
                          }`}>
                            {lead.dados_fiscais.regime}
                          </span>
                        )}

                        {/* Indicador de Débito */}
                        {lead.dados_fiscais?.possui_debito || lead.dados_fiscais?.tem_ade_ativo || (lead.dados_fiscais?.tem_divida_pgfn && (lead.dados_fiscais?.valor_divida_pgfn || 0) > 0) ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 flex items-center gap-1 truncate max-w-full">
                            <ShieldAlert className="w-3 h-3 text-red-600 flex-shrink-0" />
                            <span className="truncate">
                              {lead.dados_fiscais?.tem_ade_ativo 
                                ? `ADE (~${lead.dados_fiscais.prazo_regularizacao_dias || 30}d)`
                                : `PGFN: R$ ${(lead.dados_fiscais?.valor_divida_pgfn || 0).toLocaleString('pt-BR')}`
                              }
                            </span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            <span>Sem Débitos</span>
                          </span>
                        )}

                        {/* Indicador de WhatsApp Ativo / Fixo */}
                        {lead.dados_fiscais?.whatsapp_valido === true ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span>WhatsApp</span>
                          </span>
                        ) : lead.dados_fiscais?.whatsapp_valido === false ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400">
                            Sem WA (Fixo)
                          </span>
                        ) : null}
                      </div>

                      {/* Contato Principal / Sócio */}
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Contato: </span>
                        <span>{lead.nome}</span>
                      </div>

                      {/* Sócios (QSA) */}
                      {lead.dados_fiscais?.socios && lead.dados_fiscais.socios.length > 0 && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-1">
                          <Users className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {lead.dados_fiscais.socios.map(s => `${s.nome} (${s.qualificacao})`).join(' • ')}
                          </span>
                        </div>
                      )}

                      {/* Endereço Completo */}
                      {lead.dados_fiscais?.endereco_completo && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2" title={lead.dados_fiscais.endereco_completo}>
                            {lead.dados_fiscais.endereco_completo}
                          </span>
                        </div>
                      )}

                      {/* CNAE e Segmento */}
                      {(lead.dados_fiscais?.cnae_descricao || lead.dados_fiscais?.segmento) && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                          <Tag className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1" title={lead.dados_fiscais.cnae_descricao}>
                            {lead.dados_fiscais.cnae_codigo ? `${lead.dados_fiscais.cnae_codigo} - ` : ''}
                            {lead.dados_fiscais.cnae_descricao || lead.dados_fiscais.segmento}
                          </span>
                        </div>
                      )}

                      {/* Notificação / Mensagem Agendada de WhatsApp (Clicável para Ver/Editar) */}
                      {lead.mensagem_agendada && (() => {
                        const jaEnviadaCard = isMensagemJaEnviada(lead);
                        return (
                          <div
                            onClick={() => handleAbrirModalMensagem(lead)}
                            className={`p-2.5 rounded-xl border text-[10px] space-y-1.5 cursor-pointer transition shadow-2xs group ${
                              jaEnviadaCard
                                ? 'bg-emerald-50/70 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border-emerald-200/70 dark:border-emerald-900/70 text-emerald-900 dark:text-emerald-200'
                                : 'bg-blue-50/80 hover:bg-blue-100/90 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border-blue-200/70 dark:border-blue-900/70 text-blue-900 dark:text-blue-200'
                            }`}
                            title={
                              jaEnviadaCard
                                ? "Mensagem já enviada via WhatsApp. Clique para visualizar o conteúdo (Somente Leitura)"
                                : "Envio programado. Clique para visualizar ou editar antes do disparo"
                            }
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1">
                                {jaEnviadaCard ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span>WhatsApp Enviada</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
                                    <span>WhatsApp Agendada</span>
                                  </>
                                )}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                jaEnviadaCard
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                              }`}>
                                {lead.mensagem_agendada.data_hora_agendada}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                              &ldquo;{lead.mensagem_agendada.mensagem}&rdquo;
                            </p>
                            <div className={`text-[9px] font-bold flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition pt-0.5 ${
                              jaEnviadaCard
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {jaEnviadaCard ? (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span>Ver Mensagem Enviada (Somente Leitura)</span>
                                </>
                              ) : (
                                <>
                                  <Edit3 className="w-3 h-3" />
                                  <span>Editar Antes do Disparo</span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Rodapé do Card: Responsável + Balãozinho WhatsApp + Botão Baixar */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-400 font-medium truncate">
                          {lead.responsavel}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Balãozinho: Visualizar e Editar Mensagem WhatsApp */}
                          {(() => {
                            const jaEnviadaBalao = isMensagemJaEnviada(lead);
                            return (
                              <button
                                type="button"
                                onClick={() => handleAbrirModalMensagem(lead)}
                                className={`p-1.5 rounded-lg transition shadow-2xs group relative ${
                                  jaEnviadaBalao
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-brand-green dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60'
                                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-900/60'
                                }`}
                                title={
                                  jaEnviadaBalao
                                    ? "Mensagem já enviada via WhatsApp. Clique no balãozinho para visualizar o histórico (Somente Leitura)"
                                    : "Mensagem agendada. Clique no balãozinho para visualizar e editar o texto antes do envio"
                                }
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                {lead.mensagem_agendada && (
                                  <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-800 ${
                                    jaEnviadaBalao ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'
                                  }`} />
                                )}
                              </button>
                            );
                          })()}

                          {/* Botão de Baixar Lead com Justificativa */}
                          {lead.estagio !== 'Fechado' && (
                            <button
                              type="button"
                              onClick={() => handleAbrirModalBaixa(lead)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/50 dark:hover:bg-red-900/50 transition"
                              title="Baixar Lead com Justificativa"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Botão de Ação: Avançar Etapa ou Converter */}
                      {lead.estagio !== 'Fechado' ? (
                        <div className="pt-1">
                          {lead.estagio === 'Negociação' ? (
                            <button
                              onClick={() => handleConverter(lead)}
                              className="w-full py-1.5 px-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Ganho! Iniciar Onboarding</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const currentIndex = estagios.indexOf(lead.estagio);
                                const proximoEstagio = estagios[currentIndex + 1];
                                if (proximoEstagio) updateLead(lead.id, { estagio: proximoEstagio });
                              }}
                              className="w-full py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 transition"
                            >
                              <span>Avançar Etapa</span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-[10px] font-bold text-brand-green bg-emerald-50 dark:bg-emerald-950/40 py-1 rounded-xl">
                          ✓ Cliente Ativo & Onboarding Criado
                        </div>
                      )}
                    </div>
                  ))}

                  {leadsEstagio.length === 0 && (
                    <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-[11px]">
                      Nenhum lead nesta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* HISTÓRICO DE LEADS BAIXADOS / DESCARTADOS */
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Archive className="w-5 h-5 text-slate-500" />
                <span>Histórico de Leads Baixados com Justificativa</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Leads descartados do funil comercial com motivo e justificativa registrada para auditoria.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">
              {leadsBaixados.length} no histórico
            </span>
          </div>

          {leadsBaixados.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <Archive className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Nenhum lead baixado até o momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leadsBaixados.map(lead => (
                <div
                  key={lead.id}
                  className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{lead.empresa || lead.nome}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">CNPJ: {lead.cpf_cnpj || 'N/A'}</p>
                    </div>
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {lead.motivo_baixa || 'Descartado'}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-[10px] text-slate-500 block">Justificativa da Baixa:</span>
                    <p className="italic text-[11px] leading-relaxed">
                      &ldquo;{lead.justificativa_baixa || 'Nenhuma justificativa detalhada registrada.'}&rdquo;
                    </p>
                    {lead.data_baixa && (
                      <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                        Data da baixa: {lead.data_baixa}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">{lead.responsavel}</span>
                    <button
                      type="button"
                      onClick={() => reativarLead(lead.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reativar no Funil</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. MODAL: NOVO LEAD */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Cadastrar Nova Oportunidade / Lead</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoLead} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Contato Principal</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Juliana Fernandes"
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Empresa / Razão Social</label>
                <input
                  type="text"
                  placeholder="Ex: Fernandes Clínica Médica"
                  value={novoEmpresa}
                  onChange={e => setNovoEmpresa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 99999-8888"
                    value={novoTelefone}
                    onChange={e => setNovoTelefone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contato@empresa.com"
                    value={novoEmail}
                    onChange={e => setNovoEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Serviço de Interesse</label>
                  <input
                    type="text"
                    placeholder="Ex: BPO Financeiro"
                    value={novoServico}
                    onChange={e => setNovoServico(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor Proposto Mensal (R$)</label>
                  <input
                    type="number"
                    value={novoValor}
                    onChange={e => setNovoValor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Consultor Responsável</label>
                <select
                  value={novoResponsavel}
                  onChange={e => setNovoResponsavel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold shadow-xs"
                >
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: BAIXAR LEAD COM JUSTIFICATIVA */}
      {modalBaixaOpen && leadParaBaixar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <UserX className="w-5 h-5" />
                <h3 className="font-bold text-sm">Baixar Lead com Justificativa</h3>
              </div>
              <button
                onClick={() => setModalBaixaOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmarBaixa} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {leadParaBaixar.empresa || leadParaBaixar.nome}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  CNPJ: {leadParaBaixar.cpf_cnpj || 'Não informado'} | Estágio Atual: {leadParaBaixar.estagio}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Motivo da Baixa / Descarte:
                </label>
                <select
                  value={motivoBaixa}
                  onChange={(e) => setMotivoBaixa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Sem interesse no momento">Sem interesse no momento</option>
                  <option value="Já possui contador">Já possui contador / assessoria</option>
                  <option value="Honorário fora do orçamento">Honorário fora do orçamento</option>
                  <option value="Não respondeu ao contato / Vácuo">Não respondeu ao contato / Sem retorno</option>
                  <option value="Empresa encerrada ou inativa">Empresa encerrada ou inativa</option>
                  <option value="Já regularizou os débitos por conta própria">Já regularizou os débitos por conta própria</option>
                  <option value="Número incorreto / Inexistente">Número incorreto ou inexistente</option>
                  <option value="Outro motivo">Outro motivo</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Justificativa Detalhada:
                </label>
                <textarea
                  required
                  rows={4}
                  value={justificativaBaixa}
                  onChange={(e) => setJustificativaBaixa(e.target.value)}
                  placeholder="Descreva o motivo da perda ou baixa deste lead para manter o histórico comercial registrado..."
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalBaixaOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-xs"
                >
                  Confirmar Baixa do Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: VISUALIZAR & EDITAR MENSAGEM WHATSAPP DO LEAD */}
      {modalMensagemOpen && leadMensagemAtivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl overflow-hidden my-8">
            {/* Topo do Modal */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-start justify-between bg-emerald-50/40 dark:bg-emerald-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Mensagem de WhatsApp do Lead
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {leadMensagemAtivo.empresa || leadMensagemAtivo.nome}
                    </span>
                    {leadMensagemAtivo.cpf_cnpj && (
                      <span className="text-[10px] font-mono text-slate-500 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        CNPJ: {leadMensagemAtivo.cpf_cnpj}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalMensagemOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const jaEnviadaModal = isMensagemJaEnviada(leadMensagemAtivo);

              return (
                <form onSubmit={handleSalvarMensagemLead} className="p-6 space-y-4 text-xs">
                  {/* Banner de Status de Edição */}
                  {jaEnviadaModal ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                          <span>🔒 Mensagem já enviada (Modo Consulta e Auditoria)</span>
                        </p>
                        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
                          Esta mensagem já foi disparada via WhatsApp oficial ou seu horário programado foi atingido ({leadMensagemAtivo.mensagem_agendada?.data_hora_agendada}). O conteúdo enviado não pode ser alterado por regra de conformidade e auditoria comercial.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
                      <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-blue-950 dark:text-blue-100 flex items-center gap-1.5">
                          <span>⏳ Envio programado para {dataHoraAgendamento || 'o horário agendado'}</span>
                        </p>
                        <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-0.5 leading-relaxed">
                          Você pode editar o texto da mensagem, o telefone e o horário de agendamento livremente até o momento do disparo automático.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Badge de Status e Programação */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                          Status do Envio:
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          jaEnviadaModal || statusAgendamento === 'Enviada'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {jaEnviadaModal || statusAgendamento === 'Enviada' ? '✓ Mensagem Enviada' : '📅 Mensagem Agendada / Programada'}
                        </span>
                      </div>
                    </div>

                    {/* Status selector */}
                    <select
                      value={jaEnviadaModal ? 'Enviada' : statusAgendamento}
                      onChange={(e) => setStatusAgendamento(e.target.value as any)}
                      disabled={jaEnviadaModal}
                      className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <option value="Agendada">Agendada</option>
                      <option value="Enviada">Enviada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>

                  {/* Destinatário & Horário Programado */}
                  <div className="space-y-2">
                    {leadMensagemAtivo.dados_fiscais?.whatsapp_valido === false && (
                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-center gap-2 text-[11px] text-amber-900 dark:text-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>
                          <strong>Atenção:</strong> Este contato foi registrado como telefone fixo / sem WhatsApp ativo na consulta pública. Verifique antes de disparar.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-bold text-slate-700 dark:text-slate-300">
                            Telefone / WhatsApp de Destino:
                          </label>
                          {!jaEnviadaModal && (
                            <button
                              type="button"
                              onClick={handleValidarNumeroCRM}
                              disabled={validandoNumeroCRM || !telefoneDestinoMensagem.trim()}
                              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 disabled:opacity-50 transition"
                            >
                              {validandoNumeroCRM ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3" />
                              )}
                              <span>{validandoNumeroCRM ? 'Checando...' : 'Checar WhatsApp'}</span>
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          disabled={jaEnviadaModal}
                          placeholder="Ex: 19992080639"
                          value={telefoneDestinoMensagem}
                          onChange={(e) => setTelefoneDestinoMensagem(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-semibold disabled:bg-slate-100 dark:disabled:bg-slate-800/80 disabled:cursor-not-allowed"
                        />
                        {feedbackNumeroCRM && (
                          <div className={`mt-1.5 text-[10px] p-1.5 rounded-lg border font-semibold flex items-center gap-1.5 ${
                            feedbackNumeroCRM.valido 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                              : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                          }`}>
                            {feedbackNumeroCRM.valido ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />}
                            <span>{feedbackNumeroCRM.msg}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Data e Horário Programado:
                        </label>
                        <input
                          type="text"
                          disabled={jaEnviadaModal}
                          placeholder="Ex: 2026-10-29 às 09:00"
                          value={dataHoraAgendamento}
                          onChange={(e) => setDataHoraAgendamento(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium disabled:bg-slate-100 dark:disabled:bg-slate-800/80 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botões para Inserção Rápida de TAGs (Apenas se não enviada) */}
                  {!jaEnviadaModal && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px]">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>Inserir TAG dinâmica na mensagem:</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Clique para adicionar</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { tag: '{empresa}', label: 'Nome da Empresa' },
                          { tag: '{socio}', label: 'Nome do Sócio' },
                          { tag: '{cnpj}', label: 'CNPJ' },
                          { tag: '{cidade}', label: 'Cidade' },
                          { tag: '{regime}', label: 'Regime' },
                          { tag: '{valor_debito}', label: 'Valor Débito' },
                          { tag: '{prazo_dias}', label: 'Prazo Dias' },
                          { tag: '{servico}', label: 'Serviço' }
                        ].map(item => (
                          <button
                            key={item.tag}
                            type="button"
                            onClick={() => handleInserirTagNoTexto(item.tag)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md font-mono text-[10px] border border-slate-200 dark:border-slate-600 transition"
                            title={`Adicionar ${item.label} (${item.tag})`}
                          >
                            + {item.tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alternância de Abas: Editor vs Pré-visualização Real */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setAbaVisualizacaoModal('editor')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                            abaVisualizacaoModal === 'editor'
                              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                          }`}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{jaEnviadaModal ? 'Texto Original' : 'Editar Mensagem'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAbaVisualizacaoModal('preview')}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                            abaVisualizacaoModal === 'preview'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          <span>Pré-visualização WhatsApp</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopiarMensagem}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {copiadoFeedback ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiadoFeedback ? 'Copiado!' : 'Copiar Texto'}</span>
                      </button>
                    </div>

                    {abaVisualizacaoModal === 'editor' ? (
                      <textarea
                        required
                        rows={8}
                        readOnly={jaEnviadaModal}
                        value={textoMensagemEditavel}
                        onChange={(e) => setTextoMensagemEditavel(e.target.value)}
                        placeholder="Digite a mensagem personalizada que será enviada via WhatsApp..."
                        className={`w-full p-3 border rounded-2xl text-xs sm:text-sm leading-relaxed font-sans ${
                          jaEnviadaModal
                            ? 'bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-not-allowed select-text'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                    ) : (
                      <div className="bg-[#EFEAE2] dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 min-h-[160px] flex flex-col justify-end">
                        <div className="bg-white dark:bg-emerald-950/70 border border-emerald-200/50 dark:border-emerald-800/40 p-3.5 rounded-2xl rounded-tl-xs shadow-xs text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed max-w-[92%]">
                          {resolverTagsMensagem(textoMensagemEditavel, leadMensagemAtivo)}
                          <div className="text-[10px] text-slate-400 text-right mt-2 font-mono flex items-center justify-end gap-1">
                            <span>
                              {jaEnviadaModal
                                ? `Enviada (${leadMensagemAtivo.mensagem_agendada?.data_hora_agendada})`
                                : dataHoraAgendamento
                                ? `Programado para ${dataHoraAgendamento}`
                                : 'Hoje'}
                            </span>
                            <span className="text-emerald-500 font-bold">✓✓</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {feedbackMensagem && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold">{feedbackMensagem}</span>
                    </div>
                  )}

                  {/* Ações no Rodapé do Modal */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <a
                      href={gerarLinkWaMe()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl text-xs font-semibold transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir WhatsApp Web</span>
                    </a>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setModalMensagemOpen(false)}
                        className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold"
                      >
                        Fechar
                      </button>

                      {!jaEnviadaModal && (
                        <>
                          <button
                            type="button"
                            onClick={handleDispararPeloApp}
                            disabled={enviandoMensagem || !telefoneDestinoMensagem}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs"
                            title="Disparar imediatamente pela API do WhatsApp"
                          >
                            {enviandoMensagem ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Disparando...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Disparar Agora</span>
                              </>
                            )}
                          </button>

                          <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs font-bold shadow-xs transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Salvar Alterações</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
