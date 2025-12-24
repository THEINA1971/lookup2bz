# 🚀 Démarrage Rapide

## Problème : "Failed to fetch" ou APIs ne fonctionnent pas

### Solution : Démarrer le Backend Flask

Le frontend a besoin du backend Flask pour faire les requêtes API (proxy pour éviter les problèmes CORS).

## 📋 Étapes

### 1. Installer les dépendances Python

```bash
cd Api-check-bkz-main
pip install -r backend-requirements.txt
```

### 2. Démarrer le Backend

```bash
python backend.py
```

Vous devriez voir :
```
🚀 Serveur Backend démarré sur http://localhost:5000
📊 Mode debug: False
🔐 API disponible sur /api/
```

### 3. Ouvrir le Frontend

Ouvrez `index.html` dans votre navigateur (ou servez-le via un serveur local).

### 4. Tester une API

- Cliquez sur une carte API
- Entrez une requête
- Cliquez sur "Rechercher"

Les requêtes passent maintenant par le proxy backend sur `http://localhost:5000/api/breachhub/...`

## ⚠️ Important

- Le backend DOIT être démarré avant d'utiliser le panel
- Le backend doit tourner sur le port 5000 (par défaut)
- Si vous changez le port, modifiez aussi `backendUrl` dans `admin-script.js`

## 🔧 Dépannage

### Erreur "Failed to fetch"
- Vérifiez que le backend est démarré : `python backend.py`
- Vérifiez que le port 5000 est libre
- Ouvrez la console du navigateur (F12) pour voir les erreurs détaillées

### Erreur "Module not found: requests"
- Installez les dépendances : `pip install -r backend-requirements.txt`

### Le backend ne démarre pas
- Vérifiez que Python 3.7+ est installé
- Vérifiez que toutes les dépendances sont installées
- Regardez les erreurs dans le terminal

