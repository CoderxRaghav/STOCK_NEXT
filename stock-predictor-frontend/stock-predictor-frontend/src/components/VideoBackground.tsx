import { useEffect, useRef, useState } from 'react'

export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (reducedMotion) {
      // Load just the first frame, then pause
      const pauseOnReady = () => {
        video.pause()
        video.removeEventListener('loadeddata', pauseOnReady)
      }
      video.addEventListener('loadeddata', pauseOnReady)
      // If already loaded, pause immediately
      if (video.readyState >= 2) video.pause()
    } else {
      video.play().catch(() => {
        // Autoplay blocked — fail silently, overlay still covers
      })
    }
  }, [reducedMotion])

  return (
    <div className="fixed inset-0 z-[-1]" aria-hidden="true">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        src="/stock-bg.mp4"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-[#05070A]/[0.78]" />
    </div>
  )
}
