#!/usr/bin/env python3
"""
Backend Flask pour le Panel OSINT - Gestion complète
"""

from flask import Flask, request, jsonify, session, g, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import RequestEntityTooLarge
from datetime import datetime, timedelta, timezone
import secrets
import json
import os
import re
import time
from functools import wraps
import jwt
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman

app = Flask(__name__, static_folder='.', static_url_path='')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
app.config['REQUEST_TIMEOUT'] = 30  # 30 secondes

# Configuration CORS pour production
# Récupérer les origines autorisées depuis les variables d'environnement
allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
CORS(app, supports_credentials=True, origins=allowed_origins)

# ==================== PROTECTION ANTI-DDOS ET SÉCURITÉ ====================

# Rate Limiting avec Flask-Limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per hour", "50 per minute"],
    storage_uri="memory://",
    strategy="fixed-window"
)

# Headers de sécurité avec Flask-Talisman
Talisman(app, 
    force_https=os.getenv('FORCE_HTTPS', 'False').lower() == 'true',  # Activé en production via variable d'environnement
    strict_transport_security=True,
    strict_transport_security_max_age=31536000,
    content_security_policy={
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.tailwindcss.com",
        'style-src': "'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
        'font-src': "'self' https://fonts.gstatic.com",
        'img-src': "'self' data:",
        'connect-src': "'self' http://localhost:5000 https://api.coingecko.com",
    },
    referrer_policy='strict-origin-when-cross-origin',
    feature_policy={
        'geolocation': "'none'",
        'camera': "'none'",
        'microphone': "'none'"
    }
)

# Headers de sécurité supplémentaires
@app.after_request
def set_security_headers(response):
    """Ajoute des headers de sécurité supplémentaires"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    return response

# Déterminer le répertoire de base (répertoire du script)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Fonction pour obtenir le répertoire de données (avec fallback)
def get_data_dir():
    """Retourne le répertoire de données, en créant un fallback si nécessaire"""
    data_dir = os.path.join(BASE_DIR, 'data')
    try:
        os.makedirs(data_dir, exist_ok=True)
        # Tester si on peut écrire dans ce répertoire
        test_file = os.path.join(data_dir, '.test_write')
        try:
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            return data_dir
        except:
            # Si on ne peut pas écrire, utiliser un répertoire temporaire
            import tempfile
            fallback_dir = os.path.join(tempfile.gettempdir(), 'lookup2bz_data')
            os.makedirs(fallback_dir, exist_ok=True)
            print(f"[WARNING] Utilisation du répertoire temporaire: {fallback_dir}")
            return fallback_dir
    except Exception as e:
        print(f"[WARNING] Impossible de créer DATA_DIR: {e}")
        # En dernier recours, utiliser un répertoire temporaire
        import tempfile
        fallback_dir = os.path.join(tempfile.gettempdir(), 'lookup2bz_data')
        os.makedirs(fallback_dir, exist_ok=True)
        print(f"[WARNING] Utilisation du répertoire temporaire: {fallback_dir}")
        return fallback_dir

# Initialiser DATA_DIR
DATA_DIR = get_data_dir()

# Fichier pour stocker les tentatives de connexion suspectes
# Utiliser des chemins absolus pour éviter les problèmes
ATTACK_LOG_FILE = os.path.join(DATA_DIR, 'attack_log.json')
BLOCKED_IPS_FILE = os.path.join(DATA_DIR, 'blocked_ips.json')

# Vérification de sécurité : s'assurer que les chemins sont absolus
if not os.path.isabs(ATTACK_LOG_FILE):
    ATTACK_LOG_FILE = os.path.abspath(ATTACK_LOG_FILE)
if not os.path.isabs(BLOCKED_IPS_FILE):
    BLOCKED_IPS_FILE = os.path.abspath(BLOCKED_IPS_FILE)

def init_security_files():
    """Initialise les fichiers de sécurité"""
    # Afficher les chemins pour le débogage
    print(f"[INIT] BASE_DIR: {BASE_DIR}")
    print(f"[INIT] DATA_DIR: {DATA_DIR}")
    print(f"[INIT] ATTACK_LOG_FILE: {ATTACK_LOG_FILE}")
    print(f"[INIT] BLOCKED_IPS_FILE: {BLOCKED_IPS_FILE}")
    
    try:
        # S'assurer que le répertoire existe (déjà créé par get_data_dir, mais on vérifie)
        if not os.path.exists(DATA_DIR):
            print(f"[INIT] Création du répertoire DATA_DIR: {DATA_DIR}")
            os.makedirs(DATA_DIR, exist_ok=True)
        
        # Vérifier que le répertoire existe maintenant
        if not os.path.exists(DATA_DIR):
            raise OSError(f"Impossible de créer le répertoire: {DATA_DIR}")
        
        print(f"[INIT] DATA_DIR existe: {os.path.exists(DATA_DIR)}")
        
        # S'assurer que le répertoire parent du fichier existe
        attack_log_dir = os.path.dirname(ATTACK_LOG_FILE)
        if attack_log_dir and not os.path.exists(attack_log_dir):
            print(f"[INIT] Création du répertoire parent: {attack_log_dir}")
            os.makedirs(attack_log_dir, exist_ok=True)
        
        blocked_ips_dir = os.path.dirname(BLOCKED_IPS_FILE)
        if blocked_ips_dir and not os.path.exists(blocked_ips_dir):
            print(f"[INIT] Création du répertoire parent: {blocked_ips_dir}")
            os.makedirs(blocked_ips_dir, exist_ok=True)
        
        # Créer les fichiers s'ils n'existent pas
        if not os.path.exists(ATTACK_LOG_FILE):
            print(f"[INIT] Création de {ATTACK_LOG_FILE}")
            with open(ATTACK_LOG_FILE, 'w') as f:
                json.dump({}, f)
            print(f"[INIT] {ATTACK_LOG_FILE} créé avec succès")
        else:
            print(f"[INIT] {ATTACK_LOG_FILE} existe déjà")
                
        if not os.path.exists(BLOCKED_IPS_FILE):
            print(f"[INIT] Création de {BLOCKED_IPS_FILE}")
            with open(BLOCKED_IPS_FILE, 'w') as f:
                json.dump({}, f)
            print(f"[INIT] {BLOCKED_IPS_FILE} créé avec succès")
        else:
            print(f"[INIT] {BLOCKED_IPS_FILE} existe déjà")
                
    except Exception as e:
        print(f"[ERROR] Erreur lors de l'initialisation des fichiers de sécurité: {e}")
        print(f"[ERROR] BASE_DIR: {BASE_DIR}")
        print(f"[ERROR] DATA_DIR: {DATA_DIR}")
        print(f"[ERROR] DATA_DIR existe: {os.path.exists(DATA_DIR)}")
        print(f"[ERROR] Répertoire de travail: {os.getcwd()}")
        import traceback
        print(traceback.format_exc())
        raise

init_security_files()

# Protection contre les attaques par force brute
FAILED_LOGIN_LIMIT = 5  # Nombre de tentatives échouées avant blocage
BLOCK_DURATION = 3600  # Durée du blocage en secondes (1 heure)

def get_client_ip():
    """Récupère l'IP réelle du client"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

def log_attack(ip, attack_type, details):
    """Enregistre une tentative d'attaque"""
    try:
        logs = load_json(ATTACK_LOG_FILE)
        timestamp = datetime.now(timezone.utc).isoformat()
        
        if ip not in logs:
            logs[ip] = []
        
        logs[ip].append({
            'timestamp': timestamp,
            'type': attack_type,
            'details': details,
            'user_agent': request.headers.get('User-Agent', 'Unknown'),
            'path': request.path
        })
        
        # Garder seulement les 100 dernières entrées par IP
        if len(logs[ip]) > 100:
            logs[ip] = logs[ip][-100:]
        
        save_json(ATTACK_LOG_FILE, logs)
    except Exception as e:
        print(f"Erreur lors de l'enregistrement de l'attaque: {e}")

def is_ip_blocked(ip):
    """Vérifie si une IP est bloquée"""
    blocked = load_json(BLOCKED_IPS_FILE)
    if ip in blocked:
        block_until = datetime.fromisoformat(blocked[ip]['until'])
        if datetime.now(timezone.utc) < block_until:
            return True
        else:
            # Débloquer si la période est expirée
            del blocked[ip]
            save_json(BLOCKED_IPS_FILE, blocked)
    return False

def block_ip(ip, duration=BLOCK_DURATION):
    """Bloque une IP pour une durée donnée"""
    blocked = load_json(BLOCKED_IPS_FILE)
    blocked[ip] = {
        'blocked_at': datetime.now(timezone.utc).isoformat(),
        'until': (datetime.now(timezone.utc) + timedelta(seconds=duration)).isoformat(),
        'reason': 'Too many failed login attempts'
    }
    save_json(BLOCKED_IPS_FILE, blocked)
    print(f"⚠️ IP {ip} bloquée pour {duration} secondes")

def check_failed_logins(ip):
    """Vérifie le nombre de tentatives de connexion échouées"""
    logs = load_json(ATTACK_LOG_FILE)
    if ip not in logs:
        return 0
    
    # Compter les échecs de connexion dans la dernière heure
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    failed_count = sum(1 for entry in logs[ip] 
                      if entry.get('type') == 'failed_login' 
                      and datetime.fromisoformat(entry['timestamp']) > one_hour_ago)
    
    return failed_count

def validate_input(data, field_name, max_length=1000, pattern=None):
    """Valide les entrées utilisateur"""
    if not data:
        return False, f"{field_name} est requis"
    
    if len(data) > max_length:
        return False, f"{field_name} est trop long (max {max_length} caractères)"
    
    if pattern and not re.match(pattern, data):
        return False, f"{field_name} contient des caractères invalides"
    
    # Protection contre les injections SQL basiques
    dangerous_patterns = [
        r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)',
        r'[<>"\']',
        r'javascript:',
        r'on\w+\s*=',
    ]
    
    for pattern_check in dangerous_patterns:
        if re.search(pattern_check, data, re.IGNORECASE):
            return False, f"{field_name} contient des caractères suspects"
    
    return True, None

# Middleware pour vérifier les IPs bloquées
@app.before_request
def check_blocked_ip():
    """Vérifie si l'IP est bloquée avant chaque requête"""
    ip = get_client_ip()
    
    if is_ip_blocked(ip):
        log_attack(ip, 'blocked_ip_access', 'Tentative d\'accès depuis IP bloquée')
        return jsonify({
            'error': 'Accès refusé',
            'message': 'Votre IP est temporairement bloquée pour cause de tentatives suspectes'
        }), 403
    
    # Vérifier la taille de la requête
    if request.content_length and request.content_length > app.config['MAX_CONTENT_LENGTH']:
        log_attack(ip, 'oversized_request', f'Requête trop volumineuse: {request.content_length} bytes')
        return jsonify({
            'error': 'Requête trop volumineuse',
            'message': 'La taille de la requête dépasse la limite autorisée'
        }), 413

# Protection contre les requêtes malveillantes
@app.before_request
def validate_request():
    """Valide la structure de la requête"""
    ip = get_client_ip()
    
    # Vérifier le User-Agent suspect
    user_agent = request.headers.get('User-Agent', '')
    suspicious_agents = ['curl', 'wget', 'python-requests', 'scanner', 'bot']
    if any(agent in user_agent.lower() for agent in suspicious_agents):
        # Autoriser mais logger
        log_attack(ip, 'suspicious_user_agent', f'User-Agent suspect: {user_agent}')
    
    # Vérifier les headers suspects
    if request.headers.get('X-Forwarded-Host') and request.headers.get('X-Forwarded-Host') != request.host:
        log_attack(ip, 'header_manipulation', 'Tentative de manipulation des headers')
        return jsonify({'error': 'Requête invalide'}), 400

# Fichiers de stockage (simulation de base de données)
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
KEYS_FILE = os.path.join(DATA_DIR, 'keys.json')
DATABASES_FILE = os.path.join(DATA_DIR, 'databases.json')
SESSIONS_FILE = os.path.join(DATA_DIR, 'sessions.json')
VERIFICATION_CODES_FILE = os.path.join(DATA_DIR, 'verification_codes.json')
PAYMENTS_FILE = os.path.join(DATA_DIR, 'payments.json')
SUBSCRIPTIONS_FILE = os.path.join(DATA_DIR, 'subscriptions.json')

# Initialiser les fichiers s'ils n'existent pas
def init_files():
    try:
        # S'assurer que le répertoire data existe (déjà créé par get_data_dir)
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR, exist_ok=True)
        
        if not os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'w') as f:
                json.dump({}, f)
        
        if not os.path.exists(KEYS_FILE):
            with open(KEYS_FILE, 'w') as f:
                json.dump({}, f)
        
        if not os.path.exists(DATABASES_FILE):
            with open(DATABASES_FILE, 'w') as f:
                json.dump([], f)
        
        if not os.path.exists(SESSIONS_FILE):
            with open(SESSIONS_FILE, 'w') as f:
                json.dump({}, f)
        
        if not os.path.exists(VERIFICATION_CODES_FILE):
            with open(VERIFICATION_CODES_FILE, 'w') as f:
                json.dump({}, f)
        
        if not os.path.exists(PAYMENTS_FILE):
            with open(PAYMENTS_FILE, 'w') as f:
                json.dump([], f)
        
        if not os.path.exists(SUBSCRIPTIONS_FILE):
            with open(SUBSCRIPTIONS_FILE, 'w') as f:
                json.dump({}, f)
    except Exception as e:
        print(f"Erreur lors de l'initialisation des fichiers: {e}")
        print(f"BASE_DIR: {BASE_DIR}")
        print(f"DATA_DIR: {DATA_DIR}")
        import traceback
        print(traceback.format_exc())
        raise

init_files()

# Fonctions utilitaires
def load_json(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {} if 'keys' in filepath or 'users' in filepath else []

def save_json(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def generate_token(user_id):
    """Génère un token JWT"""
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    """Vérifie un token JWT"""
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except:
        return None

# Décorateur pour protéger les routes
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except:
                pass
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Token invalide ou expiré'}), 401
        
        request.current_user_id = user_id
        return f(*args, **kwargs)
    
    return decorated

# ==================== CONFIGURATION EMAIL ====================

# Configuration pour l'envoi d'emails
SMTP_ENABLED = os.getenv('SMTP_ENABLED', 'false').lower() == 'true'
SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
SMTP_FROM_EMAIL = os.getenv('SMTP_FROM_EMAIL', SMTP_USER)
SMTP_FROM_NAME = os.getenv('SMTP_FROM_NAME', 'FULLLOOKUP OSINT Platform')

def send_verification_email(email, code):
    """Envoie un email de vérification"""
    if not SMTP_ENABLED or not SMTP_USER or not SMTP_PASSWORD:
        # Mode développement : ne pas envoyer d'email
        print(f"🔐 [DEV] Code de vérification pour {email}: {code}")
        print(f"⚠️  [DEV] L'envoi d'email est désactivé. Activez SMTP_ENABLED=true dans .env")
        return False
    
    try:
        # Créer le message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Code de vérification FULLLOOKUP'
        msg['From'] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        msg['To'] = email
        
        # Corps du message en HTML
        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 2px solid #ef4444; border-radius: 12px; padding: 30px;">
              <h1 style="color: #ef4444; text-align: center; margin-bottom: 20px;">FULLLOOKUP</h1>
              <h2 style="color: #ffffff; margin-bottom: 20px;">Code de vérification</h2>
              <p style="color: #888888; margin-bottom: 30px;">Votre code de vérification pour créer votre compte :</p>
              <div style="background-color: #1a1a1a; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <p style="font-size: 32px; font-weight: bold; color: #ef4444; letter-spacing: 5px; margin: 0;">{code}</p>
              </div>
              <p style="color: #888888; font-size: 12px; margin-top: 30px;">Ce code expire dans 10 minutes.</p>
              <p style="color: #888888; font-size: 12px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            </div>
          </body>
        </html>
        """
        
        # Corps du message en texte brut
        text_body = f"""
FULLLOOKUP - Code de vérification

Votre code de vérification pour créer votre compte :

{code}

Ce code expire dans 10 minutes.

Si vous n'avez pas demandé ce code, ignorez cet email.
        """
        
        # Attacher les deux versions
        msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))
        
        # Envoyer l'email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✅ Email de vérification envoyé à {email}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi de l'email à {email}: {str(e)}")
        # En cas d'erreur, afficher le code dans la console (mode développement)
        print(f"🔐 [FALLBACK] Code de vérification pour {email}: {code}")
        return False

# ==================== ROUTES AUTHENTIFICATION ====================

@app.route('/api/auth/send-verification', methods=['POST'])
def send_verification():
    """Envoie un code de vérification par email"""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    
    if not email or '@' not in email:
        return jsonify({'error': 'Adresse email invalide'}), 400
    
    # Vérifier si l'email est déjà utilisé
    users = load_json(USERS_FILE)
    for username, user in users.items():
        if user.get('email', '').lower() == email:
            return jsonify({'error': 'Cet email est déjà utilisé'}), 400
    
    # Générer un code de vérification (6 chiffres)
    verification_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # Stocker le code avec expiration (10 minutes)
    verification_codes = load_json(VERIFICATION_CODES_FILE)
    verification_codes[email] = {
        'code': verification_code,
        'expires_at': (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    save_json(VERIFICATION_CODES_FILE, verification_codes)
    
    # Envoyer l'email de vérification
    email_sent = send_verification_email(email, verification_code)
    
    response_data = {
        'success': True,
        'message': 'Code de vérification envoyé' if email_sent else 'Code de vérification généré (mode développement)',
    }
    
    # En mode développement, retourner aussi le code (à retirer en production)
    if not email_sent:
        response_data['code'] = verification_code
        response_data['dev_mode'] = True
    
    return jsonify(response_data), 200

@app.route('/api/auth/verify-email', methods=['POST'])
def verify_email():
    """Vérifie le code de vérification email"""
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    code = data.get('code', '').strip()
    
    if not email or not code:
        return jsonify({'error': 'Email et code requis'}), 400
    
    verification_codes = load_json(VERIFICATION_CODES_FILE)
    
    if email not in verification_codes:
        return jsonify({'error': 'Code de vérification non trouvé ou expiré'}), 400
    
    code_data = verification_codes[email]
    
    # Vérifier l'expiration
    expires_at = datetime.fromisoformat(code_data['expires_at'])
    if datetime.now(timezone.utc) > expires_at:
        del verification_codes[email]
        save_json(VERIFICATION_CODES_FILE, verification_codes)
        return jsonify({'error': 'Code de vérification expiré'}), 400
    
    # Vérifier le code
    if code_data['code'] != code:
        return jsonify({'error': 'Code de vérification incorrect'}), 400
    
    # Marquer l'email comme vérifié
    code_data['verified'] = True
    code_data['verified_at'] = datetime.now(timezone.utc).isoformat()
    save_json(VERIFICATION_CODES_FILE, verification_codes)
    
    return jsonify({
        'success': True,
        'message': 'Email vérifié avec succès'
    }), 200

@app.route('/api/auth/register', methods=['POST'])
@limiter.limit("3 per hour")  # Max 3 inscriptions par heure par IP
def register():
    """Inscription d'un nouvel utilisateur avec email, mot de passe et clé"""
    ip = get_client_ip()
    data = request.get_json()
    
    email = data.get('email', '').strip().lower() if data else ''
    password = data.get('password', '').strip() if data else ''
    key_code = data.get('key', '').strip() if data else ''
    
    if not email or not password or not key_code:
        log_attack(ip, 'invalid_register_attempt', 'Champs manquants')
        return jsonify({'error': 'Email, mot de passe et clé requis'}), 400
    
    # Validation de l'email
    is_valid, error_msg = validate_input(email, 'Email', max_length=255, pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    if not is_valid:
        log_attack(ip, 'invalid_email_format', email)
        return jsonify({'error': error_msg}), 400
    
    # Validation du mot de passe
    if len(password) < 8:
        log_attack(ip, 'weak_password', 'Mot de passe trop court')
        return jsonify({'error': 'Le mot de passe doit contenir au moins 8 caractères'}), 400
    
    if len(password) > 500:
        log_attack(ip, 'oversized_password', 'Mot de passe trop long')
        return jsonify({'error': 'Le mot de passe est trop long'}), 400
    
    is_valid, error_msg = validate_input(password, 'Password', max_length=500)
    if not is_valid:
        log_attack(ip, 'invalid_password_format', 'Format de mot de passe invalide')
        return jsonify({'error': error_msg}), 400
    
    # Validation de la clé
    is_valid, error_msg = validate_input(key_code, 'Key', max_length=100, pattern=r'^[a-zA-Z0-9_-]+$')
    if not is_valid:
        log_attack(ip, 'invalid_key_format', 'Format de clé invalide')
        return jsonify({'error': error_msg}), 400
    
    # Vérifier la clé
    keys = load_json(KEYS_FILE)
    if key_code not in keys:
        return jsonify({'error': 'Clé invalide'}), 400
    
    key_data = keys[key_code]
    
    # Vérifier l'expiration de la clé
    if key_data.get('expires_at') != 'Infinity':
        expires_at = datetime.fromisoformat(key_data['expires_at'])
        if expires_at < datetime.now(timezone.utc):
            return jsonify({'error': 'Clé expirée'}), 400
    
    # Vérifier si la clé est déjà utilisée (sauf si c'est une clé admin)
    if key_data.get('user_id') and not key_data.get('is_admin'):
        return jsonify({'error': 'Cette clé est déjà utilisée'}), 400
    
    # Si c'est une clé admin, donner le rôle admin à l'utilisateur
    user_role = 'admin' if key_data.get('is_admin') else 'user'
    
    # Vérifier si l'email est déjà utilisé
    users = load_json(USERS_FILE)
    for username, user in users.items():
        if user.get('email', '').lower() == email:
            return jsonify({'error': 'Cet email est déjà utilisé'}), 400
    
    # Créer l'utilisateur (username = email)
    user_id = secrets.token_hex(16)
    username = email.split('@')[0] + '_' + secrets.token_hex(4)  # Générer un username unique
    
    # S'assurer que le username est unique
    while username in users:
        username = email.split('@')[0] + '_' + secrets.token_hex(4)
    
    users[username] = {
        'id': user_id,
        'username': username,
        'email': email,
        'password_hash': generate_password_hash(password),
        'created_at': datetime.now(timezone.utc).isoformat(),
        'role': user_role,
        'active': True,
        'email_verified': False,
        'key_code': key_code
    }
    
    # Associer la clé à l'utilisateur (sauf si c'est une clé admin réutilisable)
    if not key_data.get('is_admin'):
        key_data['user_id'] = user_id
        key_data['used_at'] = datetime.now(timezone.utc).isoformat()
    save_json(KEYS_FILE, keys)
    
    save_json(USERS_FILE, users)
    
    token = generate_token(user_id)
    
    return jsonify({
        'success': True,
        'message': 'Compte créé avec succès',
        'token': token,
        'user': {
            'id': user_id,
            'username': username,
            'email': email,
            'role': user_role
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")  # Max 5 tentatives par minute
def login():
    """Connexion d'un utilisateur avec email et mot de passe"""
    ip = get_client_ip()
    
    # Vérifier les tentatives échouées
    failed_count = check_failed_logins(ip)
    if failed_count >= FAILED_LOGIN_LIMIT:
        block_ip(ip)
        log_attack(ip, 'brute_force_blocked', f'{failed_count} tentatives échouées')
        return jsonify({
            'error': 'Trop de tentatives échouées',
            'message': f'Votre IP est temporairement bloquée. Réessayez dans {BLOCK_DURATION // 60} minutes.'
        }), 429
    
    data = request.get_json()
    
    # Validation des entrées
    email = data.get('email', '').strip().lower() if data else ''
    password = data.get('password', '').strip() if data else ''
    
    if not email or not password:
        log_attack(ip, 'invalid_login_attempt', 'Champs manquants')
        return jsonify({'error': 'Email et mot de passe requis'}), 400
    
    # Validation de l'email
    is_valid, error_msg = validate_input(email, 'Email', max_length=255, pattern=r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    if not is_valid:
        log_attack(ip, 'invalid_email_format', email)
        return jsonify({'error': error_msg}), 400
    
    # Validation du mot de passe
    is_valid, error_msg = validate_input(password, 'Password', max_length=500)
    if not is_valid:
        log_attack(ip, 'invalid_password_format', 'Format de mot de passe invalide')
        return jsonify({'error': error_msg}), 400
    
    users = load_json(USERS_FILE)
    
    # Trouver l'utilisateur par email
    user = None
    username = None
    for u, user_data in users.items():
        if user_data.get('email', '').lower() == email:
            user = user_data
            username = u
            break
    
    if not user:
        log_attack(ip, 'failed_login', f'Tentative avec email inexistant: {email}')
        return jsonify({'error': 'Identifiants invalides'}), 401
    
    if not check_password_hash(user['password_hash'], password):
        log_attack(ip, 'failed_login', f'Mot de passe incorrect pour: {email}')
        return jsonify({'error': 'Identifiants invalides'}), 401
    
    if not user.get('active', True):
        log_attack(ip, 'login_blocked_account', f'Tentative de connexion à un compte désactivé: {email}')
        return jsonify({'error': 'Compte désactivé'}), 403
    
    # Connexion réussie - réinitialiser le compteur d'échecs
    token = generate_token(user['id'])
    
    return jsonify({
        'success': True,
        'message': 'Connexion réussie',
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user.get('email', ''),
            'role': user.get('role', 'user')
        }
    }), 200

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    """Récupère les informations de l'utilisateur connecté"""
    users = load_json(USERS_FILE)
    
    for username, user in users.items():
        if user['id'] == request.current_user_id:
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user.get('email', ''),
                    'role': user.get('role', 'user'),
                    'created_at': user.get('created_at', '')
                }
            }), 200
    
    return jsonify({'error': 'Utilisateur non trouvé'}), 404

@app.route('/api/auth/change-password', methods=['POST'])
@token_required
def change_password():
    """Change le mot de passe de l'utilisateur"""
    data = request.get_json()
    
    old_password = data.get('old_password', '').strip()
    new_password = data.get('new_password', '').strip()
    
    if not old_password or not new_password:
        return jsonify({'error': 'Ancien et nouveau mot de passe requis'}), 400
    
    if len(new_password) < 8:
        return jsonify({'error': 'Le nouveau mot de passe doit contenir au moins 8 caractères'}), 400
    
    users = load_json(USERS_FILE)
    
    for username, user in users.items():
        if user['id'] == request.current_user_id:
            if not check_password_hash(user['password_hash'], old_password):
                return jsonify({'error': 'Ancien mot de passe incorrect'}), 401
            
            user['password_hash'] = generate_password_hash(new_password)
            save_json(USERS_FILE, users)
            
            return jsonify({
                'success': True,
                'message': 'Mot de passe modifié avec succès'
            }), 200
    
    return jsonify({'error': 'Utilisateur non trouvé'}), 404

# ==================== ROUTES GESTION DES CLÉS ====================

@app.route('/api/keys', methods=['GET'])
@token_required
def get_keys():
    """Récupère toutes les clés de l'utilisateur (ou toutes si admin)"""
    # Vérifier si l'utilisateur est admin
    users = load_json(USERS_FILE)
    current_user = None
    for username, user in users.items():
        if user['id'] == request.current_user_id:
            current_user = user
            break
    
    if not current_user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    is_admin_user = current_user.get('role') == 'admin'
    
    keys = load_json(KEYS_FILE)
    
    # Si admin, voir toutes les clés, sinon seulement les siennes
    if is_admin_user:
        user_keys = keys
    else:
        user_keys = {k: v for k, v in keys.items() if v.get('user_id') == request.current_user_id}
    
    # Convertir en liste et ajouter le statut
    now = datetime.now(timezone.utc)
    result = []
    for code, key_data in user_keys.items():
        expires_at = datetime.fromisoformat(key_data['expires_at']) if key_data.get('expires_at') != 'Infinity' else None
        is_expired = expires_at and expires_at < now if expires_at else False
        
        result.append({
            'code': code,
            'name': key_data.get('name', ''),
            'created_at': key_data.get('created_at', ''),
            'expires_at': key_data.get('expires_at', ''),
            'duration': key_data.get('duration', ''),
            'status': 'expired' if is_expired else 'active',
            'is_admin': key_data.get('is_admin', False)
        })
    
    return jsonify({
        'success': True,
        'keys': result
    }), 200

@app.route('/api/keys', methods=['POST'])
@token_required
def create_key():
    """Crée une nouvelle clé d'accès"""
    # Vérifier si l'utilisateur est admin
    users = load_json(USERS_FILE)
    current_user = None
    for username, user in users.items():
        if user['id'] == request.current_user_id:
            current_user = user
            break
    
    if not current_user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404
    
    is_admin_user = current_user.get('role') == 'admin'
    
    data = request.get_json()
    
    key_code = data.get('code', '').strip()
    duration = data.get('duration', '1d')
    is_admin_key = data.get('is_admin', False) if is_admin_user else False  # Seuls les admins peuvent créer des clés admin
    key_name = data.get('name', '').strip() or f'Clé {key_code[:8]}...'
    
    if not key_code or len(key_code) < 8:
        return jsonify({'error': 'Code de clé requis (minimum 8 caractères)'}), 400
    
    keys = load_json(KEYS_FILE)
    
    if key_code in keys:
        return jsonify({'error': 'Cette clé existe déjà'}), 400
    
    # Calculer la date d'expiration
    duration_map = {
        '1h': timedelta(hours=1),
        '1d': timedelta(days=1),
        '1w': timedelta(weeks=1),
        '1m': timedelta(days=30),
        'lifetime': None
    }
    
    now = datetime.now(timezone.utc)
    expires_at = 'Infinity' if duration == 'lifetime' else (now + duration_map.get(duration, timedelta(days=1))).isoformat()
    
    key_data = {
        'code': key_code,
        'user_id': request.current_user_id if not is_admin_key else None,  # Les clés admin ne sont pas liées à un utilisateur
        'created_at': now.isoformat(),
        'expires_at': expires_at,
        'duration': duration,
        'status': 'active',
        'name': key_name
    }
    
    # Ajouter les propriétés admin si c'est une clé admin
    if is_admin_key:
        key_data['is_admin'] = True
        key_data['permissions'] = ['admin', 'generate_keys', 'delete_keys', 'view_all_keys']
    
    keys[key_code] = key_data
    
    save_json(KEYS_FILE, keys)
    
    return jsonify({
        'success': True,
        'message': 'Clé créée avec succès',
        'key': {
            'code': key_code,
            'name': key_name,
            'created_at': now.isoformat(),
            'expires_at': expires_at,
            'duration': duration,
            'status': 'active',
            'is_admin': is_admin_key
        }
    }), 201

@app.route('/api/keys/<key_code>', methods=['DELETE'])
@token_required
def delete_key(key_code):
    """Supprime une clé d'accès"""
    keys = load_json(KEYS_FILE)
    
    if key_code not in keys:
        return jsonify({'error': 'Clé non trouvée'}), 404
    
    key_data = keys[key_code]
    
    # Vérifier que la clé appartient à l'utilisateur
    if key_data.get('user_id') != request.current_user_id:
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    # Empêcher la suppression de la clé master
    if key_code == 'BH-MASTER-2024':
        return jsonify({'error': 'Impossible de supprimer la clé master'}), 403
    
    del keys[key_code]
    save_json(KEYS_FILE, keys)
    
    return jsonify({
        'success': True,
        'message': 'Clé supprimée avec succès'
    }), 200

@app.route('/api/keys/verify', methods=['POST'])
def verify_key():
    """Vérifie si une clé est valide (pour le login frontend)"""
    data = request.get_json()
    key_code = data.get('code', '').strip()
    
    if not key_code:
        return jsonify({'error': 'Code de clé requis'}), 400
    
    keys = load_json(KEYS_FILE)
    
    if key_code not in keys:
        return jsonify({
            'valid': False,
            'error': 'Clé invalide'
        }), 200
    
    key_data = keys[key_code]
    
    # Vérifier l'expiration
    if key_data.get('expires_at') != 'Infinity':
        expires_at = datetime.fromisoformat(key_data['expires_at'])
        if expires_at < datetime.now(timezone.utc):
            return jsonify({
                'valid': False,
                'error': 'Clé expirée'
            }), 200
    
    return jsonify({
        'valid': True,
        'key': {
            'code': key_code,
            'expires_at': key_data.get('expires_at', ''),
            'duration': key_data.get('duration', '')
        }
    }), 200

# ==================== ROUTES GESTION DES BASES DE DONNÉES ====================

@app.route('/api/databases', methods=['GET'])
@token_required
def get_databases():
    """Récupère toutes les bases de données de l'utilisateur"""
    databases = load_json(DATABASES_FILE)
    user_databases = [db for db in databases if db.get('user_id') == request.current_user_id]
    
    return jsonify({
        'success': True,
        'databases': user_databases
    }), 200

@app.route('/api/databases', methods=['POST'])
@token_required
def upload_database():
    """Upload une nouvelle base de données"""
    data = request.get_json()
    
    name = data.get('name', '').strip()
    description = data.get('description', '').strip()
    category = data.get('category', 'general')
    content = data.get('content', '')
    file_name = data.get('file_name', '')
    file_size = data.get('file_size', 0)
    
    if not name:
        return jsonify({'error': 'Nom de la base de données requis'}), 400
    
    databases = load_json(DATABASES_FILE)
    
    databases.append({
        'id': secrets.token_hex(16),
        'user_id': request.current_user_id,
        'name': name,
        'description': description,
        'category': category,
        'file_name': file_name,
        'file_size': file_size,
        'content': content,
        'uploaded_at': datetime.now(timezone.utc).isoformat()
    })
    
    save_json(DATABASES_FILE, databases)
    
    return jsonify({
        'success': True,
        'message': 'Base de données uploadée avec succès'
    }), 201

@app.route('/api/databases/<db_id>', methods=['DELETE'])
@token_required
def delete_database(db_id):
    """Supprime une base de données"""
    databases = load_json(DATABASES_FILE)
    
    for i, db in enumerate(databases):
        if db.get('id') == db_id and db.get('user_id') == request.current_user_id:
            databases.pop(i)
            save_json(DATABASES_FILE, databases)
            return jsonify({
                'success': True,
                'message': 'Base de données supprimée avec succès'
            }), 200
    
    return jsonify({'error': 'Base de données non trouvée'}), 404

# ==================== ROUTES ADMIN (Optionnel) ====================

@app.route('/api/admin/users', methods=['GET'])
@token_required
def get_all_users():
    """Récupère tous les utilisateurs (admin seulement)"""
    users = load_json(USERS_FILE)
    
    # Vérifier si l'utilisateur est admin
    current_user = None
    for username, user in users.items():
        if user['id'] == request.current_user_id:
            current_user = user
            break
    
    if not current_user or current_user.get('role') != 'admin':
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    # Retourner la liste des utilisateurs (sans mots de passe)
    user_list = []
    for username, user in users.items():
        user_list.append({
            'id': user['id'],
            'username': username,
            'email': user.get('email', ''),
            'role': user.get('role', 'user'),
            'active': user.get('active', True),
            'created_at': user.get('created_at', '')
        })
    
    return jsonify({
        'success': True,
        'users': user_list
    }), 200

@app.route('/api/admin/keys', methods=['GET'])
@token_required
def get_all_keys():
    """Récupère toutes les clés (admin seulement)"""
    users = load_json(USERS_FILE)
    
    # Vérifier si l'utilisateur est admin
    current_user = None
    for username, user in users.items():
        if user['id'] == request.current_user_id:
            current_user = user
            break
    
    if not current_user or current_user.get('role') != 'admin':
        return jsonify({'error': 'Accès non autorisé'}), 403
    
    keys = load_json(KEYS_FILE)
    
    # Convertir en liste
    result = []
    now = datetime.now(timezone.utc)
    for code, key_data in keys.items():
        expires_at = datetime.fromisoformat(key_data['expires_at']) if key_data.get('expires_at') != 'Infinity' else None
        is_expired = expires_at and expires_at < now if expires_at else False
        
        result.append({
            'code': code,
            'user_id': key_data.get('user_id', ''),
            'created_at': key_data.get('created_at', ''),
            'expires_at': key_data.get('expires_at', ''),
            'duration': key_data.get('duration', ''),
            'status': 'expired' if is_expired else 'active'
        })
    
    return jsonify({
        'success': True,
        'keys': result
    }), 200

# ==================== ROUTE RACINE ====================

@app.route('/', methods=['GET'])
def index():
    """Route racine - Servir le frontend (index.html)"""
    try:
        # Essayer de servir index.html depuis le répertoire de base
        index_path = os.path.join(BASE_DIR, 'index.html')
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                return f.read(), 200, {'Content-Type': 'text/html; charset=utf-8'}
        else:
            # Essayer avec send_from_directory
            return send_from_directory(BASE_DIR, 'index.html')
    except Exception as e:
        print(f"[ERROR] Impossible de servir index.html: {e}")
        # Si index.html n'existe pas, retourner les infos API
        return jsonify({
            'service': 'FULLLOOKUP OSINT Platform Backend',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'health': '/api/health',
                'auth': '/api/auth/*',
                'keys': '/api/keys/*',
                'breachhub': '/api/breachhub/*'
            },
            'error': f'index.html not found: {str(e)}'
        }), 200

# Servir les autres pages HTML et fichiers statiques
# Cette route doit être définie APRÈS toutes les routes API
@app.route('/<path:filename>')
def serve_static(filename):
    """Servir les fichiers statiques (HTML, CSS, JS, etc.)"""
    # Ne pas servir les fichiers de l'API (déjà gérés par les routes API)
    if filename.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    
    # Ne pas servir les fichiers de données
    if filename.startswith('data/'):
        return jsonify({'error': 'Not found'}), 404
    
    # Ne pas servir les fichiers Python
    if filename.endswith('.py'):
        return jsonify({'error': 'Not found'}), 404
    
    try:
        # Essayer de servir le fichier depuis le répertoire de base
        file_path = os.path.join(BASE_DIR, filename)
        if os.path.exists(file_path):
            # Déterminer le Content-Type selon l'extension
            content_type = 'text/html'
            if filename.endswith('.css'):
                content_type = 'text/css'
            elif filename.endswith('.js'):
                content_type = 'application/javascript'
            elif filename.endswith('.json'):
                content_type = 'application/json'
            elif filename.endswith('.svg'):
                content_type = 'image/svg+xml'
            elif filename.endswith('.png'):
                content_type = 'image/png'
            elif filename.endswith('.jpg') or filename.endswith('.jpeg'):
                content_type = 'image/jpeg'
            
            with open(file_path, 'rb') as f:
                content = f.read()
                if filename.endswith('.html') or filename.endswith('.css') or filename.endswith('.js'):
                    content = content.decode('utf-8')
                    return content, 200, {'Content-Type': f'{content_type}; charset=utf-8'}
                else:
                    return content, 200, {'Content-Type': content_type}
        else:
            # Essayer avec send_from_directory
            return send_from_directory(BASE_DIR, filename)
    except Exception as e:
        # Si le fichier n'existe pas et que c'est une route HTML, servir index.html (pour le routing SPA)
        if not '.' in filename or filename.endswith('.html') or '/' in filename:
            try:
                index_path = os.path.join(BASE_DIR, 'index.html')
                if os.path.exists(index_path):
                    with open(index_path, 'r', encoding='utf-8') as f:
                        return f.read(), 200, {'Content-Type': 'text/html; charset=utf-8'}
            except:
                pass
        return jsonify({'error': 'File not found', 'filename': filename}), 404

# ==================== ROUTE HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérification de l'état du serveur"""
    return jsonify({
        'status': 'ok',
        'service': 'OSINT Panel Backend',
        'timestamp': datetime.now(timezone.utc).isoformat()
    }), 200

# ==================== PROXY BREACHHUB API ====================

BREACHHUB_API_KEY = os.getenv('BREACHHUB_API_KEY', 'mriuBN4nIPYLpcDeIYiQtEKz0GGhCT')
BREACHHUB_BASE_URL = 'https://breachhub.org/api'

@app.route('/api/breachhub/<path:endpoint>', methods=['GET'])
@limiter.limit("30 per minute")  # Max 30 requêtes par minute
def proxy_breachhub(endpoint):
    """
    Proxy pour les requêtes BreachHub API
    Permet d'éviter les problèmes CORS
    """
    ip = get_client_ip()
    
    try:
        # Validation de l'endpoint
        if not endpoint or len(endpoint) > 200:
            log_attack(ip, 'invalid_endpoint', f'Endpoint invalide: {endpoint}')
            return jsonify({
                'error': 'Invalid endpoint',
                'message': 'L\'endpoint spécifié est invalide'
            }), 400
        
        # Vérifier que l'endpoint ne contient que des caractères autorisés
        if not re.match(r'^[a-zA-Z0-9_/-]+$', endpoint):
            log_attack(ip, 'suspicious_endpoint', f'Endpoint suspect: {endpoint}')
            return jsonify({
                'error': 'Invalid endpoint',
                'message': 'L\'endpoint contient des caractères non autorisés'
            }), 400
        
        # Récupérer tous les paramètres de la requête
        params = request.args.to_dict()
        
        # Limiter le nombre de paramètres
        if len(params) > 20:
            log_attack(ip, 'too_many_params', f'{len(params)} paramètres')
            return jsonify({
                'error': 'Too many parameters',
                'message': 'Trop de paramètres dans la requête'
            }), 400
        
        # Valider et nettoyer les paramètres
        cleaned_params = {}
        for key, value in params.items():
            # Limiter la longueur des clés et valeurs
            if len(key) > 100 or len(str(value)) > 1000:
                log_attack(ip, 'oversized_param', f'Paramètre trop long: {key}')
                continue
            
            # Vérifier que la clé ne contient que des caractères autorisés
            if not re.match(r'^[a-zA-Z0-9_-]+$', key):
                log_attack(ip, 'invalid_param_key', f'Clé de paramètre invalide: {key}')
                continue
            
            cleaned_params[key] = value
        
        # Ajouter la clé API BreachHub
        cleaned_params['key'] = BREACHHUB_API_KEY
        
        # Construire l'URL complète
        url = f"{BREACHHUB_BASE_URL}/{endpoint}"
        
        # Faire la requête avec timeout réduit
        response = requests.get(url, params=cleaned_params, timeout=20)
        
        # Vérifier le status code
        if response.status_code >= 400:
            # Essayer de parser la réponse d'erreur
            try:
                error_data = response.json()
                return jsonify({
                    'error': error_data.get('error', 'API Error'),
                    'message': error_data.get('message', f'Erreur API: {response.status_code}'),
                    'status_code': response.status_code
                }), response.status_code
            except ValueError:
                # Si ce n'est pas du JSON, retourner le texte brut
                return jsonify({
                    'error': 'API Error',
                    'message': response.text[:500] if response.text else f'Erreur API: {response.status_code}',
                    'status_code': response.status_code
                }), response.status_code
        
        # Parser la réponse JSON
        try:
            data = response.json()
            return jsonify(data), 200
        except ValueError as e:
            # Si la réponse n'est pas du JSON valide
            return jsonify({
                'error': 'Invalid JSON response',
                'message': f'La réponse de l\'API n\'est pas du JSON valide: {str(e)}',
                'raw_response': response.text[:500] if response.text else ''
            }), 500
        
    except requests.exceptions.Timeout:
        return jsonify({
            'error': 'Request timeout',
            'message': 'La requête a pris trop de temps (30 secondes)'
        }), 504
    except requests.exceptions.ConnectionError as e:
        return jsonify({
            'error': 'Connection error',
            'message': f'Impossible de se connecter à l\'API BreachHub: {str(e)}'
        }), 503
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': 'Request failed',
            'message': f'Erreur lors de la requête: {str(e)}'
        }), 500
    except Exception as e:
        # Logger l'erreur pour le débogage
        import traceback
        print(f"Erreur inattendue dans proxy_breachhub: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': 'Internal error',
            'message': f'Erreur interne: {str(e)}'
        }), 500

# ==================== ROUTES PAIEMENT ====================

# Plans disponibles
PAYMENT_PLANS = {
    'basic': {
        'name': 'Basic',
        'price': 9.99,
        'currency': 'EUR',
        'interval': 'month',
        'features': {
            'searches_per_month': 100,
            'api_access': 'basic',
            'keys_limit': 1,
            'support': 'email'
        }
    },
    'pro': {
        'name': 'Pro',
        'price': 29.99,
        'currency': 'EUR',
        'interval': 'month',
        'features': {
            'searches_per_month': 1000,
            'api_access': 'all',
            'keys_limit': 10,
            'support': 'priority'
        }
    },
    'premium': {
        'name': 'Premium',
        'price': 99.99,
        'currency': 'EUR',
        'interval': 'month',
        'features': {
            'searches_per_month': -1,  # -1 = illimité
            'api_access': 'all_premium',
            'keys_limit': -1,  # -1 = illimité
            'support': '24/7'
        }
    }
}

@app.route('/api/payment/plans', methods=['GET'])
def get_payment_plans():
    """Récupère la liste des plans disponibles"""
    return jsonify({
        'success': True,
        'plans': PAYMENT_PLANS
    }), 200

@app.route('/api/payment/subscription', methods=['GET'])
@token_required
def get_user_subscription():
    """Récupère l'abonnement de l'utilisateur"""
    subscriptions = load_json(SUBSCRIPTIONS_FILE)
    user_subscription = subscriptions.get(request.current_user_id)
    
    if user_subscription:
        # Vérifier si l'abonnement est toujours actif
        expires_at = datetime.fromisoformat(user_subscription['expires_at'])
        if expires_at > datetime.now(timezone.utc):
            return jsonify({
                'success': True,
                'subscription': user_subscription
            }), 200
        else:
            # Abonnement expiré
            return jsonify({
                'success': True,
                'subscription': None,
                'message': 'Abonnement expiré'
            }), 200
    
    return jsonify({
        'success': True,
        'subscription': None
    }), 200

@app.route('/api/payment/process', methods=['POST'])
@token_required
@limiter.limit("5 per hour")  # Max 5 paiements par heure
def process_payment():
    """Traite un paiement (PayPal ou LTC)"""
    ip = get_client_ip()
    data = request.get_json()
    
    plan_id = data.get('plan_id')
    payment_method = data.get('payment_method', '').strip().lower()
    
    # Validation du plan
    if not plan_id or plan_id not in PAYMENT_PLANS:
        return jsonify({'error': 'Plan invalide'}), 400
    
    # Validation de la méthode de paiement
    if payment_method not in ['paypal', 'ltc']:
        return jsonify({'error': 'Méthode de paiement invalide. Utilisez "paypal" ou "ltc"'}), 400
    
    plan = PAYMENT_PLANS[plan_id]
    payment_id = secrets.token_hex(16)
    
    # Traitement selon la méthode
    if payment_method == 'paypal':
        sender_email = data.get('sender_email', '').strip().lower()
        transaction_id = data.get('transaction_id', '').strip()
        
        if not sender_email or '@' not in sender_email:
            return jsonify({'error': 'Email PayPal invalide'}), 400
        
        # Enregistrer le paiement PayPal
        payments = load_json(PAYMENTS_FILE)
        payment_record = {
            'id': payment_id,
            'user_id': request.current_user_id,
            'plan_id': plan_id,
            'plan_name': plan['name'],
            'amount': plan['price'],
            'currency': plan['currency'],
            'status': 'pending',  # En attente de vérification
            'payment_method': 'paypal',
            'paypal_email': 'u8625172031@gmail.com',
            'sender_email': sender_email,
            'transaction_id': transaction_id or f'PP-{secrets.token_hex(8).upper()}',
            'created_at': datetime.now(timezone.utc).isoformat(),
            'notes': 'Paiement PayPal - En attente de vérification manuelle'
        }
        payments.append(payment_record)
        save_json(PAYMENTS_FILE, payments)
        
        # Ne pas activer l'abonnement automatiquement - nécessite vérification manuelle
        return jsonify({
            'success': True,
            'message': 'Paiement PayPal enregistré. Votre abonnement sera activé après vérification manuelle.',
            'payment_id': payment_id,
            'status': 'pending',
            'instructions': 'Envoyez une capture d\'écran de la confirmation PayPal au support pour accélérer l\'activation.'
        }), 200
    
    elif payment_method == 'ltc':
        transaction_hash = data.get('transaction_hash', '').strip()
        
        # Enregistrer le paiement LTC
        payments = load_json(PAYMENTS_FILE)
        payment_record = {
            'id': payment_id,
            'user_id': request.current_user_id,
            'plan_id': plan_id,
            'plan_name': plan['name'],
            'amount': plan['price'],
            'currency': 'EUR',
            'crypto_currency': 'LTC',
            'status': 'pending',  # En attente de confirmation blockchain
            'payment_method': 'ltc',
            'ltc_address': 'LTc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            'transaction_hash': transaction_hash or '',
            'created_at': datetime.now(timezone.utc).isoformat(),
            'notes': 'Paiement LTC - En attente de confirmation sur la blockchain'
        }
        payments.append(payment_record)
        save_json(PAYMENTS_FILE, payments)
        
        # Ne pas activer l'abonnement automatiquement - nécessite vérification blockchain
        return jsonify({
            'success': True,
            'message': 'Paiement LTC enregistré. Votre abonnement sera activé après confirmation sur la blockchain.',
            'payment_id': payment_id,
            'status': 'pending',
            'instructions': 'La transaction sera vérifiée automatiquement. Cela peut prendre quelques minutes.'
        }), 200

@app.route('/api/payment/history', methods=['GET'])
@token_required
def get_payment_history():
    """Récupère l'historique des paiements de l'utilisateur"""
    payments = load_json(PAYMENTS_FILE)
    user_payments = [p for p in payments if p.get('user_id') == request.current_user_id]
    
    # Trier par date (plus récent en premier)
    user_payments.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    return jsonify({
        'success': True,
        'payments': user_payments
    }), 200

@app.route('/api/payment/cancel', methods=['POST'])
@token_required
def cancel_subscription():
    """Annule l'abonnement de l'utilisateur"""
    subscriptions = load_json(SUBSCRIPTIONS_FILE)
    
    if request.current_user_id in subscriptions:
        subscriptions[request.current_user_id]['status'] = 'cancelled'
        subscriptions[request.current_user_id]['cancelled_at'] = datetime.now(timezone.utc).isoformat()
        save_json(SUBSCRIPTIONS_FILE, subscriptions)
        
        return jsonify({
            'success': True,
            'message': 'Abonnement annulé avec succès'
        }), 200
    
    return jsonify({'error': 'Aucun abonnement actif trouvé'}), 404

# ==================== INITIALISATION ADMIN ====================

def create_admin_user():
    """Crée un utilisateur admin par défaut et une clé admin"""
    users = load_json(USERS_FILE)
    keys = load_json(KEYS_FILE)
    
    # Créer l'utilisateur admin
    admin_email = 'admin@fullookup.com'
    admin_password = 'Admin123!'
    admin_key_code = 'ADMIN-MASTER-2024'
    
    # Vérifier si l'admin existe déjà
    admin_exists = False
    for username, user in users.items():
        if user.get('email', '').lower() == admin_email.lower() or user.get('role') == 'admin':
            admin_exists = True
            break
    
    if not admin_exists:
        admin_id = secrets.token_hex(16)
        admin_username = 'admin'
        
        # S'assurer que le username est unique
        while admin_username in users:
            admin_username = 'admin_' + secrets.token_hex(4)
        
        users[admin_username] = {
            'id': admin_id,
            'username': admin_username,
            'email': admin_email,
            'password_hash': generate_password_hash(admin_password),
            'created_at': datetime.now(timezone.utc).isoformat(),
            'role': 'admin',
            'active': True,
            'email_verified': True
        }
        save_json(USERS_FILE, users)
        print("=" * 60)
        print("✅ UTILISATEUR ADMIN CRÉÉ")
        print("=" * 60)
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Mot de passe: {admin_password}")
        print(f"🔐 Clé Admin: {admin_key_code}")
        print("=" * 60)
        print("⚠️  CHANGEZ LE MOT DE PASSE APRÈS LA PREMIÈRE CONNEXION !")
        print("=" * 60)
    
    # Créer la clé admin
    if admin_key_code not in keys:
        keys[admin_key_code] = {
            'code': admin_key_code,
            'user_id': None,  # Clé spéciale, pas liée à un utilisateur
            'created_at': datetime.now(timezone.utc).isoformat(),
            'expires_at': 'Infinity',
            'duration': 'lifetime',
            'status': 'active',
            'is_admin': True,
            'name': 'Clé Admin Master',
            'permissions': ['admin', 'generate_keys', 'delete_keys', 'view_all_keys']
        }
        save_json(KEYS_FILE, keys)
        print(f"✅ Clé admin créée: {admin_key_code}")
    
    return admin_email, admin_password, admin_key_code

if __name__ == '__main__':
    admin_email, admin_password, admin_key = create_admin_user()
    
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    print(f"\n🚀 Serveur Backend démarré sur http://localhost:{port}")
    print(f"📊 Mode debug: {debug}")
    print(f"🔐 API disponible sur /api/")
    print(f"\n👤 Pour vous connecter en tant qu'admin :")
    print(f"   📧 Email: {admin_email}")
    print(f"   🔑 Mot de passe: {admin_password}")
    print(f"   🔐 Clé Admin: {admin_key}")
    print(f"\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

