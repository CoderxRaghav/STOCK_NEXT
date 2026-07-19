import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { PredictionResult } from '../types'
import ConfidenceGauge from './ConfidenceGauge'
import WhyPanel from './WhyPanel'

interface Props {
  data: PredictionResult
}

const TREND_META = {
  up: { label: 'UPTREND', color: 'text-sage-400', bg: 'bg-sage-500/10', border: 'border-sage-500/30', Icon: TrendingUp },
  down: { label: 'DOWNTREND', color: 'text-rust-400', bg: 'bg-rust-500/10', border: 'border-rust-500/30', Icon: TrendingDown },
  flat: { label: 'SIDEWAYS', color: 'text-brass-400', bg: 'bg-brass-500/10', border: 'border-brass-500/30', Icon: Minus },
}

export default function PredictionCard({ data }: Props) {
  const meta = TREND_META[data.trend]
  const Icon = meta.Icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      className="glass glass-hover rounded-2xl p-5 flex flex-col gap-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg text-paper-100">{data.companyName}</h3>
          <p className="font-mono text-[10px] text-paper-200/40">{data.ticker}</p>
        </div>
        <span
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${meta.bg} ${meta.border} ${meta.color} font-mono text-[10px] tracking-wide`}
        >
          <Icon size={12} /> {meta.label}
        </span>
      </div>

      <div className="flex items-end gap-4">
        <div>
          <p className="font-mono text-[10px] text-paper-200/40">CURRENT</p>
          <p className="font-mono text-2xl font-mono-tabular text-paper-100">
            ₹{data.currentPrice}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-paper-200/40">PREDICTED (NEXT SESSION)</p>
          <p className={`font-mono text-2xl font-mono-tabular ${meta.color}`}>
            ₹{data.predictedPrice}
            <span className="text-sm ml-2">
              {data.changePct > 0 ? '+' : ''}
              {data.changePct}%
            </span>
          </p>
        </div>
      </div>

      <div className="flex justify-center py-1">
        <ConfidenceGauge confidence={data.confidence} trend={data.trend} />
      </div>

      <div className="border-t border-ink-700/60 pt-4">
        <WhyPanel signals={data.signals} />
      </div>

      <p className="font-mono text-[9px] text-paper-200/30 text-center">
        A trend reading based on historical patterns — not financial advice.
      </p>
    </motion.div>
  )
}
