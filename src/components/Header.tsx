'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  MessageSquare,
  Plus,
  Send,
  AlertTriangle,
  CheckCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Menu
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
    toggleMobileMenu
  } = useApp();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tarefasAtrasadas = tarefas.filter(t => t.status === 'Atrasada').length;

  const handleDispararMatinal = () => {
    dispararResumoMatinalEquipe();
    setToastMessage('☀️ Resumo matinal de tarefas disparado no WhatsApp da equipe!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSincronizar = () => {
    setToastMessage('✅ Dados salvos e sincronizados localmente em tempo real!');
    setTimeout(() => setToastMessage(null), 3500);
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

          {/* Indicador & Botão de Salvamento em Tempo Real */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Salvo em tempo real</span>
          </div>

          <button
            onClick={handleSincronizar}
            title="Todos os honorários, cadastros e tarefas são gravados em tempo real no navegador"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] sm:text-xs font-semibold transition-all shadow-subtle"
          >
            <CheckCheck className="w-3.5 h-3.5 text-brand-green shrink-0" />
            <span className="hidden md:inline">Sincronizado</span>
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
    </header>
  );
}
