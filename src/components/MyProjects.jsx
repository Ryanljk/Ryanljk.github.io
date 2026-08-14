import { useState, useEffect, useRef } from 'react'
import archcastVideo from '../assets/archcast.mp4'
import homieImage from '../assets/homie.png'
import snakewareImage from '../assets/snakeware.png'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import PageDots from './PageDots'
import PixelBorder from './PixelBorder'
import useArrowKeys from '../hooks/useArrowKeys'
import useCarouselLock from '../hooks/useCarouselLock'
import { wrappedOffset } from '../utils/wrappedOffset'
import { renderRich } from '../utils/renderRich'

// Single source of truth for card dimensions — every project card (id:1/2/3)
// uses these exact values so they are all identical and scale with the viewport.
const CARD = {
  width: 'clamp(460px, 62vw, 840px)',
  aspectRatio: '3 / 2',
}
const projects = [
  {
    id: 1,
    heading: 'Archcast',
    link: 'https://github.com/Ryanljk/archcast',
    video: archcastVideo, // import and set to a .mp4 to show a looping video
    img: null,   // import and set to an image to show a screenshot
    content: `A multiplayer speed-based card game, written in C++ and Go.

              Players discard cards to gain mana, which they spend to summon creatures or cast spells. Card drawing and battle phase occur at intervals, and there are no turns. 
              
              Victory relies on how fast you play.

              \`Frontend\`
              1. C++ game client with custom-made game engine
              2. Connects to backend game server using SSL-secured socket connection for duplex data transfer
              3. Features deck editor and card pack opening in addition to gameplay

              \`Backend\`
              1. Microservice architecture
              2. Authentication & Card services written in Go
              3. Game server logic written in C++ with multithreading to accomodate multiple matches
              4. Game server acts as single source of truth to handle speed-based gameplay

              \`Deployment\`
              1. Backend deployed onto AWS (ECS, load balancers, Route 53)
              2. Utilised Terraform for infrastructure provisioning`,
  },
  {
    id: 2,
    heading: 'H.O.M.I.E (UBS Final Year Project)',
    link: 'https://gitlab.com/fylstudios',
    video: null,
    img: homieImage,
    content: `Host Observability & Metrics Intelligence Engine
    
              A multi-service telemetry monitoring platform with AI-driven anomaly detection, written in Go, Python, and TypeScript.

              Scrapes real-time metrics from multiple applications onto a single dashboard with a world-map status view and automated alerting via Frontend UI, Telegram, and Email.

              \`Frontend\`
              1. React-based UI with a zoomable world map showing colour-coded (green/amber/red/black) service status
              2. Embedded Grafana dashboards for performance and summary visualization
              3. Alert panel with Resolve/Ignore actions, feeding ignored alerts back into model retraining

              \`Backend\`
              1. Microservices: Auth, Compiler (orchestrator), Scraper, Notification, TestApp (placeholder monolith apps)
              2. Auth service uses JWT with refresh tokens, Redis for sessions, PostgreSQL for accounts, bcrypt password hashing
              3. Prometheus (mTLS-secured scraping) feeds VictoriaMetrics time-series storage
              4. Scraper processes metrics and runs T.O.N.Y, a custom XGBoost-based anomaly detection model, on 3-minute data windows
              5. Compiler orchestrates alert processing/storage and pushes anomaly notifications through RabbitMQ to the Notification service

              \`AI Model - T.O.N.Y\`
              1. Three-stage pipeline: unsupervised binary classification (LSTM), human-in-the-loop manual relabeling, and semi-supervised XGBoost training with pseudo-labeling
              2. Optimised for F0.5 score to minimise false positives while retaining true anomaly detection
              3. Achieved 0.87 F0.5 score using rate-of-change feature engineering

              \`Deployment & DevOps\`
              1. Deployed on Amazon ECS (two clusters) with CloudFront/S3 frontend hosting, Amazon RDS, and Amazon MQ (RabbitMQ)
              2. GitLab CI/CD pipeline with SonarQube static analysis, integration/unit testing, k6 load and stress testing
              3. Agile delivery via 2-week sprints in Jira, pair programming, and biweekly sponsor/supervisor check-ins`,
  },
  {
    id: 3,
    heading: 'Snakeware',
    link: 'https://github.com/Ryanljk/snakeware',
    video: null,
    img: snakewareImage,
    content: `A python-based proof-of-concept ransomware designed to demonstrate encryption and recovery concepts in a safe setting. 
    
              It is NOT intended for usage as operational software, and should not be used outside of a controlled environment.

              \`Design\`
              1. Python executable compiled via Nuitka 
              2. Uses multithreading to concurrently encrypt user's files while they play the game

              \`Encryption\`
              1. Files are encrypted using AES-CBC (128-bit) and sent to the malicious actor via RSA (OAEP Padding with SHA-256)
              2. Symmetric key is delivered to a discord webhook and deleted from victim's machine

              \`Payload\`
              1. Powershell script is executed to automatically download the executable via Ducky USB from an AWS S3 bucket

              `,
  },
]

export default function MyProjects({ onBack, leaveSignal }) {
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState({})
  // Whether each card's description overflows its box, i.e. needs the scrollbar.
  const [textScroll, setTextScroll] = useState({})
  const textRefs = useRef({})
  const trackRefs = useRef({})
  const thumbRefs = useRef({})
  const videoRefs = useRef({})
  // Cards are non-interactable while a transition (entry, slide, flip) is running.
  const { locked, lock } = useCarouselLock()
  const total = projects.length

  // Only play a project's video while its card is flipped.
  useEffect(() => {
    projects.forEach((project) => {
      const video = videoRefs.current[project.id]
      if (!video) return
      if (flipped[project.id]) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
  }, [flipped])

  // Show the scrollbar only when a description overflows its box
  // (re-checks on resize and font load).
  useEffect(() => {
    const checkOverflow = () => {
      const next = {}
      projects.forEach((project) => {
        const el = textRefs.current[project.id]
        if (!el) return
        const overflows = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
        if (overflows !== !!textScroll[project.id]) next[project.id] = overflows
      })
      if (Object.keys(next).length) setTextScroll((prev) => ({ ...prev, ...next }))
    }

    let raf
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(checkOverflow)
    }
    schedule()
    window.addEventListener('resize', schedule)
    document.fonts && document.fonts.ready.then(schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
    }
  }, [textScroll])

  // Custom scrollbar: the native one is not reliably painted/interactive inside
  // the 3D flip context, so scrolling is driven manually (wheel, thumb drag,
  // track click) and the thumb position is synced via direct DOM writes.
  const syncThumb = (id) => {
    const p = textRefs.current[id]
    const track = trackRefs.current[id]
    const thumb = thumbRefs.current[id]
    if (!p || !track || !thumb) return
    const trackH = track.clientHeight
    const maxScroll = p.scrollHeight - p.clientHeight
    const thumbH = Math.max(20, trackH * (p.clientHeight / Math.max(1, p.scrollHeight)))
    thumb.style.height = `${thumbH}px`
    thumb.style.top = `${maxScroll > 0 ? (p.scrollTop / maxScroll) * (trackH - thumbH) : 0}px`
  }

  useEffect(() => {
    const cleanups = []
    projects.forEach((project) => {
      const p = textRefs.current[project.id]
      if (!p) return
      const onWheel = (e) => {
        if (p.scrollHeight > p.clientHeight) {
          e.preventDefault()
          p.scrollTop += e.deltaY
          syncThumb(project.id)
        }
      }
      const onScroll = () => syncThumb(project.id)
      p.addEventListener('wheel', onWheel, { passive: false })
      p.addEventListener('scroll', onScroll)
      syncThumb(project.id)
      cleanups.push(() => {
        p.removeEventListener('wheel', onWheel)
        p.removeEventListener('scroll', onScroll)
      })
    })
    return () => cleanups.forEach((fn) => fn())
  }, [textScroll])

  const goNext = () => {
    const outgoingId = projects[current].id
    setCurrent((prev) => (prev + 1) % total)
    // After the slide completes, reset a flipped outgoing card to its text side.
    lock(() => setFlipped((prev) => (prev[outgoingId] ? { ...prev, [outgoingId]: false } : prev)))
  }
  const goPrev = () => {
    const outgoingId = projects[current].id
    setCurrent((prev) => (prev - 1 + total) % total)
    lock(() => setFlipped((prev) => (prev[outgoingId] ? { ...prev, [outgoingId]: false } : prev)))
  }

  const toggleFlip = (id) => {
    if (locked) return
    lock()
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Keyboard navigation
  useArrowKeys(goNext, goPrev)

  return (
    <PageShell onBack={onBack} onLeave={lock} leaveSignal={leaveSignal}>
      <PageHeader>My Projects</PageHeader>

      {/* Carousel — arrows + card together */}
      <div className="relative flex items-center justify-center gap-4 sm:gap-6">
        {/* Left arrow */}
        <button
          onClick={goPrev}
          className="relative z-20 font-pixel text-blue-300 text-4xl sm:text-5xl hover:text-white active:scale-90 transition-all duration-10 cursor-pointer shrink-0"
        >
          &lt;
        </button>

        {/* Card stack — Gallery-style: all cards absolutely stacked, positioned by
            offset from `current`, animated with a single continuous CSS transition
            instead of a JS-driven two-phase slide-out/slide-in. */}
        <div
          className="relative shrink-0"
          style={{ width: CARD.width, aspectRatio: CARD.aspectRatio }}
        >
          {projects.map((project, i) => {
            const wrapped = wrappedOffset(i, current, total)
            const isActive = wrapped === 0

            return (
              <div
                key={project.id}
                className="absolute inset-0"
                style={{
                  transition: 'transform 300ms ease-in-out, opacity 300ms ease-in-out',
                  transform: `translate3d(${wrapped * 100}%, 0, 0)`,
                  willChange: 'transform',
                  perspective: '1000px',
                  opacity: isActive ? 1 : 0,
                  zIndex: isActive ? 10 : 0,
                  pointerEvents: isActive && !locked ? 'auto' : 'none',
                }}
              >
                {/* Flip container — rotates between front (text) and back (media) */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 300ms ease-in-out',
                    transform: flipped[project.id] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  <PixelBorder fill preserve3d>
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                          {/* FRONT — text only */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              WebkitBackfaceVisibility: 'hidden',
                              backfaceVisibility: 'hidden',
                              pointerEvents: flipped[project.id] ? 'none' : 'auto',
                              background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              justifyContent: 'flex-start',
                              padding: 'clamp(16px, 1vh, 32px) clamp(20px, 3vw, 32px)',
                              boxSizing: 'border-box',
                              overflow: 'hidden',
                              imageRendering: 'pixelated',
                            }}
                          >
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="font-pixel text-white hover:text-blue-300 text-sm sm:text-base md:text-lg tracking-wider mb-1 text-left w-full transition-colors duration-200 cursor-pointer flex-shrink-0"
                            >
                              {project.heading} ↗
                            </a>
                            <div className="h-px bg-blue-300 opacity-40 mb-3 w-full flex-shrink-0" />
                            <div
                              style={{
                                position: 'relative',
                                flex: 1,
                                minHeight: 0,
                                display: 'flex',
                                width: '100%',
                              }}
                            >
                              <p
                                ref={(el) => { textRefs.current[project.id] = el }}
                                className="font-pixel-sm text-blue-300 text-[7px] sm:text-[10px] leading-relaxed text-left min-h-0"
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  whiteSpace: 'pre-line',
                                  overflow: 'hidden',
                                  wordBreak: 'break-word',
                                }}
                              >
                                {renderRich(project.content)}
                              </p>
                              {textScroll[project.id] && (
                                <div
                                  ref={(el) => { trackRefs.current[project.id] = el }}
                                  onClick={(e) => {
                                    const p = textRefs.current[project.id]
                                    const track = trackRefs.current[project.id]
                                    const thumb = thumbRefs.current[project.id]
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
                                    syncThumb(project.id)
                                  }}
                                  className="ml-2 cursor-pointer"
                                  style={{
                                    width: 10,
                                    flexShrink: 0,
                                    background: '#1e293b',
                                    position: 'relative',
                                  }}
                                >
                                  <div
                                    ref={(el) => { thumbRefs.current[project.id] = el }}
                                    onMouseDown={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      const p = textRefs.current[project.id]
                                      const track = trackRefs.current[project.id]
                                      const thumb = thumbRefs.current[project.id]
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
                                        syncThumb(project.id)
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
                            <button
                              onClick={() => toggleFlip(project.id)}
                              className="font-pixel-sm text-white text-[9px] sm:text-[11px] tracking-widest hover:text-blue-300 transition-colors duration-100 cursor-pointer flex-shrink-0 mt-3 px-3 py-1 select-none"
                              style={{ alignSelf: 'end', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                            >
                              &lt; Flip Me! &gt;
                            </button>
                          </div>

                          {/* BACK — media only (video / image / placeholder), fills the card */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              WebkitBackfaceVisibility: 'hidden',
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)',
                              pointerEvents: flipped[project.id] ? 'auto' : 'none',
                              background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
                              overflow: 'hidden',
                            }}
                          >
                            {project.video ? (
                              <video
                                ref={(el) => { videoRefs.current[project.id] = el }}
                                src={project.video}
                                loop
                                muted
                                playsInline
                                preload="auto"
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  objectPosition: '50% 50%',
                                  imageRendering: 'auto',
                                  display: 'block',
                                  transform: 'scale(1) translateZ(0)',
                                }}
                              />
                            ) : project.img ? (
                              <img
                                src={project.img}
                                alt={`${project.heading} screenshot`}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  objectPosition: '50% 50%',
                                  imageRendering: 'auto',
                                  transform: 'translateZ(0)',
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <span className="font-pixel-sm text-blue-400 text-[8px] opacity-40">
                                  screenshot
                                </span>
                              </div>
                            )}
                            <button
                              onClick={() => toggleFlip(project.id)}
                              className="font-pixel-sm text-white text-[9px] sm:text-[11px] tracking-widest hover:text-blue-300 transition-colors duration-100 cursor-pointer px-3 py-1 select-none"
                              style={{
                                position: 'absolute',
                                bottom: 'clamp(16px, 1vh, 32px)',
                                left: 'clamp(20px, 3vw, 32px)',
                                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                              }}
                            >
                              &lt; Flip Back! &gt;
                            </button>
                          </div>
                        </div>
                  </PixelBorder>
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
      <PageDots count={total} current={current} />
    </PageShell>
  )
}