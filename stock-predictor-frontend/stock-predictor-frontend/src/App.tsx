import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import VideoBackground from './components/VideoBackground'
import AmbientBackground from './components/AmbientBackground'
import Header from './components/Header'
import TickerTape from './components/TickerTape'
import SearchBar from './components/SearchBar'
import PriceChart from './components/PriceChart'
import PredictionCard from './components/PredictionCard'
import StatsStrip from './components/StatsStrip'
import LiveMarketPanel from './components/LiveMarketPanel'
import ModeToggle from './components/ModeToggle'
import ModeCaption from './components/ModeCaption'
import { fetchPrediction } from './services/api'
import { PredictionResult } from './types'
import { getDefaultMode } from './utils/marketHours'
import Preloader from './components/Preloader'

export default function App() {
  const [data, setData] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'live' | 'predict'>(getDefaultMode)
  const [currentTicker, setCurrentTicker] = useState<string | null>(null)
  const [showPreloader, setShowPreloader] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false)
    }, 3800)
    return () => clearTimeout(timer)
  }, [])

  async function handleSearch(ticker: string) {
    setCurrentTicker(ticker)
    setLoading(true)
    setError(null)
    try {
      const result = await fetchPrediction(ticker)
      setData(result)
    } catch (e) {
      setError('Could not read that ticker. Try another one.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <VideoBackground />
      <AmbientBackground />
      <div className="relative z-20">
        <Header />
        <TickerTape />

        <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-xl mx-auto space-y-4"
          >
            <h2 className="font-display text-3xl text-paper-100 mb-2">
              Read the trend before the market does.
            </h2>
            <p className="font-body text-sm text-paper-200/50">
              Technical signals, moving averages, and model confidence — laid out plainly.
            </p>

            <div className="flex flex-col items-center gap-2 pt-1">
              <ModeToggle mode={mode} onChange={setMode} />
              <ModeCaption mode={mode} />
            </div>
          </motion.div>

          <SearchBar onSearch={handleSearch} loading={loading} />

          <AnimatePresence mode="wait">
            {mode === 'predict' ? (
              /* ---- PREDICT MODE: existing prediction UI, completely unchanged ---- */
              <motion.div
                key="predict"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="glass rounded-xl px-5 py-4 border-rust-500/30 text-rust-400 font-mono text-sm text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  {!error && data && !loading && (
                    <motion.div
                      key={data.ticker}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="space-y-6"
                    >
                      <StatsStrip stats={data.stats} />
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <PriceChart history={data.history} ticker={data.ticker} />
                        </div>
                        <div>
                          <PredictionCard data={data} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {!error && !data && !loading && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="glass rounded-2xl px-6 py-16 text-center"
                    >
                      <p className="font-mono text-[11px] tracking-[0.15em] text-paper-200/30">
                        ENTER A TICKER TO BEGIN
                      </p>
                    </motion.div>
                  )}

                  {loading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="glass rounded-2xl px-6 py-16 text-center"
                    >
                      <p className="font-mono text-[11px] tracking-[0.15em] text-brass-400 animate-pulse">
                        READING SIGNAL…
                      </p>
                      <p className="font-mono text-[9px] text-paper-200/30 mt-2">
                        First load may take up to 1-2 minutes while the Render server wakes up from sleep.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* ---- LIVE MODE: TradingView chart or empty state ---- */
              <motion.div
                key="live"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {currentTicker ? (
                  <LiveMarketPanel key={currentTicker} ticker={currentTicker} />
                ) : (
                  <div className="glass rounded-2xl px-6 py-16 text-center">
                    <p className="font-mono text-[11px] tracking-[0.15em] text-paper-200/30">
                      ENTER A TICKER TO BEGIN
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="max-w-6xl mx-auto px-6 py-8">
          <div className="glass rounded-xl px-5 py-4">
            <p className="font-mono text-[10px] text-paper-200/50 text-center">
              © 2026 All rights reserved, by Raghav Ventures.
            </p>
          </div>
        </footer>
      </div>
      <AnimatePresence>
        {showPreloader && <Preloader key="preloader" />}
      </AnimatePresence>
    </div>
  )
}
