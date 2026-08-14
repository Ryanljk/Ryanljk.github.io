import PixelBorder from './PixelBorder'
import { renderRich } from '../utils/renderRich'

// Info card used by AboutMe, Skills and Experience: pixel frame + heading +
// divider + content. `header` replaces the default heading and `children`
// replaces the default text content while keeping the same frame and divider.
// `horizontal` lays the heading and content out side by side (ContactMe).
export default function InfoCard({
  heading,
  content,
  header,
  contentStyle,
  children,
  horizontal = false,
  contentHref,
  contentDownload,
}) {
  return (
    <PixelBorder
      fill
      contentStyle={{
        flexDirection: horizontal ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: horizontal ? 'flex-start' : 'flex-start',
        gap: horizontal ? 16 : 0,
        padding: horizontal ? '24px 28px' : '24px 16px',
        ...contentStyle,
      }}
    >
      {header ? (
        header
      ) : (
        <h2
          className={`font-pixel text-white text-base sm:text-lg tracking-wider text-left ${
            horizontal ? 'flex-shrink-0' : 'mb-3 w-full'
          }`}
        >
          {heading}
        </h2>
      )}
      {horizontal ? (
        <div className="w-px bg-blue-300 opacity-40 self-stretch" />
      ) : (
        <div className="h-px bg-blue-300 opacity-40 mb-3 w-full" />
      )}
      {children ? (
        children
      ) : contentHref ? (
        <a
          href={contentHref}
          target={contentHref.startsWith('mailto') ? undefined : '_blank'}
          rel={contentHref.startsWith('mailto') ? undefined : 'noopener noreferrer'}
          download={contentDownload}
          className={`font-pixel-sm text-blue-300 text-[8px] sm:text-[10px] leading-relaxed text-left hover:text-white transition-colors duration-200 cursor-pointer ${
            horizontal ? 'flex-1 min-w-0' : 'w-full'
          }`}
          style={{ whiteSpace: 'pre-line' }}
        >
          {renderRich(content)}
        </a>
      ) : (
        <p
          className={`font-pixel-sm text-blue-300 text-[8px] sm:text-[10px] leading-relaxed text-left ${
            horizontal ? 'flex-1 min-w-0' : 'w-full'
          }`}
          style={{ whiteSpace: 'pre-line' }}
        >
          {renderRich(content)}
        </p>
      )}
    </PixelBorder>
  )
}
