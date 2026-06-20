import type { FigurinhaGridItem } from '@meualbum/shared';

export type StatusFigurinha = 'c' | 'f' | 'r';

/**
 * Uma figurinha é "repetida" quando há cópias sobrando no bolo de repetidas
 * (estoque) além da cópia destinada ao álbum:
 * - colada: toda cópia em estoque é uma sobra (a do álbum já está colada) → quantidade >= 1
 * - não colada: a primeira cópia seria colada; sobra a partir da 2ª → quantidade >= 2
 */
export function isRepetida(f: FigurinhaGridItem): boolean {
  return f.quantidade - (f.colada ? 0 : 1) >= 1;
}

/**
 * Status de exibição da célula. "Repetida" tem prioridade sobre "colada":
 * mesmo já colada, se houver sobras no bolo de repetidas, exibe como repetida
 * (informação acionável — há cópias para troca).
 */
export function statusFigurinha(f: FigurinhaGridItem): StatusFigurinha {
  if (isRepetida(f)) return 'r';
  if (f.colada) return 'c';
  return 'f';
}
