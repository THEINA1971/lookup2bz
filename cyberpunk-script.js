// Cyberpunk OSINT Panel - Main Script

// Configuration
const BREACHHUB_API_BASE = "https://breachhub.org/api";
const DEFAULT_API_KEY = "mriuBN4nIPYLpcDeIYiQtEKz0GGhCT";
const MASTER_PASSWORD = "ADMIN-2024"; // Change this!
const MASTER_KEY = "BH-MASTER-2024"; // Clé master pour accès admin complet

// State
let currentApiKey = localStorage.getItem('breachhub_api_key') || DEFAULT_API_KEY;
let selectedDuration = '1h';
let currentUserKey = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser la clé master en premier
    initializeMasterKey();
    
    // Vérifier si une clé est déjà stockée
    checkStoredKey();
    
    // Charger le statut API
    loadAPIStatus();
    
    // Populer le sélecteur d'API
    populateAPISelector();
    
    // Vérifier le statut API toutes les 30 secondes
    setInterval(loadAPIStatus, 30000);
    
    // Permettre la validation avec Enter
    const keyInput = document.getElementById('key-input');
    if (keyInput) {
        keyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyKey();
            }
        });
    }
});

// Initialize Master Key System
function initializeMasterKey() {
    try {
        const keys = JSON.parse(localStorage.getItem('breachhub_keys') || '{}');
        
        // Create master key if it doesn't exist
        if (!keys[MASTER_KEY]) {
            const masterKeyData = {
                code: MASTER_KEY,
                createdAt: Date.now(),
                expiresAt: Infinity, // Lifetime
                duration: 'lifetime',
                status: 'active',
                isMaster: true, // Flag to identify master key
                permissions: ['admin', 'generate_keys', 'delete_keys', 'view_all_keys']
            };
            
            keys[MASTER_KEY] = masterKeyData;
            localStorage.setItem('breachhub_keys', JSON.stringify(keys));
            
            console.log('✅ Master key initialized:', MASTER_KEY);
            displayMasterKeyInfo();
        } else {
            console.log('✅ Master key already exists');
        }
    } catch (error) {
        console.error('❌ Error initializing master key:', error);
        // Créer un nouveau storage si corrompu
        const masterKeyData = {
            code: MASTER_KEY,
            createdAt: Date.now(),
            expiresAt: Infinity,
            duration: 'lifetime',
            status: 'active',
            isMaster: true,
            permissions: ['admin', 'generate_keys', 'delete_keys', 'view_all_keys']
        };
        localStorage.setItem('breachhub_keys', JSON.stringify({ [MASTER_KEY]: masterKeyData }));
        console.log('✅ Master key recreated after error');
    }
}

// Key Management System
function generateKeyCode() {
    const prefix = 'BH-';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + code;
}

function getDurationMs(duration) {
    const durations = {
        '1h': 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '1w': 7 * 24 * 60 * 60 * 1000,
        '1m': 30 * 24 * 60 * 60 * 1000,
        'lifetime': Infinity
    };
    return durations[duration] || durations['1h'];
}

function selectDuration(duration) {
    selectedDuration = duration;
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.duration === duration) {
            btn.classList.add('active');
        }
    });
}

function generateKey() {
    const keyCode = generateKeyCode();
    const now = Date.now();
    const durationMs = getDurationMs(selectedDuration);
    const expiresAt = durationMs === Infinity ? Infinity : now + durationMs;
    
    const keyData = {
        code: keyCode,
        createdAt: now,
        expiresAt: expiresAt,
        duration: selectedDuration,
        status: 'active'
    };
    
    // Save to localStorage
    const keys = JSON.parse(localStorage.getItem('breachhub_keys') || '{}');
    keys[keyCode] = keyData;
    localStorage.setItem('breachhub_keys', JSON.stringify(keys));
    
    // Display generated key
    document.getElementById('new-key-text').textContent = keyCode;
    document.getElementById('generated-key').classList.remove('hidden');
    
    // Play sound
    playBeep();
    
    // Refresh keys list
    displayKeys();
    
    showNotification('Key generated successfully!');
}

function copyKey() {
    const keyText = document.getElementById('new-key-text').textContent;
    navigator.clipboard.writeText(keyText).then(() => {
        showNotification('Key copied to clipboard!');
    });
}

function displayKeys() {
    const keys = JSON.parse(localStorage.getItem('breachhub_keys') || '{}');
    const container = document.getElementById('keys-container');
    container.innerHTML = '';
    
    const keysArray = Object.entries(keys).sort((a, b) => {
        // Master key first
        if (a[1].isMaster) return -1;
        if (b[1].isMaster) return 1;
        return b[1].createdAt - a[1].createdAt;
    });
    
    if (keysArray.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No keys generated yet</p>';
        return;
    }
    
    keysArray.forEach(([code, data]) => {
        const now = Date.now();
        const isExpired = data.expiresAt !== Infinity && now > data.expiresAt;
        const status = isExpired ? 'expired' : 'active';
        const isMaster = data.isMaster || code === MASTER_KEY;
        
        const keyItem = document.createElement('div');
        keyItem.className = `key-item ${status} ${isMaster ? 'master-key' : ''}`;
        if (isMaster) {
            keyItem.style.borderColor = 'rgba(255, 215, 0, 0.5)';
            keyItem.style.background = 'rgba(255, 215, 0, 0.05)';
        }
        
        const createdAt = new Date(data.createdAt).toLocaleString();
        const expiresAt = data.expiresAt === Infinity 
            ? 'Never (Lifetime)' 
            : new Date(data.expiresAt).toLocaleString();
        
        keyItem.innerHTML = `
            <div class="key-info">
                <div class="key-code" style="${isMaster ? 'color: #ffd700; text-shadow: 0 0 10px #ffd700;' : ''}">
                    ${code} ${isMaster ? '<i class="fas fa-crown" style="margin-left: 8px; color: #ffd700;"></i>' : ''}
                </div>
                <div class="key-meta">
                    ${isMaster ? '<strong style="color: #ffd700;">🔑 MASTER KEY - Full Admin Access</strong><br>' : ''}
                    Created: ${createdAt}<br>
                    Expires: ${expiresAt}<br>
                    Duration: ${data.duration}
                    ${isMaster ? '<br><span style="color: #94a3b8; font-size: 11px;">Can generate and manage all keys</span>' : ''}
                </div>
            </div>
            <span class="key-status ${status}" style="${isMaster ? 'background: rgba(255, 215, 0, 0.2); color: #ffd700; border-color: rgba(255, 215, 0, 0.4);' : ''}">
                ${isMaster ? 'MASTER' : status.toUpperCase()}
            </span>
            ${!isMaster ? `<button onclick="deleteKey('${code}')" class="cyber-button-small danger" style="padding: 8px 15px;">
                <i class="fas fa-trash"></i>
            </button>` : '<span style="padding: 8px 15px; color: #94a3b8; font-size: 11px;">Protected</span>'}
        `;
        
        container.appendChild(keyItem);
    });
}

function deleteKey(code) {
    // Prevent deletion of master key
    if (code === MASTER_KEY) {
        showNotification('Cannot delete master key!', 'error');
        return;
    }
    
    if (confirm(`Delete key ${code}?`)) {
        const keys = JSON.parse(localStorage.getItem('breachhub_keys') || '{}');
        delete keys[code];
        localStorage.setItem('breachhub_keys', JSON.stringify(keys));
        displayKeys();
        showNotification('Key deleted');
    }
}

// Admin Functions
function showAdminLogin() {
    // Check if current user has master key
    if (currentUserKey === MASTER_KEY) {
        showAdminPanel();
        return;
    }
    
    document.getElementById('admin-panel').classList.remove('hidden');
    document.getElementById('admin-login-section').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

function verifyAdmin() {
    const password = document.getElementById('admin-password').value;
    if (password === MASTER_PASSWORD) {
        document.getElementById('admin-login-section').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        displayKeys();
        playBeep();
    } else {
        showNotification('Invalid master password!', 'error');
        document.getElementById('admin-password').value = '';
    }
}

function closeAdmin() {
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('admin-password').value = '';
}

// Key Verification
function checkStoredKey() {
    const storedKey = localStorage.getItem('current_user_key');
    if (storedKey) {
        if (verifyKey(storedKey, false)) {
            currentUserKey = storedKey;
            showDashboard();
        } else {
            localStorage.removeItem('current_user_key');
        }
    }
}

function verifyKey(key = null, showError = true) {
    // Si aucune clé n'est passée, récupérer depuis l'input
    if (!key) {
        const keyInput = document.getElementById('key-input');
        if (!keyInput) {
            console.error('Key input not found');
            return false;
        }
        key = keyInput.value.trim();
    }
    
    if (!key) {
        if (showError) {
            const errorDiv = document.getElementById('login-error');
            if (errorDiv) {
                errorDiv.classList.remove('hidden');
                errorDiv.querySelector('span').textContent = 'Please enter a key';
                setTimeout(() => {
                    errorDiv.classList.add('hidden');
                }, 3000);
            }
        }
        return false;
    }
    
    // Charger les clés depuis localStorage
    const keys = JSON.parse(localStorage.getItem('breachhub_keys') || '{}');
    
    // Vérifier si c'est la clé master (même si elle n'est pas encore dans le storage)
    if (key === MASTER_KEY) {
        // S'assurer que la clé master existe
        if (!keys[MASTER_KEY]) {
            initializeMasterKey();
        }
        currentUserKey = MASTER_KEY;
        localStorage.setItem('current_user_key', MASTER_KEY);
        showDashboard();
        setTimeout(() => {
            showAdminPanel();
        }, 500);
        playBeep();
        return true;
    }
    
    const keyData = keys[key];
    
    if (!keyData) {
        if (showError) {
            const errorDiv = document.getElementById('login-error');
            if (errorDiv) {
                errorDiv.classList.remove('hidden');
                errorDiv.querySelector('span').textContent = 'Invalid key';
                setTimeout(() => {
                    errorDiv.classList.add('hidden');
                }, 3000);
            }
        }
        return false;
    }
    
    const now = Date.now();
    const isExpired = keyData.expiresAt !== Infinity && now > keyData.expiresAt;
    
    if (isExpired) {
        if (showError) {
            const errorDiv = document.getElementById('login-error');
            if (errorDiv) {
                errorDiv.classList.remove('hidden');
                errorDiv.querySelector('span').textContent = 'Key has expired';
                setTimeout(() => {
                    errorDiv.classList.add('hidden');
                }, 3000);
            }
        }
        return false;
    }
    
    currentUserKey = key;
    localStorage.setItem('current_user_key', key);
    
    // Check if it's a master key - show admin panel directly
    if (keyData.isMaster || key === MASTER_KEY) {
        showDashboard();
        // Auto-open admin panel for master key
        setTimeout(() => {
            showAdminPanel();
        }, 500);
        playBeep();
        return true;
    }
    
    showDashboard();
    playBeep();
    return true;
}

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-dashboard').classList.remove('hidden');
}

function showAdminPanel() {
    document.getElementById('admin-panel').classList.remove('hidden');
    document.getElementById('admin-login-section').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    displayKeys();
}

function logout() {
    if (confirm('Logout from dashboard?')) {
        currentUserKey = null;
        localStorage.removeItem('current_user_key');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-dashboard').classList.add('hidden');
        document.getElementById('key-input').value = '';
        clearResults();
    }
}

// Input Type Detection
function detectInputType() {
    const input = document.getElementById('search-input').value.trim();
    const badge = document.getElementById('detection-badge');
    
    if (!input) {
        badge.innerHTML = '<i class="fas fa-brain"></i><span>Auto-Detecting...</span>';
        return;
    }
    
    // Email detection
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
        badge.innerHTML = '<i class="fas fa-envelope"></i><span>Email Detected</span>';
        badge.style.borderColor = 'rgba(0, 240, 255, 0.5)';
        autoSelectAPI('email');
        return;
    }
    
    // IP detection
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(input)) {
        badge.innerHTML = '<i class="fas fa-network-wired"></i><span>IP Address Detected</span>';
        badge.style.borderColor = 'rgba(176, 38, 255, 0.5)';
        autoSelectAPI('ip');
        return;
    }
    
    // Username detection (alphanumeric, no spaces, no @)
    if (/^[a-zA-Z0-9_]+$/.test(input) && !input.includes('@') && !input.includes('.')) {
        badge.innerHTML = '<i class="fas fa-user"></i><span>Username Detected</span>';
        badge.style.borderColor = 'rgba(255, 0, 110, 0.5)';
        autoSelectAPI('username');
        return;
    }
    
    // Domain detection
    if (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(input)) {
        badge.innerHTML = '<i class="fas fa-globe"></i><span>Domain Detected</span>';
        badge.style.borderColor = 'rgba(0, 240, 255, 0.5)';
        autoSelectAPI('domain');
        return;
    }
    
    badge.innerHTML = '<i class="fas fa-question"></i><span>Unknown Type</span>';
    badge.style.borderColor = 'rgba(255, 255, 255, 0.3)';
}

function autoSelectAPI(type) {
    const selector = document.getElementById('api-selector');
    const typeMap = {
        'email': ['leakcheck', 'intelvault', 'seon-email', 'hudsonrock'],
        'ip': ['ipinfo', 'shodan-host', 'intelfetch-ip'],
        'username': ['memory', 'reddit', 'tiktok-basic', 'intelfetch-github'],
        'domain': ['intelfetch-domain', 'shodan-search']
    };
    
    const options = typeMap[type] || [];
    if (options.length > 0 && !selector.value || !options.includes(selector.value)) {
        selector.value = options[0];
        updateInputField();
    }
}

// API Status Check
async function loadAPIStatus() {
    const statusDot = document.getElementById('api-status-dot');
    const statusText = document.getElementById('api-status-text');
    
    try {
        const startTime = Date.now();
        const response = await fetch(`${BREACHHUB_API_BASE}/snusbase?query=test@test.com&key=${currentApiKey}`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        const ping = Date.now() - startTime;
        
        if (response.ok || response.status === 400) { // 400 means API is working but query is invalid
            statusDot.style.background = '#10b981';
            statusDot.style.boxShadow = '0 0 10px #10b981';
            statusText.textContent = `API: Online (${ping}ms)`;
        } else {
            throw new Error('API Error');
        }
    } catch (error) {
        statusDot.style.background = '#ef4444';
        statusDot.style.boxShadow = '0 0 10px #ef4444';
        statusText.textContent = 'API: Offline';
    }
}

// Populate API Selector
function populateAPISelector() {
    const selector = document.getElementById('api-selector');
    const categories = {
        'Breach Search': ['snusbase', 'leakosint', 'leakcheck', 'intelvault', 'breachbase', 'hackcheck'],
        'Email & Phone': ['seon-email', 'seon-phone', 'github', 'hudsonrock', 'intelbase-email'],
        'Social Media': ['memory', 'reddit', 'tiktok-basic', 'tiktok-full', 'intelfetch-github', 'intelbase-github'],
        'Discord': ['discord-lookup', 'discord-stalker', 'cordcat', 'oathnet-discord'],
        'IP/Network': ['ipinfo', 'shodan-host', 'shodan-search', 'intelfetch-ip', 'intelfetch-domain', 'intelbase-ip'],
        'Gaming': ['steam', 'crowsint', 'crowsint-social', 'intelbase-minecraft'],
        'Other': ['keyscore-email', 'keyscore-url', 'oathnet-breach', 'oathnet-stealer', 'breachrip', 'breachvip', 'akula', 'leaksight', 'osintkit', 'vindecoder', 'binlist', 'crypto']
    };
    
    selector.innerHTML = '';
    
    Object.entries(categories).forEach(([category, apis]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;
        
        apis.forEach(api => {
            const option = document.createElement('option');
            option.value = api;
            option.textContent = api.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            optgroup.appendChild(option);
        });
        
        selector.appendChild(optgroup);
    });
    
    // Load API config from osint-panel.js if available
    if (typeof API_CONFIG !== 'undefined') {
        updateInputField();
    }
}

// Update Input Field (from osint-panel.js)
function updateInputField() {
    if (typeof API_CONFIG === 'undefined') return;
    
    const selector = document.getElementById('api-selector');
    const selectedApi = selector.value;
    const config = API_CONFIG[selectedApi];
    
    if (!config) return;
    
    const input = document.getElementById('search-input');
    const label = document.getElementById('input-label');
    const icon = document.querySelector('.search-input .input-icon');
    
    input.type = config.inputType || 'text';
    input.placeholder = `Enter ${config.inputLabel.toLowerCase()}...`;
    
    if (icon) {
        icon.className = `fas ${config.inputIcon} input-icon`;
    }
}

// Enhanced Display Results with Laser Scan
function displayResultsCyberpunk(data, apiName, query) {
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');
    
    resultsSection.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    
    const formattedData = extractAndFormatData(data, apiName);
    const resultCount = formattedData.length;
    
    document.getElementById('results-count').textContent = resultCount;
    
    // Play beep sound
    playBeep();
    
    // Display results
    formattedData.forEach((item, index) => {
        const card = createCyberpunkCard(item, index, apiName);
        resultsContainer.appendChild(card);
    });
    
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function createCyberpunkCard(item, index, apiType) {
    const card = document.createElement('div');
    card.className = 'data-card-cyber';
    card.style.animationDelay = `${index * 0.1}s`;
    
    let html = '';
    
    for (const key in item) {
        if (item.hasOwnProperty(key) && item[key] !== null && item[key] !== undefined) {
            const value = item[key];
            const displayKey = formatKey(key);
            const isPassword = key.toLowerCase().includes('password') || key.toLowerCase().includes('pass');
            
            html += `
                <div class="card-field">
                    <div class="field-label">${displayKey}</div>
                    <div class="field-value">
                        ${isPassword 
                            ? `<span class="password-masked" onclick="revealPassword(this)" data-value="${escapeHtml(value)}">••••••••</span>`
                            : formatValueForDisplay(key, value)
                        }
                    </div>
                </div>
            `;
        }
    }
    
    card.innerHTML = html;
    return card;
}

function revealPassword(element) {
    const actualValue = element.getAttribute('data-value');
    if (element.textContent === '••••••••') {
        element.textContent = actualValue;
        copyToClipboard(actualValue);
    } else {
        element.textContent = '••••••••';
    }
}

// Copy Functions
function copyAllResults() {
    const cards = document.querySelectorAll('.data-card-cyber');
    const results = [];
    
    cards.forEach(card => {
        const cardData = {};
        const fields = card.querySelectorAll('.card-field');
        fields.forEach(field => {
            const key = field.querySelector('.field-label').textContent;
            const value = field.querySelector('.field-value').textContent;
            cardData[key] = value;
        });
        results.push(cardData);
    });
    
    const text = JSON.stringify(results, null, 2);
    copyToClipboard(text);
    showNotification('All results copied!');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!');
    });
}

// Export PDF
function exportPDF() {
    showNotification('PDF export feature coming soon!', 'info');
    // PDF export would require jsPDF library
}

// Clear Results
function clearResults() {
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('results-container').innerHTML = '';
    document.getElementById('search-input').value = '';
    detectInputType();
}

// Utility Functions
function formatKey(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function formatValueForDisplay(key, value) {
    if (typeof value === 'boolean') {
        return value ? '<span style="color: #10b981;">✓ Yes</span>' : '<span style="color: #ef4444;">✗ No</span>';
    }
    if (Array.isArray(value)) {
        return value.map(v => `<span style="display: inline-block; margin: 2px; padding: 4px 8px; background: rgba(0,240,255,0.1); border-radius: 4px;">${v}</span>`).join('');
    }
    if (typeof value === 'object') {
        return `<pre style="font-size: 11px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(value, null, 2)}</pre>`;
    }
    return escapeHtml(String(value));
}

function extractAndFormatData(data, apiType) {
    if (Array.isArray(data)) {
        return data;
    }
    if (typeof data === 'object' && data !== null) {
        if (data.results && Array.isArray(data.results)) return data.results;
        if (data.data && Array.isArray(data.data)) return data.data;
        if (data.leaks && Array.isArray(data.leaks)) return data.leaks;
        return [data];
    }
    return [{ value: String(data) }];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notification-text');
    
    text.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Sound Effects
function playBeep() {
    const audio = document.getElementById('beep-sound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {}); // Ignore errors if autoplay is blocked
    }
}

// Glitch Effect on Hover
document.addEventListener('DOMContentLoaded', () => {
    const titles = document.querySelectorAll('.cyber-title, .section-title');
    titles.forEach(title => {
        title.addEventListener('mouseenter', function() {
            this.classList.add('glitch');
        });
        title.addEventListener('mouseleave', function() {
            this.classList.remove('glitch');
        });
    });
});

// Integrate with osint-panel.js
window.displayResultsCyberpunk = displayResultsCyberpunk;

// Override performSearch to use our display function
const originalPerformSearch = window.performSearch;
window.performSearch = async function() {
    const query = document.getElementById('search-input').value.trim();
    const api = document.getElementById('api-selector').value;
    
    if (!query) {
        showNotification('Please enter a query', 'error');
        return;
    }
    
    if (typeof API_CONFIG === 'undefined' || !API_CONFIG[api]) {
        showNotification('API not configured', 'error');
        return;
    }
    
    showLoading('Executing query...');
    
    try {
        const config = API_CONFIG[api];
        let url = `${BREACHHUB_API_BASE}${config.endpoint}?`;
        url += `${config.param}=${encodeURIComponent(query)}`;
        
        if (config.category) url += `&category=${encodeURIComponent(config.category)}`;
        if (config.type) url += `&type=${encodeURIComponent(config.type)}`;
        if (config.types) url += `&type=${encodeURIComponent(config.types)}`;
        
        url += `&key=${encodeURIComponent(currentApiKey)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Wait 30 minutes.');
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        }
        
        const data = await response.json();
        displayResultsCyberpunk(data, api, query);
        
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
        console.error('Search error:', error);
    } finally {
        hideLoading();
    }
};

// Loading Functions
function showLoading(text = 'Loading...') {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    loadingText.textContent = text;
    overlay.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

// Make functions globally available
window.verifyKey = verifyKey;
window.showAdminLogin = showAdminLogin;
window.verifyAdmin = verifyAdmin;
window.closeAdmin = closeAdmin;
window.selectDuration = selectDuration;
window.generateKey = generateKey;
window.copyKey = copyKey;
window.deleteKey = deleteKey;
window.logout = logout;
window.detectInputType = detectInputType;
window.displayMasterKeyInfo = displayMasterKeyInfo;
// performSearch is already defined above
window.copyAllResults = copyAllResults;
window.exportPDF = exportPDF;
window.clearResults = clearResults;
window.revealPassword = revealPassword;
window.updateInputField = updateInputField;

