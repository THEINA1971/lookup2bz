#!/usr/bin/env python3
"""
Serveur backend pour le Panel OSINT
Gère les requêtes API de manière sécurisée
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
CORS(app)  # Autoriser les requêtes depuis le frontend

# Configuration API
API_KEY = os.getenv('API_KEY', 'e3f379405b1f6e8c2fbc27bccfced0866e9df83c')
API_URL = os.getenv('API_URL', 'https://leakcheck.io/api/public')


@app.route('/api/search/email', methods=['POST'])
def search_email():
    """Recherche d'informations par email"""
    try:
        data = request.get_json()
        email = data.get('query', '').strip()
        
        if not email:
            return jsonify({'error': 'Email requis'}), 400
        
        # Appel à l'API leakcheck
        response = requests.get(
            f"{API_URL}?key={API_KEY}&check={email}&type=email",
            timeout=10
        )
        
        if response.status_code == 200:
            api_data = response.json()
            return jsonify({
                'success': True,
                'data': api_data,
                'query': email
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Erreur API: {response.status_code}',
                'query': email
            }), response.status_code
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'query': email if 'email' in locals() else ''
        }), 500


@app.route('/api/search/domain', methods=['POST'])
def search_domain():
    """Recherche d'informations par domaine"""
    try:
        data = request.get_json()
        domain = data.get('query', '').strip()
        
        if not domain:
            return jsonify({'error': 'Domaine requis'}), 400
        
        # Ici vous pouvez ajouter d'autres APIs OSINT pour les domaines
        # Pour l'instant, on retourne une structure de base
        return jsonify({
            'success': True,
            'data': {
                'domain': domain,
                'status': 'active',
                'subdomains': []
            },
            'query': domain
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/search/username', methods=['POST'])
def search_username():
    """Recherche d'informations par username"""
    try:
        data = request.get_json()
        username = data.get('query', '').strip()
        
        if not username:
            return jsonify({'error': 'Username requis'}), 400
        
        # Structure de base pour les usernames
        return jsonify({
            'success': True,
            'data': {
                'username': username,
                'platforms': []
            },
            'query': username
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/search/ip', methods=['POST'])
def search_ip():
    """Recherche d'informations par adresse IP"""
    try:
        data = request.get_json()
        ip = data.get('query', '').strip()
        
        if not ip:
            return jsonify({'error': 'Adresse IP requise'}), 400
        
        # Vous pouvez intégrer une API de géolocalisation IP ici
        return jsonify({
            'success': True,
            'data': {
                'ip': ip,
                'location': {}
            },
            'query': ip
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérification de l'état du serveur"""
    return jsonify({
        'status': 'ok',
        'service': 'OSINT Panel API'
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    print(f"🚀 Serveur OSINT Panel démarré sur http://localhost:{port}")
    print(f"📊 Mode debug: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

