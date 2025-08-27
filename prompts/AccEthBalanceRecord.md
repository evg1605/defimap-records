# Виджет для отображения записи типа AccEthBalanceRecord

Все адреса резолвим согласно [address-resolve.md](address-resolve.md)

# Структура виджета

ETH(по нему видим что это AccEthBalanceRecord) reason

адрес (поле addr)  "знак соответствующий операции" контр адрес (поле contrAddr - может быть пустым)
"знак соответствующий операции" - определяем полем reason :

- init - чёрная черточка (2 минуса --)
- received - стрелка (один из зеленых цветов) от contrAddr на addr
- transferred - стрелка (один из красных цветов) от addr на contrAddr

далее на том же уровне что и адреса, но выровнять по правому краю:
delta: deltaAmount.amount (deltaAmount.amountInUsd USD) (цвет зеленый, красный или черный в зависимости от reason),
fee: feeAmount.amount (feeAmount.amountInUsd USD) (цвет зеленый, красный или черный в зависимости от reason),
total: totalAmount.amount (totalAmount.amountInUsd USD) (цвет зеленый, красный или черный в зависимости от reason),
все эти значения раскрашивать в зависимости от reason
далее чуть больше space места и rate.rate ETH/USD

нижняя строчка, выравнено справа - расположить internal: (true or false), adv ind: advInd, trace id: traceId -
показываем всегда даже когда пустые значения

