import { useState, useEffect, useRef } from 'react'
import photo from '../assets/photo.png'
import PixelBorder from './PixelBorder'
import BackButton from './BackButton'
import PageHeader from './PageHeader'
import useArrowKeys from '../hooks/useArrowKeys'
import { wrappedOffset } from '../utils/wrappedOffset'
// import skills from '../assets/skills.png'
// import contactme from '../assets/contactme.png'

// import myprojects from '../assets/myprojects.png'
import aboutmeVideo from '../assets/aboutme.mp4'
import contactmeVideo from '../assets/contactme.mp4'
import myprojectsVideo from '../assets/myprojects.mp4'
import skillsVideo from '../assets/skills.mp4'
import experienceVideo from '../assets/experience.mp4'
const items = [
  { id: 1, img: photo, video: aboutmeVideo, text: 'About Me' },
  { id: 2, img: photo, video: myprojectsVideo ,text: 'My Projects' },
  { id: 3, img: photo, video: skillsVideo ,text: 'Skills' },
  { id: 4, img: photo, video: experienceVideo ,text: 'Experience' },
  { id: 5, img: photo, video: contactmeVideo, text: 'Contact Me' },
]

export default function Gallery({ onBack, onSelect, enterFrom = 'right', leaveSignal, initialCurrent = 0 }) {
  const [current, setCurrent] = useState(() => Math.min(Math.max(initialCurrent, 0), items.length - 1))
  const [entered, setEntered] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [leavingBack, setLeavingBack] = useState(false)
  // Which videos have buffered enough to be shown (mask loading with the img).
  const [loaded, setLoaded] = useState({})
  const dragStart = useRef(null)
  const didDrag = useRef(false)
  const videoRefs = useRef([])
  const total = items.length

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true))
  }, [])

  // Manage video playback — only play the active video
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return
      if (i === current) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
  }, [current])

  const goNext = () => {
    setCurrent((prev) => (prev + 1) % total)
    setHovered(false)
  }
  const goPrev = () => {
    setCurrent((prev) => (prev - 1 + total) % total)
    setHovered(false)
  }

  // Keyboard navigation
  useArrowKeys(goNext, goPrev)

  // Mousewheel navigation (only when hovering main item)
  const handleWheel = (e) => {
    if (!hovered) return
    e.preventDefault()
    if (e.deltaY > 0) goNext()
    else goPrev()
  }

  // Drag handlers
  const handleDragStart = (e) => {
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    dragStart.current = x
    didDrag.current = false
  }

  const handleDragMove = (e) => {
    if (dragStart.current === null) return
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    const delta = x - dragStart.current
    if (Math.abs(delta) > 5) didDrag.current = true
    setDragX(delta)
  }

  const handleDragEnd = () => {
    if (dragStart.current === null) return
    if (dragX > 50) goPrev()
    else if (dragX < -50) goNext()
    dragStart.current = null
    setDragX(0)
  }

  const handleBack = () => {
    if (leaving || leavingBack) return
    setLeavingBack(true)
    setTimeout(() => onBack(), 300)
  }

  // Browser back: run the same leave animation as the back button before onBack.
  // `leaveSignal` only increments, so track the last seen value — a page that
  // mounts with an already-incremented signal must NOT trigger a leave.
  const prevLeaveSignal = useRef(leaveSignal)
  useEffect(() => {
    if (leaveSignal === prevLeaveSignal.current) return
    prevLeaveSignal.current = leaveSignal
    handleBack()
  }, [leaveSignal])

  return (
    <div
      className={`relative z-10 flex flex-col items-center justify-center h-full px-6 text-center transition-all duration-300 ease-in-out select-none ${
        leaving
          ? 'opacity-0 -translate-x-[50vw]'
          : leavingBack
            ? 'opacity-0 translate-x-[50vw]'
            : entered
              ? 'opacity-100 translate-x-0'
              : `opacity-0 ${enterFrom === 'left' ? '-translate-x-[50vw]' : 'translate-x-[50vw]'}`
      }`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Back button */}
      <BackButton onClick={handleBack} />

      {/* Centered content — same position as Hero */}
      <div className="flex flex-col items-center">

        {/* Carousel — same spot as Hero text */}
        <div className="relative flex items-center justify-center fade-in" style={{ width: 600, height: 280 }}>          {/* Left arrow */}
          <button
            onClick={goPrev}
            className="absolute left-0 z-20 font-pixel text-blue-300 text-5xl hover:text-white active:scale-90 transition-all duration-150 cursor-pointer px-4"
          >
            &lt;
          </button>

          {/* Cards */}
          {items.map((item, i) => {
            const wrapped = wrappedOffset(i, current, total)

            const isActive = wrapped === 0
            const absOffset = Math.abs(wrapped)
            const isNeighbor = absOffset <= 1
            const isEdge = absOffset === 2

            const translateX = wrapped * 180
            const scale = isActive ? 1 : isNeighbor ? 0.6 : 0.4
            const opacity = isActive ? 1 : isNeighbor ? 0.35 : 0
            const zIndex = 10 - absOffset

            return (
              <div
                key={item.id}
                className="absolute transition-all duration-300 ease-in-out"
                style={{
                  transform: `translateX(${translateX + (isActive ? dragX : 0)}px) scale(${isActive && hovered ? 1.05 : scale})`,
                  opacity,
                  zIndex,
                  pointerEvents: isEdge ? 'none' : 'auto',
                }}
              >
                <div
                  className={`transition-transform duration-150 ease-out ${isActive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
                  onMouseEnter={() => isActive && setHovered(true)}
                  onMouseLeave={() => { isActive && setHovered(false); if (isActive) handleDragEnd() }}
                  onWheel={isActive ? handleWheel : undefined}
                  onMouseDown={isActive ? handleDragStart : undefined}
                  onClick={isActive ? () => {
                    if (didDrag.current) return
                    setLeaving(true)
                    setTimeout(() => onSelect?.(item.id), 300)
                  } : undefined}
                  onMouseMove={isActive ? handleDragMove : undefined}
                  onMouseUp={isActive ? handleDragEnd : undefined}
                  onTouchStart={isActive ? handleDragStart : undefined}
                  onTouchMove={isActive ? handleDragMove : undefined}
                  onTouchEnd={isActive ? handleDragEnd : undefined}
                >
                  <PixelBorder size={isActive ? 192 : 140} padding={6} midShadow={4} glint={isActive}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img
                        src={item.img}
                        alt=""
                        draggable={false}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          imageRendering: 'auto',
                          transform: 'scale(0.9)',
                          userSelect: 'none',
                          filter: isActive && hovered ? 'blur(4px) brightness(0.7)' : 'none',
                          transition: 'filter 0.2s ease',
                        }}
                      />
                      {item.video && (
                        <video
                          ref={(el) => { videoRefs.current[i] = el }}
                          src={item.video}
                          loop
                          muted
                          playsInline
                          draggable={false}
                          preload={isActive ? 'auto' : isNeighbor ? 'metadata' : 'none'}
                          onCanPlay={() => {
                            setLoaded((prev) => ({ ...prev, [i]: true }))
                            if (current === i) videoRefs.current[i]?.play().catch(() => {})
                          }}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scale(1.5)',
                            imageRendering: 'auto',
                            userSelect: 'none',
                            opacity: loaded[i] ? 1 : 0,
                            filter: isActive && hovered ? 'blur(4px) brightness(0.7)' : 'none',
                            transition: 'opacity 0.3s ease, filter 0.2s ease',
                          }}
                        />
                      )}
                      {isActive && !loaded[i] && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className="font-pixel-sm text-white text-[10px] animate-pulse"
                            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                          >
                            Loading...
                          </span>
                        </div>
                      )}
                      {isActive && (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            background: hovered ? 'rgba(15, 23, 42, 0.4)' : 'transparent',
                            backdropFilter: hovered ? 'blur(2px)' : 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <span
                            className="font-pixel-sm text-white text-[10px] leading-relaxed px-3 text-center"
                            style={{
                              opacity: hovered ? 1 : 0,
                              transform: hovered ? 'translateY(0)' : 'translateY(4px)',
                              transition: 'all 0.2s ease',
                              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                            }}
                          >
                            Let's Go!
                          </span>
                        </div>
                      )}
                    </div>
                  </PixelBorder>
                </div>
              </div>
            )
          })}

          {/* Right arrow */}
          <button
            onClick={goNext}
            className="absolute right-0 z-20 font-pixel text-blue-300 text-5xl hover:text-white active:scale-90 transition-all duration-150 cursor-pointer px-4"
          >
            &gt;
          </button>
        </div>
                {/* Header — same spot as Hero photo */}
        <div className="mb-8">
          <PageHeader className="mb-0">{items[current].text}</PageHeader>
          <p className="font-pixel-sm text-blue-300 text-[10px] sm:text-xs mt-4 tracking-widest fade-in-delay">
            &gt; select one_
          </p>
        </div>
      </div>
    </div>
  )
}
