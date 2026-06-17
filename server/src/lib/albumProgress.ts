import { Types } from 'mongoose';
import { FigurinhaColada } from '../models/FigurinhaColada.js';

/**
 * Conta figurinhas coladas de vários álbuns em uma única aggregation,
 * evitando o padrão N+1 de um countDocuments por álbum.
 */
export async function contarColadasPorAlbum(
  albumIds: Types.ObjectId[]
): Promise<Map<string, number>> {
  if (albumIds.length === 0) return new Map();
  const rows: Array<{ _id: Types.ObjectId; coladas: number }> = await FigurinhaColada.aggregate([
    { $match: { albumId: { $in: albumIds } } },
    { $group: { _id: '$albumId', coladas: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r.coladas]));
}

/** Percentual de conclusão com 1 casa decimal (fórmula canônica do projeto). */
export function percentualConclusao(coladas: number, totalFigurinhas: number): number {
  if (!totalFigurinhas || totalFigurinhas <= 0) return 0;
  return Math.round((coladas / totalFigurinhas) * 1000) / 10;
}
