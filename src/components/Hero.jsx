import { useState, useEffect } from 'react'
import photo from '../assets/photo.png'
import PixelBorder from './PixelBorder'

export default function Hero({ onNavigate }) {
  const [clicked, setClicked] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [entered, setEntered] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true))
  }, [])

  const handleClick = () => {
    setClicked(true)
    setTimeout(() => onNavigate(), 300)
  }

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
      <div
        className={`flex flex-col items-center transition-all duration-300 ease-in-out ${
          clicked
            ? 'opacity-0 -translate-x-[50vw]'
            : entered
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-[50vw]'
        }`}
      >
        {/* Pixelated photo frame with cel shading */}
        <div
          className="mb-8 fade-in cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleClick}
        >
          <PixelBorder
            size={192}
            padding={6}
            midShadow={4}
            glint
            className="transition-transform duration-150 ease-out hover:scale-105 active:scale-95"
          >
            <img
              src={photo}
              alt=""
              ref={(el) => { if (el && el.complete && el.naturalWidth > 0) setLoaded(true) }}
              onLoad={() => setLoaded(true)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                imageRendering: 'auto',
                transform: 'scale(1.5)',
                opacity: loaded ? 1 : 0,
                filter: hovered ? 'blur(4px) brightness(0.7)' : 'none',
                transition: 'opacity 0.3s ease, filter 0.2s ease',
              }}
            />
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="font-pixel-sm text-white text-[10px] animate-pulse"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                >
                  Loading...
                </span>
              </div>
            )}
            {/* Hover overlay — frosted glass + text */}
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
                Click To Know<br />More
              </span>
            </div>
          </PixelBorder>
        </div>

        <h1
          className="font-pixel text-white text-3xl sm:text-4xl md:text-5xl tracking-wider fade-in"
          style={{ textShadow: '0 0 20px rgba(59,130,246,0.4)' }}
        >
          Lim Jin Kit Ryan
        </h1>
        <p className="font-pixel-sm text-blue-300 text-[10px] sm:text-xs mt-4 tracking-widest fade-in-delay">
          &gt; developer's portfolio_
        </p>
      </div>
    </div>
  )
}
