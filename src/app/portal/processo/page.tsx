'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Layers,
  Calendar,
  Clock,
  User,
  Paperclip,
  CheckCircle2,
  Upload,
  FileText,
  X,
  Send,
  MessageSquare,
  AlertCircle,
  Building
} from 'lucide-react';

interface ArquivoUploadPreview {
  nome: string;
  conteudo: string; // Base64 Data URL
  tamanho: string;
}

function PortalProcessoContent() {
  const searchParams = useSearchParams();
  const tarefaId = searchParams.get('t') || '';
  const etapaId = searchParams.get('e') || '';

  const [tarefa, setTarefa] = useState<any | null>(null);
  const [etapa, setEtapa] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form de Retorno
  const [nomeCliente, setNomeCliente] = useState<string>('');
  const [comentario, setComentario] = useState<string>('');
  const [arquivos, setArquivos] = useState<ArquivoUploadPreview[]>([]);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [sucessoEnvio, setSucessoEnvio] = useState<boolean>(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTarefas = localStorage.getItem('gestup_v2_tarefas');
        if (savedTarefas) {
          const parsed = JSON.parse(savedTarefas);
          const t = parsed.find((item: any) => item.id === tarefaId);
          if (t) {
            setTarefa(t);
            setNomeCliente(t.cliente_nome || '');
            if (t.etapas_processo) {
              const e = t.etapas_processo.find((ep: any) => ep.id === etapaId);
              if (e) setEtapa(e);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao ler dados da tarefa:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [tarefaId, etapaId]);

  // Upload múltiplo de arquivos em Base64
  const handleSelecionarArquivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // Formata tamanho legível
      const tamanhoFormatado = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setArquivos(prev => [
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

  const handleRemoverArquivo = (index: number) => {
    setArquivos(prev => prev.filter((_, i) => i !== index));
  };

  const handleEnviarRetorno = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim() && arquivos.length === 0) {
      setErroMsg('Por favor, escreva um comentário ou anexe pelo menos um documento.');
      return;
    }

    setEnviando(true);
    setErroMsg(null);

    const agora = new Date().toLocaleString('pt-BR');
    const autor = nomeCliente.trim() || tarefa?.cliente_nome || 'Cliente';

    const novoRetorno = {
      id: `ret-${Date.now()}`,
      data: agora,
      autor_cliente: autor,
      comentario: comentario.trim(),
      arquivos: arquivos.map((a, i) => ({
        id: `arq-ret-${Date.now()}-${i}`,
        nome: a.nome,
        url: a.conteudo,
        conteudo: a.conteudo,
        tamanho: a.tamanho,
        data_upload: new Date().toISOString().split('T')[0]
      }))
    };

    try {
      if (typeof window !== 'undefined') {
        const savedTarefas = localStorage.getItem('gestup_v2_tarefas');
        let tarefasLista = savedTarefas ? JSON.parse(savedTarefas) : [];

        tarefasLista = tarefasLista.map((t: any) => {
          if (t.id === tarefaId) {
            const etapasAtualizadas = (t.etapas_processo || []).map((ep: any) => {
              if (ep.id === etapaId) {
                return {
                  ...ep,
                  arquivos: [...(ep.arquivos || []), ...novoRetorno.arquivos],
                  retornos_cliente: [...(ep.retornos_cliente || []), novoRetorno]
                };
              }
              return ep;
            });

            const textoComentario = `📥 Retorno recebido do cliente (${autor}) na etapa "${etapa?.titulo || 'Processo'}": ${novoRetorno.comentario ? `"${novoRetorno.comentario}"` : ''} ${novoRetorno.arquivos.length > 0 ? `(${novoRetorno.arquivos.length} anexo(s))` : ''}`;

            const novosComentarios = [
              ...(t.comentarios_lista || []),
              {
                id: `com-${Date.now()}`,
                autor: `Cliente: ${autor}`,
                data: agora,
                texto: textoComentario
              }
            ];

            return {
              ...t,
              etapas_processo: etapasAtualizadas,
              comentarios_lista: novosComentarios
            };
          }
          return t;
        });

        localStorage.setItem('gestup_v2_tarefas', JSON.stringify(tarefasLista));
        window.dispatchEvent(new Event('storage'));
      }

      setSucessoEnvio(true);
    } catch (err) {
      console.error('Erro ao salvar retorno:', err);
      setErroMsg('Ocorreu um erro ao enviar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Topo do Portal */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md shrink-0">
              <Image
                src="/logo.png"
                alt="Logo fin.up"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Portal Seguro de Retorno
                </span>
              </div>
              <h1 className="text-base font-bold mt-1">fin.up consultoria</h1>
              <p className="text-xs text-slate-300">
                Acompanhamento e Envio de Documentos do Processo
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem de Sucesso */}
        {sucessoEnvio ? (
          <div className="p-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Retorno Enviado com Sucesso!</h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-md mx-auto">
                Obrigado por nos enviar os dados. Seu comentário e {arquivos.length} documento(s) foram vinculados diretamente à etapa <strong>&ldquo;{etapa?.titulo || 'Processo'}&rdquo;</strong>. Nossa equipe técnica já foi notificada.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left text-slate-600 space-y-1.5 max-w-sm mx-auto">
              <p><strong>Empresa:</strong> {tarefa?.cliente_nome || nomeCliente}</p>
              <p><strong>Horário de Envio:</strong> {new Date().toLocaleString('pt-BR')}</p>
              {comentario && <p><strong>Comentário:</strong> &ldquo;{comentario}&rdquo;</p>}
              {arquivos.length > 0 && (
                <p><strong>Arquivos Anexados:</strong> {arquivos.map(a => a.nome).join(', ')}</p>
              )}
            </div>

            <p className="text-[11px] text-slate-400">Você já pode fechar esta página.</p>
          </div>
        ) : (
          <div className="p-6 space-y-5 text-xs">
            {/* Cartão de Detalhes da Subtarefa / Etapa */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs flex items-center gap-1.5 text-indigo-900">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Etapa do Processo:</span>
                </span>
                {etapa?.data_limite && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-700" />
                    <span>Prazo: {etapa.data_limite}</span>
                  </span>
                )}
              </div>

              <h2 className="text-sm font-bold text-slate-900">
                {etapa?.titulo || 'Solicitação de Documentos & Retorno do Processo'}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tarefa?.cliente_nome || 'Sua Empresa'}</span>
                </span>
                {etapa?.responsavel && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Consultor: {etapa.responsavel}</span>
                  </span>
                )}
              </div>

              {(etapa?.descricao || etapa?.observacoes) && (
                <p className="text-[11px] text-slate-600 pt-1 border-t border-indigo-100/80 leading-relaxed italic">
                  &ldquo;{etapa.descricao || etapa.observacoes}&rdquo;
                </p>
              )}
            </div>

            {/* Formulário de Envio do Cliente */}
            <form onSubmit={handleEnviarRetorno} className="space-y-4">
              {erroMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{erroMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Seu Nome ou Responsável pelo Envio:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva (Sócio / Financeiro)"
                  value={nomeCliente}
                  onChange={e => setNomeCliente(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Escreva um Comentário ou Resposta:
                </label>
                <textarea
                  rows={3}
                  placeholder="Escreva sua resposta, esclarecimento de dúvidas ou observações para a contabilidade..."
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 leading-relaxed"
                />
              </div>

              {/* Área de Anexo de Múltiplos Arquivos */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Anexar Documentos (PDF ou Imagens):
                </label>
                <div className="p-4 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/20 text-center transition-all cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleSelecionarArquivos}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-800 text-xs">
                    Clique aqui ou arraste arquivos para anexar
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Você pode anexar mais de um arquivo (PDF, PNG, JPG, JPEG)
                  </p>
                </div>

                {/* Lista de Arquivos Selecionados */}
                {arquivos.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-600 block">
                      {arquivos.length} arquivo(s) selecionado(s):
                    </span>
                    <div className="space-y-1">
                      {arquivos.map((arq, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{arq.nome}</span>
                            <span className="text-[10px] text-slate-400">({arq.tamanho})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoverArquivo(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200"
                            title="Remover arquivo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{enviando ? 'Enviando ao Escritório...' : 'Enviar Retorno para a Contabilidade'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span>fin.up Gestão Fiscal & Contábil</span>
          <span>Transmissão Segura com Criptografia</span>
        </div>
      </div>
    </div>
  );
}

export default function PortalProcessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
        Carregando portal de retorno...
      </div>
    }>
      <PortalProcessoContent />
    </Suspense>
  );
}
