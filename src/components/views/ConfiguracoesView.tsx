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
  X
} from 'lucide-react';

export function ConfiguracoesView() {
  const {
    colaboradores,
    addColaborador,
    whatsAppConfig,
    atualizarWhatsAppConfig
  } = useApp();

  const [abaAtiva, setAbaAtiva] = useState<'colaboradores' | 'escritorio' | 'whatsapp'>('colaboradores');

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

      {/* ABA 3: WHATSAPP */}
      {abaAtiva === 'whatsapp' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Status da Instância do WhatsApp</h3>
              <p className="text-xs text-slate-500">Conexão oficial da fin.up via Evolution API</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-brand-green border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Instância Conectada ({whatsAppConfig.numero_conectado})</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Provedor Selecionado</span>
              <p className="font-bold text-slate-900 text-sm mt-1">{whatsAppConfig.api_provider}</p>
              <p className="text-slate-500 text-[11px] mt-1">Suporta envio para números e Grupos de WhatsApp (@g.us)</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Nome da Instância</span>
              <p className="font-bold text-slate-900 text-sm mt-1">{whatsAppConfig.nome_instancia}</p>
              <p className="text-slate-500 text-[11px] mt-1">Disparos matinais agendados para às {whatsAppConfig.hora_envio_manha}</p>
            </div>
          </div>
        </div>
      )}

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
                    placeholder="5519999870840"
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
