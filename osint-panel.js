// Configuration
const BREACHHUB_API_BASE = "https://breachhub.org/api";
const DEFAULT_API_KEY = "mriuBN4nIPYLpcDeIYiQtEKz0GGhCT";

// Configuration des APIs
const API_CONFIG = {
    // Recherche Générale
    'snusbase': {
        endpoint: '/snusbase',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Email, Username, etc.',
        inputIcon: 'fa-search',
        description: 'Recherche complète dans la base de données Snusbase'
    },
    'leakosint': {
        endpoint: '/leakosint',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Email, Username, etc.',
        inputIcon: 'fa-search',
        description: 'Recherche OSINT de fuites d\'informations'
    },
    'leakcheck': {
        endpoint: '/leakcheck/v2',
        param: 'query',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Recherche avancée LeakCheck V2 avec pagination'
    },
    'intelvault': {
        endpoint: '/intelvault',
        param: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Accès à la base de données IntelVault'
    },
    'breachbase': {
        endpoint: '/breachbase',
        param: 'term',
        category: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Base de données de fuites complète'
    },
    'hackcheck': {
        endpoint: '/hackcheck',
        param: 'term',
        category: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Vérification rapide de fuites'
    },
    // Email & Téléphone
    'seon-email': {
        endpoint: '/seon/email',
        param: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Analyse d\'email SEON avec empreinte digitale'
    },
    'seon-phone': {
        endpoint: '/seon/phone',
        param: 'phone',
        inputType: 'tel',
        inputLabel: 'Numéro de téléphone',
        inputIcon: 'fa-phone',
        description: 'Analyse de numéro de téléphone SEON'
    },
    'github': {
        endpoint: '/github',
        param: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Recherche de comptes GitHub par email'
    },
    'hudsonrock': {
        endpoint: '/hudsonrock',
        param: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Base de données cybercriminalité HudsonRock'
    },
    'intelbase-email': {
        endpoint: '/intelbase/email/check',
        param: 'term',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Vérification d\'email IntelBase'
    },
    // Username & Social
    'memory': {
        endpoint: '/memory',
        param: 'username',
        inputType: 'text',
        inputLabel: 'Username',
        inputIcon: 'fa-user',
        description: 'Historique de username sur les réseaux sociaux'
    },
    'reddit': {
        endpoint: '/reddit',
        param: 'username',
        inputType: 'text',
        inputLabel: 'Username Reddit',
        inputIcon: 'fa-user',
        description: 'Informations sur un compte Reddit'
    },
    'tiktok-basic': {
        endpoint: '/tiktok',
        param: 'username',
        type: 'basic',
        inputType: 'text',
        inputLabel: 'Username TikTok',
        inputIcon: 'fa-user',
        description: 'Informations de base TikTok (2-5s)'
    },
    'tiktok-full': {
        endpoint: '/tiktok',
        param: 'username',
        type: 'full',
        inputType: 'text',
        inputLabel: 'Username TikTok',
        inputIcon: 'fa-user',
        description: 'Analyse complète TikTok (10-30s)'
    },
    'intelfetch-github': {
        endpoint: '/intelfetch/github',
        param: 'username',
        inputType: 'text',
        inputLabel: 'Username GitHub',
        inputIcon: 'fa-user',
        description: 'Recherche GitHub via IntelFetch'
    },
    'intelbase-github': {
        endpoint: '/intelbase/github',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Username GitHub',
        inputIcon: 'fa-user',
        description: 'Recherche GitHub via IntelBase'
    },
    // Discord
    'discord-lookup': {
        endpoint: '/discord/discord-lookup',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Discord ID',
        inputIcon: 'fa-hashtag',
        description: 'Recherche de base Discord'
    },
    'discord-stalker': {
        endpoint: '/discord/discord-stalker',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Discord ID',
        inputIcon: 'fa-hashtag',
        description: 'Suivi avancé Discord'
    },
    'cordcat': {
        endpoint: '/cordcat',
        param: 'id',
        inputType: 'text',
        inputLabel: 'Discord ID',
        inputIcon: 'fa-hashtag',
        description: 'Service de recherche Discord Cord.cat'
    },
    'oathnet-discord': {
        endpoint: '/oathnet/discordtoroblox',
        param: 'discord_id',
        inputType: 'text',
        inputLabel: 'Discord ID',
        inputIcon: 'fa-hashtag',
        description: 'Lier Discord ID à Roblox'
    },
    // Domaine & IP
    'ipinfo': {
        endpoint: '/ipinfo',
        param: 'ip',
        inputType: 'text',
        inputLabel: 'Adresse IP',
        inputIcon: 'fa-network-wired',
        description: 'Informations détaillées sur une IP'
    },
    'shodan-host': {
        endpoint: '/shodan/host',
        param: 'ip',
        inputType: 'text',
        inputLabel: 'Adresse IP',
        inputIcon: 'fa-network-wired',
        description: 'Recherche Shodan Host'
    },
    'shodan-search': {
        endpoint: '/shodan/search',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Requête de recherche',
        inputIcon: 'fa-search',
        description: 'Recherche Shodan générale'
    },
    'intelfetch-ip': {
        endpoint: '/intelfetch/ip-lookup',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Adresse IP',
        inputIcon: 'fa-network-wired',
        description: 'Recherche IP IntelFetch'
    },
    'intelfetch-domain': {
        endpoint: '/intelfetch/domain',
        param: 'domain',
        inputType: 'text',
        inputLabel: 'Domaine',
        inputIcon: 'fa-globe',
        description: 'Analyse de domaine IntelFetch'
    },
    'intelbase-ip': {
        endpoint: '/intelbase/ip/lookup',
        param: 'term',
        inputType: 'text',
        inputLabel: 'Adresse IP',
        inputIcon: 'fa-network-wired',
        description: 'Recherche IP IntelBase'
    },
    // Gaming
    'steam': {
        endpoint: '/steam',
        param: 'steam_id',
        inputType: 'text',
        inputLabel: 'SteamID64',
        inputIcon: 'fa-steam',
        description: 'Informations publiques Steam'
    },
    'crowsint': {
        endpoint: '/crowsint',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Username ou Email',
        inputIcon: 'fa-user',
        description: 'Logs Minecraft stealer CrowSint'
    },
    'crowsint-social': {
        endpoint: '/crowsint/social',
        param: 'username',
        inputType: 'text',
        inputLabel: 'Username',
        inputIcon: 'fa-user',
        description: 'Recherche sociale CrowSint'
    },
    'intelbase-minecraft': {
        endpoint: '/intelbase/minecraft',
        param: 'term',
        inputType: 'text',
        inputLabel: 'Username Minecraft',
        inputIcon: 'fa-user',
        description: 'Recherche Minecraft IntelBase'
    },
    // Autres
    'keyscore-email': {
        endpoint: '/keyscore/email',
        param: 'query',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Recherche email KeyScore'
    },
    'keyscore-url': {
        endpoint: '/keyscore/url',
        param: 'query',
        inputType: 'url',
        inputLabel: 'URL',
        inputIcon: 'fa-link',
        description: 'Recherche URL KeyScore'
    },
    'oathnet-breach': {
        endpoint: '/oathnet/breach',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Email, Username, etc.',
        inputIcon: 'fa-search',
        description: 'Recherche générale Oathnet Breach'
    },
    'oathnet-stealer': {
        endpoint: '/oathnet/stealer',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Email ou Domaine',
        inputIcon: 'fa-search',
        description: 'Recherche Stealer logs Oathnet'
    },
    'breachrip': {
        endpoint: '/breachrip/db',
        param: 'term',
        types: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Recherche Breach.rip Database'
    },
    'breachvip': {
        endpoint: '/breachvip',
        param: 'query',
        category: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Recherche Breach.vip par catégorie'
    },
    'akula': {
        endpoint: '/akula',
        param: 'term',
        category: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Base de données Akula'
    },
    'leaksight': {
        endpoint: '/leaksight',
        param: 'term',
        category: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Plateforme LeakSight'
    },
    'osintkit': {
        endpoint: '/osintkit',
        param: 'term',
        category: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-envelope',
        description: 'Kit OSINT multi-catégorie'
    },
    'vindecoder': {
        endpoint: '/vindecoder',
        param: 'vin',
        inputType: 'text',
        inputLabel: 'VIN (Vehicle ID)',
        inputIcon: 'fa-car',
        description: 'Décodage de numéro VIN'
    },
    'binlist': {
        endpoint: '/binlist',
        param: 'bin',
        inputType: 'text',
        inputLabel: 'BIN (6-8 chiffres)',
        inputIcon: 'fa-credit-card',
        description: 'Recherche BIN de carte bancaire'
    },
    'crypto': {
        endpoint: '/crypto',
        param: 'term',
        category: 'btc',
        inputType: 'text',
        inputLabel: 'Adresse Wallet',
        inputIcon: 'fa-bitcoin',
        description: 'Intelligence cryptomonnaie (BTC/ETH)'
    },
    // Inf0sec Modules
    'inf0sec-leaks': {
        endpoint: '/inf0sec',
        param: 'query',
        module: 'leaks',
        inputType: 'text',
        inputLabel: 'Email, Username, etc.',
        inputIcon: 'fa-search',
        description: 'Inf0sec - Recherche de fuites générales'
    },
    'inf0sec-discord': {
        endpoint: '/inf0sec',
        param: 'query',
        module: 'discord',
        inputType: 'text',
        inputLabel: 'Discord ID ou Username',
        inputIcon: 'fa-hashtag',
        description: 'Inf0sec - Recherche Discord (users, servers, tokens)'
    },
    'inf0sec-npd': {
        endpoint: '/inf0sec',
        param: 'query',
        module: 'npd',
        inputType: 'text',
        inputLabel: 'Prénom, Nom, Téléphone',
        inputIcon: 'fa-user',
        description: 'Inf0sec - National Public Data search'
    },
    'inf0sec-domain': {
        endpoint: '/inf0sec',
        param: 'query',
        module: 'domain',
        inputType: 'text',
        inputLabel: 'Domaine',
        inputIcon: 'fa-globe',
        description: 'Inf0sec - Intelligence et WHOIS domaine'
    },
    'inf0sec-username': {
        endpoint: '/inf0sec',
        param: 'query',
        module: 'username',
        inputType: 'text',
        inputLabel: 'Username',
        inputIcon: 'fa-user',
        description: 'Inf0sec - Analyse username multi-plateformes'
    },
    'inf0sec-hlr': {
        endpoint: '/inf0sec',
        param: 'query',
        module: 'hlr',
        inputType: 'tel',
        inputLabel: 'Numéro de téléphone',
        inputIcon: 'fa-phone',
        description: 'Inf0sec - Lookup téléphone et opérateur'
    },
    'inf0sec-cfx': {
        endpoint: '/inf0sec',
        param: 'query',
        module: 'cfx',
        inputType: 'text',
        inputLabel: 'CFX ID',
        inputIcon: 'fa-gamepad',
        description: 'Inf0sec - Données CFX (FiveM/RedM)'
    },
    // IntelX
    'intelx': {
        endpoint: '/intelx',
        param: 'storage_id',
        bucket: 'leaks.logs',
        inputType: 'text',
        inputLabel: 'Storage ID',
        inputIcon: 'fa-archive',
        description: 'IntelX - Recherche dans données archivées'
    },
    // Melissa
    'melissa': {
        endpoint: '/melissa',
        param: 'input',
        inputType: 'text',
        inputLabel: 'Email, Phone, Name, Address',
        inputIcon: 'fa-check-circle',
        description: 'Melissa - Validation et enrichissement de données'
    },
    // Shodan Honeyscore
    'shodan-honeyscore': {
        endpoint: '/shodan/honeyscore',
        param: 'ip',
        inputType: 'text',
        inputLabel: 'Adresse IP',
        inputIcon: 'fa-network-wired',
        description: 'Shodan Honeyscore - Détection de honeypot'
    },
    // KeyScore Machine Info & Download
    'keyscore-machineinfo': {
        endpoint: '/keyscore/machineinfo',
        param: 'uuid',
        inputType: 'text',
        inputLabel: 'Machine UUID',
        inputIcon: 'fa-server',
        description: 'KeyScore - Informations machine avec données fichiers'
    },
    'keyscore-download': {
        endpoint: '/keyscore/download',
        param: 'uuid',
        file: '',
        inputType: 'text',
        inputLabel: 'UUID & File Name',
        inputIcon: 'fa-download',
        description: 'KeyScore - Téléchargement de données par UUID'
    },
    // IntelFetch Fetchbase
    'intelfetch-fetchbase': {
        endpoint: '/intelfetch/fetchbase',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Email, Username, etc.',
        inputIcon: 'fa-search',
        description: 'IntelFetch - Recherche Fetchbase'
    },
    // Cord.cat IP
    'cordcat-ip': {
        endpoint: '/cordcat/ip',
        param: 'ip',
        inputType: 'text',
        inputLabel: 'Adresse IP',
        inputIcon: 'fa-network-wired',
        description: 'Cord.cat - Recherche par IP'
    },
    // IntelBase supplémentaires
    'intelbase-phone': {
        endpoint: '/intelbase/phone',
        param: 'term',
        inputType: 'tel',
        inputLabel: 'Numéro de téléphone',
        inputIcon: 'fa-phone',
        description: 'IntelBase - Recherche par téléphone'
    },
    'intelbase-bmw': {
        endpoint: '/intelbase/bmw',
        param: 'term',
        type: 'chassis',
        inputType: 'text',
        inputLabel: 'Chassis, Registration, Name, Mobile',
        inputIcon: 'fa-car',
        description: 'IntelBase - Recherche BMW'
    },
    'intelbase-doxbin': {
        endpoint: '/intelbase/doxbin',
        param: 'term',
        inputType: 'text',
        inputLabel: 'Terme de recherche',
        inputIcon: 'fa-file-alt',
        description: 'IntelBase - Recherche Doxbin'
    },
    // Breach.rip modules supplémentaires
    'breachrip-amazon': {
        endpoint: '/breachrip/amazon',
        param: 'term',
        types: 'email',
        inputType: 'email',
        inputLabel: 'Email',
        inputIcon: 'fa-amazon',
        description: 'Breach.rip - Recherche Amazon breach'
    },
    'breachrip-discord': {
        endpoint: '/breachrip/discord',
        param: 'term',
        types: 'username',
        inputType: 'text',
        inputLabel: 'Username ou Discord ID',
        inputIcon: 'fa-hashtag',
        description: 'Breach.rip - Recherche Discord breach'
    },
    'breachrip-cryptobreach': {
        endpoint: '/breachrip/cryptobreach',
        param: 'query',
        inputType: 'text',
        inputLabel: 'Adresse Wallet ou Email',
        inputIcon: 'fa-bitcoin',
        description: 'Breach.rip - Recherche CryptoBreach'
    }
};

// État de l'application
let currentApiKey = localStorage.getItem('breachhub_api_key') || DEFAULT_API_KEY;
let searchHistory = JSON.parse(localStorage.getItem('osint_search_history')) || [];

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    updateInputField();
    loadApiKey();
});

// Charger la clé API depuis le localStorage
function loadApiKey() {
    const savedKey = localStorage.getItem('breachhub_api_key');
    if (savedKey) {
        currentApiKey = savedKey;
    }
}

// Mettre à jour le champ de saisie selon l'API sélectionnée
function updateInputField() {
    const selector = document.getElementById('api-selector');
    const selectedApi = selector.value;
    const config = API_CONFIG[selectedApi];
    
    if (!config) return;
    
    const input = document.getElementById('search-input');
    const label = document.getElementById('input-label');
    const icon = document.getElementById('input-icon');
    const description = document.getElementById('api-description');
    
    // Mettre à jour le type d'input
    input.type = config.inputType || 'text';
    input.placeholder = `Entrez ${config.inputLabel.toLowerCase()}...`;
    
    // Mettre à jour le label
    label.textContent = config.inputLabel;
    
    // Mettre à jour l'icône
    icon.className = `fas ${config.inputIcon} absolute left-4 top-4 text-slate-400`;
    
    // Mettre à jour la description
    description.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${config.description}`;
    
    // Focus sur l'input
    input.focus();
}

// Effectuer la recherche
async function performSearch() {
    const selector = document.getElementById('api-selector');
    const input = document.getElementById('search-input');
    const selectedApi = selector.value;
    const query = input.value.trim();
    
    if (!query) {
        showNotification('Veuillez entrer une recherche', 'warning');
        return;
    }
    
    if (!currentApiKey) {
        showNotification('Veuillez configurer votre clé API', 'error');
        toggleApiKeyModal();
        return;
    }
    
    const config = API_CONFIG[selectedApi];
    if (!config) {
        showNotification('API non configurée', 'error');
        return;
    }
    
    // Afficher le chargement
    showLoading(true);
    updateLoadingStatus(`Recherche via ${selectedApi}...`);
    
    // Cacher les résultats précédents
    document.getElementById('results-section').classList.add('hidden');
    
    try {
        const result = await callBreachHubAPI(selectedApi, query, config);
        displayResults(result, selectedApi, query);
        
        // Sauvegarder dans l'historique
        saveToHistory(selectedApi, query);
    } catch (error) {
        console.error('Erreur de recherche:', error);
        showNotification('Erreur: ' + error.message, 'error');
        displayError(error.message);
    } finally {
        showLoading(false);
    }
}

// Appel à l'API BreachHub via proxy backend
async function callBreachHubAPI(apiName, query, config) {
    // Détecter automatiquement l'URL du backend (local ou production)
    const backendUrl = (window.CONFIG && window.CONFIG.getBackendUrl()) || 
                      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                       ? 'http://localhost:5000' 
                       : window.location.origin);
    
    // Construire l'endpoint (enlever le / au début si présent)
    let endpoint = config.endpoint.startsWith('/') ? config.endpoint.substring(1) : config.endpoint;
    
    // Construire l'URL du proxy
    let url = `${backendUrl}/api/breachhub/${endpoint}?`;
    
    // Ajouter le paramètre principal
    url += `${config.param}=${encodeURIComponent(query)}`;
    
    // Ajouter les paramètres supplémentaires
    if (config.category) {
        url += `&category=${encodeURIComponent(config.category)}`;
    }
    if (config.type) {
        url += `&type=${encodeURIComponent(config.type)}`;
    }
    if (config.types) {
        url += `&type=${encodeURIComponent(config.types)}`;
    }
    if (config.module) {
        url += `&module=${encodeURIComponent(config.module)}`;
    }
    if (config.bucket) {
        url += `&bucket=${encodeURIComponent(config.bucket)}`;
    }
    if (config.file) {
        url += `&file=${encodeURIComponent(config.file)}`;
    }
    
    // La clé API est gérée par le backend, pas besoin de l'ajouter ici
    
    updateLoadingStatus(`Connexion à ${apiName}...`);
    
    console.log('Calling API via proxy:', url);
    
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
    return data;
}

// Afficher les résultats avec des cartes élégantes (compatible avec professional-script.js)
function displayResults(data, apiName, query) {
    // Check if professional script is loaded
    if (typeof displayResultsProfessional === 'function') {
        displayResultsProfessional(data, apiName, query);
        return;
    }
    
    // Fallback to original display
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');
    
    resultsSection.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    
    // En-tête de résultats
    const header = document.createElement('div');
    header.className = 'mb-4 p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg';
    header.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <h3 class="font-bold text-lg mb-1">Recherche: <span class="text-blue-400">${query}</span></h3>
                <p class="text-sm text-slate-400">Module: <span class="text-slate-300">${apiName}</span></p>
            </div>
            <button onclick="copyResults()" class="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 rounded text-sm">
                <i class="fas fa-copy mr-2"></i>Copier
            </button>
        </div>
    `;
    resultsContainer.appendChild(header);
    
    // Si les données sont un tableau
    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            resultsContainer.appendChild(createResultCard(item, index));
        });
    } 
    // Si les données sont un objet
    else if (typeof data === 'object' && data !== null) {
        // Extraire les données pertinentes
        const extractedData = extractDataFromResponse(data);
        
        if (extractedData.length > 0) {
            extractedData.forEach((item, index) => {
                resultsContainer.appendChild(createResultCard(item, index));
            });
        } else {
            // Afficher l'objet complet comme carte
            resultsContainer.appendChild(createResultCard(data, 0));
        }
    }
    // Si c'est une chaîne
    else {
        const card = createResultCard({ value: data }, 0);
        resultsContainer.appendChild(card);
    }
    
    // Scroll vers les résultats
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Extraire les données pertinentes de la réponse
function extractDataFromResponse(data) {
    const results = [];
    
    // Chercher des tableaux communs
    if (data.results && Array.isArray(data.results)) {
        return data.results;
    }
    if (data.data && Array.isArray(data.data)) {
        return data.data;
    }
    if (data.leaks && Array.isArray(data.leaks)) {
        return data.leaks;
    }
    if (data.breaches && Array.isArray(data.breaches)) {
        return data.breaches;
    }
    
    // Si c'est un objet avec des propriétés intéressantes
    const interestingKeys = ['email', 'username', 'password', 'name', 'phone', 'ip', 'domain', 'address'];
    const extracted = {};
    
    for (const key in data) {
        if (interestingKeys.includes(key.toLowerCase()) || typeof data[key] === 'string' || typeof data[key] === 'number') {
            extracted[key] = data[key];
        }
    }
    
    if (Object.keys(extracted).length > 0) {
        results.push(extracted);
    }
    
    return results.length > 0 ? results : [data];
}

// Créer une carte de résultat élégante
function createResultCard(item, index) {
    const card = document.createElement('div');
    card.className = 'result-card bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 card-appear';
    card.style.animationDelay = `${index * 0.1}s`;
    
    let html = '<div class="space-y-3">';
    
    // Parcourir les propriétés de l'item
    for (const key in item) {
        if (item.hasOwnProperty(key) && item[key] !== null && item[key] !== undefined) {
            const value = item[key];
            const displayKey = formatKey(key);
            const icon = getIconForKey(key);
            
            // Ignorer les valeurs vides ou les objets complexes
            if (typeof value === 'object' && !Array.isArray(value)) {
                continue;
            }
            
            html += `
                <div class="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition">
                    <div class="flex-shrink-0 w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <i class="fas ${icon} text-blue-400"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-xs text-slate-400 uppercase tracking-wide mb-1">${displayKey}</div>
                        <div class="text-sm font-medium text-slate-200 break-words">
                            ${formatValue(value)}
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    html += '</div>';
    card.innerHTML = html;
    
    return card;
}

// Formater la clé pour l'affichage
function formatKey(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Obtenir l'icône selon la clé
function getIconForKey(key) {
    const keyLower = key.toLowerCase();
    const iconMap = {
        'email': 'fa-envelope',
        'username': 'fa-user',
        'password': 'fa-lock',
        'name': 'fa-user-circle',
        'phone': 'fa-phone',
        'ip': 'fa-network-wired',
        'domain': 'fa-globe',
        'address': 'fa-map-marker-alt',
        'date': 'fa-calendar',
        'source': 'fa-database',
        'breach': 'fa-shield-alt',
        'leak': 'fa-exclamation-triangle',
        'status': 'fa-info-circle',
        'found': 'fa-check-circle',
        'count': 'fa-hashtag',
        'url': 'fa-link',
        'id': 'fa-id-card'
    };
    
    for (const [pattern, icon] of Object.entries(iconMap)) {
        if (keyLower.includes(pattern)) {
            return icon;
        }
    }
    
    return 'fa-info-circle';
}

// Formater la valeur pour l'affichage
function formatValue(value) {
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    if (typeof value === 'boolean') {
        return value ? '<span class="text-green-400">Oui</span>' : '<span class="text-red-400">Non</span>';
    }
    if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
    }
    return String(value);
}

// Afficher une erreur
function displayError(message) {
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');
    
    resultsSection.classList.remove('hidden');
    resultsContainer.innerHTML = `
        <div class="bg-red-600/10 border border-red-500/20 rounded-xl p-6 text-center">
            <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
            <h3 class="text-xl font-bold mb-2">Erreur de recherche</h3>
            <p class="text-slate-400">${message}</p>
        </div>
    `;
}

// Effacer les résultats
function clearResults() {
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('results-container').innerHTML = '';
}

// Gestion de la clé API
function toggleApiKeyModal() {
    const modal = document.getElementById('api-key-modal');
    modal.classList.toggle('hidden');
    
    if (!modal.classList.contains('hidden')) {
        const input = document.getElementById('api-key-input');
        input.value = currentApiKey;
        input.focus();
    }
}

function saveApiKey() {
    const input = document.getElementById('api-key-input');
    const key = input.value.trim();
    
    if (!key) {
        showNotification('Veuillez entrer une clé API', 'warning');
        return;
    }
    
    currentApiKey = key;
    localStorage.setItem('breachhub_api_key', key);
    showNotification('Clé API sauvegardée avec succès', 'success');
    toggleApiKeyModal();
}

function clearCache() {
    if (confirm('Êtes-vous sûr de vouloir effacer le cache ? Cela supprimera votre clé API et l\'historique de recherche.')) {
        localStorage.removeItem('breachhub_api_key');
        localStorage.removeItem('osint_search_history');
        currentApiKey = DEFAULT_API_KEY;
        searchHistory = [];
        showNotification('Cache effacé avec succès', 'success');
    }
}

// Sauvegarder dans l'historique
function saveToHistory(api, query) {
    const entry = {
        api,
        query,
        timestamp: new Date().toISOString()
    };
    
    searchHistory.unshift(entry);
    if (searchHistory.length > 50) {
        searchHistory = searchHistory.slice(0, 50);
    }
    
    localStorage.setItem('osint_search_history', JSON.stringify(searchHistory));
}

// Copier les résultats
function copyResults() {
    const container = document.getElementById('results-container');
    const text = container.innerText;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Résultats copiés dans le presse-papiers', 'success');
    });
}

// Afficher le chargement
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function updateLoadingStatus(message) {
    const status = document.getElementById('loading-status');
    if (status) {
        status.textContent = message;
    }
}

// Notifications
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-600',
        info: 'bg-blue-600'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 fade-in`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

