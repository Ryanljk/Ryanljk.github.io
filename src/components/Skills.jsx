import { useState, useEffect, useRef } from 'react'

// Rich text: words wrapped in backticks (`word`) in `content` strings are
// rendered as highlighted spans (white + glow) instead of plain blue text.
const renderRich = (text) =>
  text.split('`').map((part, i) =>
    i % 2 === 1 ? (
      <span
        key={i}
        className="text-white"
        style={{ textShadow: '0 0 10px rgba(59,130,246,0.5)' }}
      >
        {part}
      </span>
    ) : (
      part
    )
  )

// Cards per page.
const PAGE_SIZE = 3

const cards = [
  {
    id: 1,
    heading: 'Languages',
    content: `C

              C++
              
              Go
              
              Python

              Java
                            
              JavaScript

              TypeScript
              
              PHP

              SQL`,
  },
  {
    id: 2,
    heading: 'Frameworks & Libraries',
    content: `\`Frontend\`
              1. React

              \`Backend\`
              1. Spring Boot
              2. Gin
              3. Flask
              4. FastAPI
              5. Apache Camel
              
              \`GameDev\`
              1. SDL2
              2. Godot (Engine)`,
  },
  {
    id: 3,
    heading: 'Databases',
    content: `MySQL
              
              PostgreSQL
              
              MongoDB
              
              Redis`,
  },
  {
    id: 4,
    heading: 'Cloud & DevOps',
    content: `AWS
              
              Docker
              
              Kubernetes
              
              Redis`,
  },
  {
    id: 5,
    heading: 'Network & Messaging',
    content: `TCP Sockets

              gRPC
              
              AMQP (RabbitMQ)
              
              Reverse Proxies (NGINX, Traefik)`,
  },
    {
    id: 6,
    heading: 'Observability',
    content: `Prometheus

              Grafana
              
              Loki
              
              cAdvisor
              
              VictoriaMetrics`,
  },

  {
    id: 7,
    heading: 'Tools',
    content: `Linux

              Git

              Burp Suite
              
              Wireshark
              
              QGIS
              
              Blender`,
  }
]

function PixelCard({ children }) {
  return (
    <div className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: 5,
          background: '#0f172a',
          boxSizing: 'border-box',
          boxShadow: `
            4px 0 0 0 #1e293b,
            -4px 0 0 0 #1e293b,
            0 4px 0 0 #1e293b,
            0 -4px 0 0 #1e293b,
            4px 4px 0 0 #0f172a,
            -4px -4px 0 0 #0f172a,
            4px -4px 0 0 #0f172a,
            -4px 4px 0 0 #0f172a
          `,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: 4,
            background: '#334155',
            boxSizing: 'border-box',
            boxShadow: `
              3px 0 0 0 #475569,
              -3px 0 0 0 #475569,
              0 3px 0 0 #475569,
              0 -3px 0 0 #475569
            `,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              padding: 3,
              background: '#64748b',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '24px 16px',
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Skills({ onBack }) {
  const [page, setPage] = useState(0)
  // Page-level entry transition (set once on mount).
  const [entered, setEntered] = useState(false)
  const [leaving, setLeaving] = useState(false)
  // Active navigation: { dir } while a slide is running.
  const [nav, setNav] = useState(null)
  // Becomes true one frame after nav starts — the incoming set then gets its
  // transition enabled so it slides from the direction-appropriate side.
  const [navRun, setNavRun] = useState(false)
  // Cards are non-interactable while a transition (entry, slide) is running.
  const [locked, setLocked] = useState(true)
  const lockTimer = useRef(null)
  const total = cards.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // All pages' card sets in slice form.
  const pages = Array.from({ length: pageCount }, (_, i) =>
    cards.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE)
  )

  const lock = (onUnlock) => {
    setLocked(true)
    clearTimeout(lockTimer.current)
    lockTimer.current = setTimeout(() => {
      setLocked(false)
      onUnlock?.()
    }, 350)
  }

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true))
    const t = setTimeout(() => setLocked(false), 400)
    return () => clearTimeout(t)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pageCount])

  // Drive the two-phase slide: snap the incoming set to its direction-appropriate
  // start (frame 1), then enable its transition so it slides into place (frame 2).
  useEffect(() => {
    if (!nav) return
    const raf = requestAnimationFrame(() => setNavRun(true))
    const t = setTimeout(() => {
      setNav(null)
      setNavRun(false)
    }, 320)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
    }
  }, [nav])

  const goNext = () => {
    if (locked) return
    lock()
    setNav({ dir: 'next' })
    setNavRun(false)
    setPage((p) => (p + 1) % pageCount)
  }
  const goPrev = () => {
    if (locked) return
    lock()
    setNav({ dir: 'prev' })
    setNavRun(false)
    setPage((p) => (p - 1 + pageCount) % pageCount)
  }

  const handleBack = () => {
    setLeaving(true)
    setTimeout(() => onBack(), 300)
  }

  return (
    <div
      className={`relative z-10 flex flex-col items-center justify-center h-full px-6 text-center transition-all duration-300 ease-in-out select-none ${
        leaving
          ? 'opacity-0 translate-x-[50vw]'
          : entered
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-[50vw]'
      }`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 font-pixel-sm text-blue-300 text-[18px] tracking-widest hover:text-white transition-colors duration-200 cursor-pointer z-20"
      >
        &lt; back
      </button>

      {/* Header */}
      <h1
        className="font-pixel text-white text-3xl sm:text-4xl md:text-5xl tracking-wider mb-6 fade-in"
        style={{ textShadow: '0 0 20px rgba(59,130,246,0.4)' }}
      >
        Skills
      </h1>

      {/* Carousel — arrows + set of cards together */}
      <div className="relative flex items-center justify-center gap-4 sm:gap-6">
        {/* Left arrow */}
        <button
          onClick={goPrev}
          className="relative z-20 font-pixel text-blue-300 text-4xl sm:text-5xl hover:text-white active:scale-90 transition-all duration-10 cursor-pointer shrink-0"
        >
          &lt;
        </button>

        {/* Card stack — every page's set stays mounted, absolutely stacked and
            positioned by offset from `page`, so the outgoing and incoming sets
            animate together in one continuous transition (Gallery/MyProjects
            style). Fewer than 3 cards (last page) are centered. */}
        <div
          className="relative shrink-0 w-[574px] sm:w-[696px] md:w-[848px] lg:w-[938px] h-[255px] sm:h-[300px] md:h-[360px] lg:h-[405px]"
        >
          {pages.map((set, pi) => {
            const offset = ((pi - page + pageCount) % pageCount)
            const wrapped =
              offset > Math.floor(pageCount / 2) ||
              (pageCount % 2 === 0 && offset === pageCount / 2)
                ? offset - pageCount
                : offset

            // Resting position (no active navigation).
            let transform = `translateX(${wrapped * 100}%)`
            let transition = 'none'
            let opacity = wrapped === 0 ? 1 : 0
            let zIndex = wrapped === 0 ? 10 : 0

            if (nav) {
              // Outgoing set: slides out opposite the arrow direction.
              if (pi === (nav.dir === 'next'
                ? (page - 1 + pageCount) % pageCount
                : (page + 1) % pageCount)) {
                transform = nav.dir === 'next' ? 'translateX(-100%)' : 'translateX(100%)'
                transition = 'transform 300ms ease-in-out, opacity 300ms ease-in-out'
                opacity = 0
                zIndex = 5
              } else if (pi === page) {
                // Incoming set: snaps to its start side (frame 1, no transition),
                // then slides into place (frame 2) — from the arrow direction.
                transform = navRun
                  ? 'translateX(0)'
                  : nav.dir === 'next'
                    ? 'translateX(100%)'
                    : 'translateX(-100%)'
                transition = navRun
                  ? 'transform 300ms ease-in-out, opacity 300ms ease-in-out'
                  : 'none'
                opacity = navRun ? 1 : 0
                zIndex = 10
              }
            }

            return (
              <div
                key={pi}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transition,
                  transform,
                  opacity,
                  zIndex,
                  pointerEvents: zIndex === 10 && !locked ? 'auto' : 'none',
                }}
              >
                <div className="flex gap-8 sm:gap-12 md:gap-16">
                  {set.map((card) => (
                    <div
                      key={card.id}
                      className="w-[170px] sm:w-[200px] md:w-[240px] lg:w-[270px]"
                      style={{ aspectRatio: '2 / 3' }}
                    >
                      <PixelCard>
                        <h2 className="font-pixel text-white text-base sm:text-lg tracking-wider mb-3 text-left w-full">
                          {card.heading}
                        </h2>
                        <div className="h-px bg-blue-300 opacity-40 mb-3 w-full" />
                        <p
                          className="font-pixel-sm text-blue-300 text-[8px] sm:text-[10px] leading-relaxed text-left w-full"
                          style={{ whiteSpace: 'pre-line' }}
                        >
                          {renderRich(card.content)}
                        </p>
                      </PixelCard>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={goNext}
          className="relative z-20 font-pixel text-blue-300 text-4xl sm:text-5xl hover:text-white active:scale-90 transition-all duration-10 cursor-pointer shrink-0"
        >
          &gt;
        </button>
      </div>

      {/* Page indicator */}
      <div className="flex gap-2 mt-6">
        {Array.from({ length: pageCount }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 transition-all duration-200"
            style={{
              background: i === page ? '#93c5fd' : '#334155',
            }}
          />
        ))}
      </div>
    </div>
  )
}