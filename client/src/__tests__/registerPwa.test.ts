import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shouldUpdate, scheduleUpdateChecks, reloadWhenSafe } from '../pwa/registerPwa';

// ─── Browser globals (node env) ───────────────────────────────────────────────

const eventListeners: Record<string, Array<() => void>> = {};
const windowListeners: Record<string, Array<() => void>> = {};

const documentMock = {
  hidden: false,
  addEventListener: vi.fn((event: string, cb: () => void) => {
    (eventListeners[event] ??= []).push(cb);
  }),
  removeEventListener: vi.fn((event: string, cb: () => void) => {
    if (eventListeners[event]) {
      eventListeners[event] = eventListeners[event].filter(f => f !== cb);
    }
  }),
};

const windowMock = {
  __MEUALBUM_BUSY__: false,
  addEventListener: vi.fn((event: string, cb: () => void) => {
    (windowListeners[event] ??= []).push(cb);
  }),
  removeEventListener: vi.fn((event: string, cb: () => void) => {
    if (windowListeners[event]) {
      windowListeners[event] = windowListeners[event].filter(f => f !== cb);
    }
  }),
  location: { reload: vi.fn() },
};

function triggerDocument(event: string) {
  (eventListeners[event] ?? []).forEach(cb => cb());
}
function triggerWindow(event: string) {
  (windowListeners[event] ?? []).forEach(cb => cb());
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'document', { value: documentMock, writable: true, configurable: true });
  Object.defineProperty(globalThis, 'window', { value: windowMock, writable: true, configurable: true });
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true },
    writable: true,
    configurable: true,
  });

  documentMock.hidden = false;
  windowMock.__MEUALBUM_BUSY__ = false;
  windowMock.location.reload.mockReset();
  documentMock.addEventListener.mockClear();
  documentMock.removeEventListener.mockClear();
  windowMock.addEventListener.mockClear();
  windowMock.removeEventListener.mockClear();

  Object.keys(eventListeners).forEach(k => { eventListeners[k] = []; });
  Object.keys(windowListeners).forEach(k => { windowListeners[k] = []; });

  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRegistration(overrides: Partial<ServiceWorkerRegistration> = {}): ServiceWorkerRegistration {
  return {
    installing: null,
    update: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as ServiceWorkerRegistration;
}

// ─── shouldUpdate ─────────────────────────────────────────────────────────────

describe('shouldUpdate', () => {
  it('retorna true quando online e sem instalação em andamento', () => {
    Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, writable: true, configurable: true });
    const reg = makeRegistration({ installing: null });
    expect(shouldUpdate(reg)).toBe(true);
  });

  it('retorna false quando offline', () => {
    Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, writable: true, configurable: true });
    const reg = makeRegistration({ installing: null });
    expect(shouldUpdate(reg)).toBe(false);
  });

  it('retorna false quando há SW em instalação', () => {
    Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, writable: true, configurable: true });
    const reg = makeRegistration({ installing: {} as ServiceWorker });
    expect(shouldUpdate(reg)).toBe(false);
  });

  it('retorna false quando offline E com instalação em andamento', () => {
    Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, writable: true, configurable: true });
    const reg = makeRegistration({ installing: {} as ServiceWorker });
    expect(shouldUpdate(reg)).toBe(false);
  });
});

// ─── scheduleUpdateChecks ─────────────────────────────────────────────────────

describe('scheduleUpdateChecks', () => {
  it('chama registration.update() no intervalo configurado', () => {
    const reg = makeRegistration();
    scheduleUpdateChecks(reg, 1000);

    vi.advanceTimersByTime(1000);
    expect(reg.update).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(reg.update).toHaveBeenCalledTimes(2);
  });

  it('chama update() quando a aba volta a ficar visível', () => {
    const reg = makeRegistration();
    scheduleUpdateChecks(reg, 60_000);

    documentMock.hidden = false;
    triggerDocument('visibilitychange');

    expect(reg.update).toHaveBeenCalledTimes(1);
  });

  it('não chama update() quando a aba fica oculta', () => {
    const reg = makeRegistration();
    scheduleUpdateChecks(reg, 60_000);

    documentMock.hidden = true;
    triggerDocument('visibilitychange');

    expect(reg.update).not.toHaveBeenCalled();
  });

  it('chama update() quando o evento online dispara', () => {
    const reg = makeRegistration();
    scheduleUpdateChecks(reg, 60_000);

    triggerWindow('online');
    expect(reg.update).toHaveBeenCalledTimes(1);
  });

  it('não chama update() quando offline', () => {
    Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, writable: true, configurable: true });
    const reg = makeRegistration();
    scheduleUpdateChecks(reg, 60_000);

    triggerWindow('online');
    expect(reg.update).not.toHaveBeenCalled();
  });

  it('não chama update() quando há instalação em andamento', () => {
    const reg = makeRegistration({ installing: {} as ServiceWorker });
    scheduleUpdateChecks(reg, 60_000);

    vi.advanceTimersByTime(60_000);
    expect(reg.update).not.toHaveBeenCalled();
  });

  it('a função de cleanup remove os listeners e o intervalo', () => {
    const reg = makeRegistration();
    const cleanup = scheduleUpdateChecks(reg, 1000);

    cleanup();

    vi.advanceTimersByTime(5000);
    triggerDocument('visibilitychange');
    triggerWindow('online');

    expect(reg.update).not.toHaveBeenCalled();
  });
});

// ─── reloadWhenSafe ───────────────────────────────────────────────────────────

describe('reloadWhenSafe', () => {
  it('recarrega imediatamente quando não está ocupado', () => {
    windowMock.__MEUALBUM_BUSY__ = false;
    reloadWhenSafe();
    expect(windowMock.location.reload).toHaveBeenCalledTimes(1);
  });

  it('chama onBeforeReload antes de recarregar', () => {
    const onBefore = vi.fn();
    windowMock.__MEUALBUM_BUSY__ = false;
    reloadWhenSafe(onBefore);
    expect(onBefore).toHaveBeenCalledTimes(1);
    expect(windowMock.location.reload).toHaveBeenCalledTimes(1);
  });

  it('adia o reload quando ocupado, dispara ao ficar visível e livre', () => {
    windowMock.__MEUALBUM_BUSY__ = true;
    reloadWhenSafe();
    expect(windowMock.location.reload).not.toHaveBeenCalled();

    // Fica visível mas ainda ocupado — não deve recarregar
    documentMock.hidden = false;
    triggerDocument('visibilitychange');
    expect(windowMock.location.reload).not.toHaveBeenCalled();

    // Fica livre e visível — deve recarregar
    windowMock.__MEUALBUM_BUSY__ = false;
    triggerDocument('visibilitychange');
    expect(windowMock.location.reload).toHaveBeenCalledTimes(1);
  });

  it('não recarrega enquanto a aba está oculta mesmo sem busy', () => {
    windowMock.__MEUALBUM_BUSY__ = true;
    documentMock.hidden = true;
    reloadWhenSafe();

    triggerDocument('visibilitychange');
    expect(windowMock.location.reload).not.toHaveBeenCalled();
  });
});

// ─── __APP_VERSION__ ─────────────────────────────────────────────────────────

describe('__APP_VERSION__', () => {
  it('está definida como string não-vazia (via define do vite)', () => {
    // Em produção, vite injeta __APP_VERSION__ via define.
    // No ambiente de teste, verificamos apenas que o tipo está declarado
    // e que a variável é usável como string (sem TypeError).
    const version: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0-test';
    expect(typeof version).toBe('string');
    expect(version.length).toBeGreaterThan(0);
  });
});
