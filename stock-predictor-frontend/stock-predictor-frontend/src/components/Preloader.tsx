import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface Point {
  x: number
  y: number
  open: number
  close: number
  high: number
  low: number
  isUp: boolean
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export default function Preloader() {
  const prefersReducedMotion = useReducedMotion()

  const { points, pathData } = useMemo(() => {
    const numCandles = 20
    const rand = seededRandom(42) // Fixed seed for consistent animation

    let currentPrice = 100
    const rawData = []
    let minPrice = Infinity
    let maxPrice = -Infinity

    // Generate random walk trending upwards
    for (let i = 0; i < numCandles; i++) {
      // Drift upwards heavily but with some volatility
      const drift = (rand() - 0.25) * 12
      const open = currentPrice
      const close = currentPrice + drift
      const high = Math.max(open, close) + rand() * 5
      const low = Math.min(open, close) - rand() * 5
      currentPrice = close

      minPrice = Math.min(minPrice, low)
      maxPrice = Math.max(maxPrice, high)

      rawData.push({ open, close, high, low, isUp: close >= open })
    }

    // Scale to viewBox 1000 x 400
    // Padding top and bottom
    const range = maxPrice - minPrice
    const scale = 300 / range

    const scaledPoints: Point[] = rawData.map((d, i) => {
      const x = i * 50 + 25 // 1000 width / 20 = 50 per candle
      const mapY = (val: number) => 350 - (val - minPrice) * scale
      return {
        x,
        y: mapY(d.close),
        open: mapY(d.open),
        close: mapY(d.close),
        high: mapY(d.high),
        low: mapY(d.low),
        isUp: d.isUp,
      }
    })

    const pathD =
      'M ' +
      scaledPoints.map((p) => `${p.x},${p.y}`).join(' L ')

    return { points: scaledPoints, pathData: pathD }
  }, [])

  // Timings
  const STAGGER = 0.05
  const DRAW_DURATION = points.length * STAGGER // 1.0s
  const TEXT_FADE_DELAY = DRAW_DURATION + 0.1

  if (prefersReducedMotion) {
    return (
      <motion.div
        key="preloader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 bg-ink-950 flex flex-col items-center justify-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brass-400 to-brass-600 flex items-center justify-center font-display font-semibold text-ink-950 text-3xl mb-8">
          S
        </div>
        <div className="flex flex-col gap-1.5 mt-2 bg-ink-950/40 p-6 rounded-3xl">
          <div className="flex items-center gap-3 font-mono text-[10px] text-paper-200/50">
            <span className="text-sage-400 font-bold tracking-widest w-16 text-right">LIVE</span>
            <span className="text-ink-700">|</span>
            <span>real-time market prices while the exchange is open</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] text-paper-200/50">
            <span className="text-brass-400 font-bold tracking-widest w-16 text-right">PREDICT</span>
            <span className="text-ink-700">|</span>
            <span>next session's AI-forecasted trend after market close</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key="preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-ink-950 flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="w-full max-w-4xl px-4 relative flex flex-col items-center justify-center">
        {/* The Candlestick Chart */}
        <div className="w-full relative opacity-60 mix-blend-screen h-48 sm:h-64 md:h-80 lg:h-96">
          <svg
            viewBox="0 0 1000 400"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Candlesticks */}
            {points.map((p, i) => (
              <motion.g
                key={i}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{
                  duration: 0.3,
                  delay: i * STAGGER,
                  ease: 'backOut',
                }}
                style={{ originY: p.y / 400 }} // Scale from their close price vertical center roughly
                className={p.isUp ? 'text-sage-500' : 'text-rust-500'}
              >
                {/* Wick */}
                <line
                  x1={p.x}
                  y1={p.high}
                  x2={p.x}
                  y2={p.low}
                  className="stroke-current"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Body */}
                <rect
                  x={p.x - 15}
                  y={Math.min(p.open, p.close)}
                  width="30"
                  height={Math.max(1, Math.abs(p.close - p.open))}
                  className="fill-current"
                  rx="4"
                />
              </motion.g>
            ))}

            {/* Glowing Trend Line */}
            <motion.path
              d={pathData}
              fill="none"
              className="stroke-brass-500"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: DRAW_DURATION, ease: 'linear' },
                opacity: { duration: 0.1 },
              }}
            />

            {/* Comet Head */}
            <motion.circle
              r="6"
              className="fill-brass-300"
              filter="url(#glow)"
              initial={{ opacity: 0 }}
              animate={{
                cx: points.map((p) => p.x),
                cy: points.map((p) => p.y),
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                cx: { duration: DRAW_DURATION, ease: 'linear' },
                cy: { duration: DRAW_DURATION, ease: 'linear' },
                opacity: { duration: DRAW_DURATION, times: [0, 0.05, 0.95, 1] },
              }}
            />
          </svg>
        </div>

        {/* Wordmark and Mode Captions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: TEXT_FADE_DELAY, ease: 'easeOut' }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Logo / Wordmark */}
          <div className="flex flex-col items-center gap-4 bg-ink-950/40 p-6 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brass-400 to-brass-600 flex items-center justify-center font-display font-semibold text-ink-950 text-lg shadow-[0_0_20px_rgba(201,162,39,0.3)]">
                S
              </div>
              <div>
                <h1 className="font-display text-2xl text-paper-100 leading-none">Signal</h1>
              </div>
            </div>

            {/* Mode Explainer Lines */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: TEXT_FADE_DELAY + 0.15 }}
              className="flex flex-col gap-1.5 mt-2"
            >
              <div className="flex items-center gap-3 font-mono text-[10px] text-paper-200/50">
                <span className="text-sage-400 font-bold tracking-widest w-16 text-right">LIVE</span>
                <span className="text-ink-700">|</span>
                <span>real-time market prices while the exchange is open</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px] text-paper-200/50">
                <span className="text-brass-400 font-bold tracking-widest w-16 text-right">PREDICT</span>
                <span className="text-ink-700">|</span>
                <span>next session's AI-forecasted trend after market close</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
