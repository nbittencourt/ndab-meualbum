import { registerSW } from 'virtual:pwa-register';

declare global {
  interface Window {
    __MEUALBUM_BUSY__: boolean;
  }
}

const UPDATE_INTERVAL_MS = 60 * 60 * 1000; // 60 min

/** Returns true only when it is safe and useful to trigger a SW update check. */
export function shouldUpdate(registration: ServiceWorkerRegistration): boolean {
  return navigator.onLine && registration.installing == null;
}

/**
 * Defers `window.location.reload()` until the app is not busy and the tab is
 * visible. Callers can pass `onBeforeReload` to show a notification first.
 *
 * Note: with autoUpdate mode, vite-plugin-pwa also listens to `controllerchange`
 * and calls `window.location.reload()` independently. The busy flag is
 * best-effort — it delays *our* handler, not the plugin's.
 */
export function reloadWhenSafe(onBeforeReload?: () => void): void {
  if (window.__MEUALBUM_BUSY__) {
    const retry = () => {
      if (!document.hidden && !window.__MEUALBUM_BUSY__) {
        document.removeEventListener('visibilitychange', retry);
        reloadWhenSafe(onBeforeReload);
      }
    };
    document.addEventListener('visibilitychange', retry);
    return;
  }
  onBeforeReload?.();
  window.location.reload();
}

/**
 * Schedules periodic SW update checks and wires up `visibilitychange` + `online`
 * events so long-lived sessions (open PWA tabs) pick up new deploys automatically.
 * Returns a cleanup function that removes all listeners and clears the interval.
 */
export function scheduleUpdateChecks(
  registration: ServiceWorkerRegistration,
  intervalMs = UPDATE_INTERVAL_MS,
): () => void {
  const check = () => {
    if (shouldUpdate(registration)) registration.update().catch(() => undefined);
  };

  const tid = setInterval(check, intervalMs);

  const onVisibility = () => { if (!document.hidden) check(); };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('online', check);

  return () => {
    clearInterval(tid);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('online', check);
  };
}

function showUpdatingToast(): void {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.style.cssText = [
    'position:fixed;bottom:80px;left:50%;transform:translateX(-50%)',
    'background:#d4a537;color:#0A0907;padding:12px 20px',
    'border:2px solid #0A0907;box-shadow:3px 3px 0 #0A0907',
    'font-size:14px;font-weight:600;z-index:9999',
    "font-family:'Geist',sans-serif",
  ].join(';');
  el.textContent = 'Atualizando para a nova versão…';
  document.body.appendChild(el);
}

/**
 * Initialises the PWA service worker with explicit registration and active
 * update checking for long-lived sessions (periodic interval + visibilitychange
 * + online). Call once, outside the React tree, from main.tsx.
 */
export function initPwa(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  // Register our controllerchange handler before registerSW so it fires first.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    reloadWhenSafe(showUpdatingToast);
  });

  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      scheduleUpdateChecks(registration);
    },
    onOfflineReady() {
      // SW is ready for offline — no notification needed here.
    },
  });
}
