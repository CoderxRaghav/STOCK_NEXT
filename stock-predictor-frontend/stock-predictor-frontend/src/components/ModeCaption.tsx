import { AnimatePresence, motion } from 'framer-motion'
import { isNSEMarketOpen } from '../utils/marketHours'

type Mode = 'live' | 'predict'

interface Props {
  mode: Mode
}

function getCaptionText(mode: Mode): string {
  if (mode === 'predict') {
    return "Next session's predicted trend, based on historical patterns."
  }

  // Live mode — caption depends on actual market state, not just selected mode
  return isNSEMarketOpen()
    ? 'Markets are open — live prices update in real time.'
    : 'Live market view — prices reflect the last trading session.'
}

export default function ModeCaption({ mode }: Props) {
  const text = getCaptionText(mode)

  return (
    <div className="h-5 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="font-mono text-[10px] text-paper-200/30 text-center"
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
