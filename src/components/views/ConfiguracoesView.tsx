'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Departamento, ModeloMensagemTarefa } from '@/types';
import {
  Settings,
  Users,
  Shield,
  MessageSquare,
  Plus,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  DollarSign,
  X,
  QrCode,
  Smartphone,
  Wifi,
  WifiOff,
  Clock,
  Send,
  Bell,
  Layers,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  Check,
  Copy,
  ExternalLink,
  Key,
  Globe,
  FileText,
  RotateCcw,
  Tag
} from 'lucide-react';

export function ConfiguracoesView() {
  const {
    colaboradores,
    addColaborador,
    whatsAppConfig,
    atualizarWhatsAppConfig,
    whatsAppMensagens,
    enviarMensagemWhatsApp,
    conectarWhatsAppSimulado,
    desconectarWhatsApp,
    gerarQRCodeWhatsApp,
    verificarStatusWhatsAppReal,
    executarReguaManha08h,
    tarefas,
    clientes,
    modelosMensagens,
    salvarModeloMensagem,
    restaurarModelosMensagensPadrao
  } = useApp();

  const [abaAtiva, setAbaAtiva] = useState<'colaboradores' | 'escritorio' | 'modelos' | 'whatsapp'>('colaboradores');
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  // Estados dos Modelos de Mensagens
  const [modeloSelecionadoId, setModeloSelecionadoId] = useState<string>('simples_nacional');
  const [textosModelos, setTextosModelos] = useState<Record<string, string>>({});

  useEffect(() => {
    const mapa: Record<string, string> = {};
    modelosMensagens.forEach(m => {
      mapa[m.id] = m.texto_template;
    });
    setTextosModelos(mapa);
  }, [modelosMensagens]);

  // Estados de Teste e Conexão WhatsApp
  const [testeTelefone, setTesteTelefone] = useState('5519992080639');
  const [testeMensagem, setTesteMensagem] = useState('Olá! Esta é uma notificação de teste enviada pela plataforma fin.up GestUp para validar a integração do WhatsApp.');
  const [numeroParaConectar, setNumeroParaConectar] = useState('+55 (19) 99208-0639');
  const [mostrarConfigAvancada, setMostrarConfigAvancada] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState(whatsAppConfig.api_url || 'https://evolution-api-production-ed7c.up.railway.app');
  const [apiKeyInput, setApiKeyInput] = useState(whatsAppConfig.api_key || '68A885CD-5F29-4269-949C-8AEB4D149393');
  const [instanciaInput, setInstanciaInput] = useState(whatsAppConfig.nome_instancia || 'gestup');
  const [dominioPublicoInput, setDominioPublicoInput] = useState(whatsAppConfig.dominio_publico || '');
  const [salvandoCredenciais, setSalvandoCredenciais] = useState(false);

  // Modal Novo Colaborador
  const [modalNovo, setModalNovo] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('Analista Fiscal Pleno');
  const [departamento, setDepartamento] = useState<Departamento>('Fiscal');
  const [telefone, setTelefone] = useState('');

  const handleSalvarColaborador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    addColaborador({
      nome,
      email,
      cargo,
      departamento,
      status: 'Ativo',
      telefone,
      whatsapp: telefone,
      data_admissao: new Date().toISOString().split('T')[0]
    });

    setModalNovo(false);
    setNome('');
    setEmail('');
    setTelefone('');
    setToastFeedback('👤 Colaborador adicionado à equipe com sucesso!');
    setTimeout(() => setToastFeedback(null), 3000);
  };

  const modeloAtual = modelosMensagens.find(m => m.id === modeloSelecionadoId) || modelosMensagens[0];

  const handleInserirTag = (tag: string) => {
    if (!modeloAtual) return;
    const textoAtual = textosModelos[modeloAtual.id] ?? modeloAtual.texto_template;
    setTextosModelos(prev => ({
      ...prev,
      [modeloAtual.id]: textoAtual + ` {${tag}} `
    }));
  };

  const handleSalvarModelo = (id: string) => {
    const texto = textosModelos[id];
    const target = modelosMensagens.find(m => m.id === id) || modeloAtual;
    if (texto !== undefined && target) {
      salvarModeloMensagem({
        ...target,
        texto_template: texto
      });
      setToastFeedback(`💾 Modelo de mensagem "${target.nome}" salvo com sucesso!`);
      setTimeout(() => setToastFeedback(null), 3500);
    }
  };

  const simularMensagemExemplo = (template: string) => {
    return template
      .replace(/\{razao_social\}/g, 'Padaria e Confeitaria Alvorada Ltda')
      .replace(/\{competencia\}/g, '10/2026')
      .replace(/\{vencimento_guia\}/g, '20/11/2026')
      .replace(/\{valor_guia\}/g, 'R$ 1.450,80')
      .replace(/\{nome_tarefa\}/g, 'Apuração do Simples Nacional (DAS)')
      .replace(/\{nome_contato\}/g, 'Carlos Silva')
      .replace(/\{nome_arquivo\}/g, 'DAS_10_2026_PADARIA_ALVORADA.pdf')
      .replace(/\{link_guia\}/g, 'https://gestup.vercel.app/portal/guia?id=exemplo');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Feedback */}
      {toastFeedback && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold">{toastFeedback}</p>
          </div>
        </div>
      )}

      {/* Topo de Configurações */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Configurações Gerais do GestUp</h2>
            <p className="text-xs text-slate-500">Parâmetros do escritório, equipe interna, modelos de mensagens e regras do sistema</p>
          </div>
        </div>

        {/* Abas com rolagem horizontal no mobile */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full">
          <button
            onClick={() => setAbaAtiva('colaboradores')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              abaAtiva === 'colaboradores'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Equipe ({colaboradores.length})
          </button>
          <button
            onClick={() => setAbaAtiva('escritorio')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              abaAtiva === 'escritorio'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Regras fin.up & Sócios
          </button>
          <button
            onClick={() => setAbaAtiva('modelos')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              abaAtiva === 'modelos'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Modelos de Mensagens</span>
          </button>
          <button
            onClick={() => setAbaAtiva('whatsapp')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              abaAtiva === 'whatsapp'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conexão WhatsApp
          </button>
        </div>
      </div>

      {/* ABA 1: COLABORADORES */}
      {abaAtiva === 'colaboradores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Membros da Equipe e Analistas Responsáveis</h3>
            <button
              onClick={() => setModalNovo(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Colaborador</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colaboradores.map(col => (
              <div key={col.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-blue">
                      {col.departamento}
                    </span>
                    <span className="text-[10px] font-bold text-brand-green bg-emerald-50 px-2 py-0.5 rounded-full">
                      {col.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-3">{col.nome}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{col.cargo}</p>

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{col.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{col.telefone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Admissão: {col.data_admissao}</span>
                  <span className="text-brand-blue font-semibold">Notificações Ativas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 2: REGRAS FIN.UP & SÓCIOS */}
      {abaAtiva === 'escritorio' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Parâmetros da fin.up & Divisão Societária</h3>
            <p className="text-xs text-slate-500">Regras oficiais de divisão de resultados e reservas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
              <span className="text-xs font-semibold text-brand-blue uppercase">Sócio Guilherme</span>
              <p className="text-2xl font-black text-brand-blue mt-1">35%</p>
              <p className="text-[11px] text-slate-600 mt-1">Participação nos lucros líquidos</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
              <span className="text-xs font-semibold text-brand-blue uppercase">Sócio Ygor</span>
              <p className="text-2xl font-black text-brand-blue mt-1">35%</p>
              <p className="text-[11px] text-slate-600 mt-1">Participação nos lucros líquidos</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200">
              <span className="text-xs font-semibold text-purple-700 uppercase">fin.up Consultoria</span>
              <p className="text-2xl font-black text-purple-700 mt-1">30%</p>
              <p className="text-[11px] text-purple-900 mt-1">20% Caixa Operacional + 10% Reserva de Emergência</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-800">Banco Oficial de Recebimento & BPO:</span>
            <p className="text-slate-600">
              🏦 <strong>PicPay Empresas</strong> (com suporte à conciliação via extrato OFX e chave PIX automática nas guias enviadas aos clientes).
            </p>
          </div>
        </div>
      )}

      {/* ABA 3: MODELOS DE MENSAGENS PERSONALIZADAS POR TAREFA */}
      {abaAtiva === 'modelos' && (
        <div className="space-y-6">
          {/* Banner Explicativo */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-white p-5 rounded-3xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-blue text-white flex items-center justify-center shrink-0 shadow-md">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span>Mensagens Padrão Personalizadas por Tipo de Tarefa</span>
                  <span className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-green/20">
                    Disparo Automático
                  </span>
                </h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Defina o texto exato que seu cliente receberá via WhatsApp e E-mail ao concluir cada obrigação (Simples Nacional, Folha, DCTFWeb, etc.).
                  O GestUp preenche automaticamente as informações de <strong>Competência</strong>, <strong>Vencimento da Guia</strong> e <strong>Razão Social</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja restaurar todos os modelos para os textos padrão originais da fin.up?')) {
                  restaurarModelosMensagensPadrao();
                  setToastFeedback('🔄 Modelos de mensagens restaurados com sucesso!');
                  setTimeout(() => setToastFeedback(null), 3000);
                }
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar Padrão fin.up</span>
            </button>
          </div>

          {/* Dicionário de Tags Dinâmicas */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Tag className="w-3.5 h-3.5 text-brand-blue" />
              <span>Variáveis Dinâmicas Disponíveis (clique para inserir no modelo selecionado):</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {[
                { tag: 'razao_social', desc: 'Razão Social / Nome da Empresa' },
                { tag: 'competencia', desc: 'Mês/Ano de Apuração (ex: 10/2026)' },
                { tag: 'vencimento_guia', desc: 'Data de Vencimento da Guia' },
                { tag: 'valor_guia', desc: 'Valor a Pagar (R$)' },
                { tag: 'link_guia', desc: 'Link Seguro para Baixar a Guia' },
                { tag: 'nome_tarefa', desc: 'Nome da Tarefa' },
                { tag: 'nome_contato', desc: 'Nome do Destinatário' },
                { tag: 'nome_arquivo', desc: 'Nome do Arquivo PDF Anexado' }
              ].map(item => (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => handleInserirTag(item.tag)}
                  title={`Inserir {${item.tag}} no texto`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-brand-blue border border-slate-200 text-slate-700 transition-all font-mono text-[11px]"
                >
                  <span className="font-bold text-brand-blue">{`{${item.tag}}`}</span>
                  <span className="text-slate-400 font-sans text-[10px]">({item.desc})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seletor de Modelo e Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coluna 1: Lista de Modelos (4 colunas) */}
            <div className="lg:col-span-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Tipos de Tarefas & Obrigações
              </h4>
              <div className="space-y-2">
                {modelosMensagens.map(modelo => {
                  const isSelected = modelo.id === modeloAtual?.id;
                  return (
                    <button
                      key={modelo.id}
                      type="button"
                      onClick={() => setModeloSelecionadoId(modelo.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-brand-blue shadow-xs ring-1 ring-brand-blue/30'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{modelo.nome}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
                          {modelo.categoria_tarefa}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {modelo.descricao}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                        <span>Gatilhos:</span>
                        <span className="italic truncate font-mono">{modelo.palavras_chave.slice(0, 3).join(', ')}...</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coluna 2: Editor e Preview em Tempo Real (8 colunas) */}
            <div className="lg:col-span-8 space-y-4">
              {modeloAtual && (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{modeloAtual.nome}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-brand-blue">
                          {modeloAtual.tipo_chave}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{modeloAtual.descricao}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSalvarModelo(modeloAtual.id)}
                      className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvar Este Modelo</span>
                    </button>
                  </div>

                  {/* Campo Textarea do Modelo */}
                  <div>
                    <label className="block font-semibold text-xs text-slate-700 mb-1.5">
                      Conteúdo da Mensagem Padrão:
                    </label>
                    <textarea
                      rows={9}
                      value={textosModelos[modeloAtual.id] ?? modeloAtual.texto_template}
                      onChange={e => {
                        const val = e.target.value;
                        setTextosModelos(prev => ({
                          ...prev,
                          [modeloAtual.id]: val
                        }));
                      }}
                      className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 font-sans text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-brand-blue focus:outline-none bg-slate-50/50"
                      placeholder="Escreva a mensagem personalizada usando as variáveis dinâmicas..."
                    />
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Dica: Use quebras de linha normais e emojis para tornar o texto amigável.</span>
                      <span>{(textosModelos[modeloAtual.id] ?? modeloAtual.texto_template).length} caracteres</span>
                    </p>
                  </div>

                  {/* Preview Simulado do WhatsApp */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-brand-green" />
                      <span>Pré-visualização Real no WhatsApp do Cliente:</span>
                    </span>

                    <div className="p-4 rounded-2xl bg-[#EFEAE2] border border-[#DAD3C8] max-w-lg shadow-inner">
                      <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs shadow-xs text-xs text-slate-800 leading-relaxed space-y-2 relative">
                        <p className="whitespace-pre-line">
                          {simularMensagemExemplo(textosModelos[modeloAtual.id] ?? modeloAtual.texto_template)}
                        </p>
                        <div className="flex justify-end items-center gap-1 text-[9px] text-slate-400 pt-1">
                          <span>09:41</span>
                          <span className="text-blue-500 font-bold">✓✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: WHATSAPP & CONEXÃO OFICIAL */}
      {abaAtiva === 'whatsapp' && (() => {
        // Coleta todas as etapas ativas no sistema com cobrança agendada para as 08:00h
        const etapasFila08h: {
          tarefaId: string;
          tarefaTitulo: string;
          clienteNome: string;
          etapaTitulo: string;
          dataLimite: string;
          telefones: string[];
          frequencia: string;
        }[] = [];

        tarefas.forEach(t => {
          if (t.eh_processo && t.etapas_processo) {
            t.etapas_processo.forEach(e => {
              if (e.cobrar_whatsapp && !e.concluida) {
                const cliente = clientes.find(c => c.id === t.cliente_id);
                const tels: string[] = [];
                if (e.configuracao_cobranca?.telefones?.length) {
                  tels.push(...e.configuracao_cobranca.telefones);
                }
                if (tels.length === 0 && cliente?.whatsapp) tels.push(cliente.whatsapp);

                etapasFila08h.push({
                  tarefaId: t.id,
                  tarefaTitulo: t.titulo,
                  clienteNome: cliente?.nome || t.cliente_nome,
                  etapaTitulo: e.titulo,
                  dataLimite: e.data_limite || t.data_prazo_legal || 'A definir',
                  telefones: tels,
                  frequencia: e.configuracao_cobranca?.frequencia || 'Diariamente'
                });
              }
            });
          }
        });

        return (
          <div className="space-y-6">
            {/* 1. STATUS E CONEXÃO DO WHATSAPP */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    whatsAppConfig.conectado ? 'bg-emerald-50 text-brand-green' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {whatsAppConfig.conectado ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">Integração WhatsApp Oficial fin.up</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        whatsAppConfig.conectado
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {whatsAppConfig.conectado ? 'Conectado e Operacional' : 'Aguardando Pareamento'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {whatsAppConfig.conectado
                        ? `Número autenticado: ${whatsAppConfig.numero_conectado || '+55 (19) 99208-0639'}`
                        : 'Conecte seu WhatsApp corporativo fin.up para disparar guias e cobranças automáticas'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {whatsAppConfig.conectado ? (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          setToastFeedback('🔍 Verificando status na Evolution API...');
                          const status = await verificarStatusWhatsAppReal();
                          if (status === 'open') {
                            setToastFeedback('🟢 Conexão confirmada com a Evolution API! Instância ativa.');
                          } else {
                            setToastFeedback(`⚠️ Instância não encontrada ou desconectada na Evolution API (Status: ${status}).`);
                          }
                          setTimeout(() => setToastFeedback(null), 5000);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Verificar Status Real</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          desconectarWhatsApp();
                          setToastFeedback('🔌 Sessão desconectada.');
                          setTimeout(() => setToastFeedback(null), 3000);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                      >
                        Desconectar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setToastFeedback('📱 Gerando QR Code de conexão...');
                          gerarQRCodeWhatsApp();
                          setToastFeedback('📸 Aponte a câmera do WhatsApp para o QR Code abaixo para conectar.');
                          setTimeout(() => setToastFeedback(null), 5000);
                        }}
                        className="px-4 py-2 rounded-xl bg-brand-green hover:bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Gerar QR Code de Conexão</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          conectarWhatsAppSimulado(numeroParaConectar);
                          setToastFeedback('✅ WhatsApp conectado em modo direto para testes!');
                          setTimeout(() => setToastFeedback(null), 4000);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
                      >
                        Ativar Conexão Direta
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* QR Code Exibido se disponível */}
              {!whatsAppConfig.conectado && whatsAppConfig.qr_code && (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={whatsAppConfig.qr_code}
                      alt="QR Code WhatsApp"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-600 font-medium text-center">
                    Abra o WhatsApp no celular {numeroParaConectar} &gt; <strong>Aparelhos conectados</strong> &gt; <strong>Conectar um aparelho</strong>
                  </p>
                </div>
              )}
            </div>

            {/* 2. CONFIGURAÇÃO DO DOMÍNIO PÚBLICO / LINKS DE GUIAS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Domínio Público do Portal / Links das Guias</h3>
                  <p className="text-xs text-slate-500">
                    Endereço público oficial que os clientes acessarão para abrir e baixar as guias anexadas
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    URL do Portal do Cliente (Vercel ou Domínio Próprio)
                  </label>
                  <input
                    type="text"
                    value={dominioPublicoInput}
                    onChange={e => setDominioPublicoInput(e.target.value)}
                    placeholder="Ex: https://meu-gestup.vercel.app (deixe vazio para usar a URL atual do navegador)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Se estiver em branco, o sistema usará automaticamente o endereço onde você estiver navegando (ex: localhost ou seu link da Vercel).
                  </p>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      atualizarWhatsAppConfig({
                        dominio_publico: dominioPublicoInput.trim()
                      });
                      setToastFeedback('🌐 Domínio público das guias atualizado com sucesso!');
                      setTimeout(() => setToastFeedback(null), 3000);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Domínio</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. PARÂMETROS DAS 08:00H & FILA DE PROCESSOS MONITORADOS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Régua Automática das 08:00h da Manhã</h3>
                    <p className="text-xs text-slate-500">
                      Disparo diário de cobrança de etapas não concluídas e lembretes de guias
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={async () => {
                      setToastFeedback('⏳ Disparando régua matinal para as etapas pendentes...');
                      const res = await executarReguaManha08h();
                      if (res.totalDisparados === 0) {
                        setToastFeedback('ℹ️ Nenhuma etapa com cobrança pendente para disparo neste momento.');
                      } else {
                        setToastFeedback(`🎉 Sucesso! ${res.totalDisparados} mensagem(ns) disparada(s) via WhatsApp!`);
                      }
                      setTimeout(() => setToastFeedback(null), 5000);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Executar Régua das 08:00h Agora</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      atualizarWhatsAppConfig({ auto_enviar_manha: !whatsAppConfig.auto_enviar_manha });
                      setToastFeedback(
                        whatsAppConfig.auto_enviar_manha
                          ? '⏸️ Disparos automáticos das 08h pausados.'
                          : '▶️ Disparos automáticos das 08h ativados com sucesso!'
                      );
                      setTimeout(() => setToastFeedback(null), 3000);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      whatsAppConfig.auto_enviar_manha
                        ? 'bg-emerald-50 text-brand-green border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {whatsAppConfig.auto_enviar_manha ? '🟢 Ativado às 08:00' : '⚪ Pausado'}
                  </button>
                </div>
              </div>

              {/* Fila em Tempo Real de Etapas de Processos */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Fila Atual de Processos com Cobrança Ativa às 08:00h ({etapasFila08h.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    A cobrança de cada etapa só para quando for marcada como concluída
                  </span>
                </div>

                {etapasFila08h.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
                    Nenhuma etapa de processo pendente com cobrança agendada no momento.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                    {etapasFila08h.map((item, idx) => (
                      <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white transition-all text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{item.etapaTitulo}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {item.frequencia}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            🏢 <strong>{item.clienteNome}</strong> • Tarefa: {item.tarefaTitulo} • Prazo: {item.dataLimite}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            📱 {item.telefones.join(' | ') || 'Telefone não informado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. CREDENCIAIS DA EVOLUTION API (RAILWAY) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Credenciais da API de WhatsApp (Railway)</h3>
                    <p className="text-xs text-slate-500">
                      Parâmetros da sua Evolution API na nuvem para envio de mensagens reais
                    </p>
                  </div>
                </div>
                {salvandoCredenciais && (
                  <span className="text-xs font-bold text-brand-green bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    ✓ Credenciais Salvas!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">URL da API (Endpoint)</label>
                  <input
                    type="text"
                    value={apiUrlInput}
                    onChange={e => setApiUrlInput(e.target.value)}
                    placeholder="https://evolution-api-production-ed7c.up.railway.app"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome da Instância</label>
                  <input
                    type="text"
                    value={instanciaInput}
                    onChange={e => setInstanciaInput(e.target.value)}
                    placeholder="gestup"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">API Key / Chave de Acesso</label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder="68A885CD-5F29-4269-949C..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    atualizarWhatsAppConfig({
                      api_url: apiUrlInput.trim(),
                      api_key: apiKeyInput.trim(),
                      nome_instancia: instanciaInput.trim()
                    });
                    setSalvandoCredenciais(true);
                    setToastFeedback('💾 Credenciais da Evolution API salvas com sucesso!');
                    setTimeout(() => {
                      setSalvandoCredenciais(false);
                      setToastFeedback(null);
                    }, 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Credenciais da API</span>
                </button>
              </div>
            </div>

            {/* 5. SANDBOX / TESTE DE DISPARO IMEDIATO */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Testar Envio Imediato de Mensagem (Sandbox)</h3>
                  <p className="text-xs text-slate-500">
                    Dispare uma notificação de teste para qualquer número e confira a entrega no seu WhatsApp
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número Destinatário (com DDD) *</label>
                  <input
                    type="text"
                    value={testeTelefone}
                    onChange={e => setTesteTelefone(e.target.value)}
                    placeholder="5519992080639"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Texto da Notificação de Teste *</label>
                  <input
                    type="text"
                    value={testeMensagem}
                    onChange={e => setTesteMensagem(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    if (!testeTelefone) {
                      alert('Digite o número para o envio.');
                      return;
                    }
                    setToastFeedback('⏳ Enviando mensagem para o WhatsApp via Railway...');
                    const ok = await enviarMensagemWhatsApp('Cliente', 'Teste Manual', testeTelefone, 'Lembrete Prazo', testeMensagem);
                    if (ok) {
                      setToastFeedback(`🎉 Mensagem ENTREGUE com sucesso para ${testeTelefone}! Verifique seu celular.`);
                    } else {
                      setToastFeedback(`⚠️ O envio foi disparado. Se não chegar em instantes, verifique o número ou a sessão.`);
                    }
                    setTimeout(() => setToastFeedback(null), 5000);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-green hover:bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Mensagem de Teste Agora</span>
                </button>
              </div>
            </div>

            {/* 6. HISTÓRICO DOS ÚLTIMOS DISPAROS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-green" />
                  <span>Histórico das Últimas Notificações Enviadas ({whatsAppMensagens.length})</span>
                </h4>
                <span className="text-[11px] text-slate-400">Log em tempo real das mensagens disparadas pelo robô</span>
              </div>

              {whatsAppMensagens.length === 0 ? (
                <p className="text-slate-400 italic text-xs py-3 text-center">Nenhum envio registrado ainda.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40 max-h-60 overflow-y-auto text-xs">
                  {whatsAppMensagens.slice(0, 8).map(msg => (
                    <div key={msg.id} className="p-3 flex items-start justify-between gap-3 hover:bg-white transition-all">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{msg.destinatario_nome}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({msg.telefone})</span>
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-blue-50 text-brand-blue">
                            {msg.tipo_notificacao}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1">{msg.mensagem}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {msg.status}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{msg.data_envio}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* MODAL NOVO COLABORADOR */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Adicionar Novo Colaborador</h3>
              <button onClick={() => setModalNovo(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarColaborador} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departamento</label>
                  <select
                    value={departamento}
                    onChange={e => setDepartamento(e.target.value as Departamento)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Fiscal">Fiscal</option>
                    <option value="Contábil">Contábil</option>
                    <option value="Pessoal">Pessoal / RH</option>
                    <option value="Financeiro">Financeiro / BPO</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp para Alertas</label>
                  <input
                    type="text"
                    required
                    placeholder="5519992080639"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cargo</label>
                <input
                  type="text"
                  value={cargo}
                  onChange={e => setCargo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold shadow-sm"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
