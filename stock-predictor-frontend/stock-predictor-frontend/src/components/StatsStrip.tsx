import { motion } from 'framer-motion'
import { QuickStats } from '../types'

interface Props {
  stats: QuickStats
}

export default function StatsStrip({ stats }: Props) {
  const items = [
    { label: 'MARKET CAP', value: stats.marketCap },
    { label: 'P/E RATIO', value: stats.peRatio.toFixed(1) },
    { label: '52W HIGH', value: `₹${stats.weekHigh52}` },
    { label: '52W LOW', value: `₹${stats.weekLow52}` },
    { label: 'AVG VOLUME', value: stats.avgVolume },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="glass glass-hover rounded-xl px-4 py-3"
        >
          <p className="font-mono text-[9px] tracking-[0.12em] text-paper-200/40 mb-1">
            {item.label}
          </p>
          <p className="font-mono text-sm font-mono-tabular text-paper-100">{item.value}</p>
        </motion.div>
      ))}
    </div>
  )
}
