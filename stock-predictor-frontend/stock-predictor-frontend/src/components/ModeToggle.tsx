import { motion } from 'framer-motion'

type Mode = 'live' | 'predict'

interface Props {
  mode: Mode
  onChange: (mode: Mode) => void
}

const SEGMENTS: { value: Mode; label: string }[] = [
  { value: 'live', label: 'LIVE' },
  { value: 'predict', label: 'PREDICT' },
]

export default function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="inline-flex items-center glass rounded-full p-1 relative">
      {SEGMENTS.map((seg) => (
        <button
          key={seg.value}
          onClick={() => onChange(seg.value)}
          className="relative z-10 px-5 py-2 font-mono text-[11px] tracking-[0.12em] transition-colors duration-200 rounded-full cursor-pointer"
          style={{
            color:
              mode === seg.value
                ? '#0B0F14' // text-ink-950 on the brass highlight
                : 'rgba(216, 207, 185, 0.5)', // text-paper-200/50
          }}
        >
          {/* Active segment sliding highlight */}
          {mode === seg.value && (
            <motion.div
              layoutId="mode-highlight"
              className="absolute inset-0 rounded-full bg-gradient-to-br from-brass-400 to-brass-600 shadow-[0_0_24px_rgba(201,162,39,0.25)]"
              style={{ zIndex: -1 }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 30,
              }}
            />
          )}
          {seg.label}
        </button>
      ))}
    </div>
  )
}
