import { useState, useEffect, useRef } from 'react'

// Locks interaction during carousel transitions: `lock()` re-arms the lock,
// auto-released after 350ms (400ms on first mount).
export default function useCarouselLock() {
  const [locked, setLocked] = useState(true)
  const lockTimer = useRef(null)

  const lock = (onUnlock) => {
    setLocked(true)
    clearTimeout(lockTimer.current)
    lockTimer.current = setTimeout(() => {
      setLocked(false)
      onUnlock?.()
    }, 350)
  }

  useEffect(() => {
    const t = setTimeout(() => setLocked(false), 400)
    return () => clearTimeout(t)
  }, [])

  return { locked, lock }
}