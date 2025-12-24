Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Demarrage du Serveur Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Le serveur va demarrer sur http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ouvrez votre navigateur et allez sur :" -ForegroundColor Yellow
Write-Host "http://localhost:8000/register.html" -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur CTRL+C pour arreter le serveur" -ForegroundColor Yellow
Write-Host ""

# Changer vers le répertoire du script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Démarrer le serveur HTTP
python -m http.server 8000

