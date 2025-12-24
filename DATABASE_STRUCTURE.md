# 📊 Structure de la Base de Données - Lookup2Bz

## Vue d'ensemble

Le système utilise des fichiers JSON pour stocker toutes les données. Tous les fichiers sont situés dans le répertoire `data/`.

---

## 📁 Fichiers de Base de Données

### 1. `data/keys.json` - Base de Données des Clés

**Structure :**
```json
{
  "CODE_DE_LA_CLE": {
    "code": "CODE_DE_LA_CLE",
    "name": "Nom de la clé",
    "created_by": "ID_du_créateur",
    "created_by_email": "email@du.créateur",
    "created_by_username": "username_du_créateur",
    "user_id": "ID_du_créateur",
    "created_at": "2024-12-24T20:00:42.071417+00:00",
    "expires_at": "2024-12-25T20:00:42.071417+00:00" ou "Infinity",
    "duration": "1d" | "1w" | "1m" | "lifetime",
    "status": "active" | "used" | "expired" | "cancelled",
    "is_admin": true | false,
    "used_at": "2024-12-24T21:00:00.000000+00:00" ou null,
    "used_by": "ID_utilisateur_qui_a_utilisé" ou null,
    "used_by_email": "email@utilisateur.com" ou null,
    "usage_count": 0,
    "usage_history": [],
    "permissions": ["admin", "generate_keys", ...] (si clé admin)
  }
}
```

**Champs importants :**
- `status` : 
  - `active` : Clé active et utilisable
  - `used` : Clé déjà utilisée (ne peut plus être utilisée)
  - `expired` : Clé expirée
  - `cancelled` : Clé annulée
- `used_at` : Date d'utilisation (si null, la clé n'a jamais été utilisée)
- `used_by` : ID de l'utilisateur qui a utilisé la clé
- `is_admin` : Si true, la clé peut être réutilisée (mais l'historique est gardé)

**Protection contre la réutilisation :**
- ✅ Vérification du statut `used`
- ✅ Vérification de `used_at`
- ✅ Vérification de `used_by`
- ✅ Mise à jour automatique du statut lors de l'utilisation

---

### 2. `data/users.json` - Base de Données des Utilisateurs

**Structure :**
```json
{
  "username": {
    "id": "ID_unique_utilisateur",
    "username": "username",
    "email": "email@example.com",
    "password_hash": "hash_du_mot_de_passe",
    "created_at": "2024-12-24T20:00:42.070317+00:00",
    "role": "admin" | "user",
    "active": true | false,
    "email_verified": true | false,
    "key_code": "CODE_DE_LA_CLE_UTILISEE",
    "key_used_at": "2024-12-24T21:00:00.000000+00:00",
    "subscription_status": "none" | "active" | "expired" | "cancelled",
    "last_login": "2024-12-24T22:00:00.000000+00:00" ou null,
    "ip_address": "IP_d_inscription"
  }
}
```

**Champs importants :**
- `key_code` : Clé utilisée pour l'inscription
- `key_used_at` : Date d'utilisation de la clé
- `last_login` : Dernière connexion (mis à jour automatiquement)
- `subscription_status` : Statut de l'abonnement

---

### 3. `data/payments.json` - Historique des Paiements

**Structure :**
```json
[
  {
    "id": "ID_paiement",
    "user_id": "ID_utilisateur",
    "plan_id": "basic" | "pro" | "premium",
    "plan_name": "Plan Basic",
    "amount": 9.99,
    "currency": "EUR",
    "crypto_currency": "LTC" (si paiement crypto),
    "status": "pending" | "completed" | "failed",
    "payment_method": "paypal" | "ltc",
    "ltc_address": "LQC5GZ78kxDQkM4mKi4iVTELUL97rGGbHP",
    "transaction_hash": "hash_transaction" (si LTC),
    "created_at": "2024-12-24T20:00:42.071417+00:00",
    "notes": "Description du paiement"
  }
]
```

---

### 4. `data/subscriptions.json` - Abonnements

**Structure :**
```json
{
  "ID_utilisateur": {
    "user_id": "ID_utilisateur",
    "plan_id": "basic" | "pro" | "premium",
    "status": "active" | "expired" | "cancelled",
    "started_at": "2024-12-24T20:00:42.071417+00:00",
    "expires_at": "2025-01-24T20:00:42.071417+00:00",
    "cancelled_at": null ou "date"
  }
}
```

---

### 5. `data/databases.json` - Bases de Données Uploadées

**Structure :**
```json
[
  {
    "id": "ID_base",
    "user_id": "ID_utilisateur",
    "name": "Nom de la base",
    "description": "Description",
    "category": "email" | "phone" | "other",
    "filename": "nom_du_fichier.json",
    "size": 1024,
    "created_at": "2024-12-24T20:00:42.071417+00:00"
  }
]
```

---

## 🔒 Protection contre la Réutilisation des Clés

### Vérifications Effectuées

1. **Statut de la clé** : Vérifie si `status == 'used'`
2. **Date d'utilisation** : Vérifie si `used_at` existe
3. **Utilisateur** : Vérifie si `used_by` existe
4. **Expiration** : Vérifie si la clé est expirée et met à jour le statut

### Processus d'Inscription

1. ✅ Vérification que la clé existe
2. ✅ Vérification que la clé n'est pas expirée
3. ✅ Vérification que la clé n'est pas déjà utilisée (`status != 'used'`)
4. ✅ Création de l'utilisateur avec toutes les informations
5. ✅ Marquage de la clé comme `used` avec `used_at` et `used_by`
6. ✅ Sauvegarde dans `users.json` et `keys.json`

---

## 💾 Sauvegarde Automatique

### Fonction `save_json()`

- ✅ Sauvegarde atomique (via fichier temporaire)
- ✅ Gestion d'erreurs avec fallback
- ✅ Création automatique des répertoires
- ✅ Logs de confirmation

### Points de Sauvegarde

1. **Création de clé** : Sauvegarde immédiate dans `keys.json`
2. **Inscription** : Sauvegarde dans `users.json` ET `keys.json`
3. **Connexion** : Mise à jour de `last_login` dans `users.json`
4. **Paiement** : Sauvegarde dans `payments.json`
5. **Abonnement** : Sauvegarde dans `subscriptions.json`

---

## 📋 Informations Stockées pour Chaque Clé

- ✅ Code de la clé
- ✅ Nom de la clé
- ✅ Créateur (ID, email, username)
- ✅ Date de création
- ✅ Date d'expiration
- ✅ Durée de validité
- ✅ Statut (active/used/expired)
- ✅ Si c'est une clé admin
- ✅ Date d'utilisation (si utilisée)
- ✅ Utilisateur qui l'a utilisée (ID, email)
- ✅ Historique d'utilisation (pour clés admin)

---

## 📋 Informations Stockées pour Chaque Utilisateur

- ✅ ID unique
- ✅ Username
- ✅ Email
- ✅ Hash du mot de passe
- ✅ Rôle (admin/user)
- ✅ Date de création
- ✅ Clé utilisée pour l'inscription
- ✅ Date d'utilisation de la clé
- ✅ Statut d'abonnement
- ✅ Dernière connexion
- ✅ IP d'inscription
- ✅ Statut actif/inactif
- ✅ Email vérifié ou non

---

## ✅ Garanties

1. **Clés non réutilisables** : Une fois utilisée, une clé ne peut plus être utilisée (sauf clés admin)
2. **Tout est stocké** : Toutes les informations sont sauvegardées dans les fichiers JSON
3. **Statuts à jour** : Les statuts sont mis à jour automatiquement
4. **Traçabilité complète** : On peut voir qui a créé quelle clé, qui l'a utilisée, quand, etc.

---

## 🔍 Vérification

Pour vérifier qu'une clé est bien stockée :
```bash
cat data/keys.json | grep "CODE_DE_LA_CLE"
```

Pour vérifier qu'un utilisateur est bien stocké :
```bash
cat data/users.json | grep "email@example.com"
```

---

*Dernière mise à jour : Décembre 2024*

