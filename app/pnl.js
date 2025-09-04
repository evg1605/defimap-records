// PnL Manager
class PnLManager {
    constructor() {
        this.currentData = null;
        this.addressResolver = null;
    }

    init() {
        console.log('PnLManager initialized');
    }

    setFilterData(accounts, v2pairs, v3pools) {
        if (!this.addressResolver) {
            this.addressResolver = new AddressResolver();
        }
        this.addressResolver.setData(accounts, v2pairs, v3pools);
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

        // V2 Pairs Section
        if (pnlData.v2Pnls && (pnlData.v2Pnls.diff || (pnlData.v2Pnls.pairsPnls && pnlData.v2Pnls.pairsPnls.length > 0))) {
            html += this.renderV2PairsSection(pnlData.v2Pnls);
        }

        // V3 Pools Section
        if (pnlData.v3Pnls && (pnlData.v3Pnls.diff || (pnlData.v3Pnls.nftPnls && pnlData.v3Pnls.nftPnls.length > 0) || (pnlData.v3Pnls.poolsPnls && pnlData.v3Pnls.poolsPnls.length > 0))) {
            html += this.renderV3PoolsSection(pnlData.v3Pnls);
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
                    <div class="pnl-diff-table">
                        <div class="pnl-diff-header">
                            <div class="pnl-diff-cell pnl-diff-header-cell"></div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">PnL USD</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">PnL %</div>
                        </div>
                        <div class="pnl-diff-row">
                            <div class="pnl-diff-cell pnl-diff-name-cell">PnL:</div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(pnlData.totalPnl.pnlUsd)}">
                                ${this.formatUsdAmount(pnlData.totalPnl.pnlUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(pnlData.totalPnl.pnl)}" title="${pnlData.totalPnl.pnl}">
                                ${this.formatPercentage(pnlData.totalPnl.pnl)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="pnl-diff-table">
                        <div class="pnl-diff-header">
                            <div class="pnl-diff-cell pnl-diff-header-cell"></div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">start</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">final</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff%</div>
                        </div>
                        <div class="pnl-diff-row">
                            <div class="pnl-diff-cell pnl-diff-name-cell">Diff:</div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(pnlData.totalDiff.startUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(pnlData.totalDiff.finalUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(pnlData.totalDiff.diffUsd)}">
                                ${this.formatUsdAmount(pnlData.totalDiff.diffUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(pnlData.totalDiff.diffRel)}" title="${pnlData.totalDiff.diffRel}">
                                ${this.formatPercentage(pnlData.totalDiff.diffRel)}
                            </div>
                        </div>
                        <div class="pnl-diff-row">
                            <div class="pnl-diff-cell pnl-diff-name-cell">All DeFi diff:</div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(pnlData.totalLiqDiff.startUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(pnlData.totalLiqDiff.finalUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(pnlData.totalLiqDiff.diffUsd)}">
                                ${this.formatUsdAmount(pnlData.totalLiqDiff.diffUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(pnlData.totalLiqDiff.diffRel)}" title="${pnlData.totalLiqDiff.diffRel}">
                                ${this.formatPercentage(pnlData.totalLiqDiff.diffRel)}
                            </div>
                        </div>
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
                    <div class="pnl-diff-table">
                        <div class="pnl-diff-header">
                            <div class="pnl-diff-cell pnl-diff-header-cell"></div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">start</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">final</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff%</div>
                        </div>
                        <div class="pnl-diff-row">
                            <div class="pnl-diff-cell pnl-diff-name-cell">Diff:</div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(ethPnl.diff.startUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(ethPnl.diff.finalUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(ethPnl.diff.diffUsd)}">
                                ${this.formatUsdAmount(ethPnl.diff.diffUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(ethPnl.diff.diffRel)}" title="${ethPnl.diff.diffRel}">
                                ${this.formatPercentage(ethPnl.diff.diffRel)}
                            </div>
                        </div>
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
                    <div class="pnl-diff-table">
                        <div class="pnl-diff-header">
                            <div class="pnl-diff-cell pnl-diff-header-cell"></div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">start</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">final</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff%</div>
                        </div>
        `;

        // First show the overall ERC20 diff
        if (ercsPnl.diff) {
            html += `
                        <div class="pnl-diff-row">
                            <div class="pnl-diff-cell pnl-diff-name-cell">Diff:</div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(ercsPnl.diff.startUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(ercsPnl.diff.finalUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(ercsPnl.diff.diffUsd)}">
                                ${this.formatUsdAmount(ercsPnl.diff.diffUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(ercsPnl.diff.diffRel)}" title="${ercsPnl.diff.diffRel}">
                                ${this.formatPercentage(ercsPnl.diff.diffRel)}
                            </div>
                        </div>
            `;
        }

        // Then show each token's diff
        sortedErcPnls.forEach((ercPnl, index) => {
            if (ercPnl.token && ercPnl.diff) {
                const isFirstToken = index === 0;
                html += `
                        <div class="pnl-diff-row ${isFirstToken ? 'pnl-token-separator-row' : ''}">
                            <div class="pnl-diff-cell pnl-diff-name-cell">${ercPnl.token.symbol}:</div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(ercPnl.diff.startUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(ercPnl.diff.finalUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(ercPnl.diff.diffUsd)}">
                                ${this.formatUsdAmount(ercPnl.diff.diffUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(ercPnl.diff.diffRel)}" title="${ercPnl.diff.diffRel}">
                                ${this.formatPercentage(ercPnl.diff.diffRel)}
                            </div>
                        </div>
                `;
            }
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    renderV2PairsSection(v2Pnls) {
        // Filter out pairs where both startUsd and finalUsd are 0, then sort by token pair symbols
        const sortedPairsPnls = v2Pnls.pairsPnls ? [...v2Pnls.pairsPnls]
            .filter(pairPnl => {
                if (!pairPnl.diff) return false;
                const startUsd = parseFloat(pairPnl.diff.startUsd || '0');
                const finalUsd = parseFloat(pairPnl.diff.finalUsd || '0');
                return !(startUsd === 0 && finalUsd === 0);
            })
            .sort((a, b) => {
                const symbolA = `${a.pair?.token0?.symbol || 'TOKEN0'}/${a.pair?.token1?.symbol || 'TOKEN1'}`;
                const symbolB = `${b.pair?.token0?.symbol || 'TOKEN0'}/${b.pair?.token1?.symbol || 'TOKEN1'}`;
                return symbolA.localeCompare(symbolB);
            }) : [];

        let html = `
            <div class="pnl-section">
                <h3 class="pnl-section-title">V2 Pairs</h3>
                <div class="pnl-section-content">
                    <div class="pnl-diff-table">
                        <div class="pnl-diff-header">
                            <div class="pnl-diff-cell pnl-diff-header-cell"></div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">start</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">final</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff%</div>
                        </div>
        `;

        // First show the overall V2 diff if present
        if (v2Pnls.diff) {
            html += `
                        <div class="pnl-diff-row">
                            <div class="pnl-diff-cell pnl-diff-name-cell">Diff:</div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(v2Pnls.diff.startUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(v2Pnls.diff.finalUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(v2Pnls.diff.diffUsd)}">
                                ${this.formatUsdAmount(v2Pnls.diff.diffUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(v2Pnls.diff.diffRel)}" title="${v2Pnls.diff.diffRel}">
                                ${this.formatPercentage(v2Pnls.diff.diffRel)}
                            </div>
                        </div>
            `;
        }

        // Then show each pair's diff
        sortedPairsPnls.forEach((pairPnl, index) => {
            if (pairPnl.pair && pairPnl.diff) {
                const isFirstPair = index === 0;
                const token0Symbol = pairPnl.pair.token0?.symbol || 'TOKEN0';
                const token1Symbol = pairPnl.pair.token1?.symbol || 'TOKEN1';
                const pairLabel = `${token0Symbol}/${token1Symbol}`;
                
                html += `
                        <div class="pnl-diff-row ${isFirstPair ? 'pnl-token-separator-row' : ''}">
                            <div class="pnl-diff-cell pnl-diff-name-cell">${pairLabel}:</div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(pairPnl.diff.startUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(pairPnl.diff.finalUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(pairPnl.diff.diffUsd)}">
                                ${this.formatUsdAmount(pairPnl.diff.diffUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(pairPnl.diff.diffRel)}" title="${pairPnl.diff.diffRel}">
                                ${this.formatPercentage(pairPnl.diff.diffRel)}
                            </div>
                        </div>
                `;
            }
        });

        html += `
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    renderV3PoolsSection(v3Pnls) {
        let html = `
            <div class="pnl-section">
                <h3 class="pnl-section-title">V3 Pools</h3>
                <div class="pnl-section-content">
                    <div class="pnl-diff-table">
                        <div class="pnl-diff-header">
                            <div class="pnl-diff-cell pnl-diff-header-cell"></div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">start</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">final</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff%</div>
                        </div>
        `;

        // First show the overall V3 diff
        if (v3Pnls.diff) {
            html += `
                        <div class="pnl-diff-row">
                            <div class="pnl-diff-cell pnl-diff-name-cell">Diff:</div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(v3Pnls.diff.startUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(v3Pnls.diff.finalUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(v3Pnls.diff.diffUsd)}">
                                ${this.formatUsdAmount(v3Pnls.diff.diffUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(v3Pnls.diff.diffRel)}" title="${v3Pnls.diff.diffRel}">
                                ${this.formatPercentage(v3Pnls.diff.diffRel)}
                            </div>
                        </div>
            `;
        }

        html += `
                    </div>
                </div>
        `;

        // NFT Positions Table
        if (v3Pnls.nftPnls && v3Pnls.nftPnls.length > 0) {
            html += this.renderV3NFTsTable(v3Pnls.nftPnls);
        }

        // Pools Table  
        if (v3Pnls.poolsPnls && v3Pnls.poolsPnls.length > 0) {
            html += this.renderV3PoolsTable(v3Pnls.poolsPnls);
        }

        html += `
            </div>
        `;

        return html;
    }

    renderV3NFTsTable(nftPnls) {
        let html = `
                <div class="pnl-section-content">
                    <div class="pnl-diff-table">
                        <div class="pnl-diff-header">
                            <div class="pnl-diff-cell pnl-diff-header-cell"></div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">start</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">final</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff%</div>
                        </div>
        `;

        // Sort NFTs by tokenId (numerically if possible)
        const sortedNftPnls = [...nftPnls].sort((a, b) => {
            const tokenIdA = parseInt(a.tokenId, 10);
            const tokenIdB = parseInt(b.tokenId, 10);
            if (!isNaN(tokenIdA) && !isNaN(tokenIdB)) {
                return tokenIdA - tokenIdB;
            }
            return a.tokenId.localeCompare(b.tokenId);
        });

        sortedNftPnls.forEach((nftPnl, index) => {
            if (nftPnl.diff) {
                const isFirstNFT = index === 0;
                const resolvedPoolName = this.resolveV3PoolForPnL(nftPnl.pool);
                
                html += `
                        <div class="pnl-diff-row ${isFirstNFT ? 'pnl-token-separator-row' : ''}">
                            <div class="pnl-diff-cell pnl-diff-name-cell">${resolvedPoolName} tokenID: ${nftPnl.tokenId}</div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(nftPnl.diff.startUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(nftPnl.diff.finalUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(nftPnl.diff.diffUsd)}">
                                ${this.formatUsdAmount(nftPnl.diff.diffUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(nftPnl.diff.diffRel)}" title="${nftPnl.diff.diffRel}">
                                ${this.formatPercentage(nftPnl.diff.diffRel)}
                            </div>
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

    renderV3PoolsTable(poolsPnls) {
        // Sort pools by token symbols
        const sortedPoolsPnls = [...poolsPnls].sort((a, b) => {
            const symbolA = `${a.pool?.token0?.symbol || 'TOKEN0'}/${a.pool?.token1?.symbol || 'TOKEN1'}`;
            const symbolB = `${b.pool?.token0?.symbol || 'TOKEN0'}/${b.pool?.token1?.symbol || 'TOKEN1'}`;
            return symbolA.localeCompare(symbolB);
        });

        let html = `
                <div class="pnl-section-content">
                    <div class="pnl-diff-table">
                        <div class="pnl-diff-header">
                            <div class="pnl-diff-cell pnl-diff-header-cell"></div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">start</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">final</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff</div>
                            <div class="pnl-diff-cell pnl-diff-header-cell">diff%</div>
                        </div>
        `;

        sortedPoolsPnls.forEach((poolPnl, index) => {
            if (poolPnl.pool && poolPnl.diff) {
                const isFirstPool = index === 0;
                const resolvedPoolName = this.resolveV3PoolForPnL(poolPnl.pool);
                
                html += `
                        <div class="pnl-diff-row ${isFirstPool ? 'pnl-token-separator-row' : ''}">
                            <div class="pnl-diff-cell pnl-diff-name-cell">${resolvedPoolName}:</div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(poolPnl.diff.startUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell">
                                ${this.formatUsdAmount(poolPnl.diff.finalUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(poolPnl.diff.diffUsd)}">
                                ${this.formatUsdAmount(poolPnl.diff.diffUsd)}
                            </div>
                            <div class="pnl-diff-cell pnl-diff-data-cell ${this.getValueClass(poolPnl.diff.diffRel)}" title="${poolPnl.diff.diffRel}">
                                ${this.formatPercentage(poolPnl.diff.diffRel)}
                            </div>
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

    resolveV3Pool(pool) {
        if (this.addressResolver && pool) {
            // Use the existing address resolution logic but extract just the text
            const resolvedHtml = this.addressResolver.resolveAddress(pool.addr);
            // Extract the text content from the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = resolvedHtml;
            return tempDiv.textContent || tempDiv.innerText || `${pool.token0?.symbol || 'TOKEN0'}/${pool.token1?.symbol || 'TOKEN1'}`;
        } else if (pool) {
            const feePercent = (pool.fee / 10000).toFixed(1);
            return `${pool.token0?.symbol || 'TOKEN0'}/${pool.token1?.symbol || 'TOKEN1'}-${feePercent}%`;
        }
        return 'Unknown Pool';
    }

    resolveV3PoolForPnL(pool) {
        // For PnL labels, we don't need the address part - just token symbols and fee
        if (pool) {
            const feePercent = (pool.fee / 10000).toFixed(1);
            return `${pool.token0?.symbol || 'TOKEN0'}/${pool.token1?.symbol || 'TOKEN1'}-${feePercent}%`;
        }
        return 'Unknown Pool';
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