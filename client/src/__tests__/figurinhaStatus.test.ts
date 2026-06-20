import { describe, it, expect } from 'vitest';
import { statusFigurinha, isRepetida } from '../lib/figurinhaStatus';
import type { FigurinhaGridItem } from '@meualbum/shared';

function f(colada: boolean, quantidade: number): FigurinhaGridItem {
  return { _id: 'x', numero: 'BRA1', nome: 'Teste', colada, quantidade };
}

describe('statusFigurinha', () => {
  it('colada sem estoque → colada (c)', () => {
    expect(statusFigurinha(f(true, 0))).toBe('c');
  });

  it('colada com sobras no bolo → repetida tem prioridade (r) — caso BRA1', () => {
    expect(statusFigurinha(f(true, 3))).toBe('r');
    expect(statusFigurinha(f(true, 1))).toBe('r');
  });

  it('não colada sem estoque → faltante (f)', () => {
    expect(statusFigurinha(f(false, 0))).toBe('f');
  });

  it('não colada com 1 cópia (destinada ao álbum) → faltante (f)', () => {
    expect(statusFigurinha(f(false, 1))).toBe('f');
  });

  it('não colada com 2+ cópias → repetida (r)', () => {
    expect(statusFigurinha(f(false, 2))).toBe('r');
    expect(statusFigurinha(f(false, 5))).toBe('r');
  });
});

describe('isRepetida', () => {
  it('colada exige quantidade >= 1', () => {
    expect(isRepetida(f(true, 0))).toBe(false);
    expect(isRepetida(f(true, 1))).toBe(true);
  });

  it('não colada exige quantidade >= 2', () => {
    expect(isRepetida(f(false, 1))).toBe(false);
    expect(isRepetida(f(false, 2))).toBe(true);
  });
});
