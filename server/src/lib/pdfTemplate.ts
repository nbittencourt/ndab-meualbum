export interface StickerPdf {
  id: string;
  number: string;
  section: string;
  subject: string;
  secaoId: string;
  grupo: string | null;
  sigla_time: string | null;
  status: 'colada' | 'faltante' | 'repetida';
}

export interface SecaoPdf {
  _id: string;
  nome: string;
  grupo: string | null;
  sigla_time: string | null;
  ordem: number;
}

export interface PdfData {
  nomeAlbum: string;
  nomeUsuario: string;
  identificador: string;
  stickers: StickerPdf[];
  secoes: SecaoPdf[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cell(status: 'colada' | 'faltante' | 'repetida', label: string): string {
  const cls = status === 'colada' ? 'c' : status === 'repetida' ? 'r' : 'f';
  return `<div class="cell ${cls}">${esc(label)}</div>`;
}

// ---------------------------------------------------------------------------
// Seções especiais (Página Inicial, History, Coca-Cola)
// ---------------------------------------------------------------------------

function buildSpecSection(
  secao: SecaoPdf,
  stickers: StickerPdf[],
  color: string,
): string {
  const coladas = stickers.filter((s) => s.status === 'colada').length;
  const cells = stickers.map((s) => cell(s.status, s.number)).join('');
  return `
<div class="spec">
  <div class="spec-hdr" style="background:${color}">
    <div>
      <span class="spec-code">${esc(secao.sigla_time ?? String(secao.ordem))}</span>
      <span class="spec-name">${esc(secao.nome)}</span>
    </div>
    <span class="spec-prog">${coladas}/${stickers.length}</span>
  </div>
  <div class="spec-cells">${cells}</div>
</div>`;
}

// ---------------------------------------------------------------------------
// Grid de país (dentro de um grupo)
// ---------------------------------------------------------------------------

function buildCountry(secao: SecaoPdf, stickers: StickerPdf[]): string {
  const coladas = stickers.filter((s) => s.status === 'colada').length;
  const cells = stickers.map((s) => cell(s.status, s.number.replace(/^[A-Z]+/, ''))).join('');
  return `
<div class="ctry">
  <div class="ctry-head">
    <div class="ctry-label">
      <span class="ctry-name">${esc(secao.nome)}</span>
      <span class="ctry-code">${esc(secao.sigla_time ?? '')}</span>
    </div>
    <span class="ctry-prog">${coladas}/${stickers.length}</span>
  </div>
  <div class="ctry-cells">${cells}</div>
</div>`;
}

// ---------------------------------------------------------------------------
// Builder principal
// ---------------------------------------------------------------------------

export function buildPdfHtml(data: PdfData): string {
  const { nomeAlbum, nomeUsuario, identificador, stickers, secoes } = data;

  const stickersBySecao = new Map<string, StickerPdf[]>();
  for (const s of stickers) {
    const list = stickersBySecao.get(s.secaoId) ?? [];
    list.push(s);
    stickersBySecao.set(s.secaoId, list);
  }

  const totalColadas = stickers.filter((s) => s.status === 'colada').length;
  const totalFaltantes = stickers.filter((s) => s.status === 'faltante').length;
  const totalRepetidas = stickers.filter((s) => s.status === 'repetida').length;
  const total = stickers.length;
  const pct = total > 0 ? Math.round((totalColadas / total) * 100) : 0;

  // seções especiais: ordem 1 (Página Inicial), 50 (History), 51 (Coca-Cola)
  const ORDENS_ESPECIAIS = [1, 50, 51];
  const CORES_ESPECIAIS: Record<number, string> = {
    1: '#0A0907',
    50: '#1a3a6e',
    51: '#C40000',
  };

  const especiais = secoes
    .filter((s) => ORDENS_ESPECIAIS.includes(s.ordem))
    .sort((a, b) => {
      // render na ordem: 1, 50, 51
      const idx = (o: number) => ORDENS_ESPECIAIS.indexOf(o);
      return idx(a.ordem) - idx(b.ordem);
    });

  const especiaisHtml = especiais
    .map((s) => {
      const ss = stickersBySecao.get(s._id) ?? [];
      return buildSpecSection(s, ss, CORES_ESPECIAIS[s.ordem] ?? '#333');
    })
    .join('\n');

  // grupos A-L
  const grupoLetras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const gruposHtml = grupoLetras
    .map((letra) => {
      const paises = secoes
        .filter((s) => s.grupo === letra)
        .sort((a, b) => a.ordem - b.ordem);
      if (paises.length === 0) return '';

      const grupoStickers = paises.flatMap((p) => stickersBySecao.get(p._id) ?? []);
      const grColadas = grupoStickers.filter((s) => s.status === 'colada').length;

      const countriesHtml = paises
        .map((p) => {
          const ps = stickersBySecao.get(p._id) ?? [];
          return buildCountry(p, ps);
        })
        .join('');

      return `
<div class="grp">
  <div class="grp-hdr">
    <span class="grp-id">Grupo ${esc(letra)}</span>
    <span class="grp-stats">${grColadas}/${grupoStickers.length}</span>
  </div>
  <div class="grp-countries">${countriesHtml}</div>
</div>`;
    })
    .join('\n');

  const now = new Date().toLocaleDateString('pt-BR');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Meu Album · Lista de Figurinhas</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
@page { size: A4 portrait; margin: 7mm; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  width: 210mm; min-height: 297mm; margin: 0 auto;
  background: #fff; font-family: 'DM Sans', system-ui, sans-serif;
  color: #0A0907; -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.hdr { background:#0A0907; padding:7px 10px; display:flex; justify-content:space-between; align-items:center; border-bottom:4px solid #E5142A; }
.hdr-l { display:flex; align-items:center; gap:6px; }
.ma-sq { width:20px; height:20px; background:#E5142A; border:1.5px solid rgba(255,255,255,0.8); display:flex; align-items:center; justify-content:center; font-family:'Archivo Black',sans-serif; font-size:9px; color:white; transform:rotate(-4deg); flex-shrink:0; }
.hdr-sep { width:1px; height:18px; background:rgba(255,255,255,0.15); margin:0 4px; }
.hdr-brand { font-family:'Archivo Black',sans-serif; font-size:11px; letter-spacing:0.05em; text-transform:uppercase; color:white; line-height:1; }
.hdr-doc { font-family:'DM Mono',monospace; font-size:7px; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.38); margin-top:2px; }
.hdr-r { text-align:right; }
.hdr-album { font-family:'Archivo Black',sans-serif; font-size:8px; text-transform:uppercase; letter-spacing:0.05em; color:rgba(255,255,255,0.8); display:block; line-height:1.3; }
.hdr-user { font-family:'DM Mono',monospace; font-size:6.5px; letter-spacing:0.1em; color:rgba(255,255,255,0.35); display:block; margin-top:2px; }
.stats { background:#0A0907; padding:3.5px 10px; display:flex; align-items:center; }
.stt { display:flex; align-items:center; gap:4px; font-family:'DM Mono',monospace; font-size:7px; letter-spacing:0.08em; color:rgba(255,255,255,0.45); margin-right:10px; }
.stt b { font-weight:500; color:white; }
.prog-wrap { flex:1; height:3px; background:rgba(255,255,255,0.15); margin:0 8px; position:relative; }
.prog-fill { position:absolute; left:0; top:0; bottom:0; background:#0A9145; }
.pct { font-family:'Archivo Black',sans-serif; font-size:14px; color:white; margin-right:3px; line-height:1; }
.pct-l { font-family:'DM Mono',monospace; font-size:6.5px; color:rgba(255,255,255,0.35); letter-spacing:0.1em; }
.content { padding:4px 8px 2px; display:flex; flex-direction:column; gap:2px; }
.spec { border:0.8px solid rgba(10,9,7,0.13); background:white; }
.spec-hdr { padding:2px 5px; display:flex; justify-content:space-between; align-items:center; }
.spec-code { font-family:'DM Mono',monospace; font-size:5px; letter-spacing:0.14em; color:rgba(255,255,255,0.55); display:block; }
.spec-name { font-family:'Archivo Black',sans-serif; font-size:6.5px; text-transform:uppercase; letter-spacing:0.03em; color:white; display:block; }
.spec-prog { font-family:'DM Mono',monospace; font-size:6px; color:rgba(255,255,255,0.55); }
.spec-cells { display:flex; flex-wrap:nowrap; gap:1px; padding:2px; overflow-x:auto; }
.spec-cells .cell { width:17px; flex-shrink:0; }
.grp { border:0.8px solid rgba(10,9,7,0.13); background:white; }
.grp-hdr { padding:2px 6px; background:#fafafa; border-left:3px solid #E5142A; border-bottom:0.8px solid rgba(10,9,7,0.1); display:flex; justify-content:space-between; align-items:center; }
.grp-id { font-family:'Archivo Black',sans-serif; font-size:7.5px; text-transform:uppercase; letter-spacing:0.08em; color:#0A0907; }
.grp-stats { font-family:'DM Mono',monospace; font-size:6px; color:rgba(10,9,7,0.4); }
.grp-countries { display:grid; grid-template-columns:repeat(4,1fr); border-top:0.8px solid rgba(10,9,7,0.12); }
.ctry { padding:2px 3px 2px; border-right:0.7px solid rgba(10,9,7,0.09); }
.ctry:last-child { border-right:none; }
.ctry-head { display:flex; justify-content:space-between; align-items:baseline; padding:2px 3px 1.5px; margin-bottom:2px; }
.ctry-label { display:flex; align-items:baseline; gap:2px; min-width:0; overflow:hidden; }
.ctry-name { font-family:'Archivo Black',sans-serif; font-size:6px; text-transform:uppercase; letter-spacing:0.02em; color:#0A0907; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ctry-code { font-family:'DM Mono',monospace; font-size:5px; letter-spacing:0.1em; color:rgba(10,9,7,0.4); flex-shrink:0; white-space:nowrap; }
.ctry-prog { font-family:'DM Mono',monospace; font-size:5.5px; color:rgba(10,9,7,0.35); flex-shrink:0; white-space:nowrap; margin-left:2px; }
.ctry-cells { display:grid; grid-template-columns:repeat(10,1fr); gap:1px; }
.cell { height:13px; display:flex; align-items:center; justify-content:center; font-family:'DM Mono',monospace; font-size:7px; line-height:1; flex-shrink:0; }
.cell.c { background:rgba(10,145,69,0.15); border:1px solid rgba(10,145,69,0.48); color:#0A9145; }
.cell.f { background:transparent; border:1.5px dashed rgba(10,9,7,0.22); color:rgba(10,9,7,0.28); }
.cell.r { background:rgba(229,20,42,0.1); border:1.5px solid #E5142A; color:#E5142A; border-radius:7px; font-size:7px; }
.legend { padding:3px 8px; display:flex; align-items:center; gap:10px; border-top:0.8px solid rgba(10,9,7,0.08); border-bottom:0.8px solid rgba(10,9,7,0.08); background:white; }
.leg { display:flex; align-items:center; gap:3px; }
.leg-sq { width:9px; height:9px; border:0.6px solid rgba(10,9,7,0.14); flex-shrink:0; }
.leg span { font-family:'DM Mono',monospace; font-size:6.5px; letter-spacing:0.07em; color:rgba(10,9,7,0.5); }
.footer { background:#0A0907; border-top:3px solid #E5142A; padding:6px 10px; display:flex; align-items:center; justify-content:space-between; gap:10px; }
.footer-mid { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
.footer-url { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:0.06em; color:white; }
.footer-note { font-family:'DM Mono',monospace; font-size:6.5px; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.28); }
.footer-logo { display:flex; align-items:center; gap:5px; flex-shrink:0; }
.footer-ma { width:24px; height:24px; background:#E5142A; display:flex; align-items:center; justify-content:center; font-family:'Archivo Black',sans-serif; font-size:10px; color:white; transform:rotate(-4deg); }
.footer-logo-text { font-family:'Archivo Black',sans-serif; font-size:12px; text-transform:uppercase; letter-spacing:0.04em; color:rgba(255,255,255,0.85); }
</style>
</head>
<body>

<header class="hdr">
  <div class="hdr-l">
    <div class="ma-sq">MA</div>
    <div>
      <div class="hdr-brand">Meu Album</div>
      <div class="hdr-doc">Lista de Figurinhas · Copa do Mundo 2026 · V1 Grade Tricolor</div>
    </div>
    <div class="hdr-sep"></div>
    <div style="font-family:'DM Mono',monospace;font-size:6.5px;letter-spacing:0.1em;color:rgba(255,255,255,0.28);text-transform:uppercase">Panini Oficial</div>
  </div>
  <div class="hdr-r">
    <span class="hdr-album">${esc(nomeAlbum)}</span>
    <span class="hdr-user">${esc(nomeUsuario)} · #${esc(identificador)} · gerado em ${esc(now)}</span>
  </div>
</header>

<div class="stats">
  <div class="stt"><span style="font-size:9px;color:#0A9145">■</span><b>${totalColadas}</b>&nbsp;coladas</div>
  <div class="stt"><span style="font-size:9px;color:rgba(255,255,255,0.35)">□</span><b>${totalFaltantes}</b>&nbsp;faltantes</div>
  <div class="stt"><span style="font-size:9px;color:#E5142A">⬤</span><b>${totalRepetidas}</b>&nbsp;repetidas</div>
  <div class="prog-wrap"><div class="prog-fill" style="width:${pct}%"></div></div>
  <div class="pct">${pct}%</div>
  <div class="pct-l">completo · <span>${total}</span> total</div>
</div>

<div class="content">
${especiaisHtml}
${gruposHtml}
</div>

<div class="legend">
  <div class="leg"><div class="leg-sq" style="background:rgba(10,145,69,0.15);border-color:rgba(10,145,69,0.48)"></div><span>Colada</span></div>
  <div class="leg"><div class="leg-sq" style="background:transparent;border:1.5px dashed rgba(10,9,7,0.22)"></div><span>Faltante</span></div>
  <div class="leg"><div class="leg-sq" style="background:rgba(229,20,42,0.1);border-color:#E5142A;border-radius:4px"></div><span>Repetida</span></div>
</div>

<footer class="footer">
  <div class="footer-mid">
    <span class="footer-url">meualbum.nicholas.tec.br</span>
    <span class="footer-note">Não-oficial · Feito por colecionadores</span>
  </div>
  <div class="footer-logo">
    <div class="footer-ma">MA</div>
    <span class="footer-logo-text">Meu Album</span>
  </div>
</footer>

</body>
</html>`;
}
