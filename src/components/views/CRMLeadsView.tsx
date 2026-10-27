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
  ShieldAlert
} from 'lucide-react';

interface CRMLeadsViewProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const estagios: CRMLeadEstagio[] = [
  'Novo Lead',
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

  const valorTotalPipeline = leads
    .filter(l => l.estagio !== 'Fechado' && l.estagio !== 'Perdido')
    .reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

  const valorFechado = leads
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pipeline Ativo</p>
            <p className="text-2xl font-bold text-brand-blue mt-1">
              R$ {valorTotalPipeline.toLocaleString('pt-BR')}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Oportunidades em aberto</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contratos Fechados</p>
            <p className="text-2xl font-bold text-brand-green mt-1">
              R$ {valorFechado.toLocaleString('pt-BR')}
            </p>
            <p className="text-[11px] text-emerald-600 mt-1">Convertidos em receita mensal</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Oportunidades</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{leads.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">No funil comercial</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. QUADRO KANBAN DE LEADS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {estagios.map(estagio => {
          const leadsEstagio = leads.filter(l => l.estagio === estagio);
          const totalEstagio = leadsEstagio.reduce((acc, l) => acc + (l.valor_estimado || 0), 0);

          return (
            <div key={estagio} className="bg-slate-100/70 p-3 rounded-2xl border border-slate-200 min-w-[240px]">
              {/* Topo da Coluna */}
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="font-bold text-xs text-slate-800">{estagio}</span>
                <span className="bg-white text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                  {leadsEstagio.length}
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 px-2 mb-3">
                R$ {totalEstagio.toLocaleString('pt-BR')}
              </p>

              {/* Cards de Leads */}
              <div className="space-y-3">
                {leadsEstagio.map(lead => (
                  <div
                    key={lead.id}
                    className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle hover:shadow-card transition-all"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate" title={lead.empresa || lead.nome}>
                        {lead.empresa || lead.nome}
                      </h4>
                      <span className="text-[9px] font-bold text-brand-green bg-emerald-50 px-1.5 py-0.5 rounded">
                        R$ {lead.valor_estimado}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">{lead.nome}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{lead.servico_interesse}</p>

                    {/* Alertas Fiscais do Radar */}
                    {lead.dados_fiscais?.tem_ade_ativo && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        <ShieldAlert className="w-3 h-3 text-red-500 flex-shrink-0" />
                        <span className="truncate">ADE Ativo (~{lead.dados_fiscais.prazo_regularizacao_dias || 30}d)</span>
                      </div>
                    )}
                    {lead.dados_fiscais?.tem_divida_pgfn && !lead.dados_fiscais?.tem_ade_ativo && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <span className="truncate">⚖️ PGFN: R$ {(lead.dados_fiscais.valor_divida_pgfn || 0).toLocaleString('pt-BR')}</span>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">{lead.responsavel}</span>

                      {/* Botão de WhatsApp */}
                      <button
                        onClick={() => {
                          enviarMensagemWhatsApp(
                            'Lead',
                            lead.nome,
                            lead.whatsapp || lead.telefone,
                            'Lembrete Prazo',
                            `Olá ${lead.nome}! Tudo bem? Gostaria de saber como podemos avançar na proposta de ${lead.servico_interesse} com a fin.up!`
                          );
                        }}
                        className="p-1 rounded bg-emerald-50 text-brand-green hover:bg-emerald-100"
                        title="Enviar mensagem de follow-up no WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Botão de Ação: Avançar ou Converter */}
                    {lead.estagio !== 'Fechado' ? (
                      <div className="mt-3">
                        {lead.estagio === 'Negociação' ? (
                          <button
                            onClick={() => handleConverter(lead)}
                            className="w-full py-1.5 px-2 rounded-lg bg-brand-green hover:bg-brand-green-hover text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Ganho! Iniciar Onboarding</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const proximoEstagio = estagios[estagios.indexOf(lead.estagio) + 1];
                              if (proximoEstagio) updateLead(lead.id, { estagio: proximoEstagio });
                            }}
                            className="w-full py-1 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-semibold flex items-center justify-center gap-1 border border-slate-200"
                          >
                            <span>Avançar Etapa</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 text-center text-[10px] font-bold text-brand-green bg-emerald-50 py-1 rounded-lg">
                        ✓ Cliente Ativo & Onboarding Criado
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. MODAL: NOVO LEAD */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Cadastrar Nova Oportunidade / Lead</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoLead} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Contato Principal</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Juliana Fernandes"
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome da Empresa / Razão Social</label>
                <input
                  type="text"
                  placeholder="Ex: Fernandes Clínica Médica"
                  value={novoEmpresa}
                  onChange={e => setNovoEmpresa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 99999-8888"
                    value={novoTelefone}
                    onChange={e => setNovoTelefone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contato@empresa.com"
                    value={novoEmail}
                    onChange={e => setNovoEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serviço de Interesse</label>
                  <input
                    type="text"
                    placeholder="Ex: BPO Financeiro"
                    value={novoServico}
                    onChange={e => setNovoServico(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor Proposto Mensal (R$)</label>
                  <input
                    type="number"
                    value={novoValor}
                    onChange={e => setNovoValor(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consultor Responsável</label>
                <select
                  value={novoResponsavel}
                  onChange={e => setNovoResponsavel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold shadow-sm"
                >
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
