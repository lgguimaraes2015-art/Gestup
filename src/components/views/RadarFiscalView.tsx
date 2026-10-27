'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  EmpresaRadarFiscal,
  FiltrosRadarFiscal,
  ModeloMensagemCaptação
} from '@/types';
import {
  Search,
  Target,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  Send,
  TrendingUp,
  Filter,
  ArrowUpRight,
  Sparkles,
  Clock,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  X,
  Layers,
  ChevronRight,
  Calculator,
  Flame,
  Briefcase
} from 'lucide-react';

export function RadarFiscalView() {
  const {
    empresasRadar,
    modelosCaptação,
    importarEmpresaRadarParaCRM,
    importarEmpresasRadarLoteParaCRM,
    consultarCNPJOnline,
    dispararMensagemCaptaçãoWhatsApp,
    whatsAppConfig,
    setActiveTab
  } = useApp();

  // Estados de Filtros
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroUf, setFiltroUf] = useState('SP');
  const [filtroMunicipio, setFiltroMunicipio] = useState('todos');
  const [filtroRegime, setFiltroRegime] = useState<'todos' | 'simples' | 'mei' | 'outros'>('todos');
  const [filtroRisco, setFiltroRisco] = useState<'todos' | 'ade_ativo' | 'pgfn' | 'regular'>('todos');
  const [filtroFaixaDebito, setFiltroFaixaDebito] = useState<'todos' | 'ate_10k' | '10k_50k' | '50k_150k' | 'acima_150k'>('todos');

  // Seleção em lote
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [loteImportando, setLoteImportando] = useState(false);

  // Consulta CNPJ Online
  const [cnpjConsultaInput, setCnpjConsultaInput] = useState('');
  const [consultandoCnpj, setConsultandoCnpj] = useState(false);
  const [consultaCnpjFeedback, setConsultaCnpjFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modal de Abordagem WhatsApp
  const [modalWhatsAppOpen, setModalWhatsAppOpen] = useState(false);
  const [empresaAlvoWhatsApp, setEmpresaAlvoWhatsApp] = useState<EmpresaRadarFiscal | null>(null);
  const [modeloSelecionadoId, setModeloSelecionadoId] = useState<string>('mod-ade-urgente');
  const [mensagemEditavel, setMensagemEditavel] = useState('');
  const [telefoneDestino, setTelefoneDestino] = useState('');
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [statusEnvioFeedback, setStatusEnvioFeedback] = useState<string | null>(null);
  const [copiadoFeedback, setCopiadoFeedback] = useState(false);

  // Modal de Dossiê Fiscal
  const [modalDossieOpen, setModalDossieOpen] = useState(false);
  const [empresaDossie, setEmpresaDossie] = useState<EmpresaRadarFiscal | null>(null);

  // Extrair municípios únicos para o dropdown
  const municipiosDisponiveis = useMemo(() => {
    const setM = new Set<string>();
    empresasRadar.forEach(e => {
      if (e.uf === filtroUf && e.municipio) setM.add(e.municipio);
    });
    return Array.from(setM).sort();
  }, [empresasRadar, filtroUf]);

  // Lista Filtrada
  const empresasFiltradas = useMemo(() => {
    return empresasRadar.filter(emp => {
      // Filtro UF
      if (filtroUf !== 'todos' && emp.uf !== filtroUf) return false;

      // Filtro Município
      if (filtroMunicipio !== 'todos' && emp.municipio !== filtroMunicipio) return false;

      // Filtro Regime
      if (filtroRegime === 'simples' && (!emp.optante_simples || emp.optante_mei)) return false;
      if (filtroRegime === 'mei' && !emp.optante_mei) return false;
      if (filtroRegime === 'outros' && (emp.optante_simples || emp.optante_mei)) return false;

      // Filtro Risco
      if (filtroRisco === 'ade_ativo' && !emp.tem_ade_ativo) return false;
      if (filtroRisco === 'pgfn' && !emp.tem_divida_pgfn) return false;
      if (filtroRisco === 'regular' && (emp.tem_ade_ativo || emp.tem_divida_pgfn)) return false;

      // Filtro Faixa Débito
      const valor = emp.valor_divida_pgfn || 0;
      if (filtroFaixaDebito === 'ate_10k' && valor > 10000) return false;
      if (filtroFaixaDebito === '10k_50k' && (valor < 10000 || valor > 50000)) return false;
      if (filtroFaixaDebito === '50k_150k' && (valor < 50000 || valor > 150000)) return false;
      if (filtroFaixaDebito === 'acima_150k' && valor < 150000) return false;

      // Busca texto
      if (buscaTexto.trim()) {
        const termo = buscaTexto.toLowerCase().trim();
        const textoCompleto = `${emp.razao_social} ${emp.nome_fantasia || ''} ${emp.cnpj} ${emp.socio_principal || ''} ${emp.segmento || ''} ${emp.cnae_principal_descricao || ''}`.toLowerCase();
        if (!textoCompleto.includes(termo)) return false;
      }

      return true;
    });
  }, [empresasRadar, filtroUf, filtroMunicipio, filtroRegime, filtroRisco, filtroFaixaDebito, buscaTexto]);

  // Métricas agregadas
  const metricas = useMemo(() => {
    const total = empresasRadar.length;
    const comAde = empresasRadar.filter(e => e.tem_ade_ativo).length;
    const dividaPgfnTotal = empresasRadar.reduce((acc, e) => acc + (e.valor_divida_pgfn || 0), 0);
    const importadosCRM = empresasRadar.filter(e => e.status_contato === 'Importado_CRM').length;
    const contatados = empresasRadar.filter(e => e.status_contato === 'Contatado_WhatsApp').length;

    return { total, comAde, dividaPgfnTotal, importadosCRM, contatados };
  }, [empresasRadar]);

  // Manipular Consulta de CNPJ ao Vivo
  const handleConsultarCnpjAoVivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnpjConsultaInput.trim()) return;

    setConsultandoCnpj(true);
    setConsultaCnpjFeedback(null);

    const resultado = await consultarCNPJOnline(cnpjConsultaInput);
    setConsultandoCnpj(false);

    if (resultado.success && resultado.empresa) {
      setConsultaCnpjFeedback({
        tipo: 'sucesso',
        texto: `Empresa ${resultado.empresa.razao_social} localizada com sucesso e adicionada ao Radar!`
      });
      setCnpjConsultaInput('');
      // Abrir o dossiê da empresa localizada
      setEmpresaDossie(resultado.empresa);
      setModalDossieOpen(true);
    } else {
      setConsultaCnpjFeedback({
        tipo: 'erro',
        texto: resultado.error || 'Não foi possível localizar o CNPJ informado na Receita Federal.'
      });
    }
  };

  // Preparar mensagem do WhatsApp com variáveis substituídas
  const montarMensagemComVariaveis = (emp: EmpresaRadarFiscal, templateTexto: string): string => {
    const socioNome = emp.socio_principal ? emp.socio_principal.split(' ')[0] : 'Empreendedor(a)';
    const debitoFormatado = (emp.valor_divida_pgfn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const diasAde = emp.prazo_regularizacao_dias ? String(emp.prazo_regularizacao_dias) : '30';

    return templateTexto
      .replace(/{socio}/g, socioNome)
      .replace(/{empresa}/g, emp.nome_fantasia || emp.razao_social)
      .replace(/{cnpj}/g, emp.cnpj)
      .replace(/{cidade}/g, emp.municipio)
      .replace(/{valor_debito}/g, debitoFormatado)
      .replace(/{prazo_dias}/g, diasAde)
      .replace(/{tipo_divida}/g, emp.tipo_divida_pgfn || 'Tributária')
      .replace(/{segmento}/g, emp.segmento || 'empresarial');
  };

  // Abrir Modal de Disparo WhatsApp
  const handleAbrirWhatsAppModal = (emp: EmpresaRadarFiscal) => {
    setEmpresaAlvoWhatsApp(emp);
    const tel = emp.whatsapp || emp.telefone || '';
    setTelefoneDestino(tel.replace(/\D/g, ''));

    // Escolhe template padrão conforme risco
    let modPadraoId = 'mod-ade-urgente';
    if (emp.optante_mei) {
      modPadraoId = 'mod-mei-das';
    } else if (emp.tem_ade_ativo) {
      modPadraoId = 'mod-ade-urgente';
    } else if (emp.tem_divida_pgfn) {
      modPadraoId = 'mod-pgfn-transacao';
    } else {
      modPadraoId = 'mod-preventivo-blindagem';
    }

    setModeloSelecionadoId(modPadraoId);
    const modelo = modelosCaptação.find(m => m.id === modPadraoId) || modelosCaptação[0];
    if (modelo) {
      setMensagemEditavel(montarMensagemComVariaveis(emp, modelo.texto));
    }
    setStatusEnvioFeedback(null);
    setModalWhatsAppOpen(true);
  };

  // Ao trocar template no modal
  const handleTrocarTemplateWhatsApp = (modId: string) => {
    setModeloSelecionadoId(modId);
    if (!empresaAlvoWhatsApp) return;
    const mod = modelosCaptação.find(m => m.id === modId);
    if (mod) {
      setMensagemEditavel(montarMensagemComVariaveis(empresaAlvoWhatsApp, mod.texto));
    }
  };

  // Disparar via API do WhatsApp do GestUp (Evolution API)
  const handleDispararWhatsAppOficial = async () => {
    if (!empresaAlvoWhatsApp || !telefoneDestino) return;

    setEnviandoWhatsApp(true);
    setStatusEnvioFeedback(null);

    const ok = await dispararMensagemCaptaçãoWhatsApp(
      empresaAlvoWhatsApp.id,
      mensagemEditavel,
      telefoneDestino
    );

    setEnviandoWhatsApp(false);
    if (ok) {
      setStatusEnvioFeedback('Mensagem enviada com sucesso pela instância Evolution API!');
      setTimeout(() => {
        setModalWhatsAppOpen(false);
      }, 1500);
    } else {
      setStatusEnvioFeedback('Instância remota offline ou erro de envio. Use o botão alternativo de abrir no WhatsApp!');
    }
  };

  // Copiar mensagem
  const handleCopiarMensagem = () => {
    navigator.clipboard.writeText(mensagemEditavel);
    setCopiadoFeedback(true);
    setTimeout(() => setCopiadoFeedback(false), 2000);
  };

  // Gerar link Direto wa.me
  const gerarLinkWaMe = () => {
    let clean = (telefoneDestino || '').replace(/\D/g, '');
    if (clean.length === 10 || clean.length === 11) clean = `55${clean}`;
    const textoCodificado = encodeURIComponent(mensagemEditavel);
    return `https://wa.me/${clean}?text=${textoCodificado}`;
  };

  // Importar para CRM individual
  const handleImportarParaCRM = async (emp: EmpresaRadarFiscal) => {
    await importarEmpresaRadarParaCRM(emp.id);
  };

  // Importar Selecionadas em Lote
  const handleImportarLote = async () => {
    if (selecionadas.length === 0) return;
    setLoteImportando(true);
    await importarEmpresasRadarLoteParaCRM(selecionadas);
    setLoteImportando(false);
    setSelecionadas([]);
  };

  // Alternar Seleção de Todas
  const handleAlternarTodas = () => {
    if (selecionadas.length === empresasFiltradas.length) {
      setSelecionadas([]);
    } else {
      setSelecionadas(empresasFiltradas.map(e => e.id));
    }
  };

  // Alternar seleção individual
  const handleToggleSelecao = (id: string) => {
    setSelecionadas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER PRINCIPAL */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner">
                <Target className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Radar Fiscal & Captação Ativa</h1>
                  <span className="bg-amber-400/20 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Receita Federal & PGFN
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                  Inteligência tributária para monitoramento e captação ativa: localize empresas no Simples Nacional e MEI com <strong>ADE Ativo (Ato Declaratório de Exclusão)</strong> e débitos na PGFN, simule transação e dispare abordagem via WhatsApp.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('crm-leads')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium border border-white/15 backdrop-blur-sm transition-all"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Ver Funil de Leads CRM
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* BARRA DE CONSULTA CNPJ ONLINE (INTEGRAÇÃO BRASILAPI / MINHA RECEITA) */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <form onSubmit={handleConsultarCnpjAoVivo} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={cnpjConsultaInput}
                  onChange={(e) => setCnpjConsultaInput(e.target.value)}
                  placeholder="Digitar CNPJ para busca oficial ao vivo (ex: 48.912.345/0001-82)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <button
                type="submit"
                disabled={consultandoCnpj || !cnpjConsultaInput.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-900/30 transition whitespace-nowrap"
              >
                {consultandoCnpj ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Consultando Órgãos...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    Consultar e Adicionar ao Radar
                  </>
                )}
              </button>
            </form>

            {consultaCnpjFeedback && (
              <div className={`mt-3 p-3 rounded-xl text-sm flex items-center gap-2 ${
                consultaCnpjFeedback.tipo === 'sucesso'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {consultaCnpjFeedback.tipo === 'sucesso' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{consultaCnpjFeedback.texto}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARDS DE INDICADORES / METRICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total no Radar</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{metricas.total}</span>
            <span className="text-xs text-slate-500">empresas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Base regional monitorada</p>
        </div>

        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border border-red-200 dark:border-red-900/50 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">ADE Ativo (Urgente)</span>
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-700 dark:text-red-400">{metricas.comAde}</span>
            <span className="text-xs text-red-600/80">em risco de exclusão</span>
          </div>
          <p className="text-[11px] text-red-600/80 mt-1">Exclusão do Simples em 2026</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-900/50 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Débitos PGFN</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold text-amber-800 dark:text-amber-300">
              R$ {(metricas.dividaPgfnTotal / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-amber-600">consolidado</span>
          </div>
          <p className="text-[11px] text-amber-600/80 mt-1">Potencial transação tributária</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">CRM & Abordagem</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{metricas.importadosCRM}</span>
            <span className="text-xs text-emerald-600">no funil CRM</span>
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1">{metricas.contatados} abordadas via WhatsApp</p>
        </div>
      </div>

      {/* BARRA DE FILTROS & PESQUISA */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Campo de Busca Texto */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Buscar por razão social, nome fantasia, CNPJ, sócio ou atividade..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro UF */}
          <div className="w-full sm:w-28">
            <select
              value={filtroUf}
              onChange={(e) => {
                setFiltroUf(e.target.value);
                setFiltroMunicipio('todos');
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SP">SP</option>
              <option value="RJ">RJ</option>
              <option value="MG">MG</option>
              <option value="PR">PR</option>
              <option value="todos">Todos UF</option>
            </select>
          </div>

          {/* Filtro Município */}
          <div className="w-full sm:w-44">
            <select
              value={filtroMunicipio}
              onChange={(e) => setFiltroMunicipio(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos Municípios</option>
              {municipiosDisponiveis.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha de Filtros Rápidos (Regime, Risco, Faixa) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Segmentar:
          </span>

          {/* Regime */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setFiltroRegime('todos')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filtroRegime === 'todos' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Regime: Todos
            </button>
            <button
              onClick={() => setFiltroRegime('simples')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filtroRegime === 'simples' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Simples Nacional
            </button>
            <button
              onClick={() => setFiltroRegime('mei')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filtroRegime === 'mei' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              MEI
            </button>
          </div>

          {/* Risco Fiscal */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700/50 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setFiltroRisco('todos')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filtroRisco === 'todos' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Risco: Todos
            </button>
            <button
              onClick={() => setFiltroRisco('ade_ativo')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                filtroRisco === 'ade_ativo' ? 'bg-red-500 text-white shadow-xs' : 'text-red-600 dark:text-red-400'
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              ADE Ativo
            </button>
            <button
              onClick={() => setFiltroRisco('pgfn')}
              className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                filtroRisco === 'pgfn' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              Dívida PGFN
            </button>
          </div>

          {/* Faixa de Débito */}
          <select
            value={filtroFaixaDebito}
            onChange={(e: any) => setFiltroFaixaDebito(e.target.value)}
            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 border-0 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-blue-500"
          >
            <option value="todos">Faixa de Débito: Todas</option>
            <option value="ate_10k">Até R$ 10.000</option>
            <option value="10k_50k">R$ 10.000 a R$ 50.000</option>
            <option value="50k_150k">R$ 50.000 a R$ 150.000</option>
            <option value="acima_150k">Acima de R$ 150.000</option>
          </select>

          {/* Contador de resultados */}
          <div className="ml-auto text-xs text-slate-500">
            Mostrando <strong>{empresasFiltradas.length}</strong> de {empresasRadar.length} empresas
          </div>
        </div>
      </div>

      {/* BARRA DE AÇÕES EM LOTE */}
      {empresasFiltradas.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={selecionadas.length === empresasFiltradas.length && empresasFiltradas.length > 0}
                onChange={handleAlternarTodas}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Selecionar todas as {empresasFiltradas.length} empresas visíveis</span>
            </label>

            {selecionadas.length > 0 && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-semibold">
                {selecionadas.length} selecionadas
              </span>
            )}
          </div>

          {selecionadas.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleImportarLote}
                disabled={loteImportando}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                {loteImportando ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5" />
                )}
                Importar {selecionadas.length} para o Funil de CRM
              </button>
            </div>
          )}
        </div>
      )}

      {/* LISTA / GRID DE EMPRESAS NO RADAR */}
      {empresasFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-400 mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhuma empresa encontrada com os filtros atuais</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Tente flexibilizar os filtros de município, regime ou risco, ou consulte um CNPJ diretamente na barra superior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {empresasFiltradas.map((emp) => {
            const isSelected = selecionadas.includes(emp.id);
            const isImportado = emp.status_contato === 'Importado_CRM';
            const isContatado = emp.status_contato === 'Contatado_WhatsApp';

            return (
              <div
                key={emp.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border transition-all shadow-sm hover:shadow-md relative flex flex-col justify-between ${
                  emp.tem_ade_ativo
                    ? 'border-l-4 border-l-red-500 border-slate-200 dark:border-slate-700'
                    : emp.tem_divida_pgfn
                    ? 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-700'
                    : 'border-slate-200 dark:border-slate-700'
                } ${isSelected ? 'ring-2 ring-blue-500/50 bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
              >
                <div>
                  {/* Top Bar do Card: Checkbox + Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelecao(emp.id)}
                        className="w-4 h-4 mt-1 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            emp.regime === 'MEI'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}>
                            {emp.regime}
                          </span>

                          {emp.tem_ade_ativo && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" />
                              ADE Ativo ({emp.prazo_regularizacao_dias || 30} dias)
                            </span>
                          )}

                          {emp.tem_divida_pgfn && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              PGFN: R$ {(emp.valor_divida_pgfn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                          )}

                          {isImportado && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              ✓ No CRM
                            </span>
                          )}

                          {isContatado && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                              💬 Contatado WhatsApp ({emp.mensagens_enviadas_count}x)
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                          {emp.razao_social}
                        </h4>
                        {emp.nome_fantasia && emp.nome_fantasia !== emp.razao_social && (
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            Fantasia: {emp.nome_fantasia}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes da Empresa */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 my-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono text-slate-700 dark:text-slate-200">{emp.cnpj}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{emp.municipio} / {emp.uf} {emp.bairro ? `(${emp.bairro})` : ''}</span>
                    </div>

                    <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                      <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">Sócio: <strong>{emp.socio_principal || 'Não identificado'}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{emp.whatsapp || emp.telefone || 'Sem telefone'}</span>
                    </div>

                    {emp.segmento && (
                      <div className="col-span-2 flex items-center gap-1.5 text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{emp.segmento} ({emp.cnae_principal_descricao || emp.cnae_principal_codigo})</span>
                      </div>
                    )}
                  </div>

                  {/* Informações Fiscais Específicas (ADE / PGFN) */}
                  {emp.tem_ade_ativo && (
                    <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-700 dark:text-red-300 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          Notificação ADE Receita Federal:
                        </span>
                        <span className="bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded text-[10px]">
                          Prazo: ~{emp.prazo_regularizacao_dias || 30} dias
                        </span>
                      </div>
                      <p className="text-[11px] text-red-600 dark:text-red-400">
                        {emp.motivo_ade || 'Débitos pendentes de apuração no Simples Nacional e Dívida Ativa.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* BOTÕES DE AÇÃO NO CARD */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEmpresaDossie(emp);
                        setModalDossieOpen(true);
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-1"
                    >
                      <Calculator className="w-3.5 h-3.5 text-slate-400" />
                      Dossiê & Simulação
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isImportado ? (
                      <button
                        onClick={() => handleImportarParaCRM(emp)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg transition flex items-center gap-1.5 shadow-xs"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                        Importar CRM
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        No Funil
                      </span>
                    )}

                    <button
                      onClick={() => handleAbrirWhatsAppModal(emp)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Abordar WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL DE ABORDAGEM WHATSAPP ================= */}
      {modalWhatsAppOpen && empresaAlvoWhatsApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Disparar Abordagem Tributária via WhatsApp
                  </h3>
                  <p className="text-xs text-slate-500">
                    Empresa: <strong>{empresaAlvoWhatsApp.razao_social}</strong> (CNPJ: {empresaAlvoWhatsApp.cnpj})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalWhatsAppOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4">
              {/* Telefone Destino */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telefone / WhatsApp de Destino (com DDD):
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={telefoneDestino}
                      onChange={(e) => setTelefoneDestino(e.target.value)}
                      placeholder="Ex: 19992080639"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  {empresaAlvoWhatsApp.socio_principal && (
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      Sócio: {empresaAlvoWhatsApp.socio_principal}
                    </span>
                  )}
                </div>
              </div>

              {/* Seletor de Templates Prontos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Modelo de Abordagem Estratégica:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {modelosCaptação.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleTrocarTemplateWhatsApp(m.id)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition ${
                        modeloSelecionadoId === m.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">{m.titulo}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{m.descricao}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor da Mensagem */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mensagem Personalizada (Você pode editar antes de enviar):
                  </label>
                  <button
                    onClick={handleCopiarMensagem}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {copiadoFeedback ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiadoFeedback ? 'Copiado!' : 'Copiar Texto'}
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={mensagemEditavel}
                  onChange={(e) => setMensagemEditavel(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
                />
              </div>

              {statusEnvioFeedback && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>{statusEnvioFeedback}</span>
                </div>
              )}
            </div>

            {/* Ações do Modal */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <a
                href={gerarLinkWaMe()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl text-xs font-semibold transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir no WhatsApp Web / App
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalWhatsAppOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleDispararWhatsAppOficial}
                  disabled={enviandoWhatsApp || !telefoneDestino}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-900/20 transition"
                >
                  {enviandoWhatsApp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Disparando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Disparar pelo GestUp (Evolution API)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DE DOSSIÊ FISCAL & SIMULAÇÃO ================= */}
      {modalDossieOpen && empresaDossie && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Dossiê Fiscal & Proposta de Regularização
                  </h3>
                  <p className="text-xs text-slate-500">
                    {empresaDossie.razao_social} | CNPJ: {empresaDossie.cnpj}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalDossieOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-5 max-h-[70vh] overflow-y-auto pr-1">
              {/* Resumo de Situação Cadastral e Regime */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block">Regime Tributário</span>
                  <strong className="text-slate-800 dark:text-slate-100 text-sm">{empresaDossie.regime}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Situação Cadastral</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{empresaDossie.situacao_cadastral}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Abertura</span>
                  <strong className="text-slate-800 dark:text-slate-100">{empresaDossie.data_abertura || 'N/D'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Município / UF</span>
                  <strong className="text-slate-800 dark:text-slate-100">{empresaDossie.municipio}/{empresaDossie.uf}</strong>
                </div>
              </div>

              {/* Seção ADE (Ato Declaratório Executivo) */}
              {empresaDossie.tem_ade_ativo ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    Notificação de Exclusão do Simples Nacional (ADE Ativo)
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                    A Receita Federal notificou esta empresa por pendências não parceladas. O prazo legal estimado para regularização antes do desenquadramento automático para o Lucro Presumido é de <strong>{empresaDossie.prazo_regularizacao_dias || 30} dias</strong>.
                  </p>
                  <div className="text-xs text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/50 p-2.5 rounded-lg">
                    <strong>Impacto financeiro:</strong> Caso ocorra o desenquadramento para o Lucro Presumido, a carga tributária da empresa pode aumentar de ~6% para mais de 16,33% sobre o faturamento bruto.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Nenhum ADE de exclusão emitido até o momento. Situação no Simples preservada.</span>
                </div>
              )}

              {/* Simulação de Transação Tributária PGFN */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    Simulação de Redução por Transação PGFN (Edital Regularize)
                  </h4>
                  <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-semibold">
                    Até 70% OFF
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-400 block">Dívida PGFN Bruta</span>
                    <strong className="text-base font-bold text-red-300">
                      R$ {(empresaDossie.valor_divida_pgfn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{empresaDossie.tipo_divida_pgfn || 'Tributária'}</span>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-400 block">Desconto Estimado (Juros/Multas)</span>
                    <strong className="text-base font-bold text-emerald-400">
                      - R$ {((empresaDossie.valor_divida_pgfn || 0) * 0.55).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                    <span className="text-[10px] text-emerald-400/80 block mt-0.5">Média de 55% de abatimento</span>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                    <span className="text-[11px] text-slate-400 block">Saldo Negociado em até 145x</span>
                    <strong className="text-base font-bold text-blue-300">
                      R$ {((empresaDossie.valor_divida_pgfn || 0) * 0.45).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                    <span className="text-[10px] text-blue-300/80 block mt-0.5">
                      Parcelas a partir de R$ {Math.max(100, Math.round(((empresaDossie.valor_divida_pgfn || 0) * 0.45) / 60)).toLocaleString('pt-BR')}/mês
                    </span>
                  </div>
                </div>
              </div>

              {/* Quadro Societário (QSA) */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Quadro de Sócios e Administradores (QSA Oficial)
                </h5>
                <div className="space-y-1.5">
                  {empresaDossie.socios && empresaDossie.socios.length > 0 ? (
                    empresaDossie.socios.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs">
                        <div>
                          <strong className="text-slate-800 dark:text-slate-200">{s.nome}</strong>
                          <span className="text-slate-400 block text-[11px]">{s.qualificacao}</span>
                        </div>
                        {s.nome === empresaDossie.socio_principal && (
                          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Contato Decisor
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs text-slate-500">
                      Sócio principal: {empresaDossie.socio_principal || 'Não declarado'}
                    </div>
                  )}
                </div>
              </div>

              {/* Sugestão de Honorários para a fin.up */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Oportunidade de Honorário de Regularização:
                  </span>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                    Honorário sugerido pelo serviço de transação/parcelamento + manutenção mensal de contabilidade.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-amber-800 dark:text-amber-300">
                    R$ {(empresaDossie.honorario_regularizacao_estimado || 2500).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-amber-600 block">
                    + R$ {(empresaDossie.honorario_mensal_sugerido || 1500).toLocaleString('pt-BR')}/mês
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setModalDossieOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Fechar Dossiê
              </button>

              <button
                type="button"
                onClick={() => {
                  setModalDossieOpen(false);
                  handleAbrirWhatsAppModal(empresaDossie);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Iniciar Abordagem no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
