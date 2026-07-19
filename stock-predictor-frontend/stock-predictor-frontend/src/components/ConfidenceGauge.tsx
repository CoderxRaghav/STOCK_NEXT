import { motion } from 'framer-motion'
import { Trend } from '../types'

interface Props {
  confidence: number // 0-100
  trend: Trend
}

const TREND_COLOR: Record<Trend, string> = {
  up: '#4F9D69',
  down: '#C1554B',
  flat: '#C9A227',
}

export default function ConfidenceGauge({ confidence, trend }: Props) {
  const color = TREND_COLOR[trend]
  const radius = 80
  const circumference = Math.PI * radius // half circle
  const clamped = Math.min(100, Math.max(0, confidence))
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" width="220" height="132">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* track */}
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="rgba(237,230,214,0.08)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* value arc */}
        <motion.path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          filter="url(#glow)"
        />
      </svg>
      <div className="-mt-14 flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="font-mono text-3xl font-mono-tabular text-paper-100"
        >
          {clamped}%
        </motion.span>
        <span className="font-mono text-[10px] tracking-[0.15em] text-paper-200/40 mt-1">
          CONFIDENCE
        </span>
      </div>
    </div>
  )
}
