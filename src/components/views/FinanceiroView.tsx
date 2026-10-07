'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ContaPagar, ContaReceber, ReceitaNaoRecorrente } from '@/types';
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
  X
} from 'lucide-react';

export function FinanceiroView() {
  const {
    clientes,
    contasPagar,
    contasReceber,
    receitasNaoRecorrentes,
    transacoesOFX,
    addContaPagar,
    pagarConta,
    addContaReceber,
    receberConta,
    gerarProvisaoMensalHonorarios,
    addReceitaNaoRecorrente,
    addCustoReceitaNaoRecorrente,
    importarExtratoOFX,
    conciliarTransacaoOFX
  } = useApp();

  const [abaAtiva, setAbaAtiva] = useState<'partilha' | 'receber' | 'pagar' | 'avulsas' | 'ofx'>('partilha');

  // Modais
  const [modalNovaContaPagar, setModalNovaContaPagar] = useState(false);
  const [modalNovaReceitaAvulsa, setModalNovaReceitaAvulsa] = useState(false);
  const [modalNovoCustoAvulso, setModalNovoCustoAvulso] = useState<string | null>(null);

  // Estados Form Conta a Pagar
  const [descPagar, setDescPagar] = useState('');
  const [fornecedorPagar, setFornecedorPagar] = useState('');
  const [valorPagar, setValorPagar] = useState(0);
  const [vencPagar, setVencPagar] = useState('');

  // Estados Form Receita Avulsa
  const [tituloAvulsa, setTituloAvulsa] = useState('');
  const [clienteAvulsa, setClienteAvulsa] = useState(clientes[0]?.nome || '');
  const [valorAvulsa, setValorAvulsa] = useState(2500);
  const [dataPrevistaAvulsa, setDataPrevistaAvulsa] = useState('2026-10-25');

  // Estados Custo Avulso
  const [descCusto, setDescCusto] = useState('');
  const [valorCusto, setValorCusto] = useState(200);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Cálculo da receita recorrente total (MRR)
  const clientesAtivos = clientes.filter(c => c.status === 'Ativo');
  const mrrTotal = clientesAtivos.reduce((acc, c) => acc + (c.honorario_mensal || 0), 0);

  // NOVA REGRA DE PARTILHA FIN.UP:
  // 35% Sócio Guilherme
  // 35% Sócio Ygor
  // 30% Fin.up (20% Caixa Operacional + 10% Reserva de Emergência)
  const partilhaGuilherme = mrrTotal * 0.35;
  const partilhaYgor = mrrTotal * 0.35;
  const partilhaCaixaFinup = mrrTotal * 0.20;
  const partilhaReservaFinup = mrrTotal * 0.10;
  const partilhaTotalFinup = partilhaCaixaFinup + partilhaReservaFinup;

  // Totais de Contas
  const totalReceberPendente = contasReceber
    .filter(c => c.status === 'Pendente')
    .reduce((acc, c) => acc + c.valor, 0);

  const totalReceberPago = contasReceber
    .filter(c => c.status === 'Pago')
    .reduce((acc, c) => acc + c.valor, 0);

  const totalPagarPendente = contasPagar
    .filter(c => c.status === 'Pendente')
    .reduce((acc, c) => acc + c.valor, 0);

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

  const handleSalvarReceitaAvulsa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tituloAvulsa || !valorAvulsa) return;

    addReceitaNaoRecorrente({
      cliente_nome: clienteAvulsa,
      titulo_servico: tituloAvulsa,
      valor_total: valorAvulsa,
      data_prevista: dataPrevistaAvulsa,
      status: 'Previsto',
      conciliado_ofx: false,
      custos_vinculados: []
    });

    setModalNovaReceitaAvulsa(false);
    setTituloAvulsa('');
    setValorAvulsa(0);
    setToastMsg('🎉 Receita avulsa programada com sucesso!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAdicionarCusto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNovoCustoAvulso || !descCusto || !valorCusto) return;

    addCustoReceitaNaoRecorrente(modalNovoCustoAvulso, {
      descricao: descCusto,
      valor: valorCusto,
      pago: false,
      conciliado_ofx: false
    });

    setModalNovoCustoAvulso(null);
    setDescCusto('');
    setValorCusto(0);
    setToastMsg('✅ Custo vinculado à receita avulsa!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleGerarProvisao = () => {
    gerarProvisaoMensalHonorarios('10/2026');
    setToastMsg('⚡ Provisão mensal de honorários lançada para todos os clientes ativos!');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSimularUploadOFX = () => {
    const novas = [
      { fitid: `PICPAY-${Date.now()}-1`, tipo: 'CREDIT' as const, data: '2026-10-07', valor: 1800, descricao: 'TED RECEBIDO LEVI & ASSERI HONORARIOS', conciliado: false, banco: 'PicPay Empresas' as const },
      { fitid: `PICPAY-${Date.now()}-2`, tipo: 'DEBIT' as const, data: '2026-10-07', valor: 180, descricao: 'PAGAMENTO CERTIFICADO DIGITAL', conciliado: false, banco: 'PicPay Empresas' as const }
    ];
    importarExtratoOFX('PicPay Empresas', novas);
    setToastMsg('🏦 Extrato OFX do PicPay Empresas importado com sucesso!');
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-lg border border-emerald-700 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-green" />
            <p className="text-xs font-semibold">{toastMsg}</p>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. CARDS DE PARTILHA DOS SÓCIOS & CAIXA DA FIN.UP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Carteira */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faturamento Carteira (MRR)</p>
            <p className="text-2xl font-bold text-brand-green mt-1">
              R$ {mrrTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-600 mt-1">17 clientes ativos</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Sócios (35% Guilherme e 35% Ygor) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pró-labore Sócios (35% cada)</p>
            <p className="text-2xl font-bold text-brand-blue mt-1">
              R$ {partilhaGuilherme.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Guilherme / Ygor (R$ {(partilhaGuilherme * 2).toLocaleString('pt-BR')})</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Caixa Operacional Finup (20%) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Caixa Operacional Finup (20%)</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">
              R$ {partilhaCaixaFinup.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-purple-600 mt-1">Crescimento & Custos</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Reserva de Emergência Finup (10%) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reserva Emergência (10%)</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              R$ {partilhaReservaFinup.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Fundo Seguro fin.up</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. BARRA DE NAVEGAÇÃO DE ABAS FINANCEIRAS */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setAbaAtiva('partilha')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              abaAtiva === 'partilha' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📊 Partilha & Fechamento
          </button>
          <button
            onClick={() => setAbaAtiva('receber')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              abaAtiva === 'receber' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📈 Contas a Receber (Provisões)
          </button>
          <button
            onClick={() => setAbaAtiva('pagar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              abaAtiva === 'pagar' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📉 Contas a Pagar
          </button>
          <button
            onClick={() => setAbaAtiva('avulsas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              abaAtiva === 'avulsas' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            💼 Receitas Avulsas & Custos
          </button>
          <button
            onClick={() => setAbaAtiva('ofx')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              abaAtiva === 'ofx' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            🏦 Conciliação OFX (PicPay)
          </button>
        </div>

        {/* Ações Específicas da Aba */}
        <div className="flex items-center gap-2">
          {abaAtiva === 'receber' && (
            <button
              onClick={handleGerarProvisao}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-brand-green border border-emerald-200 text-xs font-bold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gerar Provisão do Mês</span>
            </button>
          )}

          {abaAtiva === 'pagar' && (
            <button
              onClick={() => setModalNovaContaPagar(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Conta a Pagar</span>
            </button>
          )}

          {abaAtiva === 'avulsas' && (
            <button
              onClick={() => setModalNovaReceitaAvulsa(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Receita Programada</span>
            </button>
          )}

          {abaAtiva === 'ofx' && (
            <button
              onClick={handleSimularUploadOFX}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Extrato OFX PicPay</span>
            </button>
          )}
        </div>
      </div>

      {/* ABA 1: PARTILHA SOCIETÁRIA & FECHAMENTOS MENSAIS */}
      {abaAtiva === 'partilha' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Demonstrativo da Partilha Societária (Competência Atual)</h3>
              <p className="text-xs text-slate-500">Divisão dos valores baseada no faturamento da carteira de clientes</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-brand-blue rounded-xl border border-blue-200">
              Regra Oficial: 35% / 35% / 30%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">Sócio Guilherme (35%)</span>
              <p className="text-2xl font-black text-brand-blue">
                R$ {partilhaGuilherme.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-500">Chave PIX cadastrada para recebimento</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-sm">Sócio Ygor (35%)</span>
              <p className="text-2xl font-black text-brand-blue">
                R$ {partilhaYgor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-500">Chave PIX cadastrada para recebimento</p>
            </div>

            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
              <span className="font-bold text-purple-900 block text-sm">fin.up Consultoria (30%)</span>
              <p className="text-2xl font-black text-purple-700">
                R$ {partilhaTotalFinup.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="text-[11px] text-purple-900 font-semibold space-y-0.5 pt-1 border-t border-purple-200">
                <p>• Caixa Operacional (20%): R$ {partilhaCaixaFinup.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p>• Reserva Emergência (10%): R$ {partilhaReservaFinup.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: CONTAS A RECEBER & PROVISÕES */}
      {abaAtiva === 'receber' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Provisões de Honorários & Contas a Receber</h3>
              <p className="text-xs text-slate-500">Lançamentos provisionados automaticamente e pagamentos recebidos dos clientes</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-slate-600">Pendente: <strong>R$ {totalReceberPendente.toLocaleString('pt-BR')}</strong></span>
              <span className="font-semibold text-brand-green">Recebido: <strong>R$ {totalReceberPago.toLocaleString('pt-BR')}</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Descrição & Cliente</th>
                  <th className="px-3 py-3">Tipo</th>
                  <th className="px-3 py-3">Valor</th>
                  <th className="px-3 py-3">Vencimento</th>
                  <th className="px-3 py-3">Data Recebimento</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contasReceber.map(cr => (
                  <tr key={cr.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{cr.descricao}</span>
                      <span className="text-[11px] text-slate-500">{cr.cliente_nome}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-blue">
                        {cr.categoria}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-900">
                      R$ {cr.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-3 text-slate-700 font-semibold">{cr.data_vencimento}</td>
                    <td className="px-3 py-3 text-slate-500">{cr.data_recebimento || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cr.status === 'Pago'
                          ? 'bg-emerald-50 text-brand-green border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {cr.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {cr.status !== 'Pago' && (
                        <button
                          onClick={() => receberConta(cr.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-brand-green border border-emerald-200 text-xs font-bold transition-all"
                        >
                          Confirmar Recebimento
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: CONTAS A PAGAR */}
      {abaAtiva === 'pagar' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Contas a Pagar & Despesas Operacionais</h3>
              <p className="text-xs text-slate-500">Despesas fixas e variáveis da consultoria com data de liquidação</p>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-xl border border-red-200">
              Total Pendente: R$ {totalPagarPendente.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-3 py-3">Fornecedor</th>
                  <th className="px-3 py-3">Valor</th>
                  <th className="px-3 py-3">Vencimento</th>
                  <th className="px-3 py-3">Data Pagamento</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contasPagar.map(cp => (
                  <tr key={cp.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">{cp.descricao}</td>
                    <td className="px-3 py-3 text-slate-600">{cp.fornecedor}</td>
                    <td className="px-3 py-3 font-bold text-slate-900">
                      R$ {cp.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-700">{cp.data_vencimento}</td>
                    <td className="px-3 py-3 text-slate-500">{cp.data_pagamento || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cp.status === 'Pago'
                          ? 'bg-emerald-50 text-brand-green border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {cp.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {cp.status !== 'Pago' && (
                        <button
                          onClick={() => pagarConta(cp.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 text-xs font-bold transition-all"
                        >
                          Liquidar / Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: RECEITAS AVULSAS & CUSTOS VINCULADOS */}
      {abaAtiva === 'avulsas' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Receitas Programadas Não Recorrentes & Custos</h3>
            <p className="text-xs text-slate-500">
              Projetos de Abertura de Empresa, Alterações e Transformações Societárias com controle de custos atrelados
            </p>
          </div>

          <div className="space-y-4">
            {receitasNaoRecorrentes.map(rec => {
              const totalCustos = rec.custos_vinculados.reduce((acc, c) => acc + c.valor, 0);
              const lucroProjeto = rec.valor_total - totalCustos;

              return (
                <div key={rec.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{rec.titulo_servico}</span>
                      <p className="text-xs text-slate-500 mt-0.5">Empresa / Cliente: <strong>{rec.cliente_nome}</strong></p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Receita Total</span>
                        <span className="font-black text-brand-green text-sm">R$ {rec.valor_total.toLocaleString('pt-BR')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Custos Vinculados</span>
                        <span className="font-black text-red-600 text-sm">R$ {totalCustos.toLocaleString('pt-BR')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Lucro Líquido do Projeto</span>
                        <span className="font-black text-brand-blue text-sm">R$ {lucroProjeto.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Custos Vinculados */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-700">Custos Atrelados ao Projeto (Conciliáveis via OFX):</span>
                      <button
                        onClick={() => setModalNovoCustoAvulso(rec.id)}
                        className="text-brand-blue hover:underline text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Custo</span>
                      </button>
                    </div>

                    {rec.custos_vinculados.length === 0 ? (
                      <p className="text-slate-400 italic text-xs py-1">Nenhum custo registrado para esta receita.</p>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        {rec.custos_vinculados.map(cst => (
                          <div key={cst.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                            <span className="font-medium text-slate-800">{cst.descricao}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-900">R$ {cst.valor.toLocaleString('pt-BR')}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cst.conciliado_ofx ? 'bg-emerald-100 text-brand-green' : 'bg-slate-200 text-slate-600'}`}>
                                {cst.conciliado_ofx ? '✅ Conciliado OFX' : 'A Conciliar'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 5: CONCILIAÇÃO BANCÁRIA OFX & PICPAY */}
      {abaAtiva === 'ofx' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Extrato Bancário & Conciliação OFX (PicPay Empresas)</h3>
              <p className="text-xs text-slate-500">
                Importação direta de arquivo .OFX com conferência automática de recebimentos e custos
              </p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Conexão PicPay Ativa</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Descrição no Extrato</th>
                  <th className="px-3 py-3">Tipo</th>
                  <th className="px-3 py-3">Valor</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transacoesOFX.map(tr => (
                  <tr key={tr.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-slate-600 font-semibold">{tr.data}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{tr.descricao}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tr.tipo === 'CREDIT' ? 'bg-emerald-100 text-brand-green' : 'bg-red-100 text-red-700'
                      }`}>
                        {tr.tipo === 'CREDIT' ? 'Entrada (Crédito)' : 'Saída (Débito)'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-black text-slate-900">
                      R$ {tr.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tr.conciliado ? 'bg-emerald-50 text-brand-green border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {tr.conciliado ? '✅ Conciliado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {!tr.conciliado && (
                        <button
                          onClick={() => {
                            conciliarTransacaoOFX(tr.id, tr.descricao);
                            setToastMsg('Transação bancária conciliada com sucesso!');
                            setTimeout(() => setToastMsg(null), 3000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all"
                        >
                          Conciliar Agora
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL NOVA CONTA A PAGAR */}
      {modalNovaContaPagar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Lançar Nova Conta a Pagar</h3>
              <button onClick={() => setModalNovaContaPagar(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSalvarContaPagar} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Pagamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel da sala, Plano Celular, Taxa Junta..."
                  value={descPagar}
                  onChange={e => setDescPagar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fornecedor / Beneficiário</label>
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
                    onChange={e => setValorPagar(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  required
                  value={vencPagar}
                  onChange={e => setVencPagar(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaContaPagar(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold shadow-sm"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA RECEITA AVULSA */}
      {modalNovaReceitaAvulsa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Nova Receita Não Recorrente (Projeto)</h3>
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
                  placeholder="Ex: Abertura de Empresa, Alteração Contratual..."
                  value={tituloAvulsa}
                  onChange={e => setTituloAvulsa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cliente / Empresa</label>
                <input
                  type="text"
                  required
                  value={clienteAvulsa}
                  onChange={e => setClienteAvulsa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor Cobrado (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valorAvulsa}
                    onChange={e => setValorAvulsa(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-brand-green"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Data Prevista Recebimento</label>
                  <input
                    type="date"
                    required
                    value={dataPrevistaAvulsa}
                    onChange={e => setDataPrevistaAvulsa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaReceitaAvulsa(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold shadow-sm"
                >
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR CUSTO A RECEITA AVULSA */}
      {modalNovoCustoAvulso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Vincular Custo ao Projeto</h3>
              <button onClick={() => setModalNovoCustoAvulso(null)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdicionarCusto} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição do Custo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Taxa JUCESP, DARE, Certificado..."
                  value={descCusto}
                  onChange={e => setDescCusto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Valor do Custo (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={valorCusto}
                  onChange={e => setValorCusto(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-red-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoCustoAvulso(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm"
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
