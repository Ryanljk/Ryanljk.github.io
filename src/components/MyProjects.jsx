import { useState, useEffect, useRef } from 'react'
import archcastVideo from '../assets/archcast.mp4'

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
    link: 'https://github.com/Ryanljk/speedcardgame',
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
    heading: 'H.O.M.I.E',
    link: 'https://gitlab.com/fylstudios',
    video: null,
    img: null,
    content: `H.O.M.I.E (Host Observability & Metrics Intelligence Engine), a multi-service telemetry monitoring platform with AI-driven anomaly detection, written in Go, Python, and TypeScript.

              Scrapes real-time metrics from multiple existing applications onto a single dashboard with a world-map status view and automated alerting via Frontend UI, Telegram, and Email.

              \`Frontend\`
              1. React-based UI with a zoomable world map showing colour-coded (green/amber/red/black) service status
              2. Embedded Grafana dashboards for performance and summary visualization
              3. Alert panel with Resolve/Ignore actions, feeding ignored alerts back into model retraining

              \`Backend\`
              1. Microservices: Auth, Compiler (orchestrator), Scraper, Notification, TestApp
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
    heading: 'Project Three',
    link: 'https://github.com/your-username/project-three',
    video: null,
    img: null,
    content: `Description of your third project.

Tech stack, key features, and links go here.`,
  },
]

export default function MyProjects({ onBack }) {
  const [current, setCurrent] = useState(0)
  const [entered, setEntered] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [flipped, setFlipped] = useState({})
  // Per-card description font size, shrunk on demand so text never overflows.
  const [textSize, setTextSize] = useState({})
  const [textScroll, setTextScroll] = useState({})
  const textRefs = useRef({})
  const trackRefs = useRef({})
  const thumbRefs = useRef({})
  const videoRefs = useRef({})
  // Cards are non-interactable while a transition (entry, slide, flip) is running.
  const [locked, setLocked] = useState(true)
  const lockTimer = useRef(null)
  const total = projects.length

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [current])

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

  // Shrink-to-fit: whenever a description overflows its box, instantly reduce
  // its font size until it fits (re-checks on resize and font load).
  useEffect(() => {
    const fitText = () => {
      const next = {}
      const nextScroll = {}
      projects.forEach((project) => {
        const el = textRefs.current[project.id]
        if (!el) return
        const restore = textSize[project.id] != null ? `${textSize[project.id]}px` : ''
        const currentSize = parseFloat(window.getComputedStyle(el).fontSize)
        let best = 7
        for (let s = 7; s <= 9; s += 0.5) {
          el.style.fontSize = `${s}px`
          const ok = el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth
          if (ok) best = s
          else if (s > best) break
        }
        el.style.fontSize = `${best}px`
        const fits = el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth
        el.style.fontSize = restore
        if (best !== currentSize) next[project.id] = best
        if (!fits !== !!textScroll[project.id]) nextScroll[project.id] = !fits
      })
      if (Object.keys(next).length) setTextSize((prev) => ({ ...prev, ...next }))
      if (Object.keys(nextScroll).length) setTextScroll((prev) => ({ ...prev, ...nextScroll }))
    }

    let raf
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(fitText)
    }
    schedule()
    window.addEventListener('resize', schedule)
    document.fonts && document.fonts.ready.then(schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
    }
  }, [textSize])

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
  }, [textSize, textScroll])

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

  const handleBack = () => {
    lock()
    setLeaving(true)
    setTimeout(() => onBack(), 300)
  }

  return (
    <div
      className={`relative z-10 flex flex-col items-center justify-center h-full px-6 text-center select-none ${
        leaving ? 'opacity-0' : entered ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transition: 'transform 300ms ease-in-out, opacity 300ms ease-in-out',
        transform: leaving ? 'translate3d(50vw, 0, 0)' : entered ? 'translate3d(0, 0, 0)' : 'translate3d(50vw, 0, 0)',
        willChange: 'transform',
      }}
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
        My Projects
      </h1>

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
            const offset = ((i - current + total) % total)
            const wrapped = offset > Math.floor(total / 2) ? offset - total : offset
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
                  <div
                    style={{
                      padding: 5,
                      background: '#0f172a',
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
                      height: '100%',
                      boxSizing: 'border-box',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div
                      style={{
                        padding: 4,
                        background: '#334155',
                        boxShadow: `
                          3px 0 0 0 #475569,
                          -3px 0 0 0 #475569,
                          0 3px 0 0 #475569,
                          0 -3px 0 0 #475569
                        `,
                        height: '100%',
                        boxSizing: 'border-box',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      <div
                        style={{
                          padding: 3,
                          background: '#64748b',
                          height: '100%',
                          boxSizing: 'border-box',
                          transformStyle: 'preserve-3d',
                        }}
                      >
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
                                className="font-pixel-sm text-blue-300 text-[7px] sm:text-[9px] leading-relaxed text-left min-h-0"
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                  fontSize: textSize[project.id],
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
                      </div>
                    </div>
                  </div>
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
        {projects.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 transition-all duration-200"
            style={{
              background: i === current ? '#93c5fd' : '#334155',
            }}
          />
        ))}
      </div>
    </div>
  )
}