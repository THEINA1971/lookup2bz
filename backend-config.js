// Configuration Backend pour le Frontend

const BACKEND_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    // BASE_URL: 'https://votre-domaine.com/api', // Pour production
    
    // Endpoints
    endpoints: {
        // Auth
        register: '/auth/register',
        login: '/auth/login',
        me: '/auth/me',
        changePassword: '/auth/change-password',
        
        // Keys
        keys: '/keys',
        verifyKey: '/keys/verify',
        
        // Databases
        databases: '/databases',
        
        // Admin
        adminUsers: '/admin/users',
        adminKeys: '/admin/keys'
    },
    
    // Fonction pour obtenir le token depuis localStorage
    getToken: () => {
        return localStorage.getItem('auth_token');
    },
    
    // Fonction pour faire une requête authentifiée
    authenticatedFetch: async (endpoint, options = {}) => {
        const token = BACKEND_CONFIG.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${BACKEND_CONFIG.BASE_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            // Token expiré ou invalide
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
            window.location.href = '/login.html';
            return null;
        }
        
        return response;
    }
};

// Fonctions d'authentification
async function registerUser(username, password, email = '') {
    const response = await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.endpoints.register}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password,
            email
        })
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('current_user', JSON.stringify(data.user));
    }
    
    return data;
}

async function loginUser(username, password) {
    const response = await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.endpoints.login}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('current_user', JSON.stringify(data.user));
    }
    
    return data;
}

async function getCurrentUser() {
    const response = await BACKEND_CONFIG.authenticatedFetch(BACKEND_CONFIG.endpoints.me);
    if (!response) return null;
    return await response.json();
}

async function changePassword(oldPassword, newPassword) {
    const response = await BACKEND_CONFIG.authenticatedFetch(BACKEND_CONFIG.endpoints.changePassword, {
        method: 'POST',
        body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword
        })
    });
    if (!response) return null;
    return await response.json();
}

// Fonctions de gestion des clés
async function getKeys() {
    const response = await BACKEND_CONFIG.authenticatedFetch(BACKEND_CONFIG.endpoints.keys);
    if (!response) return null;
    return await response.json();
}

async function createKey(code, duration) {
    const response = await BACKEND_CONFIG.authenticatedFetch(BACKEND_CONFIG.endpoints.keys, {
        method: 'POST',
        body: JSON.stringify({
            code,
            duration
        })
    });
    if (!response) return null;
    return await response.json();
}

async function deleteKey(keyCode) {
    const response = await BACKEND_CONFIG.authenticatedFetch(`${BACKEND_CONFIG.endpoints.keys}/${keyCode}`, {
        method: 'DELETE'
    });
    if (!response) return null;
    return await response.json();
}

async function verifyKey(keyCode) {
    const response = await fetch(`${BACKEND_CONFIG.BASE_URL}${BACKEND_CONFIG.endpoints.verifyKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: keyCode
        })
    });
    return await response.json();
}

// Fonctions de gestion des bases de données
async function getDatabases() {
    const response = await BACKEND_CONFIG.authenticatedFetch(BACKEND_CONFIG.endpoints.databases);
    if (!response) return null;
    return await response.json();
}

async function uploadDatabase(name, description, category, content, fileName, fileSize) {
    const response = await BACKEND_CONFIG.authenticatedFetch(BACKEND_CONFIG.endpoints.databases, {
        method: 'POST',
        body: JSON.stringify({
            name,
            description,
            category,
            content,
            file_name: fileName,
            file_size: fileSize
        })
    });
    if (!response) return null;
    return await response.json();
}

async function deleteDatabase(dbId) {
    const response = await BACKEND_CONFIG.authenticatedFetch(`${BACKEND_CONFIG.endpoints.databases}/${dbId}`, {
        method: 'DELETE'
    });
    if (!response) return null;
    return await response.json();
}

// Exporter les fonctions
if (typeof window !== 'undefined') {
    window.BACKEND_CONFIG = BACKEND_CONFIG;
    window.registerUser = registerUser;
    window.loginUser = loginUser;
    window.getCurrentUser = getCurrentUser;
    window.changePassword = changePassword;
    window.getKeys = getKeys;
    window.createKey = createKey;
    window.deleteKey = deleteKey;
    window.verifyKey = verifyKey;
    window.getDatabases = getDatabases;
    window.uploadDatabase = uploadDatabase;
    window.deleteDatabase = deleteDatabase;
}

