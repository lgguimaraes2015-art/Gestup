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
  Printer,
  Copy,
  Check,
  QrCode,
  Eye,
  Maximize2,
  ChevronDown,
  Sparkles
} from 'lucide-react';

function PortalGuiaContent() {
  const searchParams = useSearchParams();

  const id = searchParams.get('id') || '';
  const paramArquivoNome = searchParams.get('arquivo') || 'Guia_Pagamento.pdf';
  const paramCompetencia = searchParams.get('comp') || '10/2026';
  const paramRazaoSocial = searchParams.get('cli') || 'Sua Empresa';
  const paramDataVencimento = searchParams.get('venc') || '';
  const paramValor = searchParams.get('val') || '';
  const paramTipo = searchParams.get('tipo') || 'Guia de Pagamento';

  // Estados dos dados da guia
  const [arquivoNome, setArquivoNome] = useState(paramArquivoNome);
  const [competencia, setCompetencia] = useState(paramCompetencia);
  const [razaoSocial, setRazaoSocial] = useState(paramRazaoSocial);
  const [dataVencFormatada, setDataVencFormatada] = useState('');
  const [valor, setValor] = useState(paramValor);
  const [tipo, setTipo] = useState(paramTipo);
  const [linhaDigitavel, setLinhaDigitavel] = useState('85640000001-2  45080010202-6  61020261120-4  00000000000-0');
  const [pixCopiaCola, setPixCopiaCola] = useState('');
  const [temArquivoUpload, setTemArquivoUpload] = useState(false);
  const [visualizarPdf, setVisualizarPdf] = useState(true);

  // Estados de feedback de cópia
  const [copiouLinha, setCopiouLinha] = useState(false);
  const [copiouPix, setCopiouPix] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    // Formata data inicial dos params
    if (paramDataVencimento) {
      if (paramDataVencimento.includes('-')) {
        setDataVencFormatada(paramDataVencimento.split('-').reverse().join('/'));
      } else {
        setDataVencFormatada(paramDataVencimento);
      }
    } else {
      setDataVencFormatada('20/11/2026');
    }

    // Busca dados completos do documento na API central (/api/guias)
    const carregarGuiaDaApi = async () => {
      try {
        const query = new URLSearchParams({
          id,
          arquivo: paramArquivoNome,
          comp: paramCompetencia,
          cli: paramRazaoSocial,
          venc: paramDataVencimento,
          val: paramValor,
          tipo: paramTipo
        });

        const res = await fetch(`/api/guias?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.guia) {
            const g = data.guia;
            if (g.arquivoNome) setArquivoNome(g.arquivoNome);
            if (g.cliente) setRazaoSocial(g.cliente);
            if (g.competencia) setCompetencia(g.competencia);
            if (g.tipo) setTipo(g.tipo);
            if (g.valor) setValor(String(g.valor));
            if (g.linhaDigitavel) setLinhaDigitavel(g.linhaDigitavel);
            if (g.pixCopiaCola) setPixCopiaCola(g.pixCopiaCola);
            if (g.hasUploadedFile) setTemArquivoUpload(true);

            if (g.vencimento) {
              if (g.vencimento.includes('-')) {
                setDataVencFormatada(g.vencimento.split('-').reverse().join('/'));
              } else {
                setDataVencFormatada(g.vencimento);
              }
            }
          }
        }
      } catch (err) {
        console.warn('[Portal Guia] Falha ao consultar /api/guias:', err);
      } finally {
        setCarregandoDados(false);
      }
    };

    // Tenta também resgatar do cache local como fallback imediato
    if (typeof window !== 'undefined' && id) {
      try {
        const savedTarefas = localStorage.getItem('gestup_v2_tarefas');
        if (savedTarefas) {
          const parsed = JSON.parse(savedTarefas);
          const t = parsed.find((item: any) => item.id === id);
          if (t?.guia_pagamento) {
            const gp = t.guia_pagamento;
            if (gp.arquivo_nome) setArquivoNome(gp.arquivo_nome);
            if (gp.valor) setValor(String(gp.valor));
            if (gp.data_vencimento) {
              const dt = gp.data_vencimento;
              setDataVencFormatada(dt.includes('-') ? dt.split('-').reverse().join('/') : dt);
            }
            if (gp.arquivo_conteudo) setTemArquivoUpload(true);
          }
        }
      } catch (err) {}
    }

    carregarGuiaDaApi();
  }, [id, paramArquivoNome, paramCompetencia, paramRazaoSocial, paramDataVencimento, paramValor, paramTipo]);

  const valorFormatado = valor
    ? (isNaN(Number(valor)) ? valor : `R$ ${Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    : 'Conforme Apuração';

  // Copiar linha digitável
  const handleCopiarLinha = () => {
    const rawNumber = linhaDigitavel.replace(/[^0-9]/g, '');
    navigator.clipboard.writeText(rawNumber || linhaDigitavel);
    setCopiouLinha(true);
    setTimeout(() => setCopiouLinha(false), 3000);
  };

  // Copiar PIX
  const handleCopiarPix = () => {
    const chavePix = pixCopiaCola || `00020126580014BR.GOV.BCB.PIX0136gestup.pagamentos@finupconsultoria.com.br52040000530398654${valor || '100.00'}5802BR5925FINUP CONSULTORIA TRIBUT6009CAMPINAS62070503***6304`;
    navigator.clipboard.writeText(chavePix);
    setCopiouPix(true);
    setTimeout(() => setCopiouPix(false), 3000);
  };

  // Download do PDF 100% REAL via rota da API
  const handleDownloadPdf = () => {
    const query = new URLSearchParams({
      id: id || 'guia-oficial',
      download: 'true',
      arquivo: arquivoNome,
      comp: competencia,
      cli: razaoSocial,
      venc: dataVencFormatada,
      val: valor,
      tipo
    });

    const downloadUrl = `/api/guias?${query.toString()}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = arquivoNome.endsWith('.pdf') ? arquivoNome : `${arquivoNome}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Imprimir página
  const handleImprimir = () => {
    window.print();
  };

  // URL para abrir ou embutir o PDF
  const pdfViewUrl = `/api/guias?id=${encodeURIComponent(id || 'doc')}&view=true&arquivo=${encodeURIComponent(arquivoNome)}&comp=${encodeURIComponent(competencia)}&cli=${encodeURIComponent(razaoSocial)}&venc=${encodeURIComponent(dataVencFormatada)}&val=${encodeURIComponent(valor)}&tipo=${encodeURIComponent(tipo)}`;

  const linkWhatsAppSuporte = `https://wa.me/5519992080639?text=${encodeURIComponent(
    `Olá! Sou da empresa *${razaoSocial}* e gostaria de confirmar o pagamento/tirar dúvidas sobre a guia *${tipo}* da competência *${competencia}* (Vencimento: ${dataVencFormatada} - Valor: ${valorFormatado}).`
  )}`;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800">
      {/* Topo do Portal */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
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
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-brand-green px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Portal Seguro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">
                Consultoria Financeira e Tributária
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={linkWhatsAppSuporte}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-green" />
              <span className="hidden sm:inline">Falar com Consultor</span>
              <span className="sm:hidden">Ajuda</span>
            </a>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-5">
        {/* Card Principal da Guia */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Header do Card */}
          <div className="bg-gradient-to-r from-slate-900 via-brand-dark-blue to-slate-900 p-6 text-white">
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <FileText className="w-4 h-4" />
                <span>Documento Fiscal Liberado</span>
              </span>
              <span className="text-xs bg-white/10 px-3 py-1 rounded-full font-bold text-slate-200">
                Competência: {competencia}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
              {tipo}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 flex items-center gap-1.5 font-medium">
              <Building className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-semibold text-white">{razaoSocial}</span>
            </p>
          </div>

          {/* Dados de Vencimento e Valor */}
          <div className="p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-green" />
                  <span>Data de Vencimento</span>
                </span>
                <span className="text-2xl sm:text-3xl font-black text-brand-green block mt-1 tracking-tight">
                  {dataVencFormatada}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                  Liquidar até as 23:59h do vencimento
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/90 border border-blue-200">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Valor a Pagar</span>
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1 tracking-tight">
                  {valorFormatado}
                </span>
                <span className="text-[11px] text-blue-700 font-semibold block mt-0.5">
                  Valor apurado oficialmente pela fin.up
                </span>
              </div>
            </div>

            {/* SEÇÃO 1: CÓDIGO DE BARRAS & LINHA DIGITÁVEL (PAGAMENTO RÁPIDO) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-blue" />
                  <span>Linha Digitável / Código de Barras</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                  Internet Banking / App
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs sm:text-sm font-bold text-slate-900 tracking-wide break-all select-all flex items-center justify-between gap-2 shadow-2xs">
                <span>{linhaDigitavel}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopiarLinha}
                  className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    copiouLinha
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-blue hover:bg-brand-blue-hover text-white'
                  }`}
                >
                  {copiouLinha ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Linha Digitável Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Linha Digitável</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopiarPix}
                  className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border shadow-xs ${
                    copiouPix
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {copiouPix ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Chave PIX Copiada!</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 text-brand-green" />
                      <span>Copiar Código PIX</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SEÇÃO 2: VISUALIZADOR REAL DO DOCUMENTO / PDF NA TELA */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                      {arquivoNome}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Documento PDF emitido e autenticado
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVisualizarPdf(!visualizarPdf)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 hover:bg-white text-slate-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-brand-blue" />
                    <span>{visualizarPdf ? 'Ocultar Prévia' : 'Visualizar PDF'}</span>
                  </button>

                  <a
                    href={pdfViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600"
                    title="Abrir em Nova Aba"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {visualizarPdf && (
                <div className="p-3 bg-slate-900/5">
                  <div className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-inner">
                    <iframe
                      src={pdfViewUrl}
                      title={`Visualização de ${arquivoNome}`}
                      className="w-full h-[380px] sm:h-[460px] border-0"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    💡 Caso o seu celular não exiba a prévia acima, clique no botão verde abaixo para baixar o PDF oficial.
                  </p>
                </div>
              )}
            </div>

            {/* BOTÕES DE AÇÃO: DOWNLOAD REAL DO PDF & IMPRESSÃO */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full py-4 px-5 rounded-2xl bg-brand-green hover:bg-emerald-600 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
              >
                <Download className="w-5 h-5" />
                <span>Baixar Guia Oficial em PDF</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleImprimir}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Imprimir Guia</span>
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

            {/* Alerta de Segurança e Boas Práticas */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-xs text-amber-900">Orientações de Pagamento:</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Confira os dados do favorecido no ato da liquidação bancária. Guarde o comprovante de pagamento e envie-o para a fin.up pelo WhatsApp ou pelo Portal para a conciliação fiscal e contábil.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé do Portal */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <p className="font-semibold text-slate-600">fin.up Consultoria Financeira e Tributária</p>
        <p className="text-[10px] mt-0.5">Ambiente seguro para transmissão, custódia e emissão de guias tributárias</p>
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
