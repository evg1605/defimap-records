# CLAUDE.md

DeFi analytics Web UI for displaying balance records from Uniswap V2/V3.

## Stack
- Static HTML + JavaScript (no frameworks)
- GraphQL API: http://localhost:8090/api/gql/query
- Schema: `schema.graphqls`

## Filter Display Format
- **Accounts**: `w(i)` + first 10 chars of address  
- **V2 Pairs**: `token0/token1-address_prefix`
- **V3 Pools**: `token0/token1-fee%-address_prefix`

## Files
- `index.html` - Main UI
- `app.js` - Application entry point
- `api.js` - GraphQL API calls
- `filters.js` - Filter panel logic
- `records.js` - Records display logic
- `styles.css` - Styling