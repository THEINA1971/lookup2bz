@echo off
REM Script pour initialiser les fichiers de données vides sur Windows

if not exist data mkdir data

echo {} > data\users.json
echo {} > data\keys.json
echo {} > data\sessions.json
echo {} > data\verification_codes.json
echo [] > data\payments.json
echo {} > data\subscriptions.json
echo {} > data\attack_log.json
echo {} > data\blocked_ips.json
echo {} > data\databases.json

echo ✅ Fichiers de données initialisés dans le dossier data/

pause

