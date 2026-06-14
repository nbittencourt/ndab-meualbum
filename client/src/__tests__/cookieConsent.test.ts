import { describe, it, expect, beforeEach } from 'vitest';
import {
  getConsent,
  hasValidConsent,
  saveConsent,
  CURRENT_POLICY_VERSION,
  type ConsentimentoCookie,
} from '../lib/cookieConsent';

const STORAGE_KEY = 'cookie-consent-data';

const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => { localStorageStore[key] = value; },
  removeItem: (key: string) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); },
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => {
  localStorageMock.clear();
});

// ─── getConsent ────────────────────────────────────────────────────────────────

describe('getConsent', () => {
  it('retorna null quando localStorage está vazio', () => {
    expect(getConsent()).toBeNull();
  });

  it('retorna null quando o valor não é JSON válido', () => {
    localStorageMock.setItem(STORAGE_KEY, 'não-é-json');
    expect(getConsent()).toBeNull();
  });

  it('retorna null quando analytics não é boolean', () => {
    const invalid = { analytics: 'yes', publicidade: true, versao_politica: '1.1', concedido_em: '', expira_em: '' };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(invalid));
    expect(getConsent()).toBeNull();
  });

  it('retorna null quando publicidade não é boolean', () => {
    const invalid = { analytics: true, publicidade: 1, versao_politica: '1.1', concedido_em: '', expira_em: '' };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(invalid));
    expect(getConsent()).toBeNull();
  });

  it('retorna o objeto quando o JSON é estruturalmente válido', () => {
    const consent: ConsentimentoCookie = {
      analytics: true,
      publicidade: false,
      versao_politica: '1.1',
      concedido_em: new Date().toISOString(),
      expira_em: new Date(Date.now() + 1000).toISOString(),
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(consent));
    expect(getConsent()).toEqual(consent);
  });
});

// ─── hasValidConsent ──────────────────────────────────────────────────────────

describe('hasValidConsent', () => {
  it('retorna false quando não há consentimento (RN-PR05)', () => {
    expect(hasValidConsent()).toBe(false);
  });

  it('retorna false quando o consentimento está expirado (RN-PR08)', () => {
    const expired: ConsentimentoCookie = {
      analytics: true,
      publicidade: true,
      versao_politica: CURRENT_POLICY_VERSION,
      concedido_em: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      expira_em: new Date(Date.now() - 1000).toISOString(),
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(expired));
    expect(hasValidConsent()).toBe(false);
  });

  it('retorna false quando a versão da política é anterior (RN-PR09)', () => {
    const oldVersion: ConsentimentoCookie = {
      analytics: true,
      publicidade: false,
      versao_politica: '1.0',
      concedido_em: new Date().toISOString(),
      expira_em: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(oldVersion));
    expect(hasValidConsent()).toBe(false);
  });

  it('retorna true quando o consentimento é válido, não expirado e na versão atual', () => {
    const valid: ConsentimentoCookie = {
      analytics: true,
      publicidade: false,
      versao_politica: CURRENT_POLICY_VERSION,
      concedido_em: new Date().toISOString(),
      expira_em: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(valid));
    expect(hasValidConsent()).toBe(true);
  });
});

// ─── saveConsent ──────────────────────────────────────────────────────────────

describe('saveConsent', () => {
  it('persiste o consentimento no localStorage', () => {
    saveConsent(true, false);
    expect(localStorageMock.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('define expiração em aproximadamente 12 meses (RN-PR08)', () => {
    const before = Date.now();
    saveConsent(true, true);
    const after = Date.now();

    const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!) as ConsentimentoCookie;
    const expira = new Date(stored.expira_em).getTime();

    const twelveMonthsMs = 365 * 24 * 60 * 60 * 1000;
    expect(expira).toBeGreaterThanOrEqual(before + twelveMonthsMs - 1000);
    expect(expira).toBeLessThanOrEqual(after + twelveMonthsMs + 1000);
  });

  it('grava a versão atual da política', () => {
    saveConsent(false, false);
    const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!) as ConsentimentoCookie;
    expect(stored.versao_politica).toBe(CURRENT_POLICY_VERSION);
  });

  it('grava os valores de analytics e publicidade informados', () => {
    saveConsent(false, false);
    const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!) as ConsentimentoCookie;
    expect(stored.analytics).toBe(false);
    expect(stored.publicidade).toBe(false);
  });

  it('"Aceitar" → analytics=true, publicidade=true (RN-PR06/RN-PR07)', () => {
    saveConsent(true, true);
    const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!) as ConsentimentoCookie;
    expect(stored.analytics).toBe(true);
    expect(stored.publicidade).toBe(true);
  });

  it('"Remover não essenciais" → analytics=false, publicidade=false', () => {
    saveConsent(false, false);
    const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY)!) as ConsentimentoCookie;
    expect(stored.analytics).toBe(false);
    expect(stored.publicidade).toBe(false);
  });

  it('retorna o objeto de consentimento salvo', () => {
    const result = saveConsent(true, false);
    expect(result.analytics).toBe(true);
    expect(result.publicidade).toBe(false);
    expect(result.versao_politica).toBe(CURRENT_POLICY_VERSION);
  });
});
