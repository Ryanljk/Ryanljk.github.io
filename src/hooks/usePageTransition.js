import { useState, useEffect } from 'react'

// Standard page transition: mount off-screen, flip to `entered` next frame,
// slide out on back before calling `onBack` after 300ms.
export default function usePageTransition(onBack, { timeout = 300, onLeave } = {}) {
  const [entered, setEntered] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleBack = () => {
    if (leaving) return
    onLeave?.()
    setLeaving(true)
    setTimeout(() => onBack(), timeout)
  }

  return { entered, leaving, handleBack }
}