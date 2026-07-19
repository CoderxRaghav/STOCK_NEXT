export default function AmbientBackground() {
  return (
    <>
      <div className="bg-glow-field" aria-hidden="true">
        <div className="glow-blob glow-a" />
        <div className="glow-blob glow-b" />
      </div>
      <div className="bg-terminal-grid" aria-hidden="true" />
    </>
  )
}
