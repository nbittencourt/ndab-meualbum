import { test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// albumId é lido no beforeAll (após o globalSetup ter escrito o arquivo)
let albumId = '';

test.beforeAll(() => {
  const statePath = path.join(process.cwd(), 'test-explore', '.setup-state.json');
  const state = JSON.parse(readFileSync(statePath, 'utf-8'));
  albumId = state._explore.albumId;
});

const PUBLIC_STATE = {
  cookies: [] as never[],
  origins: [
    {
      origin: 'http://localhost:5173',
      localStorage: [{ name: 'cookie-consent', value: '1' }],
    },
  ],
};

async function withConsoleCapture(
  page: import('@playwright/test').Page,
  fn: () => Promise<void>
) {
  const errors: string[] = [];
  const handler = (msg: import('@playwright/test').ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text());
  };
  page.on('console', handler);
  await fn();
  page.off('console', handler);
  if (errors.length) {
    test.info().annotations.push({ type: 'console-errors', description: errors.join('\n') });
  }
}

// ─────────────────────────────────────────────
// Páginas públicas — sem cookie de sessão
// ─────────────────────────────────────────────
test.describe('Público', () => {
  test.use({ storageState: PUBLIC_STATE });

  test('landing /', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });
  });

  test('cadastro /register', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
    });
  });

  test('recuperar senha /forgot-password', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto('/forgot-password');
      await page.waitForLoadState('networkidle');
    });
  });
});

// ─────────────────────────────────────────────
// Páginas autenticadas — usa storageState do config
// ─────────────────────────────────────────────
test.describe('Autenticado', () => {

  test('home /home', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');
    });
  });

  test('álbuns /albums', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto('/albums');
      await page.waitForLoadState('networkidle');
    });
  });

  test('novo álbum /albums/novo', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto('/albums/novo');
      await page.waitForLoadState('networkidle');
    });
  });

  test('gerenciar álbum /albums/:id', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto(`/albums/${albumId}`);
      await page.waitForLoadState('networkidle');
    });
  });

  test('visualizar álbum /albums/:id/visualizar', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto(`/albums/${albumId}/visualizar`);
      await page.waitForLoadState('networkidle');
    });
  });

  test('abrir pacotinhos /abrir', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto('/abrir');
      await page.waitForLoadState('networkidle');
    });
  });

  test('colar figurinhas /colar', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto('/colar');
      await page.waitForLoadState('networkidle');
    });
  });

  test('trocas /trocas', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto('/trocas');
      await page.waitForLoadState('networkidle');
    });
  });

  test('perfil /perfil', async ({ page }) => {
    await withConsoleCapture(page, async () => {
      await page.goto('/perfil');
      await page.waitForLoadState('networkidle');
    });
  });
});

// ─────────────────────────────────────────────
// Breakpoint abaixo de xl — apenas desktop
// ─────────────────────────────────────────────
test.describe('Breakpoint @1279px', () => {
  test.use({ viewport: { width: 1279, height: 900 } });

  test('home abaixo de xl /home @1279px', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Executado apenas no projeto desktop');
    await withConsoleCapture(page, async () => {
      await page.goto('/home');
      await page.waitForLoadState('networkidle');
    });
  });
});
