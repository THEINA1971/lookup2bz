# 🚀 Déploiement Rapide - Guide en 5 minutes

## Option la plus simple : Netlify (Frontend) + Render (Backend)

### Étape 1 : Préparer le Backend sur Render (5 min)

1. **Créer un compte** sur [Render.com](https://render.com) (gratuit)
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repository GitHub (ou créez-en un)
4. **Configuration** :
   - **Name** : `breachhub-backend`
   - **Environment** : `Python 3`
   - **Build Command** : `pip install -r backend-requirements.txt`
   - **Start Command** : `python backend.py`
5. **Variables d'environnement** (dans "Environment") :
   ```
   BREACHHUB_API_KEY=votre_cle_api_breachhub
   JWT_SECRET_KEY=une_cle_secrete_aleatoire_longue
   FLASK_ENV=production
   ALLOWED_ORIGINS=https://votre-site.netlify.app
   ```
6. Cliquez sur **"Create Web Service"**
7. **Copiez l'URL** de votre backend (ex: `https://breachhub-backend.onrender.com`)

### Étape 2 : Déployer le Frontend sur Netlify (3 min)

1. **Créer un compte** sur [Netlify.com](https://netlify.com) (gratuit)
2. Dans `admin-script.js` et `osint-panel.js`, remplacez temporairement :
   ```javascript
   const backendUrl = 'http://localhost:5000';
   ```
   Par :
   ```javascript
   const backendUrl = 'https://votre-backend.onrender.com';
   ```
   (Utilisez l'URL que vous avez copiée à l'étape 1)

3. Sur Netlify :
   - Glissez-déposez le dossier de votre projet
   - OU connectez votre repository GitHub
4. Netlify déploie automatiquement !

### Étape 3 : Mettre à jour CORS (2 min)

1. Retournez sur Render
2. Dans les **Variables d'environnement**, mettez à jour :
   ```
   ALLOWED_ORIGINS=https://votre-site.netlify.app
   ```
   (Remplacez par l'URL Netlify de votre site)

3. Redéployez le backend sur Render

### ✅ C'est fait !

Votre site est maintenant en ligne et gratuit !

---

## Alternative : Tout sur Railway (encore plus simple)

1. **Créer un compte** sur [Railway.app](https://railway.app)
2. **Nouveau projet** → **Deploy from GitHub repo**
3. Railway détecte automatiquement Python
4. **Variables d'environnement** :
   ```
   BREACHHUB_API_KEY=votre_cle
   JWT_SECRET_KEY=une_cle_secrete
   FLASK_ENV=production
   ```
5. Railway déploie tout automatiquement !

**Note** : Railway donne 500 heures gratuites par mois.

---

## 🔧 Configuration automatique

Le fichier `config.js` détecte automatiquement si vous êtes en local ou en production. Pas besoin de modifier le code !

En **local** : utilise `http://localhost:5000`  
En **production** : utilise automatiquement l'URL du site

---

## ⚠️ Important

1. **Ne commitez JAMAIS** votre `.env` ou vos clés API dans Git
2. Utilisez les **Variables d'environnement** de votre plateforme
3. Le backend peut prendre 30-60 secondes à démarrer après inactivité (mode "sleep" gratuit)

---

## 🆘 Problèmes courants

**"Failed to fetch"** :
- Vérifiez que le backend est démarré sur Render
- Vérifiez les variables CORS dans Render

**"Invalid key"** :
- Vérifiez que `BREACHHUB_API_KEY` est bien configurée dans Render

**Le site ne charge pas** :
- Vérifiez les logs de déploiement sur Netlify
- Vérifiez que tous les fichiers sont bien uploadés

