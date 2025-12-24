// Professional Security Panel - Enhanced Script

// Sidebar Management
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// Category Selection
let currentCategory = 'breach';

function selectCategory(category) {
    currentCategory = category;
    
    // Update active state
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Filter API selector
    const selector = document.getElementById('api-selector');
    const optgroups = selector.querySelectorAll('optgroup');
    
    optgroups.forEach(group => {
        group.style.display = 'none';
    });
    
    const targetGroup = document.getElementById(`optgroup-${category}`);
    if (targetGroup) {
        targetGroup.style.display = 'block';
        // Select first option in group
        const firstOption = targetGroup.querySelector('option');
        if (firstOption) {
            selector.value = firstOption.value;
            updateInputField();
        }
    }
}

// Rate Limit Tracking
let requestCount = 0;
let requestTimestamps = [];

function updateRateLimit() {
    const now = Date.now();
    // Remove timestamps older than 1 second
    requestTimestamps = requestTimestamps.filter(ts => now - ts < 1000);
    requestCount = requestTimestamps.length;
    
    const badge = document.getElementById('rate-count');
    if (badge) {
        badge.textContent = requestCount;
        
        // Change color based on rate
        const rateLimitBadge = document.getElementById('rate-limit-badge');
        const indicator = rateLimitBadge.querySelector('div');
        
        if (requestCount >= 3) {
            indicator.className = 'w-2 h-2 bg-red-400 rounded-full animate-pulse';
            rateLimitBadge.classList.add('border-red-500/30');
            rateLimitBadge.classList.remove('border-cyan-500/30');
        } else if (requestCount >= 2) {
            indicator.className = 'w-2 h-2 bg-yellow-400 rounded-full animate-pulse';
        } else {
            indicator.className = 'w-2 h-2 bg-green-400 rounded-full animate-pulse';
            rateLimitBadge.classList.remove('border-red-500/30');
            rateLimitBadge.classList.add('border-cyan-500/30');
        }
    }
}

function trackRequest() {
    requestTimestamps.push(Date.now());
    updateRateLimit();
}

// Enhanced Display Results with Professional Cards
function displayResultsProfessional(data, apiName, query) {
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');
    const filtersSection = document.getElementById('results-filters');
    
    resultsSection.classList.remove('hidden');
    filtersSection.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    
    // Extract and format data
    const formattedData = extractAndFormatData(data, apiName);
    const resultCount = formattedData.length;
    
    // Update results count
    document.getElementById('results-count').textContent = resultCount;
    
    // Display header
    const header = createResultHeader(apiName, query, resultCount);
    resultsContainer.appendChild(header);
    
    // Display data cards
    formattedData.forEach((item, index) => {
        const card = createProfessionalDataCard(item, index, apiName);
        resultsContainer.appendChild(card);
    });
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Create Professional Data Card
function createProfessionalDataCard(item, index, apiType) {
    const card = document.createElement('div');
    card.className = 'data-card card-appear';
    card.style.animationDelay = `${index * 0.05}s`;
    
    let html = '<div class="space-y-4">';
    
    // Special handling for different API types
    if (apiType.includes('tiktok') && item.profile_picture) {
        html += `
            <div class="flex items-start gap-4 mb-4">
                <img src="${item.profile_picture}" alt="Profile" class="profile-image">
                <div class="flex-1">
                    <h4 class="text-lg font-semibold text-white mb-1">${item.username || 'N/A'}</h4>
                    <p class="text-sm text-slate-400">${item.bio || ''}</p>
                </div>
            </div>
        `;
    }
    
    if (apiType.includes('ip') && item.latitude && item.longitude) {
        html += `
            <div class="map-container mb-4">
                <iframe 
                    width="100%" 
                    height="100%" 
                    frameborder="0" 
                    style="border:0" 
                    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6L4i0Uc2eHE&q=${item.latitude},${item.longitude}" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    }
    
    // Display all fields
    for (const key in item) {
        if (item.hasOwnProperty(key) && item[key] !== null && item[key] !== undefined) {
            const value = item[key];
            const displayKey = formatKey(key);
            const riskLevel = getRiskLevel(key, value);
            
            // Skip if already displayed
            if ((apiType.includes('tiktok') && key === 'profile_picture') || 
                (apiType.includes('ip') && (key === 'latitude' || key === 'longitude'))) {
                continue;
            }
            
            html += `
                <div class="flex items-start gap-3 p-3 bg-slate-900/30 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition">
                    <div class="flex-shrink-0 w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                        <i class="fas ${getIconForKey(key)} text-cyan-400"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-xs text-slate-400 uppercase tracking-wide font-medium">${displayKey}</span>
                            ${riskLevel ? `<span class="badge ${riskLevel.class}">${riskLevel.label}</span>` : ''}
                        </div>
                        <div class="text-sm font-['JetBrains_Mono'] text-slate-200 break-words">
                            ${formatValueForDisplay(key, value)}
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

// Format value with special handling
function formatValueForDisplay(key, value) {
    const keyLower = key.toLowerCase();
    
    // Password field - masked by default
    if (keyLower.includes('password') || keyLower.includes('pass')) {
        return `
            <div class="password-field masked" onclick="togglePasswordVisibility(this)" data-value="${escapeHtml(value)}">
                ${value}
            </div>
        `;
    }
    
    // Email field
    if (keyLower.includes('email')) {
        return `<a href="mailto:${value}" class="text-cyan-400 hover:text-cyan-300 hover:underline">${value}</a>`;
    }
    
    // URL field
    if (keyLower.includes('url') || keyLower.includes('link')) {
        return `<a href="${value}" target="_blank" class="text-cyan-400 hover:text-cyan-300 hover:underline">${value}</a>`;
    }
    
    // Boolean
    if (typeof value === 'boolean') {
        return value ? 
            '<span class="text-green-400"><i class="fas fa-check-circle mr-1"></i>Yes</span>' : 
            '<span class="text-red-400"><i class="fas fa-times-circle mr-1"></i>No</span>';
    }
    
    // Array
    if (Array.isArray(value)) {
        return value.map(v => `<span class="inline-block px-2 py-1 bg-slate-800/50 rounded mr-2 mb-2">${v}</span>`).join('');
    }
    
    // Object
    if (typeof value === 'object') {
        return `<pre class="text-xs bg-slate-900/50 p-3 rounded overflow-x-auto">${JSON.stringify(value, null, 2)}</pre>`;
    }
    
    return escapeHtml(String(value));
}

// Toggle password visibility
function togglePasswordVisibility(element) {
    const isMasked = element.classList.contains('masked');
    const actualValue = element.getAttribute('data-value');
    
    if (isMasked) {
        element.classList.remove('masked');
        element.textContent = actualValue;
        copyToClipboard(actualValue);
    } else {
        element.classList.add('masked');
    }
}

// Get risk level
function getRiskLevel(key, value) {
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes('password') || keyLower.includes('pass')) {
        return { class: 'badge badge-danger', label: 'CRITICAL' };
    }
    
    if (keyLower.includes('email') && value) {
        return { class: 'badge badge-warning', label: 'EXPOSED' };
    }
    
    if (keyLower.includes('breach') || keyLower.includes('leak')) {
        return { class: 'badge badge-danger', label: 'BREACHED' };
    }
    
    if (keyLower.includes('public') || keyLower.includes('visible')) {
        return { class: 'badge badge-info', label: 'PUBLIC' };
    }
    
    return null;
}

// Get icon for key (from osint-panel.js if available, otherwise use default)
function getIconForKey(key) {
    if (typeof window.getIconForKey === 'function') {
        return window.getIconForKey(key);
    }
    
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

// Format key (from osint-panel.js if available)
function formatKey(key) {
    if (typeof window.formatKey === 'function') {
        return window.formatKey(key);
    }
    
    return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Extract and format data
function extractAndFormatData(data, apiType) {
    const results = [];
    
    // Handle different response structures
    if (Array.isArray(data)) {
        return data.map(item => formatDataItem(item, apiType));
    }
    
    if (typeof data === 'object' && data !== null) {
        // Check for common result containers
        if (data.results && Array.isArray(data.results)) {
            return data.results.map(item => formatDataItem(item, apiType));
        }
        if (data.data && Array.isArray(data.data)) {
            return data.data.map(item => formatDataItem(item, apiType));
        }
        if (data.leaks && Array.isArray(data.leaks)) {
            return data.leaks.map(item => formatDataItem(item, apiType));
        }
        
        // Single object
        results.push(formatDataItem(data, apiType));
    }
    
    return results.length > 0 ? results : [{ value: JSON.stringify(data) }];
}

function formatDataItem(item, apiType) {
    const formatted = {};
    
    for (const key in item) {
        if (item.hasOwnProperty(key)) {
            formatted[key] = item[key];
        }
    }
    
    return formatted;
}

// Create result header
function createResultHeader(apiName, query, count) {
    const header = document.createElement('div');
    header.className = 'mb-6 p-4 bg-slate-900/50 border border-cyan-500/20 rounded-lg';
    header.innerHTML = `
        <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
                <h4 class="text-lg font-semibold text-white mb-1">
                    Query: <span class="text-cyan-400 font-['JetBrains_Mono']">${escapeHtml(query)}</span>
                </h4>
                <p class="text-sm text-slate-400">
                    Module: <span class="text-slate-300">${apiName}</span> | 
                    Results: <span class="text-cyan-400 font-['JetBrains_Mono']">${count}</span>
                </p>
            </div>
            <button onclick="copyAllResults()" class="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg transition text-sm flex items-center gap-2">
                <i class="fas fa-copy"></i>
                <span>Copy All</span>
            </button>
        </div>
    `;
    return header;
}

// Filter Results
let currentFilter = 'all';

function filterResults(filter) {
    currentFilter = filter;
    
    // Update active state
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.filter-btn').classList.add('active');
    
    const cards = document.querySelectorAll('.data-card');
    cards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        let show = false;
        
        switch(filter) {
            case 'email':
                show = cardText.includes('email') || cardText.includes('@');
                break;
            case 'password':
                show = cardText.includes('password') || cardText.includes('pass');
                break;
            case 'username':
                show = cardText.includes('username') || cardText.includes('user');
                break;
            default:
                show = true;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
    
    // Update count
    const visibleCount = Array.from(cards).filter(c => c.style.display !== 'none').length;
    document.getElementById('results-count').textContent = visibleCount;
}

// Export Functions
function exportResults(format) {
    const results = [];
    const cards = document.querySelectorAll('.data-card');
    
    cards.forEach(card => {
        const data = {};
        const fields = card.querySelectorAll('[class*="bg-slate-900/30"]');
        fields.forEach(field => {
            const key = field.querySelector('.uppercase').textContent.trim();
            const value = field.querySelector('.font-\\[\\'JetBrains_Mono\\'\\]').textContent.trim();
            data[key] = value;
        });
        results.push(data);
    });
    
    if (format === 'csv') {
        exportToCSV(results);
    } else if (format === 'pdf') {
        exportToPDF(results);
    }
}

function exportToCSV(data) {
    if (data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breachhub-results-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('CSV exported successfully', 'success');
}

function exportToPDF(data) {
    showNotification('PDF export requires a library. Please use CSV export.', 'info');
    // PDF export would require jsPDF or similar library
}

// Copy Functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyNotification();
    });
}

function copyAllResults() {
    const results = [];
    const cards = document.querySelectorAll('.data-card');
    
    cards.forEach(card => {
        const cardData = {};
        const fields = card.querySelectorAll('[class*="bg-slate-900/30"]');
        fields.forEach(field => {
            const key = field.querySelector('.uppercase').textContent.trim();
            const value = field.querySelector('.font-\\[\\'JetBrains_Mono\\'\\]').textContent.trim();
            cardData[key] = value;
        });
        results.push(cardData);
    });
    
    const text = JSON.stringify(results, null, 2);
    copyToClipboard(text);
}

function showCopyNotification() {
    const notification = document.getElementById('copy-notification');
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make displayResultsProfessional globally available
window.displayResultsProfessional = displayResultsProfessional;

// Override displayResults from osint-panel.js if it exists
if (typeof window.displayResults === 'function') {
    const originalDisplayResults = window.displayResults;
    window.displayResults = function(data, apiName, query) {
        displayResultsProfessional(data, apiName, query);
        trackRequest();
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set default category
    selectCategory('breach');
    
    // Update rate limit every second
    setInterval(updateRateLimit, 1000);
});

