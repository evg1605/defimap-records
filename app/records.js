// Address resolver for formatting addresses according to specifications
class AddressResolver {
    constructor() {
        this.accounts = [];
        this.v2pairs = [];
        this.v3pools = [];
        this.tokens = new Map(); // Map of token address to token info
    }
    
    setData(accounts, v2pairs, v3pools) {
        this.accounts = accounts || [];
        this.v2pairs = v2pairs || [];
        this.v3pools = v3pools || [];
        
        // Build tokens map from pairs and pools
        this.tokens.clear();
        
        // Add tokens from V2 pairs
        v2pairs.forEach(pair => {
            if (pair.token0) {
                this.tokens.set(pair.token0.addr.toLowerCase(), pair.token0);
            }
            if (pair.token1) {
                this.tokens.set(pair.token1.addr.toLowerCase(), pair.token1);
            }
        });
        
        // Add tokens from V3 pools
        v3pools.forEach(pool => {
            if (pool.token0) {
                this.tokens.set(pool.token0.addr.toLowerCase(), pool.token0);
            }
            if (pool.token1) {
                this.tokens.set(pool.token1.addr.toLowerCase(), pool.token1);
            }
        });
    }
    
    addTokenFromRecord(tokenAddr, tokenInfo) {
        if (tokenAddr && tokenInfo) {
            this.tokens.set(tokenAddr.toLowerCase(), tokenInfo);
        }
    }
    
    resolveKnownAddress(address) {
        const addrLower = address.toLowerCase();
        const shortAddr = address.substring(0, 12); // 0x + first 10 chars
        
        // Check if it's V3 NFT Manager
        if (addrLower === '0xc36442b4a4522e871399cd717abdd847ab11fe88') {
            return `<a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener noreferrer" class="address-link v3nft" title="${address}">v3NFTMng-${shortAddr}</a>`;
        }
        
        // Check if it's V4 Router
        if (addrLower === '0x66a9893cc07d91d95644aedd05d03f95e1dba8af') {
            return `<a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener noreferrer" class="address-link v4router" title="${address}">v4Router-0x66a9893c</a>`;
        }
        
        // Check if it's V2 Router
        if (addrLower === '0x7a250d5630b4cf539739df2c5dacb4c659f2488d') {
            return `<a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener noreferrer" class="address-link v2router" title="${address}">v2Router-0x7a250d56</a>`;
        }
        
        // Check if it's WETH contract
        if (addrLower === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
            return `<a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener noreferrer" class="address-link token" title="${address}">WETH-${shortAddr}</a>`;
        }
        
        return null; // Not a known constant address
    }
    
    resolveAddress(address) {
        if (!address) return '';
        
        const addrLower = address.toLowerCase();
        
        // First check if it's a known constant address
        const knownAddr = this.resolveKnownAddress(address);
        if (knownAddr) return knownAddr;
        
        // Check if it's a user account (from combobox accounts)
        // Use same sorting as in combobox
        const sortedAccounts = [...this.accounts].sort();
        const accountIndex = sortedAccounts.findIndex(acc => acc.toLowerCase() === addrLower);
        if (accountIndex !== -1) {
            const shortAddr = address.substring(0, 12); // 0x + first 10 chars
            return `<a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener noreferrer" class="address-link account" title="${address}">w(${accountIndex + 1})${shortAddr}</a>`;
        }
        
        // Check if it's an ERC20 token address
        const token = this.tokens.get(addrLower);
        if (token) {
            const shortAddr = address.substring(0, 12); // 0x + first 10 chars
            return `<a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener noreferrer" class="address-link token" title="${address}">${token.symbol}-${shortAddr}</a>`;
        }
        
        // Check if it's a V2 pair address
        const v2pair = this.v2pairs.find(pair => pair.addr.toLowerCase() === addrLower);
        if (v2pair) {
            const shortAddr = address.substring(0, 12); // 0x + first 10 chars
            const label = `${v2pair.token0.symbol}/${v2pair.token1.symbol}-${shortAddr}`;
            return `<a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener noreferrer" class="address-link v2pair" title="${address}">${label}</a>`;
        }
        
        // Check if it's a V3 pool address
        const v3pool = this.v3pools.find(pool => pool.addr.toLowerCase() === addrLower);
        if (v3pool) {
            const shortAddr = address.substring(0, 12); // 0x + first 10 chars
            const feePercent = (v3pool.fee / 10000).toFixed(1);
            const label = `${v3pool.token0.symbol}/${v3pool.token1.symbol}-${feePercent}%-${shortAddr}`;
            return `<a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener noreferrer" class="address-link v3pool" title="${address}">${label}</a>`;
        }
        
        // Default: show first 10 characters with 0x (light gray background, black text)
        const shortAddr = address.substring(0, 12); // 0x + first 10 chars
        return `<a href="https://etherscan.io/address/${address}" target="_blank" rel="noopener noreferrer" class="address-link unknown" title="${address}">${shortAddr}</a>`;
    }
}

// Records Panel Management
class RecordsManager {
    constructor() {
        this.recordsPanel = document.getElementById('records-panel');
        this.records = [];
        this.addressResolver = new AddressResolver();
    }
    
    setFilterData(accounts, v2pairs, v3pools) {
        this.addressResolver.setData(accounts, v2pairs, v3pools);
    }

    showLoading() {
        this.recordsPanel.className = 'records-panel loading';
        this.recordsPanel.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <span>Loading records...</span>
            </div>
        `;
    }

    showError(message) {
        this.recordsPanel.className = 'records-panel error';
        this.recordsPanel.innerHTML = `
            <div class="error">
                <span class="error-message">${message}</span>
            </div>
        `;
    }

    displayRecords(data) {
        if (!data || !data.profileRecords) {
            this.showNoRecords();
            return;
        }

        const records = data.profileRecords.records || [];
        
        if (records.length === 0) {
            this.showNoRecords();
            return;
        }
        
        // Add tokens from records to the resolver
        records.forEach(record => {
            if (record.__typename === 'AccErcBalanceRecord' && record.token) {
                this.addressResolver.addTokenFromRecord(record.tokenAddr, record.token);
            }
        });

        // Group records by transaction hash
        const groupedRecords = this.groupRecordsByTransaction(records);
        
        // Build HTML
        this.recordsPanel.className = 'records-panel';
        
        let html = `
            <div class="records-header">
                Records
                <span class="records-count">(${records.length})</span>
            </div>
        `;

        for (const [txHash, txRecords] of Object.entries(groupedRecords)) {
            html += this.renderTransactionGroup(txHash, txRecords);
        }

        this.recordsPanel.innerHTML = html;
    }

    groupRecordsByTransaction(records) {
        const grouped = {};
        
        for (const record of records) {
            const txHash = record.txHash;
            if (!grouped[txHash]) {
                grouped[txHash] = [];
            }
            grouped[txHash].push(record);
        }
        
        return grouped;
    }

    renderTransactionGroup(txHash, records) {
        // Get block, date and index from first record
        const firstRecord = records[0];
        let blockNumber, blockIndex, blockDate;
        
        if (firstRecord.__typename === 'LiqV2BalanceRecord') {
            blockNumber = firstRecord.balanceBlock;
            blockIndex = firstRecord.balanceIndInBlock;
            blockDate = firstRecord.balanceBlockDate?.date || '';
        } else {
            blockNumber = firstRecord.block;
            blockIndex = firstRecord.indInBlock;
            blockDate = firstRecord.blockDate?.date || '';
        }
        
        // Format date to YYYY-MM-DD format if it exists
        let formattedDate = '';
        if (blockDate) {
            // Extract just the date part if it includes time
            formattedDate = blockDate.split('T')[0];
        }
        
        let html = `
            <div class="transaction-group">
                <div class="transaction-header">
                    <a href="https://etherscan.io/tx/${txHash}" target="_blank" rel="noopener noreferrer" class="tx-hash">
                        ${txHash}
                    </a>
                    <span class="block-date">(${formattedDate})</span>
                    <a href="https://etherscan.io/block/${blockNumber}" target="_blank" rel="noopener noreferrer" class="block-number">
                        #${blockNumber}
                    </a>
                    <span class="block-index">#${blockIndex || 0}</span>
                </div>
                <div class="transaction-records">
        `;

        for (const record of records) {
            html += this.renderRecordWidget(record);
        }

        html += `
                </div>
            </div>`;
        return html;
    }

    renderRecordWidget(record) {
        const type = record.__typename;
        
        switch(type) {
            case 'AccEthBalanceRecord':
                return this.renderAccEthBalanceRecord(record);
            case 'AccErcBalanceRecord':
                return this.renderAccErcBalanceRecord(record);
            case 'LiqV2BalanceRecord':
                return this.renderLiqV2BalanceRecord(record);
            case 'LiqV3BalanceRecord':
                return this.renderLiqV3BalanceRecord(record);
            default:
                return this.renderSimpleRecord(record, '', type || 'Unknown Record Type');
        }
    }
    
    renderSimpleRecord(record, typeClass, displayType) {
        return `
            <div class="record-widget">
                <div class="record-type ${typeClass}">
                    ${displayType}
                </div>
            </div>
        `;
    }
    
    renderAccEthBalanceRecord(record) {
        const reason = record.reason;
        const addr = record.addr;
        const contrAddr = record.contrAddr || '';
        const contractName = record.contractName || '';
        const method = record.method || '';
        const params = record.params || '';
        
        // Resolve addresses
        const resolvedAddr = this.addressResolver.resolveAddress(addr);
        const resolvedContrAddr = contrAddr ? this.addressResolver.resolveAddress(contrAddr) : '';
        
        // Create contract name display with optional link
        let contractNameHtml = '';
        if (contractName && contrAddr) {
            contractNameHtml = `<a href="https://etherscan.io/address/${contrAddr}" target="_blank" rel="noopener noreferrer" class="contract-name-link">${contractName}</a>`;
        } else {
            contractNameHtml = contractName;
        }
        
        // Determine operation sign and color based on reason
        let operationHtml = '';
        let colorClass = '';
        
        switch(reason) {
            case 'init':
                operationHtml = '<span class="operation-sign init">--</span>';
                colorClass = 'neutral';
                break;
            case 'received':
                if (contrAddr) {
                    operationHtml = `<span class="operation-arrow received">←</span>`;
                } else {
                    operationHtml = `<span class="operation-sign received">+</span>`;
                }
                colorClass = 'positive';
                break;
            case 'transferred':
                if (contrAddr) {
                    operationHtml = `<span class="operation-arrow transferred">→</span>`;
                } else {
                    operationHtml = `<span class="operation-sign transferred">-</span>`;
                }
                colorClass = 'negative';
                break;
            default:
                operationHtml = '<span class="operation-sign">?</span>';
                colorClass = 'neutral';
        }
        
        // Format amounts
        const deltaAmount = this.formatAmount(record.deltaAmount);
        const feeAmount = this.formatAmount(record.feeAmount);
        const totalAmount = this.formatAmount(record.totalAmount);
        
        // Format rate
        const rate = record.rate ? parseFloat(record.rate.rate).toFixed(2) : '0.00';
        
        // Create unique ID for this record for params popup
        const recordId = `record-${record.txHash}-${record.indInBlock || 0}`;
        
        return `
            <div class="record-widget eth-record">
                <div class="record-header">
                    <span class="record-type eth">ETH</span>
                    <span class="reason ${reason}">${reason}</span>
                    <span class="contract-name">cn: ${contractNameHtml}</span>
                    <span class="method">method: ${method}</span>
                    <span class="params-info">params: ${params ? params.length : 0}</span>
                    <button class="params-button" onclick="toggleParamsPopup('${recordId}')" title="Show params">...</button>
                </div>
                <div class="record-main">
                    <div class="address-line">
                        ${resolvedAddr}
                        ${operationHtml}
                        ${resolvedContrAddr ? resolvedContrAddr : ''}
                    </div>
                    <div class="amounts-line ${colorClass}">
                        <span class="amount-group">
                            <span class="amount-label">delta:</span>
                            <span class="amount">${deltaAmount.amount}</span>
                            <span class="amount-usd">(${deltaAmount.amountInUsd} USD)</span>
                        </span>
                        <span class="amount-group">
                            <span class="amount-label">fee:</span>
                            <span class="amount">${feeAmount.amount}</span>
                            <span class="amount-usd">(${feeAmount.amountInUsd} USD)</span>
                        </span>
                        <span class="amount-group">
                            <span class="amount-label">total:</span>
                            <span class="amount">${totalAmount.amount}</span>
                            <span class="amount-usd">(${totalAmount.amountInUsd} USD)</span>
                        </span>
                    </div>
                    <div class="rate-line">
                        <span class="rate">${rate} ETH/USD</span>
                    </div>
                </div>
                <div class="record-footer">
                    <div class="metadata">
                        <span>internal: ${record.isInternalTx}</span>
                        <span>adv ind: ${record.advInd !== undefined && record.advInd !== null ? record.advInd : 0}</span>
                        <span>trace id: ${record.traceId || ''}</span>
                    </div>
                </div>
                <div id="params-popup-${recordId}" class="params-popup" style="display: none;">
                    <div class="params-popup-content">
                        <div class="params-popup-header">
                            <span>Parameters</span>
                            <button class="params-popup-close" onclick="toggleParamsPopup('${recordId}')">&times;</button>
                        </div>
                        <div class="params-popup-body">
                            <pre class="params-json">${this.formatParamsForDisplay(params)}</pre>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAccErcBalanceRecord(record) {
        const reason = record.reason;
        const addr = record.addr;
        let contrAddr = record.contrAddr || '';
        const token = record.token || {};
        const tokenSymbol = token.symbol || 'TOKEN';
        const tokenAddr = record.tokenAddr || '';
        
        // For deposited and withdrawn, use WETH contract address
        if (reason === 'deposited' || reason === 'withdrawn') {
            contrAddr = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
        }
        
        // Resolve addresses
        const resolvedAddr = this.addressResolver.resolveAddress(addr);
        const resolvedContrAddr = contrAddr ? this.addressResolver.resolveAddress(contrAddr) : '';
        
        // Token address display (first 8 chars after 0x) with link
        const tokenShortAddr = tokenAddr ? tokenAddr.substring(0, 10) : '';
        const tokenAddrLink = tokenAddr ? 
            `<a href="https://etherscan.io/address/${tokenAddr}" target="_blank" rel="noopener noreferrer" class="token-addr-link">${tokenShortAddr}</a>` : 
            '';
        
        // Determine operation sign and color based on reason
        let operationHtml = '';
        let colorClass = '';
        
        switch(reason) {
            case 'init':
                operationHtml = '<span class="operation-sign init">--</span>';
                colorClass = 'neutral';
                break;
            case 'received':
                if (contrAddr) {
                    operationHtml = `<span class="operation-arrow received">←</span>`;
                } else {
                    operationHtml = `<span class="operation-sign received">+</span>`;
                }
                colorClass = 'positive';
                break;
            case 'transferred':
                if (contrAddr) {
                    operationHtml = `<span class="operation-arrow transferred">→</span>`;
                } else {
                    operationHtml = `<span class="operation-sign transferred">-</span>`;
                }
                colorClass = 'negative';
                break;
            case 'deposited':
                if (contrAddr) {
                    operationHtml = `<span class="operation-arrow deposited">←</span>`;
                } else {
                    operationHtml = `<span class="operation-sign deposited">+</span>`;
                }
                colorClass = 'positive';
                break;
            case 'withdrawn':
                if (contrAddr) {
                    operationHtml = `<span class="operation-arrow withdrawn">→</span>`;
                } else {
                    operationHtml = `<span class="operation-sign withdrawn">-</span>`;
                }
                colorClass = 'negative';
                break;
            default:
                operationHtml = '<span class="operation-sign">?</span>';
                colorClass = 'neutral';
        }
        
        // Format amounts
        const deltaAmount = this.formatTokenAmount(record.tokenDeltaAmount);
        const totalAmount = this.formatTokenAmount(record.tokenAmount);
        
        // Format rate
        const rate = record.tokenUsdRate ? parseFloat(record.tokenUsdRate.rate.rate).toFixed(4) : '0.0000';
        
        return `
            <div class="record-widget erc-record">
                <div class="record-header">
                    <span class="record-type erc20">${tokenSymbol}</span>
                    ${tokenAddrLink}
                    <span class="reason ${reason}">${reason}</span>
                </div>
                <div class="record-main">
                    <div class="address-line">
                        ${resolvedAddr}
                        ${operationHtml}
                        ${resolvedContrAddr ? resolvedContrAddr : ''}
                    </div>
                    <div class="amounts-line ${colorClass}">
                        <span class="amount-group">
                            <span class="amount-label">delta:</span>
                            <span class="amount">${deltaAmount.amount}</span>
                            <span class="amount-usd">(${deltaAmount.amountInUsd} USD)</span>
                        </span>
                        <span class="amount-group">
                            <span class="amount-label">total:</span>
                            <span class="amount">${totalAmount.amount}</span>
                            <span class="amount-usd">(${totalAmount.amountInUsd} USD)</span>
                        </span>
                    </div>
                    <div class="rate-line">
                        <span class="rate">${rate} ${tokenSymbol}/USD</span>
                    </div>
                </div>
                <div class="record-footer">
                    <div class="metadata">
                        <span>adv ind: ${record.advInd !== undefined && record.advInd !== null ? record.advInd : 0}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderLiqV3BalanceRecord(record) {
        const pool = record.pool || {};
        const token0 = pool.token0 || {};
        const token1 = pool.token1 || {};
        const token0Symbol = token0.symbol || 'TOKEN0';
        const token1Symbol = token1.symbol || 'TOKEN1';
        const fee = pool.fee ? (pool.fee / 10000).toFixed(2) : '0.00';
        const poolAddr = record.poolAddr || pool.addr || '';
        const poolShortAddr = poolAddr.substring(0, 10); // 0x + first 8 chars
        const reason = record.reason || '';
        const addr = record.addr || '';
        const contrAddr = record.contrAddr || '';
        
        // Resolve addresses
        const resolvedAddr = this.addressResolver.resolveAddress(addr);
        const resolvedContrAddr = contrAddr ? this.addressResolver.resolveAddress(contrAddr) : '';
        
        // Determine operation arrow and color based on reason
        let operationHtml = '';
        let colorClass = '';
        
        switch(reason) {
            case 'mint':
            case 'received':
            case 'increase':
                operationHtml = contrAddr ? `<span class="operation-arrow received">←</span>` : '';
                colorClass = 'positive';
                break;
            case 'transferred':
            case 'burned':
            case 'decrease':
                operationHtml = contrAddr ? `<span class="operation-arrow transferred">→</span>` : '';
                colorClass = 'negative';
                break;
            case 'collect':
                operationHtml = contrAddr ? `<span class="operation-arrow transferred">→</span>` : '';
                colorClass = 'positive';
                break;
            default:
                operationHtml = '';
                colorClass = 'neutral';
        }
        
        // Format delta amounts
        const ltDelta = record.ltDelta || '0';
        const token0Delta = this.formatTokenAmount(record.token0Delta);
        const token1Delta = this.formatTokenAmount(record.token1Delta);
        const tokensOwed0Delta = this.formatTokenAmount(record.tokensOwed0Delta);
        const tokensOwed1Delta = this.formatTokenAmount(record.tokensOwed1Delta);
        
        // Calculate total USD delta for lt
        const token0DeltaUsd = record.token0Delta && record.token0Delta.amount ? 
            parseFloat(record.token0Delta.amount.amountInUsd || '0') : 0;
        const token1DeltaUsd = record.token1Delta && record.token1Delta.amount ? 
            parseFloat(record.token1Delta.amount.amountInUsd || '0') : 0;
        const totalDeltaUsd = (token0DeltaUsd + token1DeltaUsd).toFixed(2);
        
        // Calculate total USD for owed deltas
        const tokensOwed0DeltaUsd = record.tokensOwed0Delta && record.tokensOwed0Delta.amount ?
            parseFloat(record.tokensOwed0Delta.amount.amountInUsd || '0') : 0;
        const tokensOwed1DeltaUsd = record.tokensOwed1Delta && record.tokensOwed1Delta.amount ?
            parseFloat(record.tokensOwed1Delta.amount.amountInUsd || '0') : 0;
        const totalOwedDeltaUsd = (tokensOwed0DeltaUsd + tokensOwed1DeltaUsd).toFixed(2);
        
        // Build main HTML
        let html = `
            <div class="record-widget v3-record">
                <div class="record-header">
                    <span class="version-badge v3-badge">v3</span>
                    <span class="record-type v3">${token0Symbol}/${token1Symbol}</span>
                    <span class="fee-badge">${fee}%</span>
                    <a href="https://etherscan.io/address/${poolAddr}" target="_blank" rel="noopener noreferrer" class="pool-addr-link">${poolShortAddr}</a>
                    <span class="reason ${reason}">${reason}</span>
                </div>
                <div class="record-main">
                    <div class="address-line">
                        ${resolvedAddr}
                        ${operationHtml}
                        ${resolvedContrAddr ? resolvedContrAddr : ''}
                    </div>
                    <div class="deltas-section">
                        <div class="amounts-line ${colorClass}">
                            <table class="deltas-table">
                                <tr>
                                    <td class="delta-label">delta</td>
                                    <td class="token-column">
                                        <a href="https://etherscan.io/address/${token0.addr}" target="_blank" rel="noopener noreferrer" class="token-link">${token0Symbol}</a>: 
                                        <span class="amount">${token0Delta.amount}</span> 
                                        <span class="amount-usd">(${token0Delta.amountInUsd} USD)</span>
                                    </td>
                                    <td class="token-column">
                                        <a href="https://etherscan.io/address/${token1.addr}" target="_blank" rel="noopener noreferrer" class="token-link">${token1Symbol}</a>: 
                                        <span class="amount">${token1Delta.amount}</span> 
                                        <span class="amount-usd">(${token1Delta.amountInUsd} USD)</span>
                                    </td>
                                    <td class="total-column">
                                        = <span class="amount">${ltDelta}</span> <span class="amount-usd">(${totalDeltaUsd} USD)</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="delta-label">ow delta</td>
                                    <td class="token-column">
                                        <a href="https://etherscan.io/address/${token0.addr}" target="_blank" rel="noopener noreferrer" class="token-link">${token0Symbol}</a>: 
                                        <span class="amount">${tokensOwed0Delta.amount}</span> 
                                        <span class="amount-usd">(${tokensOwed0Delta.amountInUsd} USD)</span>
                                    </td>
                                    <td class="token-column">
                                        <a href="https://etherscan.io/address/${token1.addr}" target="_blank" rel="noopener noreferrer" class="token-link">${token1Symbol}</a>: 
                                        <span class="amount">${tokensOwed1Delta.amount}</span> 
                                        <span class="amount-usd">(${tokensOwed1Delta.amountInUsd} USD)</span>
                                    </td>
                                    <td class="total-column">
                                        = <span class="amount-usd">${totalOwedDeltaUsd} USD</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
        `;
        
        // Add rates from the record (not from NFT)
        const token0Rate = record.token0UsdRate && record.token0UsdRate.rate ? 
            parseFloat(record.token0UsdRate.rate.rate).toFixed(4) : '0.0000';
        const token1Rate = record.token1UsdRate && record.token1UsdRate.rate ? 
            parseFloat(record.token1UsdRate.rate.rate).toFixed(4) : '0.0000';
        
        html += `
                    <div class="rates-line">
                        <span class="rate">${token0Symbol}/USD: ${token0Rate}</span>
                        <span class="rate">${token1Symbol}/USD: ${token1Rate}</span>
                    </div>
        `;
        
        // Add NFT state if present
        if (record.nft) {
            html += this.renderV3NFTState(record.nft, token0Symbol, token1Symbol, colorClass);
        }
        
        // Add footer with metadata
        html += `
                </div>
                <div class="record-footer">
                    <div class="metadata">
                        <span>adv ind: ${record.advInd !== undefined && record.advInd !== null ? record.advInd : 0}</span>
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }
    
    renderLiqV2BalanceRecord(record) {
        const pair = record.pair || {};
        const token0 = pair.token0 || {};
        const token1 = pair.token1 || {};
        const token0Symbol = token0.symbol || 'TOKEN0';
        const token1Symbol = token1.symbol || 'TOKEN1';
        const pairAddr = record.pairAddr || pair.addr || '';
        const pairShortAddr = pairAddr.substring(0, 10); // 0x + first 8 chars
        const reason = record.reason || '';
        const addr = record.addr || '';
        const contrAddr = record.contrAddr || '';
        
        // Resolve addresses
        const resolvedAddr = this.addressResolver.resolveAddress(addr);
        const resolvedContrAddr = contrAddr ? this.addressResolver.resolveAddress(contrAddr) : '';
        
        // Determine operation arrow and color based on reason and isIncrease
        let operationHtml = '';
        let colorClass = '';
        
        switch(reason) {
            case 'mint':
                operationHtml = contrAddr ? `<span class="operation-arrow received">←</span>` : '';
                colorClass = 'positive';
                break;
            case 'burned':
                operationHtml = contrAddr ? `<span class="operation-arrow transferred">→</span>` : '';
                colorClass = 'negative';
                break;
            case 'transferred':
                if (record.isIncrease) {
                    operationHtml = contrAddr ? `<span class="operation-arrow received">←</span>` : '';
                    colorClass = 'positive';
                } else {
                    operationHtml = contrAddr ? `<span class="operation-arrow transferred">→</span>` : '';
                    colorClass = 'negative';
                }
                break;
            default:
                operationHtml = '';
                colorClass = 'neutral';
        }
        
        // Format token deltas and amounts
        const token0Delta = this.formatTokenAmount(record.token0Delta);
        const token1Delta = this.formatTokenAmount(record.token1Delta);
        const token0Amount = this.formatTokenAmount(record.token0Amount);
        const token1Amount = this.formatTokenAmount(record.token1Amount);
        const ltDelta = record.ltDelta || '0';
        
        // Calculate total USD values
        const token0DeltaUsd = record.token0Delta && record.token0Delta.amount ?
            parseFloat(record.token0Delta.amount.amountInUsd || '0') : 0;
        const token1DeltaUsd = record.token1Delta && record.token1Delta.amount ?
            parseFloat(record.token1Delta.amount.amountInUsd || '0') : 0;
        const totalDeltaUsd = (token0DeltaUsd + token1DeltaUsd).toFixed(2);
        
        const token0AmountUsd = record.token0Amount && record.token0Amount.amount ?
            parseFloat(record.token0Amount.amount.amountInUsd || '0') : 0;
        const token1AmountUsd = record.token1Amount && record.token1Amount.amount ?
            parseFloat(record.token1Amount.amount.amountInUsd || '0') : 0;
        const totalAmountUsd = (token0AmountUsd + token1AmountUsd).toFixed(2);
        
        // Format rates
        const token0Rate = record.token0UsdRate && record.token0UsdRate.rate ? 
            parseFloat(record.token0UsdRate.rate.rate).toFixed(4) : '0.0000';
        const token1Rate = record.token1UsdRate && record.token1UsdRate.rate ? 
            parseFloat(record.token1UsdRate.rate.rate).toFixed(4) : '0.0000';
        
        // Get metadata
        const reserve0 = record.reserve0 || '0';
        const reserve1 = record.reserve1 || '0';
        const totalSupply = record.totalSupply || '0';
        const advInd = record.advInd !== undefined && record.advInd !== null ? record.advInd : 0;
        
        return `
            <div class="record-widget v2-record">
                <div class="record-header">
                    <span class="version-badge v2-badge">v2</span>
                    <span class="record-type v2">${token0Symbol}/${token1Symbol}</span>
                    <a href="https://etherscan.io/address/${pairAddr}" target="_blank" rel="noopener noreferrer" class="pair-addr-link">${pairShortAddr}</a>
                    <span class="reason ${reason}">${reason}</span>
                </div>
                <div class="record-main">
                    <div class="address-line">
                        ${resolvedAddr}
                        ${operationHtml}
                        ${resolvedContrAddr ? resolvedContrAddr : ''}
                    </div>
                    <div class="deltas-section">
                        <div class="amounts-line ${colorClass}">
                            <table class="deltas-table">
                                <tr>
                                    <td class="delta-label">delta</td>
                                    <td class="token-column">
                                        <a href="https://etherscan.io/address/${token0.addr}" target="_blank" rel="noopener noreferrer" class="token-link">${token0Symbol}</a>: 
                                        <span class="amount">${token0Delta.amount}</span> 
                                        <span class="amount-usd">(${token0Delta.amountInUsd} USD)</span>
                                    </td>
                                    <td class="token-column">
                                        <a href="https://etherscan.io/address/${token1.addr}" target="_blank" rel="noopener noreferrer" class="token-link">${token1Symbol}</a>: 
                                        <span class="amount">${token1Delta.amount}</span> 
                                        <span class="amount-usd">(${token1Delta.amountInUsd} USD)</span>
                                    </td>
                                    <td class="total-column">
                                        = <span class="amount">${ltDelta}</span> <span class="amount-usd">(${totalDeltaUsd} USD)</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="delta-label">total</td>
                                    <td class="token-column">
                                        <a href="https://etherscan.io/address/${token0.addr}" target="_blank" rel="noopener noreferrer" class="token-link">${token0Symbol}</a>: 
                                        <span class="amount">${token0Amount.amount}</span> 
                                        <span class="amount-usd">(${token0Amount.amountInUsd} USD)</span>
                                    </td>
                                    <td class="token-column">
                                        <a href="https://etherscan.io/address/${token1.addr}" target="_blank" rel="noopener noreferrer" class="token-link">${token1Symbol}</a>: 
                                        <span class="amount">${token1Amount.amount}</span> 
                                        <span class="amount-usd">(${token1Amount.amountInUsd} USD)</span>
                                    </td>
                                    <td class="total-column">
                                        = <span class="amount-usd">(${totalAmountUsd} USD)</span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="rates-line">
                        <span class="rate">${token0Symbol}/USD: ${token0Rate}</span>
                        <span class="rate">${token1Symbol}/USD: ${token1Rate}</span>
                    </div>
                </div>
                <div class="record-footer">
                    <div class="metadata">
                        <span>reserve0: ${reserve0}</span>
                        <span>reserve1: ${reserve1}</span>
                        <span>total supply: ${totalSupply}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderV3NFTState(nft, token0Symbol, token1Symbol, defaultColorClass) {
        if (!nft) return '';
        
        const nftType = nft.__typename;
        const tokenId = nft.tokenId || '';
        const hSyncPointDate = nft.hSyncPointDate || {};
        const dateTime = hSyncPointDate.date || '';
        const hPointBlock = nft.hPointBlock || '';
        
        let html = `<div class="nft-state-section">`;
        
        html += `
            <div class="nft-header">
                <span class="nft-title">NFT state</span>
                ${tokenId ? `<a href="https://opensea.io/item/ethereum/0xC36442b4a4522E871399CD717aBDD847Ab11FE88/${tokenId}" target="_blank" rel="noopener noreferrer" class="token-id-link">token id: ${tokenId}</a>` : ''}
                ${dateTime ? `<span class="nft-date">${dateTime}</span>` : ''}
                <a href="https://etherscan.io/block/${hPointBlock}" target="_blank" rel="noopener noreferrer" class="block-link">
                    #${hPointBlock}
                </a>
            </div>
        `;
        
        if (nftType === 'LiqV3NFTBurnedState') {
            html += `<div class="nft-burned">burned</div>`;
        } else if (nftType === 'LiqV3NFTState') {
            // Format NFT amounts
            const ltTotal = nft.ltTotal || '0';
            const totalAmountInUsd = nft.totalAmountInUsd ? parseFloat(nft.totalAmountInUsd).toFixed(2) : '0.00';
            const token0Total = this.formatTokenAmount(nft.token0Total);
            const token1Total = this.formatTokenAmount(nft.token1Total);
            const tokensOwed0Total = this.formatTokenAmount(nft.tokensOwed0Total);
            const tokensOwed1Total = this.formatTokenAmount(nft.tokensOwed1Total);
            const feeGrowth0 = nft.feeGrowthInside0LastX128 || '0';
            const feeGrowth1 = nft.feeGrowthInside1LastX128 || '0';
            
            html += `
                <div class="nft-totals">
                    <div class="total-line">
                        <span class="total-label">lt total:</span>
                        <span class="total-value">${ltTotal}</span>
                        <span class="total-usd">(${totalAmountInUsd} USD)</span>
                    </div>
                    <div class="token-columns">
                        <div class="token-column">
                            <div class="token-header">${token0Symbol}</div>
                            <div class="token-stat">
                                <span class="stat-label">total:</span>
                                <span class="stat-value">${token0Total.amount}</span>
                                <span class="stat-usd">(${token0Total.amountInUsd} USD)</span>
                            </div>
                            <div class="token-stat">
                                <span class="stat-label">ow:</span>
                                <span class="stat-value">${tokensOwed0Total.amount}</span>
                                <span class="stat-usd">(${tokensOwed0Total.amountInUsd} USD)</span>
                            </div>
                            <div class="token-stat">
                                <span class="stat-label">fee-grow:</span>
                                <span class="stat-value">${feeGrowth0}</span>
                            </div>
                        </div>
                        <div class="token-column">
                            <div class="token-header">${token1Symbol}</div>
                            <div class="token-stat">
                                <span class="stat-label">total:</span>
                                <span class="stat-value">${token1Total.amount}</span>
                                <span class="stat-usd">(${token1Total.amountInUsd} USD)</span>
                            </div>
                            <div class="token-stat">
                                <span class="stat-label">ow:</span>
                                <span class="stat-value">${tokensOwed1Total.amount}</span>
                                <span class="stat-usd">(${tokensOwed1Total.amountInUsd} USD)</span>
                            </div>
                            <div class="token-stat">
                                <span class="stat-label">fee-grow:</span>
                                <span class="stat-value">${feeGrowth1}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    }
    
    formatAmount(amountObj) {
        if (!amountObj) return { amount: '0', amountInUsd: '0.00' };
        
        const amount = parseFloat(amountObj.amount || '0');
        const amountInUsd = parseFloat(amountObj.amountInUsd || '0');
        
        // Format ETH amount to reasonable precision
        let formattedAmount;
        if (amount === 0) {
            formattedAmount = '0';
        } else if (Math.abs(amount) < 0.000001) {
            formattedAmount = amount.toExponential(3);
        } else {
            formattedAmount = amount.toFixed(6).replace(/\.?0+$/, '');
        }
        
        return {
            amount: formattedAmount,
            amountInUsd: amountInUsd.toFixed(2)
        };
    }
    
    formatTokenAmount(amountObj) {
        if (!amountObj || !amountObj.amount) return { amount: '0', amountInUsd: '0.00' };
        
        const amount = parseFloat(amountObj.amount.amount || '0');
        const amountInUsd = parseFloat(amountObj.amount.amountInUsd || '0');
        
        // Format token amount to reasonable precision
        let formattedAmount;
        if (amount === 0) {
            formattedAmount = '0';
        } else if (Math.abs(amount) < 0.000001) {
            formattedAmount = amount.toExponential(3);
        } else if (Math.abs(amount) < 1) {
            formattedAmount = amount.toFixed(6).replace(/\.?0+$/, '');
        } else if (Math.abs(amount) < 1000) {
            formattedAmount = amount.toFixed(4).replace(/\.?0+$/, '');
        } else {
            formattedAmount = amount.toFixed(2).replace(/\.?0+$/, '');
        }
        
        return {
            amount: formattedAmount,
            amountInUsd: amountInUsd.toFixed(2)
        };
    }
    
    formatParamsForDisplay(params) {
        if (!params) return '{}';
        
        try {
            // Try to parse as JSON and format nicely
            const parsed = JSON.parse(params);
            return JSON.stringify(parsed, null, 2);
        } catch (error) {
            // If it's not valid JSON, return as is
            return params;
        }
    }

    showNoRecords() {
        this.recordsPanel.className = 'records-panel';
        this.recordsPanel.innerHTML = `
            <div class="records-header">
                Records
                <span class="records-count">(0)</span>
            </div>
            <div class="no-records">
                No records found for the selected filters
            </div>
        `;
    }

    clear() {
        this.recordsPanel.className = 'records-panel';
        this.recordsPanel.innerHTML = '';
    }
}