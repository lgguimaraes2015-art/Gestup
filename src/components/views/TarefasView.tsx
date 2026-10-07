'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Tarefa, StatusTarefa, Departamento, Prioridade } from '@/types';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Search,
  Building,
  Flame,
  X,
  History,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Copy,
  Sparkles,
  Upload,
  Eye,
  EyeOff,
  Send,
  FileText,
  DollarSign,
  ArrowRight,
  ExternalLink,
  Mail
} from 'lucide-react';

interface TarefasViewProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

export function TarefasView({ modalOpen, setModalOpen }: TarefasViewProps) {
  const {
    tarefas,
    clientes,
    colaboradores,
    addTarefa,
    updateTarefa,
    moverTarefaStatus,
    concluirTarefa,
    prorrogarTarefa,
    adicionarComentarioTarefa,
    deleteTarefa,
    dispararCobrancaTarefa
  } = useApp();

  // Estados de Controle de Visualização e Filtros
  const [viewMode, setViewMode] = useState<'lista' | 'kanban'>('lista');
  const [competenciaSelecionada, setCompetenciaSelecionada] = useState<string>('10/2026');
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroDepto, setFiltroDepto] = useState<string>('todos');
  const [filtroBusca, setFiltroBusca] = useState<string>('');
  
  // Requisito Clean UI: Por padrão tarefas concluídas NÃO aparecem
  const [exibirConcluidas, setExibirConcluidas] = useState<boolean>(false);

  // Estados dos Modais
  const [prorrogarModalTarefa, setProrrogarModalTarefa] = useState<Tarefa | null>(null);
  const [novoPrazo, setNovoPrazo] = useState<string>('');
  const [motivoProrrogacao, setMotivoProrrogacao] = useState<string>('');

  // Modal de Comentários / Observações (Balãozinho Verde)
  const [comentarioModalTarefa, setComentarioModalTarefa] = useState<Tarefa | null>(null);
  const [novoComentarioTexto, setNovoComentarioTexto] = useState('');
  const [novoComentarioAutor, setNovoComentarioAutor] = useState(colaboradores[0]?.nome || 'Guilherme (Gestor)');

  // Modal Inteligente de Conclusão com Guia de Pagamento
  const [concluirModalTarefa, setConcluirModalTarefa] = useState<Tarefa | null>(null);
  const [concluirEhPagamento, setConcluirEhPagamento] = useState<'sim' | 'nao'>('sim');
  const [concluirDataVencimento, setConcluirDataVencimento] = useState<string>('');
  const [concluirValor, setConcluirValor] = useState<string>('');
  const [concluirArquivoNome, setConcluirArquivoNome] = useState<string>('');

  // Estados do Formulário de Nova Tarefa
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoDescricao, setNovoDescricao] = useState('');
  const [novoClienteId, setNovoClienteId] = useState(clientes[0]?.id || '');
  const [novoResponsavel, setNovoResponsavel] = useState(colaboradores[0]?.nome || '');
  const [novoDepto, setNovoDepto] = useState<Departamento>('Fiscal');
  const [novoPrioridade, setNovoPrioridade] = useState<Prioridade>('Normal');
  const [novoPrazoMeta, setNovoPrazoMeta] = useState('');
  const [novoPrazoLegal, setNovoPrazoLegal] = useState('');
  const [novoCompetencia, setNovoCompetencia] = useState(competenciaSelecionada === 'todas' ? '10/2026' : competenciaSelecionada);
  const [novoTipo, setNovoTipo] = useState<'Recorrente' | 'Avulsa'>('Recorrente');

  // Feedbacks visuais
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Lista de todas as competências existentes ordenadas (decrescente)
  const competenciasDisponiveis = Array.from(
    new Set(tarefas.map(t => t.competencia).filter(Boolean))
  ).sort((a, b) => {
    const [ma, ya] = a.split('/').map(Number);
    const [mb, yb] = b.split('/').map(Number);
    return (yb * 100 + mb) - (ya * 100 + ma);
  });

  // Navegação de mês anterior e próximo
  const handleMudarMes = (direcao: 'anterior' | 'proximo') => {
    if (competenciaSelecionada === 'todas') {
      setCompetenciaSelecionada('10/2026');
      return;
    }
    const [mes, ano] = competenciaSelecionada.split('/').map(Number);
    let novoM = direcao === 'proximo' ? mes + 1 : mes - 1;
    let novoA = ano;
    if (novoM > 12) { novoM = 1; novoA += 1; }
    if (novoM < 1) { novoM = 12; novoA -= 1; }
    const novaComp = `${String(novoM).padStart(2, '0')}/${novoA}`;
    setCompetenciaSelecionada(novaComp);
  };

  // Filtragem por Competência
  const tarefasDaCompetencia = competenciaSelecionada === 'todas'
    ? tarefas
    : tarefas.filter(t => t.competencia === competenciaSelecionada);

  // Quantidade de tarefas concluídas na competência (para indicar quantas estão ocultas no modo Clean)
  const totalConcluidasNaCompetencia = tarefasDaCompetencia.filter(t => t.status === 'Concluída').length;

  // Filtragem completa refinada
  const tarefasFiltradas = tarefasDaCompetencia.filter(t => {
    // 1. Filtro por Empresa
    if (filtroEmpresa !== 'todos' && t.cliente_id !== filtroEmpresa) {
      return false;
    }

    // 2. Filtro por Departamento
    if (filtroDepto !== 'todos' && t.categoria !== filtroDepto) {
      return false;
    }

    // 3. Filtro por Status & Regra Clean UI (Ocultar concluídas por padrão)
    if (filtroStatus === 'todos') {
      if (!exibirConcluidas && t.status === 'Concluída') {
        return false;
      }
    } else if (t.status !== filtroStatus) {
      return false;
    }

    // 4. Busca por texto
    if (filtroBusca) {
      const q = filtroBusca.toLowerCase();
      const matchTitulo = t.titulo.toLowerCase().includes(q);
      const matchCliente = t.cliente_nome.toLowerCase().includes(q);
      const matchResp = t.responsavel.toLowerCase().includes(q);
      if (!matchTitulo && !matchCliente && !matchResp) return false;
    }

    return true;
  });

  // Métricas da Competência Ativa
  const totalNaComp = tarefasDaCompetencia.length;
  const concluidasNaComp = tarefasDaCompetencia.filter(t => t.status === 'Concluída').length;
  const atrasadasNaComp = tarefasDaCompetencia.filter(t => t.status === 'Atrasada').length;
  const pendentesNaComp = tarefasDaCompetencia.filter(t => t.status === 'Pendente' || t.status === 'Em Andamento').length;
  const taxaConclusaoComp = totalNaComp > 0 ? Math.round((concluidasNaComp / totalNaComp) * 100) : 0;

  // Replicar obrigações para a próxima competência
  const handleReplicarProximaCompetencia = () => {
    if (competenciaSelecionada === 'todas') return;
    const [mes, ano] = competenciaSelecionada.split('/').map(Number);
    let proxM = mes + 1;
    let proxA = ano;
    if (proxM > 12) { proxM = 1; proxA += 1; }
    const proxComp = `${String(proxM).padStart(2, '0')}/${proxA}`;

    let clonadas = 0;
    tarefasDaCompetencia.forEach(t => {
      const [y, m, d] = (t.data_prazo_meta || '2026-10-15').split('-').map(Number);
      let ny = y;
      let nm = m + 1;
      if (nm > 12) { nm = 1; ny += 1; }
      const novoPrazoCalculado = `${ny}-${String(nm).padStart(2, '0')}-${String(d || 15).padStart(2, '0')}`;

      addTarefa({
        titulo: t.titulo,
        descricao: t.descricao,
        tipo: 'Recorrente',
        status: 'Pendente',
        prioridade: t.prioridade,
        cliente_id: t.cliente_id,
        cliente_nome: t.cliente_nome,
        responsavel: t.responsavel,
        data_prazo_meta: novoPrazoCalculado,
        data_prazo_legal: t.data_prazo_legal,
        categoria: t.categoria,
        competencia: proxComp,
        tempo_gasto_minutos: 0,
        recorrencia_tipo: 'Mensal'
      });
      clonadas++;
    });

    setFeedbackToast(`🎉 ${clonadas} tarefas replicadas com sucesso para a competência ${proxComp}!`);
    setCompetenciaSelecionada(proxComp);
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  // Salvar Nova Tarefa
  const handleSalvarNovaTarefa = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente = clientes.find(c => c.id === novoClienteId);
    if (!novoTitulo || !cliente || !novoPrazoMeta) return;

    addTarefa({
      titulo: novoTitulo,
      descricao: novoDescricao,
      tipo: novoTipo,
      status: 'Pendente',
      prioridade: novoPrioridade,
      cliente_id: cliente.id,
      cliente_nome: cliente.nome,
      responsavel: novoResponsavel,
      data_prazo_meta: novoPrazoMeta,
      data_prazo_legal: novoPrazoLegal || novoPrazoMeta,
      categoria: novoDepto,
      competencia: novoCompetencia || '10/2026',
      tempo_gasto_minutos: 0,
      recorrencia_tipo: novoTipo === 'Recorrente' ? 'Mensal' : 'Única'
    });

    setModalOpen(false);
    setNovoTitulo('');
    setNovoDescricao('');
    setNovoPrazoMeta('');
    setNovoPrazoLegal('');
    setFeedbackToast('✅ Nova tarefa criada com sucesso!');
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Abrir Modal Inteligente de Conclusão de Tarefa
  const handleIniciarConclusao = (tarefa: Tarefa) => {
    setConcluirModalTarefa(tarefa);
    setConcluirEhPagamento('sim');
    setConcluirDataVencimento(tarefa.data_prazo_legal || new Date().toISOString().split('T')[0]);
    setConcluirValor('');
    const siglaDoc = tarefa.categoria === 'Fiscal' ? 'DAS' : tarefa.categoria === 'Pessoal' ? 'GPS' : 'GUIA';
    const compClean = (tarefa.competencia || '10_2026').replace('/', '_');
    const cliClean = (tarefa.cliente_nome || 'CLIENTE').replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    setConcluirArquivoNome(`${siglaDoc}_${compClean}_${cliClean}.pdf`);
  };

  // Confirmar Conclusão com Guia e Notificações Automáticas
  const handleConfirmarConclusao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concluirModalTarefa) return;

    const cliente = clientes.find(c => c.id === concluirModalTarefa.cliente_id);
    const ehPagamento = concluirEhPagamento === 'sim';

    if (ehPagamento && !concluirDataVencimento) {
      alert('Favor informar a data de vencimento da guia.');
      return;
    }

    const valorNum = concluirValor ? parseFloat(concluirValor.replace(',', '.')) : undefined;

    concluirTarefa(concluirModalTarefa.id, {
      ehPagamento,
      arquivoNome: ehPagamento ? (concluirArquivoNome || 'Guia_Pagamento.pdf') : undefined,
      dataVencimento: ehPagamento ? concluirDataVencimento : undefined,
      valor: valorNum
    });

    const envioWhats = ehPagamento && cliente?.receber_guias_whatsapp !== false;
    const msgFeedback = ehPagamento
      ? `🎉 Tarefa concluída! Guia enviada por E-mail ${envioWhats ? 'e WhatsApp' : ''} para ${cliente?.nome || concluirModalTarefa.cliente_nome}.`
      : `✅ Tarefa concluída com sucesso! (Modo Clean: movida para concluídas)`;

    setConcluirModalTarefa(null);
    setFeedbackToast(msgFeedback);
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  // Confirmar Prorrogação
  const handleConfirmarProrrogacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prorrogarModalTarefa || !novoPrazo || !motivoProrrogacao.trim()) return;

    prorrogarTarefa(prorrogarModalTarefa.id, novoPrazo, motivoProrrogacao.trim());
    setProrrogarModalTarefa(null);
    setNovoPrazo('');
    setMotivoProrrogacao('');
    setFeedbackToast('📌 Prazo prorrogado e auditoria registrada com sucesso!');
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Salvar Comentário (Balãozinho Verde)
  const handleSalvarComentario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentarioModalTarefa || !novoComentarioTexto.trim()) return;

    adicionarComentarioTarefa(comentarioModalTarefa.id, novoComentarioAutor, novoComentarioTexto.trim());
    
    // Atualiza a referência do modal aberto para refletir o novo comentário na hora
    const tarefaAtualizada = tarefas.find(t => t.id === comentarioModalTarefa.id);
    if (tarefaAtualizada) {
      setComentarioModalTarefa({
        ...tarefaAtualizada,
        comentarios_lista: [
          {
            id: `temp-${Date.now()}`,
            autor: novoComentarioAutor,
            data: 'Agora',
            texto: novoComentarioTexto.trim()
          },
          ...(tarefaAtualizada.comentarios_lista || [])
        ]
      });
    }

    setNovoComentarioTexto('');
    setFeedbackToast('💬 Comentário adicionado à tarefa!');
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-lg border border-emerald-700 flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-brand-green" />
            <p className="text-xs font-semibold">{feedbackToast}</p>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. SELETOR & CONTROLE DE COMPETÊNCIA */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Navegador de Mês/Competência */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => handleMudarMes('anterior')}
              title="Competência Anterior"
              className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-4 py-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-blue" />
              <span className="font-extrabold text-sm text-slate-900">
                {competenciaSelecionada === 'todas'
                  ? 'Todas as Competências'
                  : `Competência ${competenciaSelecionada}`}
              </span>
            </div>

            <button
              onClick={() => handleMudarMes('proximo')}
              title="Próxima Competência"
              className="p-2 rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dropdown de Competências Existentes */}
          <select
            value={competenciaSelecionada}
            onChange={e => setCompetenciaSelecionada(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-800 font-bold focus:ring-2 focus:ring-brand-blue/20"
          >
            <option value="todas">Ver Todas as Competências ({tarefas.length})</option>
            {competenciasDisponiveis.map(c => {
              const qtd = tarefas.filter(t => t.competencia === c).length;
              return (
                <option key={c} value={c}>
                  {c} ({qtd} obrigações)
                </option>
              );
            })}
          </select>
        </div>

        {/* Barra de Progresso e Replicação */}
        <div className="flex items-center gap-4 flex-wrap">
          {competenciaSelecionada !== 'todas' && (
            <div className="min-w-[190px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium">Progresso da Competência:</span>
                <span className="font-bold text-slate-900">{taxaConclusaoComp}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-green h-full rounded-full transition-all duration-500"
                  style={{ width: `${taxaConclusaoComp}%` }}
                />
              </div>
            </div>
          )}

          {competenciaSelecionada !== 'todas' && (
            <button
              onClick={handleReplicarProximaCompetencia}
              title="Gera automaticamente todas as obrigações para o próximo mês"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all shadow-sm"
            >
              <Copy className="w-3.5 h-3.5 text-brand-blue" />
              <span>Gerar Próxima Competência</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {competenciaSelecionada === 'todas' ? 'Total Geral' : `Total na Comp. ${competenciaSelecionada}`}
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalNaComp}</p>
            <p className="text-[11px] text-slate-500 mt-1">Obrigações cadastradas</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Na Fila (A Fazer)</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{pendentesNaComp}</p>
            <p className="text-[11px] text-slate-500 mt-1">Aguardando entrega</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-500" />
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Risco de Atraso / Multa</p>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{atrasadasNaComp}</p>
            <p className="text-[11px] text-slate-500 mt-1">Prazo legal ultrapassado</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Concluídas</p>
            <p className="text-2xl font-bold text-brand-green mt-1">{concluidasNaComp}</p>
            <p className="text-[11px] text-emerald-600 mt-1">{taxaConclusaoComp}% de conformidade</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. BARRA DE FILTROS & VISUALIZAÇÃO KANBAN / LISTA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por obrigação, cliente ou responsável..."
            value={filtroBusca}
            onChange={e => setFiltroBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>

        {/* Filtros Dropdowns, Filtro Empresa e Modo Clean */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* NOVO: Filtro por Empresa */}
          <select
            value={filtroEmpresa}
            onChange={e => setFiltroEmpresa(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 font-semibold max-w-[200px]"
            title="Filtrar por Empresa"
          >
            <option value="todos">🏢 Todas as Empresas ({clientes.length})</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          {/* Filtro Status */}
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 font-medium"
          >
            <option value="todos">Status: Ativas</option>
            <option value="Pendente">Pendentes</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Atrasada">Atrasadas</option>
            <option value="Concluída">Apenas Concluídas</option>
          </select>

          {/* Filtro Departamento */}
          <select
            value={filtroDepto}
            onChange={e => setFiltroDepto(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-700 font-medium"
          >
            <option value="todos">Todos os Setores</option>
            <option value="Fiscal">Fiscal</option>
            <option value="Contábil">Contábil</option>
            <option value="Pessoal">Pessoal / RH</option>
            <option value="Financeiro">Financeiro / BPO</option>
            <option value="Outros">Outros</option>
          </select>

          {/* NOVO: Toggle Clean UI - Exibir/Ocultar Concluídas */}
          <button
            onClick={() => setExibirConcluidas(!exibirConcluidas)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              exibirConcluidas
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
            title={exibirConcluidas ? 'Ocultar tarefas já finalizadas' : 'Exibir tarefas concluídas'}
          >
            {exibirConcluidas ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Concluídas ({totalConcluidasNaCompetencia})</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Ocultar Concluídas ({totalConcluidasNaCompetencia})</span>
              </>
            )}
          </button>

          {/* NOVO: Botão Alternador Modo Lista vs. Modo Kanban */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 shadow-inner">
            <button
              onClick={() => setViewMode('lista')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'lista'
                  ? 'bg-white text-brand-blue shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Visualização em Lista / Tabela"
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-brand-blue shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Visualização em Quadro Kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* AVISO DO MODO CLEAN: Se houver concluídas ocultas e exibirConcluidas estiver falso */}
      {!exibirConcluidas && totalConcluidasNaCompetencia > 0 && filtroStatus === 'todos' && (
        <div className="bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-green" />
            <span>
              <strong>Visão Clean ativa:</strong> {totalConcluidasNaCompetencia} tarefas concluídas foram ocultadas da tela para facilitar seu foco.
            </span>
          </div>
          <button
            onClick={() => setExibirConcluidas(true)}
            className="text-brand-blue font-semibold hover:underline flex items-center gap-1"
          >
            <span>Exibir todas</span>
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. CONTEÚDO: MODO LISTA OU MODO KANBAN */}
      {viewMode === 'lista' ? (
        /* VISÃO LISTA / TABELA */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Obrigação & Cliente</th>
                  <th className="px-4 py-3.5">Competência</th>
                  <th className="px-4 py-3.5">Setor</th>
                  <th className="px-4 py-3.5">Responsável</th>
                  <th className="px-4 py-3.5">Prazo Meta</th>
                  <th className="px-4 py-3.5">Prazo Legal</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Ações Inteligentes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tarefasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                      Nenhuma tarefa encontrada com os filtros selecionados.
                      {!exibirConcluidas && totalConcluidasNaCompetencia > 0 && (
                        <p className="mt-1 text-xs text-brand-blue cursor-pointer underline" onClick={() => setExibirConcluidas(true)}>
                          Clique aqui para exibir as {totalConcluidasNaCompetencia} tarefas concluídas desta competência.
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  tarefasFiltradas.map(tarefa => {
                    const isAtrasada = tarefa.status === 'Atrasada';
                    const numComentarios = tarefa.comentarios_lista?.length || 0;
                    return (
                      <tr
                        key={tarefa.id}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          isAtrasada ? 'bg-red-50/30' : ''
                        }`}
                      >
                        {/* Tarefa & Cliente */}
                        <td className="px-5 py-4">
                          <div>
                            <span className="font-semibold text-slate-900 hover:text-brand-blue cursor-pointer">
                              {tarefa.titulo}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-slate-500 text-[11px]">
                              <span className="flex items-center gap-1 font-medium text-slate-700">
                                <Building className="w-3 h-3 text-slate-400" />
                                {tarefa.cliente_nome}
                              </span>
                              {tarefa.prorrogacoes_count ? (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                  {tarefa.prorrogacoes_count}x prorrogada
                                </span>
                              ) : null}
                              {tarefa.eh_pagamento && tarefa.guia_pagamento && (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                  <FileText className="w-2.5 h-2.5" />
                                  Guia Anexa
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Competência */}
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-blue border border-blue-200">
                            {tarefa.competencia || '10/2026'}
                          </span>
                        </td>

                        {/* Setor */}
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              tarefa.categoria === 'Fiscal'
                                ? 'bg-purple-100 text-purple-700'
                                : tarefa.categoria === 'Contábil'
                                ? 'bg-blue-100 text-blue-700'
                                : tarefa.categoria === 'Pessoal' || tarefa.categoria === 'Pessoal/RH'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {tarefa.categoria}
                          </span>
                        </td>

                        {/* Responsável */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-700">
                              {tarefa.responsavel.charAt(0)}
                            </div>
                            <span>{tarefa.responsavel}</span>
                          </div>
                        </td>

                        {/* Prazo Meta */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 font-semibold text-slate-800">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{tarefa.data_prazo_meta}</span>
                          </div>
                        </td>

                        {/* Prazo Legal */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <AlertCircle
                              className={`w-3.5 h-3.5 ${
                                isAtrasada ? 'text-red-500' : 'text-slate-400'
                              }`}
                            />
                            <span
                              className={`font-semibold ${
                                isAtrasada ? 'text-red-600' : 'text-slate-600'
                              }`}
                            >
                              {tarefa.data_prazo_legal}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              tarefa.status === 'Concluída'
                                ? 'bg-emerald-50 text-brand-green border border-emerald-200'
                                : tarefa.status === 'Atrasada'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : tarefa.status === 'Em Andamento'
                                ? 'bg-blue-50 text-brand-blue border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {tarefa.status}
                          </span>
                        </td>

                        {/* Ações Inteligentes */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* NOVO: Botãozinho com Balão Verde de Comentários */}
                            <button
                              onClick={() => {
                                setComentarioModalTarefa(tarefa);
                                setNovoComentarioTexto('');
                              }}
                              title="Comentários e Observações da Tarefa"
                              className={`p-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                                numComentarios > 0
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              {numComentarios > 0 && (
                                <span className="text-[10px]">{numComentarios}</span>
                              )}
                            </button>

                            {/* Prorrogar Prazo */}
                            {tarefa.status !== 'Concluída' && (
                              <button
                                onClick={() => {
                                  setProrrogarModalTarefa(tarefa);
                                  setNovoPrazo(tarefa.data_prazo_meta);
                                }}
                                title="Prorrogar Prazo Meta com Justificativa"
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* NOVO: Concluir com Guia de Pagamento & Disparo Automático */}
                            {tarefa.status !== 'Concluída' ? (
                              <button
                                onClick={() => handleIniciarConclusao(tarefa)}
                                title="Concluir Tarefa e Enviar Guia"
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-blue border border-blue-200 transition-all font-semibold flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            ) : null}

                            {/* Excluir */}
                            <button
                              onClick={() => deleteTarefa(tarefa.id)}
                              title="Excluir Tarefa"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VISÃO MODO KANBAN */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['Pendente', 'Em Andamento', 'Atrasada', 'Concluída'] as StatusTarefa[]).map(statusCol => {
            const colTarefas = tarefasFiltradas.filter(t => t.status === statusCol);
            
            // Estilização do cabeçalho da coluna
            const corHeader =
              statusCol === 'Pendente'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : statusCol === 'Em Andamento'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : statusCol === 'Atrasada'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800';

            return (
              <div
                key={statusCol}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const tarefaId = e.dataTransfer.getData('text/plain');
                  if (tarefaId) {
                    if (statusCol === 'Concluída') {
                      const t = tarefas.find(x => x.id === tarefaId);
                      if (t) handleIniciarConclusao(t);
                    } else {
                      moverTarefaStatus(tarefaId, statusCol);
                    }
                  }
                }}
                className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 flex flex-col min-h-[500px] transition-all hover:border-brand-blue/40"
              >
                {/* Header da Coluna */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl border mb-3 ${corHeader}`}>
                  <span className="font-bold text-xs uppercase tracking-wider">{statusCol}</span>
                  <span className="bg-white text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
                    {colTarefas.length}
                  </span>
                </div>

                {/* Lista de Cards da Coluna */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTarefas.length === 0 ? (
                    <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                      {statusCol === 'Concluída' && !exibirConcluidas
                        ? 'Concluídas ocultas (Modo Clean)'
                        : 'Nenhuma tarefa'}
                    </div>
                  ) : (
                    colTarefas.map(tarefa => {
                      const numComentarios = tarefa.comentarios_lista?.length || 0;
                      return (
                        <div
                          key={tarefa.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', tarefa.id);
                          }}
                          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between gap-3 cursor-grab active:cursor-grabbing hover:border-brand-blue/60"
                        >
                          <div>
                            {/* Badges de Topo */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  tarefa.categoria === 'Fiscal'
                                    ? 'bg-purple-100 text-purple-700'
                                    : tarefa.categoria === 'Contábil'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {tarefa.categoria}
                              </span>
                              <span className="text-[10px] text-brand-blue font-bold bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                {tarefa.competencia}
                              </span>
                            </div>

                            {/* Título & Empresa */}
                            <h4 className="font-bold text-xs text-slate-900 leading-snug">
                              {tarefa.titulo}
                            </h4>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mt-1.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{tarefa.cliente_nome}</span>
                            </div>

                            {/* Prazos */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <div className="text-slate-600">
                                <span className="text-slate-400 text-[10px] block">Prazo Meta</span>
                                <span className="font-semibold">{tarefa.data_prazo_meta}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-400 text-[10px] block">Prazo Legal</span>
                                <span className={`font-semibold ${tarefa.status === 'Atrasada' ? 'text-red-600' : 'text-slate-700'}`}>
                                  {tarefa.data_prazo_legal}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Rodapé do Card com Ações */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-[10px] font-medium text-slate-500 truncate max-w-[90px]">
                              {tarefa.responsavel}
                            </span>

                            <div className="flex items-center gap-1">
                              {/* Botão de Comentários (Balão Verde) */}
                              <button
                                onClick={() => {
                                  setComentarioModalTarefa(tarefa);
                                  setNovoComentarioTexto('');
                                }}
                                title="Comentários / Observações"
                                className={`p-1.5 rounded-lg border flex items-center gap-1 transition-all ${
                                  numComentarios > 0
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                {numComentarios > 0 && (
                                  <span className="text-[9px]">{numComentarios}</span>
                                )}
                              </button>

                              {/* Mover status ou Concluir */}
                              {tarefa.status !== 'Concluída' ? (
                                <button
                                  onClick={() => handleIniciarConclusao(tarefa)}
                                  className="p-1.5 rounded-lg bg-blue-50 text-brand-blue hover:bg-blue-100 border border-blue-200 transition-all font-semibold"
                                  title="Concluir Tarefa com Guia"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL INTELIGENTE DE CONCLUSÃO COM GUIA DE PAGAMENTO */}
      {concluirModalTarefa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-brand-blue" />
                <span>Concluir Tarefa & Emissão de Guia</span>
              </div>
              <button
                onClick={() => setConcluirModalTarefa(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmarConclusao} className="p-6 space-y-4 text-xs">
              {/* Identificação da Tarefa */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">{concluirModalTarefa.titulo}</p>
                <div className="flex items-center gap-3 text-slate-500 mt-1">
                  <span>🏢 {concluirModalTarefa.cliente_nome}</span>
                  <span>🗓️ Comp: {concluirModalTarefa.competencia}</span>
                </div>
              </div>

              {/* Pergunta Obrigatória: É algo para pagamento? */}
              <div>
                <label className="block font-bold text-slate-800 text-xs mb-2">
                  Esta tarefa envolve Guia para Pagamento (Tributo, DAS, DARF, Boleto, GPS)?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConcluirEhPagamento('sim')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      concluirEhPagamento === 'sim'
                        ? 'bg-blue-50 border-brand-blue text-brand-blue font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-sm">💰 SIM</span>
                    <span className="text-[10px] font-normal text-slate-500">Gera Guia para o Cliente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConcluirEhPagamento('nao')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      concluirEhPagamento === 'nao'
                        ? 'bg-slate-100 border-slate-400 text-slate-900 font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-sm">📋 NÃO</span>
                    <span className="text-[10px] font-normal text-slate-500">Apenas obrigação interna</span>
                  </button>
                </div>
              </div>

              {/* Se for SIM: Campos da Guia Obrigatória */}
              {concluirEhPagamento === 'sim' && (
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Data de Vencimento da Guia *
                      </label>
                      <input
                        type="date"
                        required
                        value={concluirDataVencimento}
                        onChange={e => setConcluirDataVencimento(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Valor a Pagar (R$)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 1.450,80"
                        value={concluirValor}
                        onChange={e => setConcluirValor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Anexo da Guia */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Documento da Guia para Pagamento (PDF) *
                    </label>
                    <div className="border-2 border-dashed border-emerald-300 bg-white p-3.5 rounded-2xl text-center">
                      <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <p className="font-semibold text-slate-800 text-xs">
                        {concluirArquivoNome || 'Selecionar Guia em PDF'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        O arquivo será anexado e hospedado no Portal do Cliente com segurança.
                      </p>
                    </div>
                  </div>

                  {/* Detalhamento das Automações que serão disparadas */}
                  <div className="pt-2 border-t border-emerald-200/80 space-y-1.5 text-[11px] text-emerald-950">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>E-mail Automático:</strong> Enviado com a guia anexa e texto padrão de cobrança.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-brand-green shrink-0" />
                      <span>
                        <strong>WhatsApp Automático:</strong> Notificação instantânea com vencimento e link direto da guia para o cliente pagar.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConcluirModalTarefa(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-green hover:bg-emerald-600 text-white font-bold shadow-sm transition-all"
                >
                  Confirmar Conclusão & Disparar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL DE COMENTÁRIOS E OBSERVAÇÕES (BALÃO VERDE) */}
      {comentarioModalTarefa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Comentários & Observações</span>
              </div>
              <button
                onClick={() => setComentarioModalTarefa(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Dados da Tarefa */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-slate-900">{comentarioModalTarefa.titulo}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cliente: <strong>{comentarioModalTarefa.cliente_nome}</strong> | Competência: {comentarioModalTarefa.competencia}
                </p>
                {comentarioModalTarefa.observacoes && (
                  <p className="mt-2 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                    <strong>Nota da Tarefa:</strong> {comentarioModalTarefa.observacoes}
                  </p>
                )}
              </div>

              {/* Linha do Tempo de Comentários */}
              <div className="space-y-2.5">
                <span className="font-bold text-slate-700 text-xs block">Histórico de Comentários:</span>
                {!comentarioModalTarefa.comentarios_lista || comentarioModalTarefa.comentarios_lista.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-4">Nenhum comentário registrado ainda. Seja o primeiro a comentar!</p>
                ) : (
                  comentarioModalTarefa.comentarios_lista.map(c => (
                    <div key={c.id} className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-emerald-900 font-bold">
                        <span>{c.autor}</span>
                        <span className="text-slate-400 font-normal">{c.data}</span>
                      </div>
                      <p className="text-slate-800 text-xs leading-relaxed">{c.texto}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Formulário para Adicionar Comentário */}
              <form onSubmit={handleSalvarComentario} className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Novo Comentário:</label>
                  <select
                    value={novoComentarioAutor}
                    onChange={e => setNovoComentarioAutor(e.target.value)}
                    className="text-[11px] border border-slate-200 rounded-lg px-2 py-1 bg-white"
                  >
                    {colaboradores.map(col => (
                      <option key={col.id} value={col.nome}>{col.nome}</option>
                    ))}
                    <option value="Guilherme (Gestor)">Guilherme (Gestor)</option>
                    <option value="Ygor (Gestor)">Ygor (Gestor)</option>
                  </select>
                </div>

                <textarea
                  required
                  rows={3}
                  placeholder="Escreva uma observação ou atualização sobre esta obrigação..."
                  value={novoComentarioTexto}
                  onChange={e => setNovoComentarioTexto(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-green hover:bg-emerald-600 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Adicionar Comentário</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: NOVA TAREFA */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Cadastrar Nova Obrigação Fiscal</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaTarefa} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título da Tarefa / Obrigação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Transmissão PGDAS-D, Conciliação Bancária..."
                  value={novoTitulo}
                  onChange={e => setNovoTitulo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cliente</label>
                  <select
                    value={novoClienteId}
                    onChange={e => setNovoClienteId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Competência (Mês/Ano)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 10/2026"
                    value={novoCompetencia}
                    onChange={e => setNovoCompetencia(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-brand-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prazo Meta (Interno da Equipe)</label>
                  <input
                    type="date"
                    required
                    value={novoPrazoMeta}
                    onChange={e => setNovoPrazoMeta(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-red-600 mb-1">Prazo Legal (Risco de Multa)</label>
                  <input
                    type="date"
                    required
                    value={novoPrazoLegal}
                    onChange={e => setNovoPrazoLegal(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-red-200 bg-red-50/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo</label>
                  <select
                    value={novoTipo}
                    onChange={e => setNovoTipo(e.target.value as 'Recorrente' | 'Avulsa')}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Recorrente">Recorrente</option>
                    <option value="Avulsa">Avulsa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departamento</label>
                  <select
                    value={novoDepto}
                    onChange={e => setNovoDepto(e.target.value as Departamento)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Fiscal">Fiscal</option>
                    <option value="Contábil">Contábil</option>
                    <option value="Pessoal">Pessoal / RH</option>
                    <option value="Financeiro">Financeiro / BPO</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={novoPrioridade}
                    onChange={e => setNovoPrioridade(e.target.value as Prioridade)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsável</label>
                  <select
                    value={novoResponsavel}
                    onChange={e => setNovoResponsavel(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {colaboradores.map(col => (
                      <option key={col.id} value={col.nome}>{col.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instruções / Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Orientações específicas para o analista responsável..."
                  value={novoDescricao}
                  onChange={e => setNovoDescricao(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold shadow-sm"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: PRORROGAÇÃO */}
      {prorrogarModalTarefa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <History className="w-4 h-4 text-amber-600" />
                <span>Prorrogar Prazo Meta</span>
              </div>
              <button
                onClick={() => setProrrogarModalTarefa(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmarProrrogacao} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-800">{prorrogarModalTarefa.titulo}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{prorrogarModalTarefa.cliente_nome}</p>
                <div className="mt-2 text-[10px] text-red-600 font-semibold">
                  ⚠️ Prazo Legal Máximo: {prorrogarModalTarefa.data_prazo_legal} (Comp. {prorrogarModalTarefa.competencia})
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Novo Prazo Meta Desejado</label>
                <input
                  type="date"
                  required
                  value={novoPrazo}
                  onChange={e => setNovoPrazo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Justificativa Obrigatória (Auditoria fin.up)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Aguardando cliente enviar extratos bancários..."
                  value={motivoProrrogacao}
                  onChange={e => setMotivoProrrogacao(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProrrogarModalTarefa(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
                >
                  Confirmar Prorrogação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
