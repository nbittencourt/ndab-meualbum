import { describe, it, expect } from 'vitest';
import { VARIANT_STYLES, VARIANT_LABELS } from '../lib/albumVariant';
import type { AlbumVariante } from '@meualbum/shared';

const ALL_VARIANTS: AlbumVariante[] = [
  'BROCHURA',
  'CAPA_DURA',
  'CAPA_DURA_PRATA',
  'CAPA_DURA_OURO',
  'BOX_PREMIUM',
];

describe('VARIANT_STYLES', () => {
  it('cobre todas as variantes', () => {
    for (const v of ALL_VARIANTS) {
      expect(VARIANT_STYLES[v], `VARIANT_STYLES["${v}"] ausente`).toBeDefined();
    }
  });

  it('cada variante tem todas as propriedades de estilo obrigatórias', () => {
    const requiredKeys: (keyof typeof VARIANT_STYLES['BROCHURA'])[] = [
      'background',
      'border',
      'shadow',
      'selectedBorder',
      'selectedShadow',
      'tagBg',
      'tagText',
      'text',
    ];
    for (const v of ALL_VARIANTS) {
      for (const key of requiredKeys) {
        expect(
          typeof VARIANT_STYLES[v][key],
          `VARIANT_STYLES["${v}"].${key} deve ser string`,
        ).toBe('string');
      }
    }
  });

  it('BOX_PREMIUM tem fundo escuro (contraste invertido)', () => {
    expect(VARIANT_STYLES['BOX_PREMIUM'].background).toBe('#0A0907');
    expect(VARIANT_STYLES['BOX_PREMIUM'].text).toBe('#ffffff');
  });
});

describe('VARIANT_LABELS', () => {
  it('cobre todas as variantes', () => {
    for (const v of ALL_VARIANTS) {
      expect(VARIANT_LABELS[v], `VARIANT_LABELS["${v}"] ausente`).toBeDefined();
    }
  });

  it('todos os labels são strings não-vazias', () => {
    for (const v of ALL_VARIANTS) {
      expect(typeof VARIANT_LABELS[v]).toBe('string');
      expect(VARIANT_LABELS[v].length).toBeGreaterThan(0);
    }
  });

  it('labels corretos para cada variante', () => {
    expect(VARIANT_LABELS['BROCHURA']).toBe('Brochura');
    expect(VARIANT_LABELS['CAPA_DURA']).toBe('Capa Dura');
    expect(VARIANT_LABELS['CAPA_DURA_PRATA']).toBe('Capa Dura Prata');
    expect(VARIANT_LABELS['CAPA_DURA_OURO']).toBe('Capa Dura Ouro');
    expect(VARIANT_LABELS['BOX_PREMIUM']).toBe('Box Premium');
  });
});
