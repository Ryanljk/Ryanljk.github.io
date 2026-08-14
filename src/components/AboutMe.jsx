import PageShell from './PageShell'
import PageHeader from './PageHeader'
import InfoCard from './InfoCard'
import PixelCard from './PixelCard'

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

export default function AboutMe({ onBack, leaveSignal }) {
  return (
    <PageShell onBack={onBack} leaveSignal={leaveSignal}>
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
