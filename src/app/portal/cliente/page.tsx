'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Folder,
  FileText,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Building,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  User,
  X,
  Key,
  Lock,
  LogOut,
  Calendar as CalendarIcon,
  DollarSign,
  AlertTriangle,
  FileCheck,
  CreditCard,
  Layers,
  Sparkles,
  Paperclip
} from 'lucide-react';
import {
  DocumentoPortalCliente,
  SolicitacaoPortalCliente,
  Departamento,
  Prioridade,
  Cliente,
  Tarefa,
  DocumentoLegalCliente
} from '@/types';
import { initialDocumentosPortal, initialSolicitacoesPortal, initialClientes, initialTarefas } from '@/lib/mockData';

// Documento Consolidado que combina Documentos do Portal + Anexos e Guias de Tarefas
interface DocumentoConsolidadoCliente {
  id: string;
  nome: string;
  departamento: Departamento;
  pasta: string;
  competencia: string;
  data_vencimento?: string;
  valor?: number;
  arquivo_url: string;
  arquivo_conteudo?: string;
  arquivo_tamanho?: string;
  created_at: string;
  origem: 'portal' | 'tarefa_guia' | 'tarefa_anexo' | 'etapa_processo';
  tarefa_id?: string;
  status_pagamento?: 'Pendente' | 'Pago' | 'Vencido';
}

function PortalClienteContent() {
  const searchParams = useSearchParams();
  const paramClienteId = searchParams.get('id') || '';

  // Clientes & Tarefas
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [tarefas, setTarefas] = useState<Tarefa[]>(initialTarefas);
  const [documentosPortal, setDocumentosPortal] = useState<DocumentoPortalCliente[]>(initialDocumentosPortal);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoPortalCliente[]>(initialSolicitacoesPortal);

  // Autenticação do Portal
  const [autenticado, setAutenticado] = useState(false);
  const [clienteLogadoId, setClienteLogadoId] = useState<string>('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginErro, setLoginErro] = useState<string | null>(null);

  // Navegação
  const [activeTab, setActiveTab] = useState<'documentos' | 'documentos_legais' | 'calendario' | 'solicitacoes' | 'upload'>('documentos');
  const [selectedDepto, setSelectedDepto] = useState<string>('todos');
  const [selectedCompetencia, setSelectedCompetencia] = useState<string>('todas');
  const [buscaDoc, setBuscaDoc] = useState<string>('');

  // Calendário de Guias e Vencimentos
  const [mesCalendario, setMesCalendario] = useState<number>(9); // 0 = Jan, 9 = Out
  const [anoCalendario, setAnoCalendario] = useState<number>(2026);
  const [diaSelecionadoCalendario, setDiaSelecionadoCalendario] = useState<number | null>(null);

  // Modal de Nova Solicitação
  const [modalNovaSolOpen, setModalNovaSolOpen] = useState(false);
  const [novoDeptoSol, setNovoDeptoSol] = useState<Departamento>('Fiscal');
  const [novoAssuntoSol, setNovoAssuntoSol] = useState('');
  const [novoDescricaoSol, setNovoDescricaoSol] = useState('');
  const [novoPrioridadeSol, setNovoPrioridadeSol] = useState<Prioridade>('Normal');
  const [arquivosSolAnexos, setArquivosSolAnexos] = useState<{ nome: string; conteudo: string; tamanho: string }[]>([]);

  // Feedback Upload Mensal
  const [arquivosUploadMensal, setArquivosUploadMensal] = useState<{ nome: string; tamanho: string }[]>([]);
  const [feedbackUploadMensal, setFeedbackUploadMensal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Carregar dados reais do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedClientes = localStorage.getItem('gestup_v2_clientes');
        let parsedClientes: Cliente[] = initialClientes;
        if (savedClientes) {
          const parsed = JSON.parse(savedClientes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedClientes = parsed;
            setClientes(parsed);
          }
        }

        const savedTarefas = localStorage.getItem('gestup_v2_tarefas');
        if (savedTarefas) {
          const parsed = JSON.parse(savedTarefas);
          if (Array.isArray(parsed) && parsed.length > 0) setTarefas(parsed);
        }

        const savedDocs = localStorage.getItem('gestup_v2_portal_documentos');
        if (savedDocs) {
          const parsed = JSON.parse(savedDocs);
          if (Array.isArray(parsed)) setDocumentosPortal(parsed);
        }

        const savedSols = localStorage.getItem('gestup_v2_portal_solicitacoes');
        if (savedSols) {
          const parsed = JSON.parse(savedSols);
          if (Array.isArray(parsed)) setSolicitacoes(parsed);
        }

        // Checar Sessão de Autenticação Salva
        const sessionAuth = sessionStorage.getItem('gestup_portal_cliente_auth') || localStorage.getItem('gestup_portal_cliente_auth');
        if (sessionAuth) {
          try {
            const authData = JSON.parse(sessionAuth);
            if (authData?.clienteId) {
              const cli = parsedClientes.find(c => c.id === authData.clienteId);
              if (cli) {
                setClienteLogadoId(cli.id);
                setAutenticado(true);
                return;
              }
            }
          } catch {}
        }

        // Se veio por query param ?id=... (ex: link direto ADM)
        if (paramClienteId) {
          const cli = parsedClientes.find(c => c.id === paramClienteId);
          if (cli) {
            setClienteLogadoId(cli.id);
            setAutenticado(true);
            sessionStorage.setItem('gestup_portal_cliente_auth', JSON.stringify({
              clienteId: cli.id,
              email: cli.portal_acesso?.email || cli.email,
              nome: cli.nome
            }));
            return;
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do portal do cliente:', err);
      }
    }
  }, [paramClienteId]);

  // Cliente atual logado
  const clienteAtual = useMemo(() => {
    return clientes.find(c => c.id === clienteLogadoId) || null;
  }, [clientes, clienteLogadoId]);

  // Submissão do Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErro(null);

    const emailLimpo = loginEmail.trim().toLowerCase();
    const senhaLimpa = loginSenha.trim();

    const cliEncontrado = clientes.find(c => {
      const emailCli = (c.portal_acesso?.email || c.email || '').toLowerCase().trim();
      const senhaCli = (c.portal_acesso?.senha || 'finup123').trim();
      return emailCli === emailLimpo && senhaCli === senhaLimpa;
    });

    if (!cliEncontrado) {
      setLoginErro('E-mail ou senha incorretos. Verifique com seu contador ou tente novamente.');
      return;
    }

    if (cliEncontrado.portal_acesso && cliEncontrado.portal_acesso.ativo === false) {
      setLoginErro('O acesso ao portal para esta empresa está temporariamente suspenso. Entre em contato com a contabilidade.');
      return;
    }

    // Sucesso no login
    setClienteLogadoId(cliEncontrado.id);
    setAutenticado(true);
    sessionStorage.setItem('gestup_portal_cliente_auth', JSON.stringify({
      clienteId: cliEncontrado.id,
      email: cliEncontrado.portal_acesso?.email || cliEncontrado.email,
      nome: cliEncontrado.nome,
      timestamp: new Date().toISOString()
    }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gestup_portal_cliente_auth');
    localStorage.removeItem('gestup_portal_cliente_auth');
    setAutenticado(false);
    setClienteLogadoId('');
    setLoginEmail('');
    setLoginSenha('');
    setLoginErro(null);
  };

  const handleAcessoRapidoTeste = (cli: Cliente) => {
    setClienteLogadoId(cli.id);
    setAutenticado(true);
    sessionStorage.setItem('gestup_portal_cliente_auth', JSON.stringify({
      clienteId: cli.id,
      email: cli.portal_acesso?.email || cli.email,
      nome: cli.nome,
      timestamp: new Date().toISOString()
    }));
  };

  // =========================================================================
  // SINCRONIZAÇÃO COMPLETA: DOCUMENTOS DAS TAREFAS POR COMPETÊNCIA E DEPARTAMENTO
  // "Tudo que for anexado nas tarefas de cada cliente, cai no app dele, dividido por competência, e por departamento."
  // =========================================================================
  const todosDocumentosConsolidados = useMemo(() => {
    if (!clienteAtual) return [];

    const consolidados: DocumentoConsolidadoCliente[] = [];

    // 1. Documentos diretos do Portal do Cliente
    documentosPortal
      .filter(doc => (doc.cliente_id === 'todos' || doc.cliente_id === clienteAtual.id) && doc.visivel_cliente !== false)
      .forEach(doc => {
        consolidados.push({
          id: `portal-${doc.id}`,
          nome: doc.nome,
          departamento: doc.departamento,
          pasta: doc.pasta || 'Documentos Fiscais & Guias',
          competencia: doc.competencia || '10/2026',
          data_vencimento: doc.data_vencimento,
          arquivo_url: doc.arquivo_url,
          arquivo_conteudo: doc.arquivo_conteudo,
          arquivo_tamanho: doc.arquivo_tamanho || '320 KB',
          created_at: doc.created_at,
          origem: 'portal'
        });
      });

    // 2. Guias e Anexos de Tarefas do Cliente
    tarefas
      .filter(t => t.cliente_id === clienteAtual.id)
      .forEach(tarefa => {
        // Se a tarefa possui Guia de Pagamento (oficial)
        if (tarefa.guia_pagamento) {
          const gp = tarefa.guia_pagamento;
          const urlGuia = gp.arquivo_url || `/portal/guia?id=${tarefa.id}&arquivo=${encodeURIComponent(gp.arquivo_nome || 'Guia.pdf')}&comp=${tarefa.competencia}&cli=${encodeURIComponent(clienteAtual.nome)}&venc=${gp.data_vencimento || ''}&val=${gp.valor || ''}&tipo=${encodeURIComponent(tarefa.titulo)}`;

          consolidados.push({
            id: `guia-${tarefa.id}`,
            nome: gp.arquivo_nome ? `Guia: ${gp.arquivo_nome}` : `Guia de Pagamento - ${tarefa.titulo}`,
            departamento: tarefa.categoria,
            pasta: 'Guias de Tributos & Obrigações',
            competencia: tarefa.competencia || '10/2026',
            data_vencimento: gp.data_vencimento || tarefa.data_prazo_legal,
            valor: gp.valor,
            arquivo_url: urlGuia,
            arquivo_conteudo: gp.arquivo_conteudo,
            arquivo_tamanho: gp.arquivo_tamanho || '240 KB',
            created_at: gp.data_envio || tarefa.created_at,
            origem: 'tarefa_guia',
            tarefa_id: tarefa.id,
            status_pagamento: tarefa.status === 'Concluída' ? 'Pago' : 'Pendente'
          });
        }

        // Se a tarefa possui Arquivos Anexos Gerais
        if (tarefa.arquivos_anexos && tarefa.arquivos_anexos.length > 0) {
          tarefa.arquivos_anexos.forEach((arq, idx) => {
            consolidados.push({
              id: `tar-anx-${tarefa.id}-${arq.id || idx}`,
              nome: arq.nome,
              departamento: tarefa.categoria,
              pasta: tarefa.categoria === 'Pessoal' ? 'Folha de Pagamento & Holerites' : (tarefa.categoria === 'Fiscal' ? 'Impostos & Livros Fiscais' : 'Relatórios Contábeis'),
              competencia: tarefa.competencia || '10/2026',
              arquivo_url: arq.url,
              arquivo_conteudo: arq.conteudo,
              arquivo_tamanho: arq.tamanho || '300 KB',
              created_at: arq.data_upload || tarefa.created_at,
              origem: 'tarefa_anexo',
              tarefa_id: tarefa.id
            });
          });
        }

        // Se a tarefa for processo e tiver arquivos nas etapas ou retornos
        if (tarefa.etapas_processo && tarefa.etapas_processo.length > 0) {
          tarefa.etapas_processo.forEach(etapa => {
            (etapa.arquivos || []).forEach((arq, i) => {
              consolidados.push({
                id: `etp-anx-${tarefa.id}-${etapa.id}-${i}`,
                nome: `${etapa.titulo}: ${arq.nome}`,
                departamento: tarefa.categoria,
                pasta: 'Processos & Etapas',
                competencia: tarefa.competencia || '10/2026',
                arquivo_url: arq.url,
                arquivo_conteudo: arq.conteudo,
                arquivo_tamanho: arq.tamanho || '200 KB',
                created_at: arq.data_upload || tarefa.created_at,
                origem: 'etapa_processo',
                tarefa_id: tarefa.id
              });
            });

            (etapa.retornos_cliente || []).forEach((ret, rIdx) => {
              (ret.arquivos || []).forEach((rArq, raIdx) => {
                consolidados.push({
                  id: `ret-anx-${tarefa.id}-${etapa.id}-${rIdx}-${raIdx}`,
                  nome: `Comprovante Enviado: ${rArq.nome}`,
                  departamento: tarefa.categoria,
                  pasta: 'Comprovantes & Retornos Enviados',
                  competencia: tarefa.competencia || '10/2026',
                  arquivo_url: rArq.url,
                  arquivo_conteudo: rArq.conteudo,
                  arquivo_tamanho: rArq.tamanho || '180 KB',
                  created_at: ret.data || tarefa.created_at,
                  origem: 'etapa_processo',
                  tarefa_id: tarefa.id
                });
              });
            });
          });
        }
      });

    return consolidados;
  }, [clienteAtual, documentosPortal, tarefas]);

  // Lista de competências disponíveis no acervo
  const competenciasDisponiveis = useMemo(() => {
    const setComp = new Set<string>();
    todosDocumentosConsolidados.forEach(d => {
      if (d.competencia) setComp.add(d.competencia);
    });
    setComp.add('10/2026');
    setComp.add('09/2026');
    setComp.add('08/2026');
    return Array.from(setComp);
  }, [todosDocumentosConsolidados]);

  // Documentos filtrados por departamento, competência e busca
  const documentosFiltrados = useMemo(() => {
    return todosDocumentosConsolidados.filter(doc => {
      const matchDepto = selectedDepto === 'todos' || doc.departamento === selectedDepto;
      const matchComp = selectedCompetencia === 'todas' || doc.competencia === selectedCompetencia;
      const matchBusca = buscaDoc.trim() === '' ||
        doc.nome.toLowerCase().includes(buscaDoc.toLowerCase()) ||
        doc.pasta.toLowerCase().includes(buscaDoc.toLowerCase());
      return matchDepto && matchComp && matchBusca;
    });
  }, [todosDocumentosConsolidados, selectedDepto, selectedCompetencia, buscaDoc]);

  // Agrupamento por pasta
  const pastasAgrupadas = useMemo(() => {
    return documentosFiltrados.reduce((acc, doc) => {
      const pastaKey = doc.pasta || 'Geral';
      if (!acc[pastaKey]) acc[pastaKey] = [];
      acc[pastaKey].push(doc);
      return acc;
    }, {} as Record<string, DocumentoConsolidadoCliente[]>);
  }, [documentosFiltrados]);

  // Documentos Legais da Empresa
  const documentosLegaisEmpresa = useMemo(() => {
    return clienteAtual?.documentos_legais || [];
  }, [clienteAtual]);

  // Guias de Pagamento para o Calendário & Alertas de Vencimento
  const guiasParaCalendario = useMemo(() => {
    return todosDocumentosConsolidados.filter(d => d.data_vencimento || d.origem === 'tarefa_guia');
  }, [todosDocumentosConsolidados]);

  // Mês e dias do calendário
  const diasDoMesCalendario = useMemo(() => {
    const totalDias = new Date(anoCalendario, mesCalendario + 1, 0).getDate();
    const primeiroDiaSemana = new Date(anoCalendario, mesCalendario, 1).getDay(); // 0 = Dom
    return { totalDias, primeiroDiaSemana };
  }, [mesCalendario, anoCalendario]);

  const nomeMesCalendario = useMemo(() => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[mesCalendario]} de ${anoCalendario}`;
  }, [mesCalendario, anoCalendario]);

  // Guias específicas do mês do calendário
  const guiasDoMesCalendario = useMemo(() => {
    const mesFormatado = String(mesCalendario + 1).padStart(2, '0');
    return guiasParaCalendario.filter(g => {
      if (!g.data_vencimento) return false;
      const [ano, mes] = g.data_vencimento.split('-');
      return ano === String(anoCalendario) && mes === mesFormatado;
    });
  }, [guiasParaCalendario, mesCalendario, anoCalendario]);

  // Solicitações do cliente
  const solicitacoesDoCliente = solicitacoes.filter(s => s.cliente_id === clienteAtual?.id);

  // Criar nova solicitação com suporte a múltiplos anexos
  const handleCriarSolicitacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoAssuntoSol.trim() || !novoDescricaoSol.trim() || !clienteAtual) return;

    const nova: SolicitacaoPortalCliente = {
      id: `sol-${Date.now()}`,
      cliente_id: clienteAtual.id,
      cliente_nome: clienteAtual.nome,
      departamento: novoDeptoSol,
      assunto: novoAssuntoSol.trim(),
      descricao: novoDescricaoSol.trim(),
      prioridade: novoPrioridadeSol,
      status: 'Pendente',
      responsavel: clienteAtual.responsavel || 'Equipe fin.up',
      arquivos_anexos: arquivosSolAnexos.map((a, i) => ({
        id: `arq-sol-${Date.now()}-${i}`,
        nome: a.nome,
        url: a.conteudo,
        conteudo: a.conteudo,
        tamanho: a.tamanho,
        data_upload: new Date().toISOString().split('T')[0]
      })),
      created_at: new Date().toISOString().split('T')[0]
    };

    const atualizadas = [nova, ...solicitacoes];
    setSolicitacoes(atualizadas);
    try {
      localStorage.setItem('gestup_v2_portal_solicitacoes', JSON.stringify(atualizadas));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    setModalNovaSolOpen(false);
    setNovoAssuntoSol('');
    setNovoDescricaoSol('');
    setArquivosSolAnexos([]);
    setToastMsg('✅ Solicitação enviada com sucesso! A equipe da fin.up foi notificada.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Upload Múltiplo para Nova Solicitação
  const handleSelecionarArquivosSolicitacao = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const tamanhoFormatado = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setArquivosSolAnexos(prev => [
            ...prev,
            {
              nome: file.name,
              conteudo: reader.result as string,
              tamanho: tamanhoFormatado
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Upload Múltiplo de Documentos Mensais (Extratos, Notas)
  const handleUploadMensalMultiplo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const novos: { nome: string; tamanho: string }[] = [];
    Array.from(files).forEach(f => {
      const tam = f.size > 1024 * 1024
        ? `${(f.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(f.size / 1024)} KB`;
      novos.push({ nome: f.name, tamanho: tam });
    });

    setArquivosUploadMensal(prev => [...prev, ...novos]);
    setFeedbackUploadMensal(true);
    setToastMsg(`📤 ${files.length} documento(s) enviado(s) ao escritório com sucesso!`);
    setTimeout(() => {
      setFeedbackUploadMensal(false);
      setToastMsg(null);
    }, 4500);

    e.target.value = '';
  };

  // =========================================================================
  // TELA DE LOGIN DO PORTAL DO CLIENTE (SE NÃO ESTIVER LOGADO)
  // "onde será logado via E-mail e senha a ser cadastrado por MIM adm do sistema previamente."
  // =========================================================================
  if (!autenticado || !clienteAtual) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Brand */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center mb-3 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Portal do Cliente</h1>
            <p className="text-xs text-blue-100 font-medium mt-1">fin.up Contabilidade & Gestão Empresarial</p>
          </div>

          {/* Form de Autenticação */}
          <form onSubmit={handleLogin} className="p-8 space-y-4">
            {loginErro && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>{loginErro}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                E-mail de Acesso da Empresa
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="seu-email@empresa.com.br"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full pl-3.5 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Senha</label>
                <span className="text-[10px] text-slate-400">Cadastrada pelo escritório</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginSenha}
                  onChange={e => setLoginSenha(e.target.value)}
                  className="w-full pl-3.5 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>Entrar no Portal</span>
            </button>

            {/* Teste Rápido / Atalhos de Demonstração */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Atalhos Rápidos de Acesso (Demonstração):
              </span>
              <div className="flex flex-col gap-1.5">
                {clientes.slice(0, 3).map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleAcessoRapidoTeste(c)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-900 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span className="truncate">{c.nome}</span>
                    <span className="text-[10px] text-blue-600 font-bold ml-2 shrink-0">Entrar &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TELA LOGADA DO PORTAL DO CLIENTE (PERSONALIZADA PARA A EMPRESA)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-xs font-semibold">{toastMsg}</p>
        </div>
      )}

      {/* Header Corporativo do Cliente */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm">{clienteAtual.nome}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {clienteAtual.regime_tributario}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                CNPJ: {clienteAtual.cnpj_cpf} • Portal do Cliente fin.up
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalNovaSolOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Solicitação</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-all"
              title="Encerrar sessão no Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegação das Abas do Portal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex items-center gap-1 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('documentos')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'documentos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Documentos & Competências ({documentosFiltrados.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('documentos_legais')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'documentos_legais'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Documentos Legais ({documentosLegaisEmpresa.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calendario')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'calendario'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendário de Pagamentos & Guias</span>
          </button>

          <button
            onClick={() => setActiveTab('solicitacoes')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'solicitacoes'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Solicitações ({solicitacoesDoCliente.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Envio de Extratos & Documentos</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* =================================================================== */}
        {/* ABA 1: DOCUMENTOS & TAREFAS POR COMPETÊNCIA E DEPARTAMENTO */}
        {/* =================================================================== */}
        {activeTab === 'documentos' && (
          <div className="space-y-6">
            {/* Filtros de Competência e Departamento */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Seletor de Competência */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">Competência:</span>
                  <select
                    value={selectedCompetencia}
                    onChange={e => setSelectedCompetencia(e.target.value)}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white text-blue-700"
                  >
                    <option value="todas">Todas as Competências</option>
                    {competenciasDisponiveis.map(comp => (
                      <option key={comp} value={comp}>
                        Mês {comp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Departamento */}
                <div className="flex items-center gap-1 flex-wrap">
                  {['todos', 'Fiscal', 'Contábil', 'Pessoal', 'Societário', 'Financeiro'].map(depto => (
                    <button
                      key={depto}
                      onClick={() => setSelectedDepto(depto)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedDepto === depto
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {depto === 'todos' ? 'Todos Deptos' : depto}
                    </button>
                  ))}
                </div>
              </div>

              {/* Busca por Nome do Arquivo */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar documento ou guia..."
                  value={buscaDoc}
                  onChange={e => setBuscaDoc(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
              </div>
            </div>

            {/* Pastas & Documentos Agrupados */}
            {Object.keys(pastasAgrupadas).length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 text-sm">Nenhum documento encontrado</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Não há documentos disponíveis para os filtros selecionados.
                </p>
              </div>
            ) : (
              Object.entries(pastasAgrupadas).map(([pastaNome, docs]) => (
                <div key={pastaNome} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      {pastaNome} ({docs.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {docs.map(doc => {
                      const isGuia = doc.origem === 'tarefa_guia' || !!doc.data_vencimento;

                      return (
                        <div
                          key={doc.id}
                          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between gap-3 group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                doc.departamento === 'Fiscal' ? 'bg-purple-100 text-purple-800' :
                                doc.departamento === 'Pessoal' ? 'bg-amber-100 text-amber-800' :
                                doc.departamento === 'Contábil' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {doc.departamento}
                              </span>

                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                {doc.competencia}
                              </span>
                            </div>

                            <div>
                              <p className="font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors line-clamp-2">
                                {doc.nome}
                              </p>
                              {doc.valor && (
                                <p className="text-sm font-bold text-emerald-600 mt-1">
                                  R$ {doc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-500 space-y-0.5">
                              {doc.data_vencimento && (
                                <p className="flex items-center gap-1 font-semibold text-slate-700">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Vencimento: {doc.data_vencimento.split('-').reverse().join('/')}</span>
                                </p>
                              )}
                              <p className="text-[10px] text-slate-400">
                                Tamanho: {doc.arquivo_tamanho || '250 KB'}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">
                              {doc.origem === 'tarefa_guia' ? '⚡ Guia do Escritório' : 'Disponibilizado no app'}
                            </span>

                            <a
                              href={doc.arquivo_conteudo || doc.arquivo_url}
                              download={doc.nome}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{isGuia ? 'Acessar Guia' : 'Baixar'}</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 2: DOCUMENTOS LEGAIS DA EMPRESA */}
        {/* =================================================================== */}
        {activeTab === 'documentos_legais' && (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-3xl flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-700" />
                  <span>Documentos Institucionais & Legais da Empresa</span>
                </h2>
                <p className="text-xs text-indigo-800 mt-1">
                  Contrato Social, Inscrição Municipal, Inscrição Estadual, Cartão CNPJ e Alvarás. Sempre atualizados e disponíveis para download imediato.
                </p>
              </div>
            </div>

            {documentosLegaisEmpresa.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 text-sm">Nenhum documento legal cadastrado</h3>
                <p className="text-xs text-slate-500 mt-1">
                  O escritório ainda não anexou os documentos constitutivos da sua empresa.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentosLegaisEmpresa.map(doc => (
                  <div
                    key={doc.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          {doc.tipo}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs mt-1.5 line-clamp-2">
                          {doc.nome}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Enviado em: {doc.data_upload} • Tamanho: {doc.arquivo_tamanho || '300 KB'}
                        </p>
                      </div>
                    </div>

                    <a
                      href={doc.arquivo_conteudo || doc.arquivo_url || '#'}
                      download={doc.nome}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Documento Legal</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 3: CALENDÁRIO COM ALERTAS DE VENCIMENTO & LINKS PARA PAGAMENTO */}
        {/* "onde tiver guia para pagamento, haverá um alerta de vencimento, com a possibilidade de acessar a Guia via link para pagamento." */}
        {/* =================================================================== */}
        {activeTab === 'calendario' && (
          <div className="space-y-6">
            {/* Topo do Calendário com Navegação de Mês */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-base">{nomeMesCalendario}</h2>
                  <p className="text-xs text-slate-500">
                    Acompanhe todos os tributos, guias e compromissos fiscais do mês com alertas de vencimento
                  </p>
                </div>
              </div>

              {/* Botões de Mudar Mês */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (mesCalendario === 0) {
                      setMesCalendario(11);
                      setAnoCalendario(anoCalendario - 1);
                    } else {
                      setMesCalendario(mesCalendario - 1);
                    }
                    setDiaSelecionadoCalendario(null);
                  }}
                  className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all"
                  title="Mês Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setMesCalendario(9); // Outubro 2026
                    setAnoCalendario(2026);
                    setDiaSelecionadoCalendario(null);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-100"
                >
                  Mês Atual
                </button>
                <button
                  onClick={() => {
                    if (mesCalendario === 11) {
                      setMesCalendario(0);
                      setAnoCalendario(anoCalendario + 1);
                    } else {
                      setMesCalendario(mesCalendario + 1);
                    }
                    setDiaSelecionadoCalendario(null);
                  }}
                  className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all"
                  title="Próximo Mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid do Calendário Mensal */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6 space-y-4">
              {/* Dias da Semana */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                <span>Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
              </div>

              {/* Dias do Mês */}
              <div className="grid grid-cols-7 gap-2">
                {/* Células vazias do início da semana */}
                {Array.from({ length: diasDoMesCalendario.primeiroDiaSemana }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[90px] rounded-2xl bg-slate-50/40 p-2 opacity-30" />
                ))}

                {/* Dias do Mês (1 ao último dia) */}
                {Array.from({ length: diasDoMesCalendario.totalDias }).map((_, i) => {
                  const diaNum = i + 1;
                  const diaFormatado = String(diaNum).padStart(2, '0');
                  const mesFormatado = String(mesCalendario + 1).padStart(2, '0');
                  const dataStr = `${anoCalendario}-${mesFormatado}-${diaFormatado}`;

                  // Guias deste dia
                  const guiasDoDia = guiasDoMesCalendario.filter(g => g.data_vencimento === dataStr);
                  const temGuias = guiasDoDia.length > 0;
                  const isSelecionado = diaSelecionadoCalendario === diaNum;

                  return (
                    <div
                      key={`dia-${diaNum}`}
                      onClick={() => setDiaSelecionadoCalendario(diaNum)}
                      className={`min-h-[90px] rounded-2xl p-2.5 border transition-all flex flex-col justify-between cursor-pointer ${
                        temGuias
                          ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50 shadow-2xs'
                          : 'border-slate-100 hover:bg-slate-50'
                      } ${isSelecionado ? 'ring-2 ring-purple-600 bg-purple-50/50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${temGuias ? 'text-amber-900 font-extrabold' : 'text-slate-700'}`}>
                          {diaNum}
                        </span>
                        {temGuias && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        )}
                      </div>

                      {/* Mini badges das guias no dia */}
                      <div className="space-y-1 my-1">
                        {guiasDoDia.map(g => (
                          <div
                            key={g.id}
                            className="p-1 rounded-lg bg-amber-500 text-white font-bold text-[9px] truncate shadow-2xs"
                            title={`${g.nome} - Vencimento dia ${diaNum}`}
                          >
                            {g.nome.replace('Guia de Pagamento - ', '').slice(0, 15)}...
                          </div>
                        ))}
                      </div>

                      <div className="text-[9px] text-slate-400">
                        {temGuias ? `${guiasDoDia.length} Guia(s)` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ALERTAS DE VENCIMENTO DO MÊS COM LINKS DIRETOS PARA PAGAMENTO */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Alertas de Vencimento de Guias de {nomeMesCalendario} ({guiasDoMesCalendario.length})
                  </h3>
                </div>
                {diaSelecionadoCalendario && (
                  <button
                    onClick={() => setDiaSelecionadoCalendario(null)}
                    className="text-xs text-purple-700 font-bold hover:underline"
                  >
                    Ver todas do mês
                  </button>
                )}
              </div>

              {guiasDoMesCalendario.length === 0 ? (
                <p className="text-slate-400 italic text-center py-6 text-xs">
                  Nenhum vencimento de guia de imposto registrado para este mês.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guiasDoMesCalendario
                    .filter(g => !diaSelecionadoCalendario || g.data_vencimento?.endsWith(`-${String(diaSelecionadoCalendario).padStart(2, '0')}`))
                    .map(guia => {
                      const dataVencFormatada = guia.data_vencimento
                        ? guia.data_vencimento.split('-').reverse().join('/')
                        : '20/10/2026';

                      return (
                        <div
                          key={guia.id}
                          className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/30 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-card transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                                <DollarSign className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900">
                                  {guia.departamento} • Vencimento Oficial
                                </span>
                                <h4 className="font-bold text-slate-900 text-xs mt-1">
                                  {guia.nome}
                                </h4>
                              </div>
                            </div>

                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{dataVencFormatada}</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Valor a Pagar:</span>
                              <span className="text-base font-bold text-emerald-700">
                                {guia.valor ? `R$ ${guia.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Conforme Guia'}
                              </span>
                            </div>

                            <a
                              href={guia.arquivo_conteudo || guia.arquivo_url}
                              download={guia.nome}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Acessar Guia para Pagamento</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 4: SOLICITAÇÕES AO ESCRITÓRIO */}
        {/* =================================================================== */}
        {activeTab === 'solicitacoes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm text-slate-900">Suas Solicitações & Chamados</h2>
                <p className="text-xs text-slate-500">
                  Acompanhe pedidos de admissão, férias, certidões ou esclarecimentos com a equipe fin.up
                </p>
              </div>

              <button
                onClick={() => setModalNovaSolOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Solicitação</span>
              </button>
            </div>

            {solicitacoesDoCliente.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 text-sm">Nenhuma solicitação aberta</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Precisa de uma certidão, alteração ou esclarecimento? Abra um chamado diretamente aqui!
                </p>
                <button
                  onClick={() => setModalNovaSolOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Abrir Primeira Solicitação
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitacoesDoCliente.map(sol => (
                  <div
                    key={sol.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {sol.departamento}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sol.status === 'Concluída' ? 'bg-emerald-100 text-emerald-800' :
                            sol.status === 'Em Andamento' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {sol.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{sol.assunto}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sol.descricao}</p>
                      </div>

                      <span className="text-[10px] text-slate-400 shrink-0">{sol.created_at}</span>
                    </div>

                    {/* Resposta do Escritório */}
                    {sol.resposta_escritorio && (
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
                        <span className="text-[10px] font-bold text-blue-900 uppercase">Resposta fin.up Contabilidade:</span>
                        <p className="text-xs text-blue-950 font-medium">{sol.resposta_escritorio}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* ABA 5: ENVIO DE EXTRATOS & DOCUMENTOS MENSAIS (COM MULTIPLE) */}
        {/* =================================================================== */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Envio Mensal de Extratos Bancários (OFX/PDF) e Notas Fiscais</span>
              </h2>
              <p className="text-xs text-slate-500">
                Envie seus extratos mensais, comprovantes de pagamento e arquivos XML/PDF diretamente para o time contábil da fin.up. Você pode selecionar múltiplos arquivos de uma só vez!
              </p>

              <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 p-8 rounded-3xl text-center cursor-pointer relative transition-all">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.ofx,.xml,.xlsx,.csv,image/png,image/jpeg"
                  onChange={handleUploadMensalMultiplo}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <p className="font-bold text-slate-900 text-sm">
                  Clique ou arraste seus arquivos aqui (Múltiplo)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Suporta arquivos OFX, PDF, XML de Notas, Excel e Imagens de Comprovantes
                </p>
              </div>

              {arquivosUploadMensal.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="font-bold text-xs text-slate-700 block">Arquivos enviados recentemente:</span>
                  <div className="space-y-1.5">
                    {arquivosUploadMensal.map((arq, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium text-slate-800">{arq.nome}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{arq.tamanho}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Nova Solicitação (com upload múltiplo) */}
      {modalNovaSolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Abrir Nova Solicitação ao Escritório</h3>
              <button onClick={() => setModalNovaSolOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarSolicitacao} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departamento *</label>
                  <select
                    value={novoDeptoSol}
                    onChange={e => setNovoDeptoSol(e.target.value as Departamento)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Fiscal">Fiscal (Impostos, Notas)</option>
                    <option value="Pessoal">Pessoal / RH (Funcionários, Férias)</option>
                    <option value="Contábil">Contábil (Balanço, DRE)</option>
                    <option value="Societário">Societário (Alterações, Alvará)</option>
                    <option value="Financeiro">Financeiro / BPO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={novoPrioridadeSol}
                    onChange={e => setNovoPrioridadeSol(e.target.value as Prioridade)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assunto da Demanda *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Solicitação de Admissão, Emissão de CND Federal, Dúvida Fiscal..."
                  value={novoAssuntoSol}
                  onChange={e => setNovoAssuntoSol(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva aqui sua necessidade com o máximo de detalhes..."
                  value={novoDescricaoSol}
                  onChange={e => setNovoDescricaoSol(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {/* Anexos Múltiplos */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Anexar Documentos / Comprovantes (Múltiplo):</label>
                <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl text-center relative cursor-pointer hover:bg-slate-50">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={handleSelecionarArquivosSolicitacao}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <span className="font-semibold text-slate-700 text-xs">Clique para selecionar arquivos</span>
                </div>

                {arquivosSolAnexos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {arquivosSolAnexos.map((arq, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                        <span>{arq.nome} ({arq.tamanho})</span>
                        <button
                          type="button"
                          onClick={() => setArquivosSolAnexos(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaSolOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Enviar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortalClientePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Carregando Portal do Cliente...</div>}>
      <PortalClienteContent />
    </Suspense>
  );
}
