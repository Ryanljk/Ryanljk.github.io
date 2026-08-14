import PageShell from './PageShell'
import PageHeader from './PageHeader'
import InfoCard from './InfoCard'
import PixelCard from './PixelCard'

// TODO: replace with real contact details
const cards = [
  { id: 1, heading: 'Email', content: `ryanlimjk@gmail.com`, href: 'mailto:ryanlimjk@gmail.com' },
  { id: 2, heading: 'LinkedIn', content: `https://www.linkedin.com/in/ryanlimjk/`, href: 'https://www.linkedin.com/in/ryanlimjk/' },
  { id: 3, heading: 'GitHub', content: `https://github.com/Ryanljk`, href: 'https://github.com/Ryanljk' },
  // { id: 4, heading: 'Resume', content: `Download`, href: '/LimJinKitRyan_Resume.pdf', download: 'LimJinKitRyan_Resume.pdf' },
]

export default function ContactMe({ onBack, leaveSignal }) {
  return (
    <PageShell onBack={onBack} leaveSignal={leaveSignal}>
      <PageHeader className="mb-12">Contact Me</PageHeader>

      {/* Cards — wider than tall, stacked vertically; all match the widest card */}
      <div
        className="flex flex-col gap-6 sm:gap-6"
        style={{ width: 'max-content', maxWidth: 'min(92vw, 760px)' }}
      >
        {cards.map((card, i) => (
          <div key={card.id} className="w-full">
            <PixelCard delay={i * 200}>
              <InfoCard
                horizontal
                heading={card.heading}
                content={card.content}
                contentHref={card.href}
                contentDownload={card.download}
                contentStyle={{ width: '100%', minHeight: 64 }}
              />
            </PixelCard>
          </div>
        ))}
      </div>
    </PageShell>
  )
}