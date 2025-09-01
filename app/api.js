// AI - don't change apiUrl value, it's used to switch between local and production server
//const apiUrl = 'https://defi-map.com/api/api/gql/query';
const apiUrl = 'http://localhost:8090/api/gql/query';

// Google Identity Services configuration
const googleConfig = {
    client_id: '821420392447-77ak5cfprj41f7v901ih84292h7dsng8.apps.googleusercontent.com'
};

// Global token variable
let authToken = null;

// JWT Helper function
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Invalid JWT token:', error);
        return null;
    }
}

// Google Identity Services authentication
function handleCredentialResponse(response) {
    if (response.credential) {
        authToken = response.credential;
        sessionStorage.setItem('googleAuthToken', authToken);
        
        const decoded = decodeJWT(authToken);
        if (decoded) {
            console.log('JWT authentication successful:', decoded.email);
            console.log('Token expires at:', new Date(decoded.exp * 1000));
        }
        
        // Trigger app initialization after successful auth
        if (window.onAuthSuccess) {
            window.onAuthSuccess();
        }
    } else {
        console.error('No credential received from Google');
    }
}

// Initialize Google Identity Services
function initGoogleAuth() {
    // Check if Google Identity Services is loaded
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: googleConfig.client_id,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: false
        });
    } else {
        console.error('Google Identity Services not loaded');
    }
}

// Prompt for authentication
async function promptForAuth() {
    return new Promise((resolve, reject) => {
        if (typeof google !== 'undefined' && google.accounts) {
            // Set up one-time callback
            window.onAuthSuccess = () => {
                window.onAuthSuccess = null;
                resolve(true);
            };
            
            // Show the One Tap prompt
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log('One Tap prompt not shown, showing sign-in popup');
                    // If One Tap fails, show popup
                    showSignInPopup().then(resolve).catch(reject);
                }
            });
        } else {
            reject(new Error('Google Identity Services not available'));
        }
    });
}

// Show sign-in popup as fallback
function showSignInPopup() {
    return new Promise((resolve, reject) => {
        if (typeof google !== 'undefined' && google.accounts) {
            window.onAuthSuccess = () => {
                window.onAuthSuccess = null;
                resolve(true);
            };
            
            google.accounts.id.renderButton(
                document.createElement('div'), 
                { 
                    type: 'standard',
                    shape: 'rectangular',
                    theme: 'outline',
                    text: 'signin_with',
                    size: 'large'
                }
            );
            
            // Create a temporary modal for sign-in
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                padding: 40px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;
            
            content.innerHTML = `
                <h3 style="margin-top: 0;">Sign in Required</h3>
                <p>Please sign in with your Google account to continue.</p>
                <div id="google-signin-button"></div>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="margin-top: 20px; padding: 8px 16px; border: 1px solid #ccc; background: #f5f5f5; border-radius: 4px; cursor: pointer;">
                    Cancel
                </button>
            `;
            
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            // Render the Google sign-in button
            google.accounts.id.renderButton(
                document.getElementById('google-signin-button'),
                { 
                    type: 'standard',
                    shape: 'rectangular', 
                    theme: 'outline',
                    text: 'signin_with',
                    size: 'large'
                }
            );
            
            // Clean up on success
            const originalOnAuthSuccess = window.onAuthSuccess;
            window.onAuthSuccess = () => {
                modal.remove();
                if (originalOnAuthSuccess) originalOnAuthSuccess();
            };
            
        } else {
            reject(new Error('Google Identity Services not available'));
        }
    });
}

async function checkAndHandleAuth() {
    // Check if we need authentication
    if (apiUrl.includes('localhost')) {
        console.log('Local environment detected, skipping authentication');
        return true;
    }

    // Check if we have token from session
    const storedToken = sessionStorage.getItem('googleAuthToken');
    if (storedToken && !authToken) {
        authToken = storedToken;
        const decoded = decodeJWT(authToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
            console.log('Authentication token restored from session');
            return true;
        } else {
            console.log('Stored token expired, clearing');
            sessionStorage.removeItem('googleAuthToken');
            authToken = null;
        }
    }

    // Check if we already have a valid token
    if (authToken) {
        const decoded = decodeJWT(authToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
            return true;
        } else {
            console.log('Current token expired');
            authToken = null;
            sessionStorage.removeItem('googleAuthToken');
        }
    }

    // No valid token, need to authenticate
    console.log('Authentication required');
    try {
        await promptForAuth();
        return true;
    } catch (error) {
        console.error('Authentication failed:', error);
        return false;
    }
}

// GraphQL API client
class GraphQLClient {
    constructor(url) {
        this.url = url;
    }

    async query(query, variables = {}) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            // Add auth token if available and not localhost
            if (!apiUrl.includes('localhost') && authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(this.url, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    query,
                    variables
                })
            });

            if (!response.ok) {
                // If unauthorized and not localhost, try to re-authenticate
                if (response.status === 401 && !apiUrl.includes('localhost')) {
                    authToken = null;
                    await checkAndHandleAuth();
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.errors) {
                throw new Error(data.errors.map(e => e.message).join(', '));
            }

            return data.data;
        } catch (error) {
            console.error('GraphQL query error:', error);
            throw error;
        }
    }
}

// API instance
const api = new GraphQLClient(apiUrl);

// Queries
const queries = {
    profile: `
        query GetProfile {
            profile {
                id
                name
                email
                accounts
            }
        }
    `,

    v2pairs: `
        query GetV2Pairs {
            v2pairs {
                addr
                addr0
                addr1
                contractBlock
                token0 {
                    addr
                    name
                    symbol
                    decimals
                }
                token1 {
                    addr
                    name
                    symbol
                    decimals
                }
            }
        }
    `,

    v3pools: `
        query GetV3Pools {
            v3pools {
                addr
                addr0
                addr1
                contractBlock
                fee
                token0 {
                    addr
                    name
                    symbol
                    decimals
                }
                token1 {
                    addr
                    name
                    symbol
                    decimals
                }
            }
        }
    `,

    // Combined query for initialization data
    initData: `
        query GetInitData {
            profile {
                id
                name
                email
                accounts
            }
            v2pairs {
                addr
                addr0
                addr1
                contractBlock
                token0 {
                    addr
                    name
                    symbol
                    decimals
                }
                token1 {
                    addr
                    name
                    symbol
                    decimals
                }
            }
            v3pools {
                addr
                addr0
                addr1
                contractBlock
                fee
                token0 {
                    addr
                    name
                    symbol
                    decimals
                }
                token1 {
                    addr
                    name
                    symbol
                    decimals
                }
            }
        }
    `,

    profileRecords: `
        query GetProfileRecords($fromDate: String!, $toDate: String, $addrs: [String!], $v2PairsAddrs: [String!], $v3PoolsAddrs: [String!]) {
            profileRecords(fromDate: $fromDate, toDate: $toDate, addrs: $addrs, v2PairsAddrs: $v2PairsAddrs, v3PoolsAddrs: $v3PoolsAddrs) {
                fromBlock
                toBlock
                fromBlockDate {
                    block
                    date
                    unixDate
                }
                toBlockDate {
                    block
                    date
                    unixDate
                }
                records {
                    __typename
                    ... on AccEthBalanceRecord {
                        addr
                        contrAddr
                        txHash
                        block
                        blockDate {
                            block
                            date
                            unixDate
                        }
                        indInBlock
                        advInd
                        isInternalTx
                        traceId
                        isIncrease
                        totalAmount {
                            amount
                            amountInUsd
                        }
                        deltaAmount {
                            amount
                            amountInUsd
                        }
                        feeAmount {
                            amount
                            amountInUsd
                        }
                        rate {
                            date
                            unixDate
                            rate
                        }
                        reason
                        contractName
                        method
                        params {
                            name
                            value
                        }
                    }
                    ... on AccErcBalanceRecord {
                        addr
                        tokenAddr
                        token {
                            addr
                            symbol
                            name
                            decimals
                        }
                        contrAddr
                        txHash
                        block
                        blockDate {
                            block
                            date
                            unixDate
                        }
                        indInBlock
                        advInd
                        isIncrease
                        tokenAmount {
                            tokenAddr
                            token {
                                addr
                                symbol
                                name
                                decimals
                            }
                            amount {
                                amount
                                amountInUsd
                            }
                        }
                        tokenDeltaAmount {
                            tokenAddr
                            token {
                                addr
                                symbol
                                name
                                decimals
                            }
                            amount {
                                amount
                                amountInUsd
                            }
                        }
                        tokenUsdRate {
                            tokenAddr
                            token {
                                addr
                                symbol
                                name
                            }
                            rate {
                                date
                                unixDate
                                rate
                            }
                        }
                        reason
                    }
                    ... on LiqV2BalanceRecord {
                        addr
                        pairAddr
                        contrAddr
                        txHash
                        isIncrease
                        balanceBlock
                        balanceBlockDate {
                            block
                            date
                            unixDate
                        }
                        balanceIndInBlock
                        ltBalance
                        reservesBlock
                        reserve0
                        reserve1
                        totalSupply
                        token0Amount {
                            tokenAddr
                            token {
                                addr
                                symbol
                                name
                            }
                            amount {
                                amount
                                amountInUsd
                            }
                        }
                        token1Amount {
                            tokenAddr
                            token {
                                addr
                                symbol
                                name
                            }
                            amount {
                                amount
                                amountInUsd
                            }
                        }
                        totalAmountInUsd
                        token0Delta {
                            tokenAddr
                            amount {
                                amount
                                amountInUsd
                            }
                        }
                        token1Delta {
                            tokenAddr
                            amount {
                                amount
                                amountInUsd
                            }
                        }
                        ltDelta
                        reason
                        pair {
                            addr
                            token0 {
                                symbol
                                name
                            }
                            token1 {
                                symbol
                                name
                            }
                        }
                    }
                    ... on LiqV3BalanceRecord {
                        addr
                        pool {
                            addr
                            fee
                            token0 {
                                addr
                                symbol
                                name
                            }
                            token1 {
                                addr
                                symbol
                                name
                            }
                        }
                        tokenId
                        poolAddr
                        contrAddr
                        txHash
                        block
                        indInBlock
                        advInd
                        isIncrease
                        token0Delta {
                            tokenAddr
                            amount {
                                amount
                                amountInUsd
                            }
                        }
                        token1Delta {
                            tokenAddr
                            amount {
                                amount
                                amountInUsd
                            }
                        }
                        tokensOwed0Delta {
                            tokenAddr
                            amount {
                                amount
                                amountInUsd
                            }
                        }
                        tokensOwed1Delta {
                            tokenAddr
                            amount {
                                amount
                                amountInUsd
                            }
                        }
                        ltDelta
                        notExist
                        reason
                        blockDate {
                            block
                            date
                            unixDate
                        }
                        token0UsdRate {
                            tokenAddr
                            token {
                                addr
                                symbol
                                name
                            }
                            rate {
                                date
                                unixDate
                                rate
                            }
                        }
                        token1UsdRate {
                            tokenAddr
                            token {
                                addr
                                symbol
                                name
                            }
                            rate {
                                date
                                unixDate
                                rate
                            }
                        }
                        nft {
                            __typename
                            ... on LiqV3NFTBurnedState {
                                hSyncPointDate {
                                    date
                                    unixDate
                                }
                                tokenId
                                hPointBlock
                                hPointBlockDate {
                                    block
                                    date
                                    unixDate
                                }
                            }
                            ... on LiqV3NFTState {
                                hSyncPointDate {
                                    date
                                    unixDate
                                }
                                token0UsdRate {
                                    tokenAddr
                                    rate {
                                        date
                                        unixDate
                                        rate
                                    }
                                }
                                token1UsdRate {
                                    tokenAddr
                                    rate {
                                        date
                                        unixDate
                                        rate
                                    }
                                }
                                hPointBlock
                                hPointBlockDate {
                                    block
                                    date
                                    unixDate
                                }
                                tokenId
                                poolAddr
                                ltTotal
                                feeGrowthInside0LastX128
                                feeGrowthInside1LastX128
                                tokensOwed0Total {
                                    tokenAddr
                                    amount {
                                        amount
                                        amountInUsd
                                    }
                                }
                                tokensOwed1Total {
                                    tokenAddr
                                    amount {
                                        amount
                                        amountInUsd
                                    }
                                }
                                token0Total {
                                    tokenAddr
                                    amount {
                                        amount
                                        amountInUsd
                                    }
                                }
                                token1Total {
                                    tokenAddr
                                    amount {
                                        amount
                                        amountInUsd
                                    }
                                }
                                totalAmountInUsd
                            }
                        }
                    }
                }
            }
        }
    `
};