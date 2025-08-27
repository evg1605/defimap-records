# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Web UI for a DeFi analytics application that displays balance change records and liquidity position analytics for Ethereum-based DeFi protocols (Uniswap V2/V3). The UI connects to a GraphQL server running at http://localhost:8090/api/gql/query.

## Architecture

### GraphQL API
- **Endpoint**: http://localhost:8090/api/gql/query
- **Schema**: Defined in `schema.graphqls` with 50+ types covering user profiles, blockchain data, DeFi protocols, and financial analytics
- **Custom Scalar**: `Uint64` for blockchain numeric data

### Key Data Types
- **UserProfile**: User data with associated blockchain addresses
- **Balance Records**: Historical balance changes for ETH, ERC20 tokens, V2 pairs, V3 pools
- **Financial Metrics**: P&L calculations, impermanent loss, USD rates
- **Protocol Entities**: V2Pair (liquidity pairs), V3Pool (concentrated liquidity pools)

## UI Implementation Guidelines

### Design Principles
- Light theme, minimalist, compact design
- No authentication required for UI
- Tooltips for truncated addresses (show full on hover)
- Progress indicators during data loading
- Clear error messages with retry options

### Filter Display Format
- **Accounts**: `w(i)` + first 10 chars of address
- **V2 Pairs**: `token0/token1-address_prefix`
- **V3 Pools**: `token0/token1-fee%-address_prefix`

## Development Notes

### Current Task Structure
UI requirements are documented in:
- `prompts/main.md` - Overall UI requirements
- `prompts/head.md` - Header/filter panel specifications
- `prompts/records.md` - Records display panel specifications
- `prompts/prompt_tmp.md` - Current development task

### Implementation Approach
1. Start with static HTML + JavaScript (no framework initially)
2. Implement header/filter panel first
3. Add records display panel
4. Ensure responsive behavior and error handling