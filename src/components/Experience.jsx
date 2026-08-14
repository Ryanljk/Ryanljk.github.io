import { useState, useEffect, useRef } from 'react'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import PageDots from './PageDots'
import PixelBorder from './PixelBorder'
import InfoCard from './InfoCard'
import useArrowKeys from '../hooks/useArrowKeys'
import useCarouselLock from '../hooks/useCarouselLock'
import photo from '../assets/photo.png'
import jtcImage from '../assets/jtc.png'
import integrumImage from '../assets/integrum.png'
import govtechImage from '../assets/govtech.png'
// TODO: replace with real pictures + descriptions
const POSITIONS = [
  {
    id: 1,
    img: jtcImage,
    heading: 'Software Engineer Intern',
    company: 'JTC Corporation, Smart District Division',
    dates: 'May 2024 - Aug 2024',
    desc: [
      "Development of digital twin software for Punggol Digital District (PDD)",
      'Exploratory research for feasibility of data migration to open source-alternatives',
    ],
    tech: ['Spring Boot', 'Apache Camel', 'RabbitMQ', 'Docker','RedHat idM', 'Keycloak'],
  },
  {
    id: 2,
    img: integrumImage,
    heading: 'Software Engineer Intern',
    company: 'Integrum Global',
    dates: 'May 2025 - Aug 2025',
    desc: [
      'Design, development and deployment of various SaaS agentic AI service products',
      'Developed executive summary dashboard that allowed for live monitoring of service health and data traffic flow, including an automated dashboard modification pipeline that allowed for instant updates to dashboard configurations via YAML files',
      'Developed a rule-based classification model to differentiate between digital and photographed receipts',
      'Exploratory research on integrating SonarQube into the DevOps pipeline, using a self-hosted GitHub runner'
    ],
    tech: ['FastAPI', 'AWS', 'PostgreSQL', 'Docker', 'Prometheus', 'Grafana', 'Loki'],
  },
  {
    id: 3,
    img: govtechImage,
    heading: 'Associate Software Engineer',
    company: 'GovTech Singapore, GTC (GovTech Consulting)',
    dates: 'July 2026 - Present',
    desc: [
      'Rapid prototype development for ideating client use cases',
      'Modernisation of legacy software systems (architecture, infrastructure, codebase, etc.)',
      'Automation of manual client workflows',
      'Implementation of agent harnesses into existing workflows',
    ],
    tech: ['React', 'Spring Boot'],
  },
]

// Timeline geometry — fixed px so connector lines stay exact; the whole
// timeline is scaled down on small screens via CSS instead.
const CONTAINER_W = 800
const CONTAINER_H = 460
const SLOT_W = 260 // horizontal distance between consecutive slot centers
const CARD_BOX = 160 // visible PixelBorder size (inner picture is 136)
// Per-slot card offset from the slot's center. Cards are equally spaced
// horizontally; the stagger is vertical only: upper-left, down-right, then
// vertical center — each successive card converging on the center line.
const LAYOUT = [
  { x: 0, y: -90 },
  { x: 0, y: 60 },
  { x: 0, y: 0 },
]
const PAGE_SIZE = 3 // navigation moves in sets of 3 cards

export default function Experience({ onBack, leaveSignal }) {
  const [current, setCurrent] = useState(0)
  const [hoveredId, setHoveredId] = useState(null)
  // Which card images have finished loading (mask loading with the label).
  const [loadedImg, setLoadedImg] = useState({})
  const [selected, setSelected] = useState(null) // position opened as a detail card
  const [entering, setEntering] = useState(false) // drawer slide-in animation
  const [closing, setClosing] = useState(false) // drawer slide-out animation
  const [needsScroll, setNeedsScroll] = useState(false) // description overflows its box
  const descRef = useRef(null)
  const trackRef = useRef(null)
  const thumbRef = useRef(null)
  const { locked, lock } = useCarouselLock()
  const containerRef = useRef(null)
  const total = POSITIONS.length
  const maxCurrent = Math.max(0, total - 3)
  const pageCount = maxCurrent + 1

  // Latest handlers in refs so the wheel listener (registered once) never
  // captures a stale `locked` value.
  const goNextRef = useRef(null)
  const goPrevRef = useRef(null)
  useEffect(() => {
    goNextRef.current = goNext
    goPrevRef.current = goPrev
  })

  const goNext = () => {
    if (locked || selected) return
    lock()
    setCurrent((p) => Math.min(p + PAGE_SIZE, maxCurrent))
  }
  const goPrev = () => {
    if (locked || selected) return
    lock()
    setCurrent((p) => Math.max(p - PAGE_SIZE, 0))
  }

  // Slide the detail card up from the bottom; clicking another card while
  // open just swaps its content.
  const handleSelect = (pos) => {
    if (selected) {
      setSelected(pos)
      return
    }
    setSelected(pos)
    setEntering(true)
  }
  const close = () => {
    setClosing(true)
    setTimeout(() => {
      setSelected(null)
      setClosing(false)
      setEntering(false)
    }, 300)
  }

  // Flip `entering` off on the next frame so the drawer animates in.
  useEffect(() => {
    if (!selected || !entering) return
    const raf = requestAnimationFrame(() => setEntering(false))
    return () => cancelAnimationFrame(raf)
  }, [entering, selected])

  // Show the scrollbar only when the description overflows its box
  // (re-checks on resize and font load).
  useEffect(() => {
    const el = descRef.current
    if (!el) return
    const check = () => {
      setNeedsScroll(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
    }
    let raf
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(check)
    }
    schedule()
    window.addEventListener('resize', schedule)
    document.fonts && document.fonts.ready.then(schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
    }
  }, [selected])

  // Custom scrollbar (same pattern as MyProjects): the native one is not
  // reliably painted/interactive here, so scrolling is driven manually (wheel,
  // thumb drag, track click) and the thumb position is synced via direct DOM
  // writes.
  useEffect(() => {
    const p = descRef.current
    if (!p) return
    const syncThumb = () => {
      const track = trackRef.current
      const thumb = thumbRef.current
      if (!track || !thumb) return
      const trackH = track.clientHeight
      const maxScroll = p.scrollHeight - p.clientHeight
      const thumbH = Math.max(20, trackH * (p.clientHeight / Math.max(1, p.scrollHeight)))
      thumb.style.height = `${thumbH}px`
      thumb.style.top = `${maxScroll > 0 ? (p.scrollTop / maxScroll) * (trackH - thumbH) : 0}px`
    }
    const onWheel = (e) => {
      if (p.scrollHeight > p.clientHeight) {
        e.preventDefault()
        p.scrollTop += e.deltaY
        syncThumb()
      }
    }
    const onScroll = syncThumb
    p.addEventListener('wheel', onWheel, { passive: false })
    p.addEventListener('scroll', onScroll)
    syncThumb()
    return () => {
      p.removeEventListener('wheel', onWheel)
      p.removeEventListener('scroll', onScroll)
    }
  }, [selected, needsScroll])

  useArrowKeys(goNext, goPrev)

  // Mousewheel navigation on the timeline.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      if (e.deltaY > 0) goNextRef.current()
      else goPrevRef.current()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const visible = POSITIONS.slice(current, current + 4)
  // Slot current+1 (the middle card) is anchored at the container center;
  // the strip travels left as `current` advances.
  const translateX = -(current + 1) * SLOT_W + CONTAINER_W / 2

  return (
    <PageShell onBack={onBack} leaveSignal={leaveSignal}>
      <PageHeader>Experience</PageHeader>

      <div className="scale-[0.62] sm:scale-[0.68] lg:scale-[0.85] xl:scale-100">
        <div className="flex items-center gap-2">
          {/* Left arrow */}
          <button
            onClick={goPrev}
            className="font-pixel text-blue-300 text-4xl sm:text-5xl hover:text-white active:scale-90 transition-all duration-10 cursor-pointer shrink-0"
          >
            &lt;
          </button>

          <div
            ref={containerRef}
            className="relative overflow-hidden"
            style={{ width: CONTAINER_W, height: CONTAINER_H }}
          >
            {/* Scrolling timeline strip — cards and lines move together */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                transform: `translate3d(${translateX}px, 0, 0)`,
                transition: 'transform 300ms ease-in-out',
                willChange: 'transform',
              }}
            >
              {/* Connector lines between adjacent cards (behind the cards) */}
              <svg
                width={CONTAINER_W}
                height={CONTAINER_H}
                style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}
              >
                {visible.slice(0, 2).map((_, i) => {
                  const p = current + i
                  const a = LAYOUT[((p % 3) + 3) % 3]
                  const b = LAYOUT[(((p + 1) % 3) + 3) % 3]
                  const x1 = p * SLOT_W + a.x + CARD_BOX / 2
                  const y1 = CONTAINER_H / 2 + a.y
                  const x2 = (p + 1) * SLOT_W + b.x - CARD_BOX / 2
                  const y2 = CONTAINER_H / 2 + b.y
                  return (
                    <line
                      key={p}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#93c5fd"
                      strokeOpacity={0.35}
                      strokeWidth={2}
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                    />
                  )
                })}
              </svg>

              {visible.map((pos) => {
                const slot = pos.id - 1 - current
                const layout = LAYOUT[(pos.id - 1) % 3]
                const slotX = (pos.id - 1) * SLOT_W
                const hovered = hoveredId === pos.id
                return (
                  <div
                    key={pos.id}
                    style={{
                      position: 'absolute',
                      left: slotX + layout.x - CARD_BOX / 2,
                      top: CONTAINER_H / 2 + layout.y - CARD_BOX / 2,
                      width: CARD_BOX,
                      height: CARD_BOX,
                      opacity: slot <= 2 ? 1 : 0,
                      transition: 'opacity 300ms ease-in-out',
                      zIndex: 1,
                    }}
                  >
                    <div
                      className="transition-transform duration-150 ease-out cursor-pointer hover:scale-105 active:scale-95"
                      onMouseEnter={() => setHoveredId(pos.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => handleSelect(pos)}
                    >
                      <PixelBorder fill>
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <img
                            src={pos.img}
                            alt=""
                            draggable={false}
                            ref={(el) => {
                              if (el && el.complete && el.naturalWidth > 0)
                                setLoadedImg((prev) => (prev[pos.id] ? prev : { ...prev, [pos.id]: true }))
                            }}
                            onLoad={() => setLoadedImg((prev) => (prev[pos.id] ? prev : { ...prev, [pos.id]: true }))}
                            style={{
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              imageRendering: 'auto',
                              transform: 'scale(1.5)',
                              userSelect: 'none',
                              opacity: loadedImg[pos.id] ? 1 : 0,
                              filter: hovered ? 'blur(4px) brightness(0.7)' : 'none',
                              transition: 'opacity 0.3s ease, filter 0.2s ease',
                            }}
                          />
                          {!loadedImg[pos.id] && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className="font-pixel-sm text-white text-[10px] animate-pulse"
                                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                              >
                                Loading...
                              </span>
                            </div>
                          )}
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
                              {pos.heading}
                            </span>
                          </div>
                        </div>
                      </PixelBorder>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={goNext}
            className="font-pixel text-blue-300 text-4xl sm:text-5xl hover:text-white active:scale-90 transition-all duration-10 cursor-pointer shrink-0"
          >
            &gt;
          </button>
        </div>
      </div>

      <PageDots count={pageCount} current={current / PAGE_SIZE} />

      {/* Detail card sliding up from the bottom */}
      {selected && (
        <div className="absolute inset-0 z-20 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            style={{
              opacity: entering || closing ? 0 : 1,
              transition: 'opacity 300ms ease-in-out',
              pointerEvents: entering || closing ? 'none' : 'auto',
            }}
            onClick={close}
          />
          {/* Card */}
          <div
            className="absolute bottom-0 left-0"
            style={{
              transform: `translateY(${entering || closing ? 105 : 0}%)`,
              transition: 'transform 300ms ease-in-out',
              width: '100%',
              height: 320,
            }}
          >
            <InfoCard
              header={
                <div
                  className="mb-3"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div>
                    <h3 className="font-pixel text-white text-sm sm:text-base tracking-wider">
                      {selected.heading}
                    </h3>
                    <p className="font-pixel-sm text-blue-300 text-[10px] mt-1.5">{selected.company}</p>
                    <p className="font-pixel-sm text-slate-400 text-[10px] mt-0.5">{selected.dates}</p>
                  </div>
                  <button
                    onClick={close}
                    className="font-pixel text-slate-400 hover:text-white text-lg cursor-pointer shrink-0 leading-none"
                  >
                    ▼
                  </button>
                </div>
              }
              contentStyle={{ padding: '20px 22px', alignItems: 'stretch' }}
            >
              <div style={{ textAlign: 'left', marginBottom: 10 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selected.tech.map((t) => (
                      <span
                        key={t}
                        className="font-pixel-sm text-blue-300 text-[9px] px-2 py-0.5"
                        style={{ border: '1px solid rgba(147,197,253,0.4)', background: 'rgba(30,58,138,0.25)' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', width: '100%', flex: 1, minHeight: 0 }}>
                  <ul
                    ref={descRef}
                    className="font-pixel-sm text-slate-300 text-[10px] leading-relaxed"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      minHeight: 0,
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      textAlign: 'left',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                    }}
                  >
                    {selected.desc.map((d, i) => (
                      <li
                        key={i}
                        style={{ display: 'flex', gap: 8, marginBottom: 6 }}
                      >
                        <span className="text-blue-400 shrink-0">-</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  {needsScroll && (
                    <div
                      ref={trackRef}
                      onClick={(e) => {
                        const p = descRef.current
                        const track = trackRef.current
                        const thumb = thumbRef.current
                        if (!p || !track || !thumb) return
                        const rect = track.getBoundingClientRect()
                        const y = e.clientY - rect.top
                        const thumbTop = thumb.offsetTop
                        const thumbH = thumb.clientHeight
                        if (y >= thumbTop && y <= thumbTop + thumbH) return
                        const maxScroll = p.scrollHeight - p.clientHeight
                        const maxTop = Math.max(1, track.clientHeight - thumbH)
                        const target =
                          (Math.max(0, Math.min(maxTop, y - thumbH / 2)) / maxTop) * maxScroll
                        p.scrollTop = Math.max(0, Math.min(maxScroll, target))
                        p.dispatchEvent(new Event('scroll'))
                      }}
                      className="ml-2 cursor-pointer"
                      style={{ width: 10, flexShrink: 0, background: '#1e293b', position: 'relative' }}
                    >
                      <div
                        ref={thumbRef}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const p = descRef.current
                          const track = trackRef.current
                          const thumb = thumbRef.current
                          if (!p || !track || !thumb) return
                          const maxScroll = p.scrollHeight - p.clientHeight
                          const trackH = track.clientHeight
                          const thumbH = thumb.clientHeight
                          const maxTop = Math.max(1, trackH - thumbH)
                          const startY = e.clientY
                          const startScroll = p.scrollTop
                          const onMove = (ev) => {
                            const dy = ev.clientY - startY
                            p.scrollTop = Math.max(
                              0,
                              Math.min(maxScroll, startScroll + (dy / maxTop) * maxScroll),
                            )
                            p.dispatchEvent(new Event('scroll'))
                          }
                          const onUp = () => {
                            window.removeEventListener('mousemove', onMove)
                            window.removeEventListener('mouseup', onUp)
                          }
                          window.addEventListener('mousemove', onMove)
                          window.addEventListener('mouseup', onUp)
                        }}
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: 0,
                          height: 20,
                          background: '#475569',
                          cursor: 'grab',
                        }}
                      />
                    </div>
                  )}
                </div>
            </InfoCard>
          </div>
        </div>
      )}
    </PageShell>
  )
}