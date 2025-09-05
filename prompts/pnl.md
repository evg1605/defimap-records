## Панель отображения pnl

При нажатии на кнопку "Run Query" вызывается pnls (смотри схему schema.graphqls), в качестве параметров передаются теже
значения что и для records,
которые получаются из тех же контролов по тем же правилам.

После нажатия кнопки - задизейблить ее до выполнения запроса (также как и все контролы в шапке).
Отображать прогресс выполнения - прогресс выводиться вместо всей панели pnl.
При ошибке - подробное сообщение об ошибке, кнопки повтора не нужно, так как "Run Query" станет снова доступной для
повторного вызыва.
Ошибка выводиться вместо всей панели записей.
В случае успешного вызыва - отображается панель с pnl.

### Отображение pnl

Все цифры которые обозначают относительный или абсолютный Pnl (pnlUsd или pnl) или StartFinalDiff (diffUsd или diff) -
должны быть
соответствующих цветов, красный вариант для отрицательных значений, зеленый для положительных значений, серый для
нулевых.
Все относительные значения которые приходят из ответа в виде строки представляющую десятичную дробь, все такие значения
нужно перевести в процентное представление, достаточно 2 знака после запятой, пример "0.123456" -> "12.35%", но если
значение меньше чем 0.01%, то нужно отобразить хотябы один знак
При наведении мышки на относительное значение (diffRel или pnlRel) - показывать tooltip с точным значением, без
округления, в изначальном виде

Долларовые значения отображать так же как и в records - с USD после числа
Отображаем основные секции pnl:
Секции отделены друг от друга горизонтальной линией или каким либо другим способом - подложкой, отступом и т.п.

### Структура таблиц

#### В секции Total:

Используются **ДВЕ отдельные таблицы**:

**1. PnL таблица** (для pnl данных):

- заголовки: пустая ячейка | PnL USD | PnL %
- данные: название строки | pnlUsd | pnl (в соответствующих цветах)

**2. Diff таблица** (для diff данных):

- заголовки: пустая ячейка | start | final | diff | diff%
- данные: название строки | startUsd | finalUsd | diffUsd | diffRel (в соответствующих цветах)

#### В остальных секциях (Ethereum, ERC20):

Используется **ОДНА таблица** только для diff данных:

- заголовки: пустая ячейка | start | final | diff | diff%
- данные: название строки | startUsd | finalUsd | diffUsd | diffRel

### Требования к таблицам:

- Компактные шрифты (11-13px)
- Выравнивание данных по правому краю ячейки
- Названия строк по левому краю
- Табличные границы
- Цветовое кодирование для всех числовых значений

Пример структуры Total секции:

```
            ################################
            # PnL USD        # PnL %       #
PnL:        # -10.86 USD     # -9.44%      #
            ################################

            #######################################
            # start  # final  # diff  # diff%    #
Diff:       # 115 USD# 116 USD# 1.41  # 1.23%    #
            #######################################
```

#### Section - Total

**PnL таблица:**

- pnl: totalPnl - pnlUsd, totalPnl.pnl (в соответствующих формате и цветах)

**Diff таблица:**

- diff: totalDiff - startUsd, finalUsd, diffUsd, diffRel (в соответствующих формате и цветах)

#### Section - Ethereum

diff: ethPnl.diff - startUsd, finalUsd, diffUsd diffRel (в соответствующих формате и цветах)

### Section - ERC20

берем данные из поля ercPnls

diff: diff - все как и в вышеперечисленных местах
отделяем токены по которым есть pnl - горизонтальной линией или каким либо другим способом - подложкой, отступом и т.п.
далее для каждого ercsPnls
token.symbol: diff - все как и в вышеперечисленных местах
список токенов отсортировать по asc по symbol токена
пропускаем те токены у которых startUsd и finalUsd равны 0 (оба)

#### Section - All DeFi

pnl: data from - totalLiqPnl, make it the same patter like in Section - Total

diff: totalLiqDiff - startUsd, finalUsd, diffUsd, diffRel (в соответствующих формате и цветах)

### Section - V2 Pairs

берем данные из поля v2Pnls

diff: diff - все как и в вышеперечисленных местах
pairsPnls - далее для каждого v2Pnls
pair.token0.symbol/token1.symbol: diff - все как и в вышеперечисленных местах

### Section - V3 Pools

берем данные из поля v3Pnls

diff: diff - все как и в вышеперечисленных местах

далее одна таблица для nftPnls
для каждого V3NFTPnl
[резолвим пул по правилам из prompts/address-resolve.md] tokenID: diff - все как и в вышеперечисленных местах

далее таблица для poolsPnls
для каждого V3PoolPnl
[резолвим пул по правилам из prompts/address-resolve.md]: diff - все как и в вышеперечисленных местах

### Section debug info

Отображаем отладочную информацию, которая приходит в ответе в следующих полях:
```
    # Starting block of the calculation period
    fromBlock: Uint64!
    # Starting block date
    fromBlockDate: BlockDate @goField(forceResolver: true)

    # Ending block of the calculation period
    toBlock: Uint64!
    # Ending block date
    toBlockDate: BlockDate @goField(forceResolver: true)

    # Minimum synchronized block in the data
    minSyncBlock: Uint64!
    # Minimum synchronized date
    minSyncDate: DateEx!

    # Maximum synchronized block in the data
    maxSyncBlock: Uint64!
    # Maximum synchronized date
    maxSyncDate: DateEx!
```
вот порядок вывода

minSyncBlock ,  minSyncDate.date
fromBlock , fromBlockDate.firstBlockForDate , fromBlockDate.date
maxSyncBlock ,  maxSyncDate.date
toBlock , toBlockDate.firstBlockForDate , toBlockDate.date



