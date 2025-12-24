# Backend Flask - Gestion Complète

Backend complet pour le Panel OSINT avec authentification, gestion des utilisateurs, clés d'accès et bases de données.

## 🚀 Installation

### 1. Installer les dépendances

```bash
pip install -r backend-requirements.txt
```

### 2. Démarrer le serveur

```bash
python backend.py
```

Le serveur démarre sur `http://localhost:5000`

## 📋 Fonctionnalités

### Authentification
- ✅ Inscription d'utilisateurs
- ✅ Connexion avec username/password
- ✅ Tokens JWT pour la sécurité
- ✅ Changement de mot de passe
- ✅ Récupération des informations utilisateur

### Gestion des Clés d'Accès
- ✅ Création de clés avec durées (1h, 1j, 1sem, 1mois, lifetime)
- ✅ Vérification de validité des clés
- ✅ Suppression de clés
- ✅ Liste des clés par utilisateur

### Gestion des Bases de Données
- ✅ Upload de bases de données
- ✅ Liste des bases de données
- ✅ Suppression de bases de données

### Administration
- ✅ Gestion de tous les utilisateurs (admin)
- ✅ Gestion de toutes les clés (admin)

## 🔐 Utilisateur Admin par Défaut

Au premier démarrage, un utilisateur admin est créé automatiquement :

- **Username:** `admin`
- **Password:** `admin123`
- **⚠️ CHANGEZ LE MOT DE PASSE IMMÉDIATEMENT !**

## 📡 API Endpoints

### Authentification

#### POST `/api/auth/register`
Inscription d'un nouvel utilisateur

```json
{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com"
}
```

#### POST `/api/auth/login`
Connexion

```json
{
  "username": "user123",
  "password": "password123"
}
```

Réponse:
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "...",
    "username": "user123",
    "email": "user@example.com"
  }
}
```

#### GET `/api/auth/me`
Récupère les infos de l'utilisateur connecté (nécessite token)

Headers: `Authorization: Bearer <token>`

#### POST `/api/auth/change-password`
Change le mot de passe (nécessite token)

```json
{
  "old_password": "oldpass",
  "new_password": "newpass123"
}
```

### Gestion des Clés

#### GET `/api/keys`
Récupère toutes les clés de l'utilisateur (nécessite token)

#### POST `/api/keys`
Crée une nouvelle clé (nécessite token)

```json
{
  "code": "BH-XXXX-XXXX",
  "duration": "1d"
}
```

#### DELETE `/api/keys/<key_code>`
Supprime une clé (nécessite token)

#### POST `/api/keys/verify`
Vérifie si une clé est valide (public)

```json
{
  "code": "BH-XXXX-XXXX"
}
```

### Gestion des Bases de Données

#### GET `/api/databases`
Récupère toutes les bases de données (nécessite token)

#### POST `/api/databases`
Upload une base de données (nécessite token)

```json
{
  "name": "Database Name",
  "description": "Description",
  "category": "general",
  "content": "file content...",
  "file_name": "data.txt",
  "file_size": 1024
}
```

#### DELETE `/api/databases/<db_id>`
Supprime une base de données (nécessite token)

## 🔒 Sécurité

- **Mots de passe hashés** avec Werkzeug
- **Tokens JWT** pour l'authentification
- **Expiration automatique** des tokens (24h)
- **Validation des clés** avec vérification d'expiration
- **Isolation des données** par utilisateur

## 📁 Structure des Fichiers

```
data/
├── users.json      # Utilisateurs
├── keys.json       # Clés d'accès
├── databases.json  # Bases de données
└── sessions.json   # Sessions (optionnel)
```

## 🔧 Configuration

Variables d'environnement (optionnel):

```bash
export SECRET_KEY="your-secret-key"
export JWT_SECRET_KEY="your-jwt-secret"
export PORT=5000
export DEBUG=True
```

## 📝 Utilisation avec le Frontend

Le fichier `backend-config.js` contient toutes les fonctions pour communiquer avec le backend.

Exemple:

```javascript
// Inscription
const result = await registerUser('username', 'password', 'email@example.com');

// Connexion
const result = await loginUser('username', 'password');

// Créer une clé
const result = await createKey('BH-XXXX-XXXX', '1d');

// Vérifier une clé
const result = await verifyKey('BH-XXXX-XXXX');
```

## 🛡️ Protection des Routes

Toutes les routes (sauf `/api/auth/register`, `/api/auth/login`, `/api/keys/verify`) nécessitent un token JWT dans le header:

```
Authorization: Bearer <token>
```

## ⚠️ Notes Importantes

1. **Changez le mot de passe admin** au premier démarrage
2. **Sécurisez les SECRET_KEY** en production
3. **Utilisez HTTPS** en production
4. **Sauvegardez régulièrement** le dossier `data/`
5. **Ne commitez jamais** les fichiers de données

## 🐛 Dépannage

### Erreur "Token manquant"
- Vérifiez que le token est bien envoyé dans le header `Authorization`
- Vérifiez que le token n'a pas expiré (24h)

### Erreur "Accès non autorisé"
- Vérifiez que vous êtes connecté
- Vérifiez que votre token est valide
- Pour les routes admin, vérifiez que votre rôle est "admin"

### Erreur CORS
- Le backend autorise toutes les origines par défaut
- En production, configurez CORS pour votre domaine uniquement

