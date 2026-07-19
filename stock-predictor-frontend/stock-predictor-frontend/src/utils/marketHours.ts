/**
 * NSE market hours helper.
 *
 * IST = UTC + 5:30.  NSE regular session: Mon–Fri, 9:15 AM – 3:30 PM IST.
 * This does NOT account for public holidays — only day-of-week + time.
 */

/** Convert any Date to IST hours/minutes and day-of-week. */
function toIST(date: Date) {
  // IST offset in minutes: +5 hours 30 minutes = 330 minutes
  const IST_OFFSET = 330
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes()
  const istMinutes = utcMinutes + IST_OFFSET

  // Wrap around midnight: if IST minutes >= 1440, we've crossed into the next day
  const totalMinutes = ((istMinutes % 1440) + 1440) % 1440

  // Day of week in IST (may differ from UTC day near midnight)
  const utcDay = date.getUTCDay()
  const dayShift = istMinutes >= 1440 ? 1 : istMinutes < 0 ? -1 : 0
  const istDay = ((utcDay + dayShift) % 7 + 7) % 7

  return { totalMinutes, istDay }
}

/**
 * Returns `true` if the given time falls within NSE regular trading hours.
 * Mon (1) – Fri (5), 9:15 AM (555 min) – 3:30 PM (930 min) IST.
 */
export function isNSEMarketOpen(date: Date = new Date()): boolean {
  const { totalMinutes, istDay } = toIST(date)

  const isWeekday = istDay >= 1 && istDay <= 5
  const MARKET_OPEN = 9 * 60 + 15   // 555
  const MARKET_CLOSE = 15 * 60 + 30 // 930

  return isWeekday && totalMinutes >= MARKET_OPEN && totalMinutes <= MARKET_CLOSE
}

/**
 * Returns the default view mode based on current market hours.
 * During NSE trading hours → "live"; otherwise → "predict".
 */
export function getDefaultMode(): 'live' | 'predict' {
  return isNSEMarketOpen() ? 'live' : 'predict'
}
