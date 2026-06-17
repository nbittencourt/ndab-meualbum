# MeuAlbum — Copa do Mundo 2026

PWA mobile-first para controle de coleção de figurinhas da Copa do Mundo 2026. Marque as figurinhas que você tem, as que faltam e gerencie trocas com outros colecionadores.

## Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4
- **Backend**: Node.js + Express + TypeScript
- **Banco de dados**: MongoDB Atlas (dev) / Firestore (tst, prd)
- **Deploy**: Firebase Hosting (frontend) + Cloud Run (API)

## Setup local

```bash
# Pré-requisito: Node 22+, MongoDB local ou Atlas URI

# 1. Instalar dependências
npm install

# 2. Criar arquivo de variáveis de ambiente
cp .env.example .env   # ajuste MONGODB_URI e JWT_SECRET

# 3. Rodar frontend + backend simultaneamente
npm run dev
# frontend: http://localhost:5173
# backend:  http://localhost:3000
```

## Testes

```bash
# Vitest — unitários/integração (rápido, sem servidor)
npm test              # todos os workspaces
npm test -w client    # só client
npm test -w server    # só server

# Playwright — E2E (requer dev server parado)
npx kill-port 5173 3000
npm run test:e2e
```

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| [CLAUDE.md](CLAUDE.md) | Instruções para o agente de IA — stack, convenções, hierarquia de fontes de verdade |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Guia completo de deploy (Firebase + Cloud Run + Secret Manager) |
| [docs/spec_*.md](docs/) | Especificações funcionais por fluxo |
| [tests/TESTS.md](tests/TESTS.md) | Convenções e regras da suíte de testes |

## Licença

Projeto privado — todos os direitos reservados. Nenhum logo, marca ou ativo oficial da FIFA ou Panini é utilizado.
