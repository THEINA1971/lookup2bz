# 🚀 Comment déployer les changements sur Render

## ⚠️ IMPORTANT : Les changements doivent être sur GitHub pour que Render les utilise !

---

## Méthode 1 : GitHub Desktop (LE PLUS SIMPLE) ⭐

### Si vous avez GitHub Desktop :

1. **Ouvrez GitHub Desktop**
2. **Vérifiez les fichiers modifiés** :
   - Vous devriez voir `backend.py` et `config.js` dans la liste
3. **En bas à gauche, dans "Summary"**, tapez :
   ```
   Fix: Backend sert maintenant le frontend
   ```
4. **Cliquez sur "Commit to main"**
5. **Cliquez sur "Push origin"** (bouton en haut à droite)
6. **Attendez 1-2 minutes** - Render va automatiquement redéployer

---

## Méthode 2 : Via le site GitHub.com

### Étape 1 : Aller sur GitHub

1. Allez sur [github.com](https://github.com) et connectez-vous
2. Allez dans votre repository : `https://github.com/THEINA1971/lookup2bz`

### Étape 2 : Modifier backend.py

1. **Cliquez sur `backend.py`**
2. **Cliquez sur l'icône crayon (✏️)** en haut à droite
3. **Ouvrez `backend.py` sur votre ordinateur** (dans `C:\Users\tbenm\OneDrive\Documents\GitHub\lookup2bz\`)
4. **Sélectionnez tout** (Ctrl+A) et **copiez** (Ctrl+C)
5. **Collez** dans l'éditeur GitHub (Ctrl+V)
6. **En bas de la page**, dans "Commit changes" :
   - Message : `Fix: Backend sert maintenant le frontend`
   - Cliquez sur **"Commit changes"**

### Étape 3 : Modifier config.js

1. **Retournez à la liste des fichiers**
2. **Cliquez sur `config.js`**
3. **Cliquez sur l'icône crayon (✏️)**
4. **Ouvrez `config.js` sur votre ordinateur**
5. **Copiez tout** et **collez** dans GitHub
6. **Commitez** avec le même message

### Étape 4 : Render redéploie automatiquement

- Render détecte les changements dans 1-2 minutes
- Le redéploiement commence automatiquement
- Vous pouvez voir le progrès dans [dashboard.render.com](https://dashboard.render.com)

---

## Méthode 3 : Vérifier que ça fonctionne

### Après le déploiement :

1. **Allez sur** [dashboard.render.com](https://dashboard.render.com)
2. **Cliquez sur votre service** `lookup2bz-backend`
3. **Regardez les logs** - vous devriez voir :
   ```
   Build successful 🎉
   ```
4. **Attendez que le déploiement se termine** (1-2 minutes)
5. **Allez sur** `https://lookup2bz.onrender.com/`
6. **Vous devriez maintenant voir le PANEL** au lieu du JSON ! 🎉

---

## ⚠️ Si ça ne fonctionne toujours pas

### Vérifiez dans Render :

1. **Dashboard Render** → Votre service `lookup2bz-backend`
2. **Onglet "Logs"**
3. **Cherchez des erreurs** comme :
   - `FileNotFoundError: index.html`
   - `Template not found`

### Si vous voyez "index.html not found" :

Cela signifie que `index.html` n'est pas dans le repository GitHub. Dans ce cas :

1. **Sur GitHub.com**, allez dans votre repository
2. **Vérifiez que `index.html` existe** dans la liste des fichiers
3. **Si `index.html` n'existe pas**, ajoutez-le :
   - Cliquez sur "Add file" → "Upload files"
   - Glissez-déposez `index.html` depuis votre ordinateur
   - Commitez

---

## ✅ Résultat attendu

Après le déploiement, quand vous allez sur `https://lookup2bz.onrender.com/` :

- ✅ Vous voyez le **PANEL OSINT** (interface avec les cartes API)
- ❌ Vous ne voyez **PAS** le JSON `{"service":"FULLLOOKUP..."}`

---

## 🆘 Besoin d'aide ?

Si après avoir poussé les changements sur GitHub, vous voyez toujours le JSON :

1. **Vérifiez les logs Render** pour voir les erreurs
2. **Vérifiez que `index.html` est bien sur GitHub**
3. **Attendez 2-3 minutes** après le push (Render peut être lent)
4. **Faites un "Manual Deploy"** dans Render si nécessaire

