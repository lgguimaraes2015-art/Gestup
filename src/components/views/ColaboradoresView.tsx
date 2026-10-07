'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Departamento } from '@/types';
import {
  Mail,
  Phone,
  MessageSquare,
  Plus,
  X
} from 'lucide-react';

export function ColaboradoresView() {
  const { colaboradores, addColaborador, tarefas, enviarMensagemWhatsApp } = useApp();
  const [modalNovo, setModalNovo] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('Analista Fiscal Pleno');
  const [departamento, setDepartamento] = useState<Departamento>('Fiscal');
  const [telefone, setTelefone] = useState('');

  const handleSalvar = (e: React.FormEvent) => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Equipe & Analistas Responsáveis</h2>
          <p className="text-xs text-slate-500">Colaboradores da fin.up que recebem tarefas e alertas diários no WhatsApp</p>
        </div>
        <button
          onClick={() => setModalNovo(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Colaborador</span>
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
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                    Ativo
                  </span>
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

      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">Adicionar Membro da Equipe</h3>
              <button onClick={() => setModalNovo(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4 text-xs">
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
    </div>
  );
}
