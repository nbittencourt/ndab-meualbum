# Seed manual do banco de dados ndab-meualbum-prd.
# Busca a MONGODB_URI do Secret Manager via gcloud e executa o script TypeScript.
#
# Pré-requisitos:
#   - gcloud autenticado com acesso ao projeto ndab-meualbum-prd
#   - npm install executado na raiz do projeto
#
# Uso (a partir da raiz do projeto):
#   .\scripts\seed-prd.ps1

$ErrorActionPreference = "Stop"
$PROJECT_ID = "ndab-meualbum-prd"

Write-Host "Buscando MONGODB_URI do Secret Manager..." -ForegroundColor Cyan
$MONGODB_URI = gcloud secrets versions access latest --secret=MONGODB_URI --project=$PROJECT_ID 2>&1

if ($LASTEXITCODE -ne 0 -or -not $MONGODB_URI -or $MONGODB_URI -like "ERROR*") {
    Write-Error "Falha ao buscar MONGODB_URI. Verifique se o gcloud está autenticado e tem acesso ao projeto $PROJECT_ID."
    exit 1
}

$env:MONGODB_URI = $MONGODB_URI
$env:NODE_ENV = "seed"

Write-Host "Executando seed..." -ForegroundColor Cyan
npx tsx scripts/seed-db.ts

if ($LASTEXITCODE -ne 0) {
    Write-Error "O script de seed falhou."
    exit 1
}
