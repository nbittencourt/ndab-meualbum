import type { SecaoGrid } from '@meualbum/shared';

export interface GruposImpressao {
  primeira: SecaoGrid[];
  paises: SecaoGrid[];
  ultimas: SecaoGrid[];
}

export function agruparSecoesParaImpressao(secoes: SecaoGrid[]): GruposImpressao {
  if (secoes.length === 0) return { primeira: [], paises: [], ultimas: [] };
  if (secoes.length === 1) return { primeira: [secoes[0]], paises: [], ultimas: [] };
  if (secoes.length === 2) return { primeira: [secoes[0]], paises: [], ultimas: [secoes[1]] };
  if (secoes.length === 3) return { primeira: [secoes[0]], paises: [], ultimas: [secoes[1], secoes[2]] };
  return {
    primeira: [secoes[0]],
    paises: secoes.slice(1, -2),
    ultimas: secoes.slice(-2),
  };
}
