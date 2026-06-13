import type { AlbumVariante } from '@meualbum/shared';

export interface VariantStyle {
  background: string;
  border: string;
  shadow: string;
  /** Borda quando o card está selecionado (ex.: seletor de variante no cadastro) */
  selectedBorder: string;
  /** Sombra quando o card está selecionado */
  selectedShadow: string;
  tagBg: string;
  tagText: string;
  text: string;
}

export const VARIANT_STYLES: Record<AlbumVariante, VariantStyle> = {
  BROCHURA: {
    background: '#ffffff',
    border: '1.5px solid #0A0907',
    shadow: 'none',
    selectedBorder: '2px solid #0A0907',
    selectedShadow: '3px 3px 0 #0A0907',
    tagBg: '#E0DDD5',
    tagText: '#0A0907',
    text: '#0A0907',
  },
  CAPA_DURA: {
    background: '#F5F0E4',
    border: '2px solid #0A0907',
    shadow: '3px 3px 0 #C8C4BC',
    selectedBorder: '2px solid #0A0907',
    selectedShadow: '3px 3px 0 #C8C4BC',
    tagBg: '#C8C4BC',
    tagText: '#0A0907',
    text: '#0A0907',
  },
  CAPA_DURA_PRATA: {
    // Gradiente conforme design handoff (cadastro-album.jsx / home-wf.jsx)
    background: 'repeating-linear-gradient(135deg, #F0EDE4 0px, #F0EDE4 6px, #E0DDD5 6px, #E0DDD5 8px)',
    border: '2px solid #0A0907',
    shadow: '3px 3px 0 #9E9E9E',
    selectedBorder: '2px solid #9E9E9E',
    selectedShadow: '3px 3px 0 #9E9E9E',
    tagBg: '#9E9E9E',
    tagText: '#ffffff',
    text: '#0A0907',
  },
  CAPA_DURA_OURO: {
    background: '#FEF3CC',
    border: '2px solid #8B6914',
    shadow: '3px 3px 0 #C49A1A',
    selectedBorder: '2px solid #8B6914',
    selectedShadow: '3px 3px 0 #C49A1A',
    tagBg: '#C49A1A',
    tagText: '#ffffff',
    text: '#0A0907',
  },
  BOX_PREMIUM: {
    background: '#0A0907',
    border: '2px solid #0A0907',
    shadow: '4px 4px 0 #E5142A',
    selectedBorder: '2px solid #E5142A',
    selectedShadow: '4px 4px 0 #E5142A',
    tagBg: '#E5142A',
    tagText: '#ffffff',
    text: '#ffffff',
  },
};

export const VARIANT_LABELS: Record<AlbumVariante, string> = {
  BROCHURA: 'Brochura',
  CAPA_DURA: 'Capa Dura',
  CAPA_DURA_PRATA: 'Capa Dura Prata',
  CAPA_DURA_OURO: 'Capa Dura Ouro',
  BOX_PREMIUM: 'Box Premium',
};
