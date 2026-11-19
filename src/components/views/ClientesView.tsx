'use client';

import React, { useState, useRef } from 'react';
import { useApp, getTarefasPadraoPorRegime } from '@/context/AppContext';
import {
  Cliente,
  RegimeTributario,
  ContatoNotificacao,
  DeclaracaoVinculadaCliente,
  TipoDocumentoLegal,
  DocumentoLegalCliente,
  TarefaEmpresaConfig,
  Departamento,
  Periodicidade
} from '@/types';
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
  UserCheck,
  Key,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  ShieldCheck,
  Layers,
  Upload,
  Download,
  Paperclip,
  CheckSquare,
  Folder,
  Sparkles
} from 'lucide-react';

const formatarTamanhoBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

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
    dispararCobrancaDocumentosCliente,
    adicionarTarefaEmpresa,
    removerTarefaEmpresa,
    atualizarTarefaEmpresa,
    sugerirTarefasPorRegime,
    zerarTodasTarefasEmpresas,
    gerarTarefasRecorrentesCarteira,
    gerarTarefasAteJaneiro2027,
    gerarTarefasEmpresaAteJaneiro2027,
    adicionarDocumentoLegalCliente,
    removerDocumentoLegalCliente,
    atualizarAcessoPortalCliente,
    userRole
  } = useApp();

  const [busca, setBusca] = useState('');
  const [filtroRegime, setFiltroRegime] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Modais
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalEditarCliente, setModalEditarCliente] = useState<Cliente | null>(null);
  const [modalHistoricoCliente, setModalHistoricoCliente] = useState<Cliente | null>(null);

  // Cliente atualmente sendo editado sincronizado em tempo real com o contexto
  const clienteEditando = modalEditarCliente
    ? (clientes.find(c => c.id === modalEditarCliente.id) || modalEditarCliente)
    : null;
  const [modalDeclaracoesCliente, setModalDeclaracoesCliente] = useState<Cliente | null>(null);

  // Aba ativa dentro do modal de edição/cadastro
  const [tabModalCliente, setTabModalCliente] = useState<'dados' | 'tarefas' | 'documentos_legais' | 'acesso_portal' | 'contatos'>('dados');

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

  // Credenciais de Acesso ao Portal do Cliente
  const [portalEmail, setPortalEmail] = useState('');
  const [portalSenha, setPortalSenha] = useState('finup123');
  const [portalAtivo, setPortalAtivo] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Estados para Tarefas da Empresa
  const [novaTarefaTitulo, setNovaTarefaTitulo] = useState('');
  const [novaTarefaDepto, setNovaTarefaDepto] = useState<Departamento>('Fiscal');
  const [novaTarefaPeriodicidade, setNovaTarefaPeriodicidade] = useState<Periodicidade>('Mensal');
  const [novaTarefaDiaLimite, setNovaTarefaDiaLimite] = useState(20);
  const [novaTarefaEhProcesso, setNovaTarefaEhProcesso] = useState(false);

  // Estados para Documentos Legais
  const [tipoDocLegal, setTipoDocLegal] = useState<TipoDocumentoLegal>('Contrato Social / Requerimento');
  const [nomeDocLegal, setNomeDocLegal] = useState('');
  const documentosLegaisInputRef = useRef<HTMLInputElement>(null);

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
  const handleAbrirEdicao = (cli: Cliente, tabInicial: 'dados' | 'tarefas' | 'documentos_legais' | 'acesso_portal' | 'contatos' = 'dados') => {
    setModalEditarCliente(cli);
    setTabModalCliente(tabInicial);
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
    setPortalEmail(cli.portal_acesso?.email || cli.email || '');
    setPortalSenha(cli.portal_acesso?.senha || 'finup123');
    setPortalAtivo(cli.portal_acesso?.ativo !== false);
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
      endereco: 'Endereço comercial',
      portal_acesso: {
        email: portalEmail || email || `${nome.toLowerCase().replace(/[^a-z0-9]/g, '')}@empresa.com.br`,
        senha: portalSenha || 'finup123',
        ativo: portalAtivo
      }
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
        data_renovacao_contrato: dataRenovacaoContrato,
        tarefas_empresa: clienteEditando?.tarefas_empresa || modalEditarCliente.tarefas_empresa || [],
        documentos_legais: clienteEditando?.documentos_legais || modalEditarCliente.documentos_legais || [],
        portal_acesso: {
          email: portalEmail || email,
          senha: portalSenha || 'finup123',
          ativo: portalAtivo,
          ultimo_acesso: modalEditarCliente.portal_acesso?.ultimo_acesso
        }
      },
      `Dados cadastrais atualizados (Honorário: R$ ${honorario}, Vencimento: dia ${diaVencimento}).`
    );

    setModalEditarCliente(null);
    limparFormulario();
    setToastMsg(`✅ Cliente atualizado: Honorário de R$ ${honorario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sincronizado no Financeiro em tempo real!`);
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
    setPortalEmail('');
    setPortalSenha('finup123');
    setPortalAtivo(true);
    setNovaTarefaTitulo('');
    setNovaTarefaDiaLimite(20);
    setNovaTarefaEhProcesso(false);
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

  // Excluir Tarefa/Obrigação Vinculada à Empresa (Garantido por ID, Título e Índice)
  const handleExcluirTarefaEmpresa = (clienteId: string, tarefa: TarefaEmpresaConfig, indexRemover: number) => {
    const identificador = tarefa.id || tarefa.titulo;
    removerTarefaEmpresa(clienteId, identificador);

    setModalEditarCliente(prev => {
      if (!prev) return null;
      const filtradas = (prev.tarefas_empresa || []).filter((item, idx) => {
        if (idx === indexRemover) return false;
        if (tarefa.id && item.id === tarefa.id) return false;
        if (item.titulo === tarefa.titulo) return false;
        return true;
      });
      return {
        ...prev,
        tarefas_empresa: filtradas
      };
    });

    setToastMsg(`🗑️ Obrigação "${tarefa.titulo}" excluída com sucesso!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Upload Múltiplo de Documentos Legais
  const handleUploadDocumentosLegais = (e: React.ChangeEvent<HTMLInputElement>, clienteId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    let processados = 0;

    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          adicionarDocumentoLegalCliente(clienteId, {
            tipo: tipoDocLegal,
            nome: file.name,
            arquivo_url: reader.result,
            arquivo_conteudo: reader.result,
            arquivo_tamanho: formatarTamanhoBytes(file.size)
          });
          processados++;
          if (processados === fileList.length) {
            setToastMsg(`🏛️ ${processados} documento(s) legal(is) anexado(s) com sucesso à empresa!`);
            setTimeout(() => setToastMsg(null), 4000);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Copiar Convite de WhatsApp
  const handleCopiarConviteWhatsApp = (cli: Cliente) => {
    const linkPortal = typeof window !== 'undefined' ? `${window.location.origin}/portal/cliente` : 'https://finup.gestup.app/portal/cliente';
    const emailAcesso = cli.portal_acesso?.email || cli.email || 'seu-email@empresa.com.br';
    const senhaAcesso = cli.portal_acesso?.senha || 'finup123';

    const texto = `🔐 *Acesso ao Portal do Cliente - fin.up Contabilidade*\n\n` +
      `Olá *${cli.nome}*!\n` +
      `Seu acesso exclusivo ao portal da sua empresa já está liberado. Por lá você pode consultar guias de impostos, calendário de vencimentos, documentos legais e abrir chamados diretamente com nosso time.\n\n` +
      `🌐 *Link do Portal:* ${linkPortal}\n` +
      `📧 *E-mail:* ${emailAcesso}\n` +
      `🔑 *Senha Inicial:* ${senhaAcesso}\n\n` +
      `Em caso de dúvidas, estamos à total disposição no WhatsApp!`;

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(texto);
      setToastMsg(`📋 Dados de acesso ao Portal copiados para a área de transferência!`);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  // Acessar Portal do Cliente como ADM
  const handleAcessarPortalDesteCliente = (cli: Cliente) => {
    try {
      sessionStorage.setItem('gestup_portal_cliente_auth', JSON.stringify({
        clienteId: cli.id,
        email: cli.portal_acesso?.email || cli.email,
        nome: cli.nome,
        loginTimestamp: new Date().toISOString()
      }));
      window.open('/portal/cliente', '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  // Gerar senha segura aleatória
  const handleGerarSenhaAleatoria = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
    setPortalSenha(`finup@${rand}`);
    setToastMsg(`🔑 Nova senha sugerida gerada!`);
    setTimeout(() => setToastMsg(null), 2500);
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
      {userRole !== 'operacional_dp' ? (
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresas Ativas</p>
              <p className="text-2xl font-bold text-brand-blue mt-1">{clientesAtivos}</p>
              <p className="text-[11px] text-slate-500 mt-1">Em atendimento no escritório</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Contratos</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">{clientes.length}</p>
              <p className="text-[11px] text-purple-600 mt-1">{clientesInativos} inativos / baixados</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

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
              if (window.confirm('Atenção: Deseja zerar as tarefas recorrentes vinculadas de TODAS as empresas da carteira para recriar a base do zero?')) {
                zerarTodasTarefasEmpresas();
                setToastMsg('🗑️ Tarefas vinculadas de todas as empresas foram zeradas com sucesso!');
                setTimeout(() => setToastMsg(null), 4000);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold shadow-2xs transition-all"
            title="Zera a configuração de obrigações de todas as empresas para recriação do zero"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Zerar Tarefas das Empresas</span>
          </button>

          <button
            onClick={() => {
              const res = gerarTarefasAteJaneiro2027();
              if (res.totalCriadas > 0) {
                setToastMsg(`⚡ Sucesso! ${res.totalCriadas} tarefas geradas até Janeiro/2027 para toda a carteira!`);
              } else {
                setToastMsg(`ℹ️ Nenhuma nova tarefa a ser gerada até Janeiro/2027. Configure as tarefas nas empresas.`);
              }
              setTimeout(() => setToastMsg(null), 4000);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs transition-all"
            title="Lança as obrigações de todas as empresas até Janeiro/2027 (11/2026, 12/2026 e 01/2027)"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lançar até Jan/2027</span>
          </button>

          <button
            onClick={() => {
              limparFormulario();
              setModalNovoCliente(true);
              setTabModalCliente('dados');
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
                <th className="px-4 py-3.5">Tarefas da Empresa</th>
                <th className="px-4 py-3.5">Documentos Legais</th>
                <th className="px-4 py-3.5">Portal do Cliente</th>
                {userRole !== 'operacional_dp' && (
                  <th className="px-4 py-3.5">Honorário & Venc.</th>
                )}
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Ações & Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientesFiltrados.map(cli => {
                const isAtivo = cli.status === 'Ativo';
                const qtdTarefas = cli.tarefas_empresa?.length || 0;
                const qtdDocsLegais = cli.documentos_legais?.length || 0;
                const portalOk = cli.portal_acesso?.ativo !== false;

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

                    {/* Tarefas Recorrentes da Empresa */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleAbrirEdicao(cli, 'tarefas')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[11px] font-semibold transition-all"
                        title="Ver e configurar as tarefas recorrentes desta empresa"
                      >
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        <span>{qtdTarefas} Tarefa(s)</span>
                      </button>
                    </td>

                    {/* Documentos Legais */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleAbrirEdicao(cli, 'documentos_legais')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold transition-all"
                        title="Contrato Social, Inscrições e Alvará"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{qtdDocsLegais} Doc(s)</span>
                      </button>
                    </td>

                    {/* Portal do Cliente (Credenciais) */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleAbrirEdicao(cli, 'acesso_portal')}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition-all ${
                          portalOk
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                        title="Gerenciar E-mail e Senha de login do cliente"
                      >
                        <Key className="w-3 h-3 text-emerald-600" />
                        <span>{portalOk ? 'Acesso Ativo' : 'Bloqueado'}</span>
                      </button>
                    </td>

                    {/* Honorário & Vencimento */}
                    {userRole !== 'operacional_dp' && (
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900">
                          R$ {(cli.honorario_mensal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[11px] text-slate-500">Todo dia {cli.dia_vencimento || 15}</p>
                      </td>
                    )}

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

                    {/* Ações & Acesso */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Copiar WhatsApp Portal */}
                        <button
                          onClick={() => handleCopiarConviteWhatsApp(cli)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-brand-green border border-emerald-200 transition-all"
                          title="Copiar dados de acesso do Portal para enviar no WhatsApp"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Acessar Portal do Cliente */}
                        <button
                          onClick={() => handleAcessarPortalDesteCliente(cli)}
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all"
                          title="Abrir Portal deste Cliente em nova aba (Modo ADM)"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* Linha do Tempo */}
                        <button
                          onClick={() => setModalHistoricoCliente(cli)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                          title="Histórico de Alterações"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        {/* Editar Cadastro */}
                        <button
                          onClick={() => handleAbrirEdicao(cli, 'dados')}
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

      {/* 4. MODAL NOVO / EDITAR CLIENTE (COM ABAS COMPLETAS) */}
      {(modalNovoCliente || modalEditarCliente) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-brand-blue" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {modalEditarCliente ? `Gestão da Empresa: ${modalEditarCliente.nome}` : 'Cadastrar Nova Empresa na fin.up'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {modalEditarCliente?.cnpj_cpf ? `CNPJ: ${modalEditarCliente.cnpj_cpf}` : 'Preencha os dados contratuais e tarefas'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalNovoCliente(false);
                  setModalEditarCliente(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Abas do Modal */}
            <div className="flex items-center border-b border-slate-200 px-6 bg-slate-50/60 overflow-x-auto gap-2 py-2">
              <button
                type="button"
                onClick={() => setTabModalCliente('dados')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  tabModalCliente === 'dados'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Dados & Contrato</span>
              </button>

              {clienteEditando && (
                <>
                  <button
                    type="button"
                    onClick={() => setTabModalCliente('tarefas')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                      tabModalCliente === 'tarefas'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Tarefas da Empresa ({clienteEditando.tarefas_empresa?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTabModalCliente('documentos_legais')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                      tabModalCliente === 'documentos_legais'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Documentos Legais ({clienteEditando.documentos_legais?.length || 0})</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setTabModalCliente('acesso_portal')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  tabModalCliente === 'acesso_portal'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Acesso Portal do Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => setTabModalCliente('contatos')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  tabModalCliente === 'contatos'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp ({contatosLista.length})</span>
              </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* ABA 1: DADOS GERAIS & CONTRATO */}
              {tabModalCliente === 'dados' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Razão Social / Nome Fantasia *</label>
                      <input
                        type="text"
                        required
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">CNPJ / CPF</label>
                      <input
                        type="text"
                        placeholder="00.000.000/0001-00"
                        value={cnpjCpf}
                        onChange={e => setCnpjCpf(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

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
                        onChange={e => {
                          setEmail(e.target.value);
                          if (!portalEmail) setPortalEmail(e.target.value);
                        }}
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

                  <div className="grid grid-cols-4 gap-3">
                    {userRole !== 'operacional_dp' && (
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Honorário Mensal (R$)</label>
                        <input
                          type="number"
                          value={honorario}
                          onChange={e => setHonorario(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-brand-green"
                        />
                      </div>
                    )}

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
                </div>
              )}

              {/* ABA 2: TAREFAS & OBRIGAÇÕES RECORRENTES DA EMPRESA */}
              {tabModalCliente === 'tarefas' && clienteEditando && (
                <div className="space-y-4">
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-purple-900">
                        Obrigações Recorrentes Desta Empresa
                      </h4>
                      <p className="text-[11px] text-purple-700">
                        As tarefas cadastradas aqui são geradas para cada competência mensal. Tarefas eventuais novas podem ser incluídas no menu Tarefas.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          sugerirTarefasPorRegime(clienteEditando.id);
                          const sugeridas = getTarefasPadraoPorRegime(clienteEditando.regime_tributario, clienteEditando.id);
                          setModalEditarCliente(prev => prev ? { ...prev, tarefas_empresa: sugeridas } : null);
                          setToastMsg(`🪄 Obrigações padrão sugeridas carregadas para ${clienteEditando.regime_tributario}!`);
                          setTimeout(() => setToastMsg(null), 3000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Sugerir por Regime</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja zerar todas as tarefas vinculadas à empresa ${clienteEditando.nome}?`)) {
                            updateCliente(clienteEditando.id, { tarefas_empresa: [] });
                            setModalEditarCliente(prev => prev ? { ...prev, tarefas_empresa: [] } : null);
                            setToastMsg(`🗑️ Todas as tarefas vinculadas a ${clienteEditando.nome} foram zeradas com sucesso.`);
                            setTimeout(() => setToastMsg(null), 3000);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-[11px] flex items-center gap-1.5 shadow-xs shrink-0"
                        title="Zera a lista de obrigações desta empresa"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        <span>Zerar Tarefas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const res = gerarTarefasEmpresaAteJaneiro2027(clienteEditando.id);
                          if (res.totalCriadas > 0) {
                            setToastMsg(`⚡ ${res.totalCriadas} tarefa(s) gerada(s) para ${clienteEditando.nome} de 11/2026 até Janeiro/2027!`);
                          } else {
                            setToastMsg(`ℹ️ As tarefas desta empresa já estão lançadas ou não há tarefas ativas.`);
                          }
                          setTimeout(() => setToastMsg(null), 4000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs shrink-0"
                        title="Lança as obrigações cadastradas desta empresa para 11/2026, 12/2026 e 01/2027"
                      >
                        <Calendar className="w-3.5 h-3.5 text-white" />
                        <span>Lançar até Jan/2027</span>
                      </button>
                    </div>
                  </div>

                  {/* Formulário para Adicionar Nova Tarefa à Empresa */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-900 block text-xs">
                      + Adicionar Nova Tarefa / Obrigação à Carteira Desta Empresa:
                    </span>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Título da Obrigação (ex: DAS, DCTFWeb, Folha...)"
                          value={novaTarefaTitulo}
                          onChange={e => setNovaTarefaTitulo(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={novaTarefaDepto}
                          onChange={e => setNovaTarefaDepto(e.target.value as Departamento)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        >
                          <option value="Fiscal">Fiscal</option>
                          <option value="Contábil">Contábil</option>
                          <option value="Pessoal">Pessoal / RH</option>
                          <option value="Societário">Societário</option>
                          <option value="Financeiro">Financeiro</option>
                          <option value="Geral">Geral</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="Dia limite"
                          value={novaTarefaDiaLimite}
                          onChange={e => setNovaTarefaDiaLimite(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          title="Dia limite de vencimento padrão"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={novaTarefaPeriodicidade}
                          onChange={e => setNovaTarefaPeriodicidade(e.target.value as Periodicidade)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                        >
                          <option value="Mensal">Mensal</option>
                          <option value="Trimestral">Trimestral</option>
                          <option value="Anual">Anual</option>
                          <option value="Eventual">Eventual</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-xs">
                        <input
                          type="checkbox"
                          checked={novaTarefaEhProcesso}
                          onChange={e => setNovaTarefaEhProcesso(e.target.checked)}
                          className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                        />
                        <span className="font-semibold">Definir como Processo (com passos/etapas de execução)</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          if (!novaTarefaTitulo.trim() || !clienteEditando) return;
                          const config: Omit<TarefaEmpresaConfig, 'id'> = {
                            titulo: novaTarefaTitulo.trim(),
                            departamento: novaTarefaDepto,
                            periodicidade: novaTarefaPeriodicidade,
                            dia_limite: novaTarefaDiaLimite,
                            eh_processo: novaTarefaEhProcesso,
                            etapas_padrao: novaTarefaEhProcesso ? [
                              { titulo: 'Coleta de documentos do cliente', ordem: 1, cobrar_whatsapp: true },
                              { titulo: 'Processamento e apuração', ordem: 2, cobrar_whatsapp: false },
                              { titulo: 'Envio de guias e fechamento', ordem: 3, cobrar_whatsapp: true }
                            ] : undefined,
                            ativo: true
                          };
                          adicionarTarefaEmpresa(clienteEditando.id, config);
                          setModalEditarCliente(prev => prev ? {
                            ...prev,
                            tarefas_empresa: [...(prev.tarefas_empresa || []), { ...config, id: `t-cfg-${Date.now()}` }]
                          } : null);
                          setNovaTarefaTitulo('');
                          setToastMsg(`✅ Obrigação adicionada à empresa com sucesso!`);
                          setTimeout(() => setToastMsg(null), 3000);
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Tarefa</span>
                      </button>
                    </div>
                  </div>

                  {/* Lista de Tarefas Configuradas */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-700 block text-xs">
                      Tarefas Ativas Cadastradas para {clienteEditando.nome} ({clienteEditando.tarefas_empresa?.length || 0}):
                    </span>

                    {(!clienteEditando.tarefas_empresa || clienteEditando.tarefas_empresa.length === 0) ? (
                      <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 italic text-xs">Nenhuma tarefa vinculada a esta empresa.</p>
                        <button
                          type="button"
                          onClick={() => {
                            sugerirTarefasPorRegime(clienteEditando.id);
                            const sugeridas = getTarefasPadraoPorRegime(clienteEditando.regime_tributario, clienteEditando.id);
                            setModalEditarCliente(prev => prev ? { ...prev, tarefas_empresa: sugeridas } : null);
                            setToastMsg(`🪄 Sugestões carregadas para ${clienteEditando.regime_tributario}!`);
                            setTimeout(() => setToastMsg(null), 3000);
                          }}
                          className="mt-2 px-3 py-1 bg-purple-100 text-purple-800 font-bold rounded-xl text-xs hover:bg-purple-200"
                        >
                          Carregar sugestões para {clienteEditando.regime_tributario}
                        </button>
                      </div>
                    ) : (
                      clienteEditando.tarefas_empresa.map((t, index) => (
                        <div
                          key={t.id || `t-emp-${index}-${t.titulo}`}
                          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-purple-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.departamento === 'Fiscal' ? 'bg-purple-100 text-purple-800' :
                              t.departamento === 'Pessoal' ? 'bg-amber-100 text-amber-800' :
                              t.departamento === 'Contábil' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {t.departamento}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>{t.titulo}</span>
                                {t.eh_processo && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    Processo ({t.etapas_padrao?.length || 3} etapas)
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Periodicidade: <strong>{t.periodicidade}</strong> | Vencimento padrão: <strong>Dia {t.dia_limite}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleExcluirTarefaEmpresa(clienteEditando.id, t, index);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                              title={`Excluir obrigação "${t.titulo}" desta empresa`}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ABA 3: DOCUMENTOS LEGAIS DA EMPRESA (UPLOAD MÚLTIPLO) */}
              {tabModalCliente === 'documentos_legais' && clienteEditando && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-700" />
                        <span>Documentos Legais & Permanentes da Empresa</span>
                      </h4>
                      <p className="text-[11px] text-indigo-700 mt-0.5">
                        Contrato Social, Inscrição Municipal, Inscrição Estadual, Cartão CNPJ e Alvarás. Ficam sempre disponíveis no Portal do Cliente.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => documentosLegaisInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Anexar Arquivo(s)</span>
                    </button>
                  </div>

                  {/* Input de Upload Múltiplo Oculto */}
                  <input
                    type="file"
                    multiple
                    ref={documentosLegaisInputRef}
                    onChange={e => handleUploadDocumentosLegais(e, clienteEditando.id)}
                    className="hidden"
                  />

                  {/* Seletor de Tipo de Documento Legal para Upload */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-900 block text-xs">
                      Selecionar Categoria do Documento Legal para Anexo:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        'Contrato Social / Requerimento',
                        'Inscrição Municipal (CCM)',
                        'Inscrição Estadual (CADESP)',
                        'Cartão CNPJ',
                        'Alvará de Funcionamento',
                        'Certificado Digital',
                        'Procuração RFB / e-CAC',
                        'Outros'
                      ].map(tipo => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setTipoDocLegal(tipo as TipoDocumentoLegal)}
                          className={`p-2 rounded-xl text-left font-semibold text-xs border transition-all ${
                            tipoDocLegal === tipo
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>

                    <div
                      onClick={() => documentosLegaisInputRef.current?.click()}
                      className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-white p-5 rounded-2xl text-center cursor-pointer transition-all hover:bg-indigo-50/20"
                    >
                      <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                      <p className="font-bold text-slate-900 text-xs">
                        Clique aqui para selecionar os arquivos (permite múltiplos de uma vez)
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Categoria selecionada: <strong>{tipoDocLegal}</strong> (PDF, JPG, PNG, DOCX)
                      </p>
                    </div>
                  </div>

                  {/* Lista de Documentos Legais Anexados */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-700 block text-xs">
                      Documentos Legais Cadastrados ({clienteEditando.documentos_legais?.length || 0}):
                    </span>

                    {(!clienteEditando.documentos_legais || clienteEditando.documentos_legais.length === 0) ? (
                      <p className="text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl">
                        Nenhum documento legal anexado ainda.
                      </p>
                    ) : (
                      clienteEditando.documentos_legais.map(doc => (
                        <div
                          key={doc.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-300 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs truncate">{doc.nome}</p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span className="font-bold text-indigo-700">{doc.tipo}</span>
                                <span>•</span>
                                <span>Tamanho: {doc.arquivo_tamanho || '250 KB'}</span>
                                <span>•</span>
                                <span>Enviado em: {doc.data_upload}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={doc.arquivo_conteudo || doc.arquivo_url || '#'}
                              download={doc.nome}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                              title="Baixar ou visualizar documento"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                removerDocumentoLegalCliente(clienteEditando.id, doc.id);
                                setModalEditarCliente(prev => prev ? {
                                  ...prev,
                                  documentos_legais: (prev.documentos_legais || []).filter(d => d.id !== doc.id)
                                } : null);
                                setToastMsg(`🗑️ Documento legal excluído.`);
                                setTimeout(() => setToastMsg(null), 3000);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                              title="Excluir documento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ABA 4: ACESSO AO PORTAL DO CLIENTE */}
              {tabModalCliente === 'acesso_portal' && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                    <Key className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-emerald-950">
                        Credenciais de Login no Portal do Cliente
                      </h4>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        O cliente fará login com este e-mail e senha no link <strong>/portal/cliente</strong>. 
                        Cada empresa só tem acesso aos seus próprios documentos, tarefas, calendário fiscal e guias.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          E-mail de Login do Cliente *
                        </label>
                        <input
                          type="email"
                          required
                          value={portalEmail}
                          onChange={e => setPortalEmail(e.target.value)}
                          placeholder="cliente@empresa.com.br"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700">Senha de Acesso *</label>
                          <button
                            type="button"
                            onClick={handleGerarSenhaAleatoria}
                            className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Gerar Senha</span>
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={mostrarSenha ? 'text' : 'password'}
                            required
                            value={portalSenha}
                            onChange={e => setPortalSenha(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={portalAtivo}
                          onChange={e => setPortalAtivo(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span className="font-bold text-slate-800 text-xs">
                          Acesso ao Portal Liberado (Ativo)
                        </span>
                      </label>

                      {modalEditarCliente && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopiarConviteWhatsApp(modalEditarCliente)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Convite (WhatsApp)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAcessarPortalDesteCliente(modalEditarCliente)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir Portal</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 5: CONTATOS WHATSAPP */}
              {tabModalCliente === 'contatos' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        Contatos de Notificação Simultânea (WhatsApp / Grupos)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        💡 Envie cobranças e guias para números individuais ou para o <strong>Grupo de WhatsApp</strong> da empresa!
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {contatosLista.map(ct => (
                      <div key={ct.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
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

                  <div className="grid grid-cols-12 gap-2 pt-2 border-t border-slate-200">
                    <div className="col-span-5">
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
                    <div className="col-span-2">
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
              )}
            </div>

            {/* Footer do Modal */}
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-[11px] text-slate-500">
                {modalEditarCliente ? `Empresa ID: ${modalEditarCliente.id.slice(0, 8)}...` : 'Cadastro fin.up'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalNovoCliente(false);
                    setModalEditarCliente(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={modalEditarCliente ? handleSalvarEdicaoCliente : handleSalvarNovoCliente}
                  className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs shadow-sm"
                >
                  {modalEditarCliente ? 'Salvar Alterações da Empresa' : 'Cadastrar Empresa'}
                </button>
              </div>
            </div>
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
