'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CRMLead, CRMLeadEstagio } from '@/types';
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
  FileText
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

  const leadsAtivos = leads.filter(l => l.estagio !== 'Perdido');
  const leadsBaixados = leads.filter(l => l.estagio === 'Perdido');

  const valorTotalPipeline = leadsAtivos
    .filter(l => l.estagio !== 'Fechado')
    .reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

  const valorFechado = leadsAtivos
    .filter(l => l.estagio === 'Fechado')
    .reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

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
            const leadsEstagio = leadsAtivos.filter(l => l.estagio === estagio);
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

                      {/* Notificação / Mensagem Agendada de WhatsApp */}
                      {lead.mensagem_agendada && (
                        <div className="p-2 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-900/60 text-[10px] text-blue-900 dark:text-blue-200 space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-blue-600" />
                              <span>WhatsApp {lead.mensagem_agendada.status}</span>
                            </span>
                            <span className="text-[9px] bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.2 rounded font-mono">
                              {lead.mensagem_agendada.data_hora_agendada}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                            &ldquo;{lead.mensagem_agendada.mensagem}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Rodapé do Card: Responsável + WhatsApp + Botão Baixar */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-400 font-medium truncate">
                          {lead.responsavel}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* Botão de WhatsApp */}
                          <button
                            type="button"
                            onClick={() => {
                              enviarMensagemWhatsApp(
                                'Lead',
                                lead.nome,
                                lead.whatsapp || lead.telefone,
                                'Lembrete Prazo',
                                `Olá ${lead.nome}! Tudo bem? Gostaria de saber como podemos avançar na proposta de ${lead.servico_interesse} com a fin.up!`
                              );
                            }}
                            className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-brand-green dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 transition"
                            title="Enviar WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão de Baixar Lead com Justificativa */}
                          {lead.estagio !== 'Fechado' && (
                            <button
                              type="button"
                              onClick={() => handleAbrirModalBaixa(lead)}
                              className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/50 dark:hover:bg-red-900/50 transition"
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
    </div>
  );
}
