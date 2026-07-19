import { useState, useRef, useEffect } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SUGGESTIONS = ['TCS', 'INFY', 'RELIANCE', 'HDFCBANK', 'AAPL', 'TSLA']

const POPULAR_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'INFY', name: 'Infosys Ltd.' },
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank' },
  { symbol: 'SBIN', name: 'State Bank of India' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance' },
  { symbol: 'GROWW', name: 'Groww' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd.' },
  { symbol: 'PAYTM', name: 'One97 Communications' },
]

interface Props {
  onSearch: (ticker: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function submit(ticker?: string) {
    const t = (ticker ?? value).trim()
    if (t) {
      onSearch(t)
      setShowDropdown(false)
    }
  }

  const filtered = POPULAR_TICKERS.filter(
    (t) =>
      t.symbol.toLowerCase().startsWith(value.toLowerCase()) ||
      t.name.toLowerCase().startsWith(value.toLowerCase())
  ).slice(0, 6)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass rounded-2xl p-5"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="flex items-center gap-3"
      >
        <div className="relative flex-1" ref={dropdownRef}>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-paper-200/40"
            size={18}
            aria-hidden="true"
          />
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toUpperCase())
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Enter a ticker — e.g. TCS, AAPL, RELIANCE"
            aria-label="Stock ticker"
            className="w-full glass-inset rounded-xl py-3.5 pl-11 pr-4 font-mono text-sm text-paper-100 placeholder:text-paper-200/30 focus:border-brass-500/60 transition-colors outline-none"
          />
          
          <AnimatePresence>
            {showDropdown && value.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 p-2 glass rounded-xl shadow-lg z-50 flex flex-col gap-1 max-h-64 overflow-y-auto border border-white/5"
              >
                {filtered.map((t) => (
                  <button
                    key={t.symbol}
                    type="button"
                    onClick={() => {
                      setValue(t.symbol)
                      submit(t.symbol)
                    }}
                    className="flex items-center justify-between px-4 py-2.5 text-sm text-left rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <span className="font-mono text-paper-100 group-hover:text-brass-400 transition-colors">{t.symbol}</span>
                    <span className="text-paper-200/60 truncate ml-4 text-xs">{t.name}</span>
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => submit(value)}
                  className="px-4 py-3 mt-1 text-xs text-center text-paper-200/40 hover:text-paper-200 rounded-lg hover:bg-white/5 transition-colors italic border-t border-white/5"
                >
                  Search more related tickers...
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-br from-brass-400 to-brass-600 text-ink-950 font-body font-medium text-sm tracking-wide disabled:opacity-50 shadow-[0_0_24px_rgba(201,162,39,0.25)] transition-shadow hover:shadow-[0_0_32px_rgba(201,162,39,0.4)]"
        >
          {loading ? 'Reading…' : 'Read trend'}
          {!loading && <ArrowRight size={16} />}
        </motion.button>
      </form>
      <div className="flex flex-wrap gap-2 mt-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            className="font-mono text-[11px] text-paper-200/50 glass-inset rounded-full px-3 py-1 hover:border-brass-500/50 hover:text-brass-400 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
