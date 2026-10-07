'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  Upload,
  Download,
  CheckCircle2
} from 'lucide-react';

export function PortalClienteView() {
  const { clientes } = useApp();
  const [selectedClienteId, setSelectedClienteId] = useState(clientes[0]?.id || '');
  const [uploadFeedback, setUploadFeedback] = useState(false);

  const cliente = clientes.find(c => c.id === selectedClienteId) || clientes[0];

  const handleSimularUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadFeedback(true);
    setTimeout(() => setUploadFeedback(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner de Demonstração do Portal */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-green/20 text-brand-green px-2 py-0.5 rounded-full border border-brand-green/30">
              Visão Externa
            </span>
            <span className="text-xs text-slate-400">Portal do Cliente fin.up</span>
          </div>
          <h2 className="text-lg font-bold mt-1">Simulador de Acesso do Cliente</h2>
          <p className="text-xs text-slate-300">
            É esta interface limpa e intuitiva que o seu cliente acessa para baixar guias e enviar documentos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Visualizar como:</span>
          <select
            value={selectedClienteId}
            onChange={e => setSelectedClienteId(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
          >
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {cliente && (
        <div className="space-y-6">
          {/* Cabeçalho da Empresa do Cliente */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-lg">
                {cliente.nome.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{cliente.nome}</h3>
                <p className="text-xs text-slate-500 mt-0.5">CNPJ: {cliente.cnpj_cpf} • Regime: {cliente.regime_tributario}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-brand-green text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
                <span>Situação Fiscal Regular</span>
              </span>
            </div>
          </div>

          {/* Grid de Certidões e Guias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Certidões Negativas de Débitos (CND) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Certidões da Empresa (CND)</h4>
                <span className="text-[10px] text-slate-400 font-medium">Atualizado automaticamente</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" />
                    <div>
                      <p className="font-semibold text-slate-800">CND Receita Federal & PGFN</p>
                      <p className="text-[10px] text-slate-400">Válida até 15/12/2026</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg text-brand-blue hover:bg-blue-50 transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" />
                    <div>
                      <p className="font-semibold text-slate-800">CRF - FGTS (Caixa Econômica)</p>
                      <p className="text-[10px] text-slate-400">Válida até 28/10/2026</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg text-brand-blue hover:bg-blue-50 transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" />
                    <div>
                      <p className="font-semibold text-slate-800">CNDT - Débitos Trabalhistas</p>
                      <p className="text-[10px] text-slate-400">Válida até 10/11/2026</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg text-brand-blue hover:bg-blue-50 transition-all">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Envio de Documentos do Mês */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Envio de Extratos & Notas</h4>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Aguardando envio
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Envie os extratos bancários (OFX/PDF) e despesas do mês para o fechamento fiscal pela fin.up.
                </p>

                {uploadFeedback && (
                  <div className="mb-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-brand-green" />
                    <span>Documento recebido! A equipe da fin.up foi notificada.</span>
                  </div>
                )}

                <div
                  onClick={handleSimularUpload}
                  className="border-2 border-dashed border-slate-200 hover:border-brand-blue rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50 hover:bg-blue-50/30"
                >
                  <Upload className="w-7 h-7 text-brand-blue mx-auto mb-2" />
                  <p className="font-semibold text-xs text-slate-800">Clique para selecionar arquivos ou arraste aqui</p>
                  <p className="text-[10px] text-slate-400 mt-1">Arquivos suportados: OFX, PDF, XML, ZIP (até 50MB)</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Dúvidas? Fale direto no WhatsApp do seu consultor:</span>
                <span className="font-semibold text-brand-green">{cliente.responsavel}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
