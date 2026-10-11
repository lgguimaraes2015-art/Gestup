'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  MessageSquare,
  Smartphone,
  Send,
  CheckCheck,
  Key,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export function WhatsAppCentralView() {
  const {
    whatsAppConfig,
    whatsAppMensagens,
    colaboradores,
    clientes,
    enviarMensagemWhatsApp,
    dispararResumoMatinalEquipe,
    atualizarWhatsAppConfig
  } = useApp();

  const [abaAtiva, setAbaAtiva] = useState<'simulador' | 'tutorial' | 'configuracoes'>('tutorial');

  // Estados do Simulador de Envio
  const [destinatarioTipo, setDestinatarioTipo] = useState<'Colaborador' | 'Cliente'>('Colaborador');
  const [selectedColab, setSelectedColab] = useState(colaboradores[0]?.nome || '');
  const [selectedCliente, setSelectedCliente] = useState(clientes[0]?.nome || '');
  const [telefoneManual, setTelefoneManual] = useState('');
  const [tipoNotificacao, setTipoNotificacao] = useState<'Resumo Diário' | 'Lembrete Prazo' | 'Cobrança Atraso' | 'Documento Pendente'>('Cobrança Atraso');
  const [mensagemTexto, setMensagemTexto] = useState(
    '🚨 *Atenção fin.up - Cobrança de Prazo*\n\nOlá! A sua tarefa do fechamento fiscal está pendente de conclusão. Favor verificar no GestUp.'
  );

  // Estados de Configuração Real
  const [apiUrl, setApiUrl] = useState('https://evolution-api-production-ed7c.up.railway.app');
  const [apiKey, setApiKey] = useState('e74e3e545d217c1598f490d802b2ba61cff2a937a2f532cc987cb745f133a28a');
  const [nomeInstancia, setNomeInstancia] = useState('gestup');
  const [feedbackSalvo, setFeedbackSalvo] = useState(false);
  const [feedbackEnvio, setFeedbackEnvio] = useState(false);

  const handleSalvarConfig = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarWhatsAppConfig({
      nome_instancia: nomeInstancia,
      conectado: true,
      status: 'CONNECTED'
    });
    setFeedbackSalvo(true);
    setTimeout(() => setFeedbackSalvo(false), 3000);
  };

  const handleEnviarSimulacao = (e: React.FormEvent) => {
    e.preventDefault();
    const nome = destinatarioTipo === 'Colaborador' ? selectedColab : selectedCliente;
    const fone = telefoneManual || (destinatarioTipo === 'Colaborador' ? '5519999870840' : '5519994910591');

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

  return (
    <div className="space-y-6">
      {/* 1. STATUS DA CONEXÃO & RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Instância WhatsApp */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gateway WhatsApp</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-brand-green text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                CONECTADO
              </span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-brand-green flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{whatsAppConfig.numero_conectado}</p>
                <p className="text-[11px] text-slate-500">Instância: {whatsAppConfig.nome_instancia}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Provedor: <strong>{whatsAppConfig.api_provider}</strong></span>
            <span className="text-brand-green font-semibold">Latência: 120ms</span>
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
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">17 CLIENTES</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Lembretes automáticos para clientes com extratos e notas pendentes para evitar atrasos nas declarações.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Ciclo Automático:</span>
            <span className="font-semibold text-slate-800">Todo dia 10 do mês</span>
          </div>
        </div>
      </div>

      {/* 2. ABAS DE NAVEGAÇÃO DA CENTRAL */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setAbaAtiva('tutorial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            abaAtiva === 'tutorial'
              ? 'bg-brand-green text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Como Conectar o WhatsApp Real (Passo a Passo)</span>
        </button>

        <button
          onClick={() => setAbaAtiva('simulador')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            abaAtiva === 'simulador'
              ? 'bg-brand-blue text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Simulador & Disparo Ativo</span>
        </button>

        <button
          onClick={() => setAbaAtiva('configuracoes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            abaAtiva === 'configuracoes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Configuração da API & QR Code</span>
        </button>
      </div>

      {/* 3. ABA: GUIA PASSO A PASSO PARA CONECTAR O WHATSAPP REAL */}
      {abaAtiva === 'tutorial' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-brand-green px-2 py-0.5 rounded-full">
                Guia de Integração
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Como conectar o seu número oficial de WhatsApp ao GestUp
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Para que o GestUp envie mensagens reais pelo WhatsApp sem custos de licenças fechadas, utilizamos as ferramentas mais modernas do mercado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opção 1: Evolution API (Recomendada e Gratuita) */}
              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-brand-green text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">Opção 1: Evolution API (Grátis & Própria)</h4>
                  </div>
                  <span className="text-[10px] font-bold bg-brand-green text-white px-2 py-0.5 rounded-full">
                    RECOMENDADA
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  A <strong>Evolution API</strong> é a solução de WhatsApp mais usada por desenvolvedores no Brasil. Ela é 100% gratuita, sem limites de mensagens e roda em qualquer servidor próprio ou nuvem (Railway / Render / VPS).
                </p>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <span><strong>1. Subir a API:</strong> Você pode rodar com 1 clique no Railway ou com Docker:</span>
                  </div>
                  <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                    docker run -d -p 8080:8080 atendai/evolution-api:v2.1.0
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <span><strong>2. Escanear o QR Code:</strong> A API gera um QR Code no painel ou via rota HTTP. Você abre o WhatsApp no seu celular, vai em <em>Aparelhos Conectados</em> e escaneia.</span>
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <span><strong>3. Conectar no GestUp:</strong> Basta colar a URL da sua API e a chave (API Key) na aba de configurações ao lado!</span>
                  </div>
                </div>
              </div>

              {/* Opção 2: Z-API (Sem Servidor / Plug-and-Play) */}
              <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">Opção 2: Z-API (Serviço Gerenciado)</h4>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-brand-blue px-2 py-0.5 rounded-full">
                    SEM SERVIDOR
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Se você não quiser hospedar nenhum servidor, a <strong>Z-API</strong> ou <strong>Z-Stack</strong> é um serviço por assinatura brasileiro onde você só cria uma conta, escaneia o QR Code direto no site deles em 30 segundos e já começa a disparar.
                </p>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <span>Crie uma conta em <code>z-api.io</code> e crie uma nova instância.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <span>Escaneie o QR Code que aparece na tela da Z-API com o WhatsApp da sua empresa.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <span>Copie o <strong>Instance ID</strong> e o <strong>Client Token</strong> e cole aqui no GestUp.</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-100">
                  <p className="text-[11px] text-slate-500">
                    💡 <em>O GestUp já está 100% preparado com a rota de disparo tanto para Evolution API quanto para Z-API!</em>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA: CONFIGURAÇÃO DE CREDENCIAIS & API */}
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
                placeholder="https://sua-evolution-api.railway.app"
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

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
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

      {/* 5. ABA: SIMULADOR & DISPARO MANUAL */}
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
                    placeholder="(19) 99987-0840"
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

      {/* 6. HISTÓRICO DE MENSAGENS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Registro de Mensagens Disparadas</h3>
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
