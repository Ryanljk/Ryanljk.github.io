import { useState, useEffect, useRef } from 'react'
import './index.css'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import AboutMe from './components/AboutMe'
import MyProjects from './components/MyProjects'
import Skills from './components/Skills'
import Experience from './components/Experience'
import ContactMe from './components/ContactMe'
import Waves from './components/Waves'
import StarField from './components/StarField'
import VideoPreloader from './components/VideoPreloader'

const PAGES = {
  1: AboutMe,
  2: MyProjects,
  3: Skills,
  4: Experience,
  5: ContactMe,
}

// Browser back/forward is wired to the app's own navigation:
// - Every in-app navigation pushes a history entry `{ k }` mapped to a state
//   snapshot in `stackRef` (`posRef` = current position in the stack).
// - Browser back: the current page runs its normal 300ms leave animation
//   (via `leaveSignal`), then commits the pending target instead of pushing.
// - Browser forward: the target commits directly and plays its enter animation.
export default function App() {
  const [page, setPage] = useState('hero')
  const [detail, setDetail] = useState(null)
  const [galleryFrom, setGalleryFrom] = useState('hero')
  // The Gallery tile that was last opened, restored when returning to Gallery.
  const [galleryIndex, setGalleryIndex] = useState(0)
  // Incremented on browser back to tell the current page to animate out.
  const [leaveSignal, setLeaveSignal] = useState(0)
  const stackRef = useRef([{ k: 1, page: 'hero' }])
  const posRef = useRef(0)
  const keyRef = useRef(1)
  // Set while a browser-back leave animation is running; the page's onBack
  // commits this target (instead of pushing a fresh history entry).
  const pendingRef = useRef(null)

  const commit = (entry) => {
    if (entry.page === 'hero') {
      setPage('hero')
      setDetail(null)
    } else {
      setPage('gallery')
      setDetail(entry.detail ?? null)
      setGalleryFrom(entry.from ?? 'hero')
    }
  }

  const navigate = (entry) => {
    const k = ++keyRef.current
    const full = { k, ...entry }
    stackRef.current = [...stackRef.current.slice(0, posRef.current + 1), full]
    posRef.current = stackRef.current.length - 1
    history.pushState({ k }, '')
    commit(full)
  }

  // Called by pages after their back animation completes.
  const handleBackPress = (entry) => {
    if (pendingRef.current) {
      const pending = pendingRef.current
      pendingRef.current = null
      commit(pending.page === 'gallery' ? { ...pending, from: 'detail' } : pending)
    } else {
      navigate(entry)
    }
  }

  useEffect(() => {
    history.replaceState({ k: 1 }, '')
    const onPop = (e) => {
      const k = e.state?.k
      const idx = stackRef.current.findIndex((en) => en.k === k)
      const prevPos = posRef.current
      if (idx === -1 || idx === prevPos) return
      posRef.current = idx
      if (idx < prevPos) {
        // Browser back — animate the current page out, commit on completion.
        pendingRef.current = { ...stackRef.current[idx], idx }
        setLeaveSignal((t) => t + 1)
      } else {
        // Browser forward — commit directly; enter animation plays.
        pendingRef.current = null
        commit(stackRef.current[idx])
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const handleHeroNavigate = () => navigate({ page: 'gallery', from: 'hero' })

  const handleGallerySelect = (itemId) => {
    const key = String(itemId)
    if (PAGES[key]) {
      setGalleryIndex(itemId - 1)
      navigate({ page: 'gallery', detail: key, from: galleryFrom })
    }
  }

  const handleDetailBack = () => handleBackPress({ page: 'gallery', from: 'detail' })

  const DetailPage = detail ? PAGES[detail] : null

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-sky-dark via-sky-mid to-sky-light">
      <StarField />
      <VideoPreloader />
      {page === 'hero' ? (
        <Hero onNavigate={handleHeroNavigate} />
      ) : DetailPage ? (
        <DetailPage onBack={handleDetailBack} leaveSignal={leaveSignal} />
      ) : (
        <Gallery
          onBack={() => handleBackPress({ page: 'hero' })}
          onSelect={handleGallerySelect}
          enterFrom={galleryFrom === 'detail' ? 'left' : 'right'}
          leaveSignal={leaveSignal}
          initialCurrent={galleryIndex}
        />
      )}
      <Waves />
    </div>
  )
}