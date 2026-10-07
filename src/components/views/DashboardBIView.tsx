'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Building,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  Filter,
  Sparkles,
  Award
} from 'lucide-react';

export function DashboardBIView() {
  const { tarefas, clientes, colaboradores, setActiveTab } = useApp();

  const [competenciaAtiva, setCompetenciaAtiva] = useState('10/2026');
  const [responsavelFiltro, setResponsavelFiltro] = useState('todos');

  // Filtragem dos Dados
  const tarefasComp = competenciaAtiva === 'todas'
    ? tarefas
    : tarefas.filter(t => t.competencia === competenciaAtiva);

  const tarefasFiltradas = responsavelFiltro === 'todos'
    ? tarefasComp
    : tarefasComp.filter(t => t.responsavel.toLowerCase().includes(responsavelFiltro.toLowerCase()));

  // Métricas do Dashboard
  const totalTarefas = tarefasFiltradas.length;
  const concluidas = tarefasFiltradas.filter(t => t.status === 'Concluída').length;
  const atrasadas = tarefasFiltradas.filter(t => t.status === 'Atrasada').length;
  const emAndamento = tarefasFiltradas.filter(t => t.status === 'Em Andamento').length;
  const pendentes = tarefasFiltradas.filter(t => t.status === 'Pendente').length;

  const taxaConclusao = totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0;

  // Métricas Financeiras
  const clientesAtivos = clientes.filter(c => c.status === 'Ativo');
  const mrrTotal = clientesAtivos.reduce((acc, c) => acc + (c.honorario_mensal || 0), 0);
  const lucroLiquidoEstimado = mrrTotal * 0.90; // Projeção líquida descontando custos operacionais
  const participacaoSocio = mrrTotal * 0.35; // 35%
  const retencaoFinup = mrrTotal * 0.30; // 30% (20% caixa + 10% reserva)

  // Distribuição por Setor
  const fiscalQtd = tarefasFiltradas.filter(t => t.categoria === 'Fiscal').length;
  const contabilQtd = tarefasFiltradas.filter(t => t.categoria === 'Contábil').length;
  const pessoalQtd = tarefasFiltradas.filter(t => t.categoria === 'Pessoal' || t.categoria === 'Pessoal/RH').length;
  const financeiroQtd = tarefasFiltradas.filter(t => t.categoria === 'Financeiro' || t.categoria === 'Outros').length;

  // Distribuição de Regimes dos Clientes
  const simplesQtd = clientesAtivos.filter(c => c.regime_tributario === 'Simples Nacional').length;
  const meiQtd = clientesAtivos.filter(c => c.regime_tributario === 'MEI').length;
  const presumidoQtd = clientesAtivos.filter(c => c.regime_tributario === 'Lucro Presumido').length;
  const realQtd = clientesAtivos.filter(c => c.regime_tributario === 'Lucro Real').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. CABEÇALHO EXECUTIVO POWER BI */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-blue-dark text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-green/20 text-brand-green border border-brand-green/30">
              ⚡ BI Executivo em Tempo Real
            </span>
            <span className="text-xs text-slate-300">Painel Geral de Performance & Gestão</span>
          </div>
          <h1 className="text-2xl font-black mt-1 tracking-tight">GestUp BI • Inteligência Estratégica fin.up</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Monitoramento de conformidade tributária, rentabilidade dos sócios e entrega operacional
          </p>
        </div>

        {/* Barra de Filtros Rápidos */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700/80 backdrop-blur-sm">
          <Calendar className="w-4 h-4 text-brand-green ml-1" />
          <select
            value={competenciaAtiva}
            onChange={e => setCompetenciaAtiva(e.target.value)}
            className="text-xs bg-transparent text-white font-bold border-none focus:outline-none pr-3 cursor-pointer"
          >
            <option value="10/2026" className="text-slate-900">Competência 10/2026</option>
            <option value="09/2026" className="text-slate-900">Competência 09/2026</option>
            <option value="08/2026" className="text-slate-900">Competência 08/2026</option>
            <option value="todas" className="text-slate-900">Todas as Competências</option>
          </select>

          <div className="h-4 w-px bg-slate-700" />

          <select
            value={responsavelFiltro}
            onChange={e => setResponsavelFiltro(e.target.value)}
            className="text-xs bg-transparent text-white font-semibold border-none focus:outline-none pr-3 cursor-pointer"
          >
            <option value="todos" className="text-slate-900">Todos os Consultores</option>
            {colaboradores.map(c => (
              <option key={c.id} value={c.nome} className="text-slate-900">{c.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. KPI SCORECARDS (POWER BI CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card MRR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MRR da Carteira</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            R$ {mrrTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% dos 17 clientes ativos</span>
          </div>
        </div>

        {/* Card Taxa de Eficiência */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SLA de Conformidade</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900">{taxaConclusao}%</span>
            <span className="text-xs font-bold text-brand-green">entregas no prazo</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-brand-green h-full rounded-full transition-all duration-700" style={{ width: `${taxaConclusao}%` }} />
          </div>
        </div>

        {/* Card Riscos de Multa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Obrigações Críticas</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">{atrasadas}</p>
          <p className="text-[11px] text-slate-500 mt-2">
            {atrasadas === 0 ? '✅ Nenhuma obrigação com risco de multa!' : '⚠️ Necessitam envio imediato à Receita'}
          </p>
        </div>

        {/* Card Partilha dos Sócios */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Pró-labore por Sócio</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-blue mt-2">
            R$ {participacaoSocio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            35% Guilherme | 35% Ygor | 30% Finup
          </p>
        </div>
      </div>

      {/* 3. GRÁFICOS VISUAIS ESTRATÉGICOS (POWER BI WIDGETS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Volume de Obrigações por Setor */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Distribuição da Operação por Departamento</h3>
              <p className="text-xs text-slate-500">Volume de tarefas tributárias, contábeis e folha de pagamento</p>
            </div>
            <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {totalTarefas} Tarefas Ativas
            </span>
          </div>

          {/* Barras Horizontais Estilo Power BI */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Setor Fiscal (PGDAS, EFD-Reinf, DCTFWeb)</span>
                <span className="text-slate-900 font-bold">{fiscalQtd} tarefas ({totalTarefas > 0 ? Math.round((fiscalQtd / totalTarefas) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${totalTarefas > 0 ? (fiscalQtd / totalTarefas) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Setor Contábil (Balancetes, Conciliações, ECD)</span>
                <span className="text-slate-900 font-bold">{contabilQtd} tarefas ({totalTarefas > 0 ? Math.round((contabilQtd / totalTarefas) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-brand-blue h-full rounded-full" style={{ width: `${totalTarefas > 0 ? (contabilQtd / totalTarefas) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Setor Pessoal / RH (eSocial, Pró-labore, Folha)</span>
                <span className="text-slate-900 font-bold">{pessoalQtd} tarefas ({totalTarefas > 0 ? Math.round((pessoalQtd / totalTarefas) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-brand-green h-full rounded-full" style={{ width: `${totalTarefas > 0 ? (pessoalQtd / totalTarefas) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Financeiro & BPO (Fechamentos, OFX, Conciliação)</span>
                <span className="text-slate-900 font-bold">{financeiroQtd} tarefas ({totalTarefas > 0 ? Math.round((financeiroQtd / totalTarefas) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${totalTarefas > 0 ? (financeiroQtd / totalTarefas) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Composição da Carteira por Regime */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Regimes Tributários da Carteira</h3>
            <p className="text-xs text-slate-500">Distribuição dos 17 clientes atendidos</p>

            <div className="mt-5 space-y-2.5">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900">Simples Nacional</span>
                  <p className="text-[10px] text-slate-500">Empresas de comércio e serviços</p>
                </div>
                <span className="text-lg font-black text-brand-blue">{simplesQtd} ({Math.round((simplesQtd / 17) * 100)}%)</span>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900">Microempreendedor (MEI)</span>
                  <p className="text-[10px] text-slate-500">Regularização e declarações anuais</p>
                </div>
                <span className="text-lg font-black text-brand-green">{meiQtd} ({Math.round((meiQtd / 17) * 100)}%)</span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900">Lucro Presumido / Outros</span>
                  <p className="text-[10px] text-slate-500">Médio porte e retenção na fonte</p>
                </div>
                <span className="text-lg font-black text-purple-700">{presumidoQtd + realQtd}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('clientes')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
          >
            <span>Ver Todos os Clientes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. TABELA ANALÍTICA DE PERFORMANCE DA CARTEIRA */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Monitor de Conformidade por Empresa</h3>
            <p className="text-xs text-slate-500">Status em tempo real das obrigações fiscais de cada cliente</p>
          </div>
          <button
            onClick={() => setActiveTab('tarefas')}
            className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
          >
            <span>Ir para o Menu Tarefas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-3 py-3">Regime</th>
                <th className="px-3 py-3">Honorário</th>
                <th className="px-3 py-3">Responsável</th>
                <th className="px-4 py-3">Progresso das Tarefas</th>
                <th className="px-3 py-3 text-right">Status Fiscal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.map(cli => {
                const tarefasCli = tarefas.filter(t => t.cliente_id === cli.id);
                const concluidasCli = tarefasCli.filter(t => t.status === 'Concluída').length;
                const pct = tarefasCli.length > 0 ? Math.round((concluidasCli / tarefasCli.length) * 100) : 100;
                const atrasadasCli = tarefasCli.filter(t => t.status === 'Atrasada').length;

                return (
                  <tr key={cli.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {cli.nome}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-blue">
                        {cli.regime_tributario}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-semibold text-slate-800">
                      R$ {(cli.honorario_mensal || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-3 py-3.5 text-slate-600">
                      {cli.responsavel}
                    </td>
                    <td className="px-4 py-3.5 min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct === 100 ? 'bg-brand-green' : pct < 50 ? 'bg-amber-500' : 'bg-brand-blue'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-slate-700">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      {atrasadasCli > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                          {atrasadasCli} Atrasadas
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-brand-green text-[10px] font-bold">
                          Em dia
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
