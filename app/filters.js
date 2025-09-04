// Filter management
class FilterManager {
    constructor() {
        this.data = {
            accounts: [],
            v2pairs: [],
            v3pools: []
        };
        
        this.selected = {
            dateFrom: null,
            dateTo: null,
            dateToEnabled: true,
            accounts: new Set(),
            v2pairs: new Set(),
            v3pools: new Set()
        };
        
        this.dropdowns = {
            accounts: null,
            v2pairs: null,
            v3pools: null
        };
    }

    init(onDataLoaded) {
        this.onDataLoaded = onDataLoaded;
        this.setupDateFilter();
        this.setupMultiSelects();
        this.loadFilterData();
    }

    setupDateFilter() {
        const dateFromInput = document.getElementById('date-from-filter');
        const dateToInput = document.getElementById('date-to-filter');
        const dateToCheckbox = document.getElementById('date-to-checkbox');
        
        // Set defaults from defaults.js
        dateFromInput.value = defaultFromDate;
        
        if (defaultFromTo === '') {
            // If defaultFromTo is empty, disable dateTo
            this.selected.dateToEnabled = false;
            dateToCheckbox.checked = false;
            dateToInput.disabled = true;
            this.selected.dateTo = null;
        } else {
            dateToInput.value = defaultFromTo;
            this.selected.dateTo = defaultFromTo;
            this.selected.dateToEnabled = true;
        }
        
        this.selected.dateFrom = defaultFromDate;
        
        // Handle dateFrom changes
        dateFromInput.addEventListener('change', (e) => {
            this.selected.dateFrom = e.target.value;
            // Validate that dateTo is not less than dateFrom
            if (this.selected.dateToEnabled && this.selected.dateTo && this.selected.dateTo < e.target.value) {
                this.selected.dateTo = e.target.value;
                dateToInput.value = e.target.value;
            }
        });
        
        // Handle dateTo changes
        dateToInput.addEventListener('change', (e) => {
            // Validate that dateTo is not less than dateFrom
            if (e.target.value < this.selected.dateFrom) {
                e.target.value = this.selected.dateFrom;
                this.selected.dateTo = this.selected.dateFrom;
            } else {
                this.selected.dateTo = e.target.value;
            }
        });
        
        // Handle checkbox changes
        dateToCheckbox.addEventListener('change', (e) => {
            this.selected.dateToEnabled = e.target.checked;
            dateToInput.disabled = !e.target.checked;
            
            if (!e.target.checked) {
                this.selected.dateTo = null;
            } else {
                this.selected.dateTo = dateToInput.value;
            }
        });
    }

    setupMultiSelects() {
        // Setup accounts multi-select
        this.setupMultiSelect('accounts');
        this.setupMultiSelect('v2pairs');
        this.setupMultiSelect('v3pools');
    }

    setupMultiSelect(type) {
        const container = document.getElementById(`${type}-filter`);
        const header = container.querySelector('.multi-select-header');
        const dropdown = document.getElementById(`${type}-dropdown`);
        
        this.dropdowns[type] = dropdown;
        
        // Toggle dropdown
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = container.classList.contains('active');
            
            // Close all other dropdowns
            document.querySelectorAll('.multi-select').forEach(el => {
                if (el !== container) {
                    el.classList.remove('active');
                }
            });
            
            container.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                container.classList.remove('active');
            }
        });
    }

    async loadFilterData() {
        const statusPanel = document.getElementById('status-panel');
        const loadingDiv = statusPanel.querySelector('.loading');
        const errorDiv = statusPanel.querySelector('.error');
        const mainInterface = document.getElementById('main-interface');
        
        // Show loading, hide error and main interface
        statusPanel.classList.remove('hidden');
        loadingDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        mainInterface.classList.add('hidden');
        
        try {
            // Load all data in a single request
            const data = await api.query(queries.initData);
            
            // Process and store data
            this.data.accounts = data.profile.accounts || [];
            this.data.v2pairs = data.v2pairs || [];
            this.data.v3pools = data.v3pools || [];
            
            // Populate dropdowns
            this.populateAccountsDropdown();
            this.populateV2PairsDropdown();
            this.populateV3PoolsDropdown();
            
            // Notify callback with loaded data
            if (this.onDataLoaded) {
                this.onDataLoaded(this.data.accounts, this.data.v2pairs, this.data.v3pools);
            }
            
            // Hide status panel and show main interface
            statusPanel.classList.add('hidden');
            mainInterface.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error loading filter data:', error);
            loadingDiv.classList.add('hidden');
            errorDiv.classList.remove('hidden');
            errorDiv.querySelector('.error-message').textContent = `Failed to load data: ${error.message}`;
            
            // Setup retry button
            const retryBtn = errorDiv.querySelector('.btn-retry');
            retryBtn.onclick = () => this.loadFilterData();
            
            // Keep main interface hidden on error
            mainInterface.classList.add('hidden');
        }
    }

    populateAccountsDropdown() {
        const dropdown = this.dropdowns.accounts;
        dropdown.innerHTML = '';
        
        // Sort accounts
        const sortedAccounts = [...this.data.accounts].sort();
        
        // Use default accounts from defaults.js
        
        sortedAccounts.forEach((account, index) => {
            const item = document.createElement('div');
            item.className = 'multi-select-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `account-${index}`;
            checkbox.value = account;
            
            // Auto-select default accounts from defaults.js
            if (defaultAccounts.includes(account) && account !== '') {
                checkbox.checked = true;
                this.selected.accounts.add(account);
            }
            
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selected.accounts.add(account);
                } else {
                    this.selected.accounts.delete(account);
                }
                this.updateMultiSelectHeader('accounts');
            });
            
            const label = document.createElement('label');
            label.htmlFor = `account-${index}`;
            label.textContent = `w(${index + 1})${account.substring(0, 10)}...`;
            label.title = account; // Standard HTML tooltip
            
            item.appendChild(checkbox);
            item.appendChild(label);
            dropdown.appendChild(item);
        });
        
        // Update the header to reflect auto-selected accounts
        this.updateMultiSelectHeader('accounts');
    }

    populateV2PairsDropdown() {
        const dropdown = this.dropdowns.v2pairs;
        dropdown.innerHTML = '';
        
        // Add "no-one" item first
        const noOneItem = document.createElement('div');
        noOneItem.className = 'multi-select-item';
        
        const noOneCheckbox = document.createElement('input');
        noOneCheckbox.type = 'checkbox';
        noOneCheckbox.id = 'v2pair-none';
        noOneCheckbox.value = 'none';
        
        noOneCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Clear all other selections
                this.selected.v2pairs.clear();
                this.selected.v2pairs.add('none');
                // Uncheck all other checkboxes
                dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    if (cb !== noOneCheckbox) cb.checked = false;
                });
            } else {
                this.selected.v2pairs.delete('none');
            }
            this.updateMultiSelectHeader('v2pairs');
        });
        
        const noOneLabel = document.createElement('label');
        noOneLabel.htmlFor = 'v2pair-none';
        noOneLabel.textContent = 'no-one';
        
        noOneItem.appendChild(noOneCheckbox);
        noOneItem.appendChild(noOneLabel);
        dropdown.appendChild(noOneItem);
        
        // Add regular pairs
        this.data.v2pairs.forEach((pair, index) => {
            const item = document.createElement('div');
            item.className = 'multi-select-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `v2pair-${index}`;
            checkbox.value = pair.addr;
            
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // If "no-one" is selected, uncheck it
                    if (this.selected.v2pairs.has('none')) {
                        this.selected.v2pairs.delete('none');
                        document.getElementById('v2pair-none').checked = false;
                    }
                    this.selected.v2pairs.add(pair.addr);
                } else {
                    this.selected.v2pairs.delete(pair.addr);
                }
                this.updateMultiSelectHeader('v2pairs');
            });
            
            const label = document.createElement('label');
            label.htmlFor = `v2pair-${index}`;
            label.textContent = `${pair.token0.symbol}/${pair.token1.symbol}-${pair.addr.substring(0, 10)}...`;
            label.title = pair.addr; // Standard HTML tooltip
            
            item.appendChild(checkbox);
            item.appendChild(label);
            dropdown.appendChild(item);
        });
    }

    populateV3PoolsDropdown() {
        const dropdown = this.dropdowns.v3pools;
        dropdown.innerHTML = '';
        
        // Add "no-one" item first
        const noOneItem = document.createElement('div');
        noOneItem.className = 'multi-select-item';
        
        const noOneCheckbox = document.createElement('input');
        noOneCheckbox.type = 'checkbox';
        noOneCheckbox.id = 'v3pool-none';
        noOneCheckbox.value = 'none';
        
        noOneCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Clear all other selections
                this.selected.v3pools.clear();
                this.selected.v3pools.add('none');
                // Uncheck all other checkboxes
                dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    if (cb !== noOneCheckbox) cb.checked = false;
                });
            } else {
                this.selected.v3pools.delete('none');
            }
            this.updateMultiSelectHeader('v3pools');
        });
        
        const noOneLabel = document.createElement('label');
        noOneLabel.htmlFor = 'v3pool-none';
        noOneLabel.textContent = 'no-one';
        
        noOneItem.appendChild(noOneCheckbox);
        noOneItem.appendChild(noOneLabel);
        dropdown.appendChild(noOneItem);
        
        // Add regular pools
        this.data.v3pools.forEach((pool, index) => {
            const item = document.createElement('div');
            item.className = 'multi-select-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `v3pool-${index}`;
            checkbox.value = pool.addr;
            
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // If "no-one" is selected, uncheck it
                    if (this.selected.v3pools.has('none')) {
                        this.selected.v3pools.delete('none');
                        document.getElementById('v3pool-none').checked = false;
                    }
                    this.selected.v3pools.add(pool.addr);
                } else {
                    this.selected.v3pools.delete(pool.addr);
                }
                this.updateMultiSelectHeader('v3pools');
            });
            
            const label = document.createElement('label');
            label.htmlFor = `v3pool-${index}`;
            // Convert fee from basis points to percentage
            const feePercent = (pool.fee / 10000).toFixed(2);
            label.textContent = `${pool.token0.symbol}/${pool.token1.symbol}-${feePercent}%-${pool.addr.substring(0, 10)}...`;
            label.title = pool.addr; // Standard HTML tooltip
            
            item.appendChild(checkbox);
            item.appendChild(label);
            dropdown.appendChild(item);
        });
    }

    updateMultiSelectHeader(type) {
        const container = document.getElementById(`${type}-filter`);
        const placeholder = container.querySelector('.placeholder');
        const selected = this.selected[type];
        
        if (selected.size === 0) {
            placeholder.textContent = `Select ${type}...`;
            placeholder.style.color = '#999';
        } else if ((type === 'v2pairs' || type === 'v3pools') && selected.has('none')) {
            placeholder.textContent = 'no-one';
            placeholder.style.color = '#333';
        } else {
            placeholder.textContent = `${selected.size} selected`;
            placeholder.style.color = '#333';
        }
    }

    getSelectedFilters() {
        // Process v2pairs - if "none" is selected, return zero address
        let v2pairs = [];
        if (this.selected.v2pairs.has('none')) {
            v2pairs = ['0x0000000000000000000000000000000000000000'];
        } else {
            v2pairs = Array.from(this.selected.v2pairs);
        }
        
        // Process v3pools - if "none" is selected, return zero address
        let v3pools = [];
        if (this.selected.v3pools.has('none')) {
            v3pools = ['0x0000000000000000000000000000000000000000'];
        } else {
            v3pools = Array.from(this.selected.v3pools);
        }
        
        return {
            fromDate: this.selected.dateFrom,
            toDate: this.selected.dateToEnabled ? this.selected.dateTo : '',
            accounts: Array.from(this.selected.accounts),
            v2pairs: v2pairs,
            v3pools: v3pools
        };
    }
}