import { useState, useEffect } from 'react'

// Wrapper that fades/staggers its child in from the right (AboutMe, ContactMe).
export default function PixelCard({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className="transition-all duration-300 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(60px)',
      }}
    >
      {children}
    </div>
  )
}