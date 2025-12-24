@echo off
echo ========================================
echo Demarrage du Serveur Frontend
echo ========================================
echo.
echo Le serveur va demarrer sur http://localhost:8000
echo.
echo Ouvrez votre navigateur et allez sur :
echo http://localhost:8000/register.html
echo.
echo Appuyez sur CTRL+C pour arreter le serveur
echo.
python -m http.server 8000

