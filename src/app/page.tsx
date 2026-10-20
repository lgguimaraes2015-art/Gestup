'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { TarefasView } from '@/components/views/TarefasView';
import { ClientesView } from '@/components/views/ClientesView';
import { DeclaracoesView } from '@/components/views/DeclaracoesView';
import { CRMLeadsView } from '@/components/views/CRMLeadsView';
import { ProcedimentosView } from '@/components/views/ProcedimentosView';
import { WhatsAppCentralView } from '@/components/views/WhatsAppCentralView';
import { PortalClienteView } from '@/components/views/PortalClienteView';
import { FinanceiroView } from '@/components/views/FinanceiroView';
import { DashboardBIView } from '@/components/views/DashboardBIView';
import { ConfiguracoesView } from '@/components/views/ConfiguracoesView';

export default function Home() {
  const { activeTab } = useApp();
  const [tarefaModalOpen, setTarefaModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Barra Lateral com Logo e Módulos (com gaveta para celular) */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topo / Cabeçalho */}
        <Header
          onNovaTarefaClick={() => setTarefaModalOpen(true)}
          onNovoLeadClick={() => setLeadModalOpen(true)}
        />

        {/* Corpo com Scroll adaptado para celular (p-3 sm:p-5 md:p-8) */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8">
          {(activeTab === 'dashboard' || activeTab === 'relatorio-semanal') && <DashboardBIView />}

          {activeTab === 'tarefas' && (
            <TarefasView
              modalOpen={tarefaModalOpen}
              setModalOpen={setTarefaModalOpen}
            />
          )}

          {activeTab === 'clientes' && <ClientesView />}

          {activeTab === 'declaracoes' && <DeclaracoesView />}

          {activeTab === 'financeiro' && <FinanceiroView />}

          {(activeTab === 'configuracoes' || activeTab === 'colaboradores') && <ConfiguracoesView />}

          {activeTab === 'crm-leads' && (
            <CRMLeadsView
              modalOpen={leadModalOpen}
              setModalOpen={setLeadModalOpen}
            />
          )}

          {activeTab === 'crm-procedimentos' && <ProcedimentosView />}

          {activeTab === 'whatsapp' && <WhatsAppCentralView />}

          {activeTab === 'portal-cliente' && <PortalClienteView />}
        </main>
      </div>
    </div>
  );
}
