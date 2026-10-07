'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Declaracao, Departamento, Periodicidade, Prioridade } from '@/types';
import {
  Calendar,
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  Repeat,
  AlertCircle
} from 'lucide-react';

export function DeclaracoesView() {
  const { declaracoes, addDeclaracao, updateDeclaracao, deleteDeclaracao } = useApp();

  const [modalNovo, setModalNovo] = useState(false);
  const [modalEditar, setModalEditar] = useState<Declaracao | null>(null);

  // Estados Form
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<Departamento>('Fiscal');
  const [periodicidade, setPeriodicidade] = useState<'Mensal' | 'Anual' | 'Trimestral' | 'Eventual'>('Mensal');
  const [prioridade, setPrioridade] = useState<Prioridade>('Normal');
  const [recorrente, setRecorrente] = useState<boolean>(true);
  const [diaLimite, setDiaLimite] = useState<number>(20);
  const [orgao, setOrgao] = useState('Receita Federal do Brasil');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSalvarNova = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo) return;

    addDeclaracao({
      titulo,
      descricao,
      categoria,
      periodicidade,
      prioridade,
      recorrente,
      ativo: true,
      dia_limite_padrao: diaLimite,
      orgao_competente: orgao
    });

    setModalNovo(false);
    limparForm();
    setToastMsg(`✅ Declaração "${titulo}" cadastrada com sucesso!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditar) return;

    updateDeclaracao(modalEditar.id, {
      titulo,
      descricao,
      categoria,
      periodicidade,
      prioridade,
      recorrente,
      dia_limite_padrao: diaLimite,
      orgao_competente: orgao
    });

    setModalEditar(null);
    limparForm();
    setToastMsg(`✅ Declaração "${titulo}" atualizada!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAbrirEdicao = (dec: Declaracao) => {
    setModalEditar(dec);
    setTitulo(dec.titulo);
    setDescricao(dec.descricao || '');
    setCategoria(dec.categoria);
    setPeriodicidade(dec.periodicidade);
    setPrioridade(dec.prioridade);
    setRecorrente(dec.recorrente !== false);
    setDiaLimite(dec.dia_limite_padrao || 20);
    setOrgao(dec.orgao_competente || 'Receita Federal do Brasil');
  };

  const limparForm = () => {
    setTitulo('');
    setDescricao('');
    setDiaLimite(20);
    setRecorrente(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-lg border border-emerald-700 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-brand-green" />
            <p className="text-xs font-semibold">{toastMsg}</p>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Topo do Módulo */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Catálogo de Declarações & Obrigações Fiscais</h2>
          <p className="text-xs text-slate-500">
            Gerenciamento das {declaracoes.length} obrigações fiscais acessórias, prazos legais e regras de recorrência
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              limparForm();
              setModalNovo(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Declaração</span>
          </button>
        </div>
      </div>

      {/* Grid de Declarações com Ações de Edição e Exclusão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {declaracoes.map(dec => {
          const isRecorrente = dec.recorrente !== false;
          return (
            <div
              key={dec.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between hover:border-brand-blue/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-blue">
                      {dec.categoria}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isRecorrente ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isRecorrente ? '🔄 Recorrente' : '📌 Eventual / Única'}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {dec.periodicidade}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-3">{dec.titulo}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {dec.descricao || 'Obrigação acessória regulamentada pela legislação tributária brasileira.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Vencimento padrão: Todo dia {dec.dia_limite_padrao || 20}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAbrirEdicao(dec)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-brand-blue hover:bg-blue-50 transition-all"
                    title="Editar declaração"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente remover a declaração "${dec.titulo}"?`)) {
                        deleteDeclaracao(dec.id);
                        setToastMsg(`Declaração removida.`);
                        setTimeout(() => setToastMsg(null), 3000);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    title="Excluir declaração"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL NOVO / EDITAR DECLARAÇÃO */}
      {(modalNovo || modalEditar) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <h3 className="font-bold text-slate-900 text-sm">
                {modalEditar ? 'Editar Declaração Fiscal' : 'Cadastrar Nova Declaração Fiscal'}
              </h3>
              <button
                onClick={() => {
                  setModalNovo(false);
                  setModalEditar(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={modalEditar ? handleSalvarEdicao : handleSalvarNova}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título da Obrigação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PGDAS-D, DCTFWeb, EFD-Reinf, DMED..."
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Setor Responsável</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value as Departamento)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Fiscal">Fiscal</option>
                    <option value="Contábil">Contábil</option>
                    <option value="Pessoal">Pessoal / RH</option>
                    <option value="Societário">Societário</option>
                    <option value="Financeiro">Financeiro / BPO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Periodicidade</label>
                  <select
                    value={periodicidade}
                    onChange={e => setPeriodicidade(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Anual">Anual</option>
                    <option value="Eventual">Eventual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dia Limite Padrão (Prazo Legal)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={diaLimite}
                    onChange={e => setDiaLimite(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Órgão Competente</label>
                  <input
                    type="text"
                    value={orgao}
                    onChange={e => setOrgao(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Indicador de Recorrência */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-slate-900 block">Obrigação Recorrente?</span>
                  <span className="text-[10px] text-slate-500">Se ativo, será gerada mensalmente/anualmente na virada de competência.</span>
                </div>
                <input
                  type="checkbox"
                  checked={recorrente}
                  onChange={e => setRecorrente(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição / Instruções Legais</label>
                <textarea
                  rows={2}
                  placeholder="Orientações e base legal da declaração..."
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalNovo(false);
                    setModalEditar(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold shadow-sm"
                >
                  {modalEditar ? 'Atualizar Declaração' : 'Cadastrar Declaração'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
