'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  MessageSquare,
  Plus,
  Send,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Cloud,
  CloudOff,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  X,
  Database,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  onNovaTarefaClick?: () => void;
  onNovoLeadClick?: () => void;
}

export function Header({ onNovaTarefaClick, onNovoLeadClick }: HeaderProps) {
  const {
    activeTab,
    tarefas,
    dispararResumoMatinalEquipe,
    sidebarCollapsed,
    toggleSidebar,
    toggleMobileMenu,
    userRole,
    setUserRole,
    syncStatus,
    cloudConfigured,
    lastSyncAt,
    syncError,
    sincronizarDaNuvem,
    enviarTudoParaNuvem
  } = useApp();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false);
  const [syncActionBusy, setSyncActionBusy] = useState<'pull' | 'push' | null>(null);

  const tarefasAtrasadas = tarefas.filter(t => t.status === 'Atrasada').length;

  const handleDispararMatinal = () => {
    dispararResumoMatinalEquipe();
    setToastMessage('☀️ Resumo matinal de tarefas disparado no WhatsApp da equipe!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBaixarDaNuvem = async () => {
    setSyncActionBusy('pull');
    const res = await sincronizarDaNuvem();
    setSyncActionBusy(null);
    setToastMessage(res.ok ? `☁️ ${res.message}` : `⚠️ ${res.message}`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleEnviarParaNuvem = async () => {
    setSyncActionBusy('push');
    const res = await enviarTudoParaNuvem();
    setSyncActionBusy(null);
    setToastMessage(res.ok ? `☁️ ${res.message}` : `⚠️ ${res.message}`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const formatLastSync = (iso: string | null) => {
    if (!iso) return 'Ainda não sincronizado';
    try {
      return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Dashboard Executivo & BI', desc: 'Relatório Semanal, KPIs operacionais em tempo real e visão estratégica fin.up' };
      case 'tarefas':
        return { title: 'Gestão de Tarefas & Prazos Fiscais', desc: 'Controle de obrigações com Prazo Meta, Prazo Legal e modo Kanban' };
      case 'clientes':
        return { title: 'Carteira de Clientes & Regimes', desc: 'Histórico de auditoria, contratos, múltiplos contatos WhatsApp e declarações vinculadas' };
      case 'declaracoes':
        return { title: 'Declarações Fiscais & Federais', desc: 'Catálogo de obrigações, periodicidade e controle de recorrência' };
      case 'financeiro':
        return { title: 'Financeiro, Fechamento & Partilha de Sócios', desc: 'Contas a pagar/receber, conciliação PicPay (OFX) e partilha 35/35/30' };
      case 'configuracoes':
        return { title: 'Configurações do Sistema & Equipe', desc: 'Gestão de colaboradores, regras de partilha e parâmetros do GestUp' };
      case 'crm-leads':
        return { title: 'Funil Comercial & Pipeline de Vendas', desc: 'Gestão de leads com automação de onboarding ao fechar' };
      case 'crm-procedimentos':
        return { title: 'Procedimentos & Onboarding', desc: 'Workflows padronizados de integração de novos clientes' };
      case 'whatsapp':
        return { title: 'Central de Automações WhatsApp', desc: 'Réguas de cobrança automática, lembretes de prazos e logs' };
      case 'portal-cliente':
        return { title: 'Portal do Cliente fin.up', desc: 'Espaço seguro para entrega de guias e recebimento de documentos' };
      case 'dp-sst':
        return { title: 'Central de Gestão de DP, SST & Prontuário Trabalhista', desc: 'Cockpit operacional de alertas, controle de PGR/PCMSO, Diário de Bordo e Dossiê Trabalhista' };
      default:
        return { title: 'GestUp', desc: 'Consultoria Financeira e Tributária' };
    }
  };

  const { title, desc } = getPageTitle();

  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-6 md:px-8 py-3 md:py-4 sticky top-0 z-30">
      {/* Toast Notificação de WhatsApp */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold">{toastMessage}</p>
            <p className="text-[10px] text-slate-400">Verifique os logs na Central de WhatsApp</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Título & Descrição com botões de toggle (Mobile hamburger e Desktop collapse) */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Botão Hambúrguer Mobile (< md) */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200 shrink-0"
            title="Abrir Menu de Navegação"
            aria-label="Abrir Menu de Navegação"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          {/* Botão de Encolher Desktop/Tablet (>= md) */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all border border-slate-200/80 hover:border-slate-300 shadow-xs shrink-0"
            title={sidebarCollapsed ? 'Expandir Menu Lateral (Alt+B)' : 'Recolher Menu Lateral (Alt+B)'}
            aria-label={sidebarCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-brand-blue" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight truncate">
              {title}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate hidden sm:block">
              {desc}
            </p>
          </div>
        </div>

        {/* Ações & Indicadores Inteligentes */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Seletor Rápido de Perfil / RBAC (Admin Sócio vs. Auxiliar DP vs. Fiscal) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setUserRole('admin_socio')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                userRole === 'admin_socio'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Modo Admin Sócio: Acesso irrestrito a honorários, MRR e pró-labore"
            >
              <span>👑</span>
              <span className="hidden sm:inline">Sócio/Admin</span>
            </button>
            <button
              type="button"
              onClick={() => setUserRole('operacional_dp')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                userRole === 'operacional_dp'
                  ? 'bg-brand-blue text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Modo Auxiliar DP: Focado em DP & SST, oculta dados financeiros e pró-labore"
            >
              <span>👷</span>
              <span className="hidden sm:inline">Auxiliar DP</span>
            </button>
            <button
              type="button"
              onClick={() => setUserRole('fiscal_contabil')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                userRole === 'fiscal_contabil'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Modo Fiscal / Contábil: Focado em declarações e rotinas fiscais"
            >
              <span>📊</span>
              <span className="hidden sm:inline">Fiscal</span>
            </button>
          </div>

          {/* Alerta de Risco Fiscal */}
          {tarefasAtrasadas > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] sm:text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span><strong>{tarefasAtrasadas}</strong> <span className="hidden sm:inline">tarefas</span> atrasadas</span>
            </div>
          )}

          {/* Botão de Disparo do Resumo Matinal no WhatsApp */}
          <button
            onClick={handleDispararMatinal}
            title="Dispara automaticamente as tarefas do dia para o WhatsApp de cada analista"
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-brand-green border border-emerald-200 text-[11px] sm:text-xs font-semibold transition-all shadow-subtle"
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Disparar Resumo Equipe (08:30)</span>
            <span className="sm:hidden">Resumo Equipe</span>
          </button>

          {/* Indicador & Controle Real de Sincronização na Nuvem */}
          <button
            type="button"
            onClick={() => setSyncModalOpen(true)}
            title={
              syncStatus === 'synced'
                ? `Salvo na nuvem (última sincronização: ${formatLastSync(lastSyncAt)}). Clique para gerenciar.`
                : syncStatus === 'saving'
                ? 'Salvando alterações no banco de dados na nuvem...'
                : syncStatus === 'local_only'
                ? 'Banco na nuvem ainda não conectado na Vercel — clique para ativar em 1 minuto'
                : syncStatus === 'error'
                ? `Erro ao salvar na nuvem: ${syncError || 'sem conexão'}. Clique para tentar novamente.`
                : 'Verificando conexão com o banco de dados na nuvem...'
            }
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all shadow-subtle ${
              syncStatus === 'synced'
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                : syncStatus === 'saving' || syncStatus === 'loading'
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                : syncStatus === 'error'
                ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {syncStatus === 'synced' && (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">Salvo na nuvem</span>
                <span className="sm:hidden">Nuvem ✓</span>
              </>
            )}
            {(syncStatus === 'saving' || syncStatus === 'loading') && (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                <span className="hidden sm:inline">
                  {syncStatus === 'saving' ? 'Salvando...' : 'Sincronizando...'}
                </span>
                <span className="sm:hidden">Sync...</span>
              </>
            )}
            {syncStatus === 'local_only' && (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="hidden sm:inline">Só neste aparelho</span>
                <span className="sm:hidden">Local</span>
              </>
            )}
            {syncStatus === 'error' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="hidden sm:inline">Erro ao salvar</span>
                <span className="sm:hidden">Erro Sync</span>
              </>
            )}
          </button>

          {/* Botão Principal de Adição Contextual */}
          {activeTab === 'tarefas' && onNovaTarefaClick && (
            <button
              onClick={onNovaTarefaClick}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-[11px] sm:text-xs font-semibold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Nova Tarefa</span>
            </button>
          )}

          {activeTab === 'crm-leads' && onNovoLeadClick && (
            <button
              onClick={onNovoLeadClick}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-[11px] sm:text-xs font-semibold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Novo Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Sincronização em Nuvem (Celular <-> Computador) */}
      {syncModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSyncModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                  cloudConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Sincronização em Nuvem (GestUp)</h3>
                  <p className="text-[11px] text-slate-400">
                    Compartilhamento em tempo real entre celular, computador e equipe
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSyncModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Fechar modal de sincronização"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Status Atual */}
              <div className={`p-4 rounded-2xl border ${
                cloudConfigured && syncStatus !== 'error'
                  ? 'bg-emerald-50 border-emerald-200'
                  : syncStatus === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-3">
                  {cloudConfigured && syncStatus !== 'error' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : syncStatus === 'error' ? (
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <CloudOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">
                      {cloudConfigured && syncStatus !== 'error'
                        ? 'Banco PostgreSQL na nuvem conectado!'
                        : syncStatus === 'error'
                        ? 'Falha temporária ao salvar na nuvem'
                        : 'Banco de dados na nuvem ainda não ativado na Vercel'}
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {cloudConfigured && syncStatus !== 'error'
                        ? `Todas as baixas de pagamentos, tarefas e clientes são salvos automaticamente na nuvem. Última sincronização: ${formatLastSync(lastSyncAt)}.`
                        : syncStatus === 'error'
                        ? `Detalhes: ${syncError || 'Sem resposta do servidor'}. Seus dados continuam protegidos localmente até a conexão voltar.`
                        : 'Atualmente suas alterações ficam salvas somente no navegador deste aparelho. O que você alterar no celular só aparecerá no computador após conectar o banco gratuito na Vercel.'}
                    </p>
                  </div>
                </div>
              </div>

              {!cloudConfigured && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Como ativar em 1 minuto na Vercel (grátis):</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                    <li>Abra <strong>vercel.com</strong> e entre no projeto <strong>GestUp</strong>.</li>
                    <li>Clique na aba <strong>Storage</strong> no menu superior.</li>
                    <li>Clique em <strong>Create Database</strong> → escolha <strong>Neon</strong> (Postgres gratuito).</li>
                    <li>Clique em <strong>Connect Project</strong> para o GestUp e depois faça <strong>Redeploy</strong>.</li>
                  </ol>
                  <p className="text-[11px] text-slate-500 pt-1">
                    As tabelas são criadas automaticamente pelo GestUp na primeira conexão.
                  </p>
                </div>
              )}

              {/* Ações Manuais (Baixar da Nuvem / Enviar dados deste aparelho para resgate) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={syncActionBusy !== null}
                  onClick={handleBaixarDaNuvem}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-all disabled:opacity-50"
                >
                  <DownloadCloud className={`w-4 h-4 text-brand-blue ${syncActionBusy === 'pull' ? 'animate-bounce' : ''}`} />
                  <span>{cloudConfigured ? 'Baixar da nuvem agora' : 'Testar conexão agora'}</span>
                </button>

                <button
                  type="button"
                  disabled={syncActionBusy !== null}
                  onClick={handleEnviarParaNuvem}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  <UploadCloud className={`w-4 h-4 ${syncActionBusy === 'push' ? 'animate-bounce' : ''}`} />
                  <span>Enviar dados deste aparelho</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Dica: Se você lançou pagamentos no celular antes de ativar a nuvem, abra o GestUp no celular e clique em <strong>&ldquo;Enviar dados deste aparelho&rdquo;</strong> para subir tudo sem redigitar.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
