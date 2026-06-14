import { useState, useEffect, useCallback } from 'react'
import { t, tMonths, useLang, LANGS } from './i18n.js'
import {
  OWNER_IDS, fetchAllData, saveSettings, calcSalary, calcAllWorkers,
  fmt, fmtH, todayStr,
  saveShift, updateShift, deleteShift,
  saveAdvance, saveBonus, addDebt, saveDebtPayment,
  addStaff, updateStaffRates, updateStaffToggles, writeLog,
} from './notion.js'

// ════════════════════════════════════════════════════════
// КОЛЬОРОВА СХЕМА — чорно-біло-сіра
// ════════════════════════════════════════════════════════
const C = {
  bg:       '#000000',
  surface:  '#1a1a1c',
  surface2: '#242426',
  border:   'rgba(255,255,255,0.18)',
  border2:  'rgba(255,255,255,0.08)',
  text:     '#ffffff',
  dim:      '#9b9ba3',
  muted:    '#56565c',
  accent:   '#ffffff',
  green:    '#4ade80',
  red:      '#f87171',
}

// ════════════════════════════════════════════════════════
// TELEGRAM HELPERS
// ════════════════════════════════════════════════════════
function getTelegramUser() {
  try {
    const tg = window.Telegram?.WebApp
    tg?.ready?.()
    tg?.expand?.()
    const u = tg?.initDataUnsafe?.user
    if (u) return { id: u.id, name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'User' }
  } catch {}
  return { id: 0, name: 'Dev' }
}

function vibrate(type) {
  try {
    const tg = window.Telegram?.WebApp
    if (!tg?.HapticFeedback) return
    if (type === 'success' || type === 'error') tg.HapticFeedback.notificationOccurred(type)
    else tg.HapticFeedback.impactOccurred(type || 'light')
  } catch {}
}

// ════════════════════════════════════════════════════════
// СПІЛЬНІ UI-ЕЛЕМЕНТИ
// ════════════════════════════════════════════════════════
const inp = {
  width: '100%', background: C.surface2, border: `1px solid ${C.border}`,
  borderRadius: 10, padding: '12px 14px', fontSize: 14, color: C.text,
  fontFamily: 'inherit', boxSizing: 'border-box',
}

const primaryBtn = { background: C.text, color: '#000', border: 'none', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }
const secondaryBtn = { background: 'transparent', color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const workerCardStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 12, cursor: 'pointer' }

const Card = ({ children, top, style = {} }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border2}`,
    borderTop: top ? `2px solid ${top}` : `1px solid ${C.border2}`,
    borderRadius: 14, padding: 14, ...style,
  }}>{children}</div>
)

const Lbl = ({ children, style = {} }) => (
  <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', ...style }}>{children}</div>
)

const Row = ({ label, value, color = C.text, bold = false, last = false }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '7px 0', borderBottom: last ? 'none' : `1px solid ${C.border2}`,
  }}>
    <span style={{ fontSize: 13, color: C.dim }}>{label}</span>
    <span style={{ fontSize: bold ? 16 : 13, fontWeight: bold ? 800 : 600, color }}>{value}</span>
  </div>
)

function Toggle({ on, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
      padding: '12px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
      border: `1px solid ${on ? C.text : C.border2}`,
      background: on ? 'rgba(255,255,255,0.08)' : 'transparent',
    }}>
      <span style={{ fontSize: 13, color: on ? C.text : C.dim, fontWeight: on ? 700 : 400 }}>{label}</span>
      <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? C.text : C.border, position: 'relative', transition: 'all .2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: on ? '#000' : C.dim, transition: 'all .2s' }} />
      </div>
    </button>
  )
}

function Sheet({ onClose, title, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#0a0a0b', border: `1px solid ${C.border}`, borderBottom: 'none', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: '18px 18px 28px', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${C.border2}`, borderRadius: 8, width: 30, height: 30, color: C.dim, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function LangSwitcher({ lang, setLang }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {LANGS.map(l => (
        <button key={l.code} onClick={() => setLang(l.code)} style={{
          padding: '5px 9px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
          border: `1px solid ${lang === l.code ? C.text : C.border2}`,
          background: lang === l.code ? C.text : 'transparent',
          color: lang === l.code ? '#000' : C.dim,
        }}>{l.label}</button>
      ))}
    </div>
  )
}

function Header({ title, sub, onBack, lang, setLang }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 10, background: C.bg, borderBottom: `1px solid ${C.border2}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: 'transparent', border: `1px solid ${C.border2}`, borderRadius: 8, width: 34, height: 34, color: C.text, fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>←</button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{sub}</div>}
      </div>
      {lang !== undefined && setLang && <LangSwitcher lang={lang} setLang={setLang} />}
    </div>
  )
}

function MonthPicker({ year, month, onChange, lang }) {
  const months = tMonths(lang)
  function prev() { let y = year, m = month - 1; if (m < 0) { m = 11; y-- } onChange(y, m) }
  function next() { let y = year, m = month + 1; if (m > 11) { m = 0; y++ } onChange(y, m) }
  const navBtn = { background: 'transparent', border: `1px solid ${C.border2}`, borderRadius: 8, width: 32, height: 32, color: C.text, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 12, padding: '10px 12px' }}>
      <button onClick={prev} style={navBtn}>‹</button>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{months[month]} {year}</div>
      <button onClick={next} style={navBtn}>›</button>
    </div>
  )
}

function LoadingScreen({ lang }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim, fontSize: 14, fontFamily: 'system-ui,sans-serif' }}>
      {t('loading', lang)}
    </div>
  )
}

function NotRegisteredScreen({ lang, setLang, tgId }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ position: 'absolute', top: 16, right: 16 }}><LangSwitcher lang={lang} setLang={setLang} /></div>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🏗️</div>
      <div style={{ color: C.text, fontSize: 15, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{t('notRegistered', lang)}</div>
      <div style={{ color: C.muted, fontSize: 12, marginTop: 16 }}>ID: {tgId}</div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// ФОРМА ЗМІНИ
// ════════════════════════════════════════════════════════
function ShiftForm({ worker, allWorkers, isOwner, onClose, onSaved, tgId, tgName, cfg, lang }) {
  const lb = cfg?.lunchBreak ?? 1
  const [selId, setSelId] = useState(worker?.tgId || tgId)
  const [type, setType] = useState('hours')
  const [hoursMode, setHoursMode] = useState('range')
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [date, setDate] = useState(todayStr())
  const [hours, setHours] = useState('')
  const [m2, setM2] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const sel = isOwner ? (allWorkers.find(w => w.tgId === Number(selId)) || worker) : worker

  function parseTime(s) {
    if (!s) return null
    const str = String(s).trim()
    if (str.includes(':')) { const [h, m] = str.split(':').map(Number); return h + (m || 0) / 60 }
    if (str.includes('.')) {
      const [h, m] = str.split('.').map(Number)
      if ((m || 0) < 6) return parseFloat(str)
      return h + (m || 0) / 60
    }
    const n = parseFloat(str)
    if (!isNaN(n)) { if (n >= 100) return Math.floor(n / 100) + (n % 100) / 60; return n }
    return null
  }

  const fromH = parseTime(timeFrom)
  const toH = parseTime(timeTo)
  const rangeH = (fromH !== null && toH !== null && toH > fromH) ? Math.round((toH - fromH) * 10) / 10 : null
  const rawH = hoursMode === 'range' ? (rangeH || 0) : (parseFloat(hours) || 0)
  const effLb = hoursMode === 'range' ? lb : 0
  const actualH = Math.max(0, rawH - effLb)
  const earn = actualH * (sel?.rateHour || 0) + (parseFloat(m2) || 0) * (sel?.rateM2 || 0)

  async function submit(e) {
    e.preventDefault()
    const h = type === 'm2' ? 0 : rawH
    const mm = type === 'hours' ? 0 : (parseFloat(m2) || 0)
    if (!h && !mm) { setError(t('enterHoursOrM2', lang)); return }
    if (hoursMode === 'range' && rangeH === null && type !== 'm2') { setError(t('checkTime', lang)); return }
    try {
      setLoading(true); setError(null)
      await saveShift({ tgId: sel.tgId, name: sel.name, rateHour: sel.rateHour || 0, rateM2: sel.rateM2 || 0, date, hours: h, m2: mm, lunchBreak: effLb })
      const detail = hoursMode === 'range' && timeFrom && timeTo
        ? `${date}: ${timeFrom}–${timeTo} (${fmtH(h)}${t('hr', lang)}) ${mm ? mm + t('m2short', lang) : ''}`
        : `${date}: ${h}${t('hr', lang)} ${mm ? mm + t('m2short', lang) : ''}`
      await writeLog({ tgId: isOwner ? tgId : sel.tgId, name: sel.name, action: 'Shift', details: detail })
      vibrate('success')
      setResult({ hours: h, actualH: Math.max(0, h - effLb), m2: mm, earned: Math.max(0, h - effLb) * (sel.rateHour || 0) + mm * (sel.rateM2 || 0), date, timeFrom, timeTo, lbApplied: effLb })
      setSuccess(true)
      setTimeout(() => { onSaved(); onClose() }, 1800)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  if (success && result) return (
    <Sheet onClose={onClose} title={t('shiftSaved', lang)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>📅 {result.date}</div>
          {result.hours > 0 && <>
            {result.timeFrom && result.timeTo && <Row label={t('workTime', lang)} value={`${result.timeFrom} – ${result.timeTo}`} color={C.dim} />}
            <Row label={t('enteredHours', lang)} value={`${fmtH(result.hours)} ${t('hr', lang)}`} color={C.dim} />
            {result.lbApplied > 0 && <Row label={`${t('afterLunch', lang)} (-${result.lbApplied} ${t('hr', lang)})`} value={`${fmtH(result.actualH)} ${t('hr', lang)}`} color={C.text} />}
          </>}
          {result.m2 > 0 && <Row label={t('m2Field', lang)} value={`${result.m2} ${t('m2short', lang)}`} color={C.text} />}
          <Row label={t('earned', lang)} value={`${fmt(result.earned)} ${t('uah', lang)}`} color={C.green} bold last />
        </div>
      </div>
    </Sheet>
  )

  return (
    <Sheet onClose={onClose} title={t('newShift', lang)}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {isOwner && allWorkers?.length > 1 && (
          <div>
            <Lbl>{t('worker', lang)}</Lbl>
            <select value={selId} onChange={e => setSelId(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              {allWorkers.map(w => <option key={w.tgId} value={w.tgId}>{w.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <Lbl>{t('shiftType', lang)}</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[['hours', t('typeHours', lang)], ['m2', t('typeM2', lang)], ['mixed', t('typeMixed', lang)]].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setType(k)} style={{
                padding: '10px 4px', borderRadius: 8, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
                fontWeight: type === k ? 800 : 400,
                border: `1px solid ${type === k ? C.text : C.border2}`,
                background: type === k ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: type === k ? C.text : C.dim,
              }}>{l}</button>
            ))}
          </div>
        </div>

        <div><Lbl>{t('date', lang)}</Lbl>
          <input type="date" value={date} max={todayStr()} onChange={e => setDate(e.target.value)} style={inp} />
        </div>

        {type !== 'm2' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Lbl style={{ margin: 0 }}>{t('hoursMode', lang)}</Lbl>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['range', t('modeRange', lang)], ['manual', t('modeManual', lang)]].map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setHoursMode(k)} style={{
                    padding: '4px 12px', borderRadius: 20, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
                    border: `1px solid ${hoursMode === k ? C.text : C.border2}`,
                    background: hoursMode === k ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: hoursMode === k ? C.text : C.dim,
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {hoursMode === 'range' ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>{t('from', lang)}</div>
                  <input value={timeFrom} onChange={e => setTimeFrom(e.target.value)} placeholder="7 / 7:00" style={inp} inputMode="decimal" />
                </div>
                <div style={{ color: C.dim, fontSize: 18, paddingTop: 18 }}>→</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>{t('to', lang)}</div>
                  <input value={timeTo} onChange={e => setTimeTo(e.target.value)} placeholder="17 / 17:00" style={inp} inputMode="decimal" />
                </div>
              </div>
            ) : (
              <input type="number" inputMode="decimal" step="0.5" min="0" max="24" value={hours} onChange={e => setHours(e.target.value)} placeholder="10" style={inp} />
            )}

            {rawH > 0 && (
              <div style={{ fontSize: 11, color: C.text, marginTop: 6, padding: '6px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}>
                {hoursMode === 'range'
                  ? <>{fmtH(rangeH)} {t('hr', lang)} − {lb} {t('lunchBreakLbl', lang)} = <b>{fmtH(actualH)} {t('hr', lang)}</b> · {fmt(actualH * (sel?.rateHour || 0))} {t('uah', lang)}</>
                  : <><b>{fmtH(actualH)} {t('hr', lang)}</b> · {fmt(actualH * (sel?.rateHour || 0))} {t('uah', lang)}</>}
              </div>
            )}
          </div>
        )}

        {type !== 'hours' && (
          <div><Lbl>{t('m2', lang)}</Lbl>
            <input type="number" inputMode="decimal" min="0" step="0.1" value={m2} onChange={e => setM2(e.target.value)} placeholder="напр. 25" style={inp} />
            {m2 && (sel?.rateM2 || 0) > 0 && <div style={{ fontSize: 11, color: C.text, marginTop: 4 }}>= {fmt(parseFloat(m2) * (sel?.rateM2 || 0))} {t('uah', lang)}</div>}
          </div>
        )}

        {earn > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: C.dim }}>{t('perShift', lang)}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{fmt(earn)} {t('uah', lang)}</span>
          </div>
        )}

        {error && <div style={{ color: C.red, fontSize: 12, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 8 }}>⚠ {error}</div>}
        <button type="submit" disabled={loading} style={{ background: C.text, color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
          {loading ? t('saving', lang) : t('saveShift', lang)}
        </button>
      </form>
    </Sheet>
  )
}

// ════════════════════════════════════════════════════════
// ФОРМА АВАНСУ
// ════════════════════════════════════════════════════════
function AdvanceForm({ worker, allWorkers, isOwner, onClose, onSaved, tgId, tgName, lang }) {
  const [selId, setSelId] = useState(worker?.tgId || tgId)
  const [date, setDate] = useState(todayStr())
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const sel = isOwner ? (allWorkers.find(w => w.tgId === Number(selId)) || worker) : worker

  async function submit(e) {
    e.preventDefault()
    const a = parseFloat(amount) || 0
    if (!a) { setError(t('amount', lang)); return }
    try {
      setLoading(true); setError(null)
      await saveAdvance({ tgId: sel.tgId, name: sel.name, date, amount: a })
      await writeLog({ tgId: isOwner ? tgId : sel.tgId, name: sel.name, action: 'Advance', details: `${date}: ${a} ${t('uah', lang)}` })
      vibrate('success')
      setSuccess(true)
      setTimeout(() => { onSaved(); onClose() }, 1300)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  if (success) return (
    <Sheet onClose={onClose} title={t('advanceSaved', lang)}>
      <div style={{ textAlign: 'center', padding: 20, fontSize: 22, fontWeight: 800, color: C.green }}>{fmt(amount)} {t('uah', lang)}</div>
    </Sheet>
  )

  return (
    <Sheet onClose={onClose} title={t('newAdvance', lang)}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {isOwner && allWorkers?.length > 1 && (
          <div><Lbl>{t('worker', lang)}</Lbl>
            <select value={selId} onChange={e => setSelId(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              {allWorkers.map(w => <option key={w.tgId} value={w.tgId}>{w.name}</option>)}
            </select>
          </div>
        )}
        <div><Lbl>{t('date', lang)}</Lbl><input type="date" value={date} max={todayStr()} onChange={e => setDate(e.target.value)} style={inp} /></div>
        <div><Lbl>{t('amount', lang)}</Lbl><input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" style={inp} /></div>
        {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: C.text, color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? t('saving', lang) : t('save', lang)}
        </button>
      </form>
    </Sheet>
  )
}

// ════════════════════════════════════════════════════════
// ФОРМА БОНУСУ (РУЧНОГО)
// ════════════════════════════════════════════════════════
function BonusForm({ worker, onClose, onSaved, tgId, lang }) {
  const [date, setDate] = useState(todayStr())
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    const a = parseFloat(amount) || 0
    if (!a) return
    try {
      setLoading(true); setError(null)
      await saveBonus({ tgId: worker.tgId, name: worker.name, date, amount: a, note })
      await writeLog({ tgId, name: worker.name, action: 'Bonus', details: `${date}: ${a} ${t('uah', lang)}${note ? ' — ' + note : ''}` })
      vibrate('success'); setSuccess(true)
      setTimeout(() => { onSaved(); onClose() }, 1300)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  if (success) return (
    <Sheet onClose={onClose} title={t('bonusSaved', lang)}>
      <div style={{ textAlign: 'center', padding: 20, fontSize: 22, fontWeight: 800, color: C.green }}>+{fmt(amount)} {t('uah', lang)}</div>
    </Sheet>
  )

  return (
    <Sheet onClose={onClose} title={`${t('addBonus', lang)} — ${worker.name}`}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><Lbl>{t('date', lang)}</Lbl><input type="date" value={date} max={todayStr()} onChange={e => setDate(e.target.value)} style={inp} /></div>
        <div><Lbl>{t('amount', lang)}</Lbl><input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500" style={inp} /></div>
        <div><Lbl>{t('bonusNote', lang)}</Lbl><input value={note} onChange={e => setNote(e.target.value)} style={inp} /></div>
        {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: C.text, color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? t('saving', lang) : t('save', lang)}
        </button>
      </form>
    </Sheet>
  )
}

// ════════════════════════════════════════════════════════
// ФОРМА БОРГУ (ВИДАТИ / ПОГАСИТИ)
// ════════════════════════════════════════════════════════
function DebtForm({ worker, mode, onClose, onSaved, tgId, lang }) {
  // mode: 'issue' | 'pay'
  const [date, setDate] = useState(todayStr())
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    const a = parseFloat(amount) || 0
    if (!a) return
    try {
      setLoading(true); setError(null)
      if (mode === 'issue') {
        await addDebt({ tgId: worker.tgId, name: worker.name, date, amount: a, note })
        await writeLog({ tgId, name: worker.name, action: 'Debt issued', details: `${date}: ${a} ${t('uah', lang)}${note ? ' — ' + note : ''}` })
      } else {
        await saveDebtPayment({ tgId: worker.tgId, name: worker.name, date, amount: a })
        await writeLog({ tgId, name: worker.name, action: 'Debt payment', details: `${date}: ${a} ${t('uah', lang)}` })
      }
      vibrate('success'); setSuccess(true)
      setTimeout(() => { onSaved(); onClose() }, 1300)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  if (success) return (
    <Sheet onClose={onClose} title={mode === 'issue' ? t('debtSaved', lang) : t('debtPaymentSaved', lang)}>
      <div style={{ textAlign: 'center', padding: 20, fontSize: 22, fontWeight: 800, color: mode === 'issue' ? C.red : C.green }}>{mode === 'issue' ? '+' : '−'}{fmt(amount)} {t('uah', lang)}</div>
    </Sheet>
  )

  return (
    <Sheet onClose={onClose} title={`${mode === 'issue' ? t('issueDebt', lang) : t('payDebt', lang)} — ${worker.name}`}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><Lbl>{t('date', lang)}</Lbl><input type="date" value={date} max={todayStr()} onChange={e => setDate(e.target.value)} style={inp} /></div>
        <div><Lbl>{t('amount', lang)}</Lbl><input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" style={inp} /></div>
        {mode === 'issue' && <div><Lbl>{t('bonusNote', lang)}</Lbl><input value={note} onChange={e => setNote(e.target.value)} style={inp} /></div>}
        {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: C.text, color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? t('saving', lang) : t('save', lang)}
        </button>
      </form>
    </Sheet>
  )
}

// ════════════════════════════════════════════════════════
// ФОРМА СТАВОК + ІНДИВІДУАЛЬНІ НАЛАШТУВАННЯ
// ════════════════════════════════════════════════════════
function RatesForm({ worker, onClose, onSaved, lang }) {
  const [rateHour, setRateHour] = useState(worker.rateHour || '')
  const [rateM2, setRateM2] = useState(worker.rateM2 || '')
  const [bonusOff, setBonusOff] = useState(worker.bonusOff || false)
  const [premiumOff, setPremiumOff] = useState(worker.premiumOff || false)
  const [showInd, setShowInd] = useState(false)
  const [ind, setInd] = useState({ ...worker.ind })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const indFields = [
    ['minDaysForBonus', t('minDaysForBonus', lang)],
    ['bonusPerLongDay', t('bonusPerLongDay', lang)],
    ['bonusSaturday', t('bonusSaturday', lang)],
    ['premiumDays', t('premiumDays', lang)],
    ['premiumAmount', t('premiumAmount', lang)],
    ['longDayHours', t('longDayHours', lang)],
    ['longDaysNeeded', t('longDaysNeeded', lang)],
  ]

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true); setError(null)
      await updateStaffRates(worker.staffPageId, { rateHour, rateM2 })
      await updateStaffToggles(worker.staffPageId, { bonusOff, premiumOff, ind })
      vibrate('success'); setSuccess(true)
      setTimeout(() => { onSaved(); onClose() }, 1100)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <Sheet onClose={onClose} title={`${t('ratesTitle', lang)} — ${worker.name}`}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><Lbl>{t('rateHour', lang)}</Lbl><input type="number" inputMode="decimal" value={rateHour} onChange={e => setRateHour(e.target.value)} style={inp} /></div>
        <div><Lbl>{t('rateM2', lang)}</Lbl><input type="number" inputMode="decimal" value={rateM2} onChange={e => setRateM2(e.target.value)} style={inp} /></div>

        <Toggle on={!bonusOff} onClick={() => { vibrate('light'); setBonusOff(v => !v) }} label={t('bonusToggle', lang)} />
        <Toggle on={!premiumOff} onClick={() => { vibrate('light'); setPremiumOff(v => !v) }} label={t('premiumToggle', lang)} />

        <button type="button" onClick={() => setShowInd(v => !v)} style={{ background: 'transparent', border: `1px solid ${C.border2}`, borderRadius: 10, padding: 10, color: C.dim, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          {showInd ? '▲' : '▼'} {t('individualSettings', lang)}
        </button>

        {showInd && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: C.surface2, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 11, color: C.muted }}>{t('useGlobal', lang)}</div>
            {indFields.map(([k, l]) => (
              <div key={k}>
                <Lbl style={{ marginBottom: 4 }}>{l}</Lbl>
                <input type="number" inputMode="decimal" value={ind[k] ?? ''} onChange={e => setInd(prev => ({ ...prev, [k]: e.target.value === '' ? null : e.target.value }))} style={{ ...inp, padding: '8px 12px' }} />
              </div>
            ))}
          </div>
        )}

        {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: success ? C.green : C.text, color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? t('saving', lang) : success ? t('saved', lang) : t('save', lang)}
        </button>
      </form>
    </Sheet>
  )
}

// ════════════════════════════════════════════════════════
// ФОРМА ДОДАВАННЯ ПРАЦІВНИКА
// ════════════════════════════════════════════════════════
function AddStaffForm({ onClose, onSaved, lang }) {
  const [name, setName] = useState('')
  const [tgId, setTgId] = useState('')
  const [rateHour, setRateHour] = useState('')
  const [rateM2, setRateM2] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    if (!name || !tgId) { setError(t('workerName', lang) + ' / ' + t('telegramId', lang)); return }
    try {
      setLoading(true); setError(null)
      await addStaff({ tgId, name, rateHour, rateM2 })
      vibrate('success'); setSuccess(true)
      setTimeout(() => { onSaved(); onClose() }, 1100)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  if (success) return (
    <Sheet onClose={onClose} title={t('staffSaved', lang)}>
      <div style={{ textAlign: 'center', padding: 20, fontSize: 18, fontWeight: 800, color: C.green }}>{name}</div>
    </Sheet>
  )

  return (
    <Sheet onClose={onClose} title={t('addStaff', lang)}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><Lbl>{t('workerName', lang)}</Lbl><input value={name} onChange={e => setName(e.target.value)} style={inp} /></div>
        <div><Lbl>{t('telegramId', lang)}</Lbl><input type="number" inputMode="numeric" value={tgId} onChange={e => setTgId(e.target.value)} style={inp} /></div>
        <div><Lbl>{t('rateHour', lang)}</Lbl><input type="number" inputMode="decimal" value={rateHour} onChange={e => setRateHour(e.target.value)} style={inp} /></div>
        <div><Lbl>{t('rateM2', lang)}</Lbl><input type="number" inputMode="decimal" value={rateM2} onChange={e => setRateM2(e.target.value)} style={inp} /></div>
        {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: C.text, color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? t('saving', lang) : t('save', lang)}
        </button>
      </form>
    </Sheet>
  )
}

// ════════════════════════════════════════════════════════
// ГЛОБАЛЬНІ НАЛАШТУВАННЯ
// ════════════════════════════════════════════════════════
function SettingsForm({ cfg, onClose, onSaved, lang }) {
  const [vals, setVals] = useState({ ...cfg })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const fields = [
    ['minDaysForBonus', t('minDaysForBonus', lang)],
    ['bonusPerLongDay', t('bonusPerLongDay', lang)],
    ['bonusSaturday', t('bonusSaturday', lang)],
    ['premiumDays', t('premiumDays', lang)],
    ['premiumAmount', t('premiumAmount', lang)],
    ['longDayHours', t('longDayHours', lang)],
    ['longDaysNeeded', t('longDaysNeeded', lang)],
    ['lunchBreak', t('lunchBreak', lang)],
  ]

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true); setError(null)
      const numeric = {}
      for (const [k] of fields) numeric[k] = Number(vals[k]) || 0
      await saveSettings(cfg.pageId, numeric)
      vibrate('success'); setSuccess(true)
      setTimeout(() => { onSaved(); onClose() }, 1100)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <Sheet onClose={onClose} title={t('settingsTitle', lang)}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {fields.map(([k, l]) => (
          <div key={k}><Lbl>{l}</Lbl><input type="number" inputMode="decimal" value={vals[k] ?? ''} onChange={e => setVals(prev => ({ ...prev, [k]: e.target.value }))} style={inp} /></div>
        ))}
        {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: success ? C.green : C.text, color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          {loading ? t('saving', lang) : success ? t('settingsSaved', lang) : t('save', lang)}
        </button>
      </form>
    </Sheet>
  )
}

// ════════════════════════════════════════════════════════
// РЕДАГУВАННЯ ЗАПИСУ ДНЯ
// ════════════════════════════════════════════════════════
function EditDayForm({ day, worker, onClose, onSaved, lang }) {
  const [date, setDate] = useState(day.dateShort)
  const [hours, setHours] = useState(day.hours || '')
  const [m2, setM2] = useState(day.m2 || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    try {
      setLoading(true); setError(null)
      await updateShift(day.id, { hours: parseFloat(hours) || 0, m2: parseFloat(m2) || 0, lunchBreak: day.lunchBreak || 0, date })
      vibrate('success')
      onSaved(); onClose()
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  async function del() {
    if (!confirm(t('confirmDelete', lang))) return
    try {
      setLoading(true)
      await deleteShift(day.id)
      vibrate('medium')
      onSaved(); onClose()
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <Sheet onClose={onClose} title={`${t('edit', lang)} — ${date}`}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><Lbl>{t('date', lang)}</Lbl><input type="date" value={date} max={todayStr()} onChange={e => setDate(e.target.value)} style={inp} /></div>
        <div><Lbl>{t('hours', lang)} {day.lunchBreak > 0 ? `(−${day.lunchBreak} ${t('lunchBreakLbl', lang)})` : ''}</Lbl><input type="number" inputMode="decimal" step="0.5" value={hours} onChange={e => setHours(e.target.value)} style={inp} /></div>
        <div><Lbl>{t('m2', lang)}</Lbl><input type="number" inputMode="decimal" step="0.1" value={m2} onChange={e => setM2(e.target.value)} style={inp} /></div>
        {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={del} disabled={loading} style={{ flex: 1, background: 'transparent', border: `1px solid ${C.red}`, color: C.red, borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t('delete', lang)}</button>
          <button type="submit" disabled={loading} style={{ flex: 2, background: C.text, color: '#000', border: 'none', borderRadius: 10, padding: 14, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>{loading ? t('saving', lang) : t('save', lang)}</button>
        </div>
      </form>
    </Sheet>
  )
}

// ════════════════════════════════════════════════════════
// СПИСОК ДНІВ
// ════════════════════════════════════════════════════════
function DaysExpand({ days, rateHour, rateM2, onEdit, lang }) {
  if (!days?.length) return <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, padding: 16 }}>{t('noEntries', lang)}</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {days.slice().reverse().map(d => {
        const earned = d.net * rateHour + (d.m2 || 0) * rateM2
        return (
          <div key={d.id} onClick={() => onEdit?.(d)} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 10px', borderRadius: 8, background: C.surface2, cursor: onEdit ? 'pointer' : 'default',
          }}>
            <div style={{ fontSize: 12, color: C.dim }}>{d.dateShort.split('-').reverse().join('.')}</div>
            <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
              {d.net > 0 && <span style={{ color: C.text }}>{fmtH(d.net)} {t('hr', lang)}</span>}
              {d.m2 > 0 && <span style={{ color: C.text }}>{fmt(d.m2)} {t('m2short', lang)}</span>}
              <span style={{ color: C.green, fontWeight: 700 }}>{fmt(earned)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// КАРТКА ЗАРПЛАТИ
// ════════════════════════════════════════════════════════
function SalaryCard({ w, lang }) {
  return (
    <Card top="#fff">
      <Lbl>{w.name}</Lbl>
      <Row label={t('hoursWorked', lang)} value={`${fmtH(w.totalHours)} ${t('hr', lang)}`} />
      {w.totalM2 > 0 && <Row label={t('m2Done', lang)} value={`${fmt(w.totalM2)} ${t('m2short', lang)}`} />}
      <Row label={t('workDays', lang)} value={w.workDays} />
      <Row label={t('basePay', lang)} value={`${fmt(w.base)} ${t('uah', lang)}`} />
      {w.bonusActive && (w.bonusLong > 0 || w.bonusSat > 0) && (
        <Row label={t('bonus', lang)} value={`+${fmt(w.bonusLong + w.bonusSat)} ${t('uah', lang)}`} color={C.green} />
      )}
      {w.premium > 0 && <Row label={t('premium', lang)} value={`+${fmt(w.premium)} ${t('uah', lang)}`} color={C.green} />}
      {w.manualBonus > 0 && <Row label={t('manualBonusLbl', lang)} value={`+${fmt(w.manualBonus)} ${t('uah', lang)}`} color={C.green} />}
      <Row label={t('gross', lang)} value={`${fmt(w.gross)} ${t('uah', lang)}`} bold />
      {w.totalAdv > 0 && <Row label={t('advancesTotal', lang)} value={`−${fmt(w.totalAdv)} ${t('uah', lang)}`} color={C.red} />}
      {w.debtPaidMonth > 0 && <Row label={t('debtPaid', lang)} value={`−${fmt(w.debtPaidMonth)} ${t('uah', lang)}`} color={C.red} />}
      <Row label={t('toPay', lang)} value={`${fmt(w.final)} ${t('uah', lang)}`} color={C.green} bold last />
      {w.debtRemaining > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: C.red, padding: '8px 10px', background: 'rgba(248,113,113,0.08)', borderRadius: 8 }}>
          {t('debtRemaining', lang)}: {fmt(w.debtRemaining)} {t('uah', lang)}
        </div>
      )}
    </Card>
  )
}

// ════════════════════════════════════════════════════════
// ПОГЛЯД ПРАЦІВНИКА (СВІЙ)
// ════════════════════════════════════════════════════════
function WorkerView({ data, tgId, tgName, year, month, onMonthChange, onRefresh, lang, setLang }) {
  const w = calcSalary(tgId, data)
  const [modal, setModal] = useState(null)
  const [editDay, setEditDay] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 40, fontFamily: 'system-ui,sans-serif' }}>
      <Header title={`👋 ${w.name || tgName}`} sub={t('appName', lang)} lang={lang} setLang={setLang} />
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MonthPicker year={year} month={month} onChange={onMonthChange} lang={lang} />
        <SalaryCard w={w} lang={lang} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => setModal('shift')} style={primaryBtn}>{t('newShift', lang)}</button>
          <button onClick={() => setModal('advance')} style={secondaryBtn}>{t('newAdvance', lang)}</button>
        </div>
        <Card>
          <Lbl>{t('days', lang)}</Lbl>
          <DaysExpand days={w.days} rateHour={w.rateHour} rateM2={w.rateM2} onEdit={setEditDay} lang={lang} />
        </Card>
      </div>

      {modal === 'shift' && <ShiftForm worker={w} allWorkers={[w]} isOwner={false} onClose={() => setModal(null)} onSaved={onRefresh} tgId={tgId} tgName={tgName} cfg={data.cfg} lang={lang} />}
      {modal === 'advance' && <AdvanceForm worker={w} allWorkers={[w]} isOwner={false} onClose={() => setModal(null)} onSaved={onRefresh} tgId={tgId} tgName={tgName} lang={lang} />}
      {editDay && <EditDayForm day={editDay} worker={w} onClose={() => setEditDay(null)} onSaved={onRefresh} lang={lang} />}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// ДЕТАЛЬНИЙ ПЕРЕГЛЯД ПРАЦІВНИКА (ВЛАСНИК)
// ════════════════════════════════════════════════════════
function WorkerDetail({ w, allWorkers, onBack, onRefresh, tgId, tgName, cfg, lang, year, month, onMonthChange }) {
  const [modal, setModal] = useState(null)
  const [editDay, setEditDay] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 40, fontFamily: 'system-ui,sans-serif' }}>
      <Header title={w.name} onBack={onBack} />
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MonthPicker year={year} month={month} onChange={onMonthChange} lang={lang} />
        <SalaryCard w={w} lang={lang} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => setModal('shift')} style={primaryBtn}>{t('newShift', lang)}</button>
          <button onClick={() => setModal('advance')} style={secondaryBtn}>{t('newAdvance', lang)}</button>
          <button onClick={() => setModal('bonus')} style={secondaryBtn}>{t('addBonus', lang)}</button>
          <button onClick={() => setModal('rates')} style={secondaryBtn}>{t('ratesTitle', lang)}</button>
          <button onClick={() => setModal('debtIssue')} style={secondaryBtn}>{t('issueDebt', lang)}</button>
          <button onClick={() => setModal('debtPay')} style={secondaryBtn}>{t('payDebt', lang)}</button>
        </div>
        <Card>
          <Lbl>{t('days', lang)}</Lbl>
          <DaysExpand days={w.days} rateHour={w.rateHour} rateM2={w.rateM2} onEdit={setEditDay} lang={lang} />
        </Card>
      </div>

      {modal === 'shift' && <ShiftForm worker={w} allWorkers={allWorkers} isOwner={true} onClose={() => setModal(null)} onSaved={onRefresh} tgId={tgId} tgName={tgName} cfg={cfg} lang={lang} />}
      {modal === 'advance' && <AdvanceForm worker={w} allWorkers={allWorkers} isOwner={true} onClose={() => setModal(null)} onSaved={onRefresh} tgId={tgId} tgName={tgName} lang={lang} />}
      {modal === 'bonus' && <BonusForm worker={w} onClose={() => setModal(null)} onSaved={onRefresh} tgId={tgId} lang={lang} />}
      {modal === 'rates' && <RatesForm worker={w} onClose={() => setModal(null)} onSaved={onRefresh} lang={lang} />}
      {modal === 'debtIssue' && <DebtForm worker={w} mode="issue" onClose={() => setModal(null)} onSaved={onRefresh} tgId={tgId} lang={lang} />}
      {modal === 'debtPay' && <DebtForm worker={w} mode="pay" onClose={() => setModal(null)} onSaved={onRefresh} tgId={tgId} lang={lang} />}
      {editDay && <EditDayForm day={editDay} worker={w} onClose={() => setEditDay(null)} onSaved={onRefresh} lang={lang} />}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// ПАНЕЛЬ ВЛАСНИКА
// ════════════════════════════════════════════════════════
function OwnerDashboard({ data, tgId, tgName, year, month, onMonthChange, onRefresh, lang, setLang }) {
  const [view, setView] = useState('main')
  const [selWorkerId, setSelWorkerId] = useState(null)
  const [modal, setModal] = useState(null)

  const allWorkers = calcAllWorkers(data)
  const totalFinal = allWorkers.reduce((s, w) => s + w.final, 0)

  if (view === 'worker' && selWorkerId != null) {
    const w = allWorkers.find(x => x.tgId === selWorkerId)
    if (w) return (
      <WorkerDetail
        w={w} allWorkers={allWorkers} onBack={() => setView('main')} onRefresh={onRefresh}
        tgId={tgId} tgName={tgName} cfg={data.cfg} lang={lang}
        year={year} month={month} onMonthChange={onMonthChange}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 40, fontFamily: 'system-ui,sans-serif' }}>
      <Header title={t('ownerPanel', lang)} sub={t('appName', lang)} lang={lang} setLang={setLang} />
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MonthPicker year={year} month={month} onChange={onMonthChange} lang={lang} />

        <Card top="#fff">
          <Row label={t('totalToPay', lang)} value={`${fmt(totalFinal)} ${t('uah', lang)}`} color={C.green} bold last />
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => setModal('addStaff')} style={secondaryBtn}>{t('addStaff', lang)}</button>
          <button onClick={() => setModal('settings')} style={secondaryBtn}>{t('settingsBtn', lang)}</button>
        </div>

        <div>
          <Lbl>{t('staff', lang)}</Lbl>
          {allWorkers.length === 0 && <div style={{ textAlign: 'center', color: C.muted, padding: 24, fontSize: 13 }}>{t('noWorkers', lang)}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allWorkers.map(w => (
              <div key={w.tgId} onClick={() => { setSelWorkerId(w.tgId); setView('worker') }} style={workerCardStyle}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{w.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    {fmtH(w.totalHours)} {t('hr', lang)}{w.totalM2 > 0 ? ` · ${fmt(w.totalM2)} ${t('m2short', lang)}` : ''}
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.green }}>{fmt(w.final)} {t('uah', lang)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal === 'addStaff' && <AddStaffForm onClose={() => setModal(null)} onSaved={onRefresh} lang={lang} />}
      {modal === 'settings' && <SettingsForm cfg={data.cfg} onClose={() => setModal(null)} onSaved={onRefresh} lang={lang} />}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// ГОЛОВНИЙ КОМПОНЕНТ
// ════════════════════════════════════════════════════════
export default function App() {
  const [lang, setLang] = useLang()
  const [tgUser] = useState(getTelegramUser)
  const tgId = Number(tgUser.id)
  const tgName = tgUser.name
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (y, m) => {
    setLoading(true)
    try { setData(await fetchAllData(y ?? year, m ?? month)) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [year, month])

  useEffect(() => { load(year, month) }, []) // eslint-disable-line

  function onMonthChange(y, m) { setYear(y); setMonth(m); load(y, m) }
  function onRefresh() { load(year, month) }

  if (loading || !data) return <LoadingScreen lang={lang} />

  const isOwner = OWNER_IDS.includes(tgId)
  const isStaff = data.staff.some(s => s.tgId === tgId)

  if (!isOwner && !isStaff) return <NotRegisteredScreen lang={lang} setLang={setLang} tgId={tgId} />

  if (isOwner) return (
    <OwnerDashboard data={data} tgId={tgId} tgName={tgName} year={year} month={month} onMonthChange={onMonthChange} onRefresh={onRefresh} lang={lang} setLang={setLang} />
  )
  return (
    <WorkerView data={data} tgId={tgId} tgName={tgName} year={year} month={month} onMonthChange={onMonthChange} onRefresh={onRefresh} lang={lang} setLang={setLang} />
  )
}
