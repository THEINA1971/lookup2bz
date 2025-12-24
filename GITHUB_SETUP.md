# 📤 Guide Rapide : Mettre le projet sur GitHub

## 🚀 Étapes pour pousser sur GitHub

### 1. Initialiser Git (si pas déjà fait)

```bash
cd Api-check-bkz-main
git init
```

### 2. Créer les fichiers de données vides

**Sur Windows :**
```bash
init-data.bat
```

**Sur Linux/Mac :**
```bash
chmod +x init-data.sh
./init-data.sh
```

**Ou manuellement :**
```bash
mkdir -p data
echo {} > data/users.json
echo {} > data/keys.json
echo {} > data/sessions.json
echo {} > data/verification_codes.json
echo [] > data/payments.json
echo {} > data/subscriptions.json
echo {} > data/attack_log.json
echo {} > data/blocked_ips.json
echo {} > data/databases.json
```

### 3. Ajouter tous les fichiers

```bash
git add .
```

### 4. Faire le premier commit

```bash
git commit -m "Initial commit - Lookup2Bz OSINT Platform"
```

### 5. Créer un repository sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur le **"+"** en haut à droite → **"New repository"**
3. Nommez votre repository (ex: `lookup2bz`)
4. **Ne cochez PAS** "Initialize with README"
5. Cliquez sur **"Create repository"**

### 6. Connecter votre projet local à GitHub

```bash
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

**Remplacez :**
- `VOTRE_USERNAME` par votre nom d'utilisateur GitHub
- `VOTRE_REPO` par le nom de votre repository

### 7. Vérifier

Allez sur votre repository GitHub, vous devriez voir tous vos fichiers !

## ⚠️ Important

Le fichier `.gitignore` est déjà configuré pour **ne pas** pousser :
- Les fichiers de données sensibles (`data/*.json`)
- Les credentials (`CREDENTIALS_ADMIN.txt`)
- Les fichiers Python compilés (`__pycache__/`)
- Les variables d'environnement (`.env`)

## 🔄 Mises à jour futures

Pour mettre à jour votre repository :

```bash
git add .
git commit -m "Description de vos changements"
git push
```

## 📝 Prochaines étapes

Une fois sur GitHub, suivez le guide [DEPLOIEMENT_RENDER.md](./DEPLOIEMENT_RENDER.md) pour déployer sur Render !

