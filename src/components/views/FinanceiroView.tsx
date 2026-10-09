'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { HonorarioItem, ContaPagar, ReceitaNaoRecorrente } from '@/types';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Users,
  CreditCard,
  Plus,
  CheckCircle2,
  Calendar,
  Building,
  Upload,
  FileText,
  Shield,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock,
  Search,
  CheckCheck,
  RotateCcw,
  Receipt,
  Phone
} from 'lucide-react';

export function FinanceiroView() {
  const {
    clientes,
    honorarios,
    contasPagar,
    receitasNaoRecorrentes,
    transacoesOFX,
    darBaixaHonorario,
    gerarHonorariosCompetencia,
    dispararCobrancaHonorarioWhatsApp,
    addContaPagar,
    pagarConta,
    addReceitaNaoRecorrente,
    addCustoReceitaNaoRecorrente,
    importarExtratoOFX,
    conciliarTransacaoOFX
  } = useApp();

  // Abas do Módulo Financeiro
  const [abaAtiva, setAbaAtiva] = useState<'honorarios' | 'clientes-consolidado' | 'partilha' | 'pagar' | 'avulsas' | 'ofx'>('honorarios');

  // Competência selecionada para a gestão de honorários (padrão: Outubro 2026)
  const [competenciaSelecionada, setCompetenciaSelecionada] = useState<string>('10/2026');
  const mesesDisponiveis = ['07/2026', '08/2026', '09/2026', '10/2026', '11/2026', '12/2026'];

  // Controle da sanfona (accordion) de Honorários Vencidos
  const [vencidosAberto, setVencidosAberto] = useState<boolean>(true);

  // Filtros da tabela de honorários
  const [filtroBuscaHonorario, setFiltroBuscaHonorario] = useState<string>('');
  const [filtroStatusHonorario, setFiltroStatusHonorario] = useState<'todos' | 'Pendente' | 'Pago' | 'Vencido'>('todos');

  // Modais de Honorários
  const [modalBaixaHonorario, setModalBaixaHonorario] = useState<HonorarioItem | null>(null);
  const [baixaDataPagamento, setBaixaDataPagamento] = useState<string>(new Date().toISOString().split('T')[0]);
  const [baixaFormaPagamento, setBaixaFormaPagamento] = useState<'PIX PicPay' | 'Boleto' | 'Transferência' | 'Dinheiro' | 'Outro'>('PIX PicPay');
  const [baixaValor, setBaixaValor] = useState<number>(0);
  const [baixaObservacoes, setBaixaObservacoes] = useState<string>('');
  const [baixaNotificarWhats, setBaixaNotificarWhats] = useState<boolean>(true);

  // Modal Extrato Consolidado por Cliente
  const [clienteExtratoModal, setClienteExtratoModal] = useState<string | null>(null);

  // Modais de Outras Abas
  const [modalNovaContaPagar, setModalNovaContaPagar] = useState(false);
  const [modalNovaReceitaAvulsa, setModalNovaReceitaAvulsa] = useState(false);
  const [modalNovoCustoAvulso, setModalNovoCustoAvulso] = useState<string | null>(null);

  // Form Conta a Pagar
  const [descPagar, setDescPagar] = useState('');
  const [fornecedorPagar, setFornecedorPagar] = useState('');
  const [valorPagar, setValorPagar] = useState(0);
  const [vencPagar, setVencPagar] = useState('');

  // Form Receita Avulsa
  const [tituloAvulsa, setTituloAvulsa] = useState('');
  const [clienteAvulsa, setClienteAvulsa] = useState(clientes[0]?.nome || '');
  const [valorAvulsa, setValorAvulsa] = useState(2500);
  const [dataPrevistaAvulsa, setDataPrevistaAvulsa] = useState('2026-10-25');

  // Form Custo Avulso
  const [descCusto, setDescCusto] = useState('');
  const [valorCusto, setValorCusto] = useState(200);

  // Toast Feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ================= CÁLCULOS POR COMPETÊNCIA =================
  // 1. Honorários da Competência Selecionada (Faturado / Projetado)
  const honorariosDaCompetencia = honorarios.filter(h => h.competencia === competenciaSelecionada);
  const totalProjetadoCompetencia = honorariosDaCompetencia.reduce((acc, h) => acc + h.valor, 0);

  // 2. Realizado no Mês Selecionado (Regime de Caixa - o que foi pago com data de pagamento dentro do mês)
  // Ex: se o honorário é de 09/2026 mas foi pago em 05/10/2026, competencia_pagamento === '10/2026', então entra no caixa do mês 10!
  const honorariosRealizadosNoMes = honorarios.filter(h => h.status === 'Pago' && h.competencia_pagamento === competenciaSelecionada);
  const totalRealizadoNoMes = honorariosRealizadosNoMes.reduce((acc, h) => acc + h.valor, 0);

  // 3. Pendentes dentro do prazo na competência selecionada
  const honorariosPendentesNoMes = honorariosDaCompetencia.filter(h => h.status === 'Pendente');
  const totalPendenteNoMes = honorariosPendentesNoMes.reduce((acc, h) => acc + h.valor, 0);

  // 4. Honorários Vencidos (Em Atraso geral até a data atual)
  const honorariosVencidos = honorarios.filter(h => h.status === 'Vencido');
  const totalEmAtrasoGeral = honorariosVencidos.reduce((acc, h) => acc + h.valor, 0);

  // 5. Agrupamento de Vencidos por Cliente/Contato
  const vencidosPorClienteMap: { [clienteId: string]: { clienteNome: string; contatoNome: string; contatoTelefone: string; parcelas: HonorarioItem[]; total: number } } = {};
  honorariosVencidos.forEach(h => {
    if (!vencidosPorClienteMap[h.cliente_id]) {
      vencidosPorClienteMap[h.cliente_id] = {
        clienteNome: h.cliente_nome,
        contatoNome: h.contato_nome || h.cliente_nome.split(' ')[0],
        contatoTelefone: h.contato_telefone || '',
        parcelas: [],
        total: 0
      };
    }
    vencidosPorClienteMap[h.cliente_id].parcelas.push(h);
    vencidosPorClienteMap[h.cliente_id].total += h.valor;
  });
  const gruposVencidos = Object.values(vencidosPorClienteMap);

  // 6. Navegação de Competência
  const handleMudarMes = (direcao: 'ant' | 'prox') => {
    const idx = mesesDisponiveis.indexOf(competenciaSelecionada);
    if (direcao === 'ant' && idx > 0) {
      setCompetenciaSelecionada(mesesDisponiveis[idx - 1]);
    } else if (direcao === 'prox' && idx < mesesDisponiveis.length - 1) {
      setCompetenciaSelecionada(mesesDisponiveis[idx + 1]);
    }
  };

  const getNomeMesExtenso = (comp: string) => {
    const [mes, ano] = comp.split('/');
    const meses = [
      '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mes, 10)] || mes} de ${ano}`;
  };

  // 7. Abrir Modal de Baixa de Honorário
  const handleAbrirBaixa = (item: HonorarioItem) => {
    setModalBaixaHonorario(item);
    setBaixaDataPagamento(new Date().toISOString().split('T')[0]);
    setBaixaValor(item.valor);
    setBaixaFormaPagamento('PIX PicPay');
    setBaixaObservacoes('');
    setBaixaNotificarWhats(true);
  };

  // 8. Confirmar Baixa
  const handleConfirmarBaixa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBaixaHonorario) return;

    darBaixaHonorario(modalBaixaHonorario.id, {
      dataPagamento: baixaDataPagamento,
      formaPagamento: baixaFormaPagamento,
      valorPago: baixaValor,
      observacoes: baixaObservacoes,
      notificarWhatsApp: baixaNotificarWhats
    });

    const [y, m] = baixaDataPagamento.split('-');
    const compCaixa = `${m}/${y}`;
    setToastMsg(`✅ Honorário de ${modalBaixaHonorario.cliente_nome} baixado com sucesso! Quitou ${modalBaixaHonorario.competencia} e entrou para o caixa de ${compCaixa}.`);
    setModalBaixaHonorario(null);
    setTimeout(() => setToastMsg(null), 5000);
  };

  // 9. Gerar Próxima Competência
  const handleGerarProximaCompetencia = () => {
    const [mes, ano] = competenciaSelecionada.split('/');
    let proximoMes = parseInt(mes, 10) + 1;
    let proximoAno = parseInt(ano, 10);
    if (proximoMes > 12) {
      proximoMes = 1;
      proximoAno += 1;
    }
    const proxComp = `${String(proximoMes).padStart(2, '0')}/${proximoAno}`;
    gerarHonorariosCompetencia(proxComp);
    setCompetenciaSelecionada(proxComp);
    setToastMsg(`🎉 Honorários da competência ${proxComp} gerados com sucesso para todos os clientes ativos!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // 10. Disparar Cobrança WhatsApp
  const handleCobrarWhatsApp = (honorarioId: string) => {
    dispararCobrancaHonorarioWhatsApp(honorarioId);
    setToastMsg('📲 Lembrete de honorário enviado via WhatsApp com chave PIX PicPay!');
    setTimeout(() => setToastMsg(null), 4000);
  };

  // 11. Cálculos da Partilha de Sócios fin.up (35% Guilherme, 35% Ygor, 20% Caixa, 10% Reserva)
  const clientesAtivos = clientes.filter(c => c.status === 'Ativo');
  const mrrTotalContratual = clientesAtivos.reduce((acc, c) => acc + (c.honorario_mensal || 0), 0);
  // A base de partilha considera o faturamento de caixa do mês ou o MRR previsto
  const basePartilha = totalRealizadoNoMes > 0 ? totalRealizadoNoMes : mrrTotalContratual;
  const partilhaGuilherme = basePartilha * 0.35;
  const partilhaYgor = basePartilha * 0.35;
  const partilhaCaixaFinup = basePartilha * 0.20;
  const partilhaReservaFinup = basePartilha * 0.10;
  const partilhaTotalFinup = partilhaCaixaFinup + partilhaReservaFinup;

  // 12. Salvar Conta a Pagar
  const handleSalvarContaPagar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descPagar || !valorPagar) return;

    addContaPagar({
      descricao: descPagar,
      fornecedor: fornecedorPagar || 'Fornecedor',
      categoria: 'Operacional',
      valor: valorPagar,
      data_vencimento: vencPagar || new Date().toISOString().split('T')[0],
      status: 'Pendente',
      recorrencia: 'Único'
    });

    setModalNovaContaPagar(false);
    setDescPagar('');
    setValorPagar(0);
    setToastMsg('✅ Conta a pagar registrada!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 13. Salvar Receita Avulsa
  const handleSalvarReceitaAvulsa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloAvulsa || !valorAvulsa) return;

    addReceitaNaoRecorrente({
      titulo_servico: tituloAvulsa,
      cliente_nome: clienteAvulsa,
      valor_total: valorAvulsa,
      data_prevista: dataPrevistaAvulsa,
      status: 'Previsto',
      custos_vinculados: [],
      conciliado_ofx: false
    });

    setModalNovaReceitaAvulsa(false);
    setTituloAvulsa('');
    setToastMsg('✅ Receita avulsa cadastrada!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 14. Salvar Custo Avulso
  const handleSalvarCustoAvulso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNovoCustoAvulso || !descCusto || !valorCusto) return;

    addCustoReceitaNaoRecorrente(modalNovoCustoAvulso, {
      descricao: descCusto,
      valor: valorCusto,
      pago: true,
      conciliado_ofx: false
    });

    setModalNovoCustoAvulso(null);
    setDescCusto('');
    setToastMsg('✅ Custo vinculado adicionado ao projeto!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 15. Filtragem da lista da competência
  const honorariosFiltrados = honorariosDaCompetencia.filter(h => {
    const matchBusca = h.cliente_nome.toLowerCase().includes(filtroBuscaHonorario.toLowerCase()) ||
      (h.contato_nome && h.contato_nome.toLowerCase().includes(filtroBuscaHonorario.toLowerCase()));
    const matchStatus = filtroStatusHonorario === 'todos' || h.status === filtroStatusHonorario;
    return matchBusca && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notificação */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-3 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-brand-green" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* CABEÇALHO COM ABAS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Financeiro & Fechamento</h2>
            <span className="bg-emerald-100 text-brand-green text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Regime Competência x Caixa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de honorários, controle de vencidos, conciliação PicPay e partilha de sócios (35/35/30)
          </p>
        </div>

        {/* Seleção de Abas */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setAbaAtiva('honorarios')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              abaAtiva === 'honorarios'
                ? 'bg-brand-blue text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Honorários por Competência</span>
            {honorariosVencidos.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                abaAtiva === 'honorarios' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
              }`}>
                {honorariosVencidos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAbaAtiva('clientes-consolidado')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              abaAtiva === 'clientes-consolidado'
                ? 'bg-brand-blue text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Por Cliente (Projetado x Realizado)</span>
          </button>

          <button
            onClick={() => setAbaAtiva('partilha')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              abaAtiva === 'partilha'
                ? 'bg-brand-blue text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Partilha de Sócios (35/35/30)</span>
          </button>

          <button
            onClick={() => setAbaAtiva('pagar')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              abaAtiva === 'pagar'
                ? 'bg-brand-blue text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Contas a Pagar</span>
          </button>

          <button
            onClick={() => setAbaAtiva('avulsas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              abaAtiva === 'avulsas'
                ? 'bg-brand-blue text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Projetos & Receitas Avulsas</span>
          </button>

          <button
            onClick={() => setAbaAtiva('ofx')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
              abaAtiva === 'ofx'
                ? 'bg-brand-blue text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Conciliação PicPay (OFX)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 01: HONORÁRIOS POR COMPETÊNCIA (CARRO-CHEFE)                          */}
      {/* ========================================================================= */}
      {abaAtiva === 'honorarios' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* BARRA DE NAVEGAÇÃO DE COMPETÊNCIA */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1 shadow-inner">
                <button
                  onClick={() => handleMudarMes('ant')}
                  title="Mês Anterior"
                  className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-4 py-1 flex items-center gap-2 min-w-[190px] justify-center">
                  <Calendar className="w-4 h-4 text-brand-blue" />
                  <span className="font-extrabold text-sm text-slate-900">
                    {getNomeMesExtenso(competenciaSelecionada)}
                  </span>
                </div>

                <button
                  onClick={() => handleMudarMes('prox')}
                  title="Próximo Mês"
                  className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Seletor Dropdown Direto */}
              <select
                value={competenciaSelecionada}
                onChange={e => setCompetenciaSelecionada(e.target.value)}
                className="text-xs rounded-2xl border border-slate-200 px-3 py-2.5 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-brand-blue/20"
              >
                {mesesDisponiveis.map(m => (
                  <option key={m} value={m}>
                    Comp. {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Ação de Gerar Próxima Competência */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleGerarProximaCompetencia}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Gerar Próxima Competência</span>
              </button>
            </div>
          </div>

          {/* CARDS DE KPIS DA COMPETÊNCIA (PROJETADO, REALIZADO, ATRASADO) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Pago / Realizado (Caixa) */}
            <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-subtle relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Pago (Realizado no Mês)
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center">
                  <CheckCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-brand-green mt-2">
                R$ {totalRealizadoNoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {honorariosRealizadosNoMes.length} honorários quitados em {competenciaSelecionada}
              </p>
            </div>

            {/* Total Projetado (Faturado da Competência) */}
            <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-subtle relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Projetado da Comp. {competenciaSelecionada}
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-brand-blue mt-2">
                R$ {totalProjetadoCompetencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {honorariosDaCompetencia.length} honorários previstos nesta competência
              </p>
            </div>

            {/* A Receber / No Prazo */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  A Vencer (Dentro do Prazo)
                </span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-800 mt-2">
                R$ {totalPendenteNoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {honorariosPendentesNoMes.length} aguardando vencimento
              </p>
            </div>

            {/* Em Atraso / Vencidos Geral */}
            <div className="bg-white p-5 rounded-3xl border border-red-100 shadow-subtle relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                  Em Atraso (Vencidos)
                </span>
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-red-600 mt-2">
                R$ {totalEmAtrasoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-red-700 font-semibold mt-1">
                {honorariosVencidos.length} parcelas vencidas aguardando baixa
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO DESTACADA: HONORÁRIOS VENCIDOS (ACCORDION ESTILO APP ANTIGO)       */}
          {/* ========================================================================= */}
          {honorariosVencidos.length > 0 && (
            <div className="bg-white rounded-3xl border border-red-200 shadow-subtle overflow-hidden">
              {/* Cabeçalho do Accordion */}
              <button
                onClick={() => setVencidosAberto(!vencidosAberto)}
                className="w-full px-6 py-4 bg-red-50/60 hover:bg-red-50 flex items-center justify-between transition-colors border-b border-red-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-red-900">
                        Honorários Vencidos
                      </span>
                      <span className="bg-red-200/80 text-red-800 text-[11px] font-black px-2 py-0.5 rounded-full">
                        {honorariosVencidos.length} parcelas
                      </span>
                      <span className="text-xs font-black text-red-700">
                        — Total: R$ {totalEmAtrasoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-[11px] text-red-700 mt-0.5">
                      Cobranças não liquidadas até o vencimento. Dê baixa com a data efetiva de pagamento para transferir o faturamento ao caixa do mês corrente.
                    </p>
                  </div>
                </div>

                <div className="p-1 rounded-xl bg-white/80 text-red-700 border border-red-200">
                  {vencidosAberto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Corpo dos Vencidos Agrupados por Cliente */}
              {vencidosAberto && (
                <div className="p-6 divide-y divide-slate-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gruposVencidos.map((grp, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50/60 hover:bg-slate-50 rounded-2xl p-4 border border-slate-200 transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Cabeçalho do Cliente */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                            <div>
                              <p className="font-bold text-slate-900 text-xs">{grp.contatoNome}</p>
                              <p className="text-[11px] font-semibold text-slate-600 mt-0.5">{grp.clienteNome}</p>
                            </div>
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {grp.parcelas.length} {grp.parcelas.length === 1 ? 'honorário' : 'honorários'}
                            </span>
                          </div>

                          {/* Lista das Parcelas Atrasadas */}
                          <div className="mt-3 space-y-2">
                            {grp.parcelas.map(parc => (
                              <div
                                key={parc.id}
                                className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-800">{parc.competencia}</span>
                                    <span className="text-[10px] text-slate-400">({parc.parcela_info || 'Mensalidade'})</span>
                                  </div>
                                  <p className="text-[10px] text-red-600 font-semibold mt-0.5">
                                    Venceu em {parc.data_vencimento.split('-').reverse().join('/')} — {parc.dias_atraso || 1} dias em atraso
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="font-black text-red-600 text-xs">
                                    R$ {parc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                  <button
                                    onClick={() => handleAbrirBaixa(parc)}
                                    title="Dar Baixa com data de pagamento"
                                    className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-brand-green border border-emerald-200 text-[10px] font-bold transition-all shadow-subtle"
                                  >
                                    Dar Baixa
                                  </button>
                                  <button
                                    onClick={() => handleCobrarWhatsApp(parc.id)}
                                    title="Disparar Lembrete / Cobrança no WhatsApp"
                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-brand-green" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Rodapé com total do cliente */}
                        <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 font-medium">Débito Total Acumulado:</span>
                          <span className="font-black text-red-700">
                            R$ {grp.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TABELA DE HONORÁRIOS DA COMPETÊNCIA (COM BUSCA E FILTROS)                 */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-subtle overflow-hidden">
            {/* Barra de Filtros e Busca */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/40">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar honorário por cliente ou contato..."
                  value={filtroBuscaHonorario}
                  onChange={e => setFiltroBuscaHonorario(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 rounded-xl bg-slate-200/80 text-xs font-bold text-slate-700">
                  <button
                    onClick={() => setFiltroStatusHonorario('todos')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filtroStatusHonorario === 'todos' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    Todos ({honorariosDaCompetencia.length})
                  </button>
                  <button
                    onClick={() => setFiltroStatusHonorario('Pendente')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filtroStatusHonorario === 'Pendente' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600'
                    }`}
                  >
                    Pendentes ({honorariosPendentesNoMes.length})
                  </button>
                  <button
                    onClick={() => setFiltroStatusHonorario('Pago')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filtroStatusHonorario === 'Pago' ? 'bg-white shadow-sm text-brand-green' : 'text-slate-600'
                    }`}
                  >
                    Pagos ({honorariosDaCompetencia.filter(h => h.status === 'Pago').length})
                  </button>
                  <button
                    onClick={() => setFiltroStatusHonorario('Vencido')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filtroStatusHonorario === 'Vencido' ? 'bg-white shadow-sm text-red-700' : 'text-slate-600'
                    }`}
                  >
                    Vencidos ({honorariosDaCompetencia.filter(h => h.status === 'Vencido').length})
                  </button>
                </div>
              </div>
            </div>

            {/* Tabela de Honorários */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3.5">Cliente & Parcela</th>
                    <th className="px-3 py-3.5">Tipo</th>
                    <th className="px-3 py-3.5">Valor</th>
                    <th className="px-3 py-3.5">Vencimento</th>
                    <th className="px-3 py-3.5">Status</th>
                    <th className="px-3 py-3.5">Pagamento (Caixa)</th>
                    <th className="px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {honorariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                        Nenhum honorário encontrado para a competência {competenciaSelecionada}.
                      </td>
                    </tr>
                  ) : (
                    honorariosFiltrados.map(hon => (
                      <tr key={hon.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-bold text-slate-900">{hon.cliente_nome}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {hon.contato_nome && (
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Resp: {hon.contato_nome}
                                </span>
                              )}
                              {hon.parcela_info && (
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                                  {hon.parcela_info}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3.5">
                          <span className="text-slate-600 font-medium">Honorário Mensal</span>
                        </td>

                        <td className="px-3 py-3.5 font-bold text-slate-900">
                          R$ {hon.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="px-3 py-3.5 text-slate-700 font-medium">
                          {hon.data_vencimento.split('-').reverse().join('/')}
                        </td>

                        <td className="px-3 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            hon.status === 'Pago'
                              ? 'bg-emerald-50 text-brand-green border border-emerald-200'
                              : hon.status === 'Vencido'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {hon.status === 'Vencido' ? `Vencido (${hon.dias_atraso || 1}d)` : hon.status}
                          </span>
                        </td>

                        <td className="px-3 py-3.5">
                          {hon.status === 'Pago' && hon.data_pagamento ? (
                            <div>
                              <p className="font-bold text-emerald-800 text-[11px]">
                                {hon.data_pagamento.split('-').reverse().join('/')}
                              </p>
                              <span className="text-[10px] text-slate-500">
                                {hon.forma_pagamento || 'PIX'} • Caixa {hon.competencia_pagamento}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          {hon.status !== 'Pago' ? (
                            <>
                              <button
                                onClick={() => handleAbrirBaixa(hon)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-brand-green border border-emerald-200 font-bold transition-all shadow-subtle"
                              >
                                Dar Baixa
                              </button>
                              <button
                                onClick={() => handleCobrarWhatsApp(hon.id)}
                                title="Cobrança no WhatsApp"
                                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-brand-green" />
                              </button>
                            </>
                          ) : (
                            <span className="text-emerald-600 font-bold text-[11px] flex items-center justify-end gap-1">
                              <CheckCheck className="w-3.5 h-3.5" />
                              Quitado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 02: EXTRATO CONSOLIDADO POR CLIENTE (PROJETADO, REALIZADO, ATRASADO)  */}
      {/* ========================================================================= */}
      {abaAtiva === 'clientes-consolidado' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Painel Consolidado por Cliente</h3>
                <p className="text-xs text-slate-500">
                  Visão executiva da carteira com Honorário Contratual (MRR), Total Projetado, Total Realizado e Inadimplência
                </p>
              </div>
              <span className="bg-blue-50 text-brand-blue text-xs font-bold px-3 py-1 rounded-full">
                {clientesAtivos.length} Clientes Ativos • MRR: R$ {mrrTotalContratual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3.5">Empresa / Cliente</th>
                    <th className="px-3 py-3.5">Regime</th>
                    <th className="px-3 py-3.5">Honorário (MRR)</th>
                    <th className="px-3 py-3.5">Projetado (Total)</th>
                    <th className="px-3 py-3.5">Realizado (Pago)</th>
                    <th className="px-3 py-3.5">Em Atraso (Vencido)</th>
                    <th className="px-3 py-3.5">Situação</th>
                    <th className="px-5 py-3.5 text-right">Extrato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientesAtivos.map(cli => {
                    const honsDoCliente = honorarios.filter(h => h.cliente_id === cli.id);
                    const projCli = honsDoCliente.reduce((acc, h) => acc + h.valor, 0);
                    const realCli = honsDoCliente.filter(h => h.status === 'Pago').reduce((acc, h) => acc + h.valor, 0);
                    const atrasoCli = honsDoCliente.filter(h => h.status === 'Vencido').reduce((acc, h) => acc + h.valor, 0);
                    const parcelasAtrasadas = honsDoCliente.filter(h => h.status === 'Vencido').length;

                    return (
                      <tr key={cli.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-bold text-slate-900">{cli.nome}</p>
                            <p className="text-[10px] text-slate-500">{cli.responsavel} • Venc. dia {cli.dia_vencimento}</p>
                          </div>
                        </td>

                        <td className="px-3 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-brand-blue">
                            {cli.regime_tributario}
                          </span>
                        </td>

                        <td className="px-3 py-3.5 font-bold text-slate-800">
                          R$ {cli.honorario_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="px-3 py-3.5 font-semibold text-blue-700">
                          R$ {projCli.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="px-3 py-3.5 font-semibold text-brand-green">
                          R$ {realCli.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="px-3 py-3.5">
                          {atrasoCli > 0 ? (
                            <div>
                              <span className="font-black text-red-600">
                                R$ {atrasoCli.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <p className="text-[10px] text-red-500 font-semibold">{parcelasAtrasadas} parcela(s)</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium">—</span>
                          )}
                        </td>

                        <td className="px-3 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            atrasoCli === 0
                              ? 'bg-emerald-50 text-brand-green border border-emerald-200'
                              : parcelasAtrasadas >= 2
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {atrasoCli === 0 ? 'Em Dia' : `${parcelasAtrasadas} Atraso(s)`}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right space-x-1">
                          <button
                            onClick={() => setClienteExtratoModal(cli.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                          >
                            Ver Extrato
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 03: PARTILHA DE SÓCIOS (35% GUILHERME, 35% YGOR, 20% CAIXA, 10% RES)   */}
      {/* ========================================================================= */}
      {abaAtiva === 'partilha' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Partilha Oficial fin.up Consultoria</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribuição calculada sobre a base de honorários e faturamento realizado
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-brand-green rounded-full text-xs font-bold">
                  Base Calculada: R$ {basePartilha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Cards da Partilha 35 / 35 / 30 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 bg-blue-50/70 rounded-3xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900 text-sm">Sócio Guilherme (35%)</span>
                  <span className="w-7 h-7 rounded-full bg-blue-200/60 text-blue-800 flex items-center justify-center font-bold text-xs">G</span>
                </div>
                <p className="text-3xl font-black text-brand-blue">
                  R$ {partilhaGuilherme.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-500">Chave PIX cadastrada para repasse mensal</p>
              </div>

              <div className="p-5 bg-blue-50/70 rounded-3xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900 text-sm">Sócio Ygor (35%)</span>
                  <span className="w-7 h-7 rounded-full bg-blue-200/60 text-blue-800 flex items-center justify-center font-bold text-xs">Y</span>
                </div>
                <p className="text-3xl font-black text-brand-blue">
                  R$ {partilhaYgor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-500">Chave PIX cadastrada para repasse mensal</p>
              </div>

              <div className="p-5 bg-purple-50/70 rounded-3xl border border-purple-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-purple-900 text-sm">fin.up Consultoria (30%)</span>
                  <span className="w-7 h-7 rounded-full bg-purple-200/60 text-purple-800 flex items-center justify-center font-bold text-xs">F</span>
                </div>
                <p className="text-3xl font-black text-purple-700">
                  R$ {partilhaTotalFinup.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="text-[11px] text-purple-900 font-semibold space-y-1 pt-2 border-t border-purple-200">
                  <p className="flex justify-between">
                    <span>• Caixa Operacional (20%):</span>
                    <span className="font-bold">R$ {partilhaCaixaFinup.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>• Reserva Emergência (10%):</span>
                    <span className="font-bold">R$ {partilhaReservaFinup.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 04: CONTAS A PAGAR                                                    */}
      {/* ========================================================================= */}
      {abaAtiva === 'pagar' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Contas a Pagar & Despesas</h3>
                <p className="text-xs text-slate-500">Controle de saídas operacionais, licenças e custos fixos</p>
              </div>
              <button
                onClick={() => setModalNovaContaPagar(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Despesa</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-3 py-3">Fornecedor</th>
                    <th className="px-3 py-3">Valor</th>
                    <th className="px-3 py-3">Vencimento</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contasPagar.map(cp => (
                    <tr key={cp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{cp.descricao}</td>
                      <td className="px-3 py-3 text-slate-600">{cp.fornecedor}</td>
                      <td className="px-3 py-3 font-semibold text-slate-800">
                        R$ {cp.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3 text-slate-700">{cp.data_vencimento}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cp.status === 'Pago'
                            ? 'bg-emerald-50 text-brand-green border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {cp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {cp.status !== 'Pago' && (
                          <button
                            onClick={() => pagarConta(cp.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-brand-green border border-emerald-200 text-xs font-bold transition-all"
                          >
                            Dar Baixa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 05: RECEITAS AVULSAS & PROJETOS                                        */}
      {/* ========================================================================= */}
      {abaAtiva === 'avulsas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Projetos & Receitas Não Recorrentes</h3>
                <p className="text-xs text-slate-500">Abertura de empresas, alterações e serviços avulsos com controle de custos</p>
              </div>
              <button
                onClick={() => setModalNovaReceitaAvulsa(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Projeto</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receitasNaoRecorrentes.map(rec => {
                const totalCustos = rec.custos_vinculados.reduce((acc, c) => acc + c.valor, 0);
                const margemLiquida = rec.valor_total - totalCustos;

                return (
                  <div key={rec.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{rec.titulo_servico}</span>
                      <span className="bg-blue-100 text-brand-blue px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {rec.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Cliente: {rec.cliente_nome}</p>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Receita Bruta</span>
                        <span className="font-bold text-slate-800">
                          R$ {rec.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Custos Vinculados</span>
                        <span className="font-bold text-red-600">
                          R$ {totalCustos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Margem Líquida</span>
                        <span className="font-bold text-brand-green">
                          R$ {margemLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Custos Vinculados */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Custos & Taxas Vinculadas:</span>
                        <button
                          onClick={() => setModalNovoCustoAvulso(rec.id)}
                          className="text-[11px] text-brand-blue font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Adicionar Custo
                        </button>
                      </div>
                      {rec.custos_vinculados.map(c => (
                        <div key={c.id} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-white border border-slate-100">
                          <span className="text-slate-600">{c.descricao}</span>
                          <span className="font-bold text-red-600">
                            - R$ {c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 06: CONCILIAÇÃO PICPAY (OFX)                                          */}
      {/* ========================================================================= */}
      {abaAtiva === 'ofx' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Extrato & Conciliação PicPay Empresas</h3>
                <p className="text-xs text-slate-500">Conciliação automática via arquivo bancário .OFX</p>
              </div>
              <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-brand-green border border-emerald-200 text-xs font-bold transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Extrato OFX</span>
                <input
                  type="file"
                  accept=".ofx"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files?.[0]) {
                      setToastMsg('📁 Arquivo .OFX processado! 4 novas transações importadas para conciliação.');
                      setTimeout(() => setToastMsg(null), 4000);
                    }
                  }}
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3">Data</th>
                    <th className="px-3 py-3">Tipo</th>
                    <th className="px-3 py-3">Descrição Extrato</th>
                    <th className="px-3 py-3">Valor</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transacoesOFX.map(tr => (
                    <tr key={tr.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-slate-700 font-medium">{tr.data}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tr.tipo === 'CREDIT' ? 'bg-emerald-50 text-brand-green' : 'bg-red-50 text-red-600'
                        }`}>
                          {tr.tipo === 'CREDIT' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-800">{tr.descricao}</td>
                      <td className={`px-3 py-3 font-bold ${tr.tipo === 'CREDIT' ? 'text-brand-green' : 'text-red-600'}`}>
                        R$ {tr.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tr.conciliado
                            ? 'bg-emerald-50 text-brand-green border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {tr.conciliado ? 'Conciliado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!tr.conciliado && (
                          <button
                            onClick={() => conciliarTransacaoOFX(tr.id, 'Honorário PicPay')}
                            className="px-2.5 py-1 rounded-lg bg-brand-blue text-white text-xs font-bold transition-all shadow-subtle"
                          >
                            Conciliar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL INTELIGENTE DE BAIXA DE HONORÁRIO                                   */}
      {/* ========================================================================= */}
      {modalBaixaHonorario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-green" />
                <h3 className="font-bold text-slate-900 text-sm">Dar Baixa em Honorário</h3>
              </div>
              <button
                onClick={() => setModalBaixaHonorario(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmarBaixa} className="p-6 space-y-4 text-xs">
              {/* Card Resumo do Honorário */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{modalBaixaHonorario.cliente_nome}</span>
                  <span className="bg-blue-100 text-brand-blue px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Comp. {modalBaixaHonorario.competencia}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Vencimento original: {modalBaixaHonorario.data_vencimento.split('-').reverse().join('/')}
                </p>
                <p className="text-[11px] font-bold text-slate-700">
                  Valor Original: R$ {modalBaixaHonorario.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Informação sobre Regime de Competência x Caixa */}
              <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-blue-900 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                  Regime Contábil fin.up:
                </p>
                <p>
                  A baixa quitará a <strong>Competência {modalBaixaHonorario.competencia}</strong>. 
                  O valor entrará no <strong>Faturamento de Caixa</strong> correspondente à <strong>Data de Pagamento</strong> selecionada abaixo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Efetiva de Pagamento *</label>
                  <input
                    type="date"
                    required
                    value={baixaDataPagamento}
                    onChange={e => setBaixaDataPagamento(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor Pago (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={baixaValor}
                    onChange={e => setBaixaValor(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-black text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Forma de Pagamento</label>
                <select
                  value={baixaFormaPagamento}
                  onChange={e => setBaixaFormaPagamento(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                >
                  <option value="PIX PicPay">PIX PicPay Empresas</option>
                  <option value="Boleto">Boleto Bancário</option>
                  <option value="Transferência">Transferência Bancária (TED/PIX)</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações / Número Comprovante</label>
                <input
                  type="text"
                  placeholder="Ex: Conciliado via extrato PicPay 05/10"
                  value={baixaObservacoes}
                  onChange={e => setBaixaObservacoes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              {/* Envio de WhatsApp */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-green" />
                  <div>
                    <p className="font-bold text-slate-800 text-[11px]">Enviar confirmação por WhatsApp</p>
                    <p className="text-[10px] text-slate-500">Notifica o cliente com o comprovante de quitação</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={baixaNotificarWhats}
                  onChange={e => setBaixaNotificarWhats(e.target.checked)}
                  className="w-4 h-4 text-brand-green rounded border-slate-300 focus:ring-brand-green"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalBaixaHonorario(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-green hover:bg-emerald-600 text-white font-bold transition-all shadow-md"
                >
                  Confirmar Baixa & Liquidação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EXTRATO INDIVIDUAL DO CLIENTE                                       */}
      {/* ========================================================================= */}
      {clienteExtratoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            {(() => {
              const cli = clientes.find(c => c.id === clienteExtratoModal);
              if (!cli) return null;

              const honsDoCli = honorarios.filter(h => h.cliente_id === cli.id);
              const totalPago = honsDoCli.filter(h => h.status === 'Pago').reduce((acc, h) => acc + h.valor, 0);
              const totalAtraso = honsDoCli.filter(h => h.status === 'Vencido').reduce((acc, h) => acc + h.valor, 0);

              return (
                <div>
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Extrato Financeiro de Honorários</h3>
                      <p className="text-[11px] text-slate-600">{cli.nome} ({cli.regime_tributario})</p>
                    </div>
                    <button onClick={() => setClienteExtratoModal(null)} className="text-slate-400 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4 text-xs">
                    {/* Resumo */}
                    <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Honorário Mensal</span>
                        <span className="font-extrabold text-slate-800 text-sm">
                          R$ {cli.honorario_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Quitado</span>
                        <span className="font-extrabold text-brand-green text-sm">
                          R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Vencido</span>
                        <span className="font-extrabold text-red-600 text-sm">
                          R$ {totalAtraso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Lista das Competências */}
                    <div className="overflow-y-auto max-h-72 border border-slate-200 rounded-2xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Competência</th>
                            <th className="p-3">Valor</th>
                            <th className="p-3">Vencimento</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {honsDoCli.map(h => (
                            <tr key={h.id}>
                              <td className="p-3 font-bold text-slate-800">{h.competencia}</td>
                              <td className="p-3 font-semibold">R$ {h.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                              <td className="p-3">{h.data_vencimento.split('-').reverse().join('/')}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  h.status === 'Pago'
                                    ? 'bg-emerald-50 text-brand-green'
                                    : h.status === 'Vencido'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {h.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {h.status !== 'Pago' && (
                                  <button
                                    onClick={() => {
                                      setClienteExtratoModal(null);
                                      handleAbrirBaixa(h);
                                    }}
                                    className="px-2 py-1 rounded-lg bg-emerald-50 text-brand-green font-bold text-[10px]"
                                  >
                                    Dar Baixa
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL NOVA CONTA A PAGAR                                                  */}
      {/* ========================================================================= */}
      {modalNovaContaPagar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Adicionar Conta a Pagar</h3>
              <button onClick={() => setModalNovaContaPagar(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSalvarContaPagar} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assinatura Software Contábil"
                  value={descPagar}
                  onChange={e => setDescPagar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fornecedor</label>
                  <input
                    type="text"
                    value={fornecedorPagar}
                    onChange={e => setFornecedorPagar(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorPagar}
                    onChange={e => setValorPagar(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data de Vencimento *</label>
                <input
                  type="date"
                  required
                  value={vencPagar}
                  onChange={e => setVencPagar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovaContaPagar(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-blue text-white font-bold"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL NOVA RECEITA AVULSA                                                 */}
      {/* ========================================================================= */}
      {modalNovaReceitaAvulsa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Cadastrar Projeto / Receita Avulsa</h3>
              <button onClick={() => setModalNovaReceitaAvulsa(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSalvarReceitaAvulsa} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título do Serviço / Projeto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abertura de Filial / Alteração Contratual"
                  value={tituloAvulsa}
                  onChange={e => setTituloAvulsa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cliente</label>
                <select
                  value={clienteAvulsa}
                  onChange={e => setClienteAvulsa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                >
                  {clientes.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor Total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorAvulsa}
                    onChange={e => setValorAvulsa(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Previsão</label>
                  <input
                    type="date"
                    value={dataPrevistaAvulsa}
                    onChange={e => setDataPrevistaAvulsa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovaReceitaAvulsa(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-blue text-white font-bold"
                >
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL NOVO CUSTO AVULSO                                                   */}
      {/* ========================================================================= */}
      {modalNovoCustoAvulso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Adicionar Custo ao Projeto</h3>
              <button onClick={() => setModalNovoCustoAvulso(null)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSalvarCustoAvulso} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Custo / Taxa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: DARE SP ou Certificado Digital"
                  value={descCusto}
                  onChange={e => setDescCusto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={valorCusto}
                  onChange={e => setValorCusto(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoCustoAvulso(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold"
                >
                  Vincular Custo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
