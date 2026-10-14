'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Cliente, RegimeTributario, ContatoNotificacao, DeclaracaoVinculadaCliente } from '@/types';
import {
  Users,
  Building,
  DollarSign,
  MessageSquare,
  Search,
  Plus,
  X,
  History,
  Edit3,
  Power,
  FileText,
  Calendar,
  CheckCircle2,
  Trash2,
  Clock,
  Send,
  UserCheck
} from 'lucide-react';

export function ClientesView() {
  const {
    clientes,
    colaboradores,
    declaracoes,
    addCliente,
    updateCliente,
    alternarStatusCliente,
    vincularDeclaracaoCliente,
    desvincularDeclaracaoCliente,
    dispararCobrancaDocumentosCliente
  } = useApp();

  const [busca, setBusca] = useState('');
  const [filtroRegime, setFiltroRegime] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Modais
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalEditarCliente, setModalEditarCliente] = useState<Cliente | null>(null);
  const [modalHistoricoCliente, setModalHistoricoCliente] = useState<Cliente | null>(null);
  const [modalDeclaracoesCliente, setModalDeclaracoesCliente] = useState<Cliente | null>(null);

  // Estados de Edição / Novo Cliente
  const [nome, setNome] = useState('');
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [receberGuiasWhats, setReceberGuiasWhats] = useState(true);
  const [regime, setRegime] = useState<RegimeTributario>('Simples Nacional');
  const [responsavel, setResponsavel] = useState(colaboradores[0]?.nome || '');
  const [honorario, setHonorario] = useState(1800);
  const [diaVencimento, setDiaVencimento] = useState(15);
  const [dataInicioContrato, setDataInicioContrato] = useState('2026-01-01');
  const [dataRenovacaoContrato, setDataRenovacaoContrato] = useState('2027-01-01');

  // Contatos de WhatsApp adicionais (Individuais ou Grupos)
  const [contatosLista, setContatosLista] = useState<ContatoNotificacao[]>([]);
  const [novoContatoNome, setNovoContatoNome] = useState('');
  const [novoContatoTelefone, setNovoContatoTelefone] = useState('');
  const [novoContatoTipo, setNovoContatoTipo] = useState<'Individual' | 'Grupo'>('Individual');

  // Estado para vincular declaração
  const [decSelecionadaId, setDecSelecionadaId] = useState(declaracoes[0]?.id || '');
  const [decDataInicio, setDecDataInicio] = useState('2026-10-01');
  const [decDiaVenc, setDecDiaVenc] = useState(20);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Métricas
  const totalHonorarios = clientes.reduce((acc, c) => acc + (c.status === 'Ativo' ? (c.honorario_mensal || 0) : 0), 0);
  const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length;
  const clientesInativos = clientes.filter(c => c.status !== 'Ativo').length;

  const clientesFiltrados = clientes.filter(c => {
    const matchRegime = filtroRegime === 'todos' || c.regime_tributario === filtroRegime;
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus;
    const matchBusca = !busca ||
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.cnpj_cpf.toLowerCase().includes(busca.toLowerCase()) ||
      c.responsavel.toLowerCase().includes(busca.toLowerCase());
    return matchRegime && matchStatus && matchBusca;
  });

  // Abrir Modal de Edição preenchendo os dados
  const handleAbrirEdicao = (cli: Cliente) => {
    setModalEditarCliente(cli);
    setNome(cli.nome);
    setCnpjCpf(cli.cnpj_cpf);
    setEmail(cli.email);
    setTelefone(cli.telefone);
    setReceberGuiasWhats(cli.receber_guias_whatsapp !== false);
    setRegime(cli.regime_tributario);
    setResponsavel(cli.responsavel);
    setHonorario(cli.honorario_mensal || 0);
    setDiaVencimento(cli.dia_vencimento || 15);
    setDataInicioContrato(cli.data_inicio_contrato || '2026-01-01');
    setDataRenovacaoContrato(cli.data_renovacao_contrato || '2027-01-01');
    setContatosLista(cli.contatos_notificacao || []);
  };

  const handleSalvarNovoCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    addCliente({
      nome,
      cnpj_cpf: cnpjCpf || 'Não informado',
      email,
      telefone,
      whatsapp: telefone,
      receber_guias_whatsapp: receberGuiasWhats,
      contatos_notificacao: contatosLista,
      regime_tributario: regime,
      status: 'Ativo',
      responsavel,
      honorario_mensal: honorario,
      dia_vencimento: diaVencimento,
      data_inicio_contrato: dataInicioContrato,
      data_renovacao_contrato: dataRenovacaoContrato,
      endereco: 'Endereço comercial'
    });

    setModalNovoCliente(false);
    limparFormulario();
    setToastMsg(`🎉 Cliente ${nome} cadastrado com sucesso!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSalvarEdicaoCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditarCliente) return;

    updateCliente(
      modalEditarCliente.id,
      {
        nome,
        cnpj_cpf: cnpjCpf,
        email,
        telefone,
        whatsapp: telefone,
        receber_guias_whatsapp: receberGuiasWhats,
        contatos_notificacao: contatosLista,
        regime_tributario: regime,
        responsavel,
        honorario_mensal: honorario,
        dia_vencimento: diaVencimento,
        data_inicio_contrato: dataInicioContrato,
        data_renovacao_contrato: dataRenovacaoContrato
      },
      `Dados cadastrais atualizados (Honorário: R$ ${honorario}, Vencimento: dia ${diaVencimento}).`
    );

    setModalEditarCliente(null);
    limparFormulario();
    setToastMsg(`✅ Alterações do cliente salvas no histórico!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const limparFormulario = () => {
    setNome('');
    setCnpjCpf('');
    setEmail('');
    setTelefone('');
    setContatosLista([]);
    setNovoContatoNome('');
    setNovoContatoTelefone('');
  };

  const handleAdicionarContato = () => {
    if (!novoContatoNome || !novoContatoTelefone) return;
    const novo: ContatoNotificacao = {
      id: `ct-${Date.now()}`,
      nome: novoContatoNome,
      telefoneOuGrupo: novoContatoTelefone,
      tipo: novoContatoTipo,
      principal: contatosLista.length === 0
    };
    setContatosLista([...contatosLista, novo]);
    setNovoContatoNome('');
    setNovoContatoTelefone('');
  };

  const handleRemoverContato = (id: string) => {
    setContatosLista(contatosLista.filter(c => c.id !== id));
  };

  // Vincular declaração e gerar tarefas
  const handleVincularDeclaracao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDeclaracoesCliente) return;

    const dec = declaracoes.find(d => d.id === decSelecionadaId);
    if (!dec) return;

    vincularDeclaracaoCliente(modalDeclaracoesCliente.id, {
      declaracao_id: dec.id,
      titulo: dec.titulo,
      periodicidade: dec.periodicidade,
      data_inicio: decDataInicio,
      dia_vencimento: decDiaVenc
    });

    setToastMsg(`⚡ Obrigação "${dec.titulo}" vinculada e tarefas geradas no Menu 01!`);
    setTimeout(() => setToastMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
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

      {/* 1. CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">MRR da Carteira Ativa</p>
            <p className="text-2xl font-bold text-brand-green mt-1">
              R$ {totalHonorarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-600 mt-1">Receita mensal recorrente</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clientes Ativos</p>
            <p className="text-2xl font-bold text-brand-blue mt-1">{clientesAtivos}</p>
            <p className="text-[11px] text-slate-500 mt-1">{clientesInativos} inativos / suspensos</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Médio Mensal</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">
              R$ {clientesAtivos > 0 ? (totalHonorarios / clientesAtivos).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
            </p>
            <p className="text-[11px] text-purple-600 mt-1">Média por empresa atendida</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. BARRA DE BUSCA, FILTROS & AÇÕES */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por empresa, CNPJ ou consultor..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro Status */}
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 font-medium"
          >
            <option value="todos">Todos os Status</option>
            <option value="Ativo">Apenas Ativos</option>
            <option value="Inativo">Inativos / Suspensos</option>
          </select>

          {/* Filtro Regime */}
          <select
            value={filtroRegime}
            onChange={e => setFiltroRegime(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 font-medium"
          >
            <option value="todos">Todos os Regimes</option>
            <option value="Simples Nacional">Simples Nacional</option>
            <option value="Lucro Presumido">Lucro Presumido</option>
            <option value="Lucro Real">Lucro Real</option>
            <option value="MEI">MEI</option>
          </select>

          <button
            onClick={() => {
              limparFormulario();
              setModalNovoCliente(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* 3. TABELA DE CLIENTES PROFISSIONAL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Empresa & CNPJ</th>
                <th className="px-4 py-3.5">Regime</th>
                <th className="px-4 py-3.5">Honorário & Venc.</th>
                <th className="px-4 py-3.5">Contrato (Vigência)</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Declarações</th>
                <th className="px-5 py-3.5 text-right">Ações & Auditoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientesFiltrados.map(cli => {
                const isAtivo = cli.status === 'Ativo';
                const qtdDecs = cli.declaracoes_vinculadas?.length || 0;
                const qtdHistorico = cli.historico_alteracoes?.length || 1;

                return (
                  <tr key={cli.id} className={`hover:bg-slate-50/70 transition-colors ${!isAtivo ? 'opacity-60 bg-slate-50/40' : ''}`}>
                    {/* Empresa & CNPJ */}
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{cli.nome}</span>
                        <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px]">
                          <span>CNPJ: {cli.cnpj_cpf}</span>
                          <span className="text-slate-300">•</span>
                          <span>Resp: <strong>{cli.responsavel}</strong></span>
                        </div>
                      </div>
                    </td>

                    {/* Regime Tributário */}
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-blue border border-blue-200">
                        {cli.regime_tributario}
                      </span>
                    </td>

                    {/* Honorário & Vencimento */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">
                        R$ {(cli.honorario_mensal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-slate-500">Todo dia {cli.dia_vencimento || 15}</p>
                    </td>

                    {/* Contrato e Renovação */}
                    <td className="px-4 py-4">
                      <div className="text-[11px] text-slate-700">
                        <p>Início: <strong>{cli.data_inicio_contrato || '01/08/2026'}</strong></p>
                        <p className="text-amber-700 font-semibold mt-0.5">
                          Renovação: {cli.data_renovacao_contrato || '01/08/2027'}
                        </p>
                      </div>
                    </td>

                    {/* Status Ativo/Inativo */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => alternarStatusCliente(cli.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          isAtivo
                            ? 'bg-emerald-50 text-brand-green border-emerald-300 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                        }`}
                        title="Clique para alternar entre Ativo e Inativo"
                      >
                        <Power className="w-3 h-3" />
                        <span>{isAtivo ? 'Ativo' : 'Inativo'}</span>
                      </button>
                    </td>

                    {/* Declarações Vinculadas */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setModalDeclaracoesCliente(cli)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-semibold transition-all"
                        title="Gerenciar declarações fiscais desta empresa"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{qtdDecs > 0 ? `${qtdDecs} Declarações` : '+ Vincular'}</span>
                      </button>
                    </td>

                    {/* Ações & Linha do Tempo */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Linha do Tempo / Histórico de Alterações */}
                        <button
                          onClick={() => setModalHistoricoCliente(cli)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                          title={`Ver Linha do Tempo de Alterações (${qtdHistorico} eventos)`}
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        {/* Cobrança WhatsApp */}
                        <button
                          onClick={() => dispararCobrancaDocumentosCliente(cli.id)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-brand-green border border-emerald-200 transition-all"
                          title="Cobrar envio de documentos no WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => handleAbrirEdicao(cli)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 transition-all"
                          title="Editar Cadastro da Empresa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL NOVO / EDITAR CLIENTE */}
      {(modalNovoCliente || modalEditarCliente) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="font-bold text-slate-900 text-sm">
                {modalEditarCliente ? `Editar Cliente: ${modalEditarCliente.nome}` : 'Cadastrar Novo Cliente na fin.up'}
              </h3>
              <button
                onClick={() => {
                  setModalNovoCliente(false);
                  setModalEditarCliente(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={modalEditarCliente ? handleSalvarEdicaoCliente : handleSalvarNovoCliente}
              className="p-6 overflow-y-auto space-y-4 text-xs"
            >
              {/* Dados Principais */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Razão Social / Nome Fantasia *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CNPJ / CPF</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={cnpjCpf}
                    onChange={e => setCnpjCpf(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Contato & Regime */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Regime Tributário</label>
                  <select
                    value={regime}
                    onChange={e => setRegime(e.target.value as RegimeTributario)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Simples Nacional">Simples Nacional</option>
                    <option value="Lucro Presumido">Lucro Presumido</option>
                    <option value="Lucro Real">Lucro Real</option>
                    <option value="MEI">MEI</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail Financeiro</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Principal</label>
                  <input
                    type="text"
                    placeholder="5519992080639"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Honorários e Contrato */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Honorário (R$)</label>
                  <input
                    type="number"
                    value={honorario}
                    onChange={e => setHonorario(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-brand-green"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dia Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={diaVencimento}
                    onChange={e => setDiaVencimento(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Início do Contrato</label>
                  <input
                    type="date"
                    value={dataInicioContrato}
                    onChange={e => setDataInicioContrato(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Renovação Contrato</label>
                  <input
                    type="date"
                    value={dataRenovacaoContrato}
                    onChange={e => setDataRenovacaoContrato(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Consultor Responsável */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consultor Responsável</label>
                <select
                  value={responsavel}
                  onChange={e => setResponsavel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}</option>
                  ))}
                  <option value="Guilherme">Guilherme</option>
                  <option value="Ygor">Ygor</option>
                </select>
              </div>

              {/* Múltiplos Contatos para Notificações & Grupos de WhatsApp */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Contatos de Notificação Simultânea (WhatsApp / Grupos)</span>
                    <span className="text-[10px] text-slate-500">
                      💡 Envie para números individuais ou para o <strong>Grupo de WhatsApp</strong> da empresa!
                    </span>
                  </div>
                </div>

                {/* Lista de Contatos Adicionados */}
                <div className="space-y-1.5">
                  {contatosLista.map(ct => (
                    <div key={ct.id} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ct.tipo === 'Grupo' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-800'}`}>
                          {ct.tipo}
                        </span>
                        <span className="font-semibold text-slate-800">{ct.nome}</span>
                        <span className="text-slate-500 text-[11px]">({ct.telefoneOuGrupo})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoverContato(ct.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Linha para adicionar novo contato */}
                <div className="grid grid-cols-12 gap-2 pt-2 border-t border-slate-200">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Nome (ex: Financeiro, Grupo Sócios)"
                      value={novoContatoNome}
                      onChange={e => setNovoContatoNome(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Número ou ID do Grupo"
                      value={novoContatoTelefone}
                      onChange={e => setNovoContatoTelefone(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={novoContatoTipo}
                      onChange={e => setNovoContatoTipo(e.target.value as 'Individual' | 'Grupo')}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="Individual">Individual</option>
                      <option value="Grupo">Grupo WhatsApp</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={handleAdicionarContato}
                      className="w-full h-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center"
                      title="Adicionar contato"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalNovoCliente(false);
                    setModalEditarCliente(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold shadow-sm"
                >
                  {modalEditarCliente ? 'Salvar Alterações' : 'Cadastrar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL DE LINHA DO TEMPO / AUDITORIA DO CLIENTE */}
      {modalHistoricoCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <History className="w-4 h-4 text-brand-blue" />
                <span>Linha do Tempo: {modalHistoricoCliente.nome}</span>
              </div>
              <button onClick={() => setModalHistoricoCliente(null)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                {(modalHistoricoCliente.historico_alteracoes || []).map((h, idx) => (
                  <div key={h.id || idx} className="relative pl-6">
                    <span className="absolute -left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-brand-blue border-2 border-white shadow-sm" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{h.tipo || 'Alteração'}</span>
                      <span className="text-[10px] text-slate-400">{h.data}</span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      {h.descricao}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">Registrado por: {h.autor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DE DECLARAÇÕES VINCULADAS & GERAÇÃO DE TAREFAS */}
      {modalDeclaracoesCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <FileText className="w-4 h-4 text-purple-700" />
                <span>Declarações Fiscais: {modalDeclaracoesCliente.nome}</span>
              </div>
              <button onClick={() => setModalDeclaracoesCliente(null)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Formulário para Vincular Nova Declaração */}
              <form onSubmit={handleVincularDeclaracao} className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3">
                <span className="font-bold text-purple-900 block text-xs">Vincular Nova Obrigação (Alimenta Menu 01 automaticamente):</span>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold">Selecione a Declaração:</label>
                  <select
                    value={decSelecionadaId}
                    onChange={e => setDecSelecionadaId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {declaracoes.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.titulo} ({d.periodicidade} - Dia {d.dia_limite_padrao || 20})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Data de Início da Obrigação:</label>
                    <input
                      type="date"
                      value={decDataInicio}
                      onChange={e => setDecDataInicio(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Dia de Vencimento:</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={decDiaVenc}
                      onChange={e => setDecDiaVenc(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Vincular e Gerar Tarefa no Menu 01</span>
                </button>
              </form>

              {/* Lista das Declarações Já Vinculadas */}
              <div>
                <span className="font-bold text-slate-700 block mb-2">Obrigações Ativas da Empresa:</span>
                {(!modalDeclaracoesCliente.declaracoes_vinculadas || modalDeclaracoesCliente.declaracoes_vinculadas.length === 0) ? (
                  <p className="text-slate-400 italic text-center py-3">Nenhuma obrigação vinculada ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {modalDeclaracoesCliente.declaracoes_vinculadas.map((dec, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                        <div>
                          <span className="font-bold text-slate-900">{dec.titulo}</span>
                          <p className="text-[11px] text-slate-500">
                            Periodicidade: {dec.periodicidade} | Vencimento dia {dec.dia_vencimento}
                          </p>
                        </div>
                        <button
                          onClick={() => desvincularDeclaracaoCliente(modalDeclaracoesCliente.id, dec.declaracao_id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Desvincular"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
