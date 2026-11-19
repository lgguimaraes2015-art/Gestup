'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  DPFuncionario,
  DPEmpresaConfig,
  DPControleVencimento,
  DPDiarioBordo,
  DPAnexoOcorrencia,
  DPTipoOcorrencia,
  DPCanalAutorizacao,
  DPImpactoFolha,
  DPCategoriaVencimento,
  DPStatusVencimento,
  DPStatusFuncionario,
  DPTipoContrato
} from '@/types';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Calendar,
  FileText,
  UserCheck,
  Users,
  Search,
  Plus,
  ExternalLink,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  FolderOpen,
  Filter,
  Eye,
  Trash2,
  Edit,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Award,
  Play,
  Volume2,
  FileCheck,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export function DPSSTView() {
  const {
    clientes,
    dpEmpresasConfig,
    dpFuncionarios,
    dpControleVencimentos,
    dpDiarioBordo,
    salvarDPEmpresaConfig,
    addDPFuncionario,
    updateDPFuncionario,
    deleteDPFuncionario,
    addDPVencimento,
    updateDPVencimento,
    deleteDPVencimento,
    addDPOcorrencia,
    updateDPOcorrencia,
    deleteDPOcorrencia,
    sincronizarDPComTarefasGestup,
    userRole
  } = useApp();

  // Sub-navegação principal
  const [subTab, setSubTab] = useState<'cockpit' | 'empresas' | 'funcionarios'>('cockpit');

  // Filtros
  const [filtroAlerta, setFiltroAlerta] = useState<'todos' | 'vencidos' | 'proximos'>('todos');
  const [empresaFiltro, setEmpresaFiltro] = useState<string>('todos');
  const [statusFuncFiltro, setStatusFuncFiltro] = useState<string>('todos');
  const [buscaFunc, setBuscaFunc] = useState<string>('');

  // Modais
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<DPFuncionario | null>(null);
  const [prontuarioSubAba, setProntuarioSubAba] = useState<'ficha' | 'diario' | 'vencimentos' | 'dossie'>('ficha');
  const [novoFuncionarioModalOpen, setNovoFuncionarioModalOpen] = useState(false);
  const [novaOcorrenciaModalOpen, setNovaOcorrenciaModalOpen] = useState(false);
  const [novoVencimentoModalOpen, setNovoVencimentoModalOpen] = useState(false);
  const [configEmpresaModalOpen, setConfigEmpresaModalOpen] = useState(false);
  const [empresaEmEdicao, setEmpresaEmEdicao] = useState<DPEmpresaConfig | null>(null);
  const [anexoVisualizando, setAnexoVisualizando] = useState<DPAnexoOcorrencia | null>(null);

  // Feedback de sincronização com GestUp
  const [syncFeedback, setSyncFeedback] = useState<{ loading: boolean; msg: string | null; criadas?: number; existentes?: number }>({
    loading: false,
    msg: null
  });

  // Filtro do diário de bordo no modal
  const [filtroDiarioTipo, setFiltroDiarioTipo] = useState<string>('todos');

  // Datas de referência
  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const hojeStr = useMemo(() => {
    return hoje.toISOString().split('T')[0];
  }, [hoje]);

  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  // Helper para garantir que links do Google Drive nunca dêem 404
  const formatarLinkDriveSeguro = (url?: string, termoBusca?: string) => {
    if (!url) {
      return `https://drive.google.com/drive/search?q=${encodeURIComponent(termoBusca || 'finup')}`;
    }
    const limpa = url.trim();
    // Se for link direto real do Google Drive com ID de pasta ou arquivo válido
    if (/drive\.google\.com\/(?:drive\/folders\/|file\/d\/)[a-zA-Z0-9_-]{15,}/.test(limpa)) {
      return limpa.startsWith('http') ? limpa : `https://${limpa}`;
    }
    // Se for URL válida do Drive que não seja dummy/placeholder
    if (limpa.startsWith('https://drive.google.com') && !limpa.includes('_oficial') && !limpa.includes('_dp_') && !limpa.includes('_sst_') && !limpa.includes('_souza') && !limpa.includes('_menezes') && !limpa.includes('_adega')) {
      return limpa;
    }
    return `https://drive.google.com/drive/search?q=${encodeURIComponent(termoBusca || 'finup')}`;
  };

  // Helper de cálculo de datas de experiência
  const calcularDatasExperiencia = (admissaoStr: string) => {
    if (!admissaoStr) return { exp1: '', exp2: '' };
    const dt = new Date(admissaoStr + 'T00:00:00');
    if (isNaN(dt.getTime())) return { exp1: '', exp2: '' };
    
    const d1 = new Date(dt.getTime() + 44 * 24 * 60 * 60 * 1000);
    const d2 = new Date(dt.getTime() + 89 * 24 * 60 * 60 * 1000);
    return {
      exp1: d1.toISOString().split('T')[0],
      exp2: d2.toISOString().split('T')[0]
    };
  };

  // 1. CÁLCULO DE ALERTAS E COCKPIT
  const alertasCalculados = useMemo(() => {
    const limite30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
    const lista: {
      id: string;
      tipo: 'PGR' | 'PCMSO' | 'ASO' | 'EPI' | 'Ferias' | 'Experiencia' | 'Dissidio';
      titulo: string;
      empresaId: string;
      empresaNome: string;
      funcionarioId?: string;
      funcionarioNome?: string;
      dataLimite: string;
      diasRestantes: number;
      status: 'Vencido' | 'Proximo' | 'Em_Dia';
      detalhe: string;
    }[] = [];

    // a) PGR e PCMSO
    dpEmpresasConfig.forEach(cfg => {
      const cli = clientes.find(c => c.id === cfg.empresa_id);
      const cliNome = cli ? cli.nome : 'Empresa';

      if (cfg.pgr_ppra_vencimento) {
        const dt = new Date(cfg.pgr_ppra_vencimento + 'T00:00:00');
        const diffDias = Math.ceil((dt.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDias <= 30) {
          lista.push({
            id: `alert-pgr-${cfg.id}`,
            tipo: 'PGR',
            titulo: 'Renovação PGR / GRO da Empresa',
            empresaId: cfg.empresa_id,
            empresaNome: cliNome,
            dataLimite: cfg.pgr_ppra_vencimento,
            diasRestantes: diffDias,
            status: diffDias < 0 ? 'Vencido' : 'Proximo',
            detalhe: `Vigência vence em ${cfg.pgr_ppra_vencimento} (${diffDias < 0 ? `${Math.abs(diffDias)} dias atrasado` : `faltam ${diffDias} dias`})`
          });
        }
      }

      if (cfg.pcmso_vencimento) {
        const dt = new Date(cfg.pcmso_vencimento + 'T00:00:00');
        const diffDias = Math.ceil((dt.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDias <= 30) {
          lista.push({
            id: `alert-pcmso-${cfg.id}`,
            tipo: 'PCMSO',
            titulo: 'Renovação do PCMSO Médico da Empresa',
            empresaId: cfg.empresa_id,
            empresaNome: cliNome,
            dataLimite: cfg.pcmso_vencimento,
            diasRestantes: diffDias,
            status: diffDias < 0 ? 'Vencido' : 'Proximo',
            detalhe: `Vigência vence em ${cfg.pcmso_vencimento} (${diffDias < 0 ? `${Math.abs(diffDias)} dias atrasado` : `faltam ${diffDias} dias`})`
          });
        }
      }

      // Dissídio no mês atual
      if (cfg.mes_data_base_dissidio === mesAtual) {
        const conferidoEsteAno = (cfg.ultimo_dissidio_conferido_ano || 0) >= anoAtual;
        if (!conferidoEsteAno) {
          lista.push({
            id: `alert-dissidio-${cfg.id}`,
            tipo: 'Dissidio',
            titulo: `Mês de Dissídio Coletivo: ${cfg.sindicato_nome}`,
            empresaId: cfg.empresa_id,
            empresaNome: cliNome,
            dataLimite: `${anoAtual}-${String(mesAtual).padStart(2, '0')}-30`,
            diasRestantes: 0,
            status: 'Proximo',
            detalhe: `Conferir Convenção Coletiva de Trabalho (CCT) no Sistema Mediador/MTE para reajuste salarial e benefícios.`
          });
        }
      }
    });

    // b) Vencimentos Individuais (ASOs, EPIs, Férias)
    dpControleVencimentos.forEach(venc => {
      if (venc.status === 'Concluido_Historico') return;
      const dt = new Date(venc.data_vencimento_limite + 'T00:00:00');
      const diffDias = Math.ceil((dt.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDias <= 30) {
        const func = dpFuncionarios.find(f => f.id === venc.funcionario_id);
        const cli = clientes.find(c => c.id === venc.empresa_id);
        let tipoAlerta: 'ASO' | 'EPI' | 'Ferias' = 'ASO';
        if (venc.categoria.startsWith('ASO')) tipoAlerta = 'ASO';
        else if (venc.categoria === 'Ficha_EPI') tipoAlerta = 'EPI';
        else if (venc.categoria === 'Ferias') tipoAlerta = 'Ferias';

        lista.push({
          id: `alert-venc-${venc.id}`,
          tipo: tipoAlerta,
          titulo: `${venc.categoria.replace(/_/g, ' ')}: ${venc.titulo_item}`,
          empresaId: venc.empresa_id,
          empresaNome: cli?.nome || 'Empresa',
          funcionarioId: venc.funcionario_id,
          funcionarioNome: func?.nome_completo || 'Colaborador',
          dataLimite: venc.data_vencimento_limite,
          diasRestantes: diffDias,
          status: diffDias < 0 ? 'Vencido' : 'Proximo',
          detalhe: venc.observacoes || `Limite de renovação em ${venc.data_vencimento_limite}`
        });
      }
    });

    // c) Contratos de Experiência (45 e 90 dias)
    dpFuncionarios.forEach(func => {
      if (func.status === 'Desligado') return;
      const cli = clientes.find(c => c.id === func.empresa_id);

      if (func.vencimento_exp_1) {
        const dt1 = new Date(func.vencimento_exp_1 + 'T00:00:00');
        const diff1 = Math.ceil((dt1.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        if (diff1 <= 30 && diff1 >= -10) {
          lista.push({
            id: `alert-exp1-${func.id}`,
            tipo: 'Experiencia',
            titulo: 'Término do 1º Período de Experiência (45 dias)',
            empresaId: func.empresa_id,
            empresaNome: cli?.nome || 'Empresa',
            funcionarioId: func.id,
            funcionarioNome: func.nome_completo,
            dataLimite: func.vencimento_exp_1,
            diasRestantes: diff1,
            status: diff1 < 0 ? 'Vencido' : 'Proximo',
            detalhe: `Vence em ${func.vencimento_exp_1}. Decidir com o empregador sobre prorrogação para 90 dias ou rescisão de experiência.`
          });
        }
      }

      if (func.vencimento_exp_2) {
        const dt2 = new Date(func.vencimento_exp_2 + 'T00:00:00');
        const diff2 = Math.ceil((dt2.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        if (diff2 <= 30 && diff2 >= -10) {
          lista.push({
            id: `alert-exp2-${func.id}`,
            tipo: 'Experiencia',
            titulo: 'Término do 2º Período de Experiência (90 dias)',
            empresaId: func.empresa_id,
            empresaNome: cli?.nome || 'Empresa',
            funcionarioId: func.id,
            funcionarioNome: func.nome_completo,
            dataLimite: func.vencimento_exp_2,
            diasRestantes: diff2,
            status: diff2 < 0 ? 'Vencido' : 'Proximo',
            detalhe: `Vence em ${func.vencimento_exp_2}. Passará a vigorar por prazo indeterminado caso não haja rescisão até a data.`
          });
        }
      }
    });

    return lista.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [dpEmpresasConfig, dpControleVencimentos, dpFuncionarios, clientes, hoje, mesAtual, anoAtual]);

  // Contadores do Cockpit
  const contadoresCockpit = useMemo(() => {
    const pgrPcmso = alertasCalculados.filter(a => a.tipo === 'PGR' || a.tipo === 'PCMSO').length;
    const asosEpis = alertasCalculados.filter(a => a.tipo === 'ASO' || a.tipo === 'EPI').length;
    const ferias = alertasCalculados.filter(a => a.tipo === 'Ferias').length;
    const experiencia = alertasCalculados.filter(a => a.tipo === 'Experiencia').length;
    const dissidios = alertasCalculados.filter(a => a.tipo === 'Dissidio').length;
    const criticos = alertasCalculados.filter(a => a.status === 'Vencido').length;
    return { pgrPcmso, asosEpis, ferias, experiencia, dissidios, criticos };
  }, [alertasCalculados]);

  // Alertas filtrados para exibição
  const alertasFiltrados = useMemo(() => {
    return alertasCalculados.filter(a => {
      if (empresaFiltro !== 'todos' && a.empresaId !== empresaFiltro) return false;
      if (filtroAlerta === 'vencidos' && a.status !== 'Vencido') return false;
      if (filtroAlerta === 'proximos' && a.status !== 'Proximo') return false;
      return true;
    });
  }, [alertasCalculados, empresaFiltro, filtroAlerta]);

  // Lista de funcionários filtrados
  const funcionariosFiltrados = useMemo(() => {
    return dpFuncionarios.filter(f => {
      if (empresaFiltro !== 'todos' && f.empresa_id !== empresaFiltro) return false;
      if (statusFuncFiltro !== 'todos' && f.status !== statusFuncFiltro) return false;
      if (buscaFunc.trim()) {
        const q = buscaFunc.toLowerCase();
        const nomeOk = f.nome_completo.toLowerCase().includes(q);
        const cpfOk = f.cpf.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const cargoOk = (f.cargo || '').toLowerCase().includes(q);
        if (!nomeOk && !cpfOk && !cargoOk) return false;
      }
      return true;
    });
  }, [dpFuncionarios, empresaFiltro, statusFuncFiltro, buscaFunc]);

  // Handler de Sincronização com Tarefas do GestUp
  const handleSincronizarTarefas = () => {
    setSyncFeedback({ loading: true, msg: null });
    setTimeout(() => {
      const res = sincronizarDPComTarefasGestup();
      setSyncFeedback({
        loading: false,
        msg: `✅ Sincronização concluída com sucesso! ${res.criadas} novas tarefas criadas no módulo de Tarefas e ${res.existentes} já monitoradas anteriormente.`,
        criadas: res.criadas,
        existentes: res.existentes
      });
      setTimeout(() => {
        setSyncFeedback(prev => ({ ...prev, msg: null }));
      }, 5000);
    }, 600);
  };

  // Helper de Upload de Arquivos (converte para Data URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onLoaded: (nome: string, url: string, tipo: string, tamanho: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tamanhoStr = `${(file.size / 1024).toFixed(1)} KB`;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoaded(file.name, reader.result, file.type, tamanhoStr);
      }
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------
  // GERADOR DE DOSSIÊ TRABALHISTA EM PDF PROFISSIONAL (jsPDF)
  // -------------------------------------------------------------
  const exportarDossieTrabalhistaPDF = (func: DPFuncionario) => {
    const cli = clientes.find(c => c.id === func.empresa_id);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 18;

    // Cabeçalho Principal com Banner Escuro Elegante
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, pageWidth - (margin * 2), 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('fin.up Consultoria | GestUp 2.0 - Prontuário & Compliance', margin + 6, y + 9);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('DOSSIÊ TRABALHISTA OFICIAL & DIÁRIO DE BORDO COMPLETO (BLINDAGEM JURÍDICA)', margin + 6, y + 16);

    y += 28;

    // Dados da Empresa e do Colaborador
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(margin, y, pageWidth - (margin * 2), 28, 'FD');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`EMPRESA EMPREGADORA: ${cli?.nome || 'Não informada'}`, margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`CNPJ: ${cli?.cnpj_cpf || '00.000.000/0001-00'} | Regime: ${cli?.regime_tributario || 'Simples Nacional'}`, margin + 4, y + 13);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`COLABORADOR: ${func.nome_completo.toUpperCase()} (Status: ${func.status})`, margin + 4, y + 20);
    doc.setFont('helvetica', 'normal');
    doc.text(`CPF: ${func.cpf || '-'} | PIS/NIS: ${func.pis_nis || '-'} | CTPS: ${func.ctps || '-'} | Cargo: ${func.cargo || '-'} (CBO: ${func.cbo || '-'})`, margin + 4, y + 25);

    y += 34;

    // Resumo Contratual
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1. DADOS CONTRATUAIS & CONTROLE DE EXPERIÊNCIA', margin + 4, y + 5);

    y += 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Data de Admissão: ${func.data_admissao} | Salário Base: R$ ${(func.salario_base || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Tipo: ${func.tipo_contrato}`, margin + 4, y);
    y += 5;
    doc.text(`Jornada: ${func.jornada_trabalho || 'Padrão 44h semanais'} | 1º Venc. Exp (45d): ${func.vencimento_exp_1 || 'N/A'} | 2º Venc. Exp (90d): ${func.vencimento_exp_2 || 'N/A'}`, margin + 4, y);

    y += 9;

    // Resumo de Exames Ocupacionais e EPIs
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. EXAMES OCUPACIONAIS (ASO) & EQUIPAMENTOS DE PROTEÇÃO (EPI)', margin + 4, y + 5);

    y += 11;
    const venvsColab = dpControleVencimentos.filter(v => v.funcionario_id === func.id);
    if (venvsColab.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Nenhum ASO ou EPI registrado para este colaborador no período.', margin + 4, y);
      y += 8;
    } else {
      venvsColab.forEach(v => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${v.categoria.replace(/_/g, ' ')}: ${v.titulo_item}`, margin + 4, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const caInfo = v.numero_ca_epi ? ` | CA: ${v.numero_ca_epi}` : '';
        doc.text(`Entregue/Realizado: ${v.data_realizacao_entrega || '-'} | Limite/Validade: ${v.data_vencimento_limite}${caInfo} (Status: ${v.status})`, margin + 8, y + 4);
        y += 9;
      });
    }

    y += 4;

    // Diário de Bordo / Ocorrências
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('3. PRONTUÁRIO CRONOLÓGICO DE OCORRÊNCIAS (DIÁRIO DE BORDO)', margin + 4, y + 5);

    y += 11;
    const ocorrsColab = dpDiarioBordo.filter(o => o.funcionario_id === func.id).sort((a, b) => b.data_ocorrencia.localeCompare(a.data_ocorrencia));

    if (ocorrsColab.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Nenhuma ocorrência disciplinar, falta ou atestado registrado no prontuário.', margin + 4, y);
      y += 12;
    } else {
      ocorrsColab.forEach((oc, idx) => {
        // Quebra de página se necessário
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, pageWidth - (margin * 2), 22, 'FD');

        const abonoBadge = oc.abonar_ocorrencia
          ? `[ABONADO - Autorizado por: ${oc.aprovado_por_nome || 'Diretoria'}]`
          : `[DESCONTO EM FOLHA: ${oc.impacto_folha.replace(/_/g, ' ')}]`;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(`${oc.data_ocorrencia} ${oc.hora_ocorrencia || ''} - ${oc.titulo_resumo}`, margin + 3, y + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        if (oc.abonar_ocorrencia) {
          doc.setTextColor(16, 185, 129); // verde
        } else {
          doc.setTextColor(220, 38, 38); // vermelho
        }
        doc.text(abonoBadge, margin + 3, y + 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const descBreve = oc.descricao_detalhada.length > 105 ? oc.descricao_detalhada.slice(0, 105) + '...' : oc.descricao_detalhada;
        doc.text(`Relato: ${descBreve}`, margin + 3, y + 15);

        const qtdAnexos = oc.anexos ? oc.anexos.length : 0;
        const infoAnexos = qtdAnexos > 0 ? `Comprovantes Anexados: ${qtdAnexos} arquivo(s) arquivado(s)` : 'Sem anexos probatórios';
        doc.text(`Canal: ${oc.canal_autorizacao.replace(/_/g, ' ')} | Duração/Falta: ${oc.minutos_atraso_ou_dias_falta || '-'} | ${infoAnexos}`, margin + 3, y + 19);

        y += 25;
      });
    }

    // Assinaturas e Blindagem Jurídica
    if (y > 235) {
      doc.addPage();
      y = 20;
    }

    y += 10;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Declaro para os devidos fins legais que as informações cadastrais e o histórico de ocorrências acima espelham fielmente os registros', margin, y);
    doc.text('operacionais, cartões de ponto, atestados médicos apresentados e autorizações emitidas para o cumprimento das normas da CLT e SST.', margin, y + 4);

    y += 22;
    const colWidth = (pageWidth - (margin * 2)) / 3;

    // Assinatura 1: Empregador
    doc.setDrawColor(148, 163, 184);
    doc.line(margin, y, margin + colWidth - 8, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Empregador / Responsável Legal', margin, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(cli?.nome || 'Empresa', margin, y + 8);

    // Assinatura 2: Colaborador
    doc.line(margin + colWidth, y, margin + (colWidth * 2) - 8, y);
    doc.setFont('helvetica', 'bold');
    doc.text('Colaborador(a)', margin + colWidth, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(func.nome_completo, margin + colWidth, y + 8);

    // Assinatura 3: Consultoria DP
    doc.line(margin + (colWidth * 2), y, margin + (colWidth * 3), y);
    doc.setFont('helvetica', 'bold');
    doc.text('fin.up Consultoria (DP & SST)', margin + (colWidth * 2), y + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`, margin + (colWidth * 2), y + 8);

    // Salva e faz o download direto
    const nomeLimpo = func.nome_completo.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Dossie_Trabalhista_${nomeLimpo}_${anoAtual}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOPO & BANNER ESTRATÉGICO DO MÓDULO DP & SST */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-blue to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Módulo de Departamento Pessoal, SST & Blindagem Trabalhista</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Central Integrada de DP & SST (fin.up)
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Cockpit unificado para controle de PGR/PCMSO, exames ASO, entrega de EPIs, férias no limite concessivo, diário de bordo disciplinar com abono e exportação de dossiê trabalhista jurídico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Botão Sincronizar com Tarefas GestUp */}
            <button
              onClick={handleSincronizarTarefas}
              disabled={syncFeedback.loading}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncFeedback.loading ? 'animate-spin' : ''}`} />
              <span>Sincronizar com Tarefas do GestUp</span>
            </button>
          </div>
        </div>

        {/* Feedback Toast de Sincronização */}
        {syncFeedback.msg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback.msg}</span>
          </div>
        )}

        {/* Sub-navegação em Abas (Cockpit | Empresas | Funcionários) */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setSubTab('cockpit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              subTab === 'cockpit'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Radar Geral de Alertas (Cockpit)</span>
            {contadoresCockpit.criticos > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                {contadoresCockpit.criticos} críticos
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('empresas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              subTab === 'empresas'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Building2 className="w-4 h-4 text-brand-blue" />
            <span>Controle por Empresa (PGR, PCMSO, Dissídio & Drive)</span>
          </button>

          <button
            onClick={() => setSubTab('funcionarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              subTab === 'funcionarios'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>Quadro de Funcionários & Prontuário 360º</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
              {dpFuncionarios.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-ABA 1: RADAR GERAL DE ALERTAS (COCKPIT DO DP) */}
      {/* ========================================================================= */}
      {subTab === 'cockpit' && (
        <div className="space-y-6">
          {/* CARDS DE TOPO COM CONTADORES CRÍTICOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: PGR/PCMSO */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PGR / PCMSO</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{contadoresCockpit.pgrPcmso}</p>
              <p className="text-[11px] text-slate-500 mt-1">Vencendo nos próx. 30d</p>
            </div>

            {/* Card 2: ASOs e EPIs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ASOs & EPIs</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{contadoresCockpit.asosEpis}</p>
              <p className="text-[11px] text-slate-500 mt-1">Renovações necessárias</p>
            </div>

            {/* Card 3: Férias Limite Concessivo */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Férias no Limite</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{contadoresCockpit.ferias}</p>
              <p className="text-[11px] text-slate-500 mt-1">Risco de pagamento em dobro</p>
            </div>

            {/* Card 4: Experiência 45/90d */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Experiência (45/90d)</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{contadoresCockpit.experiencia}</p>
              <p className="text-[11px] text-slate-500 mt-1">Decisão de efetivação</p>
            </div>

            {/* Card 5: Dissídios do Mês */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dissídios do Mês</span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{contadoresCockpit.dissidios}</p>
              <p className="text-[11px] text-slate-500 mt-1">Mês {mesAtual} (Data-Base)</p>
            </div>
          </div>

          {/* FILTROS E TABELA DE ALERTAS URGENTES */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>Painel de Alertas Operacionais (Próximos 30 Dias)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Itens com vencimento iminente ou expirados que exigem ação preventiva imediata da fin.up
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Filtro Empresa */}
                <select
                  value={empresaFiltro}
                  onChange={e => setEmpresaFiltro(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
                >
                  <option value="todos">Todas as Empresas</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>

                {/* Filtro Status */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setFiltroAlerta('todos')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filtroAlerta === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Todos ({alertasCalculados.length})
                  </button>
                  <button
                    onClick={() => setFiltroAlerta('vencidos')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filtroAlerta === 'vencidos' ? 'bg-red-500 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Vencidos ({contadoresCockpit.criticos})
                  </button>
                  <button
                    onClick={() => setFiltroAlerta('proximos')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filtroAlerta === 'proximos' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Próx. 30d
                  </button>
                </div>
              </div>
            </div>

            {/* TABELA DE ALERTAS */}
            <div className="overflow-x-auto">
              {alertasFiltrados.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Parabéns! Tudo 100% em dia no DP & SST</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Nenhum vencimento de PGR, PCMSO, ASO, EPI ou término de contrato de experiência nos próximos 30 dias para o filtro selecionado.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Categoria / Tipo</th>
                      <th className="px-5 py-3.5">Empresa</th>
                      <th className="px-5 py-3.5">Colaborador / Alvo</th>
                      <th className="px-5 py-3.5">Data Limite</th>
                      <th className="px-5 py-3.5">Status Vigência</th>
                      <th className="px-5 py-3.5 text-right">Ação Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alertasFiltrados.map(al => (
                      <tr key={al.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                              al.tipo === 'PGR' || al.tipo === 'PCMSO'
                                ? 'bg-amber-100 text-amber-800'
                                : al.tipo === 'ASO'
                                ? 'bg-blue-100 text-brand-blue'
                                : al.tipo === 'EPI'
                                ? 'bg-teal-100 text-teal-800'
                                : al.tipo === 'Ferias'
                                ? 'bg-purple-100 text-purple-800'
                                : al.tipo === 'Experiencia'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {al.tipo}
                            </span>
                            <span className="font-bold text-slate-900">{al.titulo}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{al.detalhe}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          {al.empresaNome}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {al.funcionarioNome || 'Geral da Empresa'}
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-slate-700">
                          {al.dataLimite}
                        </td>
                        <td className="px-5 py-4">
                          {al.status === 'Vencido' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                              Vencido ({Math.abs(al.diasRestantes)}d)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              {al.diasRestantes === 0 ? 'Vence Hoje' : `Vence em ${al.diasRestantes}d`}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {al.funcionarioId ? (
                            <button
                              onClick={() => {
                                const f = dpFuncionarios.find(item => item.id === al.funcionarioId);
                                if (f) {
                                  setFuncionarioSelecionado(f);
                                  setProntuarioSubAba('vencimentos');
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-brand-blue text-white font-bold text-xs transition-all shadow-xs"
                            >
                              Abrir Prontuário
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const cfg = dpEmpresasConfig.find(item => item.empresa_id === al.empresaId);
                                if (cfg) {
                                  setEmpresaEmEdicao(cfg);
                                  setConfigEmpresaModalOpen(true);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
                            >
                              Configurar SST
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-ABA 2: CONTROLE POR EMPRESA (PGR, PCMSO, DISSÍDIO E DRIVE) */}
      {/* ========================================================================= */}
      {subTab === 'empresas' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle">
            <div>
              <h2 className="text-base font-bold text-slate-900">Configurações de DP, SST & Documentos de Empresa</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Vigência dos programas de segurança do trabalho (PGR/PCMSO), convenções coletivas e links diretos do Google Drive.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={empresaFiltro}
                onChange={e => setEmpresaFiltro(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
              >
                <option value="todos">Todas as Empresas ({clientes.length})</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientes
              .filter(c => empresaFiltro === 'todos' || c.id === empresaFiltro)
              .map(cli => {
                const cfg = dpEmpresasConfig.find(cfg => cfg.empresa_id === cli.id) || {
                  id: `dp-cfg-${cli.id}`,
                  empresa_id: cli.id,
                  sindicato_nome: 'Sindicato Geral da Categoria',
                  mes_data_base_dissidio: 5,
                  ultimo_dissidio_conferido_ano: 2026,
                  pgr_ppra_vencimento: '',
                  pcmso_vencimento: '',
                  drive_folder_empresa_url: ''
                };

                const funcsCount = dpFuncionarios.filter(f => f.empresa_id === cli.id && f.status === 'Ativo').length;
                const isDissidioMes = cfg.mes_data_base_dissidio === mesAtual;

                return (
                  <div key={cli.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-card transition-all space-y-4 flex flex-col justify-between">
                    <div>
                      {/* Topo do Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full">
                            {cli.regime_tributario}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1.5">{cli.nome}</h3>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{cli.cnpj_cpf}</p>
                        </div>
                        <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {funcsCount} <span className="text-[9px] font-normal ml-0.5">colab</span>
                        </div>
                      </div>

                      {/* Painel SST (PGR / PCMSO) */}
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">PGR / GRO:</span>
                          <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                            !cfg.pgr_ppra_vencimento
                              ? 'bg-slate-100 text-slate-500'
                              : cfg.pgr_ppra_vencimento < hojeStr
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {cfg.pgr_ppra_vencimento || 'Não Lançado'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">PCMSO Médico:</span>
                          <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                            !cfg.pcmso_vencimento
                              ? 'bg-slate-100 text-slate-500'
                              : cfg.pcmso_vencimento < hojeStr
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {cfg.pcmso_vencimento || 'Não Lançado'}
                          </span>
                        </div>

                        {/* Sindicato e Dissídio */}
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-[11px]">Sindicato da Categoria:</span>
                            {isDissidioMes && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                                Mês da Data-Base!
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-800 truncate" title={cfg.sindicato_nome}>
                            {cfg.sindicato_nome || 'Não definido'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Data-Base: <strong>Mês {cfg.mes_data_base_dissidio}</strong> | Último: {cfg.ultimo_dissidio_conferido_ano || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Ações: Google Drive & Configuração */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <a
                        href={formatarLinkDriveSeguro(cfg.drive_folder_empresa_url, cli.nome)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-brand-blue font-bold text-xs transition-all"
                      >
                        <FolderOpen className="w-4 h-4 text-brand-blue" />
                        <span>Abrir Pasta da Empresa no Drive</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </a>

                      <button
                        onClick={() => {
                          setEmpresaEmEdicao(cfg);
                          setConfigEmpresaModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-brand-blue text-white font-bold text-xs transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar Parâmetros de DP & SST</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-ABA 3: QUADRO DE FUNCIONÁRIOS & PRONTUÁRIO 360º */}
      {/* ========================================================================= */}
      {subTab === 'funcionarios' && (
        <div className="space-y-6">
          {/* BARRA DE FILTROS & NOVO FUNCIONÁRIO */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              {/* Campo Busca */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome, cargo ou CPF..."
                  value={buscaFunc}
                  onChange={e => setBuscaFunc(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white focus:border-brand-blue outline-none transition-all"
                />
              </div>

              {/* Filtro Empresa */}
              <select
                value={empresaFiltro}
                onChange={e => setEmpresaFiltro(e.target.value)}
                className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
              >
                <option value="todos">Todas as Empresas</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>

              {/* Filtro Status */}
              <select
                value={statusFuncFiltro}
                onChange={e => setStatusFuncFiltro(e.target.value)}
                className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white outline-none cursor-pointer"
              >
                <option value="todos">Todos os Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Ferias">Férias</option>
                <option value="Afastado_INSS">Afastado INSS</option>
                <option value="Licenca_Maternidade">Licença Maternidade</option>
                <option value="Aviso_Previo">Aviso Prévio</option>
                <option value="Desligado">Desligado</option>
              </select>
            </div>

            <button
              onClick={() => setNovoFuncionarioModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-blue hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-brand-blue/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Funcionário</span>
            </button>
          </div>

          {/* TABELA DE FUNCIONÁRIOS */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              {funcionariosFiltrados.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Nenhum funcionário encontrado</h3>
                  <p className="text-xs text-slate-500">
                    Ajuste os filtros ou cadastre um novo colaborador no botão acima.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Colaborador</th>
                      <th className="px-5 py-3.5">Empresa</th>
                      <th className="px-5 py-3.5">Cargo & CBO</th>
                      <th className="px-5 py-3.5">Admissão</th>
                      <th className="px-5 py-3.5">Experiência (45d / 90d)</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Prontuário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {funcionariosFiltrados.map(func => {
                      const cli = clientes.find(c => c.id === func.empresa_id);
                      const dtExp1 = func.vencimento_exp_1 ? new Date(func.vencimento_exp_1 + 'T00:00:00') : null;
                      const dtExp2 = func.vencimento_exp_2 ? new Date(func.vencimento_exp_2 + 'T00:00:00') : null;
                      const diff1 = dtExp1 ? Math.ceil((dtExp1.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null;
                      const diff2 = dtExp2 ? Math.ceil((dtExp2.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null;

                      return (
                        <tr key={func.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xs shrink-0">
                                {func.nome_completo.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">{func.nome_completo}</h4>
                                <p className="text-[11px] text-slate-500 font-mono">CPF: {func.cpf || '-'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-800">
                            {cli?.nome || 'Empresa'}
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-800">{func.cargo || '-'}</p>
                            <p className="text-[11px] text-slate-500">CBO: {func.cbo || '-'} ({func.tipo_contrato})</p>
                          </td>
                          <td className="px-5 py-4 font-mono text-slate-700">
                            {func.data_admissao}
                          </td>
                          <td className="px-5 py-4 space-y-1">
                            {diff1 !== null && (
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="font-semibold text-slate-500">45d:</span>
                                <span className={`px-2 py-0.5 rounded font-bold ${
                                  diff1 < 0
                                    ? 'bg-slate-100 text-slate-600'
                                    : diff1 <= 15
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {diff1 < 0 ? 'Concluído' : `em ${diff1}d`}
                                </span>
                              </div>
                            )}
                            {diff2 !== null && (
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="font-semibold text-slate-500">90d:</span>
                                <span className={`px-2 py-0.5 rounded font-bold ${
                                  diff2 < 0
                                    ? 'bg-slate-100 text-slate-600'
                                    : diff2 <= 15
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-brand-blue'
                                }`}>
                                  {diff2 < 0 ? 'Concluído' : `em ${diff2}d`}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              func.status === 'Ativo'
                                ? 'bg-emerald-100 text-emerald-800'
                                : func.status === 'Ferias'
                                ? 'bg-purple-100 text-purple-800'
                                : func.status === 'Afastado_INSS'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {func.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => {
                                setFuncionarioSelecionado(func);
                                setProntuarioSubAba('ficha');
                              }}
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-blue text-white font-bold text-xs transition-all shadow-xs"
                            >
                              Abrir Prontuário 360º
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PRONTUÁRIO 360º DO COLABORADOR (4 ABAS COMPLETAS) */}
      {/* ========================================================================= */}
      {funcionarioSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Topo do Modal */}
            <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-blue/30 border border-brand-blue/40 text-brand-blue flex items-center justify-center font-black text-base shrink-0">
                  {funcionarioSelecionado.nome_completo.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{funcionarioSelecionado.nome_completo}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {funcionarioSelecionado.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {funcionarioSelecionado.cargo} • Empresa: <strong>{clientes.find(c => c.id === funcionarioSelecionado.empresa_id)?.nome}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportarDossieTrabalhistaPDF(funcionarioSelecionado)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Dossiê PDF Completo</span>
                </button>
                <button
                  onClick={() => setFuncionarioSelecionado(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Abas Internas do Prontuário 360º */}
            <div className="flex items-center gap-1 px-6 pt-3 bg-slate-100 border-b border-slate-200 overflow-x-auto">
              <button
                onClick={() => setProntuarioSubAba('ficha')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all ${
                  prontuarioSubAba === 'ficha'
                    ? 'bg-white text-brand-blue border-t-2 border-brand-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Aba 1: Ficha Cadastral & Google Drive</span>
              </button>

              <button
                onClick={() => setProntuarioSubAba('diario')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all ${
                  prontuarioSubAba === 'diario'
                    ? 'bg-white text-brand-blue border-t-2 border-brand-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Aba 2: Diário de Bordo (Ocorrências & Abonos)</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
                  {dpDiarioBordo.filter(o => o.funcionario_id === funcionarioSelecionado.id).length}
                </span>
              </button>

              <button
                onClick={() => setProntuarioSubAba('vencimentos')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all ${
                  prontuarioSubAba === 'vencimentos'
                    ? 'bg-white text-brand-blue border-t-2 border-brand-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Aba 3: Controle de ASOs, EPIs, Férias & 13º</span>
              </button>

              <button
                onClick={() => setProntuarioSubAba('dossie')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl font-bold text-xs transition-all ${
                  prontuarioSubAba === 'dossie'
                    ? 'bg-white text-brand-blue border-t-2 border-brand-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Aba 4: Exportação Jurídica (Dossiê PDF)</span>
              </button>
            </div>

            {/* CONTEÚDO DO PRONTUÁRIO */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* ABA 1: FICHA CADASTRAL & DRIVE */}
              {prontuarioSubAba === 'ficha' && (
                <div className="space-y-6">
                  {/* Banner de Experiência */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 uppercase">1º Período de Experiência (45 dias)</span>
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-lg font-black text-amber-900">
                        {funcionarioSelecionado.vencimento_exp_1 || 'Calculado na admissão'}
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Data limite para avaliar se prorrogará para os 90 dias ou encerrará o contrato de experiência.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-blue uppercase">2º Período de Experiência (90 dias)</span>
                        <ShieldCheck className="w-4 h-4 text-brand-blue" />
                      </div>
                      <p className="text-lg font-black text-brand-blue">
                        {funcionarioSelecionado.vencimento_exp_2 || 'Calculado na admissão'}
                      </p>
                      <p className="text-[11px] text-blue-700">
                        Após esta data, o contrato passa automaticamente a vigorar por prazo indeterminado (CLT).
                      </p>
                    </div>
                  </div>

                  {/* Informações Pessoais & Contratuais */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/70 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dados Mestres do Contrato</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">CPF:</span>
                        <span className="font-bold text-slate-900 font-mono">{funcionarioSelecionado.cpf || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">RG:</span>
                        <span className="font-bold text-slate-900 font-mono">{funcionarioSelecionado.rg || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">PIS / NIS:</span>
                        <span className="font-bold text-slate-900 font-mono">{funcionarioSelecionado.pis_nis || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">CTPS / Série:</span>
                        <span className="font-bold text-slate-900">{funcionarioSelecionado.ctps || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Data de Admissão:</span>
                        <span className="font-bold text-slate-900">{funcionarioSelecionado.data_admissao}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Salário Base:</span>
                        <span className="font-bold text-emerald-600">
                          R$ {(funcionarioSelecionado.salario_base || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tipo de Contrato:</span>
                        <span className="font-bold text-slate-900">{funcionarioSelecionado.tipo_contrato}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Departamento:</span>
                        <span className="font-bold text-slate-900">{funcionarioSelecionado.departamento || '-'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 block">Jornada de Trabalho:</span>
                        <span className="font-bold text-slate-900">{funcionarioSelecionado.jornada_trabalho || '44h semanais'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Telefone / WhatsApp:</span>
                        <span className="font-bold text-slate-900">{funcionarioSelecionado.telefone_whatsapp || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">E-mail:</span>
                        <span className="font-bold text-slate-900 truncate block">{funcionarioSelecionado.email || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Google Drive & Ficha de Registro */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pasta no Drive */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-brand-blue" />
                        <h4 className="font-bold text-sm text-slate-900">Pasta do Colaborador no Google Drive</h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        Acesse a pasta na nuvem onde ficam armazenados holerites, cópias de documentos e atestados em alta resolução.
                      </p>
                      <div className="space-y-2">
                        <a
                          href={formatarLinkDriveSeguro(funcionarioSelecionado.drive_folder_funcionario_url, funcionarioSelecionado.nome_completo)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-brand-blue font-bold text-xs transition-all shadow-xs"
                        >
                          <FolderOpen className="w-4 h-4 text-brand-blue" />
                          <span>Abrir / Localizar Pasta no Google Drive</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <div className="flex items-center gap-1.5 pt-1">
                          <input
                            type="text"
                            placeholder="Vincular link próprio do Drive (ex: drive.google.com/drive/folders/...)"
                            defaultValue={funcionarioSelecionado.drive_folder_funcionario_url || ''}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] outline-none bg-slate-50 focus:bg-white"
                            onBlur={e => {
                              if (e.target.value.trim() && e.target.value.trim() !== funcionarioSelecionado.drive_folder_funcionario_url) {
                                updateDPFuncionario(funcionarioSelecionado.id, {
                                  drive_folder_funcionario_url: e.target.value.trim()
                                });
                                setFuncionarioSelecionado(prev => prev ? { ...prev, drive_folder_funcionario_url: e.target.value.trim() } : null);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ficha de Registro Assinada */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-bold text-sm text-slate-900">Ficha de Registro de Empregado</h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        Documento oficial assinado pelo empregado no momento da admissão (CLT Art. 41).
                      </p>
                      <div className="flex items-center gap-3">
                        {funcionarioSelecionado.ficha_registro_pdf_url ? (
                          <a
                            href={funcionarioSelecionado.ficha_registro_pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver Ficha Assinada</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Pendente de upload</span>
                        )}
                        <label className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-all">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Fazer Upload</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="application/pdf,image/*"
                            onChange={e => {
                              handleFileChange(e, (nome, url) => {
                                updateDPFuncionario(funcionarioSelecionado.id, {
                                  ficha_registro_pdf_url: url
                                });
                                setFuncionarioSelecionado(prev => prev ? { ...prev, ficha_registro_pdf_url: url } : null);
                              });
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: DIÁRIO DE BORDO (OCORRÊNCIAS & ABONOS) */}
              {prontuarioSubAba === 'diario' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Prontuário de Ocorrências & Diário de Bordo</h4>
                      <p className="text-xs text-slate-500">
                        Histórico completo de faltas, atrasos, atestados, advertências e horas extras com comprovação documental.
                      </p>
                    </div>

                    <button
                      onClick={() => setNovaOcorrenciaModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-blue hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-brand-blue/20 transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Nova Ocorrência no Diário</span>
                    </button>
                  </div>

                  {/* Linha do Tempo Cronológica */}
                  <div className="space-y-4">
                    {dpDiarioBordo
                      .filter(o => o.funcionario_id === funcionarioSelecionado.id)
                      .sort((a, b) => b.data_ocorrencia.localeCompare(a.data_ocorrencia))
                      .map(oc => (
                        <div key={oc.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                {oc.data_ocorrencia} {oc.hora_ocorrencia || ''}
                              </span>
                              <h5 className="font-bold text-sm text-slate-900">{oc.titulo_resumo}</h5>
                            </div>

                            <div className="flex items-center gap-2">
                              {oc.abonar_ocorrencia ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  ABONADO POR: {oc.aprovado_por_nome || 'Diretoria'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">
                                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                                  DESCONTO EM FOLHA: {oc.impacto_folha.replace(/_/g, ' ')}
                                </span>
                              )}

                              <button
                                onClick={() => deleteDPOcorrencia(oc.id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-all"
                                title="Excluir Ocorrência"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl">
                            {oc.descricao_detalhada}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                            <div>
                              Canal: <strong>{oc.canal_autorizacao.replace(/_/g, ' ')}</strong>
                              {oc.minutos_atraso_ou_dias_falta && (
                                <span className="ml-3">Duração: <strong>{oc.minutos_atraso_ou_dias_falta}</strong></span>
                              )}
                            </div>
                            <div>Registrado por: <strong>{oc.registrado_por_usuario}</strong></div>
                          </div>

                          {/* ANEXOS PROBATÓRIOS COM PLAYER / VISUALIZADOR EMBUTIDO */}
                          {oc.anexos && oc.anexos.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Documentos & Provas Anexadas ({oc.anexos.length}):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {oc.anexos.map(anx => (
                                  <div key={anx.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2 truncate">
                                        <FileText className="w-4 h-4 text-brand-blue shrink-0" />
                                        <span className="font-semibold text-slate-800 truncate" title={anx.nome_arquivo}>
                                          {anx.nome_arquivo}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 shrink-0">{anx.tamanho}</span>
                                    </div>

                                    {/* Player de Áudio Embutido */}
                                    {anx.tipo_mime.startsWith('audio/') && (
                                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mb-1">
                                          <Volume2 className="w-3.5 h-3.5 text-brand-blue" />
                                          <span>Áudio de Justificativa / WhatsApp:</span>
                                        </div>
                                        <audio controls className="w-full h-8" src={anx.url} />
                                      </div>
                                    )}

                                    {/* Thumbnail de Imagem */}
                                    {anx.tipo_mime.startsWith('image/') && (
                                      <div
                                        onClick={() => setAnexoVisualizando(anx)}
                                        className="h-20 w-full rounded-lg bg-slate-200 overflow-hidden cursor-pointer hover:opacity-90 transition-all relative group"
                                      >
                                        <img src={anx.url} alt={anx.nome_arquivo} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all">
                                          <Eye className="w-4 h-4 mr-1" /> Clique para Ampliar
                                        </div>
                                      </div>
                                    )}

                                    {/* Link de Abertura / Download */}
                                    <div className="flex items-center justify-end gap-2 pt-1">
                                      <a
                                        href={anx.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        download={anx.nome_arquivo}
                                        className="text-[11px] font-bold text-brand-blue hover:underline flex items-center gap-1"
                                      >
                                        <Download className="w-3 h-3" /> Baixar Anexo
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ABA 3: CONTROLE DE ASOS, EPIS, FÉRIAS E 13º */}
              {prontuarioSubAba === 'vencimentos' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Vencimentos Ocupacionais, Férias & EPIs</h4>
                      <p className="text-xs text-slate-500">
                        Renovação de ASOs médicos, entregas de equipamentos de proteção (CA) e controle do período aquisitivo de férias.
                      </p>
                    </div>

                    <button
                      onClick={() => setNovoVencimentoModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-blue hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-brand-blue/20 transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Lançar Exame / EPI / Vencimento</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dpControleVencimentos
                      .filter(v => v.funcionario_id === funcionarioSelecionado.id)
                      .map(venc => {
                        const isVencido = venc.data_vencimento_limite < hojeStr;

                        return (
                          <div key={venc.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  {venc.categoria.replace(/_/g, ' ')}
                                </span>
                                <h5 className="font-bold text-sm text-slate-900 mt-1">{venc.titulo_item}</h5>
                              </div>

                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                isVencido
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isVencido ? 'Vencido' : 'Em Dia'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                              {venc.numero_ca_epi && (
                                <div>
                                  <span className="text-slate-500 block text-[10px]">Número CA (EPI):</span>
                                  <span className="font-bold font-mono text-slate-900">{venc.numero_ca_epi}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-slate-500 block text-[10px]">Realizado / Entregue:</span>
                                <span className="font-bold text-slate-900">{venc.data_realizacao_entrega || '-'}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-slate-500 block text-[10px]">Vencimento Limite:</span>
                                <span className="font-bold font-mono text-red-600">{venc.data_vencimento_limite}</span>
                              </div>
                            </div>

                            {venc.observacoes && (
                              <p className="text-xs text-slate-600 italic">{venc.observacoes}</p>
                            )}

                            {/* Comprovante / Upload */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                              {venc.anexo_comprovante_url ? (
                                <a
                                  href={venc.anexo_comprovante_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-brand-blue hover:underline flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Ver Comprovante Assinado
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[11px] italic">Sem anexo</span>
                              )}

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => deleteDPVencimento(venc.id)}
                                  className="text-slate-400 hover:text-red-600 transition-all p-1"
                                  title="Excluir Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* ABA 4: EXPORTAÇÃO JURÍDICA (DOSSIÊ PDF) */}
              {prontuarioSubAba === 'dossie' && (
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-lg font-black text-slate-900">Exportar Dossiê Trabalhista Completo</h4>
                    <p className="text-xs text-slate-500">
                      Gera um PDF oficial contendo histórico contratual, todos os ASOs com datas de renovação, comprovantes de EPIs e a cronologia integral do Diário de Bordo para blindagem em eventuais fiscalizações ou defesas trabalhistas.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <button
                      onClick={() => exportarDossieTrabalhistaPDF(funcionarioSelecionado)}
                      className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-brand-blue text-white font-bold text-sm shadow-xl transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Baixar Dossiê Trabalhista em PDF (A4)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVO FUNCIONÁRIO */}
      {/* ========================================================================= */}
      {novoFuncionarioModalOpen && (
        <NovoFuncionarioModal
          clientes={clientes}
          onClose={() => setNovoFuncionarioModalOpen(false)}
          onSalvar={novoFunc => {
            addDPFuncionario(novoFunc);
            setNovoFuncionarioModalOpen(false);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVA OCORRÊNCIA NO DIÁRIO DE BORDO */}
      {/* ========================================================================= */}
      {novaOcorrenciaModalOpen && funcionarioSelecionado && (
        <NovaOcorrenciaModal
          funcionario={funcionarioSelecionado}
          onClose={() => setNovaOcorrenciaModalOpen(false)}
          onSalvar={novaOcorr => {
            addDPOcorrencia(novaOcorr);
            setNovaOcorrenciaModalOpen(false);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVO VENCIMENTO (ASO / EPI / FÉRIAS) */}
      {/* ========================================================================= */}
      {novoVencimentoModalOpen && funcionarioSelecionado && (
        <NovoVencimentoModal
          funcionario={funcionarioSelecionado}
          onClose={() => setNovoVencimentoModalOpen(false)}
          onSalvar={novoVenc => {
            addDPVencimento(novoVenc);
            setNovoVencimentoModalOpen(false);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURAÇÃO DE SST & DP DA EMPRESA */}
      {/* ========================================================================= */}
      {configEmpresaModalOpen && empresaEmEdicao && (
        <ConfigEmpresaModal
          config={empresaEmEdicao}
          empresaNome={clientes.find(c => c.id === empresaEmEdicao.empresa_id)?.nome || 'Empresa'}
          onClose={() => {
            setConfigEmpresaModalOpen(false);
            setEmpresaEmEdicao(null);
          }}
          onSalvar={novoCfg => {
            salvarDPEmpresaConfig(novoCfg);
            setConfigEmpresaModalOpen(false);
            setEmpresaEmEdicao(null);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: VISUALIZADOR DE IMAGEM / ANEXO EM ALTA DEFINIÇÃO */}
      {/* ========================================================================= */}
      {anexoVisualizando && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-4 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm text-slate-800 truncate">{anexoVisualizando.nome_arquivo}</span>
              <button
                onClick={() => setAnexoVisualizando(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-2xl p-2">
              <img src={anexoVisualizando.url} alt={anexoVisualizando.nome_arquivo} className="max-w-full max-h-[70vh] object-contain rounded-xl" />
            </div>
            <div className="flex justify-end">
              <a
                href={anexoVisualizando.url}
                download={anexoVisualizando.nome_arquivo}
                className="px-4 py-2 rounded-xl bg-brand-blue text-white font-bold text-xs flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Baixar Imagem Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENTES MODAIS AUXILIARES
// =========================================================================

// 1. MODAL NOVO FUNCIONÁRIO COM CÁLCULO DINÂMICO DE EXPERIÊNCIA
function NovoFuncionarioModal({
  clientes,
  onClose,
  onSalvar
}: {
  clientes: { id: string; nome: string }[];
  onClose: () => void;
  onSalvar: (func: Omit<DPFuncionario, 'id'>) => void;
}) {
  const [empresaId, setEmpresaId] = useState(clientes[0]?.id || '');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [pisNis, setPisNis] = useState('');
  const [ctps, setCtps] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [cbo, setCbo] = useState('');
  const [departamento, setDepartamento] = useState('Operacional');
  const [salario, setSalario] = useState<number>(2000);
  const [tipoContrato, setTipoContrato] = useState<DPTipoContrato>('CLT');
  const [jornada, setJornada] = useState('44h semanais / Escala 6x1');
  const [dataAdmissao, setDataAdmissao] = useState(new Date().toISOString().split('T')[0]);
  const [vencExp1, setVencExp1] = useState('');
  const [vencExp2, setVencExp2] = useState('');
  const [status, setStatus] = useState<DPStatusFuncionario>('Ativo');
  const [driveUrl, setDriveUrl] = useState('');
  const [fichaPdfUrl, setFichaPdfUrl] = useState('');

  // Ao alterar a data de admissão, calcula dinamicamente 45d (+44 dias) e 90d (+89 dias)
  React.useEffect(() => {
    if (dataAdmissao) {
      const dt = new Date(dataAdmissao + 'T00:00:00');
      if (!isNaN(dt.getTime())) {
        const d1 = new Date(dt.getTime() + 44 * 24 * 60 * 60 * 1000);
        const d2 = new Date(dt.getTime() + 89 * 24 * 60 * 60 * 1000);
        setVencExp1(d1.toISOString().split('T')[0]);
        setVencExp2(d2.toISOString().split('T')[0]);
      }
    }
  }, [dataAdmissao]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !empresaId) return;

    onSalvar({
      empresa_id: empresaId,
      nome_completo: nome.trim(),
      cpf: cpf.trim(),
      rg: rg.trim(),
      pis_nis: pisNis.trim(),
      ctps: ctps.trim(),
      data_nascimento: dataNascimento || undefined,
      telefone_whatsapp: telefone.trim(),
      email: email.trim(),
      cargo: cargo.trim(),
      cbo: cbo.trim(),
      departamento: departamento.trim(),
      salario_base: Number(salario) || 0,
      tipo_contrato: tipoContrato,
      jornada_trabalho: jornada.trim(),
      data_admissao: dataAdmissao,
      vencimento_exp_1: vencExp1,
      vencimento_exp_2: vencExp2,
      status: status,
      drive_folder_funcionario_url: driveUrl.trim() || undefined,
      ficha_registro_pdf_url: fichaPdfUrl || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-blue" />
            Cadastrar Novo Colaborador (Ficha de Registro)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Empresa Empregadora *</label>
              <select
                value={empresaId}
                onChange={e => setEmpresaId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                required
              >
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nome Completo *</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Carlos Eduardo Ribeiro"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">RG</label>
              <input
                type="text"
                value={rg}
                onChange={e => setRg(e.target.value)}
                placeholder="00.000.000-0"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">PIS / NIS</label>
              <input
                type="text"
                value={pisNis}
                onChange={e => setPisNis(e.target.value)}
                placeholder="000.00000.00-0"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CTPS / Série</label>
              <input
                type="text"
                value={ctps}
                onChange={e => setCtps(e.target.value)}
                placeholder="1234567 / 001-0"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Cargo</label>
              <input
                type="text"
                value={cargo}
                onChange={e => setCargo(e.target.value)}
                placeholder="Ex: Auxiliar de Cozinha / Chapeiro"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">CBO (Classificação Brasileira)</label>
              <input
                type="text"
                value={cbo}
                onChange={e => setCbo(e.target.value)}
                placeholder="Ex: 5135-05"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Salário Base (R$)</label>
              <input
                type="number"
                value={salario}
                onChange={e => setSalario(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tipo de Contrato</label>
              <select
                value={tipoContrato}
                onChange={e => setTipoContrato(e.target.value as DPTipoContrato)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              >
                <option value="CLT">CLT Indeterminado</option>
                <option value="Experiencia">Experiência (45 + 45)</option>
                <option value="Estagio">Estágio</option>
                <option value="Intermitente">Intermitente</option>
                <option value="Pro-Labore">Pró-Labore</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Data de Admissão *</label>
              <input
                type="date"
                value={dataAdmissao}
                onChange={e => setDataAdmissao(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Jornada de Trabalho</label>
              <input
                type="text"
                value={jornada}
                onChange={e => setJornada(e.target.value)}
                placeholder="Ex: 44h semanais / Escala 6x1"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Cards de Contrato de Experiência Auto-calculados */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-100 border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-amber-800 block mb-1">Término Experiência 1 (45d)</label>
              <input
                type="date"
                value={vencExp1}
                onChange={e => setVencExp1(e.target.value)}
                className="w-full p-2 rounded-lg border border-amber-200 bg-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-blue-800 block mb-1">Término Experiência 2 (90d)</label>
              <input
                type="date"
                value={vencExp2}
                onChange={e => setVencExp2(e.target.value)}
                className="w-full p-2 rounded-lg border border-blue-200 bg-white font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Link da Pasta no Google Drive</label>
            <input
              type="text"
              value={driveUrl}
              onChange={e => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-bold shadow-md shadow-brand-blue/20"
            >
              Salvar Colaborador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. MODAL NOVA OCORRÊNCIA COM SWITCH INTELIGENTE DE ABONO & MÚLTIPLOS ANEXOS
function NovaOcorrenciaModal({
  funcionario,
  onClose,
  onSalvar
}: {
  funcionario: DPFuncionario;
  onClose: () => void;
  onSalvar: (ocorr: Omit<DPDiarioBordo, 'id' | 'created_at'>) => void;
}) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('');
  const [tipo, setTipo] = useState<DPTipoOcorrencia>('Atraso');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [minutosOuDias, setMinutosOuDias] = useState('');
  const [abonar, setAbonar] = useState(false);
  const [aprovadoPor, setAprovadoPor] = useState('');
  const [canal, setCanal] = useState<DPCanalAutorizacao>('Grupo_WhatsApp');
  const [impacto, setImpacto] = useState<DPImpactoFolha>('Descontar_Horas_Dias');
  const [anexos, setAnexos] = useState<DPAnexoOcorrencia[]>([]);

  // Quando ativa o switch de abonar, ajusta impacto padrão
  const handleAbonarToggle = (val: boolean) => {
    setAbonar(val);
    if (val) {
      setImpacto('Sem_Desconto_Abonado');
      if (!aprovadoPor) setAprovadoPor('Rodrigo (Diretoria)');
    } else {
      setImpacto('Descontar_Horas_Dias');
    }
  };

  // Upload de múltiplos arquivos (Imagens, PDFs, Áudios)
  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, idx) => {
      const tamanhoStr = `${(file.size / 1024).toFixed(1)} KB`;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAnexos(prev => [
            ...prev,
            {
              id: `anx-${Date.now()}-${idx}`,
              nome_arquivo: file.name,
              url: reader.result as string,
              tipo_mime: file.type || 'application/octet-stream',
              tamanho: tamanhoStr,
              data_upload: new Date().toISOString().split('T')[0]
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !data) return;
    if (abonar && !aprovadoPor.trim()) {
      alert('Por favor, informe quem autorizou o abono da ocorrência (ex: Rodrigo, Jaksson).');
      return;
    }

    onSalvar({
      funcionario_id: funcionario.id,
      empresa_id: funcionario.empresa_id,
      data_ocorrencia: data,
      hora_ocorrencia: hora || undefined,
      tipo_ocorrencia: tipo,
      titulo_resumo: titulo.trim(),
      descricao_detalhada: descricao.trim(),
      minutos_atraso_ou_dias_falta: minutosOuDias.trim() || undefined,
      abonar_ocorrencia: abonar,
      aprovado_por_nome: abonar ? aprovadoPor.trim() : undefined,
      canal_autorizacao: canal,
      impacto_folha: impacto,
      anexos: anexos,
      registrado_por_usuario: 'Ygor (DP & SST)'
    });
  };

  const exigeAbonoLogic = tipo === 'Atraso' || tipo === 'Falta_Injustificada' || tipo === 'Falta_Justificada_Atestado' || tipo === 'Saida_Antecipada';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-blue" />
              Lançar Ocorrência no Diário de Bordo
            </h3>
            <p className="text-xs text-slate-500">Colaborador: <strong>{funcionario.nome_completo}</strong></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Data da Ocorrência *</label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Horário (Opcional)</label>
              <input
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tipo de Ocorrência *</label>
              <select
                value={tipo}
                onChange={e => {
                  const novoTipo = e.target.value as DPTipoOcorrencia;
                  setTipo(novoTipo);
                  if (novoTipo === 'Falta_Justificada_Atestado') setCanal('Atestado_Medico');
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              >
                <option value="Atraso">Atraso no Turno</option>
                <option value="Falta_Injustificada">Falta Injustificada</option>
                <option value="Falta_Justificada_Atestado">Atestado Médico / Justificada</option>
                <option value="Saida_Antecipada">Saída Antecipada</option>
                <option value="Advertencia_Verbal">Advertência Verbal</option>
                <option value="Advertencia_Escrita">Advertência Escrita</option>
                <option value="Suspensao">Suspensão Disciplinar</option>
                <option value="Hora_Extra_Autorizada">Hora Extra Autorizada</option>
                <option value="Elogio_Destaque">Elogio / Destaque</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tempo de Atraso ou Dias de Falta</label>
              <input
                type="text"
                value={minutosOuDias}
                onChange={e => setMinutosOuDias(e.target.value)}
                placeholder="Ex: 50 minutos ou 2 dias"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Título Resumo *</label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Atraso de 40min no turno da noite ou Atestado Odontológico"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Descrição Detalhada & Justificativa</label>
            <textarea
              rows={3}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descreva o que ocorreu, justificativa informada pelo colaborador no WhatsApp, CID do atestado ou histórico..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          {/* SWITCH INTELIGENTE DE ABONO */}
          {exigeAbonoLogic && (
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Abonar no Ponto / Folha de Pagamento?</span>
                  <span className="text-[11px] text-slate-500">
                    Se marcado Sim, não haverá desconto salarial e será registrado o responsável pelo abono.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAbonarToggle(!abonar)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${
                    abonar ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {abonar ? (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <label className="font-bold text-emerald-800 block mb-1">Autorizado por quem? *</label>
                    <input
                      type="text"
                      value={aprovadoPor}
                      onChange={e => setAprovadoPor(e.target.value)}
                      placeholder="Ex: Rodrigo, Jaksson, Gerente Local"
                      className="w-full p-2 rounded-lg border border-emerald-300 bg-white outline-none text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Canal de Autorização</label>
                    <select
                      value={canal}
                      onChange={e => setCanal(e.target.value as DPCanalAutorizacao)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white outline-none text-xs"
                    >
                      <option value="Grupo_WhatsApp">Grupo WhatsApp Oficial</option>
                      <option value="Mensagem_Privada">WhatsApp Privado</option>
                      <option value="Email">E-mail</option>
                      <option value="Presencial">Presencial / Verbal</option>
                      <option value="Atestado_Medico">Atestado Médico / Odontológico</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200">
                  <label className="font-bold text-red-700 block mb-1">Impacto Previsto no Fechamento da Folha</label>
                  <select
                    value={impacto}
                    onChange={e => setImpacto(e.target.value as DPImpactoFolha)}
                    className="w-full p-2 rounded-lg border border-red-200 bg-white outline-none text-xs"
                  >
                    <option value="Descontar_Horas_Dias">Descontar apenas Horas/Dias</option>
                    <option value="Descontar_DSR_e_Dia">Descontar DSR + Dia da Falta</option>
                    <option value="Banco_de_Horas">Lançar no Banco de Horas</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* MÚLTIPLOS ANEXOS (PDF, PNG, JPG, ÁUDIO MP3/OGG) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Anexos Probatórios (Prints, Atestados, Áudios)</label>
              <label className="text-brand-blue font-bold cursor-pointer hover:underline flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Adicionar Arquivos
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,audio/*"
                  onChange={handleMultipleFiles}
                  className="hidden"
                />
              </label>
            </div>

            {anexos.length > 0 && (
              <div className="space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {anexos.map((anx, i) => (
                  <div key={anx.id} className="flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border">
                    <span className="truncate max-w-[280px] font-medium text-slate-800">{anx.nome_arquivo}</span>
                    <button
                      type="button"
                      onClick={() => setAnexos(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-red-500 hover:text-red-700 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-bold shadow-md shadow-brand-blue/20"
            >
              Registrar no Diário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. MODAL NOVO VENCIMENTO (ASO / EPI / FÉRIAS / 13º)
function NovoVencimentoModal({
  funcionario,
  onClose,
  onSalvar
}: {
  funcionario: DPFuncionario;
  onClose: () => void;
  onSalvar: (venc: Omit<DPControleVencimento, 'id'>) => void;
}) {
  const [categoria, setCategoria] = useState<DPCategoriaVencimento>('ASO_Periodico');
  const [titulo, setTitulo] = useState('ASO Periódico Anual');
  const [numeroCa, setNumeroCa] = useState('');
  const [dataEntrega, setDataEntrega] = useState(new Date().toISOString().split('T')[0]);
  const [dataVencimento, setDataVencimento] = useState('');
  const [obs, setObs] = useState('');
  const [anexoUrl, setAnexoUrl] = useState('');
  const [anexoNome, setAnexoNome] = useState('');

  // Ao mudar categoria, pré-preenche título e datas padrão
  const handleCategoriaChange = (cat: DPCategoriaVencimento) => {
    setCategoria(cat);
    const dt = new Date();
    if (cat.startsWith('ASO')) {
      setTitulo(cat.replace(/_/g, ' '));
      // 1 ano para ASO Periódico
      const umAno = new Date(dt.getTime() + 365 * 24 * 60 * 60 * 1000);
      setDataVencimento(umAno.toISOString().split('T')[0]);
    } else if (cat === 'Ficha_EPI') {
      setTitulo('Entrega de EPI');
      const seisMeses = new Date(dt.getTime() + 180 * 24 * 60 * 60 * 1000);
      setDataVencimento(seisMeses.toISOString().split('T')[0]);
    } else if (cat === 'Ferias') {
      setTitulo('Férias Regulamentares');
      const limiteConcessivo = new Date(dt.getTime() + 330 * 24 * 60 * 60 * 1000);
      setDataVencimento(limiteConcessivo.toISOString().split('T')[0]);
    } else if (cat === 'Decimo_Terceiro_1') {
      setTitulo('13º Salário (1ª Parcela)');
      setDataVencimento(`${dt.getFullYear()}-11-30`);
    } else if (cat === 'Decimo_Terceiro_2') {
      setTitulo('13º Salário (2ª Parcela)');
      setDataVencimento(`${dt.getFullYear()}-12-20`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !dataVencimento) return;

    onSalvar({
      funcionario_id: funcionario.id,
      empresa_id: funcionario.empresa_id,
      categoria: categoria,
      titulo_item: titulo.trim(),
      numero_ca_epi: categoria === 'Ficha_EPI' ? numeroCa.trim() : undefined,
      data_realizacao_entrega: dataEntrega || undefined,
      data_vencimento_limite: dataVencimento,
      status: dataVencimento < new Date().toISOString().split('T')[0] ? 'Vencido' : 'Em_Dia',
      anexo_comprovante_url: anexoUrl || undefined,
      anexo_comprovante_nome: anexoNome || undefined,
      observacoes: obs.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-blue" />
            Lançar Vencimento (ASO / EPI / Férias)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Categoria de Vencimento *</label>
            <select
              value={categoria}
              onChange={e => handleCategoriaChange(e.target.value as DPCategoriaVencimento)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
            >
              <option value="ASO_Admissional">ASO Admissional</option>
              <option value="ASO_Periodico">ASO Periódico</option>
              <option value="ASO_Retorno">ASO Retorno ao Trabalho</option>
              <option value="ASO_Mudanca_Funcao">ASO Mudança de Função</option>
              <option value="ASO_Demissional">ASO Demissional</option>
              <option value="Ficha_EPI">Ficha de EPI (Equipamento de Proteção)</option>
              <option value="Ferias">Período de Férias</option>
              <option value="Decimo_Terceiro_1">13º Salário (1ª Parcela)</option>
              <option value="Decimo_Terceiro_2">13º Salário (2ª Parcela)</option>
              <option value="Aviso_Previo">Aviso Prévio</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Título do Item *</label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: ASO Periódico 2026 ou Bota de Couro Biqueira"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              required
            />
          </div>

          {categoria === 'Ficha_EPI' && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">Número do CA (Certificado de Aprovação) *</label>
              <input
                type="text"
                value={numeroCa}
                onChange={e => setNumeroCa(e.target.value)}
                placeholder="Ex: CA 42155"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Data Realização / Entrega</label>
              <input
                type="date"
                value={dataEntrega}
                onChange={e => setDataEntrega(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Data Vencimento Limite *</label>
              <input
                type="date"
                value={dataVencimento}
                onChange={e => setDataVencimento(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Observações Internas</label>
            <textarea
              rows={2}
              value={obs}
              onChange={e => setObs(e.target.value)}
              placeholder="Ex: Realizado na clínica MedTrabalho parceira fin.up..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Anexo do Comprovante Assinado (PDF/Foto)</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  setAnexoNome(f.name);
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') setAnexoUrl(reader.result);
                  };
                  reader.readAsDataURL(f);
                }
              }}
              className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
            />
            {anexoNome && <span className="text-[11px] text-emerald-600 block mt-1">✓ Anexo carregado: {anexoNome}</span>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-bold shadow-md shadow-brand-blue/20"
            >
              Salvar Vencimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. MODAL CONFIGURAÇÕES DE SST & DRIVE DA EMPRESA
function ConfigEmpresaModal({
  config,
  empresaNome,
  onClose,
  onSalvar
}: {
  config: DPEmpresaConfig;
  empresaNome: string;
  onClose: () => void;
  onSalvar: (cfg: DPEmpresaConfig) => void;
}) {
  const [sindicato, setSindicato] = useState(config.sindicato_nome || '');
  const [mesDissidio, setMesDissidio] = useState(config.mes_data_base_dissidio || 5);
  const [ultimoDissidioAno, setUltimoDissidioAno] = useState(config.ultimo_dissidio_conferido_ano || 2026);
  const [pgrVenc, setPgrVenc] = useState(config.pgr_ppra_vencimento || '');
  const [pcmsoVenc, setPcmsoVenc] = useState(config.pcmso_vencimento || '');
  const [driveUrl, setDriveUrl] = useState(config.drive_folder_empresa_url || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar({
      ...config,
      sindicato_nome: sindicato.trim(),
      mes_data_base_dissidio: Number(mesDissidio),
      ultimo_dissidio_conferido_ano: Number(ultimoDissidioAno),
      pgr_ppra_vencimento: pgrVenc || undefined,
      pcmso_vencimento: pcmsoVenc || undefined,
      drive_folder_empresa_url: driveUrl.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-blue" />
              Configurar SST & DP da Empresa
            </h3>
            <p className="text-xs text-slate-500">{empresaNome}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nome do Sindicato da Categoria</label>
            <input
              type="text"
              value={sindicato}
              onChange={e => setSindicato(e.target.value)}
              placeholder="Ex: SINTHORESSOR ou Sincomerciários"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mês Data-Base do Dissídio (1-12)</label>
              <select
                value={mesDissidio}
                onChange={e => setMesDissidio(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              >
                <option value={1}>Janeiro (Mês 1)</option>
                <option value={2}>Fevereiro (Mês 2)</option>
                <option value={3}>Março (Mês 3)</option>
                <option value={4}>Abril (Mês 4)</option>
                <option value={5}>Maio (Mês 5)</option>
                <option value={6}>Junho (Mês 6)</option>
                <option value={7}>Julho (Mês 7)</option>
                <option value={8}>Agosto (Mês 8)</option>
                <option value={9}>Setembro (Mês 9)</option>
                <option value={10}>Outubro (Mês 10)</option>
                <option value={11}>Novembro (Mês 11)</option>
                <option value={12}>Dezembro (Mês 12)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Ano da Última CCT Conferida</label>
              <input
                type="number"
                value={ultimoDissidioAno}
                onChange={e => setUltimoDissidioAno(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Vencimento PGR / GRO</label>
              <input
                type="date"
                value={pgrVenc}
                onChange={e => setPgrVenc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Vencimento PCMSO Médico</label>
              <input
                type="date"
                value={pcmsoVenc}
                onChange={e => setPcmsoVenc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Link Direto da Pasta no Google Drive</label>
            <input
              type="text"
              value={driveUrl}
              onChange={e => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-bold shadow-md shadow-brand-blue/20"
            >
              Salvar Parâmetros
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
