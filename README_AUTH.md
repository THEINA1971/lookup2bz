# Guide d'Authentification - FULLLOOKUP

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend

```bash
cd Api-check-bkz-main
python backend.py
```

Le serveur démarre sur `http://localhost:5000`

### 2. Ouvrir la Page d'Inscription

**IMPORTANT** : Ne pas ouvrir directement le fichier HTML avec `file://`

Utilisez un serveur HTTP local :

#### Option A : Python (recommandé)
```bash
# Dans le dossier Api-check-bkz-main
python -m http.server 8000
```
Puis ouvrez : `http://localhost:8000/register.html`

#### Option B : Node.js (si installé)
```bash
npx http-server -p 8000
```
Puis ouvrez : `http://localhost:8000/register.html`

#### Option C : Extension VS Code
Installez l'extension "Live Server" et cliquez sur "Go Live"

### 3. Processus d'Inscription

1. **Étape 1** : Entrez votre email
2. **Étape 2** : Un code de vérification est généré (affiché dans la console du backend et dans une alerte)
3. **Étape 3** : Entrez le code reçu
4. **Étape 4** : Créez votre compte avec mot de passe et clé d'accès

### 4. Connexion

Après l'inscription, vous pouvez vous connecter avec :
- **Email** : votre adresse email
- **Mot de passe** : le mot de passe que vous avez créé

## 🔧 Dépannage

### Erreur "Impossible de se connecter au serveur"

1. Vérifiez que le backend est démarré :
   ```bash
   python backend.py
   ```
   Vous devriez voir : `🚀 Serveur Backend démarré sur http://localhost:5000`

2. Vérifiez que vous ouvrez la page via `http://localhost:8000` et non `file://`

3. Ouvrez la console du navigateur (F12) pour voir les logs de débogage

4. Testez le backend directement :
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET
   ```

### Le code de vérification n'apparaît pas

En développement, le code est :
- Affiché dans la console du backend (terminal)
- Affiché dans une alerte sur la page
- Loggé dans la console du navigateur (F12)

En production, il sera envoyé par email.

## 📝 Notes

- Les utilisateurs normaux n'ont accès qu'aux recherches API
- Les onglets "Clés d'accès" et "Upload" sont masqués pour les utilisateurs
- Seuls les admins peuvent gérer les clés et uploader des bases de données

