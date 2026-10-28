'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  EmpresaRadarFiscal,
  FiltrosRadarFiscal,
  ModeloMensagemCaptação,
  MensagemAgendadaWhatsApp
} from '@/types';
import { classificarRegimeEmpresa } from '@/lib/mockRadarFiscal';
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
  ArrowRight,
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
  Briefcase,
  Play,
  RotateCcw,
  Calendar,
  Tag,
  Eye,
  Edit3
} from 'lucide-react';

export function RadarFiscalView() {
  const {
    empresasRadar,
    modelosCaptação,
    importarEmpresaRadarParaCRM,
    importarEmpresasRadarLoteParaCRM,
    consultarCNPJOnline,
    dispararMensagemCaptaçãoWhatsApp,
    capturarNovasEmpresasPublicas,
    adicionarEmpresaAoRadar,
    whatsAppConfig,
    setActiveTab
  } = useApp();

  // ================= ESTADOS DO MOTOR DE CAPTAÇÃO EXTERNA =================
  const [buscaUf, setBuscaUf] = useState('SP');
  const [buscaMunicipio, setBuscaMunicipio] = useState('Campinas');
  const [buscaRegime, setBuscaRegime] = useState<'todos' | 'simples' | 'mei' | 'normal'>('simples');
  const [buscaDebito, setBuscaDebito] = useState<'todos' | 'com_debitos' | 'sem_debitos'>('com_debitos');
  const [buscaQuantidade, setBuscaQuantidade] = useState<number>(6);
  const [etapaVarreduraTexto, setEtapaVarreduraTexto] = useState<string>('');

  // Filtros locais para navegação na base já capturada
  const [filtroTextoLocal, setFiltroTextoLocal] = useState('');
  const [filtroRegimeLocal, setFiltroRegimeLocal] = useState<'todos' | 'simples' | 'mei' | 'normal'>('todos');
  const [filtroDebitoLocal, setFiltroDebitoLocal] = useState<'todos' | 'com_debitos' | 'sem_debitos'>('todos');

  const [executandoBusca, setExecutandoBusca] = useState(false);
  const [feedbackBusca, setFeedbackBusca] = useState<string | null>(null);

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
  const [tipoEnvioWhatsApp, setTipoEnvioWhatsApp] = useState<'imediato' | 'agendado'>('imediato');
  const [dataAgendada, setDataAgendada] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [horaAgendada, setHoraAgendada] = useState<string>('09:00');
  const [abaVisualizacaoWhatsApp, setAbaVisualizacaoWhatsApp] = useState<'editor' | 'preview'>('editor');

  // Modal de Dossiê Fiscal
  const [modalDossieOpen, setModalDossieOpen] = useState(false);
  const [empresaDossie, setEmpresaDossie] = useState<EmpresaRadarFiscal | null>(null);

  // Lista de municípios disponíveis na base
  const municipiosDisponiveis = useMemo(() => {
    const setM = new Set<string>();
    empresasRadar.forEach(e => {
      if (e.uf === buscaUf && e.municipio) setM.add(e.municipio);
    });
    return Array.from(setM).sort();
  }, [empresasRadar, buscaUf]);

  // Função para minerar e buscar novas empresas nas consultas públicas da Receita Federal e PGFN
  const handleExecutarBusca = async () => {
    setExecutandoBusca(true);
    setFeedbackBusca(null);

    const cidadeAlvo = (buscaMunicipio && buscaMunicipio !== 'todos' && buscaMunicipio.trim() !== '')
      ? buscaMunicipio.trim()
      : 'Campinas';
    const ufAlvo = (buscaUf && buscaUf !== 'todos') ? buscaUf : 'SP';

    setEtapaVarreduraTexto(`1/4: Conectando aos portais de Dados Abertos da Receita Federal e PGFN...`);
    await new Promise(r => setTimeout(r, 450));

    setEtapaVarreduraTexto(`2/4: Minerando empresas ativas em ${cidadeAlvo}/${ufAlvo} sob o regime ${buscaRegime.toUpperCase()}...`);
    await new Promise(r => setTimeout(r, 500));

    setEtapaVarreduraTexto(`3/4: Cruzando registros da Dívida Ativa da União e Notificações de ADE...`);
    await new Promise(r => setTimeout(r, 450));

    setEtapaVarreduraTexto(`4/4: Extraindo sócios administradores (QSA) e telefones de contato...`);
    await new Promise(r => setTimeout(r, 400));

    const resultado = await capturarNovasEmpresasPublicas({
      uf: ufAlvo,
      municipio: cidadeAlvo,
      regime: buscaRegime,
      possuiDebitos: buscaDebito,
      quantidade: buscaQuantidade
    });

    setExecutandoBusca(false);

    if (resultado.success) {
      setFeedbackBusca(
        `🎉 Sucesso! Foram localizadas e adicionadas +${resultado.totalCapturadas} novas empresas de ${cidadeAlvo}/${ufAlvo} ao seu Radar Fiscal!`
      );
    } else {
      setFeedbackBusca(`Aviso: ${resultado.error || 'Não foi possível capturar novas empresas no momento.'}`);
    }
  };

  // Limpar filtros locais de navegação da base
  const handleLimparFiltrosLocais = () => {
    setFiltroTextoLocal('');
    setFiltroRegimeLocal('todos');
    setFiltroDebitoLocal('todos');
  };

  // Lista Filtrada da base do Radar para visualização do usuário
  const empresasFiltradas = useMemo(() => {
    return empresasRadar.filter(emp => {
      // 1. Filtro Regime Local
      const regimeCalculado = classificarRegimeEmpresa(emp);
      if (filtroRegimeLocal === 'simples' && regimeCalculado !== 'Simples') return false;
      if (filtroRegimeLocal === 'mei' && regimeCalculado !== 'MEI') return false;
      if (filtroRegimeLocal === 'normal' && regimeCalculado !== 'Regime Normal') return false;

      // 2. Filtro Débitos Local
      const possuiDebitos = Boolean(
        emp.tem_ade_ativo || 
        (emp.tem_divida_pgfn && emp.valor_divida_pgfn > 0) || 
        (emp.valor_divida_estadual && emp.valor_divida_estadual > 0)
      );

      if (filtroDebitoLocal === 'com_debitos' && !possuiDebitos) return false;
      if (filtroDebitoLocal === 'sem_debitos' && possuiDebitos) return false;

      // 3. Filtro Texto Local
      if (filtroTextoLocal.trim()) {
        const termo = filtroTextoLocal.toLowerCase().trim();
        const textoCompleto = `${emp.razao_social} ${emp.nome_fantasia || ''} ${emp.cnpj} ${emp.municipio} ${emp.uf} ${emp.socio_principal || ''}`.toLowerCase();
        if (!textoCompleto.includes(termo)) return false;
      }

      return true;
    });
  }, [empresasRadar, filtroRegimeLocal, filtroDebitoLocal, filtroTextoLocal]);

  // Métricas agregadas da base monitorada
  const metricas = useMemo(() => {
    const total = empresasRadar.length;
    const comAde = empresasRadar.filter(e => e.tem_ade_ativo).length;
    const dividaPgfnTotal = empresasRadar.reduce((acc, e) => acc + (e.valor_divida_pgfn || 0), 0);
    const importadosCRM = empresasRadar.filter(e => e.status_contato === 'Importado_CRM').length;
    const contatados = empresasRadar.filter(e => e.status_contato === 'Contatado_WhatsApp').length;

    // Métricas por regime
    const totalSimples = empresasRadar.filter(e => classificarRegimeEmpresa(e) === 'Simples').length;
    const totalMei = empresasRadar.filter(e => classificarRegimeEmpresa(e) === 'MEI').length;
    const totalNormal = empresasRadar.filter(e => classificarRegimeEmpresa(e) === 'Regime Normal').length;

    // Métricas por débito
    const totalComDebito = empresasRadar.filter(e => e.tem_ade_ativo || (e.tem_divida_pgfn && e.valor_divida_pgfn > 0)).length;
    const totalSemDebito = total - totalComDebito;

    return {
      total,
      comAde,
      dividaPgfnTotal,
      importadosCRM,
      contatados,
      totalSimples,
      totalMei,
      totalNormal,
      totalComDebito,
      totalSemDebito
    };
  }, [empresasRadar]);

  // Consulta de CNPJ ao Vivo na Receita Federal
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
        texto: `Empresa ${resultado.empresa.razao_social} localizada na Receita Federal e inserida no Radar!`
      });
      setCnpjConsultaInput('');
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
    if (!templateTexto) return '';
    const socioNome = emp.socio_principal ? emp.socio_principal.split(' ')[0] : 'Empreendedor(a)';
    const debitoFormatado = (emp.valor_divida_pgfn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const diasAde = emp.prazo_regularizacao_dias ? String(emp.prazo_regularizacao_dias) : '30';
    const regimeClassificado = classificarRegimeEmpresa(emp);

    return templateTexto
      .replace(/{socio}/g, socioNome)
      .replace(/{empresa}/g, emp.nome_fantasia || emp.razao_social)
      .replace(/{cnpj}/g, emp.cnpj)
      .replace(/{cidade}/g, emp.municipio)
      .replace(/{regime}/g, regimeClassificado)
      .replace(/{valor_debito}/g, `R$ ${debitoFormatado}`)
      .replace(/{prazo_dias}/g, diasAde)
      .replace(/{tipo_divida}/g, emp.tipo_divida_pgfn || 'Tributária')
      .replace(/{segmento}/g, emp.segmento || emp.cnae_principal_descricao || 'empresarial')
      .replace(/{cnae}/g, emp.cnae_principal_descricao || emp.segmento || 'empresarial');
  };

  // Sugerir texto padrão inteligentemente com base no diagnóstico da empresa
  const handleSugerirTextoPadrao = () => {
    if (!empresaAlvoWhatsApp) return;
    const regimeClassificado = classificarRegimeEmpresa(empresaAlvoWhatsApp);
    let modPadraoId = 'mod-ade-urgente';

    if (regimeClassificado === 'MEI') {
      modPadraoId = 'mod-mei-das';
    } else if (empresaAlvoWhatsApp.tem_ade_ativo) {
      modPadraoId = 'mod-ade-urgente';
    } else if (empresaAlvoWhatsApp.tem_divida_pgfn) {
      modPadraoId = 'mod-pgfn-transacao';
    } else {
      modPadraoId = 'mod-preventivo-blindagem';
    }

    setModeloSelecionadoId(modPadraoId);
    const modelo = modelosCaptação.find(m => m.id === modPadraoId) || modelosCaptação[0];
    if (modelo) {
      setMensagemEditavel(modelo.texto);
    }
  };

  // Inserir TAG personalizada no texto da mensagem
  const handleInserirTag = (tag: string) => {
    setMensagemEditavel(prev => {
      const espaco = prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
      return `${prev}${espaco}${tag}`;
    });
  };

  // Abrir Modal de Disparo WhatsApp
  const handleAbrirWhatsAppModal = (emp: EmpresaRadarFiscal) => {
    setEmpresaAlvoWhatsApp(emp);
    const tel = emp.whatsapp || emp.telefone || '';
    setTelefoneDestino(tel.replace(/\D/g, ''));
    setTipoEnvioWhatsApp('imediato');
    setAbaVisualizacaoWhatsApp('editor');

    // Escolhe template padrão conforme regime e risco
    const regimeClassificado = classificarRegimeEmpresa(emp);
    let modPadraoId = 'mod-ade-urgente';

    if (regimeClassificado === 'MEI') {
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
      setMensagemEditavel(modelo.texto);
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
      setMensagemEditavel(mod.texto);
    }
  };

  // Executar Envio Imediato ou Programado & Enviar ao CRM
  const handleExecutarAcaoWhatsApp = async () => {
    if (!empresaAlvoWhatsApp || !telefoneDestino) return;

    setEnviandoWhatsApp(true);
    setStatusEnvioFeedback(null);

    const mensagemFinal = montarMensagemComVariaveis(empresaAlvoWhatsApp, mensagemEditavel);
    const isAgendado = tipoEnvioWhatsApp === 'agendado';
    const dataHoraProgramada = isAgendado
      ? `${dataAgendada} às ${horaAgendada}`
      : new Date().toLocaleString('pt-BR');

    const agendamento: MensagemAgendadaWhatsApp = {
      id: `msg-${Date.now()}`,
      data_hora_agendada: dataHoraProgramada,
      telefone: telefoneDestino,
      mensagem: mensagemFinal,
      status: isAgendado ? 'Agendada' : 'Enviada',
      created_at: new Date().toLocaleString('pt-BR')
    };

    if (!isAgendado) {
      // Disparo imediato se configurado
      await dispararMensagemCaptaçãoWhatsApp(
        empresaAlvoWhatsApp.id,
        mensagemFinal,
        telefoneDestino
      );
    }

    // Enviar diretamente para o CRM no estágio "Contato Realizado" com dados fiscais completos
    await importarEmpresaRadarParaCRM(empresaAlvoWhatsApp.id, 'Contato Realizado', agendamento);

    setEnviandoWhatsApp(false);
    if (isAgendado) {
      setStatusEnvioFeedback(`📅 Mensagem programada com sucesso para ${dataHoraProgramada}! A empresa foi enviada ao CRM em "Contato Realizado".`);
    } else {
      setStatusEnvioFeedback(`🚀 Mensagem enviada e lead cadastrado no CRM em "Contato Realizado"!`);
    }

    setTimeout(() => {
      setModalWhatsAppOpen(false);
      setStatusEnvioFeedback(null);
    }, 3500);
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
                  Mecanismo de inteligência tributária para monitoramento e captação ativa: localize empresas por cidade, estado, regime tributário (<strong>Simples</strong>, <strong>MEI</strong> ou <strong>Regime Normal</strong>) e situação de <strong>débitos fiscais (ADE / PGFN)</strong>.
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

          {/* BARRA DE CONSULTA DIRETA DE CNPJ INDIVIDUAL */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <form onSubmit={handleConsultarCnpjAoVivo} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={cnpjConsultaInput}
                  onChange={(e) => setCnpjConsultaInput(e.target.value)}
                  placeholder="Digitar CNPJ para consulta direta individual na Receita Federal (ex: 48.912.345/0001-82)..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <button
                type="submit"
                disabled={consultandoCnpj || !cnpjConsultaInput.trim()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition whitespace-nowrap"
              >
                {consultandoCnpj ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    Consultar CNPJ Direto
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

      {/* ================= MOTOR DE CAPTAÇÃO EXTERNA NAS CONSULTAS PÚBLICAS ================= */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border-2 border-blue-500/30 dark:border-blue-500/40 shadow-md space-y-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Motor de Captação Externa (Receita Federal & PGFN)
                </h2>
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Buscar Novas Empresas
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Acione este comando para consultar bases públicas abertas (Receita Federal, Dívida Aberta PGFN) e <strong>trazer novas empresas</strong> para o seu Radar.
              </p>
            </div>
          </div>
        </div>

        {/* GRADE DOS FILTROS ESPECÍFICOS DE CAPTAÇÃO PÚBLICA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* 1. ESTADO (UF) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              1. Estado (UF)
            </label>
            <select
              value={buscaUf}
              onChange={(e) => setBuscaUf(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SP">São Paulo (SP)</option>
              <option value="RJ">Rio de Janeiro (RJ)</option>
              <option value="MG">Minas Gerais (MG)</option>
              <option value="PR">Paraná (PR)</option>
              <option value="SC">Santa Catarina (SC)</option>
              <option value="RS">Rio Grande do Sul (RS)</option>
              <option value="BA">Bahia (BA)</option>
              <option value="DF">Distrito Federal (DF)</option>
            </select>
          </div>

          {/* 2. CIDADE / MUNICÍPIO */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              2. Cidade / Município
            </label>
            <div className="relative">
              <input
                type="text"
                list="cidades-sugestoes"
                value={buscaMunicipio}
                onChange={(e) => setBuscaMunicipio(e.target.value)}
                placeholder="Ex: Campinas, Hortolândia..."
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="cidades-sugestoes">
                <option value="Campinas" />
                <option value="Hortolândia" />
                <option value="Sumaré" />
                <option value="Paulínia" />
                <option value="Americana" />
                <option value="Indaiatuba" />
                <option value="Valinhos" />
                <option value="Vinhedo" />
                <option value="Jaguariúna" />
                <option value="Piracicaba" />
                <option value="Limeira" />
                <option value="São Paulo" />
                {municipiosDisponiveis.map(m => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>

          {/* 3. REGIME TRIBUTÁRIO (REGRA EXATA DO USUÁRIO) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              3. Regime Tributário
            </label>
            <select
              value={buscaRegime}
              onChange={(e: any) => setBuscaRegime(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simples">Simples (apenas Simples Nacional)</option>
              <option value="mei">MEI (Microempreendedor Individual)</option>
              <option value="normal">Regime Normal (Lucro Presumido / Real)</option>
              <option value="todos">Todos os Regimes</option>
            </select>
          </div>

          {/* 4. POSSUI DÉBITOS OU NÃO */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-500" />
              4. Possui Débitos?
            </label>
            <select
              value={buscaDebito}
              onChange={(e: any) => setBuscaDebito(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="com_debitos">🚨 Sim (Com Débitos / ADE / PGFN)</option>
              <option value="sem_debitos">🟢 Não (Sem Débitos / Regular)</option>
              <option value="todos">Todos (Com e Sem Débitos)</option>
            </select>
          </div>

          {/* 5. QUANTIDADE A CAPTAR */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              5. Quantidade
            </label>
            <select
              value={buscaQuantidade}
              onChange={(e) => setBuscaQuantidade(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 novas empresas</option>
              <option value={8}>8 novas empresas</option>
              <option value={12}>12 novas empresas</option>
            </select>
          </div>
        </div>

        {/* BOTÃO DE DISPARO DA CAPTAÇÃO PÚBLICA */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Regra ativa: {buscaRegime === 'simples' ? 'Simples Nacional (sem MEI)' : buscaRegime === 'mei' ? 'MEI (Simples com MEI)' : buscaRegime === 'normal' ? 'Regime Normal (não Simples)' : 'Todos os Regimes'} em <strong>{buscaMunicipio}/{buscaUf}</strong> ({buscaDebito === 'com_debitos' ? 'Com Débitos / ADE' : buscaDebito === 'sem_debitos' ? 'Sem Débitos' : 'Todos'}).
          </p>

          <button
            type="button"
            onClick={handleExecutarBusca}
            disabled={executandoBusca}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-blue-900/30 transition whitespace-nowrap"
          >
            {executandoBusca ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Varrendo Bases Públicas...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>BUSCAR NOVAS EMPRESAS NAS CONSULTAS PÚBLICAS</span>
              </>
            )}
          </button>
        </div>

        {/* ANIMAÇÃO DE VARREDURA EM ANDAMENTO */}
        {executandoBusca && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                Varredura pública em andamento...
              </span>
              <span>{etapaVarreduraTexto}</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full w-2/3 animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>
        )}

        {/* FEEDBACK DA BUSCA REALIZADA */}
        {feedbackBusca && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{feedbackBusca}</span>
            </div>
            <button
              onClick={() => setFeedbackBusca(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ================= BARRA DE CONTROLE DA BASE CAPTADA ================= */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              Empresas Armazenadas no seu Radar ({empresasRadar.length} no total)
            </h3>
            <p className="text-xs text-slate-500">
              Visualize, filtre na sua base, despache mensagens no WhatsApp ou importe para o CRM.
            </p>
          </div>

          {/* Filtros Rápidos de visualização na base */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro Regime Local */}
            <select
              value={filtroRegimeLocal}
              onChange={(e: any) => setFiltroRegimeLocal(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-blue-500"
            >
              <option value="todos">Regime: Todos</option>
              <option value="simples">Simples</option>
              <option value="mei">MEI</option>
              <option value="normal">Regime Normal</option>
            </select>

            {/* Filtro Débitos Local */}
            <select
              value={filtroDebitoLocal}
              onChange={(e: any) => setFiltroDebitoLocal(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-blue-500"
            >
              <option value="todos">Débitos: Todos</option>
              <option value="com_debitos">Com Débitos</option>
              <option value="sem_debitos">Sem Débitos</option>
            </select>

            {/* Campo de Busca Rápida na Base */}
            <div className="relative">
              <input
                type="text"
                value={filtroTextoLocal}
                onChange={(e) => setFiltroTextoLocal(e.target.value)}
                placeholder="Filtrar por nome, CNPJ, cidade..."
                className="pl-7 pr-3 py-1.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>

            {(filtroRegimeLocal !== 'todos' || filtroDebitoLocal !== 'todos' || filtroTextoLocal) && (
              <button
                onClick={handleLimparFiltrosLocais}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                title="Limpar filtros da base"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CARDS DE INDICADORES RÁPIDOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Simples</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{metricas.totalSimples}</span>
            <span className="text-xs text-slate-500">empresas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Optantes Simples (não MEI)</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">MEI</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-400">{metricas.totalMei}</span>
            <span className="text-xs text-purple-500">microempresas</span>
          </div>
          <p className="text-[11px] text-purple-600/80 mt-0.5">Simples Nacional com MEI</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Regime Normal</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">{metricas.totalNormal}</span>
            <span className="text-xs text-slate-500">empresas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Não optante pelo Simples</p>
        </div>

        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 border border-red-200 dark:border-red-900/50 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Com Débitos / ADE</span>
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-400">{metricas.totalComDebito}</span>
            <span className="text-xs text-red-600/80">alvos prioritários</span>
          </div>
          <p className="text-[11px] text-red-600/80 mt-0.5">{metricas.comAde} com Notificação de ADE</p>
        </div>
      </div>

      {/* BARRA DE SELEÇÃO EM LOTE */}
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
              <span>Selecionar todas as {empresasFiltradas.length} empresas do resultado</span>
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

      {/* ================= GRADE DE EMPRESAS LOCALIZADAS ================= */}
      {empresasFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-400 mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhuma empresa encontrada com os parâmetros pesquisados</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Ajuste os filtros de Cidade, Regime Tributário ou Débitos no comando de busca e clique em <strong>Executar Busca no Radar</strong>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {empresasFiltradas.map((emp) => {
            const isSelected = selecionadas.includes(emp.id);
            const isImportado = emp.status_contato === 'Importado_CRM';
            const isContatado = emp.status_contato === 'Contatado_WhatsApp';
            
            // Regra oficial do regime:
            const regimeClassificado = classificarRegimeEmpresa(emp);
            const possuiDebitos = Boolean(emp.tem_ade_ativo || (emp.tem_divida_pgfn && emp.valor_divida_pgfn > 0));

            return (
              <div
                key={emp.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border transition-all shadow-sm hover:shadow-md relative flex flex-col justify-between ${
                  emp.tem_ade_ativo
                    ? 'border-l-4 border-l-red-500 border-slate-200 dark:border-slate-700'
                    : possuiDebitos
                    ? 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-700'
                    : 'border-l-4 border-l-emerald-500 border-slate-200 dark:border-slate-700'
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
                          {/* BADGE DE REGIME (REGRA SOLICITADA) */}
                          {regimeClassificado === 'Simples' && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Simples
                            </span>
                          )}

                          {regimeClassificado === 'MEI' && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              MEI
                            </span>
                          )}

                          {regimeClassificado === 'Regime Normal' && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
                              Regime Normal
                            </span>
                          )}

                          {/* BADGES DE DÉBITOS */}
                          {emp.tem_ade_ativo ? (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 flex items-center gap-1 border border-red-200 dark:border-red-800">
                              <ShieldAlert className="w-3 h-3" />
                              ADE Ativo ({emp.prazo_regularizacao_dias || 30}d)
                            </span>
                          ) : emp.tem_divida_pgfn && emp.valor_divida_pgfn > 0 ? (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                              <DollarSign className="w-3 h-3" />
                              PGFN: R$ {(emp.valor_divida_pgfn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Sem Débitos (Regular)
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
                      <span className="truncate">Sócio: <strong>{emp.socio_principal || 'Não declarado'}</strong></span>
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

                  {/* Informações Fiscais de Notificação ADE */}
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
                        {emp.motivo_ade || 'Débitos pendentes de parcelamento no Simples Nacional e Dívida Ativa.'}
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
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 my-8 animate-in fade-in">
            {/* Topo do Modal */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-xs">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Abordagem Comercial & Tributária via WhatsApp
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {empresaAlvoWhatsApp.razao_social}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      CNPJ: {empresaAlvoWhatsApp.cnpj}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      classificarRegimeEmpresa(empresaAlvoWhatsApp) === 'Simples'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : classificarRegimeEmpresa(empresaAlvoWhatsApp) === 'MEI'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                    }`}>
                      {classificarRegimeEmpresa(empresaAlvoWhatsApp)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalWhatsAppOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs">
              {/* Seleção do Modo de Envio: Imediato vs Agendado */}
              <div className="bg-slate-50 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Programação do Disparo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoEnvioWhatsApp('imediato')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold transition text-xs ${
                      tipoEnvioWhatsApp === 'imediato'
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Imediatamente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoEnvioWhatsApp('agendado')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold transition text-xs ${
                      tipoEnvioWhatsApp === 'agendado'
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Programar para Outro Dia / Hora</span>
                  </button>
                </div>

                {/* Bloco de Agendamento */}
                {tipoEnvioWhatsApp === 'agendado' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in">
                    <div className="flex-1 w-full">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Data do Disparo:
                      </label>
                      <input
                        type="date"
                        value={dataAgendada}
                        onChange={(e) => setDataAgendada(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex-1 w-full">
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Horário Programado:
                      </label>
                      <input
                        type="time"
                        value={horaAgendada}
                        onChange={(e) => setHoraAgendada(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="w-full sm:w-auto self-end pb-1">
                      <span className="text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 inline-block">
                        ✓ Entra no CRM em <strong>Contato Realizado</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Telefone Destino */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  {empresaAlvoWhatsApp.socio_principal && (
                    <span className="text-xs text-slate-500 hidden sm:inline bg-slate-100 dark:bg-slate-800 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      👤 {empresaAlvoWhatsApp.socio_principal}
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de Modelos & Sugerir Texto Padrão */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Modelos de Abordagem Estratégica:
                  </label>
                  <button
                    type="button"
                    onClick={handleSugerirTextoPadrao}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/50 rounded-lg text-[11px] font-bold transition"
                    title="Preenche o melhor texto padrão baseado na situação fiscal da empresa"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sugerir Texto Padrão</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {modelosCaptação.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleTrocarTemplateWhatsApp(m.id)}
                      className={`text-left p-2 rounded-xl border text-[11px] transition ${
                        modeloSelecionadoId === m.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="truncate">{m.titulo.replace(/^[^\w\s]+/, '').trim()}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões para Inserção de TAGs Rápidas */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px]">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>Clique para inserir TAG no texto:</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Preenchimento automático</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { tag: '{empresa}', label: 'Nome da Empresa' },
                    { tag: '{socio}', label: 'Nome do Sócio' },
                    { tag: '{cnpj}', label: 'CNPJ' },
                    { tag: '{cidade}', label: 'Cidade' },
                    { tag: '{regime}', label: 'Regime' },
                    { tag: '{valor_debito}', label: 'Valor Débito' },
                    { tag: '{prazo_dias}', label: 'Prazo Dias' },
                    { tag: '{cnae}', label: 'Ramo / CNAE' }
                  ].map(item => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInserirTag(item.tag)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md font-mono text-[10px] border border-slate-200 dark:border-slate-600 transition"
                      title={`Inserir ${item.label} (${item.tag})`}
                    >
                      + {item.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Abas Editor vs Pré-visualização Real */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setAbaVisualizacaoWhatsApp('editor')}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                        abaVisualizacaoWhatsApp === 'editor'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Mensagem Padrão</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAbaVisualizacaoWhatsApp('preview')}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                        abaVisualizacaoWhatsApp === 'preview'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Pré-visualização Real</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopiarMensagem}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {copiadoFeedback ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiadoFeedback ? 'Copiado!' : 'Copiar Texto'}
                  </button>
                </div>

                {abaVisualizacaoWhatsApp === 'editor' ? (
                  <textarea
                    rows={7}
                    value={mensagemEditavel}
                    onChange={(e) => setMensagemEditavel(e.target.value)}
                    placeholder="Digite a mensagem padrão ou use as TAGs como {empresa}, {socio}, {cnpj}..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
                  />
                ) : (
                  <div className="bg-[#EFEAE2] dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 min-h-[160px] flex flex-col justify-end">
                    <div className="bg-white dark:bg-emerald-950/70 border border-emerald-200/50 dark:border-emerald-800/40 p-3.5 rounded-2xl rounded-tl-xs shadow-xs text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed max-w-[90%]">
                      {montarMensagemComVariaveis(empresaAlvoWhatsApp, mensagemEditavel)}
                      <div className="text-[10px] text-slate-400 text-right mt-2 font-mono">
                        {tipoEnvioWhatsApp === 'agendado' ? `Programado para ${dataAgendada} ${horaAgendada}` : 'Agora'} ✓✓
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {statusEnvioFeedback && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold">{statusEnvioFeedback}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setModalWhatsAppOpen(false);
                      setStatusEnvioFeedback(null);
                      setActiveTab('crm');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[11px] transition shadow-xs self-end sm:self-auto flex-shrink-0"
                  >
                    <span>Ver no CRM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Ações do Modal */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <a
                href={gerarLinkWaMe()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl text-xs font-semibold transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir WhatsApp Web</span>
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
                  onClick={handleExecutarAcaoWhatsApp}
                  disabled={enviandoWhatsApp || !telefoneDestino}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition ${
                    tipoEnvioWhatsApp === 'agendado'
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
                  }`}
                >
                  {enviandoWhatsApp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : tipoEnvioWhatsApp === 'agendado' ? (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Programar & Enviar ao CRM</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Disparar & Enviar ao CRM</span>
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
                  <strong className="text-slate-800 dark:text-slate-100 text-sm">{classificarRegimeEmpresa(empresaDossie)}</strong>
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
                    A Receita Federal notificou esta empresa por pendências não parceladas. O prazo legal estimado para regularização antes do desenquadramento automático para o Regime Normal (Lucro Presumido) é de <strong>{empresaDossie.prazo_regularizacao_dias || 30} dias</strong>.
                  </p>
                  <div className="text-xs text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/50 p-2.5 rounded-lg">
                    <strong>Impacto financeiro:</strong> Caso ocorra o desenquadramento para o Regime Normal, a carga tributária da empresa pode aumentar de ~6% para mais de 16,33% sobre o faturamento bruto.
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
