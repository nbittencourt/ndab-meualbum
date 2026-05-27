import { test as base, expect } from '@playwright/test';

// Extends the base test to suppress the cookie banner by default.
// All test files should import { test, expect } from this module.
// Exception: tests specifically checking L19 (cookie banner appearance) should
// use @playwright/test directly or manually clear localStorage.
const test = base.extend<object>({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookie-consent', '1');
    });
    await use(page);
  },
});

export { test, expect };
