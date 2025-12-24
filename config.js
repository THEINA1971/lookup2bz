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
            // Remplacez par votre URL backend Render (ex: https://lookup2bz-backend.onrender.com)
            // Vous pouvez aussi utiliser une variable d'environnement
            const renderBackendUrl = 'https://lookup2bz-backend.onrender.com';
            
            // Si on est sur Render, utiliser l'URL du backend
            if (window.location.hostname.includes('onrender.com')) {
                return renderBackendUrl;
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

