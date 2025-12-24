# 🚀 Déploiement sur Render

Ce guide vous explique comment déployer Lookup2Bz sur Render.

## 📋 Prérequis

1. Un compte GitHub
2. Un compte Render (gratuit disponible sur [render.com](https://render.com))
3. Votre projet prêt sur votre ordinateur

## 🔧 Étape 1 : Préparer le projet pour GitHub

### 1.1 Initialiser Git (si pas déjà fait)

```bash
cd Api-check-bkz-main
git init
```

### 1.2 Créer les fichiers de données vides

Créez les fichiers de données nécessaires dans le dossier `data/` :

```bash
mkdir -p data
echo "{}" > data/users.json
echo "{}" > data/keys.json
echo "{}" > data/sessions.json
echo "{}" > data/verification_codes.json
echo "[]" > data/payments.json
echo "{}" > data/subscriptions.json
echo "{}" > data/attack_log.json
echo "{}" > data/blocked_ips.json
echo "{}" > data/databases.json
```

### 1.3 Ajouter tous les fichiers

```bash
git add .
git commit -m "Initial commit - Lookup2Bz OSINT Platform"
```

## 📤 Étape 2 : Pousser sur GitHub

### 2.1 Créer un nouveau repository sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur "New repository"
3. Nommez-le (ex: `lookup2bz`)
4. Ne cochez PAS "Initialize with README"
5. Cliquez sur "Create repository"

### 2.2 Connecter votre projet local à GitHub

```bash
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

Remplacez `VOTRE_USERNAME` et `VOTRE_REPO` par vos informations.

## 🌐 Étape 3 : Déployer sur Render

### 3.1 Créer le service Backend

1. Allez sur [dashboard.render.com](https://dashboard.render.com)
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre compte GitHub et sélectionnez votre repository
4. Configurez :
   - **Name**: `lookup2bz-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend-requirements.txt`
   - **Start Command**: `gunicorn backend:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Plan**: Free

5. Dans "Environment Variables", ajoutez :
   ```
   SECRET_KEY = (générez une clé aléatoire)
   JWT_SECRET_KEY = (générez une clé aléatoire)
   ALLOWED_ORIGINS = https://votre-frontend.onrender.com
   SMTP_ENABLED = false
   ```

6. Cliquez sur "Create Web Service"

### 3.2 Créer le service Frontend

1. Dans Render, cliquez sur "New +" → "Static Site"
2. Connectez votre repository GitHub
3. Configurez :
   - **Name**: `lookup2bz-frontend`
   - **Build Command**: (laissez vide)
   - **Publish Directory**: `.` (point)
   - **Plan**: Free

4. Cliquez sur "Create Static Site"

### 3.3 Mettre à jour l'URL du backend

Une fois le backend déployé, vous obtiendrez une URL comme `https://lookup2bz-backend.onrender.com`

1. Ouvrez `config.js`
2. Mettez à jour l'URL de production :

```javascript
getBackendUrl() {
    // En production sur Render
    if (window.location.hostname.includes('onrender.com') || 
        window.location.hostname.includes('lookup2bz')) {
        return 'https://lookup2bz-backend.onrender.com';
    }
    // Local
    return 'http://localhost:5000';
}
```

3. Commitez et poussez les changements :
```bash
git add config.js
git commit -m "Update backend URL for Render"
git push
```

## 🔐 Étape 4 : Configuration de sécurité

### 4.1 Activer HTTPS sur Render

Render active automatiquement HTTPS pour tous les services. Assurez-vous que :
- `force_https=True` dans `backend.py` (ligne 51)
- Les URLs dans `config.js` utilisent `https://`

### 4.2 Variables d'environnement importantes

Dans Render Dashboard → Environment Variables, configurez :

```
SECRET_KEY = (clé aléatoire de 32 caractères)
JWT_SECRET_KEY = (clé aléatoire de 32 caractères)
ALLOWED_ORIGINS = https://lookup2bz-frontend.onrender.com
SMTP_ENABLED = false
```

## 📝 Étape 5 : Mettre à jour backend.py pour Render

Assurez-vous que dans `backend.py`, la ligne 51 est :

```python
Talisman(app, 
    force_https=True,  # Activé en production
    ...
)
```

## 🎯 Étape 6 : Créer l'utilisateur admin

Après le premier déploiement, connectez-vous au backend et créez un admin :

1. Les credentials admin seront affichés dans les logs Render
2. Ou connectez-vous via SSH et exécutez le backend localement

## 🔄 Mises à jour futures

Pour mettre à jour le site :

```bash
git add .
git commit -m "Description des changements"
git push
```

Render redéploiera automatiquement !

## ⚠️ Notes importantes

1. **Plan Free** : Le service peut s'endormir après 15 minutes d'inactivité
2. **Données** : Les fichiers JSON seront réinitialisés à chaque redéploiement (utilisez une base de données pour la production)
3. **Performance** : Le plan gratuit est limité, envisagez un plan payant pour la production

## 🆘 Support

En cas de problème :
- Vérifiez les logs dans Render Dashboard
- Vérifiez que toutes les variables d'environnement sont configurées
- Assurez-vous que les URLs sont correctes dans `config.js`

