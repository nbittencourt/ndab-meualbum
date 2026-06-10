export type StickerType = 'player' | 'badge' | 'stadium' | 'special';
export type StickerStatus = 'owned' | 'needed' | 'duplicate';
export type FigurinhaOrigem = 'ESTOQUE' | 'DIRETA';

export interface Sticker {
  _id: string;
  number: string;
  section: string;
  secaoId: string;
  subject: string;
  country?: string;
  type: StickerType;
  isShiny: boolean;
}

export interface CollectionEntry {
  stickerId: string;
  status: StickerStatus;
  quantity: number;
}

export interface CollectionStats {
  total: number;
  owned: number;
  needed: number;
  duplicates: number;
  completionPercent: number;
}

export interface FigurinhaColada {
  _id: string;
  albumId: string;
  figurinhaId: string;
  origem: FigurinhaOrigem;
  coladaEm: string;
}

export interface EstoqueFigurinha {
  _id: string;
  usuarioId: string;
  figurinhaId: string;
  quantidade: number;
}

export type ElegibilidadeStatus = 'PODE_COLAR' | 'JA_COLADA' | 'FORA_CATALOGO';

export interface EstoqueItem extends EstoqueFigurinha {
  figurinha: Sticker;
  elegibilidade: ElegibilidadeStatus;
}
