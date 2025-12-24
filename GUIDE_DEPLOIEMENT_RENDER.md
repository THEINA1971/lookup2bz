# 🚀 Guide : Mettre à jour le code sur Render

## Méthode 1 : GitHub Desktop (Le plus simple) ⭐

### Si vous avez GitHub Desktop installé :

1. **Ouvrez GitHub Desktop**
2. **Vérifiez les changements** :
   - Vous devriez voir `backend.py`, `render.yaml`, et `runtime.txt` dans la liste des fichiers modifiés
3. **Ajoutez un message de commit** :
   - En bas à gauche, dans "Summary", tapez : `Fix: Correction de la gestion des répertoires data`
4. **Cliquez sur "Commit to main"**
5. **Cliquez sur "Push origin"** (en haut à droite)
6. **Attendez quelques secondes** - Render va automatiquement détecter les changements et redéployer

---

## Méthode 2 : Via le site GitHub (Sans installer Git)

### Étape 1 : Aller sur GitHub.com

1. Allez sur [github.com](https://github.com) et connectez-vous
2. Allez dans votre repository : `https://github.com/THEINA1971/lookup2bz`

### Étape 2 : Modifier les fichiers directement

1. **Cliquez sur `backend.py`**
2. **Cliquez sur l'icône crayon (✏️) en haut à droite** pour éditer
3. **Copiez-collez le nouveau contenu** du fichier `backend.py` (depuis votre ordinateur)
4. **En bas de la page, dans "Commit changes"** :
   - Message : `Fix: Correction de la gestion des répertoires data`
   - Cliquez sur **"Commit changes"**
5. **Répétez pour `render.yaml` et `runtime.txt`** si nécessaire

### Étape 3 : Render redéploie automatiquement

- Render détecte automatiquement les changements sur GitHub
- Le redéploiement commence dans les 1-2 minutes
- Vous pouvez voir le progrès dans le dashboard Render

---

## Méthode 3 : Via la ligne de commande (Si Git est installé)

### Ouvrez PowerShell ou CMD dans le dossier du projet :

```powershell
cd "C:\Users\tbenm\OneDrive\Documents\GitHub\lookup2bz"
```

### Ensuite, exécutez ces commandes :

```bash
# Voir les fichiers modifiés
git status

# Ajouter tous les fichiers modifiés
git add backend.py render.yaml runtime.txt

# Créer un commit
git commit -m "Fix: Correction de la gestion des répertoires data"

# Pousser sur GitHub
git push origin main
```

---

## ✅ Vérifier que ça fonctionne sur Render

### 1. Allez sur votre dashboard Render :
   - [dashboard.render.com](https://dashboard.render.com)

### 2. Cliquez sur votre service `lookup2bz-backend`

### 3. Regardez les logs :
   - Vous devriez voir des messages comme :
     ```
     [INIT] BASE_DIR: /opt/render/project/src
     [INIT] DATA_DIR: /opt/render/project/src/data
     [INIT] DATA_DIR existe: True
     ```

### 4. Si vous voyez "Build successful 🎉" :
   - ✅ C'est bon ! Le site est déployé

### 5. Si vous voyez encore des erreurs :
   - Regardez les logs complets
   - Les messages `[INIT]` et `[ERROR]` vous diront exactement ce qui ne va pas

---

## 🔄 Forcer un redéploiement manuel

Si Render ne redéploie pas automatiquement :

1. **Dans le dashboard Render**, cliquez sur votre service
2. **Cliquez sur "Manual Deploy"** (en haut à droite)
3. **Sélectionnez "Deploy latest commit"**
4. **Attendez que le déploiement se termine**

---

## ⚠️ Important

- **Ne supprimez JAMAIS** le dossier `data/` de votre repository local
- Les fichiers dans `data/` ne doivent **PAS** être commités sur GitHub (ils sont créés automatiquement)
- Si vous avez des problèmes, vérifiez toujours les **logs Render** en premier

---

## 🆘 En cas de problème

1. **Vérifiez les logs Render** - ils contiennent tous les détails
2. **Vérifiez que les fichiers sont bien sur GitHub** :
   - Allez sur `https://github.com/THEINA1971/lookup2bz`
   - Vérifiez que `backend.py` contient bien la fonction `get_data_dir()`
3. **Vérifiez que Render est connecté à GitHub** :
   - Dans Render Dashboard → Settings → Connect GitHub
4. **Si rien ne fonctionne** :
   - Faites un "Manual Deploy" dans Render
   - Ou contactez le support Render

