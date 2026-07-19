export type Trend = 'up' | 'down' | 'flat'

export interface PricePoint {
  date: string
  actual: number | null
  predicted: number | null
  ma100?: number
  ma200?: number
}

export interface SignalTag {
  label: string
  weight: number // 0-1, how strongly it drove the prediction
  direction: Trend
}

export interface QuickStats {
  marketCap: string
  peRatio: number
  weekHigh52: number
  weekLow52: number
  avgVolume: string
}

export interface PredictionResult {
  ticker: string
  companyName: string
  currentPrice: number
  predictedPrice: number
  changePct: number
  trend: Trend
  confidence: number // 0-100
  history: PricePoint[]
  signals: SignalTag[]
  stats: QuickStats
  lastUpdated: string
}
