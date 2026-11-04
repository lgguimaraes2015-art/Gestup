'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { obterCompetenciaAtual } from '@/lib/dateUtils';
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
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  AlertCircle
} from 'lucide-react';
import { Departamento, DocumentoPortalCliente, SolicitacaoPortalCliente } from '@/types';

export function PortalClienteView() {
  const {
    clientes,
    documentosPortal,
    solicitacoesPortal,
    addDocumentoPortal,
    updateDocumentoPortal,
    deleteDocumentoPortal,
    responderSolicitacaoPortal
  } = useApp();

  const [selectedClienteId, setSelectedClienteId] = useState<string>(clientes[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'documentos' | 'solicitacoes' | 'preview'>('documentos');
  const [selectedDepto, setSelectedDepto] = useState<string>('todos');
  const [buscaDoc, setBuscaDoc] = useState<string>('');

  // Modal de Publicação de Documento
  const [modalUploadDocOpen, setModalUploadDocOpen] = useState(false);
  const [novoDocClienteId, setNovoDocClienteId] = useState(selectedClienteId);
  const [novoDocDepto, setNovoDocDepto] = useState<Departamento>('Fiscal');
  const [novoDocPasta, setNovoDocPasta] = useState('Guias de Tributos');
  const [novoDocNome, setNovoDocNome] = useState('');
  const [novoDocDescricao, setNovoDocDescricao] = useState('');
  const [novoDocCompetencia, setNovoDocCompetencia] = useState(() => obterCompetenciaAtual());
  const [novoDocVencimento, setNovoDocVencimento] = useState('');
  const [novoDocVisivel, setNovoDocVisivel] = useState(true);
  const [arquivoCarregado, setArquivoCarregado] = useState<{ nome: string; conteudo: string; tamanho: string } | null>(null);
  const [arquivosCarregados, setArquivosCarregados] = useState<{ nome: string; conteudo: string; tamanho: string }[]>([]);

  // Modal de Resposta a Solicitação
  const [solicitacaoEmResposta, setSolicitacaoEmResposta] = useState<SolicitacaoPortalCliente | null>(null);
  const [textoResposta, setTextoResposta] = useState('');
  const [statusResposta, setStatusResposta] = useState<'Em Andamento' | 'Concluída'>('Concluída');

  // Feedback Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const clienteAtual = clientes.find(c => c.id === selectedClienteId) || clientes[0];

  // Filtro de documentos por cliente, departamento e busca
  const documentosFiltrados = documentosPortal.filter(doc => {
    const matchCliente = selectedClienteId === 'todos' || doc.cliente_id === 'todos' || doc.cliente_id === selectedClienteId;
    const matchDepto = selectedDepto === 'todos' || doc.departamento === selectedDepto;
    const matchBusca = buscaDoc.trim() === '' || 
      doc.nome.toLowerCase().includes(buscaDoc.toLowerCase()) || 
      doc.pasta.toLowerCase().includes(buscaDoc.toLowerCase());
    return matchCliente && matchDepto && matchBusca;
  });

  // Agrupamento por pasta
  const pastasAgrupadas = documentosFiltrados.reduce((acc, doc) => {
    const pastaKey = doc.pasta || 'Geral';
    if (!acc[pastaKey]) acc[pastaKey] = [];
    acc[pastaKey].push(doc);
    return acc;
  }, {} as Record<string, DocumentoPortalCliente[]>);

  // Solicitações filtradas por cliente
  const solicitacoesFiltradas = solicitacoesPortal.filter(sol => {
    if (selectedClienteId === 'todos') return true;
    return sol.cliente_id === selectedClienteId;
  });

  const totalSolicitacoesPendentes = solicitacoesFiltradas.filter(s => s.status === 'Pendente').length;

  // Upload do arquivo em Base64 (suporta múltiplos)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const tamanhoFormatado = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setArquivosCarregados(prev => [
            ...prev,
            {
              nome: file.name,
              conteudo: reader.result as string,
              tamanho: tamanhoFormatado
            }
          ]);
          setArquivoCarregado({
            nome: file.name,
            conteudo: reader.result as string,
            tamanho: tamanhoFormatado
          });
          if (!novoDocNome) {
            setNovoDocNome(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSalvarPublicacaoDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const cli = clientes.find(c => c.id === novoDocClienteId);

    if (arquivosCarregados.length > 1) {
      arquivosCarregados.forEach(arq => {
        addDocumentoPortal({
          cliente_id: novoDocClienteId,
          cliente_nome: cli?.nome || 'Geral',
          departamento: novoDocDepto,
          pasta: novoDocPasta,
          nome: arq.nome,
          descricao: novoDocDescricao.trim(),
          arquivo_url: arq.conteudo,
          arquivo_conteudo: arq.conteudo,
          arquivo_tamanho: arq.tamanho,
          visivel_cliente: novoDocVisivel,
          competencia: novoDocCompetencia,
          data_vencimento: novoDocVencimento
        });
      });
      setToastMsg(`✅ ${arquivosCarregados.length} documentos publicados no Portal com sucesso!`);
    } else if (novoDocNome.trim()) {
      addDocumentoPortal({
        cliente_id: novoDocClienteId,
        cliente_nome: cli?.nome || 'Geral',
        departamento: novoDocDepto,
        pasta: novoDocPasta,
        nome: novoDocNome.trim(),
        descricao: novoDocDescricao.trim(),
        arquivo_url: arquivoCarregado?.conteudo || `/portal/guia?id=doc-${Date.now()}&arquivo=${encodeURIComponent(novoDocNome)}.pdf`,
        arquivo_conteudo: arquivoCarregado?.conteudo,
        arquivo_tamanho: arquivoCarregado?.tamanho || '120 KB',
        visivel_cliente: novoDocVisivel,
        competencia: novoDocCompetencia,
        data_vencimento: novoDocVencimento
      });
      setToastMsg(`✅ Documento "${novoDocNome}" publicado no Portal do Cliente com sucesso!`);
    } else {
      return;
    }

    setModalUploadDocOpen(false);
    setNovoDocNome('');
    setNovoDocDescricao('');
    setArquivoCarregado(null);
    setArquivosCarregados([]);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSalvarResposta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitacaoEmResposta || !textoResposta.trim()) return;

    responderSolicitacaoPortal(solicitacaoEmResposta.id, textoResposta.trim(), statusResposta);
    setSolicitacaoEmResposta(null);
    setTextoResposta('');
    setToastMsg('✅ Resposta enviada com sucesso! O cliente já pode visualizar no portal.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-600 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Topo do Módulo de Gestão do Portal */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-green/20 text-brand-green px-2 py-0.5 rounded-full border border-brand-green/30">
              Gestão Externa & Documental
            </span>
            <span className="text-xs text-slate-400">Painel de Controle do Escritório</span>
          </div>
          <h2 className="text-lg font-bold mt-1">Gestão do Portal do Cliente fin.up</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Configure quais documentos, pastas e departamentos cada cliente pode visualizar no portal externo, e atenda às solicitações abertas pelos clientes em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Seletor do Cliente */}
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Cliente:</span>
            <select
              value={selectedClienteId}
              onChange={e => {
                setSelectedClienteId(e.target.value);
                setNovoDocClienteId(e.target.value);
              }}
              className="text-xs bg-slate-800 border-none text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos os Clientes</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {/* Botão de Abrir Portal Externo */}
          <a
            href={`/portal/cliente?id=${selectedClienteId === 'todos' ? clientes[0]?.id : selectedClienteId}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
            title="Abrir o portal externo em uma nova aba"
          >
            <ExternalLink className="w-4 h-4" />
            <span>🌐 Abrir Portal Externo do Cliente</span>
          </a>

          {/* Botão de Publicar Documento */}
          <button
            onClick={() => setModalUploadDocOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Documento</span>
          </button>
        </div>
      </div>

      {/* Abas de Navegação Interna */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('documentos')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'documentos'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>📁 Pastas & Documentos Publicados ({documentosFiltrados.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('solicitacoes')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'solicitacoes'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>📝 Solicitações dos Clientes ({solicitacoesFiltradas.length})</span>
          {totalSolicitacoesPendentes > 0 && (
            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              {totalSolicitacoesPendentes} pendente(s)
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'preview'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>📱 Prévia do App do Cliente</span>
        </button>
      </div>

      {/* ================= ABA 1: DOCUMENTOS & PASTAS ================= */}
      {activeTab === 'documentos' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Barra de Filtros de Departamento e Busca */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-subtle">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-500 font-semibold mr-1">Filtrar por Departamento:</span>
              {['todos', 'Fiscal', 'Pessoal/RH', 'Contábil', 'Societário', 'Financeiro'].map(depto => (
                <button
                  key={depto}
                  onClick={() => setSelectedDepto(depto)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedDepto === depto
                      ? 'bg-brand-blue text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {depto === 'todos' ? 'Todos' : depto}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar documento ou pasta..."
                value={buscaDoc}
                onChange={e => setBuscaDoc(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>

          {/* Listagem das Pastas e Documentos */}
          {Object.keys(pastasAgrupadas).length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-400 space-y-2">
              <Folder className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Nenhum documento encontrado.</p>
              <p className="text-xs text-slate-500">
                Clique no botão &ldquo;Publicar Documento&rdquo; acima para enviar arquivos para o portal do cliente.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(pastasAgrupadas).map(([pastaNome, docs]) => (
                <div
                  key={pastaNome}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Folder className="w-5 h-5 text-brand-blue" />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{pastaNome}</h3>
                      <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-brand-blue px-2 py-0.5 rounded-full">
                        {docs.length} arquivo(s)
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Depto: {docs[0]?.departamento}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {docs.map(doc => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between space-y-3 shadow-2xs hover:border-brand-blue/30 transition-all"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-brand-blue shrink-0 mt-0.5">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{doc.nome}</h4>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {doc.competencia && <span>Comp: {doc.competencia}</span>}
                                  {doc.arquivo_tamanho && <span>• {doc.arquivo_tamanho}</span>}
                                  <span>• Publicado em {doc.created_at}</span>
                                </div>
                              </div>
                            </div>

                            {/* Badge de Visibilidade */}
                            <button
                              type="button"
                              onClick={() => updateDocumentoPortal(doc.id, { visivel_cliente: !doc.visivel_cliente })}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all ${
                                doc.visivel_cliente !== false
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                                  : 'bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-400'
                              }`}
                              title="Clique para alternar se o cliente pode ver este documento"
                            >
                              {doc.visivel_cliente !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              <span>{doc.visivel_cliente !== false ? 'Visível' : 'Oculto'}</span>
                            </button>
                          </div>

                          {doc.descricao && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 pl-9">
                              {doc.descricao}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-slate-500">
                            Cliente: <strong className="text-slate-700 dark:text-slate-300">{doc.cliente_nome || 'Geral'}</strong>
                          </span>

                          <div className="flex items-center gap-2">
                            <a
                              href={doc.arquivo_conteudo || doc.arquivo_url || '#'}
                              download={doc.nome}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-700 hover:bg-blue-50 text-brand-blue font-bold text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-600 transition"
                            >
                              <Download className="w-3 h-3" />
                              <span>Baixar</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Deseja realmente remover o documento "${doc.nome}" do portal?`)) {
                                  deleteDocumentoPortal(doc.id);
                                  setToastMsg('Documento removido.');
                                  setTimeout(() => setToastMsg(null), 3000);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Remover documento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* ================= ABA 2: SOLICITAÇÕES DOS CLIENTES ================= */}
      {activeTab === 'solicitacoes' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Solicitações Abertas pelos Clientes no Portal
              </h3>
              <p className="text-xs text-slate-500">
                Atenda aos chamados de dúvidas, cálculos, segunda via de guias e envie as respostas diretamente para o portal do cliente.
              </p>
            </div>
          </div>

          {solicitacoesFiltradas.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Nenhuma solicitação encontrada para este cliente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {solicitacoesFiltradas.map(sol => (
                <div
                  key={sol.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          sol.status === 'Concluída'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : sol.status === 'Em Andamento'
                            ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 animate-pulse'
                        }`}>
                          {sol.status}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                          Depto: {sol.departamento}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Cliente: <strong>{sol.cliente_nome}</strong> • Aberta em {sol.created_at}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{sol.assunto}</h4>
                    </div>

                    <button
                      onClick={() => {
                        setSolicitacaoEmResposta(sol);
                        setTextoResposta(sol.resposta_escritorio || '');
                        setStatusResposta(sol.status === 'Pendente' ? 'Concluída' : (sol.status as any));
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{sol.resposta_escritorio ? 'Atualizar Resposta' : 'Responder ao Cliente'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {sol.descricao}
                  </p>

                  {/* Resposta Atual do Escritório */}
                  {sol.resposta_escritorio && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Resposta enviada ao cliente:</span>
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

      {/* ================= ABA 3: PRÉVIA DO APP DO CLIENTE ================= */}
      {activeTab === 'preview' && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between text-white border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm">Visualização em Tempo Real do Portal do Cliente</h3>
              <p className="text-xs text-slate-400">
                Esta é a interface que seu cliente acessa ao abrir o link do portal.
              </p>
            </div>
            <a
              href={`/portal/cliente?id=${clienteAtual?.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir em Tela Cheia</span>
            </a>
          </div>

          <div className="w-full h-[650px] rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
            <iframe
              src={`/portal/cliente?id=${clienteAtual?.id}`}
              className="w-full h-full border-none"
              title="Portal do Cliente Preview"
            />
          </div>
        </div>
      )}

      {/* MODAL: PUBLICAR DOCUMENTO PARA O CLIENTE */}
      {modalUploadDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-slate-800/60">
              <h3 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                <Upload className="w-4 h-4 text-brand-blue" />
                <span>Publicar Documento no Portal do Cliente</span>
              </h3>
              <button
                onClick={() => setModalUploadDocOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarPublicacaoDoc} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cliente Alvo *</label>
                  <select
                    value={novoDocClienteId}
                    onChange={e => setNovoDocClienteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Departamento *</label>
                  <select
                    value={novoDocDepto}
                    onChange={e => {
                      const dep = e.target.value as Departamento;
                      setNovoDocDepto(dep);
                      if (dep === 'Fiscal') setNovoDocPasta('Guias de Tributos');
                      else if (dep === 'Pessoal') setNovoDocPasta('Folha de Pagamento');
                      else if (dep === 'Contábil') setNovoDocPasta('Balancetes & DRE');
                      else if (dep === 'Societário') setNovoDocPasta('CNDs & Certidões');
                      else if (dep === 'Financeiro') setNovoDocPasta('Relatórios Financeiros');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="Fiscal">Fiscal</option>
                    <option value="Pessoal">Pessoal / RH</option>
                    <option value="Contábil">Contábil</option>
                    <option value="Societário">Societário</option>
                    <option value="Financeiro">Financeiro / BPO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pasta no Portal do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Guias de Tributos, Folha de Pagamento..."
                    value={novoDocPasta}
                    onChange={e => setNovoDocPasta(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Competência</label>
                  <input
                    type="text"
                    placeholder="Ex: 10/2026"
                    value={novoDocCompetencia}
                    onChange={e => setNovoDocCompetencia(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Guia DAS Simples Nacional - 10/2026, Contrato Social..."
                  value={novoDocNome}
                  onChange={e => setNovoDocNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                />
              </div>

              {/* Upload do Arquivo */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Arquivo do Documento (PDF ou Imagem)
                </label>
                <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center relative cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-brand-blue mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {arquivosCarregados.length > 1
                      ? `${arquivosCarregados.length} arquivos selecionados para upload simultâneo`
                      : (arquivoCarregado ? arquivoCarregado.nome : 'Clique para selecionar arquivos (suporta múltiplos de uma vez)')}
                  </p>
                  {arquivosCarregados.length > 0 && (
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                      ✓ {arquivosCarregados.length} arquivo(s) carregado(s) pronto(s) para publicação
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Data de Vencimento (se houver)
                  </label>
                  <input
                    type="date"
                    value={novoDocVencimento}
                    onChange={e => setNovoDocVencimento(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={novoDocVisivel}
                      onChange={e => setNovoDocVisivel(e.target.checked)}
                      className="w-4 h-4 text-brand-blue rounded border-slate-300 focus:ring-brand-blue"
                    />
                    <span>Visível imediatamente no Portal</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição / Orientações para o Cliente
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruções de pagamento, validade ou conferência..."
                  value={novoDocDescricao}
                  onChange={e => setNovoDocDescricao(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalUploadDocOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold shadow-sm"
                >
                  Publicar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESPONDER SOLICITAÇÃO DO CLIENTE */}
      {solicitacaoEmResposta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-slate-800/60">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-blue" />
                <span>Responder Solicitação do Cliente</span>
              </h3>
              <button
                onClick={() => setSolicitacaoEmResposta(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarResposta} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-500 block">
                  Cliente: <strong>{solicitacaoEmResposta.cliente_nome}</strong> • Depto: {solicitacaoEmResposta.departamento}
                </span>
                <p className="font-bold text-xs text-slate-800 dark:text-white">{solicitacaoEmResposta.assunto}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-1">
                  &ldquo;{solicitacaoEmResposta.descricao}&rdquo;
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status da Solicitação após a Resposta:
                </label>
                <select
                  value={statusResposta}
                  onChange={e => setStatusResposta(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                >
                  <option value="Concluída">✓ Concluída (Atendida e Finalizada)</option>
                  <option value="Em Andamento">⏳ Em Andamento (Em Análise pelo Escritório)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sua Resposta para o Cliente *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escreva a resposta e solução para o cliente visualizar no portal..."
                  value={textoResposta}
                  onChange={e => setTextoResposta(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSolicitacaoEmResposta(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Resposta ao Portal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
