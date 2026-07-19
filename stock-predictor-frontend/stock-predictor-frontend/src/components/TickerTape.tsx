const TAPE_ITEMS = [
  { t: 'NIFTY 50', v: '24,318.60', d: '+0.42%', up: true },
  { t: 'SENSEX', v: '79,986.12', d: '+0.38%', up: true },
  { t: 'TCS', v: '3,842.10', d: '-0.15%', up: false },
  { t: 'RELIANCE', v: '1,486.55', d: '+1.02%', up: true },
  { t: 'INFY', v: '1,612.40', d: '-0.31%', up: false },
  { t: 'HDFCBANK', v: '1,742.90', d: '+0.64%', up: true },
  { t: 'AAPL', v: '212.44', d: '+0.88%', up: true },
  { t: 'TSLA', v: '318.02', d: '-2.14%', up: false },
]

function TapeSegment() {
  return (
    <div className="flex items-center shrink-0">
      {TAPE_ITEMS.map((item, i) => (
        <div key={i} className="flex items-center gap-2 px-6 whitespace-nowrap">
          <span className="font-mono text-[11px] tracking-wider text-paper-200/60">
            {item.t}
          </span>
          <span className="font-mono text-[11px] font-mono-tabular text-paper-100">
            {item.v}
          </span>
          <span
            className={`font-mono text-[11px] font-mono-tabular ${
              item.up ? 'text-sage-400' : 'text-rust-400'
            }`}
          >
            {item.d}
          </span>
          <span className="text-ink-700 select-none">/</span>
        </div>
      ))}
    </div>
  )
}

export default function TickerTape() {
  return (
    <div
      className="sticky top-[65px] z-20 w-full overflow-hidden glass border-x-0 py-2"
      role="marquee"
      aria-label="Live market ticker"
    >
      <div className="flex ticker-track w-max">
        <TapeSegment />
        <TapeSegment />
      </div>
    </div>
  )
}
