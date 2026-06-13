import { TipoAlbum } from '../../models/TipoAlbum.js';
import { Secao } from '../../models/Secao.js';
import { Sticker } from '../../models/Sticker.js';

/**
 * Seed mínimo para testes de integração: 1 TipoAlbum, 2 seções e 10 figurinhas
 * (FWC1..FWC10) — subconjunto compatível com tests/_seed.
 */
export async function seedCatalogoMinimo() {
  const tipo = await TipoAlbum.create({ nome: 'FIFA World Cup 2026™', totalFigurinhas: 10 });
  const [secaoA, secaoB] = await Secao.create([
    { tipoAlbumId: tipo._id, nome: 'Página Inicial', ordem: 1, totalFigurinhas: 5 },
    { tipoAlbumId: tipo._id, nome: 'Brasil', ordem: 2, totalFigurinhas: 5 },
  ]);
  const stickers = await Sticker.create(
    Array.from({ length: 10 }, (_, i) => {
      const secao = i < 5 ? secaoA : secaoB;
      return {
        number: `FWC${i + 1}`,
        section: secao.nome,
        secaoId: secao._id,
        subject: `Figurinha ${i + 1}`,
        type: 'player',
        isShiny: false,
      };
    })
  );
  return { tipo, secoes: [secaoA, secaoB], stickers };
}
