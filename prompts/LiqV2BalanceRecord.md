# LiqV2BalanceRecord Widget Specification

## Overview

Widget for displaying Uniswap V2 liquidity position balance change records. Inherits base styles and patterns from
`AccEthBalanceRecord.md`.

## Address Resolution

All addresses are resolved according to `address-resolve.md` specifications.

## Widget Structure

### Header Line

```
{symbolOfToken0}/{symbolOfToken1} {pairAddressPrefix}
```

- **Pair tokens**: `{symbolOfToken0}/{symbolOfToken1}` from pair data
- **Pair address**: First 8 characters (0x12345678) as clickable link to
  `https://etherscan.io/address/{fullPairAddress}`
- **Color**: Same ETH color scheme as AccEthBalanceRecord

### Operation Details

```
{addr} {operationArrow} {contrAddr}
{reason}
```

**Operation arrows** (determined by `reason` field):

- `mint`: Green arrow from contrAddr → addr
- `burned`: Red arrow from addr → contrAddr
- `transferred` if isIncrease is true: Green arrow from contrAddr → addr
- `transferred` if isIncrease is false: Red arrow from addr → contrAddr

**Reason display**: Background and text styling matching AccEthBalanceRecord (positive/negative color scheme)

### Financial Summary (Right-aligned)

```
delta lt: {ltDelta} ({totalUSDValue} USD)
```

### Token Deltas and Totals

```
delta {symbolOfToken0}: {token0Delta.amount.amount} ({token0Delta.amount.amountInUsd} USD) {symbolOfToken1}: {token1Delta.amount.amount} ({token1Delta.amount.amountInUsd} USD) = {ltDelta} ({totalUSDValue} USD)
total {symbolOfToken0}: {token0Amount.amount.amount} ({token0Amount.amount.amountInUsd} USD) {symbolOfToken0}: {token1Amount.amount.amount} ({token1Amount.amount.amountInUsd} USD)  = ({totalAmountInUsd} USD)
```

- **totalUSDValue**: `token0Delta.amount.amountInUsd + token1Delta.amount.amountInUsd`
- **Color**: Green/red based on reason type
- Token symbols as clickable links to `https://etherscan.io/address/{tokenAddress}`
- Colors based on reason (positive/negative)

do layout like table - its example:
```
delta    | WETH: 4265471625299714 (10.59 USD)       | USDT: 100002323222 (10.00 USD) | =         762566276 (20.59 USD)
total    | WETH: 12345678901234567222 (30.59 USD)   | USDT: 20000000 (20.00 USD)     | = 52345678901234567 (50.59 USD)
```

### USD Rates

```
{symbolOfToken0}/USD: {token0UsdRate.rate.rate}
{symbolOfToken1}/USD: {token1UsdRate.rate.rate}
```


### Footer

```
                                       reserve0: {reserve0},  reserve1: {reserve1},total supply: {totalSupply}, adv ind: {advInd}
```

- Right-aligned advanced indicator from main record

## Data Field Mapping

| Display Element    | Data Source                                          |
|--------------------|------------------------------------------------------|
| Pair info          | `pair.{symbolOfToken0, symbolOfToken1,  address}`    |
| Addresses          | `addr`, `contrAddr`                                  |
| Operation          | `reason`                                             |
| Token deltas       | `token0Delta`, `token1Delta`                         |
| USD rates          | `token0UsdRate.rate.rate`, `token1UsdRate.rate.rate` |


## Styling Notes

- Inherit color scheme from AccEthBalanceRecord
- Maintain consistent spacing and alignment
- Ensure clickable elements are visually distinct
- Use appropriate colors for positive/negative operations