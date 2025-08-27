# Виджет для отображения записи типа AccErcBalanceRecord

Основные стили и паттерны берем из prompts/AccEthBalanceRecord.md

Все адреса резолвим согласно [address-resolve.md](address-resolve.md)

# Структура виджета

SymbolOfToken(из поля token.symbol по нему видим что это AccErcBalanceRecord) первые 8 знаков от адреса токена в формате
0x12345678 цвет - всё также как цвет для ETH в prompts/AccEthBalanceRecord.md, далее reason
часть адреса должна быть ссылкой на https://etherscan.io/address/[полный адрес токена] - вот пример
https://etherscan.io/address/0xeeA92D1E10768Cc89Dc79CB6bC8749dd17bB6D23

адрес (поле addr)  "знак соответствующий операции" контр адрес (поле contrAddr - может быть пустым)
"знак соответствующий операции" - определяем полем reason :

- init - чёрная черточка (2 минуса --)
- received - стрелка (один из зеленых цветов) от contrAddr на addr
- transferred - стрелка (один из красных цветов) от addr на contrAddr
- deposited - стрелка (один из зеленых цветов) от contrAddr на addr
- withdrawn - стрелка (один из красных цветов) от addr на contrAddr

при reason = deposited и withdrawn - контр адрес - это всегда адрес 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 (который также резолвим)

далее на том же уровне что и адреса, но выровнять по правому краю:
delta: tokenDeltaAmount.amount.amount (tokenDeltaAmount.amount.amountInUsd USD) (цвет зеленый, красный или черный в
зависимости от reason),
total: tokenAmount.amount.amount (tokenAmount.amount.amountInUsd USD) (цвет зеленый, красный или черный в
зависимости от reason),
все эти значения раскрашивать в зависимости от reason
далее чуть больше space места и tokenUsdRate.rate.rate SymbolOfToken/USD

нижняя строчка, выравнено справа - расположить adv ind: advInd - показываем всегда даже когда пустые значения

