import { describe, it, expect } from 'vitest';
import { agruparSecoesParaImpressao } from '../lib/agruparSecoesParaImpressao';
import type { SecaoGrid } from '@meualbum/shared';

function s(nome: string): SecaoGrid {
  return { _id: nome, nome, ordem: 0, figurinhas: [] };
}

describe('agruparSecoesParaImpressao', () => {
  it('lista vazia retorna tudo vazio', () => {
    const r = agruparSecoesParaImpressao([]);
    expect(r.primeira).toEqual([]);
    expect(r.paises).toEqual([]);
    expect(r.ultimas).toEqual([]);
  });

  it('1 seção: vai para primeira, paises e ultimas vazios', () => {
    const secoes = [s('S1')];
    const r = agruparSecoesParaImpressao(secoes);
    expect(r.primeira).toEqual([secoes[0]]);
    expect(r.paises).toEqual([]);
    expect(r.ultimas).toEqual([]);
  });

  it('2 seções: primeira e uma última, sem países', () => {
    const secoes = [s('S1'), s('S2')];
    const r = agruparSecoesParaImpressao(secoes);
    expect(r.primeira).toEqual([secoes[0]]);
    expect(r.paises).toEqual([]);
    expect(r.ultimas).toEqual([secoes[1]]);
  });

  it('3 seções: primeira, sem países, duas últimas', () => {
    const secoes = [s('S1'), s('S2'), s('S3')];
    const r = agruparSecoesParaImpressao(secoes);
    expect(r.primeira).toEqual([secoes[0]]);
    expect(r.paises).toEqual([]);
    expect(r.ultimas).toEqual([secoes[1], secoes[2]]);
  });

  it('51 seções (catálogo real): 1 primeira, 48 países, 2 últimas', () => {
    const secoes = Array.from({ length: 51 }, (_, i) => s(`S${i + 1}`));
    const r = agruparSecoesParaImpressao(secoes);
    expect(r.primeira).toHaveLength(1);
    expect(r.primeira[0]).toBe(secoes[0]);
    expect(r.paises).toHaveLength(48);
    expect(r.paises[0]).toBe(secoes[1]);
    expect(r.paises[47]).toBe(secoes[48]);
    expect(r.ultimas).toHaveLength(2);
    expect(r.ultimas[0]).toBe(secoes[49]);
    expect(r.ultimas[1]).toBe(secoes[50]);
  });

  it('4 seções mínimas com dois grupos: 1 primeira, 1 país, 2 últimas', () => {
    const secoes = [s('Abertura'), s('Brasil'), s('Historia'), s('CocaCola')];
    const r = agruparSecoesParaImpressao(secoes);
    expect(r.primeira).toEqual([secoes[0]]);
    expect(r.paises).toEqual([secoes[1]]);
    expect(r.ultimas).toEqual([secoes[2], secoes[3]]);
  });
});
