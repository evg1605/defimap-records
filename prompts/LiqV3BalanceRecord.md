# Виджет для отображения записи типа LiqV3BalanceRecord

Основные стили и паттерны берем из prompts/AccEthBalanceRecord.md

Все адреса резолвим согласно [address-resolve.md](address-resolve.md)

# Структура виджета

symbolOfToken0/symbolOfToken1 feeOfPool (по нему видим что это LiqV3BalanceRecord) цвет - всё также как цвет для ETH в
prompts/AccEthBalanceRecord.md
далее первые 8 знаков от адреса пула в формате 0x12345678 - это должно быть ссылкой
на https://etherscan.io/address/[полный адрес пула] - вот пример
https://etherscan.io/address/0xeeA92D1E10768Cc89Dc79CB6bC8749dd17bB6D23 , (symbolOfToken0,symbolOfToken1, feeOfPool,
адрес пула беруться из поля pool)
далее reason

адрес (поле addr)  "знак соответствующий операции" контр адрес (поле contrAddr - может быть пустым)
"знак соответствующий операции" - определяем полем reason :

- mint - стрелка (один из зеленых цветов) от contrAddr на addr
- received - стрелка (один из зеленых цветов) от contrAddr на addr
- transferred - стрелка (один из красных цветов) от addr на contrAddr
- burned - стрелка (один из красных цветов) от addr на contrAddr
- increase - стрелка (один из зеленых цветов) от contrAddr на addr
- decrease - стрелка (один из красных цветов) от addr на contrAddr
- collect - стрелка (один из зеленых цветов) от addr на contrAddr

вывод reason оформить также как и в prompts/AccEthBalanceRecord.md - бекграунд и цвет шрифта и шрифт (в зависимости от
значения - позитив-негатив)

далее на том же уровне что и адреса, но выровнять по правому краю:
delta lt: ltDelta (token0Delta.amount.amountInUsd + token1Delta.amount.amountInUsd USD) перед сложением привести к цифровому формату (цвет зеленый, красный или черный в зависимости от reason)

delta symbolOfToken0 (берем из пула), показываем как кликабельную ссылку (
на https://etherscan.io/address/[addressOfToken0] -
вот пример
https://etherscan.io/address/0xeeA92D1E10768Cc89Dc79CB6bC8749dd17bB6D23): token0Delta.amount.amount (
token0Delta.amount.amountInUsd
USD) (цвет зеленый, красный или черный в зависимости от reason),

delta symbolOfToken1 (берем из пула), показываем как кликабельную ссылку (
на https://etherscan.io/address/[addressOfToken1] -
вот пример
https://etherscan.io/address/0xeeA92D1E10768Cc89Dc79CB6bC8749dd17bB6D23): token1Delta.amount.amount (
token1Delta.amount.amountInUsd
USD) (цвет зеленый, красный или черный в зависимости от reason),

ow delta symbolOfToken0 (берем из пула), показываем как кликабельную ссылку (
на https://etherscan.io/address/[addressOfToken0] -
вот пример
https://etherscan.io/address/0xeeA92D1E10768Cc89Dc79CB6bC8749dd17bB6D23): tokensOwed0Delta.amount.amount (
tokensOwed0Delta.amount.amountInUsd
USD) (цвет зеленый, красный или черный в зависимости от reason),

ow delta symbolOfToken1 (берем из пула), показываем как кликабельную ссылку (
на https://etherscan.io/address/[addressOfToken1] -
вот пример
https://etherscan.io/address/0xeeA92D1E10768Cc89Dc79CB6bC8749dd17bB6D23): tokensOwed0Delta.amount.amount (
tokensOwed1Delta.amount.amountInUsd
USD) (цвет зеленый, красный или черный в зависимости от reason),

ниже
rate для 0 и 1 токенов - брать из token0UsdRate и token1UsdRate, отображать как symbolOfToken0/USD и symbolOfToken1/USD

ниже
данные nft токена:
подзаголовок NFT state
независимо от типа поля nft:
token id: tokenId, сделать его кликабельной ссылкой с переходом в новый tab на https://opensea.io/item/ethereum/0xC36442b4a4522E871399CD717aBDD847Ab11FE88/[tokenId] - вот пример https://opensea.io/item/ethereum/0xC36442b4a4522E871399CD717aBDD847Ab11FE88/12345
hSyncPointDate.date (дату и время если есть)
block: hPointBlock (в формате #номер блока - https://etherscan.io/block/[номер блока] , вот
пример https://etherscan.io/block/13745261)

в зависимости от типа поля nft:

- LiqV3NFTBurnedState - красным - burned
- LiqV3NFTState:
  все цифры в nft - нейтральным цветом, независит от reason
  lt total: ltTotal, (totalAmountInUsd USD)
  далее в 2 колонки, для токена 0 и токена 1
  в каждой колонке сверху вниз:
- symbolOfToken0 или 1
- total:token0(1)Total.amount.amount (token0(1)Total.amount.amountInUsd USD)
- ow: tokensOwed0(1)Total.amount.amount (tokensOwed0(1)Total.amount.amountInUsd USD)
- fee-grow: feeGrowthInside0(1)LastX128

нижняя строчка, выравнено справа - расположить adv ind: advInd (из самой записи)

