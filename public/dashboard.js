let journalists = [];
let currentEditingUsername = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadJournalists();
    loadLogs();
    
    // Set up form submission
    document.getElementById('journalistForm').addEventListener('submit', handleFormSubmit);
    
    // Auto-refresh logs every 30 seconds
    setInterval(loadLogs, 30000);
});

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-blue-400');
        btn.classList.add('border-transparent', 'text-gray-400');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-content`).classList.remove('hidden');
    
    // Activate selected tab
    const activeTab = document.getElementById(`${tabName}-tab`);
    activeTab.classList.add('border-blue-500', 'text-blue-400');
    activeTab.classList.remove('border-transparent', 'text-gray-400');
    
    // Load data for the selected tab
    if (tabName === 'logs') {
        loadLogs();
    }
}

// Load journalists from API
async function loadJournalists() {
    try {
        const response = await fetch('/api/journalists');
        journalists = await response.json();
        renderJournalists();
        updateStats();
    } catch (error) {
        console.error('Error loading journalists:', error);
    }
}

// Render journalists list
function renderJournalists() {
    const container = document.getElementById('journalists-list');
    container.innerHTML = '';
    
    journalists.forEach(journalist => {
        const card = document.createElement('div');
        card.className = `bg-gray-800 rounded-lg p-6 border-l-4 ${getTierColor(journalist.tier)}`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-semibold text-lg">${journalist.displayName}</h3>
                    <p class="text-gray-400">@${journalist.username}</p>
                </div>
                <span class="text-2xl">${journalist.tier}</span>
            </div>
            
            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-400">Reliability</span>
                    <span class="font-semibold">${journalist.reliability}%</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2">
                    <div class="bg-blue-500 h-2 rounded-full" style="width: ${journalist.reliability}%"></div>
                </div>
            </div>
            
            <div class="flex justify-between items-center">
                <span class="px-2 py-1 rounded-full text-xs ${journalist.active ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}">
                    ${journalist.active ? 'Active' : 'Inactive'}
                </span>
                <div class="space-x-2">
                    <button onclick="editJournalist('${journalist.username}')" class="text-blue-400 hover:text-blue-300">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteJournalist('${journalist.username}')" class="text-red-400 hover:text-red-300">
                        <i data-lucide="trash" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    lucide.createIcons();
}

// Update stats
function updateStats() {
    const active = journalists.filter(j => j.active).length;
    const highTier = journalists.filter(j => j.reliability >= 75).length;
    const mediumTier = journalists.filter(j => j.reliability >= 50 && j.reliability < 75).length;
    const questionableTier = journalists.filter(j => j.reliability >= 25 && j.reliability < 50).length;
    const waffleTier = journalists.filter(j => j.reliability < 25).length;
    
    document.getElementById('activeJournalists').textContent = active;
    document.getElementById('highTier').textContent = highTier;
    document.getElementById('mediumTier').textContent = mediumTier;
    document.getElementById('questionableTier').textContent = questionableTier;
    document.getElementById('waffleTier').textContent = waffleTier;
}

// Get tier color class
function getTierColor(tier) {
    switch (tier) {
        case '🟢': return 'border-green-500';
        case '🟡': return 'border-yellow-500';
        case '🟠': return 'border-orange-500';
        case '🔴': return 'border-red-500';
        default: return 'border-gray-500';
    }
}

// Show add form
function showAddForm() {
    currentEditingUsername = null;
    document.getElementById('form-title').textContent = 'Add New Journalist';
    document.getElementById('journalistForm').reset();
    document.getElementById('journalist-form').classList.remove('hidden');
}

// Edit journalist
function editJournalist(username) {
    const journalist = journalists.find(j => j.username === username);
    if (!journalist) return;
    
    currentEditingUsername = username;
    document.getElementById('form-title').textContent = 'Edit Journalist';
    
    document.getElementById('username').value = journalist.username;
    document.getElementById('displayName').value = journalist.displayName;
    document.getElementById('reliability').value = journalist.reliability;
    document.getElementById('tier').value = journalist.tier;
    document.getElementById('active').checked = journalist.active;
    
    // Disable username field when editing
    document.getElementById('username').disabled = true;
    
    document.getElementById('journalist-form').classList.remove('hidden');
}

// Hide form
function hideForm() {
    document.getElementById('journalist-form').classList.add('hidden');
    document.getElementById('username').disabled = false;
    currentEditingUsername = null;
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value,
        displayName: document.getElementById('displayName').value,
        reliability: parseFloat(document.getElementById('reliability').value),
        tier: document.getElementById('tier').value,
        active: document.getElementById('active').checked
    };
    
    try {
        let response;
        if (currentEditingUsername) {
            response = await fetch(`/api/journalists/${currentEditingUsername}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch('/api/journalists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }
        
        if (response.ok) {
            hideForm();
            loadJournalists();
        } else {
            alert('Error saving journalist');
        }
    } catch (error) {
        console.error('Error saving journalist:', error);
        alert('Error saving journalist');
    }
}

// Delete journalist
async function deleteJournalist(username) {
    if (!confirm(`Are you sure you want to delete @${username}?`)) return;
    
    try {
        const response = await fetch(`/api/journalists/${username}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadJournalists();
        } else {
            alert('Error deleting journalist');
        }
    } catch (error) {
        console.error('Error deleting journalist:', error);
        alert('Error deleting journalist');
    }
}

// Load logs
async function loadLogs() {
    try {
        const response = await fetch('/api/logs');
        const logs = await response.json();
        renderLogs(logs);
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

// Render logs
function renderLogs(logs) {
    const container = document.getElementById('logs-container');
    container.innerHTML = '';
    
    logs.forEach(log => {
        const logElement = document.createElement('div');
        logElement.className = `p-3 rounded border-l-4 ${getLogLevelColor(log.level)}`;
        
        const timestamp = new Date(log.timestamp).toLocaleString();
        
        logElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <p class="text-sm">${log.message}</p>
                    ${log.service ? `<p class="text-xs text-gray-400 mt-1">${log.service}</p>` : ''}
                </div>
                <span class="text-xs text-gray-400 ml-4">${timestamp}</span>
            </div>
        `;
        
        container.appendChild(logElement);
    });
}

// Get log level color
function getLogLevelColor(level) {
    switch (level) {
        case 'error': return 'border-red-500 bg-red-900/20';
        case 'warn': return 'border-yellow-500 bg-yellow-900/20';
        case 'info': return 'border-blue-500 bg-blue-900/20';
        default: return 'border-gray-500 bg-gray-900/20';
    }
}