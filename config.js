// Configuration pour l'environnement (local ou production)
// Ce fichier détecte automatiquement l'environnement et utilise la bonne URL

const CONFIG = {
    // Détecter si on est en production (hébergé) ou en local
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    
    // URL du backend selon l'environnement
    getBackendUrl: function() {
        // Si une variable d'environnement est définie
        if (window.BACKEND_URL) {
            return window.BACKEND_URL;
        }
        
        // En production sur Render
        if (this.isProduction) {
            // Si on est sur Render, utiliser la même URL (le backend sert aussi le frontend)
            if (window.location.hostname.includes('onrender.com')) {
                return window.location.origin;
            }
            
            // Sinon, utiliser l'URL relative (même domaine)
            return window.location.origin;
        }
        
        // En local, utiliser localhost
        return 'http://localhost:5000';
    },
    
    // URL complète de l'API
    getApiUrl: function(endpoint) {
        const baseUrl = this.getBackendUrl();
        // Enlever le / au début de l'endpoint s'il existe
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        return `${baseUrl}/api/${cleanEndpoint}`;
    }
};

// Exporter pour utilisation globale
window.CONFIG = CONFIG;

