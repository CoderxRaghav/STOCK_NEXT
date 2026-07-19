import { motion } from 'framer-motion'

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-30 glass border-x-0 border-t-0"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brass-400 to-brass-600 flex items-center justify-center font-display font-semibold text-ink-950 text-sm">
            S
          </div>
          <div>
            <h1 className="font-display text-lg text-paper-100 leading-none">Signal</h1>
            <p className="font-mono text-[10px] tracking-[0.15em] text-paper-200/40 mt-0.5">
              TREND TERMINAL
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-paper-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-sage-400 pulse-dot" />
          <span>LIVE</span>
          <span className="text-ink-700 mx-1">|</span>
          <span>
            {new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </motion.header>
  )
}
