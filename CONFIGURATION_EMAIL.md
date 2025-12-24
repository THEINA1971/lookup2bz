# Configuration de l'Envoi d'Emails

## 📧 Activer l'Envoi d'Emails

Par défaut, l'envoi d'emails est **désactivé** en mode développement. Le code de vérification est affiché dans la console du backend.

Pour activer l'envoi d'emails réels, suivez ces étapes :

## 🔧 Configuration avec Gmail (Recommandé pour débuter)

### 1. Créer un mot de passe d'application Gmail

1. Allez sur votre compte Google : https://myaccount.google.com/
2. Activez la **validation en 2 étapes** si ce n'est pas déjà fait
3. Allez dans **Sécurité** → **Mots de passe des applications**
4. Créez un nouveau mot de passe d'application pour "Mail"
5. Copiez le mot de passe généré (16 caractères)

### 2. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `Api-check-bkz-main` :

```env
SMTP_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_application_16_caracteres
SMTP_FROM_EMAIL=votre_email@gmail.com
SMTP_FROM_NAME=FULLLOOKUP OSINT Platform
```

### 3. Redémarrer le backend

```bash
python backend.py
```

## 📮 Autres Services Email

### SendGrid (Gratuit jusqu'à 100 emails/jour)

```env
SMTP_ENABLED=true
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=votre_api_key_sendgrid
SMTP_FROM_EMAIL=noreply@votredomaine.com
SMTP_FROM_NAME=FULLLOOKUP OSINT Platform
```

### Mailgun (Gratuit jusqu'à 5000 emails/mois)

```env
SMTP_ENABLED=true
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@votredomaine.mailgun.org
SMTP_PASSWORD=votre_mot_de_passe_mailgun
SMTP_FROM_EMAIL=noreply@votredomaine.com
SMTP_FROM_NAME=FULLLOOKUP OSINT Platform
```

### Outlook/Hotmail

```env
SMTP_ENABLED=true
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=votre_email@outlook.com
SMTP_PASSWORD=votre_mot_de_passe
SMTP_FROM_EMAIL=votre_email@outlook.com
SMTP_FROM_NAME=FULLLOOKUP OSINT Platform
```

## ⚠️ Mode Développement

Si `SMTP_ENABLED=false` ou si les identifiants ne sont pas configurés :
- Le code de vérification est affiché dans la **console du backend**
- Le code est aussi retourné dans la réponse API (visible dans l'alerte)
- Aucun email n'est envoyé

## 🔒 Sécurité

⚠️ **NE COMMITEZ JAMAIS** le fichier `.env` dans Git !

Ajoutez `.env` à votre `.gitignore` :

```
.env
data/
*.pyc
__pycache__/
```

## ✅ Test

Pour tester l'envoi d'email :

1. Configurez les variables d'environnement
2. Redémarrez le backend
3. Essayez de créer un compte
4. Vérifiez votre boîte de réception (et les spams)

Si l'envoi échoue, le code sera toujours affiché dans la console en mode fallback.

