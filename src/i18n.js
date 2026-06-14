// i18n.js — BudCon, переклади UA / EN / CZ
import { useState, useEffect } from 'react'

export const LANGS = [
  { code: 'uk', label: 'UA', flag: '🇺🇦' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'cs', label: 'CZ', flag: '🇨🇿' },
]

const dict = {
  // ── ЗАГАЛЬНЕ ──────────────────────────────────────────
  appName:        { uk:'BudCon',              en:'BudCon',              cs:'BudCon' },
  loading:        { uk:'Завантаження...',     en:'Loading...',          cs:'Načítání...' },
  save:           { uk:'Зберегти',            en:'Save',                cs:'Uložit' },
  saving:         { uk:'Збереження...',       en:'Saving...',           cs:'Ukládání...' },
  saved:          { uk:'✓ Збережено!',        en:'✓ Saved!',            cs:'✓ Uloženo!' },
  cancel:         { uk:'Скасувати',           en:'Cancel',              cs:'Zrušit' },
  back:           { uk:'Назад',               en:'Back',                cs:'Zpět' },
  delete:         { uk:'Видалити',            en:'Delete',              cs:'Smazat' },
  edit:           { uk:'Редагувати',          en:'Edit',                cs:'Upravit' },
  confirmDelete:  { uk:'Видалити запис?',      en:'Delete this entry?',  cs:'Smazat záznam?' },
  error:          { uk:'Помилка',             en:'Error',               cs:'Chyba' },
  today:          { uk:'Сьогодні',            en:'Today',               cs:'Dnes' },
  hr:             { uk:'год',                 en:'h',                   cs:'h' },
  uah:            { uk:'грн',                 en:'UAH',                 cs:'UAH' },
  m2short:        { uk:'м²',                  en:'m²',                  cs:'m²' },

  months: {
    uk: ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    cs: ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'],
  },

  // ── ВХІД / РОЛІ ───────────────────────────────────────
  notRegistered:  { uk:'Тебе ще не додано в систему.\nЗвернись до власника.',
                    en:'You are not registered yet.\nContact the owner.',
                    cs:'Ještě nejsi registrován.\nKontaktuj majitele.' },
  ownerPanel:     { uk:'Панель власника',     en:'Owner panel',         cs:'Panel majitele' },

  // ── ДАШБОРД ВЛАСНИКА ──────────────────────────────────
  staff:          { uk:'Бригада',             en:'Crew',                cs:'Tým' },
  totalToPay:     { uk:'До виплати всім',     en:'Total to pay',        cs:'Celkem k výplatě' },
  workers:        { uk:'працівників',         en:'workers',             cs:'pracovníků' },
  settingsBtn:    { uk:'⚙️ Налаштування',     en:'⚙️ Settings',          cs:'⚙️ Nastavení' },
  addStaff:       { uk:'➕ Додати працівника', en:'➕ Add worker',        cs:'➕ Přidat pracovníka' },
  rates:          { uk:'✏️ Ставки',            en:'✏️ Rates',             cs:'✏️ Sazby' },

  // ── СТАТИСТИКА ПРАЦІВНИКА ─────────────────────────────
  yourSalary:     { uk:'Твоя зарплата',       en:'Your salary',         cs:'Tvoje mzda' },
  hoursWorked:    { uk:'Відпрацьовано годин', en:'Hours worked',        cs:'Odpracováno hodin' },
  m2Done:         { uk:'Виконано',            en:'Completed',          cs:'Dokončeno' },
  basePay:        { uk:'Базова оплата',       en:'Base pay',            cs:'Základní mzda' },
  bonus:          { uk:'Бонус',               en:'Bonus',               cs:'Bonus' },
  premium:        { uk:'Премія',              en:'Premium',             cs:'Prémie' },
  advancesTotal:  { uk:'Аванси',              en:'Advances',            cs:'Zálohy' },
  debtPaid:       { uk:'Погашено боргу',      en:'Debt paid',           cs:'Splaceno dluhu' },
  debtRemaining:  { uk:'Залишок боргу',       en:'Remaining debt',      cs:'Zbývající dluh' },
  toPay:          { uk:'До виплати',          en:'To pay',              cs:'K výplatě' },
  gross:          { uk:'Нараховано',          en:'Gross',               cs:'Hrubá mzda' },
  workDays:       { uk:'Робочих днів',        en:'Work days',           cs:'Pracovních dní' },

  // ── ЗМІНА (ФОРМА) ─────────────────────────────────────
  newShift:       { uk:'Внести зміну',        en:'Add shift',           cs:'Zadat směnu' },
  shiftType:      { uk:'ТИП',                 en:'TYPE',                cs:'TYP' },
  typeHours:      { uk:'⏱ Години',            en:'⏱ Hours',             cs:'⏱ Hodiny' },
  typeM2:         { uk:'📐 М²',               en:'📐 m²',               cs:'📐 m²' },
  typeMixed:      { uk:'⏱📐 Змішана',          en:'⏱📐 Mixed',           cs:'⏱📐 Smíšená' },
  date:           { uk:'ДАТА',                en:'DATE',                cs:'DATUM' },
  hours:          { uk:'ГОДИНИ',              en:'HOURS',               cs:'HODINY' },
  m2:             { uk:'ПЛОЩА (М²)',          en:'AREA (M²)',           cs:'PLOCHA (M²)' },
  hoursMode:      { uk:'ГОДИНИ',              en:'HOURS',               cs:'HODINY' },
  modeRange:      { uk:'З / По',              en:'From / To',           cs:'Od / Do' },
  modeManual:     { uk:'Кількість',           en:'Quantity',            cs:'Množství' },
  from:           { uk:'З',                   en:'From',                cs:'Od' },
  to:             { uk:'По',                  en:'To',                  cs:'Do' },
  lunchBreakLbl:  { uk:'обід',                en:'lunch break',         cs:'pauza na oběd' },
  perShift:       { uk:'За зміну',            en:'Per shift',           cs:'Za směnu' },
  saveShift:      { uk:'Зберегти зміну',      en:'Save shift',          cs:'Uložit směnu' },
  shiftSaved:     { uk:'✅ Зміну внесено!',    en:'✅ Shift saved!',      cs:'✅ Směna uložena!' },
  enterHoursOrM2: { uk:'Вкажи години або м²', en:'Enter hours or m²',   cs:'Zadej hodiny nebo m²' },
  checkTime:      { uk:'Перевір час початку і кінця', en:'Check start/end time', cs:'Zkontroluj čas od/do' },
  enteredHours:   { uk:'Введено годин',       en:'Entered hours',       cs:'Zadáno hodin' },
  afterLunch:     { uk:'Після обіду',         en:'After lunch break',   cs:'Po obědě' },
  m2Field:        { uk:'м²',                  en:'m²',                  cs:'m²' },
  earned:         { uk:'Зароблено',           en:'Earned',              cs:'Vyděláno' },
  workTime:       { uk:'Час роботи',          en:'Work time',           cs:'Pracovní doba' },

  // ── АВАНС ─────────────────────────────────────────────
  advance:        { uk:'Аванс',               en:'Advance',            cs:'Záloha' },
  newAdvance:     { uk:'💵 Аванс',             en:'💵 Advance',           cs:'💵 Záloha' },
  amount:         { uk:'СУМА',                en:'AMOUNT',              cs:'ČÁSTKA' },
  advanceSaved:   { uk:'✅ Аванс внесено!',    en:'✅ Advance saved!',    cs:'✅ Záloha uložena!' },
  worker:         { uk:'ПРАЦІВНИК',           en:'WORKER',              cs:'PRACOVNÍK' },

  // ── СТАТИСТИКА / ДНІ ──────────────────────────────────
  statistics:     { uk:'📊 Статистика',       en:'📊 Statistics',        cs:'📊 Statistika' },
  payslip:        { uk:'📄 Листок',           en:'📄 Payslip',          cs:'📄 Výplatní páska' },
  days:           { uk:'Дні',                 en:'Days',                cs:'Dny' },
  noEntries:      { uk:'Ще немає записів цього місяця', en:'No entries this month yet', cs:'Zatím žádné záznamy tento měsíc' },

  // ── СТАВКИ / НАЛАШТУВАННЯ ПРАЦІВНИКА ──────────────────
  ratesTitle:     { uk:'✏️ Ставки',            en:'✏️ Rates',             cs:'✏️ Sazby' },
  rateHour:       { uk:'Ставка за годину (грн)', en:'Rate per hour',     cs:'Sazba za hodinu' },
  rateM2:         { uk:'Ставка за м² (грн)',  en:'Rate per m²',         cs:'Sazba za m²' },
  bonusToggle:    { uk:'⭐ Бонуси (10+ год, суботи)', en:'⭐ Bonuses (10+ h, Saturdays)', cs:'⭐ Bonusy (10+ h, soboty)' },
  premiumToggle:  { uk:'🏆 Премія за місяць', en:'🏆 Monthly premium',  cs:'🏆 Měsíční prémie' },
  individualSettings: { uk:'Індивідуальні налаштування', en:'Individual settings', cs:'Individuální nastavení' },
  useGlobal:      { uk:'(порожньо = загальне)', en:'(empty = global)',  cs:'(prázdné = globální)' },

  // ── ГЛОБАЛЬНІ НАЛАШТУВАННЯ ────────────────────────────
  settingsTitle:  { uk:'⚙️ Налаштування',     en:'⚙️ Settings',          cs:'⚙️ Nastavení' },
  minDaysForBonus:{ uk:'Мін днів для бонусу', en:'Min days for bonus',  cs:'Min dní pro bonus' },
  bonusPerLongDay:{ uk:'Бонус за довгий день', en:'Bonus per long day',  cs:'Bonus za dlouhý den' },
  bonusSaturday:  { uk:'Бонус за суботу',     en:'Saturday bonus',      cs:'Bonus za sobotu' },
  premiumDays:    { uk:'Днів для премії',     en:'Days for premium',    cs:'Dní pro prémii' },
  premiumAmount:  { uk:'Сума премії',         en:'Premium amount',      cs:'Výše prémie' },
  longDayHours:   { uk:'Годин — довгий день', en:'Hours — long day',    cs:'Hodin — dlouhý den' },
  longDaysNeeded: { uk:'Потрібно довгих днів',en:'Long days needed',    cs:'Potřeba dlouhých dnů' },
  lunchBreak:     { uk:'Обід (год)',          en:'Lunch break (h)',     cs:'Pauza na oběd (h)' },

  // ── СПИСОК ДНІВ ───────────────────────────────────────
  dayEntry:       { uk:'Запис',               en:'Entry',               cs:'Záznam' },
  noData:         { uk:'Немає даних',         en:'No data',             cs:'Žádná data' },

  // ── БОНУСИ / БОРГИ (РУЧНІ) ────────────────────────────
  addBonus:       { uk:'➕ Бонус',             en:'➕ Bonus',             cs:'➕ Bonus' },
  bonusNote:      { uk:'Примітка',            en:'Note',                cs:'Poznámka' },
  bonusSaved:     { uk:'✅ Бонус додано!',     en:'✅ Bonus added!',     cs:'✅ Bonus přidán!' },
  issueDebt:      { uk:'📝 Видати борг',       en:'📝 Issue debt',        cs:'📝 Vydat dluh' },
  debtSaved:      { uk:'✅ Борг додано!',      en:'✅ Debt added!',      cs:'✅ Dluh přidán!' },
  payDebt:        { uk:'💳 Погасити борг',     en:'💳 Repay debt',        cs:'💳 Splatit dluh' },
  debtPaymentSaved:{ uk:'✅ Погашення внесено!', en:'✅ Payment recorded!', cs:'✅ Splátka zaznamenána!' },
  manualBonusLbl: { uk:'Ручні бонуси',        en:'Manual bonuses',      cs:'Manuální bonusy' },

  // ── ПЕРСОНАЛ ──────────────────────────────────────────
  workerName:     { uk:'Імʼя',                en:'Name',                cs:'Jméno' },
  telegramId:     { uk:'Telegram ID',         en:'Telegram ID',         cs:'Telegram ID' },
  staffSaved:     { uk:'✅ Працівника додано!', en:'✅ Worker added!',    cs:'✅ Pracovník přidán!' },
  noWorkers:      { uk:'Поки немає працівників', en:'No workers yet',   cs:'Zatím žádní pracovníci' },
  totalFinal:     { uk:'Разом до виплати',    en:'Total to pay',        cs:'Celkem k výplatě' },
  tapToOpen:      { uk:'натисни щоб відкрити', en:'tap to open',         cs:'klepnutím otevřeš' },
  settingsSaved:  { uk:'✅ Налаштування збережено!', en:'✅ Settings saved!', cs:'✅ Nastavení uloženo!' },
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
