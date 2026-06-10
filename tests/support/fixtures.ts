import { test as base, expect } from '@playwright/test';

// Extends the base test to suppress the cookie banner by default.
// All test files should import { test, expect } from this module.
// Exception: tests in tests/privacy/cookie-banner.spec.ts use @playwright/test
// directly to exercise banner appearance and choice persistence.
const COOKIE_CONSENT_KEY = 'cookie-consent-data';
const CURRENT_POLICY_VERSION = '1.1'; // must match client/src/lib/cookieConsent.ts

const test = base.extend<object>({
  page: async ({ page }, use) => {
    await page.addInitScript((args: { key: string; version: string }) => {
      const now = new Date();
      const expira = new Date(now);
      expira.setFullYear(expira.getFullYear() + 1);
      const consent = {
        analytics: true,
        publicidade: true,
        versao_politica: args.version,
        concedido_em: now.toISOString(),
        expira_em: expira.toISOString(),
      };
      localStorage.setItem(args.key, JSON.stringify(consent));
    }, { key: COOKIE_CONSENT_KEY, version: CURRENT_POLICY_VERSION });
    await use(page);
  },
});

export { test, expect };
