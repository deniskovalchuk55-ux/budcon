// i18n.js — BudCon, переклади UA / EN / CZ
import { useState, useEffect } from 'react'

export const LANGS = [
  { code: 'uk', label: 'UA', flag: '🇺🇦' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'cs', label: 'CZ', flag: '🇨🇿' },
  { code: 'pl', label: 'PL', flag: '🇵🇱' },
]

export const CURRENCIES = [
  { code: 'UAH', symbol: '₴', label: 'UAH' },
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'CZK', symbol: 'Kč', label: 'CZK' },
  { code: 'PLN', symbol: 'zł', label: 'PLN' },
]
export function curSymbol(code) {
  return CURRENCIES.find(c => c.code === code)?.symbol || '₴'
}

const dict = {
  // ── ЗАГАЛЬНЕ ──────────────────────────────────────────
  appName:        { uk:'BudCon',              en:'BudCon',              cs:'BudCon' , pl:'BudCon' },
  loading:        { uk:'Завантаження...',     en:'Loading...',          cs:'Načítání...' , pl:'Ładowanie...' },
  save:           { uk:'Зберегти',            en:'Save',                cs:'Uložit' , pl:'Zapisz' },
  saving:         { uk:'Збереження...',       en:'Saving...',           cs:'Ukládání...' , pl:'Zapisywanie...' },
  saved:          { uk:'✓ Збережено!',        en:'✓ Saved!',            cs:'✓ Uloženo!' , pl:'✓ Zapisano!' },
  cancel:         { uk:'Скасувати',           en:'Cancel',              cs:'Zrušit' , pl:'Anuluj' },
  back:           { uk:'Назад',               en:'Back',                cs:'Zpět' , pl:'Wstecz' },
  delete:         { uk:'Видалити',            en:'Delete',              cs:'Smazat' , pl:'Usuń' },
  edit:           { uk:'Редагувати',          en:'Edit',                cs:'Upravit' , pl:'Edytuj' },
  confirmDelete:  { uk:'Видалити запис?',      en:'Delete this entry?',  cs:'Smazat záznam?' , pl:'Usunąć wpis?' },
  error:          { uk:'Помилка',             en:'Error',               cs:'Chyba' , pl:'Błąd' },
  today:          { uk:'Сьогодні',            en:'Today',               cs:'Dnes' , pl:'Dzisiaj' },
  hr:             { uk:'год',                 en:'h',                   cs:'h' , pl:'godz' },
  uah:            { uk:'грн',                 en:'UAH',                 cs:'UAH' , pl:'UAH' },
  m2short:        { uk:'м²',                  en:'m²',                  cs:'m²' , pl:'m²' },

  months: {
    uk: ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    cs: ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'],
    pl: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
  },

  // ── ВХІД / РОЛІ ───────────────────────────────────────
  notRegistered:  { uk:'Тебе ще не додано в систему.\nЗвернись до власника.',
                    en:'You are not registered yet.\nContact the owner.',
                    cs:'Ještě nejsi registrován.\nKontaktuj majitele.' , pl:'Nie jesteś jeszcze zarejestrowany.\nSkontaktuj się z właścicielem.' },
  ownerPanel:     { uk:'Панель власника',     en:'Owner panel',         cs:'Panel majitele' , pl:'Panel właściciela' },

  // ── ДАШБОРД ВЛАСНИКА ──────────────────────────────────
  staff:          { uk:'Бригада',             en:'Crew',                cs:'Tým' , pl:'Brygada' },
  totalToPay:     { uk:'До виплати всім',     en:'Total to pay',        cs:'Celkem k výplatě' , pl:'Do wypłaty łącznie' },
  workers:        { uk:'працівників',         en:'workers',             cs:'pracovníků' , pl:'pracowników' },
  settingsBtn:    { uk:'⚙️ Налаштування',     en:'⚙️ Settings',          cs:'⚙️ Nastavení' , pl:'⚙️ Ustawienia' },
  addStaff:       { uk:'➕ Додати працівника', en:'➕ Add worker',        cs:'➕ Přidat pracovníka' , pl:'➕ Dodaj pracownika' },
  rates:          { uk:'✏️ Ставки',            en:'✏️ Rates',             cs:'✏️ Sazby' , pl:'✏️ Stawki' },

  // ── СТАТИСТИКА ПРАЦІВНИКА ─────────────────────────────
  yourSalary:     { uk:'Твоя зарплата',       en:'Your salary',         cs:'Tvoje mzda' , pl:'Twoja wypłata' },
  hoursWorked:    { uk:'Відпрацьовано годин', en:'Hours worked',        cs:'Odpracováno hodin' , pl:'Przepracowane godziny' },
  m2Done:         { uk:'Виконано',            en:'Completed',          cs:'Dokončeno' , pl:'Wykonano' },
  basePay:        { uk:'Базова оплата',       en:'Base pay',            cs:'Základní mzda' , pl:'Podstawa wynagrodzenia' },
  bonus:          { uk:'Бонус',               en:'Bonus',               cs:'Bonus' , pl:'Bonus' },
  premium:        { uk:'Премія',              en:'Premium',             cs:'Prémie' , pl:'Premia' },
  advancesTotal:  { uk:'Аванси',              en:'Advances',            cs:'Zálohy' , pl:'Zaliczki' },
  debtPaid:       { uk:'Погашено боргу',      en:'Debt paid',           cs:'Splaceno dluhu' , pl:'Spłacony dług' },
  debtRemaining:  { uk:'Залишок боргу',       en:'Remaining debt',      cs:'Zbývající dluh' , pl:'Pozostały dług' },
  toPay:          { uk:'До виплати',          en:'To pay',              cs:'K výplatě' , pl:'Do wypłaty' },
  gross:          { uk:'Нараховано',          en:'Gross',               cs:'Hrubá mzda' , pl:'Naliczono' },
  workDays:       { uk:'Робочих днів',        en:'Work days',           cs:'Pracovních dní' , pl:'Dni robocze' },

  // ── ЗМІНА (ФОРМА) ─────────────────────────────────────
  newShift:       { uk:'Внести зміну',        en:'Add shift',           cs:'Zadat směnu' , pl:'Dodaj zmianę' },
  shiftType:      { uk:'ТИП',                 en:'TYPE',                cs:'TYP' , pl:'TYP' },
  typeHours:      { uk:'⏱ Години',            en:'⏱ Hours',             cs:'⏱ Hodiny' , pl:'⏱ Godziny' },
  typeM2:         { uk:'📐 М²',               en:'📐 m²',               cs:'📐 m²' , pl:'📐 m²' },
  typeMixed:      { uk:'⏱📐 Змішана',          en:'⏱📐 Mixed',           cs:'⏱📐 Smíšená' , pl:'⏱📐 Mieszany' },
  date:           { uk:'ДАТА',                en:'DATE',                cs:'DATUM' , pl:'DATA' },
  hours:          { uk:'ГОДИНИ',              en:'HOURS',               cs:'HODINY' , pl:'GODZINY' },
  m2:             { uk:'ПЛОЩА (М²)',          en:'AREA (M²)',           cs:'PLOCHA (M²)' , pl:'POWIERZCHNIA (M²)' },
  hoursMode:      { uk:'ГОДИНИ',              en:'HOURS',               cs:'HODINY' , pl:'GODZINY' },
  modeRange:      { uk:'З / По',              en:'From / To',           cs:'Od / Do' , pl:'Od / Do' },
  modeManual:     { uk:'Кількість',           en:'Quantity',            cs:'Množství' , pl:'Ilość' },
  from:           { uk:'З',                   en:'From',                cs:'Od' , pl:'Od' },
  to:             { uk:'По',                  en:'To',                  cs:'Do' , pl:'Do' },
  lunchBreakLbl:  { uk:'обід',                en:'lunch break',         cs:'pauza na oběd' , pl:'przerwa obiadowa' },
  perShift:       { uk:'За зміну',            en:'Per shift',           cs:'Za směnu' , pl:'Za zmianę' },
  saveShift:      { uk:'Зберегти зміну',      en:'Save shift',          cs:'Uložit směnu' , pl:'Zapisz zmianę' },
  shiftSaved:     { uk:'✅ Зміну внесено!',    en:'✅ Shift saved!',      cs:'✅ Směna uložena!' , pl:'✅ Zmiana zapisana!' },
  enterHoursOrM2: { uk:'Вкажи години або м²', en:'Enter hours or m²',   cs:'Zadej hodiny nebo m²' , pl:'Podaj godziny lub m²' },
  checkTime:      { uk:'Перевір час початку і кінця', en:'Check start/end time', cs:'Zkontroluj čas od/do' , pl:'Sprawdź czas początku i końca' },
  enteredHours:   { uk:'Введено годин',       en:'Entered hours',       cs:'Zadáno hodin' , pl:'Wprowadzone godziny' },
  afterLunch:     { uk:'Після обіду',         en:'After lunch break',   cs:'Po obědě' , pl:'Po przerwie obiadowej' },
  m2Field:        { uk:'м²',                  en:'m²',                  cs:'m²' , pl:'m²' },
  earned:         { uk:'Зароблено',           en:'Earned',              cs:'Vyděláno' , pl:'Zarobiono' },
  workTime:       { uk:'Час роботи',          en:'Work time',           cs:'Pracovní doba' , pl:'Czas pracy' },

  // ── АВАНС ─────────────────────────────────────────────
  advance:        { uk:'Аванс',               en:'Advance',            cs:'Záloha' , pl:'Zaliczka' },
  newAdvance:     { uk:'💵 Аванс',             en:'💵 Advance',           cs:'💵 Záloha' , pl:'💵 Zaliczka' },
  amount:         { uk:'СУМА',                en:'AMOUNT',              cs:'ČÁSTKA' , pl:'KWOTA' },
  advanceSaved:   { uk:'✅ Аванс внесено!',    en:'✅ Advance saved!',    cs:'✅ Záloha uložena!' , pl:'✅ Zaliczka zapisana!' },
  worker:         { uk:'ПРАЦІВНИК',           en:'WORKER',              cs:'PRACOVNÍK' , pl:'PRACOWNIK' },

  // ── СТАТИСТИКА / ДНІ ──────────────────────────────────
  statistics:     { uk:'📊 Статистика',       en:'📊 Statistics',        cs:'📊 Statistika' , pl:'📊 Statystyka' },
  payslip:        { uk:'📄 Листок',           en:'📄 Payslip',          cs:'📄 Výplatní páska' , pl:'📄 Odcinek wypłaty' },
  days:           { uk:'Дні',                 en:'Days',                cs:'Dny' , pl:'Dni' },
  noEntries:      { uk:'Ще немає записів цього місяця', en:'No entries this month yet', cs:'Zatím žádné záznamy tento měsíc' , pl:'Jeszcze brak wpisów w tym miesiącu' },

  // ── СТАВКИ / НАЛАШТУВАННЯ ПРАЦІВНИКА ──────────────────
  ratesTitle:     { uk:'✏️ Ставки',            en:'✏️ Rates',             cs:'✏️ Sazby' , pl:'✏️ Stawki' },
  rateHour:       { uk:'Ставка за годину (грн)', en:'Rate per hour',     cs:'Sazba za hodinu' , pl:'Stawka za godzinę' },
  rateM2:         { uk:'Ставка за м² (грн)',  en:'Rate per m²',         cs:'Sazba za m²' , pl:'Stawka za m²' },
  bonusToggle:    { uk:'⭐ Бонуси (10+ год, суботи)', en:'⭐ Bonuses (10+ h, Saturdays)', cs:'⭐ Bonusy (10+ h, soboty)' , pl:'⭐ Bonusy (10+ godz., soboty)' },
  premiumToggle:  { uk:'🏆 Премія за місяць', en:'🏆 Monthly premium',  cs:'🏆 Měsíční prémie' , pl:'🏆 Premia miesięczna' },
  individualSettings: { uk:'Індивідуальні налаштування', en:'Individual settings', cs:'Individuální nastavení' , pl:'Ustawienia indywidualne' },
  useGlobal:      { uk:'(порожньо = загальне)', en:'(empty = global)',  cs:'(prázdné = globální)' , pl:'(puste = globalne)' },

  // ── ГЛОБАЛЬНІ НАЛАШТУВАННЯ ────────────────────────────
  settingsTitle:  { uk:'⚙️ Налаштування',     en:'⚙️ Settings',          cs:'⚙️ Nastavení' , pl:'⚙️ Ustawienia' },
  minDaysForBonus:{ uk:'Мін днів для бонусу', en:'Min days for bonus',  cs:'Min dní pro bonus' , pl:'Min dni do bonusu' },
  bonusPerLongDay:{ uk:'Бонус за довгий день', en:'Bonus per long day',  cs:'Bonus za dlouhý den' , pl:'Bonus za długi dzień' },
  bonusSaturday:  { uk:'Бонус за суботу',     en:'Saturday bonus',      cs:'Bonus za sobotu' , pl:'Bonus za sobotę' },
  premiumDays:    { uk:'Днів для премії',     en:'Days for premium',    cs:'Dní pro prémii' , pl:'Dni do premii' },
  premiumAmount:  { uk:'Сума премії',         en:'Premium amount',      cs:'Výše prémie' , pl:'Wysokość premii' },
  longDayHours:   { uk:'Годин — довгий день', en:'Hours — long day',    cs:'Hodin — dlouhý den' , pl:'Godzin — długi dzień' },
  longDaysNeeded: { uk:'Потрібно довгих днів',en:'Long days needed',    cs:'Potřeba dlouhých dnů' , pl:'Potrzeba długich dni' },
  lunchBreak:     { uk:'Обід (год)',          en:'Lunch break (h)',     cs:'Pauza na oběd (h)' , pl:'Przerwa obiadowa (godz.)' },

  // ── СПИСОК ДНІВ ───────────────────────────────────────
  dayEntry:       { uk:'Запис',               en:'Entry',               cs:'Záznam' , pl:'Wpis' },
  noData:         { uk:'Немає даних',         en:'No data',             cs:'Žádná data' , pl:'Brak danych' },

  // ── БОНУСИ / БОРГИ (РУЧНІ) ────────────────────────────
  addBonus:       { uk:'➕ Бонус',             en:'➕ Bonus',             cs:'➕ Bonus' , pl:'➕ Bonus' },
  bonusNote:      { uk:'Примітка',            en:'Note',                cs:'Poznámka' , pl:'Notatka' },
  resetAmount:    { uk:'Скинути',              en:'Reset',               cs:'Vynulovat', pl:'Wyzeruj' },
  orEnterManually:{ uk:'або введи вручну',     en:'or enter manually',   cs:'nebo zadej ručně', pl:'lub wpisz ręcznie' },
  bonusSaved:     { uk:'✅ Бонус додано!',     en:'✅ Bonus added!',     cs:'✅ Bonus přidán!' , pl:'✅ Bonus dodany!' },
  issueDebt:      { uk:'📝 Видати борг',       en:'📝 Issue debt',        cs:'📝 Vydat dluh' , pl:'📝 Udziel długu' },
  debtSaved:      { uk:'✅ Борг додано!',      en:'✅ Debt added!',      cs:'✅ Dluh přidán!' , pl:'✅ Dług dodany!' },
  payDebt:        { uk:'💳 Погасити борг',     en:'💳 Repay debt',        cs:'💳 Splatit dluh' , pl:'💳 Spłać dług' },
  debtPaymentSaved:{ uk:'✅ Погашення внесено!', en:'✅ Payment recorded!', cs:'✅ Splátka zaznamenána!' , pl:'✅ Spłata zapisana!' },
  manualBonusLbl: { uk:'Ручні бонуси',        en:'Manual bonuses',      cs:'Manuální bonusy' , pl:'Bonusy ręczne' },

  // ── ПЕРСОНАЛ ──────────────────────────────────────────
  workerName:     { uk:'Імʼя',                en:'Name',                cs:'Jméno' , pl:'Imię' },
  telegramId:     { uk:'Telegram ID',         en:'Telegram ID',         cs:'Telegram ID' , pl:'Telegram ID' },
  staffSaved:     { uk:'✅ Працівника додано!', en:'✅ Worker added!',    cs:'✅ Pracovník přidán!' , pl:'✅ Pracownik dodany!' },
  noWorkers:      { uk:'Поки немає працівників', en:'No workers yet',   cs:'Zatím žádní pracovníci' , pl:'Brak pracowników' },
  totalFinal:     { uk:'Разом до виплати',    en:'Total to pay',        cs:'Celkem k výplatě' , pl:'Razem do wypłaty' },
  tapToOpen:      { uk:'натисни щоб відкрити', en:'tap to open',         cs:'klepnutím otevřeš' , pl:'kliknij, aby otworzyć' },
  settingsSaved:  { uk:'✅ Налаштування збережено!', en:'✅ Settings saved!', cs:'✅ Nastavení uloženo!' , pl:'✅ Ustawienia zapisane!' },

  // ── НАВІГАЦІЯ (нижнє меню) ─────────────────────────────
  navHome:        { uk:'Головна',             en:'Home',                cs:'Domů' , pl:'Główna' },
  navShifts:      { uk:'Зміни',               en:'Shifts',              cs:'Směny' , pl:'Zmiany' },
  navAdd:         { uk:'Додати',              en:'Add',                 cs:'Přidat' , pl:'Dodaj' },
  navAddShift:    { uk:'Додати зміну',        en:'Add shift',           cs:'Přidat směnu' , pl:'Dodaj zmianę' },
  navTeam:        { uk:'Бригада',             en:'Team',                cs:'Tým' , pl:'Brygada' },
  navReport:      { uk:'Звіт',                en:'Report',              cs:'Report' , pl:'Raport' },

  // ── ГОЛОВНА (власник) ──────────────────────────────────
  totalToPayMonth:{ uk:'Загальна сума\nдо виплати за місяць', en:'Total amount\nto pay this month', cs:'Celková částka\nk výplatě za měsíc' , pl:'Łączna kwota\ndo wypłaty za miesiąc' },
  addWorkerBtn:   { uk:'Додати працівника',   en:'Add worker',          cs:'Přidat pracovníka' , pl:'Dodaj pracownika' },

  // ── ШВИДКЕ МАСОВЕ ВНЕСЕННЯ ──────────────────────────────
  bulkEntryBtn:      { uk:'Швидке внесення',       en:'Quick entry',         cs:'Rychlé zadání',        pl:'Szybkie wprowadzanie' },
  bulkEntryTitle:    { uk:'Швидке внесення',        en:'Quick entry',         cs:'Rychlé zadání',        pl:'Szybkie wprowadzanie' },
  bulkDefaultLbl:    { uk:'ЗА ЗАМОВЧУВАННЯМ (застосується одразу до всіх)', en:'DEFAULT (applies to everyone instantly)', cs:'VÝCHOZÍ (použije se okamžitě na všechny)', pl:'DOMYŚLNIE (zastosuje się od razu do wszystkich)' },
  bulkDefaultHint:   { uk:'Натискаєш — усі працівники нижче миттєво отримують це значення, без підтвердження. Вже скориговані вручну рядки не зміняться.',
                       en:'Tap — everyone below instantly gets this value, no confirmation. Already manually adjusted rows will not change.',
                       cs:'Klepnutím — všichni níže okamžitě dostanou tuto hodnotu, bez potvrzení. Ručně upravené řádky se nezmění.',
                       pl:'Dotknij — wszyscy poniżej natychmiast otrzymują tę wartość, bez potwierdzenia. Ręcznie skorygowane wiersze się nie zmienią.' },
  bulkAbsentBtn:     { uk:'Відсутній',              en:'Absent',              cs:'Nepřítomen',           pl:'Nieobecny' },
  bulkAlreadyEntered:{ uk:'Вже внесено сьогодні',   en:'Already entered today', cs:'Již zadáno dnes',    pl:'Już wprowadzono dzisiaj' },
  bulkWillUpdate:    { uk:'оновлення',              en:'update',              cs:'aktualizace',          pl:'aktualizacja' },
  bulkSummaryWorking:{ uk:'Працює',                 en:'Working',             cs:'Pracuje',              pl:'Pracuje' },
  bulkSummaryAbsent: { uk:'Відсутні',               en:'Absent',              cs:'Nepřítomní',           pl:'Nieobecni' },
  bulkSummaryHours:  { uk:'Год. всього',            en:'Total hrs',           cs:'Hod. celkem',          pl:'Godz. razem' },
  bulkAbsentSection: { uk:'ВІДСУТНІ СЬОГОДНІ',      en:'ABSENT TODAY',        cs:'DNES NEPŘÍTOMNÍ',      pl:'DZISIAJ NIEOBECNI' },
  bulkWorkingSection:{ uk:'ПРАЦЮЮТЬ',               en:'WORKING',             cs:'PRACUJÍ',              pl:'PRACUJĄ' },
  bulkAllPresent:    { uk:'Всі на місці',           en:'Everyone is present', cs:'Všichni jsou přítomni', pl:'Wszyscy są obecni' },
  bulkConfirmBtn:    { uk:'Підтвердити внесення',   en:'Confirm entry',       cs:'Potvrdit zadání',      pl:'Potwierdź wprowadzenie' },
  bulkConfirmTitle:  { uk:'Підтвердження',          en:'Confirmation',        cs:'Potvrzení',            pl:'Potwierdzenie' },
  bulkSaved:         { uk:'✅ Внесено для всієї бригади!', en:'✅ Entered for the whole crew!', cs:'✅ Zadáno pro celý tým!', pl:'✅ Wprowadzono dla całej ekipy!' },

  // ── НАЛАШТУВАННЯ (сторінка) ────────────────────────────
  settingsPage:       { uk:'Налаштування',        en:'Settings',            cs:'Nastavení' , pl:'Ustawienia' },
  workModeSection:    { uk:'Режим роботи',         en:'Work mode',           cs:'Pracovní režim' , pl:'Tryb pracy' },
  accountingMode:     { uk:'Режим обліку',         en:'Accounting mode',     cs:'Režim evidence' , pl:'Tryb rozliczenia' },
  workModeHint:       { uk:'Оберіть, з чим ви працюєте. Це впливає на створення змін та розрахунок зарплати.',
                        en:'Choose what you work with. This affects how shifts are created and salary calculated.',
                        cs:'Vyberte, s čím pracujete. Ovlivňuje to vytváření směn a výpočet mzdy.' , pl:'Wybierz, z czym pracujesz. Wpływa to na tworzenie zmian i obliczanie wypłaty.' },
  modeHoursOnly:      { uk:'Тільки години',        en:'Hours only',          cs:'Jen hodiny' , pl:'Tylko godziny' },
  modeHoursOnlyDesc:  { uk:'Облік тільки за відпрацьованими годинами', en:'Track only worked hours', cs:'Evidence jen podle odpracovaných hodin' , pl:'Rozliczenie tylko według przepracowanych godzin' },
  modeM2Only:         { uk:'Тільки м²',            en:'m² only',             cs:'Jen m²' , pl:'Tylko m²' },
  modeM2OnlyDesc:     { uk:'Облік тільки за площею виконаних робіт', en:'Track only area of completed work', cs:'Evidence jen podle plochy provedené práce' , pl:'Rozliczenie tylko według powierzchni wykonanych prac' },
  modeMixed:          { uk:'Змішаний режим',       en:'Mixed mode',          cs:'Smíšený režim' , pl:'Tryb mieszany' },
  modeMixedDesc:      { uk:'Облік за годинами та площею', en:'Track both hours and area', cs:'Evidence podle hodin i plochy' , pl:'Rozliczenie według godzin i powierzchni' },
  showInShifts:       { uk:'Показувати в змінах',  en:'Show in shifts',      cs:'Zobrazit ve směnách' , pl:'Pokazywać w zmianach' },
  showHoursToggle:    { uk:'Години',                en:'Hours',               cs:'Hodiny' , pl:'Godziny' },
  showHoursDesc:      { uk:'Враховувати години в змінах та розрахунках', en:'Include hours in shifts and calculations', cs:'Zahrnout hodiny do směn a výpočtů' , pl:'Uwzględniać godziny w zmianach i obliczeniach' },
  showM2Toggle:       { uk:'М² (метри квадратні)', en:'m² (square meters)',  cs:'m² (metry čtvereční)' , pl:'m² (metry kwadratowe)' },
  showM2Desc:         { uk:'Враховувати площу в змінах та розрахунках', en:'Include area in shifts and calculations', cs:'Zahrnout plochu do směn a výpočtů' , pl:'Uwzględniać powierzchnię w zmianach i obliczeniach' },
  rateSettings:       { uk:'Налаштування ставок',  en:'Rate settings',       cs:'Nastavení sazeb' , pl:'Ustawienia stawek' },
  rateHourRow:        { uk:'Ставка за годину',     en:'Rate per hour',       cs:'Sazba za hodinu' , pl:'Stawka za godzinę' },
  rateM2Row:          { uk:'Ставка за м²',         en:'Rate per m²',         cs:'Sazba za m²' , pl:'Stawka za m²' },
  lunchSection:       { uk:'Обід',                 en:'Lunch break',         cs:'Oběd' , pl:'Obiad' },
  lunchDuration:      { uk:'Тривалість обіду',     en:'Lunch duration',      cs:'Délka obědu' , pl:'Czas trwania obiadu' },
  lunchHint:          { uk:'Цей час буде автоматично відніматися при розрахунку зміни у режимі «з/по».',
                        en:'This time will be automatically subtracted when calculating a shift in "from/to" mode.',
                        cs:'Tento čas se automaticky odečte při výpočtu směny v režimu „od/do“.' , pl:'Ten czas będzie automatycznie odliczany przy obliczaniu zmiany w trybie „od/do”.' },
  otherSection:       { uk:'Інше',                 en:'Other',               cs:'Ostatní' , pl:'Inne' },

  // ── ВІДОМІСТЬ НА ВИПЛАТУ (друк) ────────────────────────
  printSection:      { uk:'Документи',            en:'Documents',           cs:'Dokumenty',           pl:'Dokumenty' },
  printRow:          { uk:'Роздрукувати відомість', en:'Print payslip sheet', cs:'Vytisknout výplatní list', pl:'Wydrukuj listę płac' },
  payslipTitle:      { uk:'Відомість на виплату',  en:'Payslip sheet',       cs:'Výplatní list',       pl:'Lista płac' },
  printBtn:          { uk:'Друк',                  en:'Print',               cs:'Tisk',                pl:'Drukuj' },
  grossTotal:        { uk:'Загальна сума',         en:'Gross total',         cs:'Celková částka',      pl:'Kwota całkowita' },
  toCard:            { uk:'На картку',             en:'To card',             cs:'Na kartu',            pl:'Na kartę' },
  finalCash:         { uk:'Кінцева сума',          en:'Final amount',        cs:'Konečná částka',      pl:'Kwota końcowa' },
  signature:         { uk:'Підпис',                en:'Signature',           cs:'Podpis',              pl:'Podpis' },
  preparedBy:        { uk:'Підготував',            en:'Prepared by',         cs:'Připravil',           pl:'Przygotował' },
  dateLbl:           { uk:'Дата',                  en:'Date',                cs:'Datum',               pl:'Data' },
  numLbl:            { uk:'№',                     en:'#',                   cs:'č.',                  pl:'nr' },
  remindersRow:       { uk:'Нагадування про зміни', en:'Shift reminders',     cs:'Připomínky směn' , pl:'Przypomnienia o zmianach' },
  enabledLbl:         { uk:'Увімкнено',            en:'Enabled',             cs:'Zapnuto' , pl:'Włączone' },
  disabledLbl:        { uk:'Вимкнено',             en:'Disabled',            cs:'Vypnuto' , pl:'Wyłączone' },
  languageRow:        { uk:'Мова',                 en:'Language',            cs:'Jazyk' , pl:'Język' },
  themeRow:           { uk:'Тема',                 en:'Theme',               cs:'Téma',               pl:'Motyw' },
  themeLight:         { uk:'Світла',                en:'Light',               cs:'Světlé',             pl:'Jasny' },
  themeDark:          { uk:'Темна',                 en:'Dark',                cs:'Tmavé',              pl:'Ciemny' },
  currencyRow:        { uk:'Валюта',               en:'Currency',            cs:'Měna',              pl:'Waluta' },
  hoursMinShort:      { uk:'год',                  en:'h',                   cs:'h' , pl:'godz.' },
  minutesShort:       { uk:'хв',                   en:'min',                 cs:'min' , pl:'min' },

  // ── ПРОФІЛЬ ПРАЦІВНИКА / ВКЛАДКИ ───────────────────────
  tabProfile:     { uk:'Профіль',              en:'Profile',             cs:'Profil' , pl:'Profil' },
  tabShifts:      { uk:'Зміни',                en:'Shifts',              cs:'Směny' , pl:'Zmiany' },
  tabAccruals:    { uk:'Нарахування',          en:'Accruals',            cs:'Připsání' , pl:'Naliczenia' },
  tabHistory:     { uk:'Історія операцій',     en:'Operation history',   cs:'Historie operací' , pl:'Historia operacji' },

  toPayForMonth:      { uk:'До виплати за',        en:'To pay for',          cs:'K výplatě za' , pl:'Do wypłaty za' },
  detailedCalc:       { uk:'Детальний розрахунок', en:'Detailed calculation', cs:'Podrobný výpočet' , pl:'Szczegółowe obliczenie' },
  workedTotal:        { uk:'Відпрацьовано',        en:'Worked',              cs:'Odpracováno' , pl:'Przepracowano' },
  byHoursLbl:         { uk:'За годинами',          en:'By hours',            cs:'Podle hodin' , pl:'Według godzin' },
  byM2Lbl:            { uk:'За м²',                en:'By m²',               cs:'Podle m²' , pl:'Według m²' },
  rateLbl:            { uk:'Ставка',               en:'Rate',                cs:'Sazba' , pl:'Stawka' },

  actionAddShift:     { uk:'Додати\nзміну',        en:'Add\nshift',          cs:'Přidat\nsměnu' , pl:'Dodaj\nzmianę' },
  actionAdvance:      { uk:'Видати\nаванс',        en:'Issue\nadvance',      cs:'Vydat\nzálohu' , pl:'Wypłać\nzaliczkę' },
  actionBonus:        { uk:'Ручний\nбонус',        en:'Manual\nbonus',       cs:'Manuální\nbonus' , pl:'Ręczny\nbonus' },
  actionDebt:         { uk:'Борг',                 en:'Debt',                cs:'Dluh' , pl:'Dług' },
  actionDebtPay:      { uk:'Погашення\nборгу',     en:'Repay\ndebt',         cs:'Splátka\ndluhu' , pl:'Spłata\ndługu' },

  shiftsForMonth:     { uk:'Зміни за',             en:'Shifts for',          cs:'Směny za' , pl:'Zmiany za' },
  filterLbl:          { uk:'Фільтр',               en:'Filter',              cs:'Filtr' , pl:'Filtr' },
  sortLbl:            { uk:'Сортування',           en:'Sort',                cs:'Řazení' , pl:'Sortowanie' },
  totalForMonth:      { uk:'Разом за місяць',      en:'Total for month',     cs:'Celkem za měsíc' , pl:'Razem za miesiąc' },
  shiftsCount:        { uk:'змін',                 en:'shifts',              cs:'směn' , pl:'zmian' },
  quantityHoursLbl:   { uk:'Кількість годин',      en:'Hours quantity',      cs:'Počet hodin' , pl:'Liczba godzin' },
  perHourShort:       { uk:'/год',                 en:'/h',                  cs:'/h' , pl:'/godz.' },
  perM2Short:         { uk:'/м²',                  en:'/m²',                 cs:'/m²' , pl:'/m²' },

  accrualsBreakdown:  { uk:'Розбивка нарахувань',  en:'Accruals breakdown',  cs:'Rozpis připsání' , pl:'Rozbicie naliczeń' },
  historyEmpty:       { uk:'Немає операцій цього місяця', en:'No operations this month', cs:'Žádné operace tento měsíc' , pl:'Brak operacji w tym miesiącu' },
  opAdvance:          { uk:'Аванс',                en:'Advance',             cs:'Záloha' , pl:'Zaliczka' },
  opBonus:            { uk:'Ручний бонус',          en:'Manual bonus',        cs:'Manuální bonus' , pl:'Bonus ręczny' },
  opDebtIssued:       { uk:'Видано борг',           en:'Debt issued',         cs:'Vydaný dluh' , pl:'Udzielono długu' },
  opDebtPaid:         { uk:'Погашення боргу',       en:'Debt repayment',      cs:'Splátka dluhu' , pl:'Spłata długu' },

  editProfile:        { uk:'Редагувати профіль',   en:'Edit profile',        cs:'Upravit profil' , pl:'Edytuj profil' },
  role:                { uk:'Посада',               en:'Role',                cs:'Pozice' , pl:'Stanowisko' },
  rolePlaceholder:     { uk:'напр. Муляр',          en:'e.g. Bricklayer',     cs:'např. Zedník' , pl:'np. Murarz' },
  deleteWorker:        { uk:'Видалити працівника',  en:'Delete worker',       cs:'Smazat pracovníka' , pl:'Usuń pracownika' },
  confirmDeleteWorker: { uk:'Видалити працівника і всі його дані?', en:'Delete worker and all their data?', cs:'Smazat pracovníka a všechna jeho data?' , pl:'Usunąć pracownika i wszystkie jego dane?' },
  moreActions:         { uk:'Ще',                   en:'More',                cs:'Více' , pl:'Więcej' },

  reportTitle:         { uk:'Звіт за',              en:'Report for',         cs:'Report za' , pl:'Raport za' },
  reportTotalGross:    { uk:'Всього нараховано',    en:'Total accrued',      cs:'Celkem připsáno' , pl:'Naliczono łącznie' },
  reportTotalPaid:     { uk:'Всього до виплати',    en:'Total to pay',       cs:'Celkem k výplatě' , pl:'Do wypłaty łącznie' },
  reportTotalDebt:     { uk:'Загальні борги',       en:'Total debts',        cs:'Celkové dluhy' , pl:'Łączne długi' },
  reportByWorker:       { uk:'По працівниках',       en:'By worker',          cs:'Podle pracovníků' , pl:'Według pracowników' },
}

export function t(key, lang) {
  const row = dict[key]
  if (!row) return key
  return row[lang] || row.uk || key
}

export function tMonths(lang) {
  return dict.months[lang] || dict.months.uk
}

export function useLang() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('budcon_lang') || 'uk' } catch { return 'uk' }
  })
  useEffect(() => {
    try { localStorage.setItem('budcon_lang', lang) } catch {}
  }, [lang])
  return [lang, setLang]
}
