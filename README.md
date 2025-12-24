# 🔍 Lookup2Bz - OSINT Platform

Plateforme OSINT moderne et sécurisée pour la recherche d'informations.

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** avec JWT
- 🔑 **Gestion des clés API** pour les administrateurs
- 💳 **Système de paiement** (PayPal & Litecoin)
- 🛡️ **Protection anti-DDoS** et sécurité renforcée
- 🎨 **Interface moderne** avec thème rouge/noir
- 📊 **Multiples APIs OSINT** intégrées

## 🚀 Déploiement Rapide

### Sur Render (Recommandé)

Consultez le guide complet : [DEPLOIEMENT_RENDER.md](./DEPLOIEMENT_RENDER.md)

### Étapes rapides :

1. **Pousser sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
   git push -u origin main
   ```

2. **Déployer sur Render**
   - Backend : Web Service Python avec Gunicorn
   - Frontend : Static Site
   - Voir [DEPLOIEMENT_RENDER.md](./DEPLOIEMENT_RENDER.md) pour les détails

## 🛠️ Installation Locale

### Prérequis

- Python 3.11+
- pip

### Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
   cd Api-check-bkz-main
   ```

2. **Installer les dépendances backend**
   ```bash
   pip install -r backend-requirements.txt
   ```

3. **Créer les dossiers de données**
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

4. **Démarrer le backend**
   ```bash
   python backend.py
   ```
   Ou utilisez les scripts :
   - Windows : `start-backend.bat` ou `start-backend.ps1`
   - Linux/Mac : `python backend.py`

5. **Démarrer le frontend**
   ```bash
   python -m http.server 8000
   ```
   Ou utilisez les scripts :
   - Windows : `start-frontend.bat` ou `start-frontend.ps1`

6. **Accéder au site**
   - Frontend : http://localhost:8000
   - Backend : http://localhost:5000

## 🔐 Compte Admin par défaut

Lors du premier démarrage, un compte admin est créé automatiquement. Les identifiants sont affichés dans la console.

## 📁 Structure du Projet

```
Api-check-bkz-main/
├── backend.py              # Serveur Flask backend
├── backend-requirements.txt # Dépendances Python
├── index.html              # Page principale
├── login.html              # Page de connexion
├── register.html           # Page d'inscription
├── payment.html            # Page de paiement
├── admin-styles.css        # Styles CSS
├── admin-script.js         # Scripts JavaScript
├── config.js               # Configuration environnement
├── data/                   # Données (JSON)
│   ├── users.json
│   ├── keys.json
│   └── ...
├── render.yaml             # Configuration Render
└── .gitignore              # Fichiers ignorés par Git
```

## 🔒 Sécurité

- Rate limiting sur toutes les routes
- Protection anti-force brute
- Headers de sécurité HTTP
- Validation des entrées
- Logging des attaques

Voir [SECURITE.md](./SECURITE.md) pour plus de détails.

## 📝 Configuration

### Variables d'environnement

- `SECRET_KEY` : Clé secrète Flask
- `JWT_SECRET_KEY` : Clé pour les tokens JWT
- `ALLOWED_ORIGINS` : Origines CORS autorisées
- `SMTP_ENABLED` : Activer l'envoi d'emails
- `PORT` : Port du serveur (défaut: 5000)

## 🌐 Hébergement

### Render
Guide complet : [DEPLOIEMENT_RENDER.md](./DEPLOIEMENT_RENDER.md)

### Autres plateformes
- Vercel (Frontend)
- Railway (Backend)
- Fly.io (Full stack)

## 📄 Licence

Ce projet est privé et propriétaire.

## 🆘 Support

Pour toute question ou problème, consultez la documentation ou créez une issue sur GitHub.

---

**Développé avec ❤️ pour la communauté OSINT**
