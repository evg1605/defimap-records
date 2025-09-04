// PnL Manager
class PnLManager {
    constructor() {
        this.currentData = null;
    }

    init() {
        console.log('PnLManager initialized');
    }

    showLoading() {
        const pnlPanel = document.getElementById('pnl-panel');
        if (!pnlPanel) return;

        pnlPanel.innerHTML = `
            <div class="loading-container">
                <div class="loading">
                    <div class="spinner"></div>
                    <span>Loading PnL data...</span>
                </div>
            </div>
        `;
    }

    showError(message) {
        const pnlPanel = document.getElementById('pnl-panel');
        if (!pnlPanel) return;

        pnlPanel.innerHTML = `
            <div class="error-container">
                <div class="error">
                    <span class="error-message">${message}</span>
                </div>
            </div>
        `;
    }

    displayPnL(data) {
        console.log('Displaying PnL data:', data);
        this.currentData = data.pnls;

        const pnlPanel = document.getElementById('pnl-panel');
        if (!pnlPanel) return;

        const pnlData = this.currentData;

        // Build the PnL display
        let html = `
            <div class="pnl-container">
                <div class="pnl-sections">
        `;

        // Total Section
        html += this.renderTotalSection(pnlData);

        // Ethereum Section
        if (pnlData.ethPnl) {
            html += this.renderEthereumSection(pnlData.ethPnl);
        }

        // ERC20 Section
        if (pnlData.ercPnls && pnlData.ercPnls.ercsPnls && pnlData.ercPnls.ercsPnls.length > 0) {
            html += this.renderERC20Section(pnlData.ercPnls);
        }

        html += `
                </div>
            </div>
        `;

        pnlPanel.innerHTML = html;
    }

    renderTotalSection(pnlData) {
        return `
            <div class="pnl-section">
                <h3 class="pnl-section-title">Total</h3>
                <div class="pnl-section-content">
                    <div class="pnl-item">
                        <span class="pnl-label">PnL:</span>
                        <span class="pnl-values">
                            <span class="pnl-value ${this.getValueClass(pnlData.totalPnl.pnlUsd)}">
                                ${this.formatUsdAmount(pnlData.totalPnl.pnlUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-value ${this.getValueClass(pnlData.totalPnl.pnl)}" title="${pnlData.totalPnl.pnl}">
                                ${this.formatPercentage(pnlData.totalPnl.pnl)}
                            </span>
                        </span>
                    </div>
                    
                    <div class="pnl-item">
                        <span class="pnl-label">Diff:</span>
                        <span class="pnl-values">
                            <span class="pnl-start-label">start</span>
                            <span class="pnl-value">
                                ${this.formatUsdAmount(pnlData.totalDiff.startUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-final-label">final</span>
                            <span class="pnl-value">
                                ${this.formatUsdAmount(pnlData.totalDiff.finalUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-value ${this.getValueClass(pnlData.totalDiff.diffUsd)}">
                                ${this.formatUsdAmount(pnlData.totalDiff.diffUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-value ${this.getValueClass(pnlData.totalDiff.diffRel)}" title="${pnlData.totalDiff.diffRel}">
                                ${this.formatPercentage(pnlData.totalDiff.diffRel)}
                            </span>
                        </span>
                    </div>
                    
                    <div class="pnl-item">
                        <span class="pnl-label">All DeFi diff:</span>
                        <span class="pnl-values">
                            <span class="pnl-start-label">start</span>
                            <span class="pnl-value">
                                ${this.formatUsdAmount(pnlData.totalLiqDiff.startUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-final-label">final</span>
                            <span class="pnl-value">
                                ${this.formatUsdAmount(pnlData.totalLiqDiff.finalUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-value ${this.getValueClass(pnlData.totalLiqDiff.diffUsd)}">
                                ${this.formatUsdAmount(pnlData.totalLiqDiff.diffUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-value ${this.getValueClass(pnlData.totalLiqDiff.diffRel)}" title="${pnlData.totalLiqDiff.diffRel}">
                                ${this.formatPercentage(pnlData.totalLiqDiff.diffRel)}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderEthereumSection(ethPnl) {
        return `
            <div class="pnl-section">
                <h3 class="pnl-section-title">Ethereum</h3>
                <div class="pnl-section-content">
                    <div class="pnl-item">
                        <span class="pnl-label">Diff:</span>
                        <span class="pnl-values">
                            <span class="pnl-start-label">start</span>
                            <span class="pnl-value">
                                ${this.formatUsdAmount(ethPnl.diff.startUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-final-label">final</span>
                            <span class="pnl-value">
                                ${this.formatUsdAmount(ethPnl.diff.finalUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-value ${this.getValueClass(ethPnl.diff.diffUsd)}">
                                ${this.formatUsdAmount(ethPnl.diff.diffUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-value ${this.getValueClass(ethPnl.diff.diffRel)}" title="${ethPnl.diff.diffRel}">
                                ${this.formatPercentage(ethPnl.diff.diffRel)}
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    renderERC20Section(ercsPnl) {
        // Filter out tokens where both startUsd and finalUsd are 0, then sort by symbol
        const sortedErcPnls = [...ercsPnl.ercsPnls]
            .filter(ercPnl => {
                if (!ercPnl.diff) return false;
                const startUsd = parseFloat(ercPnl.diff.startUsd || '0');
                const finalUsd = parseFloat(ercPnl.diff.finalUsd || '0');
                return !(startUsd === 0 && finalUsd === 0);
            })
            .sort((a, b) => {
                const symbolA = a.token?.symbol || '';
                const symbolB = b.token?.symbol || '';
                return symbolA.localeCompare(symbolB);
            });

        let html = `
            <div class="pnl-section">
                <h3 class="pnl-section-title">ERC20</h3>
                <div class="pnl-section-content">
        `;

        // First show the overall ERC20 diff
        if (ercsPnl.diff) {
            html += `
                <div class="pnl-item">
                    <span class="pnl-label">Diff:</span>
                    <span class="pnl-values">
                        <span class="pnl-start-label">start</span>
                        <span class="pnl-value">
                            ${this.formatUsdAmount(ercsPnl.diff.startUsd)}
                        </span>
                        <span class="pnl-separator">,</span>
                        <span class="pnl-final-label">final</span>
                        <span class="pnl-value">
                            ${this.formatUsdAmount(ercsPnl.diff.finalUsd)}
                        </span>
                        <span class="pnl-separator">,</span>
                        <span class="pnl-value ${this.getValueClass(ercsPnl.diff.diffUsd)}">
                            ${this.formatUsdAmount(ercsPnl.diff.diffUsd)}
                        </span>
                        <span class="pnl-separator">,</span>
                        <span class="pnl-value ${this.getValueClass(ercsPnl.diff.diffRel)}" title="${ercsPnl.diff.diffRel}">
                            ${this.formatPercentage(ercsPnl.diff.diffRel)}
                        </span>
                    </span>
                </div>
            `;
        }

        // Then show each token's diff
        sortedErcPnls.forEach((ercPnl, index) => {
            if (ercPnl.token && ercPnl.diff) {
                const isFirstToken = index === 0;
                html += `
                    <div class="pnl-item ${isFirstToken ? 'pnl-item-first-token' : ''}">
                        <span class="pnl-label">${ercPnl.token.symbol}:</span>
                        <span class="pnl-values">
                            <span class="pnl-start-label">start</span>
                            <span class="pnl-value">
                                ${this.formatUsdAmount(ercPnl.diff.startUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-final-label">final</span>
                            <span class="pnl-value">
                                ${this.formatUsdAmount(ercPnl.diff.finalUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-value ${this.getValueClass(ercPnl.diff.diffUsd)}">
                                ${this.formatUsdAmount(ercPnl.diff.diffUsd)}
                            </span>
                            <span class="pnl-separator">,</span>
                            <span class="pnl-value ${this.getValueClass(ercPnl.diff.diffRel)}" title="${ercPnl.diff.diffRel}">
                                ${this.formatPercentage(ercPnl.diff.diffRel)}
                            </span>
                        </span>
                    </div>
                `;
            }
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    // Helper functions
    formatUsdAmount(amountStr) {
        if (!amountStr) return '0.00 USD';
        
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) return '0.00 USD';
        
        return amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' USD';
    }

    formatPercentage(percentStr) {
        if (!percentStr) return '0.00%';
        
        const percent = parseFloat(percentStr);
        if (isNaN(percent)) return '0.00%';
        
        // Convert decimal to percentage (multiply by 100)
        const percentageValue = percent * 100;
        
        // If very small percentage (< 0.01%), show at least one decimal place
        if (Math.abs(percentageValue) < 0.01 && percentageValue !== 0) {
            return percentageValue.toFixed(3) + '%';
        }
        
        // Otherwise, show 2 decimal places
        return percentageValue.toFixed(2) + '%';
    }

    getValueClass(valueStr) {
        if (!valueStr) return 'pnl-neutral';
        
        const value = parseFloat(valueStr);
        if (isNaN(value)) return 'pnl-neutral';
        
        if (value > 0) return 'pnl-positive';
        if (value < 0) return 'pnl-negative';
        return 'pnl-neutral';
    }
}