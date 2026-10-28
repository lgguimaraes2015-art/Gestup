'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  EmpresaRadarFiscal,
  FiltrosRadarFiscal,
  ModeloMensagemCaptação
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
  RotateCcw
} from 'lucide-react';

export function RadarFiscalView() {
  const {
    empresasRadar,
    modelosCaptação,
    importarEmpresaRadarParaCRM,
    importarEmpresasRadarLoteParaCRM,
    consultarCNPJOnline,
    dispararMensagemCaptaçãoWhatsApp,
    adicionarEmpresaAoRadar,
    whatsAppConfig,
    setActiveTab
  } = useApp();

  // ================= ESTADOS DO COMANDO DE BUSCA =================
  const [buscaUf, setBuscaUf] = useState('SP');
  const [buscaMunicipio, setBuscaMunicipio] = useState('todos');
  const [buscaRegime, setBuscaRegime] = useState<'todos' | 'simples' | 'mei' | 'normal'>('todos');
  const [buscaDebito, setBuscaDebito] = useState<'todos' | 'com_debitos' | 'sem_debitos'>('todos');
  const [buscaTermo, setBuscaTermo] = useState('');

  // Filtros efetivamente aplicados na busca ativa
  const [filtrosAtivos, setFiltrosAtivos] = useState<{
    uf: string;
    municipio: string;
    regime: 'todos' | 'simples' | 'mei' | 'normal';
    possuiDebitos: 'todos' | 'com_debitos' | 'sem_debitos';
    termo: string;
  }>({
    uf: 'SP',
    municipio: 'todos',
    regime: 'todos',
    possuiDebitos: 'todos',
    termo: ''
  });

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

  // Função para executar a busca pelo comando com filtros específicos
  const handleExecutarBusca = () => {
    setExecutandoBusca(true);
    setFeedbackBusca(null);

    // Simula varredura rápida nas bases de dados da Receita Federal e PGFN
    setTimeout(() => {
      // Se o usuário digitou uma cidade específica e ela ainda não existe na base, geramos prospects sob medida
      if (buscaMunicipio !== 'todos' && buscaMunicipio.trim() !== '') {
        const cidadeNormalizada = buscaMunicipio.trim();
        const jaExiste = empresasRadar.some(
          e => e.municipio.toLowerCase() === cidadeNormalizada.toLowerCase() && e.uf === buscaUf
        );

        if (!jaExiste) {
          // Adiciona prospecções dinâmicas para a cidade pesquisada
          const novasEmpresas: EmpresaRadarFiscal[] = [
            {
              id: `rad-dyn-1-${Date.now()}`,
              cnpj: `${Math.floor(10 + Math.random() * 89)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}/0001-${Math.floor(10 + Math.random() * 89)}`,
              razao_social: `COMERCIO E SERVICOS ${cidadeNormalizada.toUpperCase()} LTDA`,
              nome_fantasia: `${cidadeNormalizada.toUpperCase()} COMERCIO`,
              situacao_cadastral: 'Ativa',
              data_abertura: '2020-03-10',
              regime: 'Simples',
              optante_simples: true,
              optante_mei: false,
              tem_ade_ativo: true,
              data_ade: '2026-09-20',
              prazo_regularizacao_dias: 28,
              motivo_ade: 'Notificação ADE 2026: Débito de DAS-Simples e dívida ativa na Receita Federal.',
              tem_divida_pgfn: true,
              valor_divida_pgfn: 47800.00,
              tipo_divida_pgfn: 'Tributária',
              inscricoes_pgfn_count: 3,
              uf: buscaUf,
              municipio: cidadeNormalizada,
              bairro: 'Centro',
              logradouro: 'Rua Principal',
              numero: '250',
              cep: '13000-000',
              telefone: '(19) 3800-1122',
              whatsapp: '19992080639',
              email: `contato@comercio${cidadeNormalizada.toLowerCase()}.com.br`,
              segmento: 'Comércio & Serviços',
              cnae_principal_descricao: 'Comércio varejista de mercadorias em geral',
              socio_principal: 'Alexandre Martins de Oliveira',
              status_contato: 'Novo',
              mensagens_enviadas_count: 0,
              honorario_regularizacao_estimado: 3800.00,
              honorario_mensal_sugerido: 1500.00
            },
            {
              id: `rad-dyn-2-${Date.now()}`,
              cnpj: `${Math.floor(10 + Math.random() * 89)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}/0001-${Math.floor(10 + Math.random() * 89)}`,
              razao_social: `MARCOS VINICIUS SERVICOS MANUTENCAO MEI`,
              nome_fantasia: `MV MANUTENCOES`,
              situacao_cadastral: 'Ativa',
              data_abertura: '2022-07-15',
              regime: 'MEI',
              optante_simples: true,
              optante_mei: true,
              tem_ade_ativo: true,
              data_ade: '2026-10-02',
              prazo_regularizacao_dias: 35,
              motivo_ade: 'Guias DAS-MEI pendentes de recolhimento na Receita Federal.',
              tem_divida_pgfn: true,
              valor_divida_pgfn: 7400.00,
              tipo_divida_pgfn: 'Tributária',
              inscricoes_pgfn_count: 1,
              uf: buscaUf,
              municipio: cidadeNormalizada,
              bairro: 'Jardim Primavera',
              logradouro: 'Av. das Flores',
              numero: '88',
              telefone: '(19) 99888-1122',
              whatsapp: '19998881122',
              email: 'marcos.manutencao.mei@gmail.com',
              segmento: 'Manutenção & Reparos',
              socio_principal: 'Marcos Vinicius da Silva',
              status_contato: 'Novo',
              mensagens_enviadas_count: 0,
              honorario_regularizacao_estimado: 950.00,
              honorario_mensal_sugerido: 400.00
            },
            {
              id: `rad-dyn-3-${Date.now()}`,
              cnpj: `${Math.floor(10 + Math.random() * 89)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}/0001-${Math.floor(10 + Math.random() * 89)}`,
              razao_social: `INDUSTRIA E METALURGICA ${cidadeNormalizada.toUpperCase()} S/A`,
              nome_fantasia: `METALURGICA ${cidadeNormalizada.toUpperCase()}`,
              situacao_cadastral: 'Ativa',
              data_abertura: '2015-11-20',
              regime: 'Regime Normal',
              optante_simples: false,
              optante_mei: false,
              tem_ade_ativo: false,
              tem_divida_pgfn: false,
              valor_divida_pgfn: 0,
              uf: buscaUf,
              municipio: cidadeNormalizada,
              bairro: 'Distrito Industrial',
              logradouro: 'Av. das Indústrias',
              numero: '1500',
              telefone: '(19) 3900-4400',
              whatsapp: '19997772211',
              email: `diretoria@metalurgica${cidadeNormalizada.toLowerCase()}.com.br`,
              segmento: 'Indústria & Manufatura',
              socio_principal: 'Carlos Eduardo Fontes',
              status_contato: 'Novo',
              mensagens_enviadas_count: 0,
              honorario_regularizacao_estimado: 0,
              honorario_mensal_sugerido: 4500.00
            }
          ];

          novasEmpresas.forEach(nova => adicionarEmpresaAoRadar(nova));
        }
      }

      setFiltrosAtivos({
        uf: buscaUf,
        municipio: buscaMunicipio,
        regime: buscaRegime,
        possuiDebitos: buscaDebito,
        termo: buscaTermo
      });

      setExecutandoBusca(false);
      setFeedbackBusca(`Busca concluída! Os filtros de Estado, Cidade, Regime e Débitos foram atualizados.`);
      setTimeout(() => setFeedbackBusca(null), 5000);
    }, 400);
  };

  // Limpar busca e restaurar filtros
  const handleLimparBusca = () => {
    setBuscaUf('SP');
    setBuscaMunicipio('todos');
    setBuscaRegime('todos');
    setBuscaDebito('todos');
    setBuscaTermo('');
    setFiltrosAtivos({
      uf: 'SP',
      municipio: 'todos',
      regime: 'todos',
      possuiDebitos: 'todos',
      termo: ''
    });
    setFeedbackBusca('Filtros redefinidos para a visão geral.');
    setTimeout(() => setFeedbackBusca(null), 3000);
  };

  // Lista Filtrada aplicando estritamente as regras de negócio
  const empresasFiltradas = useMemo(() => {
    return empresasRadar.filter(emp => {
      // 1. Filtro UF
      if (filtrosAtivos.uf !== 'todos' && emp.uf.toUpperCase() !== filtrosAtivos.uf.toUpperCase()) {
        return false;
      }

      // 2. Filtro Município
      if (filtrosAtivos.municipio !== 'todos' && filtrosAtivos.municipio.trim() !== '') {
        const munAlvo = filtrosAtivos.municipio.toLowerCase().trim();
        if (!emp.municipio.toLowerCase().includes(munAlvo)) {
          return false;
        }
      }

      // 3. Regra de Regime Tributário solicitada pelo usuário:
      // - Se for simples nacional mas não for MEI => apenas "Simples"
      // - Se for simples nacional mas for MEI => apenas "MEI"
      // - Se não for simples => "Regime Normal"
      const regimeCalculado = classificarRegimeEmpresa(emp);

      if (filtrosAtivos.regime === 'simples' && regimeCalculado !== 'Simples') {
        return false;
      }
      if (filtrosAtivos.regime === 'mei' && regimeCalculado !== 'MEI') {
        return false;
      }
      if (filtrosAtivos.regime === 'normal' && regimeCalculado !== 'Regime Normal') {
        return false;
      }

      // 4. Filtro por Possui Débitos ou Não
      const possuiDebitosNaPratica = Boolean(
        emp.tem_ade_ativo ||
        (emp.tem_divida_pgfn && emp.valor_divida_pgfn > 0) ||
        (emp.valor_divida_estadual && emp.valor_divida_estadual > 0)
      );

      if (filtrosAtivos.possuiDebitos === 'com_debitos' && !possuiDebitosNaPratica) {
        return false;
      }
      if (filtrosAtivos.possuiDebitos === 'sem_debitos' && possuiDebitosNaPratica) {
        return false;
      }

      // 5. Filtro por Termo Livre de Busca
      if (filtrosAtivos.termo.trim()) {
        const termo = filtrosAtivos.termo.toLowerCase().trim();
        const textoCompleto = `${emp.razao_social} ${emp.nome_fantasia || ''} ${emp.cnpj} ${emp.socio_principal || ''} ${emp.segmento || ''} ${emp.cnae_principal_descricao || ''}`.toLowerCase();
        if (!textoCompleto.includes(termo)) return false;
      }

      return true;
    });
  }, [empresasRadar, filtrosAtivos]);

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
      setStatusEnvioFeedback('Mensagem enviada com sucesso pela instância oficial do WhatsApp!');
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

      {/* ================= PAINEL DO COMANDO DE BUSCA (FILTROS ESPECÍFICOS) ================= */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Comando de Busca no Radar Fiscal
              </h2>
              <p className="text-xs text-slate-500">
                Selecione os parâmetros e dispare o comando de busca de empresas na Receita Federal e PGFN.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLimparBusca}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Filtros
          </button>
        </div>

        {/* GRADE DOS 4 FILTROS ESPECÍFICOS: ESTADO, CIDADE, REGIME, DÉBITOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. ESTADO (UF) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              1. Estado (UF)
            </label>
            <select
              value={buscaUf}
              onChange={(e) => {
                setBuscaUf(e.target.value);
                setBuscaMunicipio('todos');
              }}
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
              <option value="todos">Todos os Estados</option>
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
                value={buscaMunicipio === 'todos' ? '' : buscaMunicipio}
                onChange={(e) => setBuscaMunicipio(e.target.value || 'todos')}
                placeholder="Ex: Campinas, Hortolândia, Sumaré..."
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
              <option value="todos">Todos os Regimes</option>
              <option value="simples">Simples (Simples Nacional sem MEI)</option>
              <option value="mei">MEI (Microempreendedor Individual)</option>
              <option value="normal">Regime Normal (Lucro Presumido / Real)</option>
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
              <option value="todos">Todos (Com e Sem Débitos)</option>
              <option value="com_debitos">🚨 Sim (Possui Débitos / ADE / PGFN)</option>
              <option value="sem_debitos">🟢 Não (Sem Débitos / Regular)</option>
            </select>
          </div>
        </div>

        {/* CAMPO DE BUSCA LIVRE + BOTÃO DE EXECUÇÃO */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={buscaTermo}
              onChange={(e) => setBuscaTermo(e.target.value)}
              placeholder="Filtro complementar opcional (Razão Social, Nome Fantasia, CNPJ, Sócio ou CNAE)..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleExecutarBusca}
            disabled={executandoBusca}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-900/20 transition whitespace-nowrap"
          >
            {executandoBusca ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Varrendo Bases Oficiais...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white text-white" />
                Executar Busca no Radar
              </>
            )}
          </button>
        </div>

        {/* FEEDBACK DA BUSCA EXECUTADA */}
        {feedbackBusca && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{feedbackBusca}</span>
          </div>
        )}

        {/* RESUMO DOS PARÂMETROS ATIVOS DA BUSCA */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-semibold text-slate-500">Parâmetros Ativos:</span>
          
          <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 font-medium">
            Estado: <strong>{filtrosAtivos.uf}</strong>
          </span>

          <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 font-medium">
            Cidade: <strong>{filtrosAtivos.municipio === 'todos' ? 'Todas as Cidades' : filtrosAtivos.municipio}</strong>
          </span>

          <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 font-medium">
            Regime: <strong>
              {filtrosAtivos.regime === 'todos' ? 'Todos os Regimes' :
               filtrosAtivos.regime === 'simples' ? 'Simples' :
               filtrosAtivos.regime === 'mei' ? 'MEI' : 'Regime Normal'}
            </strong>
          </span>

          <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 font-medium">
            Débitos: <strong>
              {filtrosAtivos.possuiDebitos === 'todos' ? 'Todos (Com e Sem)' :
               filtrosAtivos.possuiDebitos === 'com_debitos' ? '🚨 Com Débitos' : '🟢 Sem Débitos (Regular)'}
            </strong>
          </span>

          <span className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400">
            {empresasFiltradas.length} empresas encontradas
          </span>
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
                    Empresa: <strong>{empresaAlvoWhatsApp.razao_social}</strong> (CNPJ: {empresaAlvoWhatsApp.cnpj}) - Regime: <strong>{classificarRegimeEmpresa(empresaAlvoWhatsApp)}</strong>
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
