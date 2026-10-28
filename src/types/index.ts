export type Departamento = 'Fiscal' | 'Contábil' | 'Pessoal' | 'Pessoal/RH' | 'Financeiro' | 'Administrativo' | 'Outros' | 'Societário' | 'Geral';
export type StatusTarefa = 'Pendente' | 'Em Andamento' | 'Concluída' | 'Atrasada' | 'Pausada';
export type Prioridade = 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
export type RegimeTributario = 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real' | 'MEI' | 'Isento';

export interface GuiaPagamentoTarefa {
  arquivo_nome: string;
  arquivo_url: string;
  arquivo_conteudo?: string; // Base64 / Data URL para download e envio como mídia
  arquivo_tamanho?: string;
  data_vencimento: string;
  valor?: number;
  enviado_email: boolean;
  enviado_whatsapp: boolean;
  email_destinatario?: string;
  telefone_destinatario?: string;
  data_envio: string;
}

export interface ComentarioItem {
  id: string;
  autor: string;
  data: string;
  texto: string;
}

export interface ContatoNotificacao {
  id: string;
  nome: string;
  telefoneOuGrupo: string;
  tipo: 'Individual' | 'Grupo';
  principal: boolean;
}

export interface DeclaracaoVinculadaCliente {
  declaracao_id: string;
  titulo: string;
  periodicidade: 'Mensal' | 'Trimestral' | 'Anual' | 'Eventual';
  data_inicio: string;
  dia_vencimento: number;
}

export interface HistoricoClienteItem {
  id: string;
  data: string;
  autor: string;
  tipo: 'Cadastro' | 'Edição' | 'Status' | 'Contrato' | 'Declaração' | 'WhatsApp';
  descricao: string;
}

export interface Cliente {
  id: string;
  nome: string;
  cnpj_cpf: string;
  email: string;
  telefone: string;
  whatsapp?: string;
  receber_guias_whatsapp?: boolean; // Se flegado, guias anexadas são enviadas automaticamente por WhatsApp
  contatos_notificacao?: ContatoNotificacao[]; // Múltiplos contatos (individuais ou grupos)
  regime_tributario: RegimeTributario;
  status: 'Ativo' | 'Inativo' | 'Suspenso';
  responsavel: string;
  honorario_mensal: number;
  dia_vencimento: number;
  endereco: string;
  observacoes?: string;
  data_inicio_contrato?: string;
  data_renovacao_contrato?: string;
  data_contrato?: string;
  validade_contrato?: string;
  particularidades_contrato?: string;
  contrato_assinado?: boolean;
  declaracoes_vinculadas?: DeclaracaoVinculadaCliente[];
  historico_alteracoes?: HistoricoClienteItem[];
  created_at: string;
}

export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: Departamento;
  status: 'Ativo' | 'Inativo';
  telefone: string;
  whatsapp?: string;
  data_admissao: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: 'Recorrente' | 'Avulsa' | 'Automática';
  status: StatusTarefa;
  prioridade: Prioridade;
  cliente_id: string;
  cliente_nome: string;
  responsavel: string;
  responsavel_id?: string;
  data_prazo_legal: string; // Data final da obrigação (Risco de Multa)
  data_prazo_meta: string;  // Prazo interno da equipe
  categoria: Departamento;
  competencia: string; // Ex: "10/2026", "09/2026"
  tempo_gasto_minutos: number;
  observacoes?: string;
  motivo_atraso?: string;
  recorrencia_tipo?: 'Mensal' | 'Trimestral' | 'Anual' | 'Única';
  declaracao_id?: string;
  processo_id?: string;
  data_conclusao?: string;
  prorrogacoes_count?: number;
  eh_pagamento?: boolean;
  guia_pagamento?: GuiaPagamentoTarefa;
  comentarios_lista?: ComentarioItem[];
  eh_processo?: boolean; // Habilita a tarefa como Gestão de Processos com etapas
  etapas_processo?: EtapaProcessoTarefa[];
  arquivos_anexos?: ArquivoEtapa[]; // Documentos/Guias fixados na tarefa
  created_at: string;
}

export interface ArquivoEtapa {
  id: string;
  nome: string;
  url: string;
  conteudo?: string; // Data URL / Base64 do arquivo
  tamanho?: string;
  data_upload: string;
}

export type FrequenciaCobrancaWhatsApp =
  | 'Diariamente'
  | 'Dia sim, dia não'
  | 'Semanalmente (Segundas-feiras)'
  | 'Quinzenalmente';

export interface ConfiguracaoCobrancaEtapa {
  habilitado: boolean;
  telefones: string[]; // 1 ou 2 números de WhatsApp
  mensagem_padrao: string;
  frequencia: FrequenciaCobrancaWhatsApp;
  horario_envio: string; // Fixo às 08:00
  ultimo_envio?: string;
  proximo_envio?: string;
  total_envios?: number;
}

export interface EtapaProcessoTarefa {
  id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  data_limite: string;
  concluida: boolean;
  data_conclusao?: string;
  arquivos: ArquivoEtapa[];
  cobrar_whatsapp: boolean;
  configuracao_cobranca?: ConfiguracaoCobrancaEtapa;
}

export interface TarefaComentario {
  id: string;
  tarefa_id: string;
  tipo: 'Comentário' | 'Prorrogação' | 'Auditoria' | 'WhatsApp';
  texto: string;
  autor: string;
  novo_prazo?: string;
  prazo_anterior?: string;
  created_at: string;
}

export interface Processo {
  id: string;
  tarefa_id?: string;
  tarefa_titulo?: string;
  cliente_id: string;
  cliente_nome: string;
  nome: string;
  status: 'Ativo' | 'Pendente' | 'Concluído' | 'Pausado';
  progresso: number; // 0 - 100
  motivo_pausa?: string;
  created_at: string;
}

export interface SubtarefaProcesso {
  id: string;
  processo_id: string;
  titulo: string;
  concluida: boolean;
  ordem: number;
  responsavel?: string;
}

export type Periodicidade = 'Mensal' | 'Anual' | 'Trimestral' | 'Eventual';

export interface Declaracao {
  id: string;
  titulo: string;
  descricao?: string;
  categoria: Departamento;
  periodicidade: Periodicidade;
  prioridade: Prioridade;
  recorrente?: boolean; // Recorrência: Sim / Não
  ativo: boolean;
  dia_limite_padrao?: number;
  orgao_competente?: string;
}

export interface ContaPagar {
  id: string;
  descricao: string;
  fornecedor: string;
  categoria: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'Pendente' | 'Pago' | 'Cancelado';
  recorrencia: 'Único' | 'Mensal' | 'Anual';
  observacoes?: string;
  comprovante_url?: string;
}

export interface ContaReceber {
  id: string;
  descricao: string;
  cliente_id: string;
  cliente_nome: string;
  categoria: 'Honorário Mensal' | 'Serviço Avulso' | 'Consultoria';
  valor: number;
  data_vencimento: string;
  data_recebimento?: string;
  status: 'Pendente' | 'Pago' | 'Vencido' | 'Cancelado';
  provisao_mensal?: boolean; // Se foi gerado automaticamente a partir do MRR do cliente
  observacoes?: string;
}

export interface HonorarioItem {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  contato_nome?: string;
  contato_telefone?: string;
  competencia: string; // Competência de origem (ex: "09/2026", "10/2026")
  valor: number;
  data_vencimento: string; // Data de vencimento (ex: "2026-09-30", "2026-10-05")
  data_pagamento?: string; // Data da baixa/pagamento efetivo (ex: "2026-10-05")
  competencia_pagamento?: string; // Mês em que entrou no caixa/faturamento realizado (ex: "10/2026")
  status: 'Pendente' | 'Pago' | 'Vencido' | 'Cancelado';
  parcela_info?: string; // Ex: "Parcela 4/12"
  forma_pagamento?: 'PIX PicPay' | 'Boleto' | 'Transferência' | 'Dinheiro' | 'Outro';
  comprovante_url?: string;
  observacoes?: string;
  conciliado_ofx?: boolean;
  dias_atraso?: number;
  created_at: string;
}

export interface CustoVinculadoReceita {
  id: string;
  descricao: string;
  valor: number;
  pago: boolean;
  conciliado_ofx: boolean;
}

export interface ReceitaNaoRecorrente {
  id: string;
  cliente_id?: string;
  cliente_nome: string;
  titulo_servico: string; // Ex: Abertura de Empresa, Alteração Societária, Regularização
  valor_total: number;
  data_prevista: string;
  data_recebimento?: string;
  status: 'Previsto' | 'Recebido' | 'Cancelado';
  custos_vinculados: CustoVinculadoReceita[];
  conciliado_ofx: boolean;
  created_at: string;
}

export interface TransacaoOFX {
  id: string;
  fitid: string;
  tipo: 'DEBIT' | 'CREDIT';
  data: string;
  valor: number;
  descricao: string;
  conciliado: boolean;
  banco: 'PicPay Empresas' | 'Outro';
}

export interface ContaBancaria {
  id: string;
  nome: string;
  banco: string;
  tipo: 'Conta Corrente' | 'Poupança / Reserva' | 'Caixa Físico';
  saldo_inicial: number;
  data_saldo_inicial: string;
  saldo_atual: number;
  data_ultimo_ajuste?: string;
  chave_pix?: string;
  agencia?: string;
  numero_conta?: string;
  observacoes?: string;
}

export interface HistoricoAjusteSaldo {
  id: string;
  conta_id: string;
  conta_nome: string;
  data: string;
  saldo_anterior: number;
  novo_saldo: number;
  diferenca: number;
  motivo: string;
  responsavel: string;
}

export interface FuncionarioCliente {
  id: string;
  cliente_id: string;
  nome_completo: string;
  funcao: string;
  data_admissao: string;
  salario: number;
  status: 'Ativo' | 'Afastado' | 'Desligado';
  observacoes?: string;
}

export interface MovimentacaoFuncionario {
  id: string;
  cliente_id: string;
  funcionario_id?: string;
  funcionario_nome?: string;
  data_solicitacao: string;
  solicitado_por: string;
  data_efeito: string;
  tipo_alteracao: 'Admissão' | 'Férias' | 'Aumento Salarial' | 'Mudança de Cargo' | 'Rescisão' | 'Outros';
  valor_alteracao?: string;
  status: 'Pendente' | 'Em Análise' | 'Concluído';
  observacoes?: string;
}

// ==================== MÓDULO CRM ====================

export type CRMLeadEstagio = 'Novo Lead' | 'Qualificação' | 'Diagnóstico' | 'Proposta Enviada' | 'Negociação' | 'Fechado' | 'Perdido' | string;

export interface CRMLead {
  id: string;
  nome: string;
  empresa: string;
  cpf_cnpj?: string;
  telefone: string;
  whatsapp?: string;
  email: string;
  origem: string;
  servico_interesse: string;
  estagio: CRMLeadEstagio;
  prioridade: Prioridade;
  valor_estimado: number;
  responsavel: string;
  data_proximo_followup?: string;
  observacoes?: string;
  tags?: string[];
  data_entrada: string;
  convertido_cliente_id?: string;
  radar_empresa_id?: string;
  dados_fiscais?: {
    regime: string;
    optante_simples: boolean;
    optante_mei: boolean;
    tem_ade_ativo: boolean;
    prazo_regularizacao_dias?: number;
    tem_divida_pgfn: boolean;
    valor_divida_pgfn?: number;
    tipo_divida_pgfn?: string;
    tem_divida_estadual?: boolean;
    valor_divida_estadual?: number;
    uf?: string;
    municipio?: string;
    endereco_completo?: string;
  };
}

export interface CRMProcedimentoTemplate {
  id: string;
  nome: string;
  descricao?: string;
  servico: string;
  etapas: {
    nome: string;
    ordem: number;
    prazo_dias: number;
    responsavel_padrao?: string;
    obrigatoria: boolean;
    documentos_exigidos?: string[];
  }[];
}

export interface CRMProcedimento {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  template_id?: string;
  nome: string;
  responsavel: string;
  prazo_final: string;
  servico: string;
  status: 'Em Andamento' | 'Concluído' | 'Atrasado';
  observacoes?: string;
  created_at: string;
}

export interface CRMProcedimentoEtapa {
  id: string;
  procedimento_id: string;
  nome: string;
  ordem: number;
  status: 'Pendente' | 'Em Andamento' | 'Concluída';
  responsavel: string;
  prazo: string;
  obrigatoria: boolean;
  observacoes?: string;
}

export interface CRMDocumento {
  id: string;
  cliente_id: string;
  cliente_nome?: string;
  procedimento_id?: string;
  etapa_id?: string;
  nome: string;
  tipo: 'Contrato Social' | 'Cartão CNPJ' | 'Certificado Digital' | 'Extrato Bancário' | 'Outros';
  status: 'Pendente' | 'Enviado' | 'Aprovado' | 'Rejeitado';
  observacao?: string;
  data_solicitacao: string;
  data_limite?: string;
  arquivo_url?: string;
}

export interface CRMEvento {
  id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  tipo: 'Reunião' | 'Apresentação' | 'Diagnóstico' | 'Alinhamento' | 'Follow-up';
  lead_id?: string;
  cliente_id?: string;
  responsavel: string;
  local?: string;
  origem: 'Manual' | 'Google Agenda';
  google_event_id?: string;
}

// ==================== MÓDULO WHATSAPP & AUTOMAÇÃO ====================

export interface ModeloMensagemTarefa {
  id: string;
  tipo_chave: 'simples_nacional' | 'folha_pagamento' | 'dctfweb' | 'honorarios' | 'padrao' | string;
  nome: string; // Ex: "Tarefa do Simples Nacional", "Folha de Pagamento / Pró-Labore"
  descricao?: string;
  categoria_tarefa?: Departamento | 'Geral';
  palavras_chave: string[]; // Termos para detecção automática (ex: ["simples nacional", "das"])
  texto_template: string;
}

export interface WhatsAppConfig {
  conectado: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'QRCODE';
  numero_conectado?: string;
  nome_instancia?: string;
  api_provider: 'Evolution API' | 'Z-API' | 'Meta Cloud API' | 'WhatsApp Web / QR Code';
  auto_enviar_manha: boolean; // Disparo automático das 08:00
  hora_envio_manha: string;
  lembrete_dias_antes: number; // Ex: 1 dia antes
  cobranca_atraso_ativa: boolean;
  cobranca_documentos_ativa: boolean;
  api_url?: string;
  api_key?: string;
  instancia_id?: string;
  qrcode_base64?: string;
  qr_code?: string;
  ultima_sincronizacao?: string;
  dominio_publico?: string; // URL pública para links de guias (ex: https://gestup.vercel.app)
  modelos_mensagens?: ModeloMensagemTarefa[];
}

export interface WhatsAppMensagem {
  id: string;
  destinatario_tipo: 'Colaborador' | 'Cliente' | 'Lead';
  destinatario_nome: string;
  telefone: string;
  tipo_notificacao: 'Resumo Diário' | 'Lembrete Prazo' | 'Cobrança Atraso' | 'Documento Pendente' | 'Honorário';
  mensagem: string;
  status: 'Fila' | 'Enviada' | 'Entregue' | 'Lida' | 'Falha';
  data_envio: string;
  referencia_id?: string; // id da tarefa, documento ou lead
}

// ==================== MÓDULO RADAR FISCAL & CAPTAÇÃO ATIVA (RECEITA FEDERAL & PGFN) ====================

export type StatusRiscoFiscal = 'ADE_ATIVO' | 'DIVIDA_PGFN' | 'DEBITO_PREVIDENCIARIO' | 'ALERTA_PREVENTIVO' | 'REGULAR';
export type StatusContatoRadar = 'Novo' | 'Importado_CRM' | 'Contatado_WhatsApp' | 'Em_Negociacao' | 'Descartado';

export interface SocioEmpresaRadar {
  nome: string;
  qualificacao: string;
  faixa_etaria?: string;
}

export interface EmpresaRadarFiscal {
  id: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral: 'Ativa' | 'Baixada' | 'Suspensa' | 'Inapta';
  data_abertura?: string;
  regime: 'Simples' | 'Simples Nacional' | 'MEI' | 'Regime Normal' | 'Lucro Presumido' | 'Lucro Real';
  optante_simples: boolean;
  optante_mei: boolean;
  
  // Status de Débitos e Alertas Fiscais
  tem_ade_ativo: boolean; // Ato Declaratório Executivo da Receita Federal (Risco de exclusão)
  data_ade?: string;
  prazo_regularizacao_dias?: number;
  motivo_ade?: string;
  
  tem_divida_pgfn: boolean; // Dívida Ativa da União (Procuradoria-Geral da Fazenda Nacional)
  valor_divida_pgfn: number;
  tipo_divida_pgfn?: 'Tributária' | 'Previdenciária' | 'FGTS' | 'Multa Eleitoral/Trabalhista' | 'Mista';
  inscricoes_pgfn_count?: number;
  
  tem_divida_estadual?: boolean;
  valor_divida_estadual?: number;
  
  // Localização e Endereço Completo
  uf: string;
  municipio: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  
  // Contatos para Abordagem
  telefone: string;
  telefone_secundario?: string;
  whatsapp?: string;
  email?: string;
  
  // Segmento e Atividade Econômica
  cnae_principal_codigo?: string;
  cnae_principal_descricao?: string;
  segmento?: string; // ex: 'Comércio Varejista', 'Restaurantes & Bares', 'Construção Civil', 'Serviços'
  
  // Quadro Societário (QSA)
  socios?: SocioEmpresaRadar[];
  socio_principal?: string;
  
  // Controle de Captação e CRM
  status_contato: StatusContatoRadar;
  lead_crm_id?: string;
  data_importacao_crm?: string;
  mensagens_enviadas_count: number;
  ultima_mensagem_data?: string;
  observacoes_captação?: string;
  
  // Potencial de Honorário de Regularização
  honorario_regularizacao_estimado?: number;
  honorario_mensal_sugerido?: number;
}

export interface FiltrosRadarFiscal {
  uf: string;
  municipio: string;
  termoBusca?: string;
  regime: 'todos' | 'simples' | 'mei' | 'normal';
  possuiDebitos: 'todos' | 'com_debitos' | 'sem_debitos';
  statusRisco?: 'todos' | 'ade_ativo' | 'pgfn' | 'regular';
  faixaDebito?: 'todos' | 'ate_10k' | '10k_50k' | '50k_150k' | 'acima_150k';
  segmento?: string;
}

export interface ModeloMensagemCaptação {
  id: string;
  titulo: string;
  descricao: string;
  tipo_alvo: 'ADE_SIMPLES' | 'DIVIDA_PGFN' | 'MEI_DAS' | 'PREVENTIVO';
  texto: string;
}

