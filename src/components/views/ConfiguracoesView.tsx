'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Departamento } from '@/types';
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
  Key
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
    clientes
  } = useApp();

  const [abaAtiva, setAbaAtiva] = useState<'colaboradores' | 'escritorio' | 'whatsapp'>('colaboradores');
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  // Estados de Teste e Conexão WhatsApp
  const [testeTelefone, setTesteTelefone] = useState('5519992080639');
  const [testeMensagem, setTesteMensagem] = useState('Olá! Esta é uma notificação de teste enviada pela plataforma fin.up GestUp para validar a integração do WhatsApp.');
  const [numeroParaConectar, setNumeroParaConectar] = useState('+55 (19) 99208-0639');
  const [mostrarConfigAvancada, setMostrarConfigAvancada] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState(whatsAppConfig.api_url || 'https://evolution-api-production-ed7c.up.railway.app');
  const [apiKeyInput, setApiKeyInput] = useState(whatsAppConfig.api_key || '68A885CD-5F29-4269-949C-8AEB4D149393');
  const [instanciaInput, setInstanciaInput] = useState(whatsAppConfig.nome_instancia || 'gestup');
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
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Topo de Configurações */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Configurações Gerais do GestUp</h2>
            <p className="text-xs text-slate-500">Parâmetros do escritório, equipe interna e regras do sistema</p>
          </div>
        </div>

        {/* Abas */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setAbaAtiva('colaboradores')}
            className={`px-4 py-2 rounded-xl transition-all ${
              abaAtiva === 'colaboradores'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Equipe & Colaboradores ({colaboradores.length})
          </button>
          <button
            onClick={() => setAbaAtiva('escritorio')}
            className={`px-4 py-2 rounded-xl transition-all ${
              abaAtiva === 'escritorio'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Regras fin.up & Sócios
          </button>
          <button
            onClick={() => setAbaAtiva('whatsapp')}
            className={`px-4 py-2 rounded-xl transition-all ${
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
                      <span>{col.email}</span>
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

      {/* ABA 3: WHATSAPP & CONEXÃO OFICIAL */}
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
                etapasFila08h.push({
                  tarefaId: t.id,
                  tarefaTitulo: t.titulo,
                  clienteNome: t.cliente_nome,
                  etapaTitulo: e.titulo,
                  dataLimite: e.data_limite,
                  telefones: e.configuracao_cobranca?.telefones?.filter(Boolean) || [],
                  frequencia: e.configuracao_cobranca?.frequencia || 'Diariamente'
                });
              }
            });
          }
        });

        return (
          <div className="space-y-6">
            {toastFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-brand-green" />
                <span>{toastFeedback}</span>
              </div>
            )}

            {/* 1. TUTORIAL PASSO A PASSO DIDÁTICO */}
            <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white p-6 rounded-3xl border border-emerald-200/90 shadow-subtle space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-green text-white flex items-center justify-center shadow-md">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Como Vincular o WhatsApp ao GestUp (Passo a Passo)</h3>
                  <p className="text-xs text-slate-600">
                    Siga o guia rápido para conectar o aparelho do escritório e habilitar os disparos automáticos das 08:00h
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 bg-white/90 rounded-2xl border border-emerald-100 shadow-2xs space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-xs text-slate-900">Abra o WhatsApp</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    No seu smartphone, abra o WhatsApp (comum ou WhatsApp Business) do número do escritório.
                  </p>
                </div>

                <div className="p-3.5 bg-white/90 rounded-2xl border border-emerald-100 shadow-2xs space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-bold text-xs text-slate-900">Aparelhos Conectados</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Toque nos <strong>3 pontinhos</strong> (Android) ou em <strong>Configurações</strong> (iPhone) e escolha <strong>Aparelhos Conectados</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-white/90 rounded-2xl border border-emerald-100 shadow-2xs space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-bold text-xs text-slate-900">Conectar um Aparelho</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Toque no botão verde <strong>Conectar um Aparelho</strong> (confirme com biometria ou senha se solicitado).
                  </p>
                </div>

                <div className="p-3.5 bg-white/90 rounded-2xl border border-emerald-100 shadow-2xs space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    4
                  </span>
                  <h4 className="font-bold text-xs text-slate-900">Aponte para o QR Code</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Aponte a câmera para o QR Code gerado abaixo. A sincronização ocorrerá imediatamente!
                  </p>
                </div>
              </div>
            </div>

            {/* 2. CENTRAL DE CONEXÃO & QR CODE INTERATIVO */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Central de Conexão do Aparelho</h3>
                  <p className="text-xs text-slate-500">
                    Sessão criptografada de envio automático via {whatsAppConfig.api_provider}
                  </p>
                </div>

                {whatsAppConfig.conectado ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-brand-green border border-emerald-300 text-xs font-bold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Conectado & Sincronizado</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Aparelho Desconectado</span>
                  </span>
                )}
              </div>

              {/* Bloco de Estado: Conectado vs Desconectado */}
              {whatsAppConfig.conectado ? (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Número Vinculado</span>
                      <p className="font-extrabold text-slate-900 text-sm mt-1">{whatsAppConfig.numero_conectado || '+55 (19) 99208-0639'}</p>
                      <span className="text-[10px] text-brand-green font-semibold">✓ Linha Autorizada</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Nome da Instância</span>
                      <p className="font-extrabold text-slate-900 text-sm mt-1">{whatsAppConfig.nome_instancia}</p>
                      <span className="text-[10px] text-slate-500">Ambiente de Produção</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Provedor Ativo</span>
                      <p className="font-extrabold text-slate-900 text-sm mt-1">{whatsAppConfig.api_provider}</p>
                      <span className="text-[10px] text-indigo-600 font-semibold">Suporte a Grupos e Contatos</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Disparo Matinal Fixo</span>
                      <p className="font-extrabold text-slate-900 text-sm mt-1">Às 08:00h da Manhã</p>
                      <span className="text-[10px] text-brand-green font-semibold">Robô Agendado</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="text-slate-500">
                      Última sincronização com a rede: <strong>{whatsAppConfig.ultima_sincronizacao || 'Hoje às 08:00'}</strong>
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={async () => {
                          setToastFeedback('🔍 Verificando status da sessão no Railway...');
                          const st = await verificarStatusWhatsAppReal();
                          if (st === 'open') {
                            setToastFeedback('🟢 WhatsApp Conectado e Operacional no Railway! Sessão: ABERTA');
                          } else {
                            setToastFeedback(`⚠️ Status atual: ${st}. Se necessário, reconecte o QR Code.`);
                          }
                          setTimeout(() => setToastFeedback(null), 5000);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Testar Conexão em Tempo Real</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          gerarQRCodeWhatsApp();
                          setToastFeedback('📸 Gerando novo QR Code para leitura...');
                          setTimeout(() => setToastFeedback(null), 3000);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reconectar / Ler Novo QR Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          desconectarWhatsApp();
                          setToastFeedback('🔴 Aparelho desconectado do GestUp.');
                          setTimeout(() => setToastFeedback(null), 3000);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <WifiOff className="w-3.5 h-3.5" />
                        <span>Desconectar Aparelho</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ESTADO DESCONECTADO OU MODO QR CODE */
                <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-3 max-w-md">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span>Conecte o WhatsApp para Habilitar os Envios</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Para que o robô do GestUp consiga enviar lembretes de etapas, cobranças de honorários e guias com link, conecte o aparelho escaneando o QR Code ao lado.
                    </p>

                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-bold text-slate-700">Número que será vinculado:</label>
                      <input
                        type="text"
                        value={numeroParaConectar}
                        onChange={e => setNumeroParaConectar(e.target.value)}
                        placeholder="+55 (19) 99208-0639"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          conectarWhatsAppSimulado(numeroParaConectar);
                          setToastFeedback('🎉 WhatsApp vinculado e conectado com sucesso!');
                          setTimeout(() => setToastFeedback(null), 4000);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-brand-green hover:bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simular Leitura do Celular (Conectar Agora)</span>
                      </button>
                    </div>
                  </div>

                  {/* QR CODE ILUSTRADO REALISTA */}
                  <div className="bg-white p-5 rounded-3xl border-2 border-emerald-300 shadow-lg text-center space-y-2">
                    <div className="w-48 h-48 mx-auto bg-slate-900 p-2.5 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                      {/* Simulação de Matriz de QR Code com Logo WhatsApp no Centro */}
                      <div className="w-full h-full bg-white rounded-xl p-2 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-8 h-8 border-4 border-slate-900 rounded-sm p-1 flex items-center justify-center">
                            <div className="w-3 h-3 bg-slate-900 rounded-xs" />
                          </div>
                          <div className="w-8 h-8 border-4 border-slate-900 rounded-sm p-1 flex items-center justify-center">
                            <div className="w-3 h-3 bg-slate-900 rounded-xs" />
                          </div>
                        </div>
                        <div className="w-10 h-10 mx-auto rounded-full bg-brand-green text-white flex items-center justify-center shadow-md">
                          <MessageSquare className="w-5 h-5 fill-current" />
                        </div>
                        <div className="flex justify-between">
                          <div className="w-8 h-8 border-4 border-slate-900 rounded-sm p-1 flex items-center justify-center">
                            <div className="w-3 h-3 bg-slate-900 rounded-xs" />
                          </div>
                          <div className="w-6 h-6 bg-slate-900 rounded-sm" />
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700">Aponte a câmera do WhatsApp aqui</p>
                    <span className="text-[10px] text-slate-400 block">Sessão protegida por criptografia</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. PARÂMETROS DAS 08:00H & FILA DE PROCESSOS MONITORADOS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
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

            {/* CREDENCIAIS DA EVOLUTION API (RAILWAY) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
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

            {/* 4. SANDBOX / TESTE DE DISPARO IMEDIATO */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center">
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

            {/* 5. HISTÓRICO DOS ÚLTIMOS DISPAROS */}
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
