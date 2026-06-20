<#
.SYNOPSIS
  Deploy manual do MeuAlbum no ambiente de TESTES (TST) — contorno para a
  instabilidade do Firebase Hosting quando chamado pelo Cloud Build.

.DESCRIPTION
  Replica localmente os passos do cloudbuild.yaml (ver docs/DEPLOY.md):
    1. Build + push da imagem Docker para o Artifact Registry
    2. Deploy do backend no Cloud Run (com --set-secrets)
    3. npm ci (dependências do monorepo)
    4. Build do frontend (NODE_ENV=production → client/dist)
    5. Deploy do frontend no Firebase Hosting (target "app") com retry
    6. Health check via URL do Hosting

  O deploy do Firebase é idempotente, então o passo 5 tem retry com backoff
  para absorver o "FetchError: Premature close" ocasional.

  Pré-requisitos (uma vez): `gcloud auth login`, `gcloud auth configure-docker
  southamerica-east1-docker.pkg.dev`, `firebase login`. Toda a infra (secrets,
  Artifact Registry, sites de Hosting) já deve existir — ver docs/DEPLOY.md §3-4.

.PARAMETER SkipBackend
  Pula build/push/deploy do Cloud Run. Use quando só o frontend mudou.

.PARAMETER SkipFrontend
  Pula build/deploy do Firebase Hosting.

.PARAMETER SkipInstall
  Pula `npm ci` (reaproveita node_modules já instalado).

.PARAMETER Tag
  Tag da imagem Docker. Default: short SHA do git (ou timestamp).

.EXAMPLE
  ./scripts/deploy-tst.ps1
  # Deploy completo (backend + frontend) no TST.

.EXAMPLE
  ./scripts/deploy-tst.ps1 -SkipBackend -SkipInstall
  # Só o frontend, sem reinstalar dependências (iteração rápida).
#>
param(
  [switch]$SkipBackend,
  [switch]$SkipFrontend,
  [switch]$SkipInstall,
  [string]$Tag
)

$ErrorActionPreference = 'Stop'

# ─── Constantes do ambiente TST ───────────────────────────────────────────────
$ProjectId     = 'ndab-meualbum-tst-497511'
$Region        = 'southamerica-east1'
$Service       = 'meualbum-api'
$Repo          = 'meualbum'
$HostingTarget = 'app'
$HostingUrl    = "https://$ProjectId.web.app"
$Registry      = "$Region-docker.pkg.dev/$ProjectId/$Repo/api"

function Assert-LastExit([string]$What) {
  if ($LASTEXITCODE -ne 0) { throw "Falha em: $What (exit $LASTEXITCODE)" }
}

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Ferramenta '$Name' nao encontrada no PATH. Veja docs/DEPLOY.md secao 2."
  }
}

# Raiz do repo (este script vive em scripts/)
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot
Write-Host "==> Raiz do repo: $RepoRoot" -ForegroundColor Cyan

# ─── Preflight ────────────────────────────────────────────────────────────────
Write-Host "==> Verificando ferramentas..." -ForegroundColor Cyan
Require-Command gcloud
Require-Command node
Require-Command npm
if (-not $SkipFrontend) { Require-Command firebase }
if (-not $SkipBackend)  { Require-Command docker }

# Tag da imagem
if (-not $Tag) {
  $sha = (& git rev-parse --short=7 HEAD 2>$null)
  if ($LASTEXITCODE -eq 0 -and $sha) { $Tag = "$sha".Trim() }
  else { $Tag = Get-Date -Format 'yyyyMMddHHmmss' }
}
$Image = "${Registry}:$Tag"

Write-Host "==> Projeto:  $ProjectId" -ForegroundColor Cyan
Write-Host "==> Regiao:   $Region"    -ForegroundColor Cyan
Write-Host "==> Imagem:   $Image"     -ForegroundColor Cyan

# ─── 1-2. Backend (Cloud Run) ─────────────────────────────────────────────────
if (-not $SkipBackend) {
  Write-Host "`n==> [backend] Configurando Docker para o Artifact Registry..." -ForegroundColor Green
  gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet --project=$ProjectId
  Assert-LastExit 'gcloud auth configure-docker'

  Write-Host "`n==> [backend] docker build..." -ForegroundColor Green
  docker build -t $Image .
  Assert-LastExit 'docker build'

  Write-Host "`n==> [backend] docker push..." -ForegroundColor Green
  docker push $Image
  Assert-LastExit 'docker push'

  Write-Host "`n==> [backend] Deploy no Cloud Run ($Service)..." -ForegroundColor Green
  $runArgs = @(
    'run', 'deploy', $Service,
    "--image=$Image",
    "--region=$Region",
    '--platform=managed',
    '--allow-unauthenticated',
    '--set-secrets=MONGODB_URI=MONGODB_URI:latest,JWT_SECRET=JWT_SECRET:latest,RESEND_API_KEY=RESEND_API_KEY:latest,CLIENT_URL=CLIENT_URL:latest',
    "--project=$ProjectId"
  )
  gcloud @runArgs
  Assert-LastExit 'gcloud run deploy'
} else {
  Write-Host "`n==> [backend] Pulado (-SkipBackend)." -ForegroundColor Yellow
}

# ─── 3-5. Frontend (Firebase Hosting) ─────────────────────────────────────────
if (-not $SkipFrontend) {
  if (-not $SkipInstall) {
    Write-Host "`n==> [frontend] npm ci..." -ForegroundColor Green
    npm ci
    Assert-LastExit 'npm ci'
  }

  Write-Host "`n==> [frontend] Build (NODE_ENV=production)..." -ForegroundColor Green
  $env:NODE_ENV = 'production'
  npm run build -w client
  Assert-LastExit 'npm run build -w client'

  if (-not (Test-Path "$RepoRoot/client/dist/index.html")) {
    throw "Build nao gerou client/dist/index.html."
  }

  Write-Host "`n==> [frontend] Deploy no Firebase Hosting (target '$HostingTarget')..." -ForegroundColor Green
  $maxAttempts = 3
  for ($i = 1; $i -le $maxAttempts; $i++) {
    Write-Host "    Tentativa $i/$maxAttempts..."
    firebase deploy --only "hosting:$HostingTarget" --project $ProjectId --non-interactive
    if ($LASTEXITCODE -eq 0) { break }
    if ($i -eq $maxAttempts) { throw "Firebase deploy falhou apos $maxAttempts tentativas." }
    Write-Host "    Falhou (exit $LASTEXITCODE); aguardando 15s antes de re-tentar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
  }
} else {
  Write-Host "`n==> [frontend] Pulado (-SkipFrontend)." -ForegroundColor Yellow
}

# ─── 6. Verificacao ───────────────────────────────────────────────────────────
Write-Host "`n==> Health check ($HostingUrl/api/health)..." -ForegroundColor Cyan
try {
  $health = Invoke-RestMethod -Uri "$HostingUrl/api/health" -TimeoutSec 30
  Write-Host "    OK: $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
  Write-Host "    Aviso: health check nao respondeu ($($_.Exception.Message))." -ForegroundColor Yellow
  Write-Host "    Verifique manualmente apos alguns segundos (Cloud Run pode estar com cold start)." -ForegroundColor Yellow
}

Write-Host "`nDeploy TST concluido: $HostingUrl" -ForegroundColor Green
