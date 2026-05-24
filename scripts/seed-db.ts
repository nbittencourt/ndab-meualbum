/**
 * Seed manual do banco de dados MeuAlbum.
 * Popula TipoAlbum, Secao e Sticker a partir dos arquivos em tests/_seed/.
 *
 * Uso: definir MONGODB_URI no ambiente antes de executar.
 * Normalmente chamado por scripts/seed-prd.ps1.
 */

import mongoose, { Schema, Types, model } from 'mongoose';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Schemas inline (evita dependência do tsconfig do servidor e path aliases)
// ---------------------------------------------------------------------------

const TipoAlbum = model(
  'TipoAlbum',
  new Schema({
    nome: { type: String, required: true, unique: true },
    totalFigurinhas: { type: Number, required: true, default: 0 },
  }),
);

const Secao = model(
  'Secao',
  new Schema({
    tipoAlbumId: { type: Types.ObjectId, ref: 'TipoAlbum', required: true },
    nome: { type: String, required: true },
    ordem: { type: Number, required: true, default: 0 },
    totalFigurinhas: { type: Number, required: true, default: 0 },
  }),
);

const Sticker = model(
  'Sticker',
  new Schema({
    number: { type: String, required: true, unique: true },
    section: { type: String, required: true },
    secaoId: { type: Types.ObjectId, ref: 'Secao', required: true },
    subject: { type: String, required: true },
    country: { type: String },
    type: { type: String, enum: ['player', 'badge', 'stadium', 'special'], required: true },
    isShiny: { type: Boolean, default: false },
  }),
);

// ---------------------------------------------------------------------------
// Tipos de dados dos arquivos seed
// ---------------------------------------------------------------------------

interface SeedTipoAlbum {
  id: number;
  nome: string;
  total_figurinhas: number;
}

interface SeedFigurinhas {
  id: number;
  numero: string;
  nome: string;
  secao_id: number;
  tipo_album_id: number;
  conta_para_fechar: boolean;
}

// ---------------------------------------------------------------------------
// Derivação de `type` a partir dos dados da figurinha
// ---------------------------------------------------------------------------

function derivarType(f: SeedFigurinhas): 'player' | 'badge' | 'stadium' | 'special' {
  if (f.secao_id === 1) return 'special';
  if (!f.conta_para_fechar) return 'special';

  const n = f.nome.toLowerCase();
  if (n.includes('escudo')) return 'badge';
  if (n.includes('estád') || n.includes('estad')) return 'stadium';
  if (n.includes('foto do time')) return 'badge';

  return 'player';
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Erro: MONGODB_URI não definida.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Conectado ao MongoDB.');

  // --- TipoAlbum ---
  const { tipo_albums }: { tipo_albums: SeedTipoAlbum[] } = JSON.parse(
    readFileSync(join(ROOT, 'tests/_seed/seed_tipo_album.json'), 'utf-8'),
  );

  const tipoAlbumMap = new Map<number, Types.ObjectId>(); // seed id → ObjectId

  const taBulk = tipo_albums.map((ta) => ({
    updateOne: {
      filter: { nome: ta.nome },
      update: { $set: { totalFigurinhas: ta.total_figurinhas } },
      upsert: true,
    },
  }));
  const taResult = await TipoAlbum.bulkWrite(taBulk, { ordered: false });
  console.log(
    `[TipoAlbum]  upserted: ${taResult.upsertedCount}  already-up-to-date: ${taResult.matchedCount}`,
  );

  // Popula mapa seed-id → ObjectId
  for (const ta of tipo_albums) {
    const doc = await TipoAlbum.findOne({ nome: ta.nome }, { _id: 1 }).lean();
    if (doc) tipoAlbumMap.set(ta.id, doc._id as Types.ObjectId);
  }

  // --- Figurinhas (fonte para Secao e Sticker) ---
  const { figurinhas }: { figurinhas: SeedFigurinhas[] } = JSON.parse(
    readFileSync(join(ROOT, 'tests/_seed/seed_figurinhas.json'), 'utf-8'),
  );

  // --- Secao ---
  // Agrupa figurinhas por secao_id para derivar metadados da seção
  const secaoGroups = new Map<number, SeedFigurinhas[]>();
  for (const f of figurinhas) {
    if (!secaoGroups.has(f.secao_id)) secaoGroups.set(f.secao_id, []);
    secaoGroups.get(f.secao_id)!.push(f);
  }

  const secaoBulk: Parameters<typeof Secao.bulkWrite>[0] = [];
  for (const [secaoId, grupo] of [...secaoGroups.entries()].sort(([a], [b]) => a - b)) {
    const prefix = grupo[0].numero.split('-')[0];
    const tipoAlbumOid = tipoAlbumMap.get(grupo[0].tipo_album_id);
    if (!tipoAlbumOid) {
      console.error(`TipoAlbum id=${grupo[0].tipo_album_id} não encontrado — seção ${secaoId} ignorada.`);
      continue;
    }

    secaoBulk.push({
      updateOne: {
        filter: { tipoAlbumId: tipoAlbumOid, ordem: secaoId },
        update: {
          $set: { nome: prefix, totalFigurinhas: grupo.length },
          $setOnInsert: { tipoAlbumId: tipoAlbumOid, ordem: secaoId },
        },
        upsert: true,
      },
    });
  }

  const secResult = await Secao.bulkWrite(secaoBulk, { ordered: false });
  console.log(
    `[Secao]      upserted: ${secResult.upsertedCount}  already-up-to-date: ${secResult.matchedCount}`,
  );

  // Popula mapa seed secao_id → ObjectId
  const secaoIdMap = new Map<number, Types.ObjectId>();
  const tipoAlbumIds = [...new Set([...tipoAlbumMap.values()])];
  const secaoDocs = await Secao.find({ tipoAlbumId: { $in: tipoAlbumIds } }, { _id: 1, ordem: 1 }).lean();
  for (const doc of secaoDocs) {
    secaoIdMap.set(doc.ordem as number, doc._id as Types.ObjectId);
  }

  // --- Sticker ---
  const stickerBulk: Parameters<typeof Sticker.bulkWrite>[0] = figurinhas.map((f) => {
    const section = f.numero.split('-')[0];
    const secaoOid = secaoIdMap.get(f.secao_id);
    const type = derivarType(f);
    const country = section !== 'ESP' ? section : undefined;

    return {
      updateOne: {
        filter: { number: f.numero },
        update: {
          $set: { subject: f.nome, section, secaoId: secaoOid, type, country },
          $setOnInsert: { number: f.numero, isShiny: false },
        },
        upsert: true,
      },
    };
  });

  const stickerResult = await Sticker.bulkWrite(stickerBulk, { ordered: false });
  console.log(
    `[Sticker]    upserted: ${stickerResult.upsertedCount}  already-up-to-date: ${stickerResult.matchedCount}`,
  );

  console.log('Seed concluído.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Falha no seed:', err);
  process.exit(1);
});
