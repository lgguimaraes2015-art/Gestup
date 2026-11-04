/**
 * Utilitários para gestão de competências e datas vigentes no Gestup
 */

/**
 * Retorna a competência do mês vigente no formato MM/AAAA (ex: "11/2026")
 */
export const obterCompetenciaAtual = (): string => {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();
  return `${mes}/${ano}`;
};

/**
 * Retorna o nome por extenso da competência (ex: "Novembro de 2026")
 */
export const obterNomeCompetencia = (comp: string): string => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const [mesStr, anoStr] = comp.split('/');
  const mesIdx = parseInt(mesStr, 10) - 1;
  if (mesIdx >= 0 && mesIdx < 12) {
    return `${meses[mesIdx]} de ${anoStr}`;
  }
  return comp;
};

/**
 * Verifica se uma tarefa é a tarefa protegida "Registro - Samira"
 */
export const ehRegistroSamira = (tarefa: { titulo?: string; descricao?: string; cliente_nome?: string }): boolean => {
  const tit = (tarefa.titulo || '').toLowerCase();
  const desc = (tarefa.descricao || '').toLowerCase();
  const cli = (tarefa.cliente_nome || '').toLowerCase();
  return tit.includes('samira') || desc.includes('samira') || cli.includes('samira');
};
