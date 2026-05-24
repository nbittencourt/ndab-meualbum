export type AlbumVariante =
  | 'BROCHURA'
  | 'CAPA_DURA'
  | 'CAPA_DURA_PRATA'
  | 'CAPA_DURA_OURO'
  | 'BOX_PREMIUM';

export interface TipoAlbum {
  _id: string;
  nome: string;
  totalFigurinhas: number;
}

export interface Secao {
  _id: string;
  tipoAlbumId: string;
  nome: string;
  ordem: number;
  totalFigurinhas: number;
}

export interface Album {
  _id: string;
  usuarioId: string;
  tipoAlbum: TipoAlbum;
  variante: AlbumVariante;
  nomePersonalizado?: string;
  criadoEm: string;
  arquivadoEm: string | null;
  percentualConclusao: number;
}

export interface StickerRankItem {
  figurinhaId: string;
  numero: string;
  nome: string;
  quantidade: number;
}

export interface HomeData {
  albums: Album[];
  totalAlbums: number;
  pagina: number;
  totalPaginas: number;
  figurinhasRepetidas: StickerRankItem[];
  totalRepetidas: number;
}

export interface AlbumDetalhe extends Album {
  secoes: SecaoDetalhe[];
}

export interface SecaoDetalhe extends Secao {
  figurinhasFaltantes: string[];
  figurinhasColadas: number;
}
