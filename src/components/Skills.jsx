import { useState, useEffect } from 'react'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import PageDots from './PageDots'
import InfoCard from './InfoCard'
import useArrowKeys from '../hooks/useArrowKeys'
import useCarouselLock from '../hooks/useCarouselLock'

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

export default function Skills({ onBack, leaveSignal }) {
  const [page, setPage] = useState(0)
  // Active navigation: { dir } while a slide is running.
  const [nav, setNav] = useState(null)
  // Becomes true one frame after nav starts — the incoming set then gets its
  // transition enabled so it slides from the direction-appropriate side.
  const [navRun, setNavRun] = useState(false)
  // Cards are non-interactable while a transition (entry, slide) is running.
  const { locked, lock } = useCarouselLock()
  const total = cards.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // All pages' card sets in slice form.
  const pages = Array.from({ length: pageCount }, (_, i) =>
    cards.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE)
  )

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

  // Keyboard navigation
  useArrowKeys(goNext, goPrev)

  return (
    <PageShell onBack={onBack} leaveSignal={leaveSignal}>
      <PageHeader>Skills</PageHeader>

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
                      <InfoCard heading={card.heading} content={card.content} />
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
      <PageDots count={pageCount} current={page} />
    </PageShell>
  )
}