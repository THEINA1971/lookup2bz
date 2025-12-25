// Admin Panel Script - Purple/Blue Theme

const MASTER_KEY = "BH-MASTER-2024";
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Vérifier l'authentification
    checkAuthentication();
    
    // Initialiser selon le rôle
    const userRole = localStorage.getItem('user_role') || 'user';
    
    if (userRole === 'admin') {
        initializeMasterKey();
        loadKeys();
        populateAPISelector();
    } else {
        // Masquer les onglets admin pour les utilisateurs normaux
        hideAdminTabs();
    }
    
    // Wait for API_CONFIG to be loaded - try multiple times
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryPopulateModules = () => {
        attempts++;
        console.log(`Attempt ${attempts} to populate modules...`);
        
        if (typeof API_CONFIG !== 'undefined') {
            console.log('API_CONFIG found!', Object.keys(API_CONFIG).length, 'APIs');
            populateAPIModules();
        } else if (attempts < maxAttempts) {
            console.log('API_CONFIG not yet loaded, retrying...');
            setTimeout(tryPopulateModules, 200);
        } else {
            console.error('API_CONFIG not found after', maxAttempts, 'attempts. Make sure osint-panel.js is loaded.');
            // Try to populate anyway with empty state
            const grid = document.querySelector('.api-modules-grid-simple');
            if (grid) {
                grid.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Erreur: Configuration API non chargée. Vérifiez que osint-panel.js est bien inclus.</div>';
            }
        }
    };
    
    tryPopulateModules();
    
    showTab('search'); // Show search tab by default
    
    // Afficher l'email de l'utilisateur
    const userEmail = localStorage.getItem('user_email');
    const emailDisplay = document.getElementById('user-email-display');
    if (emailDisplay && userEmail) {
        emailDisplay.textContent = userEmail;
    }
});

// Vérifier l'authentification
async function checkAuthentication() {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        // Pas de token, rediriger vers la page de connexion
        window.location.href = 'login.html';
        return;
    }
    
    // Vérifier la validité du token
    try {
        const backendUrl = window.CONFIG ? window.CONFIG.getBackendUrl() : 'http://localhost:5000';
        
        // Ajouter un timeout pour éviter les attentes infinies
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${backendUrl}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            // Token invalide, rediriger vers la connexion
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_email');
            localStorage.removeItem('current_user_key');
            window.location.href = 'login.html';
            return;
        }
        
        const data = await response.json();
        if (data.user) {
            // Mettre à jour le rôle si nécessaire
            localStorage.setItem('user_role', data.user.role || 'user');
            localStorage.setItem('user_email', data.user.email || '');
        }
    } catch (error) {
        console.error('Erreur de vérification:', error);
        // En cas d'erreur, rediriger vers la connexion
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_email');
        localStorage.removeItem('current_user_key');
        window.location.href = 'login.html';
    }
}

// Masquer les onglets admin pour les utilisateurs normaux
function hideAdminTabs() {
    const keysTab = document.getElementById('tab-keys');
    const uploadTab = document.getElementById('tab-upload');
    const keysTabContent = document.getElementById('keys-tab');
    const uploadTabContent = document.getElementById('upload-tab');
    
    if (keysTab) keysTab.style.display = 'none';
    if (uploadTab) uploadTab.style.display = 'none';
    if (keysTabContent) keysTabContent.style.display = 'none';
    if (uploadTabContent) uploadTabContent.style.display = 'none';
}

// Initialize Master Key
function initializeMasterKey() {
    const keys = JSON.parse(localStorage.getItem('breachhub_keys') || '{}');
    
    if (!keys[MASTER_KEY]) {
        const masterKeyData = {
            code: MASTER_KEY,
            createdAt: Date.now(),
            expiresAt: Infinity,
            duration: 'lifetime',
            status: 'active',
            isMaster: true
        };
        
        keys[MASTER_KEY] = masterKeyData;
        localStorage.setItem('breachhub_keys', JSON.stringify(keys));
    }
}

// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(`${tabName}-tab`);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // If showing search tab, ensure modules are populated
    if (tabName === 'search') {
        setTimeout(() => {
            const grid = document.querySelector('.api-modules-grid-simple');
            if (grid && grid.children.length === 0) {
                console.log('Search tab opened, grid is empty, repopulating...');
                if (typeof API_CONFIG !== 'undefined') {
                    populateAPIModules();
                } else {
                    console.warn('API_CONFIG not available when showing search tab');
                }
            }
        }, 100);
    }
    
    // Activate nav tab
    const navTab = document.getElementById(`tab-${tabName}`);
    if (navTab) {
        navTab.classList.add('active');
    }
    
    // Load data for the tab
    if (tabName === 'keys') {
        loadKeys();
    } else if (tabName === 'databases') {
        loadDatabases();
    } else if (tabName === 'payment') {
        loadPaymentData();
    }
}

// Vérifier si on doit ouvrir un onglet spécifique depuis l'URL
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab) {
        showTab(tab);
    }
});

// Key Generation
function generateKeyInput() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'BH-';
    
    for (let i = 0; i < 4; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    key += '-';
    for (let i = 0; i < 4; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    document.getElementById('new-key-input').value = key;
}

function getDurationMs(duration) {
    const durations = {
        '1h': 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '1w': 7 * 24 * 60 * 60 * 1000,
        '1m': 30 * 24 * 60 * 60 * 1000,
        'lifetime': Infinity
    };
    return durations[duration] || durations['1d'];
}

async function createKey() {
    const keyInput = document.getElementById('new-key-input');
    const durationSelect = document.getElementById('key-duration');
    const keyNameInput = document.getElementById('key-name-input');
    const keyIsAdminCheckbox = document.getElementById('key-is-admin');
    
    const keyCode = keyInput.value.trim();
    const duration = durationSelect.value;
    const keyName = keyNameInput.value.trim();
    const isAdmin = keyIsAdminCheckbox.checked;
    
    if (!keyCode || keyCode.length < 8) {
        showNotification('La clé doit contenir au moins 8 caractères', 'error');
        return;
    }
    
    // Récupérer le token d'authentification
    const token = localStorage.getItem('auth_token');
    if (!token) {
        showNotification('Vous devez être connecté pour créer une clé', 'error');
        return;
    }
    
    // Appeler l'API backend
    try {
        const backendUrl = window.CONFIG ? window.CONFIG.getBackendUrl() : 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/keys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                code: keyCode,
                duration: duration,
                name: keyName,
                is_admin: isAdmin
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showNotification(data.error || 'Erreur lors de la création de la clé', 'error');
            return;
        }
        
        // Clear inputs
        keyInput.value = '';
        keyNameInput.value = '';
        keyIsAdminCheckbox.checked = false;
        
        // Reload keys
        await loadKeys();
        
        showNotification('Clé créée avec succès!', 'success');
    } catch (error) {
        console.error('Erreur lors de la création de la clé:', error);
        showNotification('Erreur de connexion au serveur', 'error');
    }
}

// Load and Display Keys
async function loadKeys() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        console.error('Pas de token d\'authentification');
        return;
    }
    
    try {
        const backendUrl = window.CONFIG ? window.CONFIG.getBackendUrl() : 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/keys`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.error('Erreur lors du chargement des clés');
            return;
        }
        
        const data = await response.json();
        const keys = data.keys || [];
        
        // Convertir en format attendu par displayKeys
        const keysArray = keys.map(key => [
            key.code,
            {
                code: key.code,
                name: key.name || '',
                createdAt: new Date(key.created_at).getTime(),
                expiresAt: key.expires_at === 'Infinity' ? Infinity : new Date(key.expires_at).getTime(),
                duration: key.duration,
                status: key.status || 'active',
                is_admin: key.is_admin || false,
                used_at: key.used_at || null,
                used_by_email: key.used_by_email || null,
                created_by_email: key.created_by_email || null
            }
        ]).sort((a, b) => b[1].createdAt - a[1].createdAt);
        
        // Update counts
        const now = Date.now();
        let allCount = keysArray.length;
        let activeCount = 0;
        let inactiveCount = 0;
        
        keysArray.forEach(([code, data]) => {
            const isExpired = data.expiresAt !== Infinity && now > data.expiresAt;
            if (isExpired || data.status === 'expired') {
                inactiveCount++;
            } else {
                activeCount++;
            }
        });
        
        if (document.getElementById('count-all')) {
            document.getElementById('count-all').textContent = allCount;
        }
        if (document.getElementById('count-active')) {
            document.getElementById('count-active').textContent = activeCount;
        }
        if (document.getElementById('count-inactive')) {
            document.getElementById('count-inactive').textContent = inactiveCount;
        }
        
        // Display keys based on filter
        displayKeys(keysArray);
    } catch (error) {
        console.error('Erreur lors du chargement des clés:', error);
    }
}

function displayKeys(keysArray) {
    const container = document.getElementById('keys-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (keysArray.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">Aucune clé créée</p>';
        return;
    }
    
    const now = Date.now();
    
        keysArray.forEach(([code, data]) => {
        const isExpired = data.expiresAt !== Infinity && now > data.expiresAt;
        const status = data.status || (isExpired ? 'expired' : 'active');
        const isMaster = data.isMaster || code === MASTER_KEY || code === 'ADMIN-MASTER-2024';
        const isUsed = status === 'used' || data.used_at !== null;
        
        // Apply filter
        if (currentFilter === 'active' && (isExpired || isUsed || status !== 'active')) return;
        if (currentFilter === 'used' && !isUsed) return;
        if (currentFilter === 'expired' && status !== 'expired' && !isExpired) return;
        if (currentFilter === 'inactive' && !isExpired && !isUsed) return;
        
        const createdAt = new Date(data.createdAt).toLocaleString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const expiresAt = data.expiresAt === Infinity 
            ? 'Jamais' 
            : new Date(data.expiresAt).toLocaleString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        
        const keyItem = document.createElement('div');
        keyItem.className = 'key-item-simple';
        keyItem.style.cssText = 'padding: 16px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; margin-bottom: 12px; background: rgba(255, 255, 255, 0.02); transition: all 0.3s ease; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;';
        keyItem.onmouseenter = function() { this.style.background = 'rgba(255, 255, 255, 0.05)'; this.style.borderColor = 'rgba(255, 255, 255, 0.2)'; };
        keyItem.onmouseleave = function() { this.style.background = 'rgba(255, 255, 255, 0.02)'; this.style.borderColor = 'rgba(255, 255, 255, 0.1)'; };
        
        const isAdminKey = data.is_admin || false;
        const keyName = data.name || '';
        
        const statusColors = {
            'active': '#10b981',
            'used': '#ef4444',
            'expired': '#f59e0b'
        };
        const statusColor = statusColors[status] || '#6b7280';
        
        keyItem.innerHTML = `
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    ${keyName ? `<div style="font-weight: 600; color: var(--text-primary); font-size: 15px;">${keyName}</div>` : ''}
                    <div class="key-code-simple" style="font-family: monospace; font-size: 14px; letter-spacing: 1px; ${isMaster || isAdminKey ? 'color: #ffd700;' : 'color: var(--text-primary);'}">
                        ${code} 
                        ${isMaster ? '<i class="fas fa-crown" style="margin-left: 8px; color: #ffd700;"></i>' : ''}
                        ${isAdminKey ? '<span style="margin-left: 8px; background: #ef4444; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600;">ADMIN</span>' : ''}
                    </div>
                </div>
                <div class="key-meta-simple" style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
                    <span><i class="fas fa-calendar-plus" style="margin-right: 4px;"></i>Créée: ${createdAt}</span>
                    <span><i class="fas fa-calendar-times" style="margin-right: 4px;"></i>Expire: ${expiresAt}</span>
                    <span><i class="fas fa-clock" style="margin-right: 4px;"></i>${getDurationLabel(data.duration)}</span>
                    ${data.created_by_email ? `<span><i class="fas fa-user" style="margin-right: 4px;"></i>Créateur: ${data.created_by_email}</span>` : ''}
                </div>
                ${isUsed && data.used_by_email ? `
                    <div style="margin-top: 12px; padding: 12px; background: rgba(245, 158, 11, 0.15); border-left: 3px solid #f59e0b; border-radius: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <i class="fas fa-user-check" style="color: #f59e0b; font-size: 14px;"></i>
                            <div style="font-size: 13px; color: #f59e0b; font-weight: 700;">Clé utilisée</div>
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.8; padding-left: 22px;">
                            <div><strong style="color: var(--text-primary);">Utilisée par:</strong> <span style="color: var(--text);">${data.used_by_email}</span></div>
                            ${data.used_at ? `<div style="margin-top: 4px;"><strong style="color: var(--text-primary);">Date:</strong> <span style="color: var(--text);">${new Date(data.used_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>` : ''}
                        </div>
                    </div>
                ` : status === 'active' ? `
                    <div style="margin-top: 12px; padding: 12px; background: rgba(16, 185, 129, 0.15); border-left: 3px solid #10b981; border-radius: 6px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-circle" style="color: #10b981; font-size: 14px;"></i>
                            <div style="font-size: 13px; color: #10b981; font-weight: 700;">Clé disponible pour l'inscription</div>
                        </div>
                    </div>
                ` : ''}
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
                <span style="padding: 6px 14px; background: ${statusColor}; color: white; border-radius: 6px; font-size: 12px; font-weight: 600; white-space: nowrap;">
                    ${status === 'active' ? 'Active' : status === 'used' ? 'Utilisée' : status === 'expired' ? 'Expirée' : status}
                </span>
                ${!isMaster ? `
                    <button onclick="event.stopPropagation(); copyKey('${code}')" class="btn-icon" title="Copier">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="event.stopPropagation(); deleteKey('${code}')" class="btn-icon danger" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        `;
        
        container.appendChild(keyItem);
    });
}

function getDurationLabel(duration) {
    const labels = {
        '1h': '1 heure',
        '1d': '1 jour',
        '1w': '1 semaine',
        '1m': '1 mois',
        'lifetime': 'Lifetime'
    };
    return labels[duration] || duration;
}

// Filter Keys
function filterKeys(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const filterBtn = document.getElementById(`filter-${filter}`);
    if (filterBtn) {
        filterBtn.classList.add('active');
    }
    
    loadKeys();
}

// Check Key Status (Public - No Auth Required)
async function checkKeyStatus() {
    const keyCode = document.getElementById('check-key-input').value.trim();
    const resultDiv = document.getElementById('key-status-result');
    
    if (!keyCode) {
        showNotification('Veuillez entrer un code de clé', 'error');
        return;
    }
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin" style="font-size: 24px; color: var(--primary);"></i><p style="margin-top: 10px;">Vérification en cours...</p></div>';
    
    try {
        const backendUrl = window.CONFIG ? window.CONFIG.getBackendUrl() : 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/keys/check/${encodeURIComponent(keyCode)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            resultDiv.innerHTML = `
                <div style="padding: 20px; background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.5); border-radius: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <i class="fas fa-times-circle" style="font-size: 24px; color: var(--danger);"></i>
                        <h4 style="margin: 0; color: var(--danger);">Clé introuvable</h4>
                    </div>
                    <p style="color: var(--text-muted); margin: 0;">${data.error || 'Cette clé n\'existe pas dans notre base de données.'}</p>
                </div>
            `;
            return;
        }
        
        // Afficher les résultats
        const statusColors = {
            'active': '#10b981',
            'used': '#f59e0b',
            'expired': '#ef4444',
            'cancelled': '#6b7280'
        };
        
        const statusLabels = {
            'active': 'Active',
            'used': 'Utilisée',
            'expired': 'Expirée',
            'cancelled': 'Annulée'
        };
        
        const status = data.status || 'active';
        const statusColor = statusColors[status] || '#6b7280';
        const statusLabel = statusLabels[status] || status;
        
        const createdAt = data.created_at ? new Date(data.created_at).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A';
        
        const expiresAt = data.expires_at && data.expires_at !== 'Infinity' 
            ? new Date(data.expires_at).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : 'Jamais';
        
        const usedAt = data.used_at 
            ? new Date(data.used_at).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : null;
        
        resultDiv.innerHTML = `
            <div style="padding: 24px; background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%); border: 2px solid ${statusColor}; border-radius: 16px; box-shadow: 0 0 30px ${statusColor}40;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h3 style="margin: 0 0 8px 0; color: var(--text); font-size: 20px;">${data.name || data.code}</h3>
                        <code style="background: rgba(239, 68, 68, 0.2); padding: 6px 12px; border-radius: 6px; font-size: 14px; letter-spacing: 1px; color: var(--primary-light);">${data.code}</code>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: inline-block; padding: 8px 16px; background: ${statusColor}; color: white; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase;">
                            ${statusLabel}
                        </span>
                        ${data.is_admin ? '<div style="margin-top: 8px;"><span style="background: #ef4444; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">ADMIN</span></div>' : ''}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 20px;">
                    <div style="padding: 12px; background: rgba(0, 0, 0, 0.5); border-radius: 8px;">
                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Créée le</div>
                        <div style="font-weight: 600; color: var(--text);">${createdAt}</div>
                    </div>
                    <div style="padding: 12px; background: rgba(0, 0, 0, 0.5); border-radius: 8px;">
                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Expire le</div>
                        <div style="font-weight: 600; color: var(--text);">${expiresAt}</div>
                    </div>
                    <div style="padding: 12px; background: rgba(0, 0, 0, 0.5); border-radius: 8px;">
                        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">Durée</div>
                        <div style="font-weight: 600; color: var(--text);">${getDurationLabel(data.duration)}</div>
                    </div>
                </div>
                
                ${data.is_used && usedAt ? `
                    <div style="margin-top: 20px; padding: 16px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <i class="fas fa-user-check" style="color: #f59e0b;"></i>
                            <strong style="color: var(--text);">Clé utilisée</strong>
                        </div>
                        <div style="color: var(--text-muted); font-size: 14px; margin-left: 28px;">
                            <div><strong>Date d'utilisation :</strong> ${usedAt}</div>
                            ${data.used_by_email ? `<div style="margin-top: 4px;"><strong>Par :</strong> ${data.used_by_email}</div>` : ''}
                        </div>
                    </div>
                ` : ''}
                
                ${data.is_active && !data.is_used ? `
                    <div style="margin-top: 20px; padding: 16px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-check-circle" style="color: #10b981;"></i>
                            <strong style="color: var(--text);">Cette clé est active et peut être utilisée pour l'inscription</strong>
                        </div>
                    </div>
                ` : ''}
                
                ${data.is_expired ? `
                    <div style="margin-top: 20px; padding: 16px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i>
                            <strong style="color: var(--text);">Cette clé est expirée et ne peut plus être utilisée</strong>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        resultDiv.innerHTML = `
            <div style="padding: 20px; background: rgba(239, 68, 68, 0.1); border: 2px solid rgba(239, 68, 68, 0.5); border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <i class="fas fa-exclamation-circle" style="font-size: 24px; color: var(--danger);"></i>
                    <h4 style="margin: 0; color: var(--danger);">Erreur</h4>
                </div>
                <p style="color: var(--text-muted); margin: 0;">Erreur lors de la vérification de la clé. Veuillez réessayer.</p>
            </div>
        `;
    }
}

// Ancienne fonction checkKeyStatus (remplacée)
async function checkKeyStatus_OLD() {
    const keyInput = document.getElementById('check-key-input');
    const resultDiv = document.getElementById('key-status-result');
    
    if (!keyInput || !resultDiv) return;
    
    const keyCode = keyInput.value.trim();
    
    if (!keyCode) {
        resultDiv.innerHTML = '<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 4px; color: #ef4444;">Veuillez entrer un code de clé</div>';
        resultDiv.style.display = 'block';
        return;
    }
    
    try {
        const backendUrl = window.CONFIG ? window.CONFIG.getBackendUrl() : 'http://localhost:5000';
        const response = await fetch(`${backendUrl}/api/keys/check/${encodeURIComponent(keyCode)}`, {
            method: 'GET'
        });
        
        const data = await response.json();
        
        if (!data.exists) {
            resultDiv.innerHTML = `
                <div style="padding: 15px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 4px;">
                    <div style="font-weight: 600; color: #ef4444; margin-bottom: 8px;">
                        <i class="fas fa-times-circle"></i> Clé non trouvée
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary);">
                        Cette clé n'existe pas dans la base de données.
                    </div>
                </div>
            `;
            resultDiv.style.display = 'block';
            return;
        }
        
        const statusColors = {
            'active': '#10b981',
            'used': '#ef4444',
            'expired': '#f59e0b'
        };
        
        const statusLabels = {
            'active': 'Active',
            'used': 'Utilisée',
            'expired': 'Expirée'
        };
        
        const statusColor = statusColors[data.status] || '#6b7280';
        const statusLabel = statusLabels[data.status] || data.status;
        
        let usedInfo = '';
        if (data.is_used && data.used_by_email) {
            usedInfo = `
                <div style="margin-top: 12px; padding: 12px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 4px;">
                    <div style="font-size: 12px; color: #ef4444; font-weight: 600; margin-bottom: 6px;">
                        <i class="fas fa-user-check"></i> Clé utilisée
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary);">
                        Utilisée par: <strong style="color: var(--text-primary);">${data.used_by_email}</strong>
                        ${data.used_at ? `<br>Le: ${new Date(data.used_at).toLocaleString('fr-FR')}` : ''}
                    </div>
                </div>
            `;
        }
        
        resultDiv.innerHTML = `
            <div style="padding: 20px; background: rgba(16, 185, 129, 0.1); border-left: 3px solid ${statusColor}; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px; font-size: 16px;">
                            ${data.name || 'Clé sans nom'}
                        </div>
                        <div style="font-family: monospace; font-size: 14px; color: var(--text-secondary); letter-spacing: 1px;">
                            ${data.code}
                        </div>
                    </div>
                    <span style="padding: 6px 12px; background: ${statusColor}; color: white; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        ${statusLabel}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Créée le</div>
                        <div style="font-size: 13px; color: var(--text-primary);">${new Date(data.created_at).toLocaleString('fr-FR')}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Expire le</div>
                        <div style="font-size: 13px; color: var(--text-primary);">${data.expires_at === 'Infinity' ? 'Jamais' : new Date(data.expires_at).toLocaleString('fr-FR')}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Durée</div>
                        <div style="font-size: 13px; color: var(--text-primary);">${getDurationLabel(data.duration)}</div>
                    </div>
                    ${data.created_by_email ? `
                        <div>
                            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Créateur</div>
                            <div style="font-size: 13px; color: var(--text-primary);">${data.created_by_email}</div>
                        </div>
                    ` : ''}
                </div>
                ${usedInfo}
            </div>
        `;
        resultDiv.style.display = 'block';
    } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        resultDiv.innerHTML = `
            <div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 4px; color: #ef4444;">
                Erreur lors de la vérification de la clé. Veuillez réessayer.
            </div>
        `;
        resultDiv.style.display = 'block';
    }
}

// Key Actions
function copyKey(code) {
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Clé copiée dans le presse-papiers!');
    });
}

async function deleteKey(code) {
    if (code === 'ADMIN-MASTER-2024' || code === 'BH-MASTER-2024') {
        showNotification('Impossible de supprimer la clé master!', 'error');
        return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la clé ${code}?`)) {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            showNotification('Vous devez être connecté pour supprimer une clé', 'error');
            return;
        }
        
        try {
            const backendUrl = window.CONFIG ? window.CONFIG.getBackendUrl() : 'http://localhost:5000';
            const response = await fetch(`${backendUrl}/api/keys/${encodeURIComponent(code)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                showNotification(data.error || 'Erreur lors de la suppression de la clé', 'error');
                return;
            }
            
            // Reload keys
            await loadKeys();
            showNotification('Clé supprimée avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors de la suppression de la clé:', error);
            showNotification('Erreur de connexion au serveur', 'error');
        }
    }
}

function refreshKeys() {
    loadKeys();
    showNotification('Liste actualisée');
}

// Database Management
function loadDatabases() {
    const databases = JSON.parse(localStorage.getItem('databases') || '[]');
    const container = document.getElementById('databases-list');
    container.innerHTML = '';
    
    if (databases.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Aucune base de données</p>';
        return;
    }
    
    databases.forEach((db, index) => {
        const dbCard = document.createElement('div');
        dbCard.className = 'database-card';
        
        dbCard.innerHTML = `
            <div class="database-name">${db.name}</div>
            <div class="database-description">${db.description || 'Aucune description'}</div>
            <div class="database-meta">
                <span>Catégorie: ${db.category}</span>
                <span>Fichier: ${db.fileName}</span>
            </div>
            <div class="database-actions">
                <button onclick="viewDatabase(${index})" class="key-action-btn">
                    <i class="fas fa-eye"></i> Voir
                </button>
                <button onclick="deleteDatabase(${index})" class="key-action-btn danger">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        `;
        
        container.appendChild(dbCard);
    });
}

function handleFileSelect(input) {
    const fileName = input.files[0] ? input.files[0].name : 'Aucun fichier choisi';
    document.getElementById('file-name').textContent = fileName;
}

function uploadDatabase() {
    const name = document.getElementById('db-name').value.trim();
    const description = document.getElementById('db-description').value.trim();
    const category = document.getElementById('db-category').value;
    const fileInput = document.getElementById('db-file');
    
    if (!name) {
        showNotification('Veuillez entrer un nom pour la base de données', 'error');
        return;
    }
    
    if (!fileInput.files[0]) {
        showNotification('Veuillez sélectionner un fichier', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const databases = JSON.parse(localStorage.getItem('databases') || '[]');
        
        databases.push({
            name: name,
            description: description,
            category: category,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: Date.now(),
            content: e.target.result
        });
        
        localStorage.setItem('databases', JSON.stringify(databases));
        
        // Clear form
        document.getElementById('db-name').value = '';
        document.getElementById('db-description').value = '';
        document.getElementById('db-category').value = 'general';
        fileInput.value = '';
        document.getElementById('file-name').textContent = 'Aucun fichier choisi';
        
        showNotification('Base de données uploadée avec succès!');
        
        // Switch to databases tab
        showTab('databases');
    };
    
    reader.readAsText(file);
}

function viewDatabase(index) {
    const databases = JSON.parse(localStorage.getItem('databases') || '[]');
    const db = databases[index];
    
    if (db) {
        alert(`Base de données: ${db.name}\n\nDescription: ${db.description || 'Aucune'}\n\nCatégorie: ${db.category}\n\nFichier: ${db.fileName}\n\nTaille: ${(db.fileSize / 1024).toFixed(2)} KB`);
    }
}

function deleteDatabase(index) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette base de données?')) {
        const databases = JSON.parse(localStorage.getItem('databases') || '[]');
        databases.splice(index, 1);
        localStorage.setItem('databases', JSON.stringify(databases));
        loadDatabases();
        showNotification('Base de données supprimée');
    }
}

function refreshDatabases() {
    loadDatabases();
    showNotification('Liste actualisée');
}

// Search Panel
function goToSearch() {
    document.getElementById('search-panel').classList.remove('hidden');
}

function closeSearchPanel() {
    document.getElementById('search-panel').classList.add('hidden');
}

function populateAPISelector() {
    if (typeof API_CONFIG === 'undefined') return;
    
    const selector = document.getElementById('api-selector');
    if (!selector) return;
    
    selector.innerHTML = '';
    
    const categories = {
        'Recherche Générale': ['snusbase', 'leakosint', 'leakcheck', 'intelvault', 'breachbase', 'hackcheck'],
        'Email & Téléphone': ['seon-email', 'seon-phone', 'github', 'hudsonrock', 'intelbase-email'],
        'Social Media': ['memory', 'reddit', 'tiktok-basic', 'tiktok-full', 'intelfetch-github'],
        'Discord': ['discord-lookup', 'discord-stalker', 'cordcat'],
        'IP/Network': ['ipinfo', 'shodan-host', 'shodan-search', 'intelfetch-ip'],
        'Gaming': ['steam', 'crowsint', 'crowsint-social'],
        'Autres': ['keyscore-email', 'keyscore-url', 'breachrip', 'crypto']
    };
    
    Object.entries(categories).forEach(([category, apis]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;
        
        apis.forEach(api => {
            if (API_CONFIG[api]) {
                const option = document.createElement('option');
                option.value = api;
                option.textContent = API_CONFIG[api].inputLabel || api;
                optgroup.appendChild(option);
            }
        });
        
        selector.appendChild(optgroup);
    });
}

async function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    const api = document.getElementById('api-selector').value;
    
    if (!query) {
        showNotification('Veuillez entrer une requête', 'error');
        return;
    }
    
    if (!api || typeof API_CONFIG === 'undefined' || !API_CONFIG[api]) {
        showNotification('Veuillez sélectionner un module API', 'error');
        return;
    }
    
    const config = API_CONFIG[api];
    const apiKey = localStorage.getItem('breachhub_api_key') || 'mriuBN4nIPYLpcDeIYiQtEKz0GGhCT';
    
    let url = `https://breachhub.org/api${config.endpoint}?`;
    url += `${config.param}=${encodeURIComponent(query)}`;
    
    if (config.category) url += `&category=${encodeURIComponent(config.category)}`;
    if (config.type) url += `&type=${encodeURIComponent(config.type)}`;
    
    url += `&key=${encodeURIComponent(apiKey)}`;
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Recherche en cours...</p>';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        displaySearchResults(data, api, query);
    } catch (error) {
        resultsContainer.innerHTML = `<p style="color: var(--danger);">Erreur: ${error.message}</p>`;
    }
}

function displaySearchResults(data, apiName, query) {
    const container = document.getElementById('search-results');
    container.innerHTML = '';
    
    const header = document.createElement('div');
    header.style.marginBottom = '20px';
    header.style.padding = '15px';
    header.style.background = 'rgba(239, 68, 68, 0.1)';
    header.style.borderRadius = '8px';
    header.innerHTML = `
        <h3 style="color: var(--primary-purple-light); margin-bottom: 5px;">Résultats pour: ${query}</h3>
        <p style="color: var(--text-secondary); font-size: 12px;">Module: ${apiName}</p>
    `;
    container.appendChild(header);
    
    if (Array.isArray(data) && data.length > 0) {
        data.forEach((item, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            let html = '';
            for (const key in item) {
                if (item.hasOwnProperty(key)) {
                    html += `
                        <div style="margin-bottom: 10px;">
                            <strong style="color: var(--primary-purple-light);">${key}:</strong>
                            <span style="color: var(--text-primary);">${item[key]}</span>
                        </div>
                    `;
                }
            }
            
            resultItem.innerHTML = html;
            container.appendChild(resultItem);
        });
    } else if (typeof data === 'object' && data !== null) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        let html = '';
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                html += `
                    <div style="margin-bottom: 10px;">
                        <strong style="color: var(--primary-purple-light);">${key}:</strong>
                        <span style="color: var(--text-primary);">${JSON.stringify(data[key])}</span>
                    </div>
                `;
            }
        }
        
        resultItem.innerHTML = html;
        container.appendChild(resultItem);
    } else {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aucun résultat trouvé</p>';
    }
}

// Logout
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        localStorage.removeItem('current_user_key');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_email');
        localStorage.removeItem('breachhub_keys');
        localStorage.removeItem('breachhub_master_key');
        window.location.href = 'login.html';
    }
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notification-text');
    
    if (!notification || !text) return;
    
    text.textContent = message;
    
    const icon = notification.querySelector('i');
    if (icon) {
        if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
            icon.style.color = 'var(--danger)';
            notification.style.borderColor = 'var(--danger)';
        } else if (type === 'info') {
            icon.className = 'fas fa-info-circle';
            icon.style.color = 'var(--primary-light)';
            notification.style.borderColor = 'var(--primary)';
        } else {
            icon.className = 'fas fa-check-circle';
            icon.style.color = 'var(--success)';
            notification.style.borderColor = 'var(--success)';
        }
    }
    
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Populate API Modules Grid - Simplified
function populateAPIModules() {
    console.log('populateAPIModules() called');
    
    if (typeof API_CONFIG === 'undefined') {
        console.error('API_CONFIG not loaded in populateAPIModules');
        return;
    }
    
    console.log('API_CONFIG contains', Object.keys(API_CONFIG).length, 'APIs');
    
    const grid = document.querySelector('.api-modules-grid-simple');
    if (!grid) {
        console.error('Grid element .api-modules-grid-simple not found in DOM');
        // Try to find it again after a delay
        setTimeout(() => {
            const retryGrid = document.querySelector('.api-modules-grid-simple');
            if (retryGrid) {
                console.log('Grid found on retry, populating...');
                populateAPIModules();
            } else {
                console.error('Grid still not found after retry');
            }
        }, 500);
        return;
    }
    
    console.log('Grid element found, clearing and populating...');
    grid.innerHTML = '';
    
    // Organiser les APIs par catégories
    const categories = {
        '🔍 Recherche de Fuites': {
            apis: ['snusbase', 'leakosint', 'leakcheck', 'intelvault', 'breachbase', 'hackcheck', 'oathnet-breach', 'breachrip', 'breachvip', 'akula', 'leaksight', 'osintkit'],
            icon: 'fa-database',
            color: '#ef4444'
        },
        '📧 Email & Téléphone': {
            apis: ['seon-email', 'seon-phone', 'github', 'hudsonrock', 'intelbase-email', 'intelbase-phone', 'melissa'],
            icon: 'fa-envelope',
            color: '#4299e1'
        },
        '👤 Réseaux Sociaux': {
            apis: ['memory', 'reddit', 'tiktok-basic', 'tiktok-full', 'intelfetch-github', 'intelbase-github'],
            icon: 'fa-users',
            color: '#48bb78'
        },
        '💬 Discord': {
            apis: ['discord-lookup', 'discord-stalker', 'cordcat', 'cordcat-ip', 'oathnet-discord', 'inf0sec-discord'],
            icon: 'fa-hashtag',
            color: '#5865f2'
        },
        '🌐 IP & Réseau': {
            apis: ['ipinfo', 'shodan-host', 'shodan-search', 'shodan-honeyscore', 'intelfetch-ip', 'intelfetch-domain', 'intelbase-ip', 'inf0sec-domain'],
            icon: 'fa-network-wired',
            color: '#ed8936'
        },
        '🎮 Gaming': {
            apis: ['steam', 'crowsint', 'crowsint-social', 'intelbase-minecraft', 'inf0sec-cfx'],
            icon: 'fa-gamepad',
            color: '#f56565'
        },
        '🔐 Autres Modules': {
            apis: ['keyscore-email', 'keyscore-url', 'keyscore-machineinfo', 'keyscore-download', 'intelfetch-fetchbase', 'intelbase-bmw', 'intelbase-doxbin', 'vindecoder', 'binlist', 'crypto', 'intelx', 'inf0sec-leaks', 'inf0sec-npd', 'inf0sec-username', 'inf0sec-hlr'],
            icon: 'fa-cog',
            color: '#9f7aea'
        }
    };
    
    console.log(`Creating API module cards organized by categories...`);
    
    let cardsCreated = 0;
    
    // Créer les sections par catégorie
    Object.entries(categories).forEach(([categoryName, categoryData]) => {
        const categorySection = document.createElement('div');
        categorySection.className = 'api-category-section';
        
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'api-category-header';
        categoryHeader.innerHTML = `
            <div class="category-icon" style="color: ${categoryData.color};">
                <i class="fas ${categoryData.icon}"></i>
            </div>
            <h3 class="category-title">${categoryName}</h3>
            <span class="category-count">${categoryData.apis.filter(api => API_CONFIG[api]).length} modules</span>
        `;
        
        const categoryGrid = document.createElement('div');
        categoryGrid.className = 'api-modules-grid-simple';
        
        categoryData.apis.forEach(apiKey => {
            if (API_CONFIG[apiKey]) {
                try {
                    const card = createAPIModuleCard(apiKey, API_CONFIG[apiKey]);
                    if (card) {
                        categoryGrid.appendChild(card);
                        cardsCreated++;
                    }
                } catch (error) {
                    console.error(`Error creating card for ${apiKey}:`, error);
                }
            }
        });
        
        if (categoryGrid.children.length > 0) {
            categorySection.appendChild(categoryHeader);
            categorySection.appendChild(categoryGrid);
            grid.appendChild(categorySection);
        }
    });
    
    console.log(`Successfully created ${cardsCreated} API module cards in ${Object.keys(categories).length} categories`);
    
    if (cardsCreated === 0) {
        grid.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Aucune carte API créée. Vérifiez la console pour les erreurs.</div>';
    }
}

function createAPIModuleCard(apiKey, config) {
    if (!config) {
        console.error(`No config found for API: ${apiKey}`);
        return null;
    }
    
    try {
        const card = document.createElement('div');
        card.className = 'api-module-simple';
        card.style.cursor = 'pointer';
        card.setAttribute('data-api-key', apiKey);
        card.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Card clicked for API:', apiKey);
            
            // Ripple effect
            const ripple = document.createElement('span');
            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            card.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            openAPIDetail(apiKey);
        };
        
        const inputLabel = config.inputLabel || 'Query';
        const description = config.description || 'Module de recherche OSINT';
        const apiName = apiKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const icon = config.inputIcon || 'fa-search';
        
        // Instructions d'utilisation basées sur le type d'input
        let usageHint = '';
        if (config.inputType === 'email') {
            usageHint = '💡 Entrez une adresse email (ex: user@example.com)';
        } else if (config.inputType === 'tel') {
            usageHint = '💡 Entrez un numéro de téléphone (ex: +33612345678)';
        } else if (config.inputType === 'text' && inputLabel.toLowerCase().includes('username')) {
            usageHint = '💡 Entrez un nom d\'utilisateur (ex: johndoe)';
        } else if (config.inputType === 'text' && inputLabel.toLowerCase().includes('ip')) {
            usageHint = '💡 Entrez une adresse IP (ex: 8.8.8.8)';
        } else if (config.inputType === 'url') {
            usageHint = '💡 Entrez une URL (ex: https://example.com)';
        } else {
            usageHint = '💡 Cliquez pour voir les instructions détaillées';
        }
        
        card.innerHTML = `
            <div class="api-module-header-simple">
                <div class="api-module-icon-simple">
                    <i class="fas ${icon}"></i>
                </div>
                <div style="flex: 1;">
                    <div class="api-module-name-simple">${apiName}</div>
                    <div class="api-module-desc-simple">${description}</div>
                    <div class="api-module-hint">${usageHint}</div>
                </div>
            </div>
            <div class="api-module-footer-simple">
                <span class="api-module-badge">${inputLabel}</span>
                <i class="fas fa-arrow-right api-module-arrow"></i>
            </div>
        `;
        
        return card;
    } catch (error) {
        console.error(`Error creating card for ${apiKey}:`, error);
        return null;
    }
}

// API Detail Page Functions
let currentDetailAPI = null;

function openAPIDetail(apiKey) {
    console.log('Opening API detail for:', apiKey);
    
    if (typeof API_CONFIG === 'undefined') {
        console.error('API_CONFIG is not defined');
        showNotification('Configuration API non chargée', 'error');
        return;
    }
    
    if (!API_CONFIG[apiKey]) {
        console.error('API config not found for:', apiKey);
        showNotification('Module API non configuré', 'error');
        return;
    }
    
    currentDetailAPI = apiKey;
    const config = API_CONFIG[apiKey];
    
    // Show detail page
    const detailPage = document.getElementById('api-detail-page');
    if (!detailPage) {
        console.error('api-detail-page element not found');
        showNotification('Page de détail non trouvée', 'error');
        return;
    }
    
    detailPage.classList.add('active');
    
    // Hide main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.display = 'none';
    }
    
    // Update page title
    const apiName = apiKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const nameElement = document.getElementById('detail-api-name');
    const subtitleElement = document.getElementById('detail-api-subtitle');
    
    if (nameElement) nameElement.textContent = apiName;
    if (subtitleElement) subtitleElement.textContent = config.description || 'Module de recherche OSINT';
    
    // Update icon
    const iconElement = document.getElementById('detail-api-icon');
    if (iconElement) {
        const icon = iconElement.querySelector('i');
        if (icon) {
            icon.className = `fas ${config.inputIcon || 'fa-search'}`;
        }
    }
    
    // Update info boxes
    const typeElement = document.getElementById('info-type');
    const formatElement = document.getElementById('info-format');
    const endpointElement = document.getElementById('info-endpoint');
    
    if (typeElement) typeElement.textContent = config.inputType || 'text';
    if (formatElement) formatElement.textContent = config.inputLabel || 'Query';
    if (endpointElement) endpointElement.textContent = `/api${config.endpoint}`;
    
    // Update input
    const input = document.getElementById('detail-search-input');
    if (input) {
        input.type = config.inputType || 'text';
        input.placeholder = `Entrez ${config.inputLabel.toLowerCase()}...`;
        input.value = ''; // Clear previous value
    }
    
    // Populate examples
    if (typeof populateExamples === 'function') {
        populateExamples(config);
    }
    
    // Clear previous results
    clearDetailResults();
    
    // Focus on input
    if (input) {
        setTimeout(() => input.focus(), 100);
    }
    
    console.log('API detail page opened successfully');
}

function closeAPIDetail() {
    const detailPage = document.getElementById('api-detail-page');
    if (detailPage) {
        detailPage.classList.remove('active');
    }
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.display = 'block';
    }
    
    currentDetailAPI = null;
    
    // Clear inputs
    const input = document.getElementById('detail-search-input');
    if (input) {
        input.value = '';
    }
    
    clearDetailResults();
}

function populateExamples(config) {
    const examplesList = document.getElementById('examples-list');
    if (!examplesList) return;
    
    // Obtenir des exemples spécifiques à l'API actuelle
    const allExamples = getAPIExamples(currentDetailAPI, config);
    
    examplesList.innerHTML = allExamples.map(ex => `
        <div class="example-chip" onclick="useExample('${ex}')">
            ${ex}
        </div>
    `).join('');
}

function getAPIExamples(apiKey, config) {
    if (!apiKey) {
        return getGenericExamples(config.inputType);
    }
    
    const apiKeyLower = apiKey.toLowerCase();
    
    // Discord APIs
    if (apiKeyLower.includes('discord') || apiKeyLower.includes('cordcat')) {
        return ['123456789012345678', '987654321098765432', '456789012345678901'];
    }
    
    // TikTok
    if (apiKeyLower.includes('tiktok')) {
        return ['username123', 'tiktok_user', 'example_user'];
    }
    
    // Reddit
    if (apiKeyLower.includes('reddit')) {
        return ['username123', 'john_doe', 'jane_smith'];
    }
    
    // GitHub
    if (apiKeyLower.includes('github')) {
        return ['octocat', 'torvalds', 'gaearon'];
    }
    
    // Steam
    if (apiKeyLower.includes('steam')) {
        return ['76561198000000000', '76561198012345678', '76561198098765432'];
    }
    
    // IP APIs (Shodan, IPinfo, etc.)
    if (apiKeyLower.includes('ip') || apiKeyLower.includes('shodan') || apiKeyLower.includes('ipinfo')) {
        return ['8.8.8.8', '1.1.1.1', '192.168.1.1'];
    }
    
    // Phone APIs (SEON, IntelBase, etc.)
    if (apiKeyLower.includes('phone') || apiKeyLower.includes('seon') || apiKeyLower.includes('hlr')) {
        return ['+33612345678', '+33123456789', '+33698765432'];
    }
    
    // Email APIs (la plupart des APIs de breach)
    if (apiKeyLower.includes('email') || apiKeyLower.includes('seon') || 
        apiKeyLower.includes('hudson') || apiKeyLower.includes('intelvault') ||
        apiKeyLower.includes('leakcheck') || apiKeyLower.includes('snusbase') ||
        apiKeyLower.includes('leakosint') || apiKeyLower.includes('keyscore') ||
        apiKeyLower.includes('breach') || apiKeyLower.includes('leak') ||
        apiKeyLower.includes('intelbase') || apiKeyLower.includes('breachrip')) {
        return ['user@example.com', 'admin@company.com', 'test@domain.org'];
    }
    
    // Username APIs (Memory, Oathnet, etc.)
    if (apiKeyLower.includes('username') || apiKeyLower.includes('memory') ||
        apiKeyLower.includes('oathnet') || apiKeyLower.includes('social')) {
        return ['username123', 'john_doe', 'jane_smith'];
    }
    
    // Domain APIs
    if (apiKeyLower.includes('domain') || apiKeyLower.includes('intelfetch-domain')) {
        return ['example.com', 'google.com', 'github.com'];
    }
    
    // VIN Decoder
    if (apiKeyLower.includes('vin') || apiKeyLower.includes('vindecoder')) {
        return ['1HGBH41JXMN109186', 'WBA3A5C5XEJ123456', '5YJSA1E11HF123456'];
    }
    
    // BIN Lookup
    if (apiKeyLower.includes('bin') || apiKeyLower.includes('binlist')) {
        return ['45717360', '41111111', '55555555'];
    }
    
    // Crypto
    if (apiKeyLower.includes('crypto') || apiKeyLower.includes('breachrip-cryptobreach')) {
        return ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'];
    }
    
    // Gaming (Minecraft, Roblox, etc.)
    if (apiKeyLower.includes('minecraft') || apiKeyLower.includes('roblox') ||
        apiKeyLower.includes('crowsint') || apiKeyLower.includes('gaming')) {
        return ['Notch', 'Steve123', 'PlayerOne'];
    }
    
    // IntelX (Storage ID)
    if (apiKeyLower.includes('intelx')) {
        return ['a8e4400a238c7a5cf97171a7cfba994a8a37379b582e6d532669e75ec85da5217e39f2412ca68a30caa20e6383329da55fd5eef002909b863a7f7f55c9b7024e'];
    }
    
    // URL APIs
    if (apiKeyLower.includes('url') || apiKeyLower.includes('keyscore-url')) {
        return ['https://example.com', 'http://test.com', 'https://github.com'];
    }
    
    // Fallback: utiliser le type d'input
    return getGenericExamples(config.inputType);
}

function getGenericExamples(inputType) {
    const examples = {
        'email': ['user@example.com', 'admin@company.com', 'test@domain.org'],
        'tel': ['+33612345678', '+33123456789', '+33698765432'],
        'text': ['username123', 'john_doe', 'jane_smith'],
        'url': ['https://example.com', 'https://example.org', 'http://test.com'],
        'ip': ['8.8.8.8', '1.1.1.1', '192.168.1.1']
    };
    return examples[inputType] || ['exemple123', 'test456', 'sample789'];
}

function useExample(example) {
    document.getElementById('detail-search-input').value = example;
    document.getElementById('detail-search-input').focus();
}

async function performDetailSearch() {
    if (!currentDetailAPI) {
        showNotification('Aucun module sélectionné', 'error');
        return;
    }
    
    const input = document.getElementById('detail-search-input');
    const query = input.value.trim();
    
    if (!query) {
        showNotification('Veuillez entrer une requête', 'error');
        input.focus();
        return;
    }
    
    const config = API_CONFIG[currentDetailAPI];
    if (!config) {
        showNotification('Configuration API introuvable', 'error');
        return;
    }
    
    // Show loading
    const resultsSection = document.getElementById('detail-results-section');
    const resultsContainer = document.getElementById('detail-results-container');
    resultsSection.style.display = 'block';
    resultsContainer.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner"></i>
            <p>Recherche en cours...</p>
        </div>
    `;
    
    try {
        // Utiliser le proxy backend pour éviter les problèmes CORS
        // Détecter automatiquement l'URL du backend (local ou production)
        let backendUrl;
        
        // Si on est en file://, utiliser localhost
        if (window.location.protocol === 'file:') {
            backendUrl = 'http://localhost:5000';
            console.log('Mode file:// détecté, utilisation de http://localhost:5000');
        } else if (window.CONFIG && typeof window.CONFIG.getBackendUrl === 'function') {
            backendUrl = window.CONFIG.getBackendUrl();
            console.log('Utilisation de CONFIG.getBackendUrl():', backendUrl);
        } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            backendUrl = 'http://localhost:5000';
            console.log('Mode localhost détecté, utilisation de http://localhost:5000');
        } else {
            backendUrl = window.location.origin;
            console.log('Mode production détecté, utilisation de:', backendUrl);
        }
        
        console.log('Backend URL finale:', backendUrl);
        
        // Vérifier si le backend est accessible (seulement en local)
        if (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1')) {
            try {
                const healthCheck = await fetch(`${backendUrl}/api/health`, { 
                    method: 'GET',
                    signal: AbortSignal.timeout(3000) // Timeout de 3 secondes
                });
                if (!healthCheck.ok) {
                    throw new Error('Backend non disponible');
                }
            } catch (healthError) {
                console.error('Health check failed:', healthError);
                resultsContainer.innerHTML = `
                    <div class="loading-state" style="text-align: center; padding: 40px 20px;">
                        <i class="fas fa-exclamation-triangle" style="color: var(--warning); font-size: 48px; margin-bottom: 16px;"></i>
                        <p style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--text);">Backend non disponible</p>
                        <p style="color: var(--text-muted); margin-bottom: 16px;">Le serveur backend n'est pas démarré ou n'est pas accessible.</p>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 8px;">Pour démarrer le backend :</p>
                        <p style="color: var(--text-muted); font-size: 13px;">
                            <code style="background: rgba(239, 68, 68, 0.2); padding: 4px 8px; border-radius: 4px; font-family: monospace;">python backend.py</code>
                        </p>
                        <p style="color: var(--text-muted); font-size: 12px; margin-top: 16px;">URL testée: ${backendUrl}/api/health</p>
                    </div>
                `;
                showNotification('Backend non disponible - Vérifiez que le serveur est démarré', 'error');
                return;
            }
        }
        
        // Construire l'endpoint (enlever le / au début si présent)
        let endpoint = config.endpoint.startsWith('/') ? config.endpoint.substring(1) : config.endpoint;
        
        // Construire l'URL du proxy
        let url = `${backendUrl}/api/breachhub/${endpoint}?`;
        url += `${config.param}=${encodeURIComponent(query)}`;
        
        if (config.category) url += `&category=${encodeURIComponent(config.category)}`;
        if (config.type) url += `&type=${encodeURIComponent(config.type)}`;
        if (config.types) url += `&type=${encodeURIComponent(config.types)}`;
        if (config.module) url += `&module=${encodeURIComponent(config.module)}`;
        if (config.bucket) url += `&bucket=${encodeURIComponent(config.bucket)}`;
        if (config.file) url += `&file=${encodeURIComponent(config.file)}`;
        
        console.log('Calling API via proxy:', url);
        
        // Ajouter un timeout et meilleure gestion d'erreur
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes
        
        let response;
        try {
            response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            clearTimeout(timeoutId);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('Timeout: Le serveur met trop de temps à répondre');
            } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
                throw new Error('Backend non disponible - Vérifiez que le serveur est démarré (python backend.py)');
            }
            throw fetchError;
        }
        
        if (!response.ok) {
            // Essayer de parser la réponse d'erreur du backend
            let errorData = null;
            try {
                errorData = await response.json();
            } catch (e) {
                // Si la réponse n'est pas du JSON, utiliser le status code
            }
            
            if (response.status === 401) {
                throw new Error(errorData?.message || 'Clé API invalide');
            } else if (response.status === 429) {
                throw new Error(errorData?.message || 'Limite de taux dépassée. Attendez 30 minutes.');
            } else if (response.status === 503) {
                throw new Error(errorData?.message || 'Service temporairement indisponible');
            } else if (response.status === 504) {
                throw new Error(errorData?.message || 'Timeout de connexion à l\'API');
            } else {
                // Utiliser le message d'erreur du backend si disponible
                const errorMsg = errorData?.message || errorData?.error || `Erreur API: ${response.status}`;
                throw new Error(errorMsg);
            }
        }
        
        const data = await response.json();
        
        // Vérifier si la réponse contient une erreur même avec status 200
        if (data.error) {
            throw new Error(data.message || data.error || 'Erreur inconnue');
        }
        
        displayDetailResults(data, query);
        showNotification('Recherche terminée avec succès!');
        
    } catch (error) {
        console.error('Error in performDetailSearch:', error);
        
        let errorMessage = error.message;
        let errorDetails = '';
        
        // Détecter les erreurs de connexion
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.name === 'TypeError') {
            errorMessage = 'Backend non disponible';
            errorDetails = 'Le serveur backend n\'est pas démarré. Veuillez exécuter: <code style="background: rgba(239, 68, 68, 0.2); padding: 4px 8px; border-radius: 4px; font-family: monospace;">python backend.py</code>';
        } else if (error.message.includes('timeout') || error.message.includes('aborted') || error.message.includes('Timeout')) {
            errorMessage = 'Timeout de connexion';
            errorDetails = 'Le serveur met trop de temps à répondre. Vérifiez que le backend est bien démarré et que votre connexion internet est stable.';
        } else if (error.message.includes('Connection error') || error.message.includes('Impossible de se connecter')) {
            errorMessage = 'Erreur de connexion';
            errorDetails = 'Impossible de se connecter à l\'API externe. Vérifiez votre connexion internet.';
        }
        
        resultsContainer.innerHTML = `
            <div class="loading-state" style="color: var(--danger); text-align: center; padding: 40px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--warning); margin-bottom: 16px;"></i>
                <p style="font-weight: 600; font-size: 18px; margin-bottom: 8px; color: var(--text);">${errorMessage}</p>
                ${errorDetails ? `<p style="color: var(--text-muted); font-size: 14px; margin-top: 12px; line-height: 1.6;">${errorDetails}</p>` : ''}
                <p style="color: var(--text-muted); font-size: 12px; margin-top: 16px;">Détails techniques: ${error.message}</p>
            </div>
        `;
        showNotification('Erreur: ' + errorMessage, 'error');
    }
}

function displayDetailResults(data, query) {
    console.log('Displaying results for query:', query);
    console.log('Raw data:', data);
    
    const resultsSection = document.getElementById('detail-results-section');
    const resultsContainer = document.getElementById('detail-results-container');
    const resultsCount = document.getElementById('detail-results-count');
    
    resultsSection.style.display = 'block';
    resultsContainer.innerHTML = '';
    
    // Extraire les données utiles (ignorer les métadonnées techniques)
    const technicalFields = ['_meta', 'count', 'credit', 'execution_time_ms', 'execution_time', 'quota_max', 'quota_remaining', 'service', 'success', 'timestamp', 'type', 'version', 'query'];
    
    // Extract results - amélioration de l'extraction
    let results = [];
    let metadata = {};
    let source = 'Unknown';
    let textResults = '';
    
    // Si c'est déjà une chaîne de texte (format email:password)
    if (typeof data === 'string') {
        textResults = data;
        results = data.split('\n').filter(line => line.trim().length > 0);
    }
    // Si c'est un tableau
    else if (Array.isArray(data)) {
        results = data;
    }
    // Si c'est un objet
    else if (typeof data === 'object' && data !== null) {
        // Chercher les résultats dans différents emplacements possibles
        if (data.results) {
            if (typeof data.results === 'string') {
                // Si results est une chaîne, l'utiliser directement
                textResults = data.results;
                results = data.results.split('\n').filter(line => line.trim().length > 0);
            } else if (Array.isArray(data.results)) {
                results = data.results;
            }
        } else if (data.data) {
            if (typeof data.data === 'string') {
                textResults = data.data;
                results = data.data.split('\n').filter(line => line.trim().length > 0);
            } else if (Array.isArray(data.data)) {
                results = data.data;
            }
        } else if (data.leaks && Array.isArray(data.leaks)) {
            results = data.leaks;
        } else if (data.breaches && Array.isArray(data.breaches)) {
            results = data.breaches;
        } else {
            // Parcourir toutes les clés pour trouver des données utiles
            const usefulKeys = [];
            for (const key in data) {
                const keyLower = key.toLowerCase();
                if (!technicalFields.includes(keyLower)) {
                    if (Array.isArray(data[key])) {
                        results = data[key];
                        break;
                    } else if (typeof data[key] === 'string' && data[key].length > 10) {
                        // Si c'est une longue chaîne, c'est peut-être du texte formaté
                        textResults = data[key];
                        results = data[key].split('\n').filter(line => line.trim().length > 0);
                        break;
                    } else if (typeof data[key] === 'object' && data[key] !== null) {
                        usefulKeys.push(key);
                    }
                } else {
                    metadata[key] = data[key];
                }
            }
            
            // Si on n'a pas trouvé de résultats, utiliser les clés utiles
            if (results.length === 0 && usefulKeys.length > 0) {
                results = usefulKeys.map(key => ({ [key]: data[key] }));
            } else if (results.length === 0) {
                // Dernier recours : utiliser tout l'objet
                results = [data];
            }
        }
        
        // Détecter la source
        if (data.service) source = data.service;
        else if (data.source) source = data.source;
        else if (data.type) source = data.type;
    }
    
    // Si on n'a pas encore de texte formaté, le créer
    if (!textResults && results.length > 0) {
        // Passer l'API actuelle pour détecter le type
        textResults = formatResultsAsText(results, currentDetailAPI);
    }
    
    // Si toujours vide, afficher les données brutes pour debug
    if (!textResults || textResults.trim().length === 0) {
        console.warn('No text results found, using raw data');
        textResults = JSON.stringify(data, null, 2);
    }
    
    const resultCount = textResults.split('\n').filter(line => line.trim().length > 0).length;
    resultsCount.textContent = resultCount;
    
    if (resultCount === 0) {
        resultsContainer.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-inbox"></i>
                <p>Aucun résultat trouvé pour "${query}"</p>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 10px;">Données reçues: ${JSON.stringify(data).substring(0, 200)}...</p>
            </div>
        `;
        return;
    }
    
    // Créer l'affichage optimisé avec utilisation de tout l'espace
    const resultWrapper = document.createElement('div');
    resultWrapper.className = 'results-text-wrapper-full';
    
    // Header avec titre et stats côte à côte
    const resultHeader = document.createElement('div');
    resultHeader.className = 'results-text-header-full';
    resultHeader.innerHTML = `
        <div class="results-text-title-full">
            <h3>Résultats de la recherche</h3>
            <p class="results-query-info-full">Requête: ${query} • Source: ${source}</p>
        </div>
        <div class="results-text-stats-full">
            <div class="stat-box-full">
                <div class="stat-label-full">Résultats trouvés</div>
                <div class="stat-items-full">
                    <div class="stat-item-full">
                        <span class="stat-label-small">Temps</span>
                        <span class="stat-value-small">${metadata.execution_time_ms ? (metadata.execution_time_ms / 1000).toFixed(2) + 's' : 'N/A'}</span>
                    </div>
                    <div class="stat-item-full">
                        <span class="stat-label-small">Taille</span>
                        <span class="stat-value-small">${formatBytes(new Blob([textResults]).size)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Actions en haut à droite
    const resultActions = document.createElement('div');
    resultActions.className = 'results-text-actions-full';
    resultActions.innerHTML = `
        <button onclick="copyAllResultsText()" class="btn-action-copy-full">
            <i class="fas fa-copy"></i>
            Copier
        </button>
        <button onclick="downloadResultsText()" class="btn-action-download-full">
            <i class="fas fa-download"></i>
            Télécharger
        </button>
    `;
    
    // Zone de texte qui occupe tout l'espace restant
    // Utiliser un div avec scroll au lieu d'un textarea pour une meilleure expérience
    const resultTextDiv = document.createElement('div');
    resultTextDiv.className = 'results-text-area-full';
    resultTextDiv.textContent = textResults;
    resultTextDiv.id = 'results-text-content';
    resultTextDiv.setAttribute('data-content', textResults); // Pour copier/télécharger
    
    resultWrapper.appendChild(resultHeader);
    resultWrapper.appendChild(resultActions);
    resultWrapper.appendChild(resultTextDiv);
    
    resultsContainer.appendChild(resultWrapper);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Formater les résultats en texte simple avec emojis selon le type d'API
function formatResultsAsText(results, apiType = null) {
    const lines = [];
    
    if (!results || results.length === 0) {
        return '';
    }
    
    // Détecter le type d'API pour adapter les emojis
    const apiTypeLower = (apiType || '').toLowerCase();
    const isDiscord = apiTypeLower.includes('discord') || apiTypeLower.includes('cordcat') || apiTypeLower.includes('oathnet-discord');
    const isTikTok = apiTypeLower.includes('tiktok');
    const isReddit = apiTypeLower.includes('reddit');
    const isGithub = apiTypeLower.includes('github') || apiTypeLower.includes('intelfetch-github') || apiTypeLower.includes('intelbase-github');
    const isSteam = apiTypeLower.includes('steam');
    const isIP = apiTypeLower.includes('ip') || apiTypeLower.includes('shodan') || apiTypeLower.includes('ipinfo') || apiTypeLower.includes('intelfetch-ip') || apiTypeLower.includes('intelbase-ip');
    const isEmail = apiTypeLower.includes('email') || apiTypeLower.includes('seon') || apiTypeLower.includes('hudson') || apiTypeLower.includes('intelvault') || apiTypeLower.includes('leakcheck');
    const isGaming = apiTypeLower.includes('gaming') || apiTypeLower.includes('minecraft') || apiTypeLower.includes('crowsint') || apiTypeLower.includes('roblox') || apiTypeLower.includes('oathnet-discordtoroblox');
    const isSocial = apiTypeLower.includes('social') || apiTypeLower.includes('memory') || apiTypeLower.includes('reddit') || apiTypeLower.includes('oathnet');
    const isCrypto = apiTypeLower.includes('crypto') || apiTypeLower.includes('breachrip-cryptobreach');
    const isBreach = apiTypeLower.includes('breach') || apiTypeLower.includes('leak') || apiTypeLower.includes('snusbase') || apiTypeLower.includes('keyscore') || apiTypeLower.includes('intelbase') || apiTypeLower.includes('breachrip');
    
    results.forEach((item, index) => {
        try {
            if (typeof item === 'string') {
                // Si c'est déjà une chaîne, détecter le type et ajouter emoji approprié
                const trimmed = item.trim();
                if (trimmed.length > 0) {
                    let emoji = '📄';
                    
                    // Détection automatique du type
                    if (trimmed.includes('@') && trimmed.includes(':')) {
                        emoji = isDiscord ? '💬' : '📧';
                    } else if (trimmed.includes('@')) {
                        emoji = isDiscord ? '💬' : '📧';
                    } else if (trimmed.match(/^\d+\.\d+\.\d+\.\d+$/)) {
                        emoji = '🌐';
                    } else if (trimmed.match(/^\d{17,19}$/)) {
                        // Discord ID
                        emoji = '💬';
                    } else if (trimmed.includes(':')) {
                        emoji = isDiscord ? '💬' : (isGaming ? '🎮' : '🔑');
                    } else {
                        // Emoji selon le type d'API
                        if (isDiscord) emoji = '💬';
                        else if (isTikTok) emoji = '🎵';
                        else if (isReddit) emoji = '🔴';
                        else if (isGithub) emoji = '💻';
                        else if (isSteam) emoji = '🎮';
                        else if (isGaming) emoji = '🎮';
                        else if (isSocial) emoji = '👥';
                        else if (isCrypto) emoji = '₿';
                        else if (isBreach) emoji = '💥';
                        else if (isIP) emoji = '🌐';
                        else if (isEmail) emoji = '📧';
                    }
                    
                    lines.push(`${emoji} ${trimmed}`);
                }
            } else if (typeof item === 'object' && item !== null) {
                // Extraire les données avec détection intelligente
                let email = '';
                let password = '';
                let username = '';
                let ip = '';
                let domain = '';
                let phone = '';
                let discordId = '';
                let robloxId = '';
                let steamId = '';
                let avatar = '';
                let displayName = '';
                
                // Parcourir toutes les clés
                for (const key in item) {
                    const value = item[key];
                    if (value === null || value === undefined) continue;
                    
                    const keyLower = key.toLowerCase();
                    const valueStr = String(value).trim();
                    
                    // Détection selon le type d'API
                    if (isDiscord) {
                        if (keyLower.includes('discord') || keyLower.includes('id') && valueStr.match(/^\d{17,19}$/)) {
                            discordId = valueStr;
                        }
                        if (keyLower.includes('username') || keyLower === 'name') username = valueStr;
                        if (keyLower.includes('avatar') || keyLower.includes('icon')) avatar = valueStr;
                        if (keyLower.includes('display') || keyLower.includes('nick')) displayName = valueStr;
                    }
                    
                    if (keyLower.includes('email') || keyLower === 'mail' || keyLower === 'e-mail') {
                        email = valueStr;
                    } else if (keyLower.includes('password') || keyLower.includes('pass') || keyLower === 'pwd') {
                        password = valueStr;
                    } else if (keyLower.includes('username') || keyLower === 'user' || keyLower === 'login') {
                        username = valueStr;
                    } else if (keyLower.includes('ip') || keyLower === 'ipaddress') {
                        ip = valueStr;
                    } else if (keyLower.includes('domain') || keyLower === 'host') {
                        domain = valueStr;
                    } else if (keyLower.includes('phone') || keyLower.includes('tel') || keyLower === 'mobile') {
                        phone = valueStr;
                    } else if (keyLower.includes('roblox')) {
                        robloxId = valueStr;
                    } else if (keyLower.includes('steam')) {
                        steamId = valueStr;
                    }
                }
                
                // Formater selon le type d'API avec emojis appropriés
                if (isDiscord) {
                    if (discordId && robloxId) {
                        lines.push(`💬 Discord: ${discordId} 🎮 Roblox: ${robloxId}`);
                    } else if (discordId && username) {
                        lines.push(`💬 ${username} (${discordId})`);
                    } else if (discordId) {
                        lines.push(`💬 Discord ID: ${discordId}`);
                    } else if (username && displayName) {
                        lines.push(`💬 ${displayName} (@${username})`);
                    } else if (username) {
                        lines.push(`💬 ${username}`);
                    } else {
                        lines.push(formatObjectWithEmojis(item, isDiscord, isTikTok, isReddit, isGithub, isSteam, isGaming, isCrypto, isBreach));
                    }
                } else if (isTikTok) {
                    if (username) {
                        lines.push(`🎵 TikTok: @${username}`);
                    } else {
                        lines.push(formatObjectWithEmojis(item, isDiscord, isTikTok, isReddit, isGithub, isSteam, isGaming, isCrypto, isBreach));
                    }
                } else if (isReddit) {
                    if (username) {
                        lines.push(`🔴 Reddit: u/${username}`);
                    } else {
                        lines.push(formatObjectWithEmojis(item, isDiscord, isTikTok, isReddit, isGithub, isSteam, isGaming, isCrypto, isBreach));
                    }
                } else if (isGithub) {
                    if (username) {
                        lines.push(`💻 GitHub: @${username}`);
                    } else if (email) {
                        lines.push(`💻 ${email}`);
                    } else {
                        lines.push(formatObjectWithEmojis(item, isDiscord, isTikTok, isReddit, isGithub, isSteam, isGaming, isCrypto, isBreach));
                    }
                } else if (isSteam || isGaming) {
                    if (steamId) {
                        lines.push(`🎮 Steam ID: ${steamId}`);
                    } else if (username) {
                        lines.push(`🎮 ${username}`);
                    } else {
                        lines.push(formatObjectWithEmojis(item, isDiscord, isTikTok, isReddit, isGithub, isSteam, isGaming, isCrypto, isBreach));
                    }
                } else {
                    // Format standard email:password avec emojis selon le contexte
                    if (isCrypto) {
                        if (email && password) {
                            lines.push(`₿ ${email} 🔐 ${password}`);
                        } else if (email) {
                            lines.push(`₿ ${email}`);
                        } else {
                            lines.push(formatObjectWithEmojis(item, isDiscord, isTikTok, isReddit, isGithub, isSteam, isGaming, isCrypto, isBreach));
                        }
                    } else if (isBreach) {
                        if (email && password) {
                            lines.push(`💥 ${email} 🔐 ${password}`);
                        } else if (email && username) {
                            lines.push(`💥 ${email} 👤 ${username}`);
                        } else if (username && password) {
                            lines.push(`💥 👤 ${username} 🔐 ${password}`);
                        } else if (email) {
                            lines.push(`💥 ${email}`);
                        } else {
                            lines.push(formatObjectWithEmojis(item, isDiscord, isTikTok, isReddit, isGithub, isSteam, isGaming, isCrypto, isBreach));
                        }
                    } else {
                        // Format standard email:password
                        if (email && password) {
                            lines.push(`📧 ${email} 🔐 ${password}`);
                        } else if (email && username) {
                            lines.push(`📧 ${email} 👤 ${username}`);
                        } else if (username && password) {
                            lines.push(`👤 ${username} 🔐 ${password}`);
                        } else if (email) {
                            lines.push(`📧 ${email}`);
                        } else if (username) {
                            lines.push(`👤 ${username}`);
                        } else if (ip) {
                            lines.push(`🌐 ${ip}`);
                        } else if (domain) {
                            lines.push(`🌍 ${domain}`);
                        } else if (phone) {
                            lines.push(`📱 ${phone}`);
                        } else {
                            lines.push(formatObjectWithEmojis(item, isDiscord, isTikTok, isReddit, isGithub, isSteam, isGaming, isCrypto, isBreach));
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error formatting result item:', error, item);
            try {
                lines.push(`⚠️ ${String(item)}`);
            } catch (e) {
                lines.push(`❌ [Error formatting item ${index}]`);
            }
        }
    });
    
    const result = lines.filter(line => line.trim().length > 0).join('\n');
    console.log('Formatted results:', result.substring(0, 500));
    return result;
}

// Fonction helper pour formater un objet avec emojis selon le contexte
function formatObjectWithEmojis(item, isDiscord, isTikTok, isReddit, isGithub, isSteam, isGaming, isCrypto = false, isBreach = false) {
    const parts = [];
    for (const key in item) {
        const value = item[key];
        if (value === null || value === undefined || typeof value === 'object' || typeof value === 'function') continue;
        
        const valueStr = String(value).trim();
        if (valueStr.length === 0 || valueStr.length > 200) continue;
        
        let emoji = '📄';
        const keyLower = key.toLowerCase();
        
        // Emojis selon le contexte API
        if (isDiscord) {
            if (keyLower.includes('discord') || keyLower.includes('id')) emoji = '💬';
            else if (keyLower.includes('username') || keyLower.includes('name')) emoji = '👤';
            else if (keyLower.includes('avatar') || keyLower.includes('icon')) emoji = '🖼️';
            else if (keyLower.includes('server') || keyLower.includes('guild')) emoji = '🏰';
            else if (keyLower.includes('token')) emoji = '🔑';
            else if (keyLower.includes('roblox')) emoji = '🎮';
        } else if (isTikTok) {
            if (keyLower.includes('username') || keyLower.includes('name')) emoji = '🎵';
            else if (keyLower.includes('video') || keyLower.includes('post')) emoji = '📹';
            else if (keyLower.includes('follower') || keyLower.includes('follow')) emoji = '👥';
        } else if (isReddit) {
            if (keyLower.includes('username') || keyLower.includes('user')) emoji = '🔴';
            else if (keyLower.includes('post') || keyLower.includes('submission')) emoji = '📝';
            else if (keyLower.includes('karma')) emoji = '⭐';
        } else if (isGithub) {
            if (keyLower.includes('username') || keyLower.includes('user')) emoji = '💻';
            else if (keyLower.includes('repo') || keyLower.includes('repository')) emoji = '📦';
            else if (keyLower.includes('email')) emoji = '📧';
        } else if (isSteam || isGaming) {
            if (keyLower.includes('steam') || keyLower.includes('id')) emoji = '🎮';
            else if (keyLower.includes('username') || keyLower.includes('name')) emoji = '👤';
            else if (keyLower.includes('game') || keyLower.includes('play')) emoji = '🎯';
        } else if (isCrypto) {
            if (keyLower.includes('wallet') || keyLower.includes('address')) emoji = '₿';
            else if (keyLower.includes('btc') || keyLower.includes('bitcoin')) emoji = '₿';
            else if (keyLower.includes('eth') || keyLower.includes('ethereum')) emoji = 'Ξ';
            else if (keyLower.includes('balance')) emoji = '💰';
            else if (keyLower.includes('transaction')) emoji = '💸';
            else emoji = '₿';
        } else if (isBreach) {
            if (keyLower.includes('email') || keyLower.includes('mail')) emoji = '💥';
            else if (keyLower.includes('password') || keyLower.includes('pass')) emoji = '🔐';
            else if (keyLower.includes('breach') || keyLower.includes('leak')) emoji = '💥';
            else if (keyLower.includes('source') || keyLower.includes('database')) emoji = '🗄️';
            else emoji = '💥';
        } else {
            // Emojis génériques
            if (keyLower.includes('email') || keyLower.includes('mail')) emoji = '📧';
            else if (keyLower.includes('password') || keyLower.includes('pass')) emoji = '🔐';
            else if (keyLower.includes('username') || keyLower.includes('user')) emoji = '👤';
            else if (keyLower.includes('ip')) emoji = '🌐';
            else if (keyLower.includes('domain')) emoji = '🌍';
            else if (keyLower.includes('phone') || keyLower.includes('tel')) emoji = '📱';
            else if (keyLower.includes('name')) emoji = '👤';
            else if (keyLower.includes('address')) emoji = '📍';
            else if (keyLower.includes('date') || keyLower.includes('time')) emoji = '📅';
            else if (keyLower.includes('breach') || keyLower.includes('leak')) emoji = '💥';
        }
        
        parts.push(`${emoji} ${key}: ${valueStr}`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : `📄 ${JSON.stringify(item)}`;
}

// Fonction pour formater les bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Copier tous les résultats
function copyAllResultsText() {
    const textElement = document.getElementById('results-text-content');
    if (textElement) {
        const content = textElement.getAttribute('data-content') || textElement.textContent || textElement.innerText;
        navigator.clipboard.writeText(content).then(() => {
            showNotification('Résultats copiés dans le presse-papiers!', 'success');
        }).catch(err => {
            // Fallback pour anciens navigateurs
            const textArea = document.createElement('textarea');
            textArea.value = content;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Résultats copiés!', 'success');
        });
    }
}

// Télécharger les résultats
function downloadResultsText() {
    const textElement = document.getElementById('results-text-content');
    if (!textElement) {
        showNotification('Aucun résultat à télécharger', 'error');
        return;
    }
    
    const content = textElement.getAttribute('data-content') || textElement.textContent || textElement.innerText;
    if (!content || content.trim().length === 0) {
        showNotification('Aucun résultat à télécharger', 'error');
        return;
    }
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results_${new Date().toISOString().split('T')[0]}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Téléchargement démarré!', 'success');
}

function createDetailResultCard(item, index, metadata = {}) {
    const card = document.createElement('div');
    card.className = 'result-item-simple';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Organiser les champs par importance
    const importantFieldPatterns = ['email', 'username', 'password', 'name', 'phone', 'ip', 'domain', 'address', 'breach', 'leak', 'source'];
    const importantFields = [];
    const normalFields = [];
    const lessImportantFields = [];
    
    for (const key in item) {
        if (item.hasOwnProperty(key) && item[key] !== null && item[key] !== undefined) {
            const keyLower = key.toLowerCase();
            if (importantFieldPatterns.some(pattern => keyLower.includes(pattern))) {
                importantFields.push(key);
            } else if (keyLower.includes('id') || keyLower.includes('date') || keyLower.includes('time')) {
                lessImportantFields.push(key);
            } else {
                normalFields.push(key);
            }
        }
    }
    
    // Trier les champs
    const sortedFields = [
        ...importantFields,
        ...normalFields,
        ...lessImportantFields
    ];
    
    let html = '<div class="result-card-content">';
    
    sortedFields.forEach(key => {
        const value = item[key];
        if (value !== null && value !== undefined) {
            const displayKey = formatKeyName(key);
            const isPassword = key.toLowerCase().includes('password') || key.toLowerCase().includes('pass');
            const isEmail = key.toLowerCase().includes('email');
            const isUrl = key.toLowerCase().includes('url') || key.toLowerCase().includes('link');
            const isDate = key.toLowerCase().includes('date') || key.toLowerCase().includes('time');
            
            // Icône selon le type de champ
            let icon = 'fa-info-circle';
            if (isPassword) icon = 'fa-lock';
            else if (isEmail) icon = 'fa-envelope';
            else if (isUrl) icon = 'fa-link';
            else if (isDate) icon = 'fa-clock';
            else if (key.toLowerCase().includes('username')) icon = 'fa-user';
            else if (key.toLowerCase().includes('phone')) icon = 'fa-phone';
            else if (key.toLowerCase().includes('ip')) icon = 'fa-network-wired';
            else if (key.toLowerCase().includes('domain')) icon = 'fa-globe';
            
            html += `
                <div class="result-field-simple">
                    <div class="result-label-simple">
                        <i class="fas ${icon}"></i>
                        <span>${displayKey}</span>
                    </div>
                    <div class="result-value-simple ${isPassword ? 'password' : ''}" 
                         ${isPassword ? `onclick="revealPassword(this)" data-value="${escapeHtml(String(value))}" title="Cliquez pour révéler"` : ''}>
                        ${isPassword ? '<span class="password-masked">••••••••</span><i class="fas fa-eye" style="margin-left: 8px; opacity: 0.5;"></i>' : formatDetailValue(value)}
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    
    card.innerHTML = html;
    return card;
}

function formatKeyName(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function formatDetailValue(value) {
    if (typeof value === 'boolean') {
        return value ? '<span style="color: var(--success);">✓ Oui</span>' : '<span style="color: var(--danger);">✗ Non</span>';
    }
    if (Array.isArray(value)) {
        return value.map(v => `<span style="display: inline-block; margin: 2px; padding: 4px 8px; background: rgba(139,92,246,0.1); border-radius: 4px;">${escapeHtml(String(v))}</span>`).join('');
    }
    if (typeof value === 'object') {
        return `<pre style="font-size: 11px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; overflow-x: auto; max-height: 200px; overflow-y: auto;">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
    }
    return escapeHtml(String(value));
}

function revealPassword(element) {
    const actualValue = element.getAttribute('data-value');
    if (element.textContent === '••••••••') {
        element.textContent = actualValue;
        element.style.color = 'var(--primary-purple-light)';
        copyToClipboard(actualValue);
        showNotification('Mot de passe révélé et copié!');
    } else {
        element.textContent = '••••••••';
    }
}

function copyDetailResults() {
    const results = document.querySelectorAll('.detail-result-card');
    let text = '';
    
    results.forEach(card => {
        const fields = card.querySelectorAll('.detail-result-field');
        fields.forEach(field => {
            const label = field.querySelector('.detail-result-label').textContent;
            const value = field.querySelector('.detail-result-value').textContent;
            text += `${label}: ${value}\n`;
        });
        text += '\n---\n\n';
    });
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Résultats copiés dans le presse-papiers!');
    });
}

function clearDetailResults() {
    const resultsSection = document.getElementById('detail-results-section');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
    const container = document.getElementById('detail-results-container');
    if (container) {
        container.innerHTML = '';
    }
    const count = document.getElementById('detail-results-count');
    if (count) {
        count.textContent = '0';
    }
}

function detectDetailInputType() {
    const input = document.getElementById('detail-search-input');
    const query = input.value.trim();
    const badge = document.getElementById('detail-detection-badge');
    const text = document.getElementById('detail-detection-text');
    
    if (!query) {
        badge.style.display = 'none';
        return;
    }
    
    badge.style.display = 'flex';
    
    // Email detection
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query)) {
        text.textContent = '✓ Email valide détecté';
        badge.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        return;
    }
    
    // IP detection
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(query)) {
        text.textContent = '✓ Adresse IP valide détectée';
        badge.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        return;
    }
    
    // Username detection
    if (/^[a-zA-Z0-9_]+$/.test(query) && !query.includes('@') && !query.includes('.')) {
        text.textContent = '✓ Username valide détecté';
        badge.style.borderColor = 'rgba(255, 0, 110, 0.5)';
        return;
    }
    
    // Domain detection
    if (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(query)) {
        text.textContent = '✓ Domaine valide détecté';
        badge.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        return;
    }
    
    text.textContent = '⚠ Format à vérifier';
    badge.style.borderColor = 'rgba(245, 158, 11, 0.5)';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}

// Global Search Functions
function detectGlobalInputType() {
    const input = document.getElementById('global-search-input').value.trim();
    const badge = document.getElementById('global-detection-badge');
    const text = document.getElementById('global-detection-text');
    
    if (!input) {
        badge.style.display = 'none';
        return;
    }
    
    badge.style.display = 'flex';
    
    // Email detection
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
        text.textContent = 'Email détecté - Modules Email recommandés';
        badge.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        return;
    }
    
    // IP detection
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(input)) {
        text.textContent = 'Adresse IP détectée - Modules IP/Network recommandés';
        badge.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        return;
    }
    
    // Username detection
    if (/^[a-zA-Z0-9_]+$/.test(input) && !input.includes('@') && !input.includes('.')) {
        text.textContent = 'Username détecté - Modules Social Media recommandés';
        badge.style.borderColor = 'rgba(255, 0, 110, 0.5)';
        return;
    }
    
    // Domain detection
    if (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(input)) {
        text.textContent = 'Domaine détecté - Modules Domain recommandés';
        badge.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        return;
    }
    
    text.textContent = 'Type inconnu - Tous les modules disponibles';
    badge.style.borderColor = 'rgba(255, 255, 255, 0.3)';
}

async function searchWithAPI(apiKey) {
    const input = document.getElementById('global-search-input');
    const query = input.value.trim();
    
    if (!query) {
        showNotification('Veuillez entrer une requête de recherche', 'error');
        input.focus();
        return;
    }
    
    if (typeof API_CONFIG === 'undefined' || !API_CONFIG[apiKey]) {
        showNotification('Module API non configuré', 'error');
        return;
    }
    
    const config = API_CONFIG[apiKey];
    
    // Ouvrir le modal de résultats
    openResultModal(apiKey, query);
    
    // Afficher le chargement
    const resultContent = document.getElementById('api-result-content');
    resultContent.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner"></i>
            <p>Recherche en cours avec ${apiKey}...</p>
        </div>
    `;
    
    try {
        const apiKey_breachhub = localStorage.getItem('breachhub_api_key') || 'mriuBN4nIPYLpcDeIYiQtEKz0GGhCT';
        
        let url = `https://breachhub.org/api${config.endpoint}?`;
        url += `${config.param}=${encodeURIComponent(query)}`;
        
        if (config.category) url += `&category=${encodeURIComponent(config.category)}`;
        if (config.type) url += `&type=${encodeURIComponent(config.type)}`;
        if (config.types) url += `&type=${encodeURIComponent(config.types)}`;
        if (config.module) url += `&module=${encodeURIComponent(config.module)}`;
        if (config.bucket) url += `&bucket=${encodeURIComponent(config.bucket)}`;
        if (config.file) url += `&file=${encodeURIComponent(config.file)}`;
        
        url += `&key=${encodeURIComponent(apiKey_breachhub)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Clé API invalide');
            } else if (response.status === 429) {
                throw new Error('Limite de taux dépassée. Attendez 30 minutes.');
            } else {
                throw new Error(`Erreur API: ${response.status}`);
            }
        }
        
        const data = await response.json();
        displayAPIResults(data, apiKey, query);
        
    } catch (error) {
        resultContent.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--danger);">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px;"></i>
                <p style="font-size: 16px; font-weight: 600;">Erreur de recherche</p>
                <p style="font-size: 14px; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

function openResultModal(apiKey, query) {
    const modal = document.getElementById('api-result-modal');
    const title = document.getElementById('result-modal-title');
    
    title.textContent = `Résultats: ${apiKey} - ${query}`;
    modal.classList.remove('hidden');
}

function closeResultModal() {
    document.getElementById('api-result-modal').classList.add('hidden');
}

function displayAPIResults(data, apiKey, query) {
    const resultContent = document.getElementById('api-result-content');
    resultContent.innerHTML = '';
    
    // Header
    const header = document.createElement('div');
    header.style.marginBottom = '20px';
    header.style.padding = '15px';
    header.style.background = 'rgba(239, 68, 68, 0.1)';
    header.style.borderRadius = '8px';
    header.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    header.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
                <h3 style="color: var(--primary-purple-light); margin-bottom: 5px;">Module: ${apiKey}</h3>
                <p style="color: var(--text-secondary); font-size: 12px;">Requête: <strong>${query}</strong></p>
            </div>
            <button onclick="copyAPIResults()" class="key-action-btn">
                <i class="fas fa-copy"></i> Copier
            </button>
        </div>
    `;
    resultContent.appendChild(header);
    
    // Results
    if (Array.isArray(data) && data.length > 0) {
        data.forEach((item, index) => {
            const resultItem = createResultItem(item, index);
            resultContent.appendChild(resultItem);
        });
    } else if (typeof data === 'object' && data !== null) {
        // Check for nested results
        if (data.results && Array.isArray(data.results)) {
            data.results.forEach((item, index) => {
                const resultItem = createResultItem(item, index);
                resultContent.appendChild(resultItem);
            });
        } else if (data.data && Array.isArray(data.data)) {
            data.data.forEach((item, index) => {
                const resultItem = createResultItem(item, index);
                resultContent.appendChild(resultItem);
            });
        } else {
            // Single object
            const resultItem = createResultItem(data, 0);
            resultContent.appendChild(resultItem);
        }
    } else {
        resultContent.innerHTML += `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Aucun résultat trouvé</p>
            </div>
        `;
    }
}

function createResultItem(item, index) {
    const resultItem = document.createElement('div');
    resultItem.className = 'api-result-item';
    resultItem.style.animationDelay = `${index * 0.1}s`;
    
    let html = '';
    for (const key in item) {
        if (item.hasOwnProperty(key) && item[key] !== null && item[key] !== undefined) {
            const value = item[key];
            const displayKey = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
            
            html += `
                <div class="api-result-field">
                    <div class="api-result-label">${displayKey}:</div>
                    <div class="api-result-value">${formatResultValue(value)}</div>
                </div>
            `;
        }
    }
    
    resultItem.innerHTML = html;
    return resultItem;
}

function formatResultValue(value) {
    if (typeof value === 'boolean') {
        return value ? '<span style="color: var(--success);">✓ Oui</span>' : '<span style="color: var(--danger);">✗ Non</span>';
    }
    if (Array.isArray(value)) {
        return value.map(v => `<span style="display: inline-block; margin: 2px; padding: 4px 8px; background: rgba(139,92,246,0.1); border-radius: 4px;">${v}</span>`).join('');
    }
    if (typeof value === 'object') {
        return `<pre style="font-size: 11px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(value, null, 2)}</pre>`;
    }
    return String(value);
}

function performGlobalSearch() {
    const input = document.getElementById('global-search-input').value.trim();
    if (!input) {
        showNotification('Veuillez entrer une requête', 'error');
        return;
    }
    
    // Auto-select first appropriate API based on input type
    detectGlobalInputType();
    
    // Show notification to select an API
    showNotification('Sélectionnez un module API ci-dessous pour lancer la recherche', 'info');
}

function copyAPIResults() {
    const resultContent = document.getElementById('api-result-content');
    const text = resultContent.innerText;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Résultats copiés dans le presse-papiers!');
    });
}

// Make functions globally available
window.showTab = showTab;
window.generateKeyInput = generateKeyInput;
window.createKey = createKey;
window.filterKeys = filterKeys;
window.copyKey = copyKey;
window.deleteKey = deleteKey;
window.refreshKeys = refreshKeys;
window.handleFileSelect = handleFileSelect;
window.uploadDatabase = uploadDatabase;
window.viewDatabase = viewDatabase;
window.deleteDatabase = deleteDatabase;
window.refreshDatabases = refreshDatabases;
window.goToSearch = goToSearch;
window.closeSearchPanel = closeSearchPanel;
window.performSearch = performSearch;
window.logout = logout;
window.searchWithAPI = searchWithAPI;
window.detectGlobalInputType = detectGlobalInputType;
window.performGlobalSearch = performGlobalSearch;
window.openResultModal = openResultModal;
window.closeResultModal = closeResultModal;
window.copyAPIResults = copyAPIResults;
window.populateAPIModules = populateAPIModules;
window.openAPIDetail = openAPIDetail;
window.closeAPIDetail = closeAPIDetail;
window.performDetailSearch = performDetailSearch;
window.useExample = useExample;
window.copyDetailResults = copyDetailResults;
window.clearDetailResults = clearDetailResults;
window.detectDetailInputType = detectDetailInputType;
window.revealPassword = revealPassword;
window.copyAllResultsText = copyAllResultsText;

// ==================== PAYMENT SYSTEM ====================

let selectedPlanId = null;
let paymentPlans = {};

async function loadPaymentData() {
    try {
        const backendUrl = window.CONFIG ? window.CONFIG.getBackendUrl() : 'http://localhost:5000';
        const token = localStorage.getItem('auth_token');
        
        // Charger les plans
        const plansResponse = await fetch(`${backendUrl}/api/payment/plans`);
        const plansData = await plansResponse.json();
        if (plansData.success) {
            paymentPlans = plansData.plans;
        }
        
        // Charger l'abonnement actuel
        const subResponse = await fetch(`${backendUrl}/api/payment/subscription`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const subData = await subResponse.json();
        if (subData.success && subData.subscription) {
            displayCurrentSubscription(subData.subscription);
        } else {
            document.getElementById('current-subscription-card').style.display = 'none';
        }
        
        // Charger l'historique des paiements
        loadPaymentHistory();
    } catch (error) {
        console.error('Erreur lors du chargement des données de paiement:', error);
    }
}

function displayCurrentSubscription(subscription) {
    const card = document.getElementById('current-subscription-card');
    const statusDiv = document.getElementById('subscription-status');
    
    const expiresAt = new Date(subscription.expires_at);
    const isActive = expiresAt > new Date();
    
    statusDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3);">
            <div>
                <h4 style="margin: 0 0 8px 0; color: var(--text);">Plan ${subscription.plan_name}</h4>
                <p style="margin: 0; color: var(--text-muted); font-size: 14px;">
                    ${isActive ? 'Actif' : 'Expiré'} - Expire le ${expiresAt.toLocaleDateString('fr-FR')}
                </p>
            </div>
            <div>
                <span style="padding: 6px 12px; background: ${isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${isActive ? '#10b981' : '#ef4444'}; border-radius: 6px; font-size: 12px; font-weight: 600;">
                    ${isActive ? 'ACTIF' : 'EXPIRÉ'}
                </span>
            </div>
        </div>
    `;
    
    card.style.display = 'block';
}

function selectPlan(planId) {
    // Rediriger vers la page de paiement
    window.location.href = `payment.html?plan=${planId}`;
}

function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
    document.getElementById('payment-form').reset();
    selectedPlanId = null;
}

async function processPayment(event) {
    event.preventDefault();
    
    if (!selectedPlanId) {
        showNotification('Veuillez sélectionner un plan', 'error');
        return;
    }
    
    const cardName = document.getElementById('card-name').value;
    const cardNumber = document.getElementById('card-number').value;
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;
    const billingEmail = document.getElementById('billing-email').value;
    
    const backendUrl = window.CONFIG ? window.CONFIG.getBackendUrl() : 'http://localhost:5000';
    const token = localStorage.getItem('auth_token');
    
    try {
        const response = await fetch(`${backendUrl}/api/payment/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                plan_id: selectedPlanId,
                card_name: cardName,
                card_number: cardNumber,
                card_expiry: cardExpiry,
                card_cvv: cardCvv,
                billing_email: billingEmail
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Paiement traité avec succès !', 'success');
            closePaymentModal();
            loadPaymentData();
            showTab('payment');
        } else {
            showNotification(data.error || 'Erreur lors du traitement du paiement', 'error');
        }
    } catch (error) {
        console.error('Erreur lors du paiement:', error);
        showNotification('Erreur de connexion au serveur', 'error');
    }
}

async function loadPaymentHistory() {
    try {
        const backendUrl = window.CONFIG ? window.CONFIG.getBackendUrl() : 'http://localhost:5000';
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch(`${backendUrl}/api/payment/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayPaymentHistory(data.payments);
        }
    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        document.getElementById('payment-history').innerHTML = `
            <p style="text-align: center; color: var(--text-muted); padding: 20px;">
                Erreur lors du chargement de l'historique
            </p>
        `;
    }
}

function displayPaymentHistory(payments) {
    const historyDiv = document.getElementById('payment-history');
    
    if (payments.length === 0) {
        historyDiv.innerHTML = `
            <p style="text-align: center; color: var(--text-muted); padding: 20px;">
                Aucun paiement enregistré
            </p>
        `;
        return;
    }
    
    historyDiv.innerHTML = payments.map(payment => {
        const date = new Date(payment.created_at);
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; margin-bottom: 12px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; border: 1px solid var(--border);">
                <div>
                    <h4 style="margin: 0 0 4px 0; color: var(--text);">${payment.plan_name}</h4>
                    <p style="margin: 0; color: var(--text-muted); font-size: 13px;">
                        ${date.toLocaleDateString('fr-FR')} - ${payment.transaction_id}
                    </p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0 0 4px 0; color: var(--text); font-weight: 600; font-size: 18px;">
                        ${payment.amount}€
                    </p>
                    <span style="padding: 4px 8px; background: rgba(16, 185, 129, 0.2); color: #10b981; border-radius: 4px; font-size: 11px; font-weight: 600;">
                        ${payment.status.toUpperCase()}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Formatage automatique des champs de carte
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const cardNumberInput = document.getElementById('card-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                value = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = value;
            });
        }
        
        const cardExpiryInput = document.getElementById('card-expiry');
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }
        
        const cardCvvInput = document.getElementById('card-cvv');
        if (cardCvvInput) {
            cardCvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }
    }, 500);
});

window.selectPlan = selectPlan;
window.closePaymentModal = closePaymentModal;
window.processPayment = processPayment;
window.downloadResultsText = downloadResultsText;

