// Main application
class App {
    constructor() {
        this.filterManager = new FilterManager();
        this.recordsManager = new RecordsManager();
    }

    init() {
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
        
        if (!filters.date) {
            alert('Please select a date');
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
        
        // Show loading in the records panel
        this.recordsManager.showLoading();
        
        try {
            // Prepare query variables
            const variables = {
                fromDate: filters.date,
                toDate: '',  // Empty string as per spec
                addrs: filters.accounts,
                v2PairsAddrs: filters.v2pairs,
                v3PoolsAddrs: filters.v3pools
            };
            
            console.log('Executing query with variables:', variables);
            
            // Execute the GraphQL query
            const data = await api.query(queries.profileRecords, variables);
            
            // Display the records
            this.recordsManager.displayRecords(data);
            
        } catch (error) {
            console.error('Query error:', error);
            this.recordsManager.showError(`Query failed: ${error.message}`);
        } finally {
            // Re-enable all controls
            queryBtn.disabled = false;
            filterPanel.querySelectorAll('input, button').forEach(el => el.disabled = false);
            filterPanel.querySelectorAll('.multi-select').forEach(el => {
                el.classList.remove('disabled');
                el.style.pointerEvents = '';
            });
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
            const app = new App();
            app.init();
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
                    const app = new App();
                    app.init();
                }
            }
        }, 10000); // 10 second timeout
    }
});