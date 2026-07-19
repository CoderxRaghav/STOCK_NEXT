import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * Map app ticker symbols to TradingView exchange-prefixed symbols.
 * Covers all tickers from SearchBar's SUGGESTIONS and POPULAR_TICKERS lists.
 * For any ticker not in the map, we default to "NSE:<ticker>" — a best-effort
 * fallback given the app's primary focus on Indian markets.
 */
const TICKER_TO_TV_SYMBOL: Record<string, string> = {
  // Indian / NSE
  TCS: 'NSE:TCS',
  INFY: 'NSE:INFY',
  RELIANCE: 'NSE:RELIANCE',
  HDFCBANK: 'NSE:HDFCBANK',
  SBIN: 'NSE:SBIN',
  ICICIBANK: 'NSE:ICICIBANK',
  BAJFINANCE: 'NSE:BAJFINANCE',
  ZOMATO: 'NSE:ZOMATO',
  PAYTM: 'NSE:PAYTM',
  GROWW: 'NSE:GROWW',

  // US / NASDAQ
  AAPL: 'NASDAQ:AAPL',
  TSLA: 'NASDAQ:TSLA',
  GOOGL: 'NASDAQ:GOOGL',
  AMZN: 'NASDAQ:AMZN',
  MSFT: 'NASDAQ:MSFT',
  META: 'NASDAQ:META',
  NVDA: 'NASDAQ:NVDA',
}

function resolveSymbol(ticker: string): string {
  const upper = ticker.toUpperCase()
  return TICKER_TO_TV_SYMBOL[upper] ?? `NSE:${upper}`
}

interface Props {
  ticker: string
}

export default function LiveMarketPanel({ ticker }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear previous embed
    container.innerHTML = ''

    // TradingView standard embed pattern: a wrapper div + a script tag
    // whose text content is the JSON config object.
    const widgetWrapper = document.createElement('div')
    widgetWrapper.className = 'tradingview-widget-container__widget'
    widgetWrapper.style.height = '100%'
    widgetWrapper.style.width = '100%'

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'

    script.textContent = JSON.stringify({
      width: '100%',
      height: 650,
      symbol: resolveSymbol(ticker),
      theme: 'dark',
      autosize: false,
      style: '1',
      locale: 'en',
      hide_top_toolbar: false,
      allow_symbol_change: false,
      calendar: false,
      backgroundColor: 'rgba(5, 7, 10, 0)',
      gridColor: 'rgba(237, 230, 214, 0.06)',
      support_host: 'https://www.tradingview.com',
    })

    container.appendChild(widgetWrapper)
    container.appendChild(script)

    // Cleanup on unmount / ticker change
    return () => {
      container.innerHTML = ''
    }
  }, [ticker])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass glass-hover rounded-2xl p-5"
    >
      {/* Header — mirrors PriceChart header treatment */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg text-paper-100">{ticker}</h3>
          <p className="font-mono text-[10px] text-paper-200/40">ADVANCED CHART</p>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-sage-500/10 border-sage-500/30 text-sage-400 font-mono text-[10px] tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-400 pulse-dot" />
          LIVE
        </span>
      </div>

      {/* TradingView widget container */}
      <div
        ref={containerRef}
        className="tradingview-widget-container rounded-xl overflow-hidden min-h-[650px]"
        style={{ height: 650 }}
      />
    </motion.div>
  )
}
