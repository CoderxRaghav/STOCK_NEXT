import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { PricePoint } from '../types'

interface Props {
  history: PricePoint[]
  ticker: string
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 font-mono text-[11px]">
      <p className="text-paper-200/50 mb-1">{label}</p>
      {payload.map((p: any) =>
        p.dataKey === 'actual' || p.dataKey === 'predicted' || p.dataKey === 'ma100' ? (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: {p.value != null ? `₹${p.value}` : '—'}
          </p>
        ) : null
      )}
    </div>
  )
}

export default function PriceChart({ history, ticker }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass glass-hover rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg text-paper-100">{ticker}</h3>
          <p className="font-mono text-[10px] text-paper-200/40">90 DAY READ</p>
        </div>
        <div className="flex gap-4 font-mono text-[10px] text-paper-200/50">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-paper-100 inline-block" /> actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-brass-500 inline-block" /> predicted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-sage-500/60 inline-block" /> MA100
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={480}>
        <ComposedChart data={history} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EDE6D6" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#EDE6D6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predictedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9A227" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#C9A227" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(237,230,214,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#D8CFB9', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(237,230,214,0.1)' }}
            interval={14}
          />
          <YAxis
            tick={{ fill: '#D8CFB9', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="ma100"
            name="MA100"
            stroke="#4F9D69"
            strokeOpacity={0.5}
            strokeWidth={1}
            dot={false}
            isAnimationActive
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="#EDE6D6"
            strokeWidth={2}
            fill="url(#actualFill)"
            dot={false}
            isAnimationActive
            animationDuration={1300}
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="predicted"
            name="Predicted"
            stroke="#C9A227"
            strokeWidth={2}
            strokeDasharray="4 3"
            fill="url(#predictedFill)"
            dot={false}
            isAnimationActive
            animationDuration={1500}
            animationBegin={300}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
