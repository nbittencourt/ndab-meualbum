# Deploy — MeuAlbum (Firebase Hosting + Cloud Run)

## 1. Visão Geral da Infraestrutura

```
Browser
  └── Firebase Hosting (CDN global)
        ├── /assets/**  →  estáticos (long-lived cache)
        ├── /index.html →  SPA entry point (no-cache)
        └── /api/**     →  rewrite (proxy) → Cloud Run  ← same-origin, sem cross-origin

Cloud Run (meualbum-api, southamerica-east1)
  └── Express API → MongoDB Atlas (cluster ndab-meualbum)
                  → Resend (e-mail transacional)

GCP Secret Manager
  └── MONGODB_URI, JWT_SECRET, CLIENT_URL, RESEND_API_KEY
```

> **Por que rewrite e não chamada direta?** Safari no iOS (ITP) e navegadores com bloqueio de cookies third-party bloqueiam cookies cross-origin, mesmo com `SameSite=None; Secure`. Com o rewrite, o browser enxerga tudo como same-origin e os cookies funcionam em todos os navegadores.

**Dois ambientes:**

| Recurso | TST | PRD |
|---------|-----|-----|
| Firebase / GCP project | `ndab-meualbum-tst-497511` | `ndab-meualbum-prd` |
| Cloud Run service | `meualbum-api` | `meualbum-api` |
| Hosting URL | `ndab-meualbum-tst-497511.web.app` | `ndab-meualbum-prd.web.app` (ou domínio custom) |
| `CLIENT_URL` (secret) | `https://ndab-meualbum-tst-497511.web.app` | `https://meualbum.com.br` |
| `_API_URL` (Cloud Build) | URL do Cloud Run TST | URL do Cloud Run PRD |

> **PowerShell (Windows):** todos os comandos abaixo são para PowerShell e escritos em linha única. Cada bloco define variáveis `$VAR` no início — ajuste os valores antes de executar.

---

## 2. Pré-requisitos

### Ferramentas locais

```powershell
gcloud version
firebase --version
docker --version
node --version
```

Versões mínimas: gcloud >= 450, Firebase CLI >= 13, Node 22.

### Instalar Firebase CLI

```powershell
npm install -g firebase-tools
firebase login
```

### Instalar gcloud CLI

Siga as instruções em [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install).

```powershell
gcloud auth login
gcloud auth configure-docker southamerica-east1-docker.pkg.dev
```

---

## 3. Configuração Inicial (one-time setup)

> Execute estes passos uma única vez por projeto GCP/Firebase. Requer permissão de `Editor`.

### 3.1 Habilitar APIs GCP

```powershell
$PROJECT_ID = "ndab-meualbum-prd"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com firebase.googleapis.com --project=$PROJECT_ID
```

### 3.2 Criar e vincular projetos Firebase

```powershell
$TST_PROJECT = "ndab-meualbum-tst-497511"
$PRD_PROJECT = "ndab-meualbum-prd"
firebase projects:create $TST_PROJECT --display-name "MeuAlbum TST"
firebase projects:create $PRD_PROJECT --display-name "MeuAlbum PRD"
firebase use --add
```

O arquivo `.firebaserc` já está configurado no repositório com os aliases `tst` e `prd`.

### 3.3 Configurar Firebase Hosting

```powershell
$TST_PROJECT = "ndab-meualbum-tst-497511"
firebase init hosting --project $TST_PROJECT
```

Wizard: `public directory` → `client/dist` | `single-page app` → `Yes` | `GitHub Actions` → `No`.

O arquivo `firebase.json` já está no repositório — não é necessário recriá-lo.

### 3.4 Criar repositório no Artifact Registry

```powershell
$PROJECT_ID = "ndab-meualbum-prd"
gcloud artifacts repositories create meualbum --repository-format=docker --location=southamerica-east1 --description="Imagens Docker do MeuAlbum" --project=$PROJECT_ID
```

### 3.5 Permissões da conta de serviço do Cloud Build

```powershell
$PROJECT_ID = "ndab-meualbum-prd"
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
$CB_SA = "$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$CB_SA" --role="roles/run.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$CB_SA" --role="roles/secretmanager.secretAccessor"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$CB_SA" --role="roles/artifactregistry.writer"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$CB_SA" --role="roles/firebase.admin"
gcloud iam service-accounts add-iam-policy-binding "$PROJECT_NUMBER-compute@developer.gserviceaccount.com" --member="serviceAccount:$CB_SA" --role="roles/iam.serviceAccountUser"
```

---

## 4. Secrets no Secret Manager

Crie os secrets **antes** do primeiro deploy. O bloco abaixo usa `[System.IO.File]::WriteAllText` com `UTF8Encoding($false)` para gravar **sem BOM** — `Set-Content -Encoding utf8` no PowerShell 5.1 adiciona BOM ao arquivo, corrompendo o secret.

```powershell
$PROJECT_ID = "ndab-meualbum-prd"
$TMP = "$env:TEMP\gcloud_secret.tmp"
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

# 1. String de conexão MongoDB Atlas — substitua USER e SENHA
[System.IO.File]::WriteAllText($TMP, "mongodb+srv://USER:SENHA@ndab-meualbum.mongodb.net/meualbum", $utf8NoBom)
gcloud secrets create MONGODB_URI --data-file=$TMP --replication-policy=automatic --project=$PROJECT_ID

# 2. JWT secret gerado automaticamente (32 bytes aleatórios)
$bytes = New-Object byte[] 32; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[System.IO.File]::WriteAllText($TMP, ([Convert]::ToBase64String($bytes)), $utf8NoBom)
gcloud secrets create JWT_SECRET --data-file=$TMP --replication-policy=automatic --project=$PROJECT_ID

# 3. URL do frontend Firebase Hosting — usada para CORS e links de e-mail
[System.IO.File]::WriteAllText($TMP, "https://ndab-meualbum-tst-497511.web.app", $utf8NoBom)
gcloud secrets create CLIENT_URL --data-file=$TMP --replication-policy=automatic --project=$PROJECT_ID

# 4. Chave Resend (obter em resend.com)
[System.IO.File]::WriteAllText($TMP, "re_XXXXXXXXXXXXXXXXXX", $utf8NoBom)
gcloud secrets create RESEND_API_KEY --data-file=$TMP --replication-policy=automatic --project=$PROJECT_ID

Remove-Item $TMP
```

> **`CLIENT_URL`** deve ser a URL exata do Firebase Hosting, sem barra final. É usada pelo Express para configurar o CORS e para gerar links nos e-mails de confirmação.

### Rotação de secrets

```powershell
$PROJECT_ID = "ndab-meualbum-prd"
$TMP = "$env:TEMP\gcloud_secret.tmp"
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($TMP, "NOVO_VALOR", $utf8NoBom)
gcloud secrets versions add NOME_SECRET --data-file=$TMP --project=$PROJECT_ID
Remove-Item $TMP
gcloud secrets versions disable NUMERO_VERSAO --secret=NOME_SECRET --project=$PROJECT_ID
```

---

## 5. Configuração de Ambientes (TST / PRD)

O arquivo `.firebaserc` (na raiz do projeto) define os aliases:

```json
{
  "projects": {
    "tst": "ndab-meualbum-tst-497511",
    "prd": "ndab-meualbum-prd",
    "default": "ndab-meualbum-tst-497511"
  },
  "targets": {
    "ndab-meualbum-tst-497511": { "hosting": { "app": ["ndab-meualbum-tst-497511"] } },
    "ndab-meualbum-prd": { "hosting": { "app": ["ndab-meualbum-prd"] } }
  }
}
```

> O bloco `targets` mapeia o Hosting target `app` (declarado em `firebase.json`) para o site de cada projeto. Está commitado para que o CI rode `firebase deploy --only hosting:app` sem `firebase target:apply`.

Para selecionar o ambiente ativo:

```powershell
firebase use tst
firebase use prd
```

---

## 6. Primeiro Deploy Manual (Bootstrap)

O frontend usa URLs relativas, portanto não depende da URL do Cloud Run. Bootstrap em 2 etapas.

### Etapa 1 — Deploy do backend (Cloud Run)

```powershell
$PROJECT_ID = "ndab-meualbum-prd"
$REGION = "southamerica-east1"
$IMAGE = "southamerica-east1-docker.pkg.dev/$PROJECT_ID/meualbum/api:bootstrap"

gcloud auth configure-docker southamerica-east1-docker.pkg.dev --project=$PROJECT_ID
docker build -t $IMAGE .
docker push $IMAGE
gcloud run deploy meualbum-api --image=$IMAGE --region=$REGION --platform=managed --allow-unauthenticated --set-secrets="MONGODB_URI=MONGODB_URI:latest,JWT_SECRET=JWT_SECRET:latest,RESEND_API_KEY=RESEND_API_KEY:latest,CLIENT_URL=CLIENT_URL:latest" --project=$PROJECT_ID
```

### Etapa 2 — Build e deploy do frontend (Firebase Hosting)

```powershell
$PROJECT_ID = "ndab-meualbum-prd"   # ou ndab-meualbum-tst-497511
$env:NODE_ENV = "production"
npm run build -w client
firebase deploy --only hosting:app --project $PROJECT_ID
```

> Use `--only hosting:app` (Hosting target mapeado no `.firebaserc`) em vez de `--only hosting` para evitar o erro de auto-resolução do site default (ver nota na seção 7).

### Verificar o deploy

```powershell
Start-Process "https://ndab-meualbum-tst-497511.web.app/"
Invoke-RestMethod -Uri "https://ndab-meualbum-tst-497511.web.app/api/health"
```

### Deploy manual de TST via script (contorno do Cloud Build)

Quando o Firebase Hosting falha pelo Cloud Build (ex.: `FetchError: ... Premature close`),
use o script [`scripts/deploy-tst.ps1`](../scripts/deploy-tst.ps1), que executa o mesmo
pipeline **localmente** (onde o deploy é estável). Requer `gcloud auth login` e `firebase login` já feitos.

```powershell
# Deploy completo (backend Cloud Run + frontend Firebase Hosting)
./scripts/deploy-tst.ps1

# Só o frontend, sem reinstalar dependências (iteração rápida)
./scripts/deploy-tst.ps1 -SkipBackend -SkipInstall

# Só o backend
./scripts/deploy-tst.ps1 -SkipFrontend
```

O script: faz `docker build`/`push` → `gcloud run deploy` (com `--set-secrets`) →
`npm ci` → `npm run build -w client` (`NODE_ENV=production`) →
`firebase deploy --only hosting:app` **com retry (3×, backoff 15s)** → health check.
Flags: `-SkipBackend`, `-SkipFrontend`, `-SkipInstall`, `-Tag <tag>`. Alvo fixo: **TST**
(`ndab-meualbum-tst-497511`).

Para **produção**, o equivalente é [`scripts/deploy-prd.ps1`](../scripts/deploy-prd.ps1) (mesma
estrutura, alvo `ndab-meualbum-prd`). Por segurança ele exige **confirmação interativa**
(digite `PRD`) e avisa se a branch atual não for `main`; use `-Yes` para pular a confirmação.
Revise o checklist da seção 13 antes de rodar.

```powershell
./scripts/deploy-prd.ps1                 # completo, com confirmação
./scripts/deploy-prd.ps1 -SkipBackend    # só o frontend
./scripts/deploy-prd.ps1 -Yes            # sem confirmação (automação)
```

---

## 7. Pipeline CI/CD — Como o `cloudbuild.yaml` Funciona

O pipeline tem **6 steps** executados sequencialmente:

| Step | O que faz |
|------|-----------|
| 1 | Build da imagem Docker (multi-stage Alpine 22) |
| 2 | Push para Artifact Registry com tag `${SHORT_SHA}` |
| 3 | Deploy no Cloud Run com `--set-secrets` |
| 4 | `npm ci` — instala dependências do monorepo |
| 5 | Build do frontend com `VITE_API_URL=${_API_URL}` e `NODE_ENV=production` |
| 6 | `firebase deploy --only hosting:app` autenticado via Cloud Build SA (Hosting target — ver nota abaixo) |

**Substituições disponíveis:**

| Variável | Default | Obrigatório por trigger |
|----------|---------|-------------------------|
| `_REGION` | `southamerica-east1` | — |
| `_FIREBASE_PROJECT_ID` | `''` | ✅ |
| `PROJECT_ID` | auto | Injetado pelo Cloud Build |
| `SHORT_SHA` | auto | Injetado pelo Cloud Build |

> `_API_URL` foi removido. O frontend usa URLs relativas (`/api/v1`) e o Firebase Hosting faz o rewrite para o Cloud Run.

> **Hosting target no deploy (Step 6):** o comando usa `firebase deploy --only hosting:app` em vez de `--only hosting`. O `firebase.json` declara `"target": "app"` e o `.firebaserc` mapeia esse target para o site de cada projeto (`app → ndab-meualbum-tst-497511` em tst; `app → ndab-meualbum-prd` em prd). Como os mapeamentos estão **commitados** no `.firebaserc`, não é preciso rodar `firebase target:apply` no CI. Isso evita dois erros: `Assertion failed: resolving hosting target of a site with no site name or target name` (auto-resolução do site default falhando sob o service account, mesmo havendo `DEFAULT_SITE`) e `Hosting site or target … not detected in firebase.json` (quando se passa um site ID que não está declarado no `firebase.json`). A versão do firebase-tools é **fixada em `@15.21.0`**: a `15.22.0` introduziu uma regressão que quebra no Cloud Build com `FetchError: Invalid response body ... Premature close` ([firebase/firebase-tools#10684](https://github.com/firebase/firebase-tools/issues/10684)) — a `15.21.0` é a última versão confirmada boa. **Não use `latest`** no Step #6. O deploy ainda é envolvido em um **retry de até 3 tentativas com backoff de 15s** como rede de segurança para flakiness transitória de rede (o deploy é idempotente). Ao atualizar a versão no futuro, evite a 15.22.0 e valide que a issue #10684 foi resolvida na versão escolhida.

### Criar triggers no Cloud Build

```powershell
$REPO_NAME = "SEU_REPO"
$REPO_OWNER = "SEU_ORG"
$TST_PROJECT = "ndab-meualbum-tst-497511"
gcloud builds triggers create github --name="meualbum-tst" --repo-name=$REPO_NAME --repo-owner=$REPO_OWNER --branch-pattern="^develop$" --build-config="cloudbuild.yaml" --project=$TST_PROJECT --substitutions="_FIREBASE_PROJECT_ID=$TST_PROJECT"

$PRD_PROJECT = "ndab-meualbum-prd"
gcloud builds triggers create github --name="meualbum-prd" --repo-name=$REPO_NAME --repo-owner=$REPO_OWNER --branch-pattern="^main$" --build-config="cloudbuild.yaml" --project=$PRD_PROJECT --substitutions="_FIREBASE_PROJECT_ID=$PRD_PROJECT"
```

---

## 8. Desenvolvimento Local

O ambiente de dev não usa Firebase Hosting — o Vite serve o frontend diretamente e faz proxy das chamadas de API para o Express local.

```powershell
npm install
npm run dev
```

- Client: `http://localhost:5173`
- Server: `http://localhost:3000`

**Como funciona o proxy em dev:** o `vite.config.ts` redireciona `/api/**` → `http://localhost:3000`, então `VITE_API_URL` fica vazio no `.env` local e o browser nunca faz chamadas cross-origin em dev.

**Cookies em dev:** `SameSite=Lax; Secure=false` (mesmo-origin via proxy). Em produção: `SameSite=None; Secure=true` (cross-origin Firebase Hosting → Cloud Run). Controlado por `NODE_ENV` no servidor.

**Para simular Firebase Hosting localmente (opcional):**

```powershell
$env:VITE_API_URL = "http://localhost:3000"; $env:NODE_ENV = "production"; npm run build -w client
firebase emulators:start --only hosting
```

- Frontend emulado: `http://localhost:5000`
- API local: `http://localhost:3000`

---

## 9. Variáveis de Ambiente — Referência Completa

### Frontend — build-time (injetadas no bundle pelo Cloud Build)

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `VITE_API_URL` | *(não usado)* | Não é mais injetado. O frontend usa `/api/v1` (relativo). Firebase Hosting faz rewrite para Cloud Run tanto em TST quanto em PRD. |

### Backend — runtime (via Secret Manager no Cloud Run)

| Variável | Secret Manager | Descrição |
|----------|---------------|-----------|
| `MONGODB_URI` | `MONGODB_URI:latest` | Connection string MongoDB Atlas |
| `JWT_SECRET` | `JWT_SECRET:latest` | Chave de assinatura JWT (min. 32 bytes aleatórios) |
| `CLIENT_URL` | `CLIENT_URL:latest` | URL Firebase Hosting — define a origem CORS permitida e é usada nos links de e-mail |
| `RESEND_API_KEY` | `RESEND_API_KEY:latest` | API Resend; ausente em dev faz fallback para `logger.debug` |
| `NODE_ENV` | env var direta | `production` no Cloud Run |
| `PORT` | env var direta | `8080` (já definido no `Dockerfile`) |

> **`CLIENT_URL` e CORS:** o Express só aceita requests com `Origin` correspondente ao valor de `CLIENT_URL`. Mantenha sempre sincronizado com a URL do Firebase Hosting.

---

## 10. MongoDB Atlas — Configuração de IP Allowlist

O Cloud Run usa IPs dinâmicos. Há duas opções:

### Opção A — Allowlist `0.0.0.0/0` (simples, menor segurança)

No Atlas → **Network Access → Add IP Address → `0.0.0.0/0`**.

Aceitável se o usuário/senha da connection string for forte e com permissões mínimas (sem `admin`).

### Opção B — VPC Connector com IP estático (recomendado para PRD)

```powershell
$PROJECT_ID = "ndab-meualbum-prd"
$REGION = "southamerica-east1"
$SUBNET = "SUBNET_NAME"
gcloud compute networks vpc-access connectors create meualbum-connector --region=$REGION --subnet=$SUBNET --subnet-project=$PROJECT_ID --min-instances=2 --max-instances=3
gcloud run services update meualbum-api --region=$REGION --vpc-connector=meualbum-connector --vpc-egress=all-traffic --project=$PROJECT_ID
```

Adicione o IP do Cloud NAT associado ao connector no Atlas Network Access.

---

## 11. Rollback

### Backend (Cloud Run)

```powershell
$PROJECT_ID = "ndab-meualbum-prd"
$REGION = "southamerica-east1"
gcloud run revisions list --service=meualbum-api --region=$REGION --project=$PROJECT_ID
gcloud run services update-traffic meualbum-api --region=$REGION --to-revisions=meualbum-api-XXXXXX=100 --project=$PROJECT_ID
```

### Frontend (Firebase Hosting)

```powershell
$PROJECT_ID = "ndab-meualbum-prd"
firebase hosting:releases:list --project $PROJECT_ID
firebase hosting:rollback --project $PROJECT_ID
```

---

## 12. Monitoramento e Logs

### Logs do backend

```powershell
$PROJECT_ID = "ndab-meualbum-prd"
$REGION = "southamerica-east1"
gcloud run services logs read meualbum-api --region=$REGION --limit=50 --follow --project=$PROJECT_ID
```

No Console GCP → **Cloud Run → meualbum-api → Logs**. O servidor usa logging estruturado JSON com mascaramento de dados pessoais (LGPD).

### Health check

```powershell
$API_URL = "https://meualbum-api-abc123-rj.a.run.app"
Invoke-RestMethod -Uri "$API_URL/api/health"
```

### Firebase Hosting

No Console Firebase → **Hosting** → métricas de uso, largura de banda e requisições.

### Alertas recomendados (Cloud Monitoring)

- Cloud Run: taxa de erros 5xx > 1%
- Cloud Run: latência p95 > 2s
- Cloud Build: falha de build
- MongoDB Atlas: alertas nativos de conexão e armazenamento

---

## 13. Checklist Pré-Deploy para PRD

- [ ] `JWT_SECRET` é uma string forte (≥ 32 bytes — gerado pelo bloco da seção 4)
- [ ] `MONGODB_URI` aponta para o cluster de produção com usuário de produção (sem `admin`)
- [ ] `CLIENT_URL` é a URL do Firebase Hosting de produção com HTTPS (sem barra final)
- [ ] `RESEND_API_KEY` configurada e domínio do remetente verificado no Resend
- [ ] Atlas Network Access autoriza os IPs do Cloud Run (Opção A ou B da seção 10)
- [ ] Domínio customizado conectado ao Firebase Hosting (se aplicável)
- [ ] `firebase use prd` executado antes do deploy
- [ ] `_FIREBASE_PROJECT_ID=ndab-meualbum-prd` configurado no trigger do Cloud Build para `main`
- [ ] Health check respondendo após o deploy
- [ ] Smoke test: registro → confirmação de e-mail → login → cookie `SameSite=None; Secure` presente

---

## 14. Rotina de purga LGPD (RN-PR01)

A purga de dados expirados (tokens > 90 dias, consentimentos > 5 anos) com **registro de
eliminação** é exposta em `POST /api/v1/admin/purga`, protegida pelo header `X-Purge-Token`.
Os TTL indexes do MongoDB permanecem como contingência — eliminações via TTL não geram
registro, mas só ocorrem se o scheduler falhar (limitação aceita de R-RET-002).

### Secret

```powershell
# 32 bytes aleatórios como PURGE_TOKEN
$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
$token = [Convert]::ToBase64String($bytes)
[System.IO.File]::WriteAllText($TMP, $token, (New-Object System.Text.UTF8Encoding($false)))
gcloud secrets create PURGE_TOKEN --data-file=$TMP --replication-policy=automatic --project=$PROJECT_ID
```

Adicione `PURGE_TOKEN=PURGE_TOKEN:latest` aos `--set-secrets` do serviço Cloud Run.

### Cloud Scheduler (diário, 03:00 América/São Paulo)

```bash
gcloud scheduler jobs create http purga-lgpd \
  --project=$PROJECT_ID \
  --location=southamerica-east1 \
  --schedule="0 3 * * *" \
  --time-zone="America/Sao_Paulo" \
  --uri="https://<URL_DO_CLOUD_RUN>/api/v1/admin/purga" \
  --http-method=POST \
  --headers="X-Purge-Token=<VALOR_DO_SECRET>"
```

> Cloud Run escala a zero — um cron in-process não executaria de forma confiável; por isso o
> disparo é externo. Cada execução grava documentos `RegistroEliminacao` (apenas contagens e
> critérios, sem dados pessoais) e loga `purga:executada`.
