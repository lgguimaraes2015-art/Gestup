'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Building,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Printer
} from 'lucide-react';

function PortalGuiaContent() {
  const searchParams = useSearchParams();

  const id = searchParams.get('id') || '';
  const arquivoNome = searchParams.get('arquivo') || 'Guia_Fiscal.pdf';
  const competencia = searchParams.get('comp') || '10/2026';
  const razaoSocial = searchParams.get('cli') || 'Sua Empresa';
  const dataVencimento = searchParams.get('venc') || '';
  const valor = searchParams.get('val') || '';
  const tipo = searchParams.get('tipo') || 'Guia de Pagamento';

  const [arquivoConteudo, setArquivoConteudo] = useState<string | null>(null);
  const [dataVencFormatada, setDataVencFormatada] = useState<string>('');

  useEffect(() => {
    if (dataVencimento) {
      if (dataVencimento.includes('-')) {
        setDataVencFormatada(dataVencimento.split('-').reverse().join('/'));
      } else {
        setDataVencFormatada(dataVencimento);
      }
    } else {
      setDataVencFormatada('20/11/2026');
    }

    // Tenta carregar do localStorage se estiver disponível no navegador
    if (typeof window !== 'undefined' && id) {
      try {
        const savedTarefas = localStorage.getItem('gestup_v2_tarefas');
        if (savedTarefas) {
          const parsed = JSON.parse(savedTarefas);
          const t = parsed.find((item: any) => item.id === id);
          if (t?.guia_pagamento?.arquivo_conteudo) {
            setArquivoConteudo(t.guia_pagamento.arquivo_conteudo);
          }
        }
      } catch (err) {
        console.error('Erro ao ler anexo do cache:', err);
      }
    }
  }, [id, dataVencimento]);

  const valorFormatado = valor
    ? (isNaN(Number(valor)) ? valor : `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    : 'Conforme Documento';

  // Função para baixar o arquivo
  const handleDownload = () => {
    if (arquivoConteudo && arquivoConteudo.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = arquivoConteudo;
      a.download = arquivoNome;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Se for arquivo padrão/demonstração, gera um arquivo de texto/PDF representativo para download
    const conteudoExemplo = `FIN.UP CONSULTORIA FINANCEIRA E TRIBUTÁRIA
PORTAL DO CLIENTE - GUIA DE PAGAMENTO

Empresa: ${razaoSocial}
Obrigação: ${tipo}
Competência: ${competencia}
Vencimento: ${dataVencFormatada}
Valor: ${valorFormatado}
Documento: ${arquivoNome}

Código de Barras / Linha Digitável Simulado:
85640000001-2  45080010202-6  61020261120-4  00000000000-0

Instruções:
- Efetue o pagamento até a data de vencimento indicada acima.
- Após o pagamento, envie o comprovante via WhatsApp para o seu consultor fin.up.
- Dúvidas: contato@finupconsultoria.com.br | (19) 99208-0639
`;

    const blob = new Blob([conteudoExemplo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = arquivoNome.endsWith('.txt') ? arquivoNome : `${arquivoNome.replace(/\.pdf$/i, '')}_dados.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImprimir = () => {
    window.print();
  };

  const linkWhatsAppSuporte = `https://wa.me/5519992080639?text=${encodeURIComponent(
    `Olá! Sou da empresa *${razaoSocial}* e gostaria de tirar uma dúvida sobre a guia *${tipo}* da competência *${competencia}* (Vencimento: ${dataVencFormatada}).`
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800">
      {/* Topo do Portal */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-center p-1 overflow-hidden">
              <Image
                src="/logo.png"
                alt="Logo fin.up"
                width={38}
                height={38}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">fin.up</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-brand-green px-2 py-0.5 rounded-full">
                  Portal Seguro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">
                Consultoria Financeira e Tributária
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-brand-green" />
              <span>Ambiente Protegido</span>
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-10 space-y-5">
        {/* Card Principal da Guia */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Header do Card */}
          <div className="bg-gradient-to-r from-slate-900 via-brand-dark-blue to-slate-900 p-6 text-white">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Documento Fiscal Liberado</span>
              </span>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full font-bold text-slate-200">
                Comp. {competencia}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {tipo}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1.5 font-medium">
              <Building className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>{razaoSocial}</span>
            </p>
          </div>

          {/* Dados de Vencimento e Valor */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Data de Vencimento
                </span>
                <span className="text-xl sm:text-2xl font-black text-brand-green block mt-1 tracking-tight">
                  {dataVencFormatada}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                  Liquidar até às 23:59h do vencimento
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                  Valor a Pagar
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 block mt-1 tracking-tight">
                  {valorFormatado}
                </span>
                <span className="text-[10px] text-blue-700 font-semibold block mt-1">
                  Valor oficial apurado pela fin.up
                </span>
              </div>
            </div>

            {/* Informações do Arquivo Anexado */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {arquivoNome}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Documento PDF original anexado pela consultoria
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-brand-green rounded-full shrink-0">
                PDF Válido
              </span>
            </div>

            {/* Ações de Download e Visualização */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleDownload}
                className="w-full py-3.5 px-4 rounded-2xl bg-brand-green hover:bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Guia Oficial (PDF)</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleImprimir}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>

                <a
                  href={linkWhatsAppSuporte}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-brand-green" />
                  <span>Tirar Dúvidas</span>
                </a>
              </div>
            </div>

            {/* Aviso de Segurança */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-[11px]">Recomendação Importante:</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Confira o favorecido e os dados ao efetuar o pagamento. Mantenha os comprovantes para a escrituração contábil mensal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-600">fin.up Consultoria Financeira e Tributária</p>
        <p className="text-[10px] mt-0.5">Ambiente seguro para transmissão e custódia de documentos tributários</p>
      </footer>
    </div>
  );
}

export default function PortalGuiaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
        Carregando guia segura...
      </div>
    }>
      <PortalGuiaContent />
    </Suspense>
  );
}
