# BudCon — облік годин/м² та зарплат для будівельних бригад

Telegram Mini App + Notion. Мови інтерфейсу: 🇺🇦 UA, 🇬🇧 EN, 🇨🇿 CZ (перемикач у шапці).

## 1. Notion — створи 8 баз даних

Кожна база — окрема сторінка-таблиця в Notion. Назви колонок мають бути ТОЧНО такими (англійською, як у коді).

### Staff (Персонал)
| Колонка | Тип |
|---|---|
| Name | Title |
| TelegramID | Number |
| RateHour | Number |
| RateM2 | Number |
| BonusOff | Checkbox |
| PremiumOff | Checkbox |
| MinDaysBonus | Number |
| BonusPerLongDay_i | Number |
| BonusSaturday_i | Number |
| PremiumDays_i | Number |
| PremiumAmount_i | Number |
| LongDayHours_i | Number |
| LongDaysNeeded_i | Number |

### Shifts (Зміни)
| Колонка | Тип |
|---|---|
| Name | Title |
| TelegramID | Number |
| Date | Date |
| Hours | Number |
| M2 | Number |
| LunchBreak | Number |
| RateHour | Number |
| RateM2 | Number |

### Advances (Аванси)
| Колонка | Тип |
|---|---|
| Name | Title |
| TelegramID | Number |
| Date | Date |
| Amount | Number |

### Bonuses (Бонуси)
| Колонка | Тип |
|---|---|
| Name | Title |
| TelegramID | Number |
| Date | Date |
| Amount | Number |
| Note | Text |

### Debts (Борги — видані)
| Колонка | Тип |
|---|---|
| Name | Title |
| TelegramID | Number |
| Date | Date |
| Amount | Number |
| Note | Text |

### DebtPayments (Погашення боргів)
| Колонка | Тип |
|---|---|
| Name | Title |
| TelegramID | Number |
| Date | Date |
| Amount | Number |

### Settings (Налаштування — один рядок)
| Колонка | Тип |
|---|---|
| Name | Title |
| MinDaysForBonus | Number |
| BonusPerLongDay | Number |
| BonusSaturday | Number |
| PremiumDays | Number |
| PremiumAmount | Number |
| LongDayHours | Number |
| LongDaysNeeded | Number |
| LunchBreak | Number |

### Logs (Логи)
| Колонка | Тип |
|---|---|
| Name | Title |
| TelegramID | Number |
| Action | Text |
| Details | Text |
| Date | Date |

## 2. Notion — інтеграція

1. notion.so/my-integrations → New integration → скопіюй **Internal Integration Token** (`ntn_...`)
2. У кожній з 8 баз → ••• → Connections → підʼєднай свою інтеграцію
3. ID кожної бази — це 32-символьний рядок з URL бази (без дефісів)

## 3. Vercel — env-змінні

```
NOTION_TOKEN          = ntn_...
VITE_DB_STAFF         = <id Staff>
VITE_DB_SHIFTS        = <id Shifts>
VITE_DB_ADVANCES      = <id Advances>
VITE_DB_BONUSES       = <id Bonuses>
VITE_DB_DEBTS         = <id Debts>
VITE_DB_DEBT_PAYMENTS = <id DebtPayments>
VITE_DB_SETTINGS      = <id Settings>
VITE_DB_LOGS          = <id Logs>
VITE_OWNER_IDS        = <Telegram ID власника, через кому якщо кілька>
```

## 4. Деплой

1. GitHub → новий репозиторій → залий усі файли цієї папки
2. Vercel → New Project → імпортуй репозиторій → додай env-змінні вище → Deploy
3. У @BotFather створи бота → Bot Settings → Menu Button → встав посилання на Vercel-домен

## 5. Перший запуск

- В базі **Staff** додай рядок: `Name` = ім'я власника, `TelegramID` = його Telegram ID, `RateHour`/`RateM2` = 0
- Власник додається через `VITE_OWNER_IDS` — це і визначає панель власника
- В базі **Settings** створи один рядок з базовими значеннями (наприклад: MinDaysForBonus=19, LunchBreak=1, решта 0) — або просто збережи через ⚙️ Налаштування в самому додатку, він створить рядок автоматично

## Як працює оплата

- **Години**: режим «З / По» (вводиться час початку і кінця, автоматично віднімається обід) або «Кількість» (чисті відпрацьовані години без обіду)
- **М²**: площа виконаної роботи за зміну, помножена на ставку за м²
- **Змішана**: одна зміна — і години, і м²
- Бонуси/премії/аванси/борги — як у системі для пилорами, з індивідуальними налаштуваннями на кожного працівника
