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
    grupo: { type: String },
    sigla_time: { type: String },
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

interface SeedSecao {
  id: number;
  nome: string;
  grupo: string | null;
  sigla_time: string | null;
  tipo_album_id: number;
}

interface SeedFigurinha {
  id: number;
  numero: string;
  nome: string;
  secao_id: number;
  tipo_album_id: number;
  conta_para_fechar: boolean;
}

// ---------------------------------------------------------------------------
// Derivação de `section` a partir do número da figurinha
// ---------------------------------------------------------------------------

function derivarSection(numero: string): string {
  if (numero === '00') return 'FWC0';
  // strip trailing digits: "FWC1" → "FWC", "CC14" → "CC", "MEX20" → "MEX"
  return numero.replace(/\d+$/, '');
}

// ---------------------------------------------------------------------------
// Derivação de `type` a partir dos dados da figurinha
// ---------------------------------------------------------------------------

const SECOES_ESPECIAIS = new Set([1, 50, 51]);

function derivarType(f: SeedFigurinha): 'player' | 'badge' | 'stadium' | 'special' {
  if (SECOES_ESPECIAIS.has(f.secao_id)) return 'special';
  if (!f.conta_para_fechar) return 'special';

  const n = f.nome.toLowerCase();
  if (n.includes('team logo')) return 'badge';
  if (n.includes('escudo')) return 'badge';
  if (n.includes('foto do time')) return 'badge';
  if (n.includes('estád') || n.includes('estad')) return 'stadium';

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

  // --- Figurinhas (fonte para contagem de totalFigurinhas por seção e Sticker) ---
  const { figurinhas }: { figurinhas: SeedFigurinha[] } = JSON.parse(
    readFileSync(join(ROOT, 'tests/_seed/panini_wc2026_figurinhas.json'), 'utf-8'),
  );

  // Conta figurinhas por secao_id para popular totalFigurinhas nas seções
  const totalFigurinhasMap = new Map<number, number>();
  for (const f of figurinhas) {
    totalFigurinhasMap.set(f.secao_id, (totalFigurinhasMap.get(f.secao_id) ?? 0) + 1);
  }

  // --- Secao ---
  const { secoes }: { secoes: SeedSecao[] } = JSON.parse(
    readFileSync(join(ROOT, 'tests/_seed/panini_wc2026_secoes.json'), 'utf-8'),
  );

  const secaoBulk: Parameters<typeof Secao.bulkWrite>[0] = [];
  for (const s of secoes) {
    const tipoAlbumOid = tipoAlbumMap.get(s.tipo_album_id);
    if (!tipoAlbumOid) {
      console.error(`TipoAlbum id=${s.tipo_album_id} não encontrado — seção ${s.id} ignorada.`);
      continue;
    }
    const total = totalFigurinhasMap.get(s.id) ?? 0;
    secaoBulk.push({
      updateOne: {
        filter: { tipoAlbumId: tipoAlbumOid, ordem: s.id },
        update: {
          $set: {
            nome: s.nome,
            totalFigurinhas: total,
            grupo: s.grupo ?? undefined,
            sigla_time: s.sigla_time ?? undefined,
          },
          $setOnInsert: { tipoAlbumId: tipoAlbumOid, ordem: s.id },
        },
        upsert: true,
      },
    });
  }

  const secResult = await Secao.bulkWrite(secaoBulk, { ordered: false });
  console.log(
    `[Secao]      upserted: ${secResult.upsertedCount}  already-up-to-date: ${secResult.matchedCount}`,
  );

  // Popula mapa seed secao_id → { ObjectId, sigla_time }
  const secaoIdMap = new Map<number, { oid: Types.ObjectId; sigla_time: string | null }>();
  const tipoAlbumIds = [...new Set([...tipoAlbumMap.values()])];
  const secaoDocs = await Secao.find(
    { tipoAlbumId: { $in: tipoAlbumIds } },
    { _id: 1, ordem: 1, sigla_time: 1 },
  ).lean();
  for (const doc of secaoDocs) {
    secaoIdMap.set(doc.ordem as number, {
      oid: doc._id as Types.ObjectId,
      sigla_time: (doc as any).sigla_time ?? null,
    });
  }

  // --- Sticker ---
  const stickerBulk: Parameters<typeof Sticker.bulkWrite>[0] = figurinhas.map((f) => {
    const section = derivarSection(f.numero);
    const secaoData = secaoIdMap.get(f.secao_id);
    const type = derivarType(f);
    // usa sigla_time da seção para evitar typos nos prefixos dos números (ex: SWI9 → country SUI)
    const country = secaoData?.sigla_time ?? undefined;

    return {
      updateOne: {
        filter: { number: f.numero },
        update: {
          $set: { subject: f.nome, section, secaoId: secaoData?.oid, type, country },
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
