'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  MessageSquare,
  Smartphone,
  Send,
  CheckCheck,
  Key,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  ExternalLink,
  Search,
  User,
  ShieldCheck,
  FileText,
  Clock,
  Zap,
  Globe,
  Settings2
} from 'lucide-react';

export function WhatsAppCentralView() {
  const {
    whatsAppConfig,
    whatsAppMensagens,
    colaboradores,
    clientes,
    tarefas,
    enviarMensagemWhatsApp,
    dispararResumoMatinalEquipe,
    atualizarWhatsAppConfig
  } = useApp();

  const [abaAtiva, setAbaAtiva] = useState<'sessao' | 'simulador' | 'tutorial' | 'configuracoes'>('sessao');

  // Diagnóstico de Conexão em Tempo Real
  const [testandoStatus, setTestandoStatus] = useState(false);
  const [statusDiagnostico, setStatusDiagnostico] = useState<{
    ok: boolean;
    statusHttp?: number;
    mensagem: string;
    connected?: boolean;
    instance?: string;
  } | null>(null);

  // Estados de Configuração da API
  const [apiUrl, setApiUrl] = useState(whatsAppConfig.api_url || 'https://evolution-api-production-ed7c.up.railway.app');
  const [apiKey, setApiKey] = useState(whatsAppConfig.api_key || '68A885CD-5F29-4269-949C-8AEB4D149393');
  const [nomeInstancia, setNomeInstancia] = useState(whatsAppConfig.nome_instancia || 'gestup');
  const [feedbackSalvo, setFeedbackSalvo] = useState(false);
  const [copiouComandoDocker, setCopiouComandoDocker] = useState(false);

  // Estados do Chat / WhatsApp Web Integrado
  const [buscaCliente, setBuscaCliente] = useState('');
  const [clienteChatId, setClienteChatId] = useState<string>(() => clientes[0]?.id || '');
  const [mensagemChat, setMensagemChat] = useState('');
  const [enviandoChat, setEnviandoChat] = useState(false);
  const [feedbackEnvioChat, setFeedbackEnvioChat] = useState<string | null>(null);

  // Estados do Simulador de Envio
  const [destinatarioTipo, setDestinatarioTipo] = useState<'Colaborador' | 'Cliente'>('Colaborador');
  const [selectedColab, setSelectedColab] = useState(colaboradores[0]?.nome || '');
  const [selectedCliente, setSelectedCliente] = useState(clientes[0]?.nome || '');
  const [telefoneManual, setTelefoneManual] = useState('');
  const [tipoNotificacao, setTipoNotificacao] = useState<'Resumo Diário' | 'Lembrete Prazo' | 'Cobrança Atraso' | 'Documento Pendente'>('Cobrança Atraso');
  const [mensagemTexto, setMensagemTexto] = useState(
    '🚨 *Atenção fin.up - Cobrança de Prazo*\n\nOlá! A sua tarefa do fechamento fiscal está pendente de conclusão. Favor verificar no GestUp.'
  );
  const [feedbackEnvio, setFeedbackEnvio] = useState(false);

  // Testar Conexão Real com a API
  const testarConexaoReal = async () => {
    setTestandoStatus(true);
    setStatusDiagnostico(null);
    try {
      const res = await fetch('/api/whatsapp/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiUrl, apiKey, instanceName: nomeInstancia })
      });
      const data = await res.json().catch(() => null);

      if (data?.success && data?.connected) {
        setStatusDiagnostico({
          ok: true,
          statusHttp: 200,
          mensagem: `Conexão ativa! Instância "${data.instanceName}" sincronizada com o WhatsApp ${data.ownerFormatted || ''}.`,
          connected: true,
          instance: data.instanceName
        });
        atualizarWhatsAppConfig({
          conectado: true,
          status: 'CONNECTED',
          numero_conectado: data.ownerFormatted || whatsAppConfig.numero_conectado
        });
      } else {
        const msgErro = data?.error || 'Não foi possível comunicar com o servidor da Evolution API.';
        const eh404Railway = msgErro.includes('404') || msgErro.includes('Railway') || msgErro.includes('Application not found');
        setStatusDiagnostico({
          ok: false,
          statusHttp: data?.statusHttp || 404,
          mensagem: eh404Railway
            ? 'Servidor Evolution API no Railway Offline (HTTP 404 - Application not found). O plano gratuito de teste de 30 dias do Railway expirou.'
            : msgErro,
          connected: false
        });
        atualizarWhatsAppConfig({
          conectado: false,
          status: 'DISCONNECTED'
        });
      }
    } catch (err: any) {
      setStatusDiagnostico({
        ok: false,
        mensagem: `Erro de conexão local com a rota da API: ${err.message}`,
        connected: false
      });
      atualizarWhatsAppConfig({
        conectado: false,
        status: 'DISCONNECTED'
      });
    } finally {
      setTestandoStatus(false);
    }
  };

  // Testa o status automaticamente na inicialização
  useEffect(() => {
    testarConexaoReal();
  }, []);

  const handleSalvarConfig = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarWhatsAppConfig({
      api_url: apiUrl.trim(),
      api_key: apiKey.trim(),
      nome_instancia: nomeInstancia.trim()
    });
    setFeedbackSalvo(true);
    setTimeout(() => setFeedbackSalvo(false), 3000);
    testarConexaoReal();
  };

  const handleConfigurarDockerLocal = () => {
    const urlLocal = 'http://localhost:8080';
    setApiUrl(urlLocal);
    atualizarWhatsAppConfig({
      api_url: urlLocal,
      api_key: apiKey,
      nome_instancia: nomeInstancia
    });
    setFeedbackSalvo(true);
    setTimeout(() => setFeedbackSalvo(false), 3000);
  };

  const clienteAtivo = clientes.find(c => c.id === clienteChatId) || clientes[0];

  // Filtra mensagens do histórico para o cliente selecionado
  const mensagensClienteAtivo = whatsAppMensagens.filter(m => {
    if (!clienteAtivo) return false;
    const nomeM = (m.destinatario_nome || '').toLowerCase();
    const nomeC = (clienteAtivo.nome || '').toLowerCase();
    const telM = (m.telefone || '').replace(/\D/g, '');
    const telC = (clienteAtivo.whatsapp || clienteAtivo.telefone || '').replace(/\D/g, '');
    return nomeM.includes(nomeC) || (telM && telC && (telM === telC || telM.endsWith(telC) || telC.endsWith(telM)));
  });

  // Clientes filtrados na busca
  const clientesFiltrados = clientes.filter(c => {
    const termo = buscaCliente.toLowerCase();
    return (
      c.nome.toLowerCase().includes(termo) ||
      (c.responsavel || '').toLowerCase().includes(termo) ||
      (c.whatsapp || '').includes(termo) ||
      (c.cnpj_cpf || '').includes(termo)
    );
  });

  // Envio direto pelo chat integrado
  const handleEnviarMensagemChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteAtivo || !mensagemChat.trim()) return;

    setEnviandoChat(true);
    setFeedbackEnvioChat(null);

    const fone = clienteAtivo.whatsapp || clienteAtivo.telefone || '5519992080639';
    const sucesso = await enviarMensagemWhatsApp(
      'Cliente',
      clienteAtivo.nome,
      fone,
      'Documento Pendente',
      mensagemChat.trim()
    );

    if (sucesso) {
      setFeedbackEnvioChat('✅ Mensagem enviada com sucesso no WhatsApp do cliente!');
      setMensagemChat('');
    } else {
      setFeedbackEnvioChat('⚠️ A Evolution API está offline. Você pode clicar em "Abrir no WhatsApp Web" abaixo para enviar diretamente.');
    }

    setEnviandoChat(false);
    setTimeout(() => setFeedbackEnvioChat(null), 5000);
  };

  const handleEnviarSimulacao = (e: React.FormEvent) => {
    e.preventDefault();
    const nome = destinatarioTipo === 'Colaborador' ? selectedColab : selectedCliente;
    const fone = telefoneManual || (destinatarioTipo === 'Colaborador' ? '5519992080639' : '5519994910591');

    enviarMensagemWhatsApp(
      destinatarioTipo,
      nome,
      fone,
      tipoNotificacao,
      mensagemTexto
    );

    setFeedbackEnvio(true);
    setTimeout(() => setFeedbackEnvio(false), 3000);
  };

  const comandoDocker = `docker run -d --name evolution-api -p 8080:8080 -e AUTHENTICATION_API_KEY=${apiKey} atendai/evolution-api:v2.1.0`;

  return (
    <div className="space-y-6">
      {/* 1. STATUS DA CONEXÃO & RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Gateway WhatsApp */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gateway WhatsApp</span>
              {whatsAppConfig.conectado ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-brand-green text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                  ROBÔ ONLINE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  API OFFLINE (WEB ATIVO)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${whatsAppConfig.conectado ? 'bg-emerald-50 text-brand-green' : 'bg-amber-50 text-amber-700'}`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{whatsAppConfig.numero_conectado || '+55 (19) 99208-0639'}</p>
                <p className="text-[11px] text-slate-500">Instância: {whatsAppConfig.nome_instancia}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Provedor: <strong>{whatsAppConfig.api_provider}</strong></span>
            <button
              onClick={testarConexaoReal}
              disabled={testandoStatus}
              className="text-brand-blue hover:text-brand-blue-hover font-semibold flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${testandoStatus ? 'animate-spin' : ''}`} />
              <span>{testandoStatus ? 'Checando...' : 'Testar Conexão'}</span>
            </button>
          </div>
        </div>

        {/* Card Automação Matinal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Régua Diária da Equipe</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-brand-blue text-[10px] font-bold">08:30 AUTOMÁTICO</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Todo dia às <strong>08:30</strong> os analistas recebem o resumo individual das tarefas e prazos que vencem hoje.
            </p>
          </div>
          <button
            onClick={dispararResumoMatinalEquipe}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-3.5 h-3.5 text-brand-green" />
            <span>Disparar Resumo Agora (Teste)</span>
          </button>
        </div>

        {/* Card Cobrança de Documentos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cobrança de Documentos</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">{clientes.length} CLIENTES</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Lembretes e cobranças de guias com link embutido do portal para o cliente pagar e visualizar o PDF direto.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Ciclo Automático:</span>
            <span className="font-semibold text-slate-800">Conclusão de Tarefas</span>
          </div>
        </div>
      </div>

      {/* BANNER DE DIAGNÓSTICO DO SERVIDOR / RAILWAY EXPIRADO */}
      {statusDiagnostico && !statusDiagnostico.ok && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Diagnóstico do Servidor WhatsApp: Evolution API Offline
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {statusDiagnostico.mensagem}
              </p>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/80 text-xs text-slate-700 space-y-2.5">
            <p className="font-semibold text-slate-900">
              💡 Por que as mensagens não estão saindo 100% no automático em background?
            </p>
            <p className="leading-relaxed">
              O robô da Evolution API roda como um computador remoto conectado ao seu WhatsApp. Como o servidor de testes do Railway expirou seus 30 dias de cota gratuita (retornando HTTP 404), as requisições não chegam a uma sessão aberta. Para que os disparos ocorram em segundo plano sem que você precise clicar para abrir abas, basta rodar a API de forma definitiva:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Opção 1: Docker Local */}
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-brand-green" />
                  <span>Opção 1 (Grátis & Permanente): Docker no seu PC</span>
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Se você usa Docker Desktop no Windows, rode este comando no PowerShell:
                </p>
                <div className="mt-2 bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[10px] overflow-x-auto flex items-center justify-between">
                  <span>{comandoDocker}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(comandoDocker);
                      setCopiouComandoDocker(true);
                      setTimeout(() => setCopiouComandoDocker(false), 2500);
                    }}
                    className="ml-2 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] shrink-0"
                  >
                    {copiouComandoDocker ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <button
                  onClick={handleConfigurarDockerLocal}
                  className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-brand-green hover:bg-brand-green-hover text-white text-[11px] font-bold transition-all shadow-2xs"
                >
                  Usar http://localhost:8080 no GestUp
                </button>
              </div>

              {/* Opção 2: Reativar Railway ou VPS */}
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-brand-blue" />
                    <span>Opção 2: Reativar no Railway ou Nuvem</span>
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Você pode acessar sua conta do Railway (ou Render/VPS) e adicionar créditos para reativar o container da Evolution API na nuvem 24h.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href="https://railway.app"
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 rounded-lg bg-brand-blue hover:bg-brand-blue-hover text-white text-[11px] font-bold flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Abrir Painel do Railway</span>
                  </a>
                  <button
                    onClick={() => setAbaAtiva('configuracoes')}
                    className="py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold hover:bg-slate-50 transition-all"
                  >
                    Ajustar URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ABAS DE NAVEGAÇÃO DA CENTRAL */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setAbaAtiva('sessao')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            abaAtiva === 'sessao'
              ? 'bg-brand-green text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>WhatsApp Web Integrado & Sessão Ativa</span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            abaAtiva === 'simulador'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Simulador & Disparo Ativo</span>
        </button>

        <button
          onClick={() => setAbaAtiva('tutorial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            abaAtiva === 'tutorial'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Servidor Evolution & Docker (Passo a Passo)</span>
        </button>

        <button
          onClick={() => setAbaAtiva('configuracoes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            abaAtiva === 'configuracoes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Credenciais & Conexão da API</span>
        </button>
      </div>

      {/* 3. ABA: WHATSAPP WEB INTEGRADO & PAINEL DE CONVERSAS */}
      {abaAtiva === 'sessao' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
          {/* Topo do Painel */}
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Painel de WhatsApp Integrado (Sessão Direta no GestUp)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Envie mensagens, cobre prazos e envie guias diretamente aos clientes sem precisar sair do sistema.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={testarConexaoReal}
                disabled={testandoStatus}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testandoStatus ? 'animate-spin' : ''}`} />
                <span>Sincronizar Robô</span>
              </button>

              {clienteAtivo && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${(clienteAtivo.whatsapp || clienteAtivo.telefone || '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-brand-green hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir no WhatsApp Oficial</span>
                </a>
              )}
            </div>
          </div>

          {/* Grid de 2 Colunas: Lista de Clientes e Janela de Conversa */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
            {/* Coluna 1: Lista de Contatos / Clientes da Consultoria (4 colunas) */}
            <div className="md:col-span-4 border-r border-slate-200 p-4 space-y-3 bg-slate-50/50 flex flex-col">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar empresa ou contato..."
                  value={buscaCliente}
                  onChange={e => setBuscaCliente(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[460px] pr-1">
                {clientesFiltrados.map(cli => {
                  const ehAtivo = cli.id === clienteAtivo?.id;
                  const fone = cli.whatsapp || cli.telefone || 'Sem fone';
                  const tarefasPend = tarefas.filter(t => t.cliente_id === cli.id && t.status !== 'Concluída').length;

                  return (
                    <button
                      key={cli.id}
                      onClick={() => setClienteChatId(cli.id)}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 ${
                        ehAtivo
                          ? 'bg-white shadow-sm border border-brand-green/30 ring-2 ring-brand-green/10'
                          : 'hover:bg-white/80 border border-transparent'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        ehAtivo ? 'bg-brand-green text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {cli.nome.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 text-xs truncate">{cli.nome}</p>
                          {tarefasPend > 0 && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                              {tarefasPend} pend.
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {cli.responsavel ? `${cli.responsavel} • ` : ''}{fone}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coluna 2: Janela de Conversa Interativa (8 colunas) */}
            <div className="md:col-span-8 flex flex-col justify-between bg-[#F8F9FA]">
              {clienteAtivo ? (
                <>
                  {/* Cabeçalho do Chat */}
                  <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-brand-green/10 text-brand-green font-black flex items-center justify-center text-sm">
                        {clienteAtivo.nome.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{clienteAtivo.nome}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>{clienteAtivo.whatsapp || clienteAtivo.telefone || 'Sem WhatsApp'}</span>
                          <span>•</span>
                          <span className="text-brand-green font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                            Contato Oficial
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                        Regime: {clienteAtivo.regime_tributario}
                      </span>
                    </div>
                  </div>

                  {/* Histórico de Mensagens com o Cliente */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[380px] bg-[#EFEAE2]/30">
                    {/* Mensagem Padrão de Boas-vindas / Contexto */}
                    <div className="flex justify-center">
                      <span className="bg-white/80 border border-slate-200 text-slate-500 text-[10px] font-semibold px-3 py-1 rounded-full shadow-2xs">
                        Canal Integrado de Atendimento - {clienteAtivo.nome}
                      </span>
                    </div>

                    {mensagensClienteAtivo.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 space-y-2">
                        <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs">Nenhuma mensagem disparada para este cliente ainda.</p>
                        <p className="text-[11px]">Você pode digitar uma mensagem rápida abaixo ou concluir uma tarefa para enviar a guia!</p>
                      </div>
                    ) : (
                      mensagensClienteAtivo.map(msg => (
                        <div key={msg.id} className="max-w-[85%] ml-auto bg-[#D9FDD3] p-3.5 rounded-2xl rounded-tr-none shadow-sm space-y-1.5 border border-emerald-200/50">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="font-bold text-emerald-800">{msg.tipo_notificacao}</span>
                            <span>{msg.data_envio}</span>
                          </div>
                          <p className="text-xs text-slate-900 whitespace-pre-wrap leading-relaxed">
                            {msg.mensagem}
                          </p>
                          <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 pt-1">
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                            <span>{msg.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Feedback de Envio */}
                  {feedbackEnvioChat && (
                    <div className={`px-4 py-2 text-xs font-semibold ${
                      feedbackEnvioChat.includes('✅') ? 'bg-emerald-50 text-brand-green border-t border-emerald-200' : 'bg-amber-50 text-amber-800 border-t border-amber-200'
                    }`}>
                      {feedbackEnvioChat}
                    </div>
                  )}

                  {/* Caixa de Digitação e Disparo Rápido */}
                  <form onSubmit={handleEnviarMensagemChat} className="p-4 bg-white border-t border-slate-200 space-y-3">
                    <div className="flex items-end gap-2">
                      <textarea
                        rows={2}
                        value={mensagemChat}
                        onChange={e => setMensagemChat(e.target.value)}
                        placeholder={`Digite uma mensagem ou cobrança para ${clienteAtivo.nome}...`}
                        className="flex-1 p-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-green resize-none bg-slate-50 focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={enviandoChat || !mensagemChat.trim()}
                        className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
                          mensagemChat.trim() && !enviandoChat
                            ? 'bg-brand-green hover:bg-emerald-600 text-white shadow-sm cursor-pointer'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                        title="Enviar pelo GestUp"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Destinatário: <strong>{clienteAtivo.whatsapp || clienteAtivo.telefone || 'Sem fone'}</strong></span>
                      <span>Disparo 100% pelo GestUp</span>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex items-center justify-center flex-1 p-10 text-slate-400 text-xs">
                  Selecione um cliente para abrir a conversa.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA: SIMULADOR DE ENVIO */}
      {abaAtiva === 'simulador' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-green" />
                <span>Simulador & Disparo Ativo de WhatsApp</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Envie mensagens instantâneas para testar modelos ou cobrar colaboradores/clientes imediatamente.
              </p>
            </div>
            {feedbackEnvio && (
              <span className="text-xs font-semibold text-brand-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-in fade-in">
                ✓ Mensagem enviada com sucesso!
              </span>
            )}
          </div>

          <form onSubmit={handleEnviarSimulacao} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* Campos */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destinatário</label>
                  <select
                    value={destinatarioTipo}
                    onChange={e => setDestinatarioTipo(e.target.value as 'Colaborador' | 'Cliente')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Colaborador">Colaborador (Equipe)</option>
                    <option value="Cliente">Cliente da Consultoria</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome Selecionado</label>
                  {destinatarioTipo === 'Colaborador' ? (
                    <select
                      value={selectedColab}
                      onChange={e => setSelectedColab(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      {colaboradores.map(c => (
                        <option key={c.id} value={c.nome}>{c.nome}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={selectedCliente}
                      onChange={e => setSelectedCliente(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      {clientes.map(c => (
                        <option key={c.id} value={c.nome}>{c.nome}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Notificação</label>
                  <select
                    value={tipoNotificacao}
                    onChange={e => setTipoNotificacao(e.target.value as 'Resumo Diário' | 'Lembrete Prazo' | 'Cobrança Atraso' | 'Documento Pendente')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Cobrança Atraso">Cobrança de Atraso</option>
                    <option value="Lembrete Prazo">Lembrete Preventivo (D-1)</option>
                    <option value="Documento Pendente">Cobrança de Documentos</option>
                    <option value="Resumo Diário">Resumo de Tarefas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone WhatsApp (Opcional)</label>
                  <input
                    type="text"
                    placeholder="(19) 99208-0639"
                    value={telefoneManual}
                    onChange={e => setTelefoneManual(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conteúdo da Mensagem</label>
                <textarea
                  rows={4}
                  value={mensagemTexto}
                  onChange={e => setMensagemTexto(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Disparar Mensagem no WhatsApp</span>
              </button>
            </div>

            {/* Prévia no Balão do WhatsApp */}
            <div className="bg-[#EFEAE2] p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-black/10">
                  <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-xs">
                    {destinatarioTipo === 'Colaborador' ? selectedColab.charAt(0) : selectedCliente.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-xs">
                      {destinatarioTipo === 'Colaborador' ? selectedColab : selectedCliente}
                    </p>
                    <p className="text-[10px] text-slate-500">online no WhatsApp</p>
                  </div>
                </div>

                <div className="mt-4 max-w-[90%] ml-auto bg-[#D9FDD3] text-slate-900 p-3.5 rounded-2xl rounded-tr-none shadow-sm relative text-xs whitespace-pre-wrap leading-relaxed">
                  {mensagemTexto}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-500">
                    <span>Agora</span>
                    <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 text-center mt-4">
                Visualização fiel da formatação oficial da fin.up no WhatsApp
              </p>
            </div>
          </form>
        </div>
      )}

      {/* 5. ABA: GUIA PASSO A PASSO (DOCKER / SERVIDOR) */}
      {abaAtiva === 'tutorial' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-brand-green px-2 py-0.5 rounded-full">
                Guia de Integração
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Como manter o robô de WhatsApp ativo 24h sem custos ou expiração
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                A Evolution API roda como uma sessão headless do WhatsApp Web, enviando mensagens em background sem abrir abas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opção 1: Evolution API com Docker Local */}
              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-brand-green text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">Opção 1: Docker Local (100% Grátis & Permanente)</h4>
                  </div>
                  <span className="text-[10px] font-bold bg-brand-green text-white px-2 py-0.5 rounded-full">
                    RECOMENDADA
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  A forma mais segura e independente. Roda diretamente no seu computador sem depender de planos gratuitos temporários de terceiros.
                </p>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <span><strong>1. Baixe o Docker Desktop:</strong> Instale no Windows se ainda não tiver.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <span><strong>2. Execute o container com 1 comando:</strong></span>
                  </div>
                  <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                    {comandoDocker}
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <span><strong>3. Conecte no GestUp:</strong> Mude a URL da API para <code>http://localhost:8080</code> e pronto!</span>
                  </div>
                </div>
              </div>

              {/* Opção 2: Z-API / Nuvem Gerenciada */}
              <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">Opção 2: Z-API ou VPS na Nuvem</h4>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-brand-blue px-2 py-0.5 rounded-full">
                    24 HORAS
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Para que os disparos automáticos funcionem mesmo quando seu computador pessoal estiver desligado, você pode subir em uma VPS barata (Hetzner, DigitalOcean) ou usar a Z-API.
                </p>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <span>A Z-API (<code>z-api.io</code>) é um serviço de WhatsApp por assinatura sem necessidade de gerenciar servidor.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <span>Você escaneia o QR Code direto no painel da Z-API e cola a chave aqui.</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-100">
                  <p className="text-[11px] text-slate-500">
                    💡 <em>O GestUp aceita tanto a Evolution API quanto a Z-API na mesma rota de disparo!</em>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ABA: CONFIGURAÇÃO DE CREDENCIAIS & API */}
      {abaAtiva === 'configuracoes' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-brand-blue" />
                <span>Credenciais do Gateway WhatsApp</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure os dados da sua instância para envio real de mensagens.
              </p>
            </div>
            {feedbackSalvo && (
              <span className="text-xs font-semibold text-brand-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ✓ Configurações salvas!
              </span>
            )}
          </div>

          <form onSubmit={handleSalvarConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">URL da API (Endpoint)</label>
              <input
                type="text"
                required
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                placeholder="Ex: http://localhost:8080 ou https://sua-api.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome da Instância</label>
                <input
                  type="text"
                  required
                  value={nomeInstancia}
                  onChange={e => setNomeInstancia(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">API Key / Token de Autenticação</label>
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleConfigurarDockerLocal}
                className="text-xs font-semibold text-brand-green hover:underline"
              >
                Preencher com Docker Local (localhost:8080)
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold transition-all shadow-sm"
              >
                Salvar e Ativar Integração
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. HISTÓRICO GLOBAL DE MENSAGENS DISPARADAS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Registro Geral de Mensagens Disparadas</h3>
          <span className="text-xs text-slate-500">{whatsAppMensagens.length} mensagens no histórico</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Destinatário</th>
                <th className="px-4 py-3.5">Tipo</th>
                <th className="px-4 py-3.5">Mensagem</th>
                <th className="px-4 py-3.5">Data / Hora</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {whatsAppMensagens.map(msg => (
                <tr key={msg.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <span className="font-semibold text-slate-900">{msg.destinatario_nome}</span>
                      <p className="text-[10px] text-slate-500">{msg.telefone} ({msg.destinatario_tipo})</p>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-brand-blue">
                      {msg.tipo_notificacao}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 max-w-xs">
                    <p className="text-slate-700 truncate" title={msg.mensagem}>
                      {msg.mensagem}
                    </p>
                  </td>

                  <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                    {msg.data_envio}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-green bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCheck className="w-3 h-3 text-brand-green" />
                      {msg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
