import { useState, useEffect } from 'react'
import PageShell from './PageShell'
import PageHeader from './PageHeader'
import InfoCard from './InfoCard'

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
      {children}
    </div>
  )
}

export default function AboutMe({ onBack }) {
  return (
    <PageShell onBack={onBack}>
      <PageHeader className="mb-12">About Me</PageHeader>

      {/* Cards */}
      <div className="flex gap-8 sm:gap-12 md:gap-16 items-center justify-center flex-wrap">
        {cards.map((card, i) => (
          <PixelCard key={card.id} delay={i * 200}>
            <InfoCard
              heading={card.heading}
              content={card.content}
              contentStyle={{ width: 'clamp(200px, 22vw, 270px)', aspectRatio: '2 / 3' }}
            />
          </PixelCard>
        ))}
      </div>
    </PageShell>
  )
}
