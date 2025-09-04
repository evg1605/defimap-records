// Tab Manager
class TabManager {
    constructor() {
        this.activeTab = 'records';
    }
    
    init() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }
    
    switchTab(tabName) {
        if (this.activeTab === tabName) return;
        
        // Remove active class from all buttons and panes
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Add active class to selected button and pane
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        this.activeTab = tabName;
    }
    
    showRecordsTab() {
        this.switchTab('records');
    }
    
    showPnLTab() {
        this.switchTab('pnl');
    }
    
    getActiveTab() {
        return this.activeTab;
    }
}

// Main application
class App {
    constructor() {
        this.filterManager = new FilterManager();
        this.recordsManager = new RecordsManager();
        this.tabManager = new TabManager();
    }

    init() {
        // Initialize tab manager
        this.tabManager.init();
        
        // Initialize filter manager with callback to update records manager
        this.filterManager.init((accounts, v2pairs, v3pools) => {
            this.recordsManager.setFilterData(accounts, v2pairs, v3pools);
        });
        
        // Setup query button
        const queryBtn = document.getElementById('run-query');
        queryBtn.addEventListener('click', () => this.runQuery());
    }

    async runQuery() {
        const filters = this.filterManager.getSelectedFilters();
        
        if (!filters.fromDate) {
            alert('Please select a from date');
            return;
        }
        
        const queryBtn = document.getElementById('run-query');
        const filterPanel = document.querySelector('.filter-panel');
        
        // Disable all controls in the header
        queryBtn.disabled = true;
        filterPanel.querySelectorAll('input, button').forEach(el => el.disabled = true);
        filterPanel.querySelectorAll('.multi-select').forEach(el => {
            el.classList.add('disabled');
            el.style.pointerEvents = 'none';
        });
        
        // Show loading based on active tab
        const activeTab = this.tabManager.getActiveTab();
        if (activeTab === 'records') {
            this.recordsManager.showLoading();
        } else if (activeTab === 'pnl') {
            this.showPnLLoading();
        }
        
        try {
            // Prepare query variables
            const variables = {
                fromDate: filters.fromDate,
                toDate: filters.toDate,  // Either date string or empty string if disabled
                addrs: filters.accounts,
                v2PairsAddrs: filters.v2pairs,
                v3PoolsAddrs: filters.v3pools
            };
            
            console.log('Executing query with variables:', variables);
            
            // Execute appropriate query based on active tab
            if (activeTab === 'records') {
                const data = await api.query(queries.profileRecords, variables);
                this.recordsManager.displayRecords(data);
            } else if (activeTab === 'pnl') {
                // TODO: Implement PnL query when available
                this.showPnLPlaceholder();
            }
            
        } catch (error) {
            console.error('Query error:', error);
            if (activeTab === 'records') {
                this.recordsManager.showError(`Query failed: ${error.message}`);
            } else if (activeTab === 'pnl') {
                this.showPnLError(`Query failed: ${error.message}`);
            }
        } finally {
            // Re-enable all controls
            queryBtn.disabled = false;
            filterPanel.querySelectorAll('input, button').forEach(el => {
                // Don't re-enable date-to input if checkbox is unchecked
                if (el.id === 'date-to-filter') {
                    const checkbox = document.getElementById('date-to-checkbox');
                    if (checkbox && checkbox.checked) {
                        el.disabled = false;
                    }
                } else {
                    el.disabled = false;
                }
            });
            filterPanel.querySelectorAll('.multi-select').forEach(el => {
                el.classList.remove('disabled');
                el.style.pointerEvents = '';
            });
        }
    }

    showPnLLoading() {
        const pnlPanel = document.getElementById('pnl-panel');
        if (pnlPanel) {
            pnlPanel.className = 'pnl-panel loading';
            pnlPanel.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <span>Loading PnL data...</span>
                </div>
            `;
        }
    }

    showPnLError(message) {
        const pnlPanel = document.getElementById('pnl-panel');
        if (pnlPanel) {
            pnlPanel.className = 'pnl-panel error';
            pnlPanel.innerHTML = `
                <div class="error">
                    <span class="error-message">${message}</span>
                    <button class="btn-retry" onclick="app.runQuery()">Retry</button>
                </div>
            `;
        }
    }

    showPnLPlaceholder() {
        const pnlPanel = document.getElementById('pnl-panel');
        if (pnlPanel) {
            pnlPanel.className = 'pnl-panel';
            pnlPanel.innerHTML = `
                <div class="no-records">
                    <h3>PnL Analysis</h3>
                    <p>PnL functionality will be implemented in a future update.</p>
                    <p>This will show profit and loss analysis for the selected filters.</p>
                </div>
            `;
        }
    }
}

// Global function to toggle params popup
function toggleParamsPopup(recordId) {
    const popup = document.getElementById(`params-popup-${recordId}`);
    if (!popup) return;
    
    // Close any other open popups first
    document.querySelectorAll('.params-popup[style*="block"]').forEach(otherPopup => {
        if (otherPopup.id !== `params-popup-${recordId}`) {
            otherPopup.style.display = 'none';
        }
    });
    
    // Remove any existing click outside handlers
    if (popup.clickOutsideHandler) {
        document.removeEventListener('click', popup.clickOutsideHandler);
        popup.clickOutsideHandler = null;
    }
    
    if (popup.style.display === 'none' || !popup.style.display) {
        popup.style.display = 'block';
        
        // Add click outside to close functionality
        const clickOutsideHandler = (event) => {
            if (!popup.contains(event.target)) {
                popup.style.display = 'none';
                document.removeEventListener('click', clickOutsideHandler);
                popup.clickOutsideHandler = null;
            }
        };
        
        // Store reference to handler for cleanup
        popup.clickOutsideHandler = clickOutsideHandler;
        
        // Use setTimeout to avoid immediate closing
        setTimeout(() => {
            document.addEventListener('click', clickOutsideHandler);
        }, 10);
        
    } else {
        popup.style.display = 'none';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Google Identity Services to load
    const initApp = async () => {
        // Initialize Google Identity Services
        initGoogleAuth();
        
        // Check authentication first
        const isAuthenticated = await checkAndHandleAuth();
        
        if (isAuthenticated) {
            // Authentication successful or not needed, initialize the app
            window.app = new App();
            window.app.init();
        }
        // If not authenticated, checkAndHandleAuth will show sign-in modal
    };
    
    // Check if Google Identity Services is already loaded
    if (typeof google !== 'undefined' && google.accounts) {
        initApp();
    } else {
        // Wait for Google script to load
        const checkGoogleLoaded = setInterval(() => {
            if (typeof google !== 'undefined' && google.accounts) {
                clearInterval(checkGoogleLoaded);
                initApp();
            }
        }, 100);
        
        // Fallback timeout
        setTimeout(() => {
            clearInterval(checkGoogleLoaded);
            if (typeof google === 'undefined' || !google.accounts) {
                console.error('Google Identity Services failed to load');
                // For localhost, still initialize the app
                if (apiUrl.includes('localhost')) {
                    window.app = new App();
                    window.app.init();
                }
            }
        }, 10000); // 10 second timeout
    }
});