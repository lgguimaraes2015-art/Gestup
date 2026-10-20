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
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  badgeDot?: boolean;
  highlight?: 'blue' | 'green' | 'default';
  category?: string;
}

export function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    tarefas,
    whatsAppConfig,
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useApp();

  const tarefasAtrasadas = tarefas.filter(t => t.status === 'Atrasada').length;

  const navSections: { title: string; items: NavItemConfig[] }[] = [
    {
      title: 'Visão Geral',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard BI',
          icon: BarChart3,
          badge: 'Principal',
          highlight: 'blue'
        }
      ]
    },
    {
      title: 'Operacional & Fiscal',
      items: [
        {
          id: 'tarefas',
          label: 'Tarefas & Prazos',
          icon: CheckSquare,
          badge: tarefasAtrasadas > 0 ? (
            <span className="flex items-center gap-1 bg-red-100 text-red-700 text-[11px] font-bold px-1.5 py-0.5 rounded-full">
              <Flame className="w-3 h-3 text-red-500" />
              {tarefasAtrasadas}
            </span>
          ) : undefined,
          badgeDot: tarefasAtrasadas > 0
        },
        {
          id: 'clientes',
          label: 'Clientes & Regimes',
          icon: Users
        },
        {
          id: 'declaracoes',
          label: 'Declarações Fiscais',
          icon: FileText
        },
        {
          id: 'financeiro',
          label: 'Financeiro & Fechamento',
          icon: DollarSign
        }
      ]
    },
    {
      title: 'Comercial & Onboarding',
      items: [
        {
          id: 'crm-leads',
          label: 'Funil de Leads (CRM)',
          icon: TrendingUp
        },
        {
          id: 'crm-procedimentos',
          label: 'Procedimentos & POPs',
          icon: Workflow
        }
      ]
    },
    {
      title: 'Comunicação & Portal',
      items: [
        {
          id: 'whatsapp',
          label: 'Central de WhatsApp',
          icon: MessageSquare,
          badge: 'Online',
          highlight: 'green'
        },
        {
          id: 'portal-cliente',
          label: 'Portal do Cliente',
          icon: ExternalLink
        }
      ]
    },
    {
      title: 'Administração',
      items: [
        {
          id: 'configuracoes',
          label: 'Configurações & Equipe',
          icon: Settings
        }
      ]
    }
  ];

  const handleSelectItem = (id: string) => {
    setActiveTab(id);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* 1. DRAWER MOBILE (< md) - Desliza suavemente sem comprimir a tela */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop Escuro com Blur */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Gaveta Lateral Branca */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-250">
            {/* Header da Gaveta */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white flex items-center justify-center p-1.5 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="Logo fin.up"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 tracking-tight text-lg leading-none">GestUp</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-brand-green-light text-brand-green px-1.5 py-0.5 rounded-full">
                      v2.0
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-none mt-1">
                    fin.up Consultoria
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
                title="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Itens de Navegação Mobile */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {navSections.map((section, secIdx) => (
                <div key={section.title} className="space-y-1">
                  <div className="px-3 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {section.title}
                    </span>
                  </div>

                  <nav className="space-y-1">
                    {section.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      let activeStyle = '';
                      if (isActive) {
                        if (item.highlight === 'blue') {
                          activeStyle = 'bg-brand-blue text-white font-semibold shadow-sm';
                        } else if (item.highlight === 'green') {
                          activeStyle = 'bg-emerald-50 text-brand-green font-semibold border border-emerald-200';
                        } else {
                          activeStyle = 'bg-brand-blue-light text-brand-blue font-semibold';
                        }
                      } else {
                        activeStyle = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
                      }

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectItem(item.id)}
                          className={`w-full px-3 py-2.5 rounded-xl transition-all flex items-center justify-between text-sm ${activeStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive && item.highlight === 'blue' ? 'text-white' : ''}`} />
                            <span className="font-medium">{item.label}</span>
                          </div>

                          {item.badge && (
                            <div>
                              {typeof item.badge === 'string' ? (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isActive && item.highlight === 'blue'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {item.badge}
                                </span>
                              ) : (
                                item.badge
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            {/* Rodapé Mobile */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-green shrink-0 animate-pulse" />
                  <div className="text-left truncate">
                    <p className="text-[11px] font-semibold text-slate-800 leading-none">WhatsApp Ativo</p>
                    <p className="text-[10px] text-slate-500 leading-none mt-1 truncate">
                      {whatsAppConfig.numero_conectado || 'Sessão Conectada'}
                    </p>
                  </div>
                </div>
                <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SIDEBAR DESKTOP & TABLET (>= md) - Mantém exatamente o design aprovado para PC e Tablet */}
      <aside
        className={`hidden md:flex bg-white border-r border-slate-200 flex-col h-screen select-none shrink-0 transition-all duration-300 ease-in-out relative ${
          sidebarCollapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b border-slate-100 flex items-center transition-all ${
          sidebarCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={sidebarCollapsed ? toggleSidebar : undefined}
              className={`relative w-10 h-10 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-white flex items-center justify-center p-1.5 shrink-0 transition-transform ${
                sidebarCollapsed ? 'cursor-pointer hover:scale-105 hover:shadow-md ring-2 ring-transparent hover:ring-brand-blue/30' : ''
              }`}
              title={sidebarCollapsed ? 'Clique para expandir o menu' : 'fin.up GestUp'}
            >
              <Image
                src="/logo.png"
                alt="Logo fin.up"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 tracking-tight text-lg leading-none">GestUp</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-brand-green-light text-brand-green px-1.5 py-0.5 rounded-full">
                    v2.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none mt-1 truncate">
                  fin.up Consultoria
                </p>
              </div>
            )}
          </div>

          {/* Botão de Encolher/Expandir */}
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all focus:outline-none ${
              sidebarCollapsed ? 'w-9 h-9 flex items-center justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
            aria-label={sidebarCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-brand-blue" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className={`flex-1 overflow-y-auto py-4 space-y-5 transition-all ${
          sidebarCollapsed ? 'px-2' : 'px-3'
        }`}>
          {navSections.map((section, secIdx) => (
            <div key={section.title} className="space-y-1">
              {/* Título da Seção */}
              {!sidebarCollapsed ? (
                secIdx > 0 && (
                  <div className="px-3 mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {section.title}
                    </span>
                  </div>
                )
              ) : (
                secIdx > 0 && (
                  <div className="my-2.5 mx-2 border-t border-slate-100" />
                )
              )}

              {/* Itens de Navegação */}
              <nav className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  // Estilos para item ativo / inativo
                  let activeStyle = '';
                  if (isActive) {
                    if (item.highlight === 'blue') {
                      activeStyle = 'bg-brand-blue text-white font-semibold shadow-sm';
                    } else if (item.highlight === 'green') {
                      activeStyle = 'bg-emerald-50 text-brand-green font-semibold border border-emerald-200';
                    } else {
                      activeStyle = 'bg-brand-blue-light text-brand-blue font-semibold';
                    }
                  } else {
                    activeStyle = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item.id)}
                      className={`group relative rounded-xl transition-all flex items-center ${
                        sidebarCollapsed
                          ? 'w-12 h-11 mx-auto justify-center'
                          : 'w-full px-3 py-2 justify-between text-sm'
                      } ${activeStyle}`}
                    >
                      {/* Bloco Ícone + Label (se expandido) */}
                      <div className="flex items-center gap-2.5 relative">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive
                              ? item.highlight === 'blue'
                                ? 'text-white'
                                : 'text-brand-blue'
                              : 'text-slate-500 group-hover:text-slate-800'
                          }`}
                        />

                        {!sidebarCollapsed && (
                          <span className="truncate text-left">{item.label}</span>
                        )}

                        {/* Ponto indicador de alerta para modo recolhido */}
                        {sidebarCollapsed && item.badgeDot && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                        )}
                      </div>

                      {/* Badge (se expandido) */}
                      {!sidebarCollapsed && item.badge && (
                        <div className="shrink-0 ml-1.5">
                          {typeof item.badge === 'string' ? (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isActive && item.highlight === 'blue'
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.badge}
                            </span>
                          ) : (
                            item.badge
                          )}
                        </div>
                      )}

                      {/* Tooltip Flutuante Moderno (quando recolhido) */}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 flex items-center gap-2">
                          <span>{item.label}</span>
                          {item.id === 'tarefas' && tarefasAtrasadas > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                              {tarefasAtrasadas} atrasada{tarefasAtrasadas > 1 ? 's' : ''}
                            </span>
                          )}
                          {item.id === 'whatsapp' && (
                            <span className="bg-brand-green text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                              Online
                            </span>
                          )}
                          {/* Triângulo indicador do Tooltip */}
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 pointer-events-none" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Status */}
        <div className={`border-t border-slate-100 transition-all ${
          sidebarCollapsed ? 'p-3 flex justify-center' : 'p-4 bg-slate-50/50'
        }`}>
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-subtle">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-green shrink-0 animate-pulse" />
                <div className="text-left truncate">
                  <p className="text-[11px] font-semibold text-slate-800 leading-none">WhatsApp Ativo</p>
                  <p className="text-[10px] text-slate-500 leading-none mt-1 truncate">
                    {whatsAppConfig.numero_conectado || 'Sessão Conectada'}
                  </p>
                </div>
              </div>
              <ShieldCheck className="w-4 h-4 text-brand-green shrink-0 ml-1" />
            </div>
          ) : (
            <div
              className="group relative w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 shadow-subtle transition-all"
              onClick={() => setActiveTab('whatsapp')}
            >
              <ShieldCheck className="w-5 h-5 text-brand-green" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-green animate-pulse ring-2 ring-white" />

              {/* Tooltip do Status */}
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-green" />
                <span>WhatsApp: {whatsAppConfig.numero_conectado || 'Conectado'}</span>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
