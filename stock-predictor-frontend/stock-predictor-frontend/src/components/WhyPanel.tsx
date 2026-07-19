import { motion } from 'framer-motion'
import { SignalTag } from '../types'

interface Props {
  signals: SignalTag[]
}

export default function WhyPanel({ signals }: Props) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.15em] text-paper-200/40 mb-3">
        WHY THIS READING
      </p>
      <div className="space-y-3">
        {signals.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-[12.5px] text-paper-200/80">{s.label}</span>
              <span
                className={`font-mono text-[10px] font-mono-tabular ${
                  s.direction === 'up' ? 'text-sage-400' : 'text-rust-400'
                }`}
              >
                {Math.round(s.weight * 100)}%
              </span>
            </div>
            <div className="h-1 rounded-full bg-ink-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.weight * 100}%` }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  s.direction === 'up' ? 'bg-sage-500' : 'bg-rust-500'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
