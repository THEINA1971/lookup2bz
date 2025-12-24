# Changer vers le répertoire du script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Demarrage du Backend Flask" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repertoire actuel: $PWD" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path "backend-requirements.txt")) {
    Write-Host "ERREUR: backend-requirements.txt introuvable!" -ForegroundColor Red
    Write-Host "Fichiers dans le repertoire:" -ForegroundColor Yellow
    Get-ChildItem | Select-Object Name
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

Write-Host "Installation des dependances..." -ForegroundColor Yellow
pip install -r backend-requirements.txt

Write-Host ""
Write-Host "Demarrage du serveur..." -ForegroundColor Green
Write-Host ""

if (-not (Test-Path "backend.py")) {
    Write-Host "ERREUR: backend.py introuvable!" -ForegroundColor Red
    Write-Host "Fichiers dans le repertoire:" -ForegroundColor Yellow
    Get-ChildItem | Select-Object Name
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

python backend.py

