'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

export function RelatorioSemanalView() {
  const { tarefas, clientes, colaboradores } = useApp();

  const [filtroResponsavel, setFiltroResponsavel] = useState('todos');

  const tarefasConcluidas = tarefas.filter(t => t.status === 'Concluída');
  const tarefasAtrasadas = tarefas.filter(t => t.status === 'Atrasada');
  const tarefasPendentes = tarefas.filter(t => t.status === 'Pendente' || t.status === 'Em Andamento');

  const taxaConclusao = tarefas.length > 0 ? Math.round((tarefasConcluidas.length / tarefas.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. TOPO & RESUMO EXECUTIVO */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-brand-blue px-2 py-0.5 rounded-full">
            Painel Executivo
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-1">Relatório Semanal de Operações & Prazos</h2>
          <p className="text-xs text-slate-500">Acompanhamento de conformidade tributária e produtividade da fin.up</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filtroResponsavel}
            onChange={e => setFiltroResponsavel(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 font-medium"
          >
            <option value="todos">Todos os Responsáveis</option>
            {colaboradores.map(c => (
              <option key={c.id} value={c.nome}>{c.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. MÉTRICAS CONSOLIDADAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taxa de Eficiência</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{taxaConclusao}%</span>
            <span className="text-xs font-bold text-brand-green">entregas no prazo</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-brand-green h-full rounded-full" style={{ width: `${taxaConclusao}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Entregas Concluídas</p>
          <p className="text-3xl font-extrabold text-brand-green mt-1">{tarefasConcluidas.length}</p>
          <p className="text-[11px] text-emerald-600 mt-1">Declarações e obrigações transmitidas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Na Fila de Produção</p>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">{tarefasPendentes.length}</p>
          <p className="text-[11px] text-amber-600 mt-1">Dentro do Prazo Meta</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Atrasos Críticos</p>
          <p className="text-3xl font-extrabold text-red-600 mt-1">{tarefasAtrasadas.length}</p>
          <p className="text-[11px] text-red-500 mt-1">Notificados via WhatsApp</p>
        </div>
      </div>

      {/* 3. DESEMPENHO POR CARTEIRA DE CLIENTES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Status das Obrigações por Cliente Atendido</h3>
          <span className="text-xs text-slate-500">17 empresas na carteira</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Empresa</th>
                <th className="px-4 py-3.5">Regime Tributário</th>
                <th className="px-4 py-3.5">Responsável</th>
                <th className="px-4 py-3.5 text-center">Total Obrigações</th>
                <th className="px-4 py-3.5 text-center">Concluídas</th>
                <th className="px-4 py-3.5 text-center">Atrasadas</th>
                <th className="px-5 py-3.5 text-right">Status Geral</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.map(cli => {
                const tarefasCli = tarefas.filter(t => t.cliente_id === cli.id || t.cliente_nome.toLowerCase().includes(cli.nome.toLowerCase().slice(0, 10)));
                const concluidasCli = tarefasCli.filter(t => t.status === 'Concluída').length;
                const atrasadasCli = tarefasCli.filter(t => t.status === 'Atrasada').length;

                return (
                  <tr key={cli.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {cli.nome}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-brand-blue">
                        {cli.regime_tributario}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {cli.responsavel}
                    </td>

                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {tarefasCli.length}
                    </td>

                    <td className="px-4 py-3.5 text-center font-bold text-brand-green">
                      {concluidasCli}
                    </td>

                    <td className="px-4 py-3.5 text-center font-bold text-red-600">
                      {atrasadasCli}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {atrasadasCli > 0 ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                          Atenção Necessária
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-brand-green bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Regular
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
