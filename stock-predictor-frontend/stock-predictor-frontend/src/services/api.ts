import { PredictionResult, PricePoint, SignalTag, Trend } from '../types'

// ---------------------------------------------------------------------------
// INTEGRATION POINT
// ---------------------------------------------------------------------------
// Swap USE_MOCK to false and point API_BASE_URL at your FastAPI backend.
// Expected backend contract:
//   GET  {API_BASE_URL}/api/predict/{ticker}  ->  PredictionResult (see types.ts)
// Keep the response shape identical to PredictionResult and every component
// below works unchanged.
// ---------------------------------------------------------------------------
const USE_MOCK = false
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function buildMockHistory(ticker: string): PricePoint[] {
  const rand = seededRandom(ticker.length * 97 + ticker.charCodeAt(0))
  const days = 90
  const points: PricePoint[] = []
  let price = 150 + rand() * 400
  const closes: number[] = []

  for (let i = 0; i < days; i++) {
    const drift = (rand() - 0.48) * 6
    price = Math.max(20, price + drift)
    closes.push(price)
    const date = new Date()
    date.setDate(date.getDate() - (days - i))

    const ma100 = closes.slice(Math.max(0, i - 20)).reduce((a, b) => a + b, 0) /
      closes.slice(Math.max(0, i - 20)).length
    const ma200 = closes.slice(Math.max(0, i - 40)).reduce((a, b) => a + b, 0) /
      closes.slice(Math.max(0, i - 40)).length

    const isFuture = i >= days - 7
    points.push({
      date: date.toISOString().slice(0, 10),
      actual: isFuture ? null : Number(price.toFixed(2)),
      predicted: isFuture
        ? Number((price + (rand() - 0.4) * 10).toFixed(2))
        : i > days - 14
        ? Number((price + (rand() - 0.5) * 4).toFixed(2))
        : null,
      ma100: Number(ma100.toFixed(2)),
      ma200: Number(ma200.toFixed(2)),
    })
  }
  return points
}

function buildMockSignals(trend: Trend): SignalTag[] {
  const up: SignalTag[] = [
    { label: 'RSI recovering from oversold', weight: 0.82, direction: 'up' },
    { label: 'Volume spike vs 20d avg', weight: 0.71, direction: 'up' },
    { label: 'MA100 crossed above MA200', weight: 0.65, direction: 'up' },
    { label: 'Positive news sentiment', weight: 0.44, direction: 'up' },
  ]
  const down: SignalTag[] = [
    { label: 'RSI in overbought territory', weight: 0.78, direction: 'down' },
    { label: 'MACD bearish crossover', weight: 0.69, direction: 'down' },
    { label: 'Volume declining on rallies', weight: 0.52, direction: 'down' },
    { label: 'Negative news sentiment', weight: 0.4, direction: 'down' },
  ]
  return trend === 'down' ? down : up
}

export async function fetchPrediction(ticker: string): Promise<PredictionResult> {
  const clean = ticker.trim().toUpperCase()

  if (!USE_MOCK) {
    const res = await fetch(`${API_BASE_URL}/api/predict/${clean}`)
    if (!res.ok) throw new Error(`Prediction request failed (${res.status})`)
    return res.json()
  }

  // Simulate network latency so loading states are visible in the demo
  await new Promise((r) => setTimeout(r, 650))

  const history = buildMockHistory(clean)
  const lastActual = [...history].reverse().find((p) => p.actual !== null)
  const lastPredicted = history[history.length - 1]
  const currentPrice = lastActual?.actual ?? 100
  const predictedPrice = lastPredicted.predicted ?? currentPrice
  const trend: Trend =
    predictedPrice > currentPrice * 1.005
      ? 'up'
      : predictedPrice < currentPrice * 0.995
      ? 'down'
      : 'flat'

  const changePct = Number((((predictedPrice - currentPrice) / currentPrice) * 100).toFixed(2))

  const highs = history.map((h) => h.actual ?? h.predicted ?? 0).filter(Boolean)
  const weekHigh52 = Number(Math.max(...highs, currentPrice).toFixed(2))
  const weekLow52 = Number(Math.min(...highs, currentPrice).toFixed(2))

  return {
    ticker: clean,
    companyName: mockCompanyName(clean),
    currentPrice: Number(currentPrice.toFixed(2)),
    predictedPrice: Number(predictedPrice.toFixed(2)),
    changePct,
    trend,
    confidence: Math.round(60 + seededRandom(clean.length)() * 32),
    history,
    signals: buildMockSignals(trend),
    stats: {
      marketCap: `\u20B9${(currentPrice * (18 + rand() * 40)).toFixed(0)}K Cr`,
      peRatio: Number((14 + rand() * 22).toFixed(1)),
      weekHigh52,
      weekLow52,
      avgVolume: `${(2.1 + rand() * 6).toFixed(1)}M`,
    },
    lastUpdated: new Date().toISOString(),
  }
}

function rand() {
  return Math.random()
}

function mockCompanyName(ticker: string): string {
  const known: Record<string, string> = {
    TCS: 'Tata Consultancy Services',
    INFY: 'Infosys Ltd.',
    RELIANCE: 'Reliance Industries',
    HDFCBANK: 'HDFC Bank',
    AAPL: 'Apple Inc.',
    TSLA: 'Tesla Inc.',
    GOOGL: 'Alphabet Inc.',
  }
  return known[ticker] ?? `${ticker} Corp.`
}
