import PixelBorder from './PixelBorder'
import { renderRich } from '../utils/renderRich'

// Info card used by AboutMe and Skills: pixel frame + heading + divider + content.
export default function InfoCard({ heading, content, contentStyle }) {
  return (
    <PixelBorder
      fill
      contentStyle={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '24px 16px',
        ...contentStyle,
      }}
    >
      <h2 className="font-pixel text-white text-base sm:text-lg tracking-wider mb-3 text-left w-full">
        {heading}
      </h2>
      <div className="h-px bg-blue-300 opacity-40 mb-3 w-full" />
      <p
        className="font-pixel-sm text-blue-300 text-[8px] sm:text-[10px] leading-relaxed text-left w-full"
        style={{ whiteSpace: 'pre-line' }}
      >
        {renderRich(content)}
      </p>
    </PixelBorder>
  )
}