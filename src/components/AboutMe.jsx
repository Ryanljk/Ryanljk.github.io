import { useState, useEffect } from 'react'

const cards = [
  {
    id: 1,
    heading: 'Education',
    content: `School: Singapore Management University
    
            Degree: Bachelor of Science
             (Computer Science, Cybersecurity Track)
             
            Grade: 3.63/4.00
             (Magna Cum Laude)`

            
             
             ,
  },
  {
    id: 2,
    heading: 'Personal Info',
    content: `Date of Birth: 25 Sept 2001
              
              MBTI: INTP

              Zodiac: Libra

              Status: Very Single`,
  },
  {
    id: 3,
    heading: 'Hobbies',
    content: `Sanda
              (Chinese Kickboxing)
              
              Digital Art
              
              Video Games
              
              Reading & Creative Writing`,
  },
]

function PixelCard({ children, delay = 0 }) {
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
      <div style={{ imageRendering: 'pixelated' }}>
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
            }}
          >
            <div style={{ padding: 3, background: '#64748b' }}>
              <div
                style={{
                  width: 'clamp(200px, 22vw, 270px)',
                  aspectRatio: '2 / 3',
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
    </div>
  )
}

export default function AboutMe({ onBack }) {
  const [entered, setEntered] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true))
  }, [])

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
        className="font-pixel text-white text-3xl sm:text-4xl md:text-5xl tracking-wider mb-12 fade-in"
        style={{ textShadow: '0 0 20px rgba(59,130,246,0.4)' }}
      >
        About Me
      </h1>

      {/* Cards */}
      <div className="flex gap-8 sm:gap-12 md:gap-16 items-center justify-center flex-wrap">
        {cards.map((card, i) => (
          <PixelCard key={card.id} delay={i * 200}>
            <h2 className="font-pixel text-white text-base sm:text-lg tracking-wider mb-3 text-left w-full">
              {card.heading}
            </h2>
            <div className="h-px bg-blue-300 opacity-40 mb-3 w-full" />
            <p 
              className="font-pixel-sm text-blue-300 text-[8px] sm:text-[10px] leading-relaxed text-left w-full"
              style={{ whiteSpace: 'pre-line' }}
            >
              {card.content}
            </p>
          </PixelCard>
        ))}
      </div>
    </div>
  )
}
