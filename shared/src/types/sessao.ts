export type StatusDestino = 'PENDENTE' | 'COLADA' | 'REPETIDA';
export type PilhaOrigem = 'DIGITACAO' | 'CAMERA';

export interface PilhaDaSessao {
  _id: string;
  usuarioId: string;
  tipoAlbumId: string;
  figurinhaId: string | null;
  figurinhaNumero: string;
  figurinhaNome: string | null;
  origem: PilhaOrigem;
  statusDestino: StatusDestino;
  criadoEm: string;
}
