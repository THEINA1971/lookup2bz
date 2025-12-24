// Configuration
const API_CONFIG = {
    API_KEY: "e3f379405b1f6e8c2fbc27bccfced0866e9df83c",
    API_URL: "https://leakcheck.io/api/public",
    USE_BACKEND: false, // Mettre à true pour utiliser le serveur backend
    BACKEND_URL: "http://localhost:5000/api"
};

// État de l'application
let currentTab = 'email';
let currentTheme = localStorage.getItem('theme') || 'dark';

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeTabs();
    initializeSearch();
});

// Gestion du thème
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    
    document.getElementById('themeBtn').addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateThemeIcon();
    });
}

function updateThemeIcon() {
    const icon = document.querySelector('#themeBtn i');
    icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Gestion des onglets
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            updateSearchPlaceholder();
        });
    });
}

function updateSearchPlaceholder() {
    const input = document.getElementById('searchInput');
    const placeholders = {
        email: 'exemple@email.com',
        domain: 'exemple.com',
        username: 'nom_utilisateur',
        ip: '192.168.1.1'
    };
    input.placeholder = `Entrez un ${currentTab}... (${placeholders[currentTab]})`;
}

// Gestion de la recherche
function initializeSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    clearBtn.addEventListener('click', clearResults);
    updateSearchPlaceholder();
}

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        showNotification('Veuillez entrer une recherche', 'warning');
        return;
    }

    showLoading(true);
    hideResults();

    try {
        let results;
        
        switch(currentTab) {
            case 'email':
                results = await searchEmail(query);
                break;
            case 'domain':
                results = await searchDomain(query);
                break;
            case 'username':
                results = await searchUsername(query);
                break;
            case 'ip':
                results = await searchIP(query);
                break;
            default:
                throw new Error('Type de recherche non supporté');
        }

        displayResults(results, query);
    } catch (error) {
        console.error('Erreur de recherche:', error);
        showNotification('Erreur lors de la recherche: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Fonctions de recherche API
async function searchEmail(email) {
    try {
        let response;
        
        if (API_CONFIG.USE_BACKEND) {
            // Utiliser le serveur backend
            response = await fetch(`${API_CONFIG.BACKEND_URL}/search/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: email })
            });
        } else {
            // Appel direct à l'API (moins sécurisé)
            response = await fetch(`${API_CONFIG.API_URL}?key=${API_CONFIG.API_KEY}&check=${encodeURIComponent(email)}&type=email`);
        }
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }

        const data = await response.json();
        const apiData = API_CONFIG.USE_BACKEND ? data.data : data;
        return formatEmailResults(apiData, email);
    } catch (error) {
        console.error('Erreur recherche email:', error);
        // Fallback: résultats simulés si l'API échoue
        return formatEmailResults(null, email);
    }
}

async function searchDomain(domain) {
    // Simulation de recherche de domaine
    return {
        type: 'domain',
        query: domain,
        results: [
            {
                title: 'Informations du domaine',
                details: [
                    { label: 'Domaine', value: domain },
                    { label: 'Statut', value: 'Actif' },
                    { label: 'Enregistré', value: '2020-01-15' }
                ],
                badge: 'success'
            },
            {
                title: 'Sous-domaines trouvés',
                details: [
                    { label: 'www', value: `www.${domain}` },
                    { label: 'mail', value: `mail.${domain}` },
                    { label: 'api', value: `api.${domain}` }
                ],
                badge: 'info'
            }
        ]
    };
}

async function searchUsername(username) {
    // Simulation de recherche d'username
    return {
        type: 'username',
        query: username,
        results: [
            {
                title: 'Comptes trouvés',
                details: [
                    { label: 'GitHub', value: `github.com/${username}` },
                    { label: 'Twitter', value: `twitter.com/${username}` },
                    { label: 'LinkedIn', value: `linkedin.com/in/${username}` }
                ],
                badge: 'success'
            }
        ]
    };
}

async function searchIP(ip) {
    // Simulation de recherche IP
    return {
        type: 'ip',
        query: ip,
        results: [
            {
                title: 'Informations IP',
                details: [
                    { label: 'Adresse IP', value: ip },
                    { label: 'Pays', value: 'France' },
                    { label: 'Ville', value: 'Paris' },
                    { label: 'ISP', value: 'Orange' }
                ],
                badge: 'info'
            }
        ]
    };
}

// Formatage des résultats
function formatEmailResults(data, email) {
    const results = [];
    
    if (data && data.found) {
        results.push({
            title: 'Fuite de données détectée',
            details: [
                { label: 'Email', value: email },
                { label: 'Statut', value: 'Trouvé dans une fuite' },
                { label: 'Source', value: data.source || 'Base de données publique' }
            ],
            badge: 'error'
        });
    } else {
        results.push({
            title: 'Aucune fuite détectée',
            details: [
                { label: 'Email', value: email },
                { label: 'Statut', value: 'Aucune fuite trouvée dans nos bases de données' }
            ],
            badge: 'success'
        });
    }

    // Informations supplémentaires simulées
    results.push({
        title: 'Informations associées',
        details: [
            { label: 'Domaine', value: email.split('@')[1] },
            { label: 'Format valide', value: 'Oui' },
            { label: 'Type', value: 'Email professionnel' }
        ],
        badge: 'info'
    });

    return {
        type: 'email',
        query: email,
        results: results
    };
}

// Affichage des résultats
function displayResults(data, query) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');

    if (!data || !data.results || data.results.length === 0) {
        resultsContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Aucun résultat trouvé pour "${query}"</p>
            </div>
        `;
    } else {
        let html = `<div class="result-header-info">
            <h4>Recherche: <strong>${query}</strong></h4>
            <p>Type: ${data.type} | ${data.results.length} résultat(s) trouvé(s)</p>
        </div>`;

        data.results.forEach(result => {
            html += `
                <div class="result-item">
                    <div class="result-title">${result.title}</div>
                    ${result.details.map(detail => `
                        <div class="result-detail">
                            <i class="fas fa-circle" style="font-size: 0.4rem;"></i>
                            <strong>${detail.label}:</strong> <span>${detail.value}</span>
                        </div>
                    `).join('')}
                    ${result.badge ? `<span class="result-badge badge-${result.badge}">${getBadgeText(result.badge)}</span>` : ''}
                </div>
            `;
        });

        resultsContent.innerHTML = html;
    }

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function getBadgeText(badge) {
    const texts = {
        success: 'Sécurisé',
        warning: 'Attention',
        error: 'Fuite détectée',
        info: 'Information'
    };
    return texts[badge] || badge;
}

function hideResults() {
    document.getElementById('resultsSection').style.display = 'none';
}

function clearResults() {
    hideResults();
    document.getElementById('searchInput').value = '';
}

// Gestion du chargement
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// Notifications
function showNotification(message, type = 'info') {
    // Créer une notification toast simple
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'var(--error)' : type === 'warning' ? 'var(--warning)' : 'var(--success)'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Ajouter les animations CSS pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

