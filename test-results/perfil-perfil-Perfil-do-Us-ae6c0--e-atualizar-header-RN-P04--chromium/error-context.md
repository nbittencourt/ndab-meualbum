# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: perfil\perfil.spec.ts >> Perfil do Usuário >> Alteração de nome >> deve salvar novo nome com sucesso e atualizar header (RN-P04)
- Location: tests\perfil\perfil.spec.ts:51:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Nome Alterado')
Expected: visible
Error: strict mode violation: getByText('Nome Alterado') resolved to 2 elements:
    1) <div>Nome Alterado</div> aka locator('header').getByText('Nome Alterado')
    2) <p class="font-body text-sm text-ink">Nome Alterado</p> aka getByRole('paragraph').filter({ hasText: 'Nome Alterado' })

Call log:
  - Expect "toBeVisible" with timeout 3000ms
  - waiting for getByText('Nome Alterado')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Pular para o conteúdo" [ref=e3] [cursor=pointer]:
    - /url: "#main"
  - generic [ref=e5]:
    - main [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]:
          - button "Abrir menu de navegação" [ref=e10] [cursor=pointer]:
            - generic [ref=e11]: MA
            - generic [ref=e12]: Meu Album
          - generic [ref=e13]:
            - generic [ref=e14]:
              - generic [ref=e15]: Nome Alterado
              - generic [ref=e16]: "#27IIUP"
            - button "Sair" [ref=e17] [cursor=pointer]:
              - img [ref=e18]
        - generic [ref=e20]:
          - heading "Perfil" [level=1] [ref=e21]
          - generic [ref=e22]:
            - heading "Identificador" [level=2] [ref=e23]
            - paragraph [ref=e24]: Seu código único para trocas e suporte. Não compartilhe com desconhecidos.
            - generic [ref=e26]:
              - 'generic "Identificador: 2 7 I I U P" [ref=e27]': 27IIUP
              - button "Copiar identificador" [ref=e28]:
                - img [ref=e29]
          - generic [ref=e33]:
            - heading "Nome" [level=2] [ref=e34]
            - generic [ref=e35]:
              - paragraph [ref=e36]: Nome Alterado
              - button "Editar" [ref=e37] [cursor=pointer]
          - generic [ref=e38]:
            - heading "Email" [level=2] [ref=e39]
            - paragraph [ref=e40]: teste+1780587520101_0e1sxa@exemplo.com
            - button "Alterar email" [ref=e41] [cursor=pointer]
          - generic [ref=e42]:
            - heading "Senha" [level=2] [ref=e43]
            - generic [ref=e44]:
              - generic [ref=e45]:
                - generic [ref=e46]:
                  - generic [ref=e47]: Senha atual
                  - generic [ref=e48]: "*"
                - generic [ref=e49]:
                  - textbox "Senha atual" [ref=e50]
                  - button "Mostrar senha" [ref=e52]:
                    - img [ref=e53]
              - generic [ref=e57]:
                - generic [ref=e58]:
                  - generic [ref=e59]: Nova senha
                  - generic [ref=e60]: "*"
                - generic [ref=e61]:
                  - textbox "Nova senha" [ref=e62]
                  - button "Mostrar senha" [ref=e64]:
                    - img [ref=e65]
              - generic [ref=e68]:
                - generic [ref=e69]:
                  - generic [ref=e70]: Confirmar nova senha
                  - generic [ref=e71]: "*"
                - generic [ref=e72]:
                  - textbox "Confirmar nova senha" [ref=e73]
                  - button "Mostrar senha" [ref=e75]:
                    - img [ref=e76]
              - button "Alterar senha" [disabled] [ref=e79]
          - generic [ref=e80]:
            - heading "Privacidade e Dados" [level=2] [ref=e81]
            - generic [ref=e82]:
              - generic [ref=e83]:
                - paragraph [ref=e84]: Exporte todos os seus dados em formato ZIP (LGPD, Art. 18).
                - button "Exportar meus dados" [ref=e85] [cursor=pointer]
              - generic [ref=e86]:
                - link "Política de Privacidade" [ref=e87] [cursor=pointer]:
                  - /url: /privacidade
                - link "Exercer direitos de privacidade" [ref=e88] [cursor=pointer]:
                  - /url: /privacidade#direitos
                - button "Gerenciar cookies" [ref=e89]
          - generic [ref=e90]:
            - heading "Excluir conta" [level=2] [ref=e91]
            - paragraph [ref=e92]: A exclusão é permanente. Todos os seus dados serão removidos imediatamente e não poderão ser recuperados.
            - button "Excluir minha conta" [ref=e93] [cursor=pointer]
          - status [ref=e94]: Nome salvo com sucesso.
    - contentinfo [ref=e95]:
      - navigation "Links de rodapé" [ref=e96]:
        - link "Política de Privacidade (abre em nova aba)" [ref=e97] [cursor=pointer]:
          - /url: /politica-de-privacidade
          - text: Política de Privacidade
          - generic [ref=e98]: (abre em nova aba)
        - link "Gerenciar cookies" [ref=e99] [cursor=pointer]:
          - /url: /perfil#cookies
```

# Test source

```ts
  1   | import { test, expect } from '../support/fixtures';
  2   | import { usuarioAtivo, criarUsuario } from '../support/helpers';
  3   | 
  4   | test.describe('Perfil do Usuário', () => {
  5   | 
  6   |   // ── Identificador ────────────────────────────────────────────────────────────
  7   | 
  8   |   test.describe('Identificador', () => {
  9   | 
  10  |     test('deve exibir identificador de 6 chars em modo somente leitura (RN-P02)', async ({ page, request }) => {
  11  |       const { identificador } = await usuarioAtivo(page, request);
  12  |       await page.goto('/perfil');
  13  |       await expect(page.getByText(identificador)).toBeVisible();
  14  |     });
  15  | 
  16  |     test('deve copiar identificador e exibir confirmação temporária "Copiado!" (RN-P03)', async ({ page, request }) => {
  17  |       await usuarioAtivo(page, request);
  18  |       await page.goto('/perfil');
  19  |       await page.getByRole('button', { name: /copiar/i }).click();
  20  |       await expect(page.getByText('Copiado!', { exact: true })).toBeVisible();
  21  |       await expect(page.getByText('Copiado!', { exact: true })).not.toBeVisible({ timeout: 5000 });
  22  |     });
  23  |   });
  24  | 
  25  |   // ── Nome ──────────────────────────────────────────────────────────────────────
  26  | 
  27  |   test.describe('Alteração de nome', () => {
  28  | 
  29  |     test('deve pré-preencher campo com nome atual ao entrar em edição', async ({ page, request }) => {
  30  |       const dados = await usuarioAtivo(page, request);
  31  |       await page.goto('/perfil');
  32  |       await page.getByRole('button', { name: /editar/i }).click();
  33  |       await expect(page.getByLabel('Nome completo')).toHaveValue(dados.name as string);
  34  |     });
  35  | 
  36  |     test('deve manter "Salvar" desabilitado quando nome não foi alterado (RN-P05)', async ({ page, request }) => {
  37  |       await usuarioAtivo(page, request);
  38  |       await page.goto('/perfil');
  39  |       await page.getByRole('button', { name: /editar/i }).click();
  40  |       await expect(page.getByTestId('salvar-nome')).toBeDisabled();
  41  |     });
  42  | 
  43  |     test('deve manter "Salvar" desabilitado quando campo está vazio (RN-P05)', async ({ page, request }) => {
  44  |       await usuarioAtivo(page, request);
  45  |       await page.goto('/perfil');
  46  |       await page.getByRole('button', { name: /editar/i }).click();
  47  |       await page.getByLabel('Nome completo').clear();
  48  |       await expect(page.getByTestId('salvar-nome')).toBeDisabled();
  49  |     });
  50  | 
  51  |     test('deve salvar novo nome com sucesso e atualizar header (RN-P04)', async ({ page, request }) => {
  52  |       await usuarioAtivo(page, request);
  53  |       await page.goto('/perfil');
  54  |       await page.getByRole('button', { name: /editar/i }).click();
  55  |       await page.getByLabel('Nome completo').fill('Nome Alterado');
  56  |       await page.getByTestId('salvar-nome').click();
  57  |       await expect(page.getByText(/salvo|sucesso/i)).toBeVisible();
> 58  |       await expect(page.getByText('Nome Alterado')).toBeVisible();
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  59  |     });
  60  | 
  61  |     test('deve rejeitar nome com mais de 100 caracteres (RN-P04)', async ({ page, request }) => {
  62  |       await usuarioAtivo(page, request);
  63  |       await page.goto('/perfil');
  64  |       await page.getByRole('button', { name: /editar/i }).click();
  65  |       await page.getByLabel('Nome completo').fill('A'.repeat(101));
  66  |       await page.getByTestId('salvar-nome').click();
  67  |       await expect(page.getByText(/máximo de 100|limite de 100|muito longo/i)).toBeVisible();
  68  |     });
  69  |   });
  70  | 
  71  |   // ── Email ─────────────────────────────────────────────────────────────────────
  72  | 
  73  |   test.describe('Alteração de email', () => {
  74  | 
  75  |     test('deve iniciar alteração e exibir aviso de EMAIL_PENDENTE', async ({ page, request }) => {
  76  |       await usuarioAtivo(page, request);
  77  |       await page.goto('/perfil');
  78  |       await page.getByRole('button', { name: /alterar email/i }).click();
  79  |       await page.getByLabel('Novo email').fill(`novo+${Date.now()}@exemplo.com`);
  80  |       await page.getByTestId('salvar-email').click();
  81  |       await expect(page.getByText(/pendente|aguardando confirmação/i)).toBeVisible();
  82  |     });
  83  | 
  84  |     test('deve bloquear nova solicitação durante cooldown de 5 min (RN-P12)', async ({ page, request }) => {
  85  |       await usuarioAtivo(page, request);
  86  |       await page.goto('/perfil');
  87  | 
  88  |       await page.getByRole('button', { name: /alterar email/i }).click();
  89  |       await page.getByLabel('Novo email').fill(`novo1+${Date.now()}@exemplo.com`);
  90  |       await page.getByTestId('salvar-email').click();
  91  |       await expect(page.getByText(/aguardando confirmação/i)).toBeVisible();
  92  | 
  93  |       // Após submit bem-sucedido o form fecha; reabrir para segunda tentativa
  94  |       await page.getByRole('button', { name: /alterar email/i }).click();
  95  |       await page.getByLabel('Novo email').fill(`novo2+${Date.now()}@exemplo.com`);
  96  |       await page.getByTestId('salvar-email').click();
  97  | 
  98  |       await expect(page.getByText(/aguarde/i)).toBeVisible();
  99  |     });
  100 | 
  101 |     test('deve rejeitar email já em uso por outro usuário (RN-P07)', async ({ page, request }) => {
  102 |       const { dados: outro } = await criarUsuario(request);
  103 |       await usuarioAtivo(page, request);
  104 |       await page.goto('/perfil');
  105 |       await page.getByRole('button', { name: /alterar email/i }).click();
  106 |       await page.getByLabel('Novo email').fill(outro.email as string);
  107 |       await page.getByTestId('salvar-email').click();
  108 |       await expect(page.getByText(/já está em uso/i)).toBeVisible();
  109 |     });
  110 | 
  111 |     test('deve rejeitar email igual ao email_pendente já em espera (RN-P40)', async ({ page, request }) => {
  112 |       await usuarioAtivo(page, request);
  113 |       await page.goto('/perfil');
  114 |       const emailNovo = `mesmo+${Date.now()}@exemplo.com`;
  115 |       await page.getByRole('button', { name: /alterar email/i }).click();
  116 |       await page.getByLabel('Novo email').fill(emailNovo);
  117 |       await page.getByTestId('salvar-email').click();
  118 | 
  119 |       await page.goto('/perfil');
  120 |       await page.getByRole('button', { name: /alterar email/i }).click();
  121 |       await page.getByLabel('Novo email').fill(emailNovo);
  122 |       await page.getByTestId('salvar-email').click();
  123 |       await expect(page.getByText(/já em espera|mesmo email pendente|aguarde/i)).toBeVisible();
  124 |     });
  125 | 
  126 |     test('deve cancelar alteração e retornar status ATIVO (RN-P14)', async ({ page, request }) => {
  127 |       await usuarioAtivo(page, request);
  128 |       await page.goto('/perfil');
  129 |       await page.getByRole('button', { name: /alterar email/i }).click();
  130 |       await page.getByLabel('Novo email').fill(`novo+${Date.now()}@exemplo.com`);
  131 |       await page.getByTestId('salvar-email').click();
  132 |       await page.getByRole('button', { name: /cancelar alteração/i }).click();
  133 |       await expect(page.getByText(/pendente|aguardando confirmação/i)).not.toBeVisible();
  134 |     });
  135 |   });
  136 | 
  137 |   // ── Senha ─────────────────────────────────────────────────────────────────────
  138 | 
  139 |   test.describe('Alteração de senha', () => {
  140 | 
  141 |     test('deve manter "Alterar senha" desabilitado até checklist completo (RN-P21)', async ({ page, request }) => {
  142 |       await usuarioAtivo(page, request);
  143 |       await page.goto('/perfil');
  144 |       await expect(page.getByRole('button', { name: /alterar senha/i })).toBeDisabled();
  145 |     });
  146 | 
  147 |     test('deve exibir erro inline para senha atual incorreta (RN-P19)', async ({ page, request }) => {
  148 |       await usuarioAtivo(page, request);
  149 |       await page.goto('/perfil');
  150 |       await page.getByLabel('Senha atual').fill('SenhaErrada@1');
  151 |       await page.getByLabel('Nova senha', { exact: true }).fill('NovaSenha@123');
  152 |       await page.getByLabel('Confirmar nova senha', { exact: true }).fill('NovaSenha@123');
  153 |       await page.getByRole('button', { name: /alterar senha/i }).click();
  154 |       await expect(page.getByText(/senha atual incorreta|senha atual inválida/i)).toBeVisible();
  155 |     });
  156 | 
  157 |     test('deve alterar senha mantendo sessão corrente ativa (RN-P22a)', async ({ page, request }) => {
  158 |       const dados = await usuarioAtivo(page, request);
```