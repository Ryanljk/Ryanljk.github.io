import { useEffect, useRef } from 'react'

// ArrowLeft/ArrowRight keyboard navigation, always wired to the latest handlers.
export default function useArrowKeys(onNext, onPrev) {
  const nextRef = useRef(onNext)
  const prevRef = useRef(onPrev)

  useEffect(() => {
    nextRef.current = onNext
    prevRef.current = onPrev
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextRef.current()
      if (e.key === 'ArrowLeft') prevRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}