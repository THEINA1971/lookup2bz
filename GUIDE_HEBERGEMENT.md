# 🚀 Guide d'Hébergement Gratuit

Ce guide vous explique comment héberger gratuitement votre panel OSINT BreachHub.

## 📋 Options d'Hébergement

### Option 1 : Vercel (Recommandé) ⭐

**Avantages :**
- Gratuit et illimité pour les projets personnels
- Déploiement automatique depuis GitHub
- CDN global pour une vitesse optimale
- Support des fonctions serverless (pour le backend)

#### Étapes pour Vercel :

1. **Préparer le projet**
   - Créez un compte sur [Vercel](https://vercel.com)
   - Installez Vercel CLI : `npm i -g vercel`

2. **Héberger le Frontend**
   - Le frontend (HTML/CSS/JS) peut être déployé directement sur Vercel
   - Créez un fichier `vercel.json` à la racine :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

3. **Héberger le Backend (Flask)**
   - Créez un fichier `api/index.py` pour Vercel :

```python
from backend import app

# Vercel utilise cette variable
handler = app
```

   - Créez `vercel.json` avec la configuration backend :

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

---

### Option 2 : Netlify (Frontend) + Render (Backend)

#### Frontend sur Netlify :

1. **Créer un compte** sur [Netlify](https://netlify.com)
2. **Déployer** :
   - Glissez-déposez le dossier du frontend
   - Ou connectez votre repository GitHub
3. **Configuration** : Netlify détecte automatiquement les fichiers statiques

#### Backend sur Render :

1. **Créer un compte** sur [Render](https://render.com)
2. **Nouveau Web Service** :
   - Connectez votre repository GitHub
   - Build Command : `pip install -r backend-requirements.txt`
   - Start Command : `python backend.py`
3. **Variables d'environnement** :
   - Ajoutez `BREACHHUB_API_KEY` dans les settings
   - Ajoutez `JWT_SECRET_KEY` pour la sécurité

4. **Mettre à jour le frontend** :
   - Dans `admin-script.js` et `osint-panel.js`, remplacez :
   ```javascript
   const backendUrl = 'http://localhost:5000';
   ```
   - Par l'URL de votre backend Render :
   ```javascript
   const backendUrl = 'https://votre-backend.onrender.com';
   ```

---

### Option 3 : Railway (Tout-en-un) 🚂

**Avantages :**
- Héberge frontend ET backend ensemble
- 500 heures gratuites par mois
- Déploiement automatique depuis GitHub

#### Étapes :

1. **Créer un compte** sur [Railway](https://railway.app)
2. **Nouveau projet** depuis GitHub
3. **Configuration** :
   - Railway détecte automatiquement Python
   - Ajoutez les variables d'environnement :
     - `BREACHHUB_API_KEY`
     - `JWT_SECRET_KEY`
     - `FLASK_ENV=production`
4. **Fichier `railway.json`** (optionnel) :

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python backend.py",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

5. **Mettre à jour les URLs** dans le frontend pour pointer vers Railway

---

### Option 4 : Cloudflare Pages (Frontend) + Fly.io (Backend)

#### Frontend sur Cloudflare Pages :

1. **Créer un compte** sur [Cloudflare Pages](https://pages.cloudflare.com)
2. **Connecter GitHub** et déployer
3. **Configuration** : Cloudflare détecte automatiquement les fichiers statiques

#### Backend sur Fly.io :

1. **Installer Fly CLI** :
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Créer un compte** sur [Fly.io](https://fly.io)

3. **Initialiser le projet** :
   ```bash
   fly launch
   ```

4. **Créer `fly.toml`** :
   ```toml
   app = "votre-app-name"
   primary_region = "cdg"

   [build]

   [http_service]
     internal_port = 5000
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0
     processes = ["app"]

   [[vm]]
     cpu_kind = "shared"
     cpus = 1
     memory_mb = 256
   ```

5. **Déployer** :
   ```bash
   fly deploy
   ```

---

## 🔧 Configuration Requise

### Variables d'Environnement

Créez un fichier `.env` (ou configurez dans votre plateforme) :

```env
BREACHHUB_API_KEY=votre_cle_api_breachhub
JWT_SECRET_KEY=une_cle_secrete_aleatoire_longue
FLASK_ENV=production
```

### Modifications du Backend pour Production

Modifiez `backend.py` pour accepter les requêtes CORS depuis votre frontend :

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://votre-frontend.netlify.app", "https://votre-frontend.vercel.app"])
```

---

## 📝 Checklist de Déploiement

- [ ] Créer un compte sur la plateforme choisie
- [ ] Configurer les variables d'environnement
- [ ] Mettre à jour les URLs dans le frontend
- [ ] Tester le déploiement
- [ ] Vérifier que le backend répond
- [ ] Tester une recherche API
- [ ] Configurer un domaine personnalisé (optionnel)

---

## 🎯 Recommandation Finale

**Pour débuter rapidement :**
- **Frontend** : Netlify (le plus simple)
- **Backend** : Render (gratuit, fiable)

**Pour une solution tout-en-un :**
- **Railway** ou **Fly.io** (héberge tout ensemble)

---

## ⚠️ Notes Importantes

1. **Rate Limits** : Les services gratuits ont des limites. Surveillez votre usage.
2. **Sleep Mode** : Render et Railway mettent les apps en veille après inactivité (première requête peut être lente).
3. **Variables d'environnement** : Ne commitez JAMAIS votre `.env` dans Git !
4. **CORS** : Assurez-vous que le backend autorise les requêtes depuis votre frontend.

---

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de déploiement
2. Testez le backend localement d'abord
3. Vérifiez les variables d'environnement
4. Consultez la documentation de la plateforme choisie

