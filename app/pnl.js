// PnL Panel Manager
class PnLManager {
    constructor() {
        this.pnlPanel = null;
    }

    init() {
        this.pnlPanel = document.getElementById('pnl-panel');
        if (!this.pnlPanel) {
            console.error('PnL panel element not found');
            return;
        }
    }

    showLoading() {
        if (!this.pnlPanel) return;
        
        this.pnlPanel.className = 'pnl-panel loading';
        this.pnlPanel.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span>Loading PnL data...</span>
            </div>
        `;
    }

    showError(message) {
        if (!this.pnlPanel) return;
        
        this.pnlPanel.className = 'pnl-panel error';
        this.pnlPanel.innerHTML = `
            <div class="error">
                <span class="error-message">${message}</span>
            </div>
        `;
    }

    displayPnL(data) {
        if (!this.pnlPanel || !data || !data.pnls) {
            console.error('Invalid PnL data received');
            this.showError('Invalid data received from server');
            return;
        }

        this.pnlPanel.className = 'pnl-panel';
        
        // Based on the requirements, display raw JSON data in a <pre> tag
        const jsonString = JSON.stringify(data.pnls, null, 2);
        
        this.pnlPanel.innerHTML = `
            <div class="pnl-content">
                <h3>PnL Data</h3>
                <pre class="pnl-raw-data">${jsonString}</pre>
            </div>
        `;
    }
}