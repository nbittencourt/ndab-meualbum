import type { AlbumVariante } from '@meualbum/shared';

export interface VariantStyle {
  background: string;
  border: string;
  shadow: string;
  tagBg: string;
  tagText: string;
  text: string;
}

export const VARIANT_STYLES: Record<AlbumVariante, VariantStyle> = {
  BROCHURA: {
    background: '#ffffff',
    border: '1.5px solid #0A0907',
    shadow: 'none',
    tagBg: '#E0DDD5',
    tagText: '#0A0907',
    text: '#0A0907',
  },
  CAPA_DURA: {
    background: '#F5F0E4',
    border: '2px solid #0A0907',
    shadow: '3px 3px 0 #C8C4BC',
    tagBg: '#C8C4BC',
    tagText: '#0A0907',
    text: '#0A0907',
  },
  CAPA_DURA_PRATA: {
    background: 'repeating-linear-gradient(-45deg, #F0EDE4 0px, #F0EDE4 8px, #E0DDD5 8px, #E0DDD5 16px)',
    border: '2px solid #0A0907',
    shadow: '3px 3px 0 #9E9E9E',
    tagBg: '#9E9E9E',
    tagText: '#ffffff',
    text: '#0A0907',
  },
  CAPA_DURA_OURO: {
    background: '#FEF3CC',
    border: '2px solid #8B6914',
    shadow: '3px 3px 0 #C49A1A',
    tagBg: '#C49A1A',
    tagText: '#ffffff',
    text: '#0A0907',
  },
  BOX_PREMIUM: {
    background: '#0A0907',
    border: '2px solid #0A0907',
    shadow: '4px 4px 0 #E5142A',
    tagBg: '#E5142A',
    tagText: '#ffffff',
    text: '#ffffff',
  },
};

export const VARIANT_LABELS: Record<AlbumVariante, string> = {
  BROCHURA: 'Brochura',
  CAPA_DURA: 'Capa dura',
  CAPA_DURA_PRATA: 'Capa dura prata',
  CAPA_DURA_OURO: 'Capa dura ouro',
  BOX_PREMIUM: 'Box premium',
};
