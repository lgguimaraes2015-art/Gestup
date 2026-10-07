'use client';

import React from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import {
  CheckSquare,
  Users,
  FileText,
  TrendingUp,
  Workflow,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Flame,
  DollarSign,
  BarChart3,
  Settings
} from 'lucide-react';

export function Sidebar() {
  const { activeTab, setActiveTab, tarefas, whatsAppConfig } = useApp();

  const tarefasAtrasadas = tarefas.filter(t => t.status === 'Atrasada').length;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-white flex items-center justify-center p-1">
            <Image
              src="/logo.png"
              alt="Logo fin.up"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-lg">GestUp</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-brand-green-light text-brand-green px-1.5 py-0.5 rounded-full">v2.0</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-none mt-0.5">fin.up Consultoria</p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* VISÃO GERAL / TELA PRINCIPAL */}
        <div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-brand-blue text-white font-semibold shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-brand-blue'}`} />
                <span>Dashboard BI</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'}`}>
                Principal
              </span>
            </button>
          </nav>
        </div>

        {/* MÓDULO OPERACIONAL & FISCAL */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Operacional & Fiscal</span>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('tarefas')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'tarefas'
                  ? 'bg-brand-blue-light text-brand-blue font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4" />
                <span>Tarefas & Prazos</span>
              </div>
              {tarefasAtrasadas > 0 && (
                <span className="flex items-center gap-1 bg-red-100 text-red-700 text-[11px] font-bold px-1.5 py-0.5 rounded-full">
                  <Flame className="w-3 h-3 text-red-500" />
                  {tarefasAtrasadas}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('clientes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'clientes'
                  ? 'bg-brand-blue-light text-brand-blue font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clientes & Regimes</span>
            </button>

            <button
              onClick={() => setActiveTab('declaracoes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'declaracoes'
                  ? 'bg-brand-blue-light text-brand-blue font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Declarações Fiscais</span>
            </button>

            <button
              onClick={() => setActiveTab('financeiro')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'financeiro'
                  ? 'bg-brand-blue-light text-brand-blue font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Financeiro & Fechamento</span>
            </button>
          </nav>
        </div>

        {/* MÓDULO CRM & VENDAS */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Comercial & Onboarding</span>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('crm-leads')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'crm-leads'
                  ? 'bg-brand-blue-light text-brand-blue font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4" />
                <span>Funil de Leads (CRM)</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('crm-procedimentos')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'crm-procedimentos'
                  ? 'bg-brand-blue-light text-brand-blue font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Workflow className="w-4 h-4" />
              <span>Procedimentos & Onboarding</span>
            </button>
          </nav>
        </div>

        {/* MÓDULO AUTOMAÇÕES & WHATSAPP */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Comunicação Inteligente</span>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-50 text-brand-green font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-brand-green" />
                <span className="font-medium">Central WhatsApp</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
            </button>

            <button
              onClick={() => setActiveTab('portal-cliente')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'portal-cliente'
                  ? 'bg-brand-blue-light text-brand-blue font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Portal do Cliente</span>
            </button>
          </nav>
        </div>

        {/* MÓDULO SISTEMA & CONFIGURAÇÕES */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Sistema & Gestão</span>
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('configuracoes')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'configuracoes'
                  ? 'bg-brand-blue-light text-brand-blue font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configurações & Equipe</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Footer Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-subtle">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />
            <div className="text-left">
              <p className="text-[11px] font-semibold text-slate-800 leading-none">WhatsApp Ativo</p>
              <p className="text-[10px] text-slate-600 leading-none mt-0.5">{whatsAppConfig.numero_conectado}</p>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-brand-green" />
        </div>
      </div>
    </aside>
  );
}
