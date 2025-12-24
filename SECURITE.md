# 🔒 Protection Anti-DDoS et Sécurité

Ce document décrit les mesures de sécurité implémentées dans le backend pour protéger contre les attaques DDoS et autres cyberattaques.

## 🛡️ Protections Implémentées

### 1. Rate Limiting (Limitation du Taux de Requêtes)

- **Limite globale** : 200 requêtes par heure, 50 par minute par IP
- **Route de connexion** : 5 tentatives par minute
- **Route d'inscription** : 3 inscriptions par heure par IP
- **Route API BreachHub** : 30 requêtes par minute (nécessite authentification)

### 2. Protection Anti-Force Brute

- **Limite d'échecs** : 5 tentatives de connexion échouées
- **Durée de blocage** : 1 heure après 5 échecs
- **Suivi automatique** : Les tentatives sont enregistrées et analysées

### 3. Validation des Entrées

- **Validation d'email** : Format strict avec regex
- **Validation de mot de passe** : Longueur minimale de 8 caractères, maximum 500
- **Protection contre les injections** : Détection de patterns SQL, JavaScript, etc.
- **Limitation de taille** : Maximum 16MB par requête

### 4. Headers de Sécurité

- **Strict-Transport-Security** : Force HTTPS en production
- **Content-Security-Policy** : Restriction des ressources externes
- **Referrer-Policy** : Contrôle des informations de référent
- **Feature-Policy** : Désactivation de fonctionnalités sensibles (géolocalisation, caméra, etc.)

### 5. Blocage d'IP

- **Détection automatique** : Blocage après trop de tentatives suspectes
- **Durée variable** : Blocage temporaire ou permanent selon la gravité
- **Logging** : Toutes les tentatives suspectes sont enregistrées

### 6. Protection des Routes API

- **Authentification requise** : Toutes les routes API nécessitent un token JWT valide
- **Validation des endpoints** : Vérification du format et des caractères autorisés
- **Limitation des paramètres** : Maximum 20 paramètres par requête
- **Timeout réduit** : 20 secondes maximum pour les requêtes externes

### 7. Logging des Attaques

- **Fichier de logs** : `data/attack_log.json`
- **Informations enregistrées** :
  - IP source
  - Type d'attaque
  - Détails de la tentative
  - User-Agent
  - Timestamp
  - Chemin de la requête

## 📦 Installation des Dépendances

Installez les nouvelles dépendances de sécurité :

```bash
pip install -r backend-requirements.txt
```

Les packages ajoutés :
- `Flask-Limiter==3.5.0` : Rate limiting
- `flask-talisman==1.1.0` : Headers de sécurité

## ⚙️ Configuration

### Variables d'Environnement

```env
# Clés de sécurité (générées automatiquement si non définies)
SECRET_KEY=votre_cle_secrete_32_caracteres
JWT_SECRET_KEY=votre_cle_jwt_32_caracteres

# Origines CORS autorisées (séparées par des virgules)
ALLOWED_ORIGINS=https://votre-site.com,https://www.votre-site.com
```

### Ajustement des Limites

Pour modifier les limites de rate limiting, éditez `backend.py` :

```python
# Limite globale
limiter = Limiter(
    app=app,
    default_limits=["200 per hour", "50 per minute"],
)

# Limite spécifique sur une route
@limiter.limit("5 per minute")
def login():
    ...
```

### Ajustement de la Protection Anti-Force Brute

```python
# Nombre de tentatives avant blocage
FAILED_LOGIN_LIMIT = 5

# Durée du blocage en secondes
BLOCK_DURATION = 3600  # 1 heure
```

## 📊 Monitoring

### Consulter les Logs d'Attaques

Les logs sont stockés dans `data/attack_log.json` :

```python
import json

with open('data/attack_log.json', 'r') as f:
    logs = json.load(f)
    
# Voir les IPs suspectes
for ip, entries in logs.items():
    print(f"IP: {ip}, Tentatives: {len(entries)}")
```

### Consulter les IPs Bloquées

```python
import json

with open('data/blocked_ips.json', 'r') as f:
    blocked = json.load(f)
    
# Voir les IPs actuellement bloquées
for ip, info in blocked.items():
    print(f"IP: {ip}, Bloquée jusqu'à: {info['until']}")
```

## 🚨 Types d'Attaques Détectées

1. **Brute Force** : Tentatives répétées de connexion
2. **Oversized Requests** : Requêtes trop volumineuses
3. **Invalid Input** : Entrées mal formatées ou suspectes
4. **Header Manipulation** : Tentatives de manipulation des headers
5. **Suspicious User-Agent** : User-Agents suspects (bots, scanners)
6. **Too Many Parameters** : Trop de paramètres dans une requête
7. **Invalid Endpoint** : Endpoints mal formés ou suspects

## 🔧 Dépannage

### Problème : Trop de faux positifs

Si des utilisateurs légitimes sont bloqués :

1. Augmentez `FAILED_LOGIN_LIMIT` (par exemple, à 10)
2. Réduisez `BLOCK_DURATION` (par exemple, à 1800 secondes = 30 minutes)
3. Vérifiez les logs pour identifier les patterns

### Problème : Rate limiting trop strict

Si les utilisateurs légitimes atteignent les limites :

1. Augmentez les limites dans `limiter = Limiter(...)`
2. Ajustez les limites spécifiques sur les routes critiques

### Débloquer une IP manuellement

```python
import json
from datetime import datetime, timezone

# Charger les IPs bloquées
with open('data/blocked_ips.json', 'r') as f:
    blocked = json.load(f)

# Débloquer une IP
ip_to_unblock = "192.168.1.100"
if ip_to_unblock in blocked:
    del blocked[ip_to_unblock]
    
# Sauvegarder
with open('data/blocked_ips.json', 'w') as f:
    json.dump(blocked, f, indent=2)
```

## 📝 Notes Importantes

1. **En Production** : Activez HTTPS et configurez `force_https=True` dans Talisman
2. **Monitoring** : Surveillez régulièrement les logs d'attaques
3. **Mises à jour** : Gardez les dépendances à jour pour les dernières corrections de sécurité
4. **Backup** : Sauvegardez régulièrement les fichiers de données et de logs

## 🎯 Recommandations Supplémentaires

Pour une protection encore plus robuste :

1. **Utiliser un WAF** (Web Application Firewall) comme Cloudflare
2. **Implémenter un CAPTCHA** sur les routes d'authentification
3. **Utiliser Redis** pour le rate limiting distribué (si plusieurs serveurs)
4. **Activer les logs d'accès** du serveur web (Nginx, Apache)
5. **Mettre en place un système d'alerte** pour les attaques importantes

