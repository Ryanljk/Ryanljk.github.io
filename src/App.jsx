import { useState } from 'react'
import './index.css'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import AboutMe from './components/AboutMe'
import MyProjects from './components/MyProjects'
import Waves from './components/Waves'
import StarField from './components/StarField'

const PAGES = {
  1: AboutMe,
  2: MyProjects,
}

export default function App() {
  const [page, setPage] = useState('hero')
  const [detail, setDetail] = useState(null)
  const [galleryFrom, setGalleryFrom] = useState('hero')

  const handleHeroNavigate = () => {
    setGalleryFrom('hero')
    setPage('gallery')
  }

  const handleGallerySelect = (itemId) => {
    const key = String(itemId)
    if (PAGES[key]) setDetail(key)
  }

  const handleDetailBack = () => {
    setGalleryFrom('detail')
    setDetail(null)
  }

  const DetailPage = detail ? PAGES[detail] : null

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-sky-dark via-sky-mid to-sky-light">
      <StarField />
      {page === 'hero' ? (
        <Hero onNavigate={handleHeroNavigate} />
      ) : DetailPage ? (
        <DetailPage onBack={handleDetailBack} />
      ) : (
        <Gallery
          onBack={() => setPage('hero')}
          onSelect={handleGallerySelect}
          enterFrom={galleryFrom === 'detail' ? 'left' : 'right'}
        />
      )}
      <Waves />
    </div>
  )
}
