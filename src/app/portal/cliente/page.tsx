'use client';

import React, { Suspense, useState, useEffect } from 'react';
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
  User,
  X
} from 'lucide-react';
import { DocumentoPortalCliente, SolicitacaoPortalCliente, Departamento, Prioridade } from '@/types';
import { initialDocumentosPortal, initialSolicitacoesPortal, initialClientes } from '@/lib/mockData';

function PortalClienteContent() {
  const searchParams = useSearchParams();
  const paramClienteId = searchParams.get('id') || '';

  // Clientes para simulação ou login
  const [clientes, setClientes] = useState(initialClientes);
  const [selectedClienteId, setSelectedClienteId] = useState(paramClienteId || initialClientes[0]?.id || '');
  
  // Documentos & Solicitações
  const [documentos, setDocumentos] = useState<DocumentoPortalCliente[]>(initialDocumentosPortal);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoPortalCliente[]>(initialSolicitacoesPortal);

  // Navegação
  const [activeTab, setActiveTab] = useState<'documentos' | 'solicitacoes' | 'upload'>('documentos');
  const [selectedDepto, setSelectedDepto] = useState<string>('todos');
  const [buscaDoc, setBuscaDoc] = useState<string>('');

  // Modal de Nova Solicitação
  const [modalNovaSolOpen, setModalNovaSolOpen] = useState(false);
  const [novoDeptoSol, setNovoDeptoSol] = useState<Departamento>('Fiscal');
  const [novoAssuntoSol, setNovoAssuntoSol] = useState('');
  const [novoDescricaoSol, setNovoDescricaoSol] = useState('');
  const [novoPrioridadeSol, setNovoPrioridadeSol] = useState<Prioridade>('Normal');
  const [arquivosSolAnexos, setArquivosSolAnexos] = useState<{ nome: string; conteudo: string; tamanho: string }[]>([]);

  // Feedback Upload Mensal
  const [feedbackUploadMensal, setFeedbackUploadMensal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Carregar dados reais do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedClientes = localStorage.getItem('gestup_v2_clientes');
        if (savedClientes) {
          const parsed = JSON.parse(savedClientes);
          if (Array.isArray(parsed) && parsed.length > 0) setClientes(parsed);
        }

        const savedDocs = localStorage.getItem('gestup_v2_portal_documentos');
        if (savedDocs) {
          const parsed = JSON.parse(savedDocs);
          if (Array.isArray(parsed)) setDocumentos(parsed);
        }

        const savedSols = localStorage.getItem('gestup_v2_portal_solicitacoes');
        if (savedSols) {
          const parsed = JSON.parse(savedSols);
          if (Array.isArray(parsed)) setSolicitacoes(parsed);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do portal do cliente:', err);
      }
    }
  }, []);

  const clienteAtual = clientes.find(c => c.id === selectedClienteId) || clientes[0];

  // Documentos visíveis do cliente filtrados por departamento
  const documentosDoCliente = documentos.filter(doc => {
    const matchCliente = doc.cliente_id === 'todos' || doc.cliente_id === clienteAtual?.id;
    const matchDepto = selectedDepto === 'todos' || doc.departamento === selectedDepto;
    const matchBusca = buscaDoc.trim() === '' || 
      doc.nome.toLowerCase().includes(buscaDoc.toLowerCase()) || 
      doc.pasta.toLowerCase().includes(buscaDoc.toLowerCase());
    return matchCliente && matchDepto && matchBusca && doc.visivel_cliente !== false;
  });

  // Agrupar documentos por pasta
  const pastasAgrupadas = documentosDoCliente.reduce((acc, doc) => {
    const pastaKey = doc.pasta || 'Geral';
    if (!acc[pastaKey]) acc[pastaKey] = [];
    acc[pastaKey].push(doc);
    return acc;
  }, {} as Record<string, DocumentoPortalCliente[]>);

  // Solicitações do cliente
  const solicitacoesDoCliente = solicitacoes.filter(s => s.cliente_id === clienteAtual?.id);

  // Salvar nova solicitação
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
    setToastMsg('✅ Solicitação aberta com sucesso! A equipe fin.up foi notificada.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Upload simulado de extratos mensais
  const handleUploadMensal = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFeedbackUploadMensal(true);
      setToastMsg('✅ Documentos recebidos com sucesso! Nossa equipe iniciará a conciliação.');
      setTimeout(() => {
        setFeedbackUploadMensal(false);
        setToastMsg(null);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Topo do Portal do Cliente */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-sm shrink-0">
              <Image
                src="/logo.png"
                alt="Logo fin.up"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Portal Exclusivo do Cliente
                </span>
              </div>
              <h1 className="text-base font-bold text-white leading-tight">fin.up consultoria</h1>
            </div>
          </div>

          {/* Selecionar Empresa / Visualizar como */}
          <div className="flex items-center gap-2.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium pl-2">Empresa:</span>
            <select
              value={selectedClienteId}
              onChange={e => setSelectedClienteId(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-semibold focus:outline-none"
            >
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome} ({c.regime_tributario})</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-600 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6 flex-1">
        {/* Banner do Cliente */}
        {clienteAtual && (
          <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xl shrink-0">
                {clienteAtual.nome.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{clienteAtual.nome}</h2>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 mt-1">
                  <span>CNPJ: {clienteAtual.cnpj_cpf}</span>
                  <span>•</span>
                  <span className="text-blue-300 font-semibold">{clienteAtual.regime_tributario}</span>
                  <span>•</span>
                  <span>Consultor: <strong className="text-emerald-400">{clienteAtual.responsavel}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 text-emerald-300 text-xs font-bold border border-emerald-800/70">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Situação Fiscal Regular</span>
              </span>
              <button
                onClick={() => setModalNovaSolOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Solicitação</span>
              </button>
            </div>
          </div>
        )}

        {/* Abas de Navegação do Portal */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('documentos')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'documentos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>📁 Meus Documentos & Pastas ({documentosDoCliente.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('solicitacoes')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'solicitacoes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>📝 Solicitações ao Escritório ({solicitacoesDoCliente.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>📤 Envio de Extratos & Despesas</span>
          </button>
        </div>

        {/* ================= ABA 1: DOCUMENTOS & PASTAS ================= */}
        {activeTab === 'documentos' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Filtros por Departamento & Busca */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-semibold mr-1">Departamento:</span>
                {['todos', 'Fiscal', 'Pessoal/RH', 'Contábil', 'Societário', 'Financeiro'].map(depto => (
                  <button
                    key={depto}
                    onClick={() => setSelectedDepto(depto)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedDepto === depto
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {depto === 'todos' ? 'Todos os Departamentos' : depto}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar documento ou pasta..."
                  value={buscaDoc}
                  onChange={e => setBuscaDoc(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Listagem em Pastas por Departamento */}
            {Object.keys(pastasAgrupadas).length === 0 ? (
              <div className="p-12 text-center bg-slate-800/40 rounded-3xl border border-slate-700/80 text-slate-400 space-y-2">
                <Folder className="w-10 h-10 mx-auto text-slate-600" />
                <p className="font-bold text-sm">Nenhum documento encontrado neste departamento.</p>
                <p className="text-xs text-slate-500">
                  Os documentos disponibilizados pela equipe fin.up aparecerão organizados aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(pastasAgrupadas).map(([pastaNome, docs]) => (
                  <div key={pastaNome} className="bg-slate-800/60 rounded-3xl p-5 border border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Folder className="w-5 h-5 text-blue-400" />
                        <h3 className="font-bold text-sm text-white">{pastaNome}</h3>
                        <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                          {docs.length} arquivo(s)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{docs[0]?.departamento}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {docs.map(doc => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-3 group shadow-2xs"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5">
                                <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-900 shrink-0 mt-0.5">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">
                                    {doc.nome}
                                  </h4>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                    {doc.competencia && <span>Comp: {doc.competencia}</span>}
                                    {doc.arquivo_tamanho && <span>• {doc.arquivo_tamanho}</span>}
                                    <span>• Publicado em {doc.created_at}</span>
                                  </div>
                                </div>
                              </div>

                              {doc.data_vencimento && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                                  Venc: {doc.data_vencimento}
                                </span>
                              )}
                            </div>

                            {doc.descricao && (
                              <p className="text-[11px] text-slate-400 mt-2 pl-9 line-clamp-2">
                                {doc.descricao}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">
                              Departamento: <strong className="text-slate-300">{doc.departamento}</strong>
                            </span>

                            <a
                              href={doc.arquivo_conteudo || doc.arquivo_url || '#'}
                              download={doc.nome}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Baixar Arquivo</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 2: SOLICITAÇÕES ================= */}
        {activeTab === 'solicitacoes' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Central de Solicitações do Cliente</h3>
                <p className="text-xs text-slate-400">
                  Abra solicitações de guias, admissões, rescisões e tire dúvidas diretamente com os analistas.
                </p>
              </div>

              <button
                onClick={() => setModalNovaSolOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Fazer Nova Solicitação</span>
              </button>
            </div>

            {solicitacoesDoCliente.length === 0 ? (
              <div className="p-12 text-center bg-slate-800/40 rounded-3xl border border-slate-700/80 text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-600" />
                <p className="font-bold text-sm">Você ainda não possui solicitações abertas.</p>
                <p className="text-xs text-slate-500">
                  Clique no botão &ldquo;Nova Solicitação&rdquo; para falar com o escritório.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {solicitacoesDoCliente.map(sol => (
                  <div
                    key={sol.id}
                    className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            sol.status === 'Concluída'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : sol.status === 'Em Andamento'
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}>
                            {sol.status}
                          </span>
                          <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                            Depto: {sol.departamento}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Aberta em {sol.created_at}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white">{sol.assunto}</h4>
                      </div>

                      {sol.responsavel && (
                        <span className="text-[11px] text-slate-400">
                          Resp: <strong className="text-slate-200">{sol.responsavel}</strong>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                      {sol.descricao}
                    </p>

                    {/* Resposta do Escritório */}
                    {sol.resposta_escritorio && (
                      <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Resposta da fin.up:</span>
                        </div>
                        <p className="text-[11px] leading-relaxed pl-5">
                          {sol.resposta_escritorio}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 3: UPLOAD MENSAL ================= */}
        {activeTab === 'upload' && (
          <div className="bg-slate-800/80 p-8 rounded-3xl border border-slate-700/80 space-y-5 animate-in fade-in max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-3xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
              <Upload className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Envio de Extratos Bancários & Documentos do Mês</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Envie os extratos em formato OFX ou PDF, despesas e notas fiscais para o fechamento fiscal e contábil da sua empresa.
              </p>
            </div>

            <div className="p-8 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-3xl bg-slate-900/60 text-center transition-all cursor-pointer relative">
              <input
                type="file"
                multiple
                accept=".ofx,.pdf,.xml,.zip,.png,.jpg,.jpeg"
                onChange={handleUploadMensal}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="font-bold text-sm text-white">Clique para selecionar arquivos ou arraste aqui</p>
              <p className="text-xs text-slate-400 mt-1">
                Formatos suportados: OFX, PDF, XML, ZIP, Imagens (até 50MB)
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-700">
              <span>Dúvidas com o envio?</span>
              <span className="text-emerald-400 font-semibold">
                Fale com seu consultor: {clienteAtual?.responsavel}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: NOVA SOLICITAÇÃO DO CLIENTE */}
      {modalNovaSolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Abrir Nova Solicitação ao Escritório</span>
              </h3>
              <button
                onClick={() => setModalNovaSolOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarSolicitacao} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Departamento</label>
                  <select
                    value={novoDeptoSol}
                    onChange={e => setNovoDeptoSol(e.target.value as Departamento)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Fiscal">Fiscal (Impostos, DAS)</option>
                    <option value="Pessoal">Pessoal / RH (Folha, Admissão)</option>
                    <option value="Contábil">Contábil (Balancete, DRE)</option>
                    <option value="Societário">Societário (Alterações, CND)</option>
                    <option value="Financeiro">Financeiro / BPO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Prioridade</label>
                  <select
                    value={novoPrioridadeSol}
                    onChange={e => setNovoPrioridadeSol(e.target.value as Prioridade)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Assunto da Solicitação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Segunda via da Guia DAS, Admissão de Funcionário..."
                  value={novoAssuntoSol}
                  onChange={e => setNovoAssuntoSol(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Descrição / Detalhes *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva detalhadamente o que você precisa da nossa equipe..."
                  value={novoDescricaoSol}
                  onChange={e => setNovoDescricaoSol(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaSolOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Solicitação</span>
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
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
        Carregando portal do cliente...
      </div>
    }>
      <PortalClienteContent />
    </Suspense>
  );
}
