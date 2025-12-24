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
            // URL du backend Render
            const renderBackendUrl = 'https://lookup2bz-backend.onrender.com';
            
            // Si on est sur le frontend Render (lookup2bz-frontend.onrender.com ou lookup2bz.onrender.com)
            if (window.location.hostname.includes('onrender.com')) {
                // Si c'est le frontend, utiliser l'URL du backend
                if (window.location.hostname.includes('frontend') || 
                    window.location.hostname === 'lookup2bz.onrender.com' ||
                    window.location.hostname === 'www.lookup2bz.onrender.com') {
                    return renderBackendUrl;
                }
                // Si c'est déjà le backend, retourner l'URL actuelle
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

