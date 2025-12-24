@echo off
cd /d "%~dp0"
echo ========================================
echo   Demarrage du Backend Flask
echo ========================================
echo.
echo Repertoire actuel: %CD%
echo.
echo Installation des dependances...
if exist backend-requirements.txt (
    pip install -r backend-requirements.txt
) else (
    echo ERREUR: backend-requirements.txt introuvable!
    echo Fichiers dans le repertoire:
    dir /b
    pause
    exit /b 1
)
echo.
echo Demarrage du serveur...
echo.
if exist backend.py (
    python backend.py
) else (
    echo ERREUR: backend.py introuvable!
    echo Fichiers dans le repertoire:
    dir /b
    pause
    exit /b 1
)
pause

