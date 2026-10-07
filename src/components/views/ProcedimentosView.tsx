'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export function ProcedimentosView() {
  const { procedimentos, procedimentoTemplates } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Workflows & Templates de Procedimentos</h2>
          <p className="text-xs text-slate-500">Fluxos estruturados de Onboarding, Encerramento e Legalização de Empresas</p>
        </div>
      </div>

      {/* Procedimentos em Andamento */}
      {procedimentos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Procedimentos em Execução</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {procedimentos.map(proc => (
              <div key={proc.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-blue">
                    {proc.servico}
                  </span>
                  <span className="text-[10px] font-bold text-brand-green bg-emerald-50 px-2 py-0.5 rounded-full">
                    {proc.status}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-2">{proc.nome}</h4>
                <p className="text-xs text-slate-500 mt-1">Responsável: {proc.responsavel}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Prazo Final: {proc.prazo_final}</span>
                  <span className="text-brand-blue font-semibold">Integrado com a Operação</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Disponíveis */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Templates Padrão da fin.up</h3>
        {procedimentoTemplates.map(tmpl => (
          <div key={tmpl.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">{tmpl.nome}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{tmpl.descricao}</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                {tmpl.etapas.length} Etapas Estruturadas
              </span>
            </div>

            <div className="mt-5 space-y-2.5">
              {tmpl.etapas.map((etapa, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-brand-blue font-bold flex items-center justify-center text-[11px]">
                      {etapa.ordem}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{etapa.nome}</p>
                      {etapa.documentos_exigidos && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Documentos: {etapa.documentos_exigidos.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                    <span>Prazo: {etapa.prazo_dias} dias</span>
                    <span className="font-medium text-slate-700">{etapa.responsavel_padrao}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
