'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Departamento, Colaborador } from '@/types';
import {
  Mail,
  Phone,
  MessageSquare,
  Plus,
  X,
  Edit3,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export function ColaboradoresView() {
  const {
    colaboradores,
    addColaborador,
    updateColaborador,
    deleteColaborador,
    tarefas,
    enviarMensagemWhatsApp
  } = useApp();

  const [modalNovo, setModalNovo] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Estados Novo Colaborador
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('Analista Fiscal Pleno');
  const [departamento, setDepartamento] = useState<Departamento>('Fiscal');
  const [telefone, setTelefone] = useState('');

  // Estados Edição Colaborador
  const [colaboradorEditando, setColaboradorEditando] = useState<Colaborador | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCargo, setEditCargo] = useState('');
  const [editDepartamento, setEditDepartamento] = useState<Departamento>('Fiscal');
  const [editTelefone, setEditTelefone] = useState('');
  const [editStatus, setEditStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  const handleSalvarNovo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    addColaborador({
      nome: nome.trim(),
      email: email.trim(),
      cargo: cargo.trim(),
      departamento,
      status: 'Ativo',
      telefone: telefone.trim(),
      whatsapp: telefone.trim(),
      data_admissao: new Date().toISOString().split('T')[0]
    });

    setModalNovo(false);
    setNome('');
    setEmail('');
    setTelefone('');
    setToastMsg('👤 Usuário/Colaborador cadastrado com sucesso!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAbrirEdicao = (col: Colaborador) => {
    setColaboradorEditando(col);
    setEditNome(col.nome);
    setEditEmail(col.email);
    setEditCargo(col.cargo);
    setEditDepartamento(col.departamento);
    setEditTelefone(col.telefone);
    setEditStatus(col.status);
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorEditando || !editNome.trim()) return;

    updateColaborador(colaboradorEditando.id, {
      nome: editNome.trim(),
      email: editEmail.trim(),
      cargo: editCargo.trim(),
      departamento: editDepartamento,
      telefone: editTelefone.trim(),
      whatsapp: editTelefone.trim(),
      status: editStatus
    });

    setColaboradorEditando(null);
    setToastMsg(`👤 Colaborador "${editNome}" atualizado com sucesso!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExcluir = (col: Colaborador) => {
    if (confirm(`Tem certeza que deseja excluir o usuário "${col.nome}" da fin.up?`)) {
      deleteColaborador(col.id);
      setToastMsg(`🗑️ Usuário "${col.nome}" excluído da equipe.`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-brand-green" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Equipe & Analistas Responsáveis</h2>
          <p className="text-xs text-slate-500">
            Gestão de colaboradores da fin.up: crie novos usuários, edite funções e defina responsáveis por departamento
          </p>
        </div>
        <button
          onClick={() => setModalNovo(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Usuário / Colaborador</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {colaboradores.map(colab => {
          const tarefasDoColab = tarefas.filter(
            t => t.responsavel.toLowerCase().includes(colab.nome.toLowerCase().split(' ')[0]) && t.status !== 'Concluída'
          );

          return (
            <div
              key={colab.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {colab.departamento}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`flex items-center gap-1 text-[10px] font-semibold ${
                      colab.status === 'Ativo' ? 'text-brand-green' : 'text-slate-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        colab.status === 'Ativo' ? 'bg-brand-green' : 'bg-slate-300'
                      }`} />
                      {colab.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAbrirEdicao(colab)}
                      className="p-1 rounded-lg text-slate-400 hover:text-brand-blue hover:bg-blue-50 transition-all cursor-pointer"
                      title="Editar Colaborador"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExcluir(colab)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      title="Excluir Colaborador"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm">
                    {colab.nome.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{colab.nome}</h4>
                    <p className="text-[11px] text-slate-500">{colab.cargo}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-[11px] text-slate-600">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{colab.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{colab.telefone}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Fila de tarefas:</span>
                  <span className="text-xs font-bold text-brand-blue">{tarefasDoColab.length} pendentes</span>
                </div>

                <button
                  onClick={() => {
                    enviarMensagemWhatsApp(
                      'Colaborador',
                      colab.nome,
                      colab.whatsapp || colab.telefone,
                      'Resumo Diário',
                      `Olá ${colab.nome}! Você tem ${tarefasDoColab.length} tarefas atribuídas no GestUp hoje.`
                    );
                  }}
                  className="p-2 rounded-xl bg-emerald-50 text-brand-green hover:bg-emerald-100 transition-all border border-emerald-200"
                  title="Enviar mensagem direta no WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Colaborador */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Adicionar Membro da Equipe</h3>
              <button onClick={() => setModalNovo(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovo} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cargo</label>
                <input
                  type="text"
                  required
                  value={cargo}
                  onChange={e => setCargo(e.target.value)}
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
                    <option value="Financeiro">Financeiro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98888-0000"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Corporativo</label>
                <input
                  type="email"
                  required
                  placeholder="nome@finup.com.br"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Colaborador */}
      {colaboradorEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Editar Membro da Equipe</h3>
              <button onClick={() => setColaboradorEditando(null)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cargo</label>
                <input
                  type="text"
                  required
                  value={editCargo}
                  onChange={e => setEditCargo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departamento</label>
                  <select
                    value={editDepartamento}
                    onChange={e => setEditDepartamento(e.target.value as Departamento)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Fiscal">Fiscal</option>
                    <option value="Contábil">Contábil</option>
                    <option value="Pessoal">Pessoal / RH</option>
                    <option value="Financeiro">Financeiro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as 'Ativo' | 'Inativo')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98888-0000"
                    value={editTelefone}
                    onChange={e => setEditTelefone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Corporativo</label>
                  <input
                    type="email"
                    required
                    placeholder="nome@finup.com.br"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setColaboradorEditando(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
