// notion.js — BudCon v1
// Проксі: усі запити йдуть через /api/notion (Vercel Serverless),
// токен Notion зберігається на сервері в env NOTION_TOKEN.

const DB = {
  staff:        import.meta.env.VITE_DB_STAFF,
  shifts:       import.meta.env.VITE_DB_SHIFTS,
  advances:     import.meta.env.VITE_DB_ADVANCES,
  bonuses:      import.meta.env.VITE_DB_BONUSES,
  debts:        import.meta.env.VITE_DB_DEBTS,
  debtPayments: import.meta.env.VITE_DB_DEBT_PAYMENTS,
  settings:     import.meta.env.VITE_DB_SETTINGS,
  logs:         import.meta.env.VITE_DB_LOGS,
}

export const OWNER_IDS = (import.meta.env.VITE_OWNER_IDS || '')
  .split(',').map(s => s.trim()).filter(Boolean).map(Number)

// ════════ НИЗЬКОРІВНЕВЕ API ═══════════════════════════════
// Проксі /api/notion приймає {path, method, body} і форвардить у Notion API
async function api({ path, method = 'POST', body }) {
  const res = await fetch('/api/notion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, method, body }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.error) throw new Error(data.error || `Notion API error ${res.status}`)
  return data
}

export async function queryDB(dbId, filter, sorts) {
  if (!dbId) return { results: [] }
  return api({ path: `/databases/${dbId}/query`, method: 'POST', body: { filter, sorts } })
}
export async function createPage(dbId, properties) {
  return api({ path: '/pages', method: 'POST', body: { parent: { database_id: dbId }, properties } })
}
export async function updatePage(pageId, properties) {
  return api({ path: `/pages/${pageId}`, method: 'PATCH', body: { properties } })
}
export async function archivePage(pageId) {
  return api({ path: `/pages/${pageId}`, method: 'PATCH', body: { archived: true } })
}

// ════════ ПАРСЕРИ ВЛАСТИВОСТЕЙ ════════════════════════════
export const p = {
  text:  q => q?.title?.[0]?.plain_text ?? q?.rich_text?.[0]?.plain_text ?? '',
  num:   q => q?.number ?? 0,
  numN:  q => (q?.number === null || q?.number === undefined) ? null : q.number,
  bool:  q => q?.checkbox ?? false,
  date:  q => q?.date?.start ?? null,
}

// ════════ ДАТИ ════════════════════════════════════════════
export function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
export function monthRange(year, month) {
  const start = `${year}-${String(month+1).padStart(2,'0')}-01`
  const lastDay = new Date(year, month+1, 0).getDate()
  const end = `${year}-${String(month+1).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`
  return { start, end }
}
function dateFilter(field, year, month) {
  const { start, end } = monthRange(year, month)
  return { and: [
    { property: field, date: { on_or_after: start } },
    { property: field, date: { on_or_before: end } },
  ]}
}
export function fmt(n) {
  return (Math.round((n||0)*100)/100).toLocaleString('uk-UA', { maximumFractionDigits: 2 })
}
export function fmtH(n) {
  return (Math.round((n||0)*10)/10).toString().replace('.', ',')
}

// ════════ НАЛАШТУВАННЯ ════════════════════════════════════
export const DEFAULT_CFG = {
  lunchBreak: 1,
  workMode: 'mixed',       // 'hours' | 'm2' | 'mixed'
  showHours: true,
  showM2: true,
  remindersOn: true,
  defaultRateHour: 0,
  defaultRateM2: 0,
  currency: 'UAH',
}

export async function fetchSettings() {
  try {
    const r = await queryDB(DB.settings)
    if (!r.results?.length) return DEFAULT_CFG
    const q = r.results[0].properties
    return {
      lunchBreak:      p.num(q['LunchBreak']) ?? DEFAULT_CFG.lunchBreak,
      workMode:        p.text(q['WorkMode']) || DEFAULT_CFG.workMode,
      showHours:       q['ShowHours']?.checkbox ?? DEFAULT_CFG.showHours,
      showM2:          q['ShowM2']?.checkbox ?? DEFAULT_CFG.showM2,
      remindersOn:     q['RemindersOn']?.checkbox ?? DEFAULT_CFG.remindersOn,
      defaultRateHour: p.num(q['DefaultRateHour']) ?? 0,
      defaultRateM2:   p.num(q['DefaultRateM2']) ?? 0,
      currency:        p.text(q['Currency']) || DEFAULT_CFG.currency,
      pageId: r.results[0].id,
    }
  } catch { return DEFAULT_CFG }
}

export async function saveSettings(pageId, cfg) {
  const props = {
    'LunchBreak':      { number: cfg.lunchBreak },
    'WorkMode':        { rich_text:[{ text:{ content: cfg.workMode||'mixed' } }] },
    'ShowHours':       { checkbox: !!cfg.showHours },
    'ShowM2':          { checkbox: !!cfg.showM2 },
    'RemindersOn':     { checkbox: !!cfg.remindersOn },
    'DefaultRateHour': { number: Number(cfg.defaultRateHour)||0 },
    'DefaultRateM2':   { number: Number(cfg.defaultRateM2)||0 },
    'Currency':        { rich_text:[{ text:{ content: cfg.currency||'UAH' } }] },
  }
  if (pageId) return updatePage(pageId, props)
  return createPage(DB.settings, { 'Name':{ title:[{ text:{ content:'Settings' } }] }, ...props })
}

// ════════ ПЕРСОНАЛ ═════════════════════════════════════════
export function parseStaff(r) {
  const q = r.properties
  return {
    id: r.id,
    tgId: p.num(q['TelegramID']),
    name: p.text(q['Name']),
    role: p.text(q['Role']),
    rateHour: p.num(q['RateHour']),
    rateM2:   p.num(q['RateM2']),
  }
}

export async function fetchStaff() {
  const r = await queryDB(DB.staff)
  return r.results.map(parseStaff)
}

export async function addStaff({ tgId, name, role, rateHour, rateM2 }) {
  return createPage(DB.staff, {
    'Name': { title:[{ text:{ content:name||'' } }] },
    'TelegramID': { number: Number(tgId)||0 },
    'Role': { rich_text:[{ text:{ content:role||'' } }] },
    'RateHour': { number: Number(rateHour)||0 },
    'RateM2':   { number: Number(rateM2)||0 },
  })
}

export async function updateStaffRates(pageId, { rateHour, rateM2 }) {
  const props = {}
  if (rateHour !== undefined) props['RateHour'] = { number: Number(rateHour)||0 }
  if (rateM2   !== undefined) props['RateM2']   = { number: Number(rateM2)||0 }
  return updatePage(pageId, props)
}

export async function updateStaffInfo(pageId, { name, tgId, role }) {
  const props = {}
  if (name !== undefined) props['Name'] = { title:[{ text:{ content:name||'' } }] }
  if (tgId !== undefined) props['TelegramID'] = { number: Number(tgId)||0 }
  if (role !== undefined) props['Role'] = { rich_text:[{ text:{ content:role||'' } }] }
  return updatePage(pageId, props)
}

export async function deleteStaff(pageId) { return archivePage(pageId) }

// ════════ ЗМІНИ ════════════════════════════════════════════
export function parseShift(r) {
  const q = r.properties
  return {
    id: r.id,
    tgId: p.num(q['TelegramID']),
    name: p.text(q['Name']),
    date: p.date(q['Date']),
    dateShort: (p.date(q['Date'])||'').slice(0,10),
    hours: p.num(q['Hours']),
    m2: p.num(q['M2']),
    lunchBreak: p.num(q['LunchBreak']),
    rateHour: p.num(q['RateHour']),
    rateM2: p.num(q['RateM2']),
  }
}

export async function fetchShifts(year, month) {
  const r = await queryDB(DB.shifts, dateFilter('Date', year, month),
    [{ property:'Date', direction:'descending' }])
  return r.results.map(parseShift)
}

export async function saveShift({ tgId, name, rateHour, rateM2, date, hours, m2, lunchBreak }) {
  return createPage(DB.shifts, {
    'Name': { title:[{ text:{ content:`${name} ${date}` } }] },
    'TelegramID': { number: Number(tgId)||0 },
    'Date': { date:{ start:date } },
    'Hours': { number: Number(hours)||0 },
    'M2': { number: Number(m2)||0 },
    'LunchBreak': { number: Number(lunchBreak)||0 },
    'RateHour': { number: Number(rateHour)||0 },
    'RateM2': { number: Number(rateM2)||0 },
  })
}

export async function updateShift(pageId, { hours, m2, lunchBreak, date }) {
  const props = {}
  if (hours      !== undefined) props['Hours']      = { number: Number(hours)||0 }
  if (m2         !== undefined) props['M2']         = { number: Number(m2)||0 }
  if (lunchBreak !== undefined) props['LunchBreak'] = { number: Number(lunchBreak)||0 }
  if (date       !== undefined) props['Date']       = { date:{ start:date } }
  return updatePage(pageId, props)
}

export async function deleteShift(pageId) { return archivePage(pageId) }

// ════════ АВАНСИ ═══════════════════════════════════════════
export function parseAdvance(r) {
  const q = r.properties
  return {
    id: r.id,
    tgId: p.num(q['TelegramID']),
    name: p.text(q['Name']),
    date: p.date(q['Date']),
    amount: p.num(q['Amount']),
  }
}

export async function saveAdvance({ tgId, name, date, amount }) {
  return createPage(DB.advances, {
    'Name': { title:[{ text:{ content:`${name} ${date}` } }] },
    'TelegramID': { number: Number(tgId)||0 },
    'Date': { date:{ start:date } },
    'Amount': { number: Number(amount)||0 },
  })
}

// ════════ БОНУСИ (РУЧНІ) ═══════════════════════════════════
export function parseBonus(r) {
  const q = r.properties
  return {
    id: r.id,
    tgId: p.num(q['TelegramID']),
    name: p.text(q['Name']),
    date: p.date(q['Date']),
    amount: p.num(q['Amount']),
  }
}

export async function saveBonus({ tgId, name, date, amount, note }) {
  return createPage(DB.bonuses, {
    'Name': { title:[{ text:{ content:`${name} ${date}` } }] },
    'TelegramID': { number: Number(tgId)||0 },
    'Date': { date:{ start:date } },
    'Amount': { number: Number(amount)||0 },
    'Note': { rich_text:[{ text:{ content:note||'' } }] },
  })
}

// ════════ БОРГИ ════════════════════════════════════════════
export function parseDebt(r) {
  const q = r.properties
  return {
    id: r.id,
    tgId: p.num(q['TelegramID']),
    name: p.text(q['Name']),
    date: p.date(q['Date']),
    amount: p.num(q['Amount']),
  }
}
export function parseDP(r) {
  const q = r.properties
  return {
    id: r.id,
    tgId: p.num(q['TelegramID']),
    name: p.text(q['Name']),
    date: p.date(q['Date']),
    amount: p.num(q['Amount']),
  }
}

export async function addDebt({ tgId, name, date, amount, note }) {
  return createPage(DB.debts, {
    'Name': { title:[{ text:{ content:`${name} ${date}` } }] },
    'TelegramID': { number: Number(tgId)||0 },
    'Date': { date:{ start:date } },
    'Amount': { number: Number(amount)||0 },
    'Note': { rich_text:[{ text:{ content:note||'' } }] },
  })
}

export async function saveDebtPayment({ tgId, name, date, amount }) {
  return createPage(DB.debtPayments, {
    'Name': { title:[{ text:{ content:`${name} ${date}` } }] },
    'TelegramID': { number: Number(tgId)||0 },
    'Date': { date:{ start:date } },
    'Amount': { number: Number(amount)||0 },
  })
}

// ════════ ЛОГИ ═════════════════════════════════════════════
export async function writeLog({ tgId, name, action, details }) {
  try {
    await createPage(DB.logs, {
      'Name': { title:[{ text:{ content:`${name} — ${action}` } }] },
      'TelegramID': { number: Number(tgId)||0 },
      'Action': { rich_text:[{ text:{ content:action||'' } }] },
      'Details': { rich_text:[{ text:{ content:details||'' } }] },
      'Date': { date:{ start: new Date().toISOString() } },
    })
  } catch {}
}

// ════════ ЗАВАНТАЖЕННЯ ВСІХ ДАНИХ ЗА МІСЯЦЬ ═════════════════
export async function fetchAllData(year, month) {
  const df = f => dateFilter(f, year, month)
  const [staff, shifts, advances, bonuses, debts, debtPayments, settings, allDP] = await Promise.all([
    queryDB(DB.staff),
    queryDB(DB.shifts, df('Date'), [{ property:'Date', direction:'descending' }]),
    queryDB(DB.advances, df('Date')),
    queryDB(DB.bonuses, df('Date')),
    queryDB(DB.debts),
    queryDB(DB.debtPayments, df('Date')),
    fetchSettings(),
    queryDB(DB.debtPayments),
  ])
  return {
    staff: staff.results.map(parseStaff),
    shifts: shifts.results.map(parseShift),
    advances: advances.results.map(parseAdvance),
    bonuses: bonuses.results.map(parseBonus),
    debts: debts.results.map(parseDebt),
    debtPayments: debtPayments.results.map(parseDP),
    allDebtPayments: allDP.results.map(parseDP),
    cfg: settings,
  }
}

// ════════ РОЗРАХУНОК ЗАРПЛАТИ ═══════════════════════════════
export function calcSalary(tgId, data) {
  const { staff, shifts, advances, bonuses, debts, debtPayments, allDebtPayments } = data
  const si = staff.find(s => s.tgId === tgId) || {}

  const myShifts = shifts.filter(s => s.tgId === tgId)
    .sort((a,b)=>(a.dateShort||'').localeCompare(b.dateShort||''))

  let totalHours = 0, totalM2 = 0, workDays = 0
  const days = myShifts.map(s => {
    const net = Math.max(0, s.hours - (s.lunchBreak||0))
    totalHours += net
    totalM2 += s.m2||0
    if (net > 0 || (s.m2||0) > 0) workDays++
    return { ...s, net }
  })

  const rateHour = si.rateHour||0
  const rateM2   = si.rateM2||0
  const earnHours = totalHours * rateHour
  const earnM2    = totalM2 * rateM2
  const base = earnHours + earnM2

  const manualBonus = bonuses.filter(b=>b.tgId===tgId).reduce((s,b)=>s+b.amount,0)

  const gross = base + manualBonus

  const totalAdv = advances.filter(a=>a.tgId===tgId).reduce((s,a)=>s+a.amount,0)
  const debtPaidMonth = debtPayments.filter(d=>d.tgId===tgId).reduce((s,d)=>s+d.amount,0)

  const debtTotal = debts.filter(d=>d.tgId===tgId).reduce((s,d)=>s+d.amount,0)
  const debtPaidAll = (allDebtPayments||debtPayments).filter(d=>d.tgId===tgId).reduce((s,d)=>s+d.amount,0)
  const debtRemaining = Math.max(0, debtTotal - debtPaidAll)

  const final = gross - totalAdv - debtPaidMonth

  return {
    tgId, name: si.name||'', role: si.role||'', rateHour, rateM2, staffPageId: si.id,
    totalHours, totalM2, workDays, days,
    earnHours, earnM2, base,
    manualBonus, gross,
    totalAdv, debtPaidMonth, debtRemaining,
    final,
  }
}

export function calcAllWorkers(data) {
  return data.staff.map(s => calcSalary(s.tgId, data))
}
