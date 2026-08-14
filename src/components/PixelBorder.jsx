const OUTER_SHADOW = `
  4px 0 0 0 #1e293b,
  -4px 0 0 0 #1e293b,
  0 4px 0 0 #1e293b,
  0 -4px 0 0 #1e293b,
  4px 4px 0 0 #0f172a,
  -4px -4px 0 0 #0f172a,
  4px -4px 0 0 #0f172a,
  -4px 4px 0 0 #0f172a
`

// The cel-shaded pixel frame used by every card/photo in the site.
// - `size`: fixed square size in px (Hero photo, Gallery cards).
// - `fill`: layers fill their parent (InfoCard, flip cards).
// - `preserve3d`: plain relative container without gradient (flip cards).
export default function PixelBorder({
  children,
  size,
  glint = false,
  padding = 5,
  midShadow = 3,
  fill = false,
  preserve3d = false,
  contentStyle,
  className,
}) {
  const frame = (extra = {}) => ({
    ...(fill ? { width: '100%', height: '100%', boxSizing: 'border-box' } : {}),
    ...(preserve3d ? { transformStyle: 'preserve-3d' } : {}),
    ...extra,
  })

  const inner = preserve3d
    ? { position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }
    : {
        width: size ?? '100%',
        height: size ?? '100%',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        imageRendering: 'pixelated',
        overflow: 'hidden',
        position: 'relative',
        ...contentStyle,
      }

  return (
    <div
      style={{
        imageRendering: 'pixelated',
        ...(fill ? { width: '100%', height: '100%' } : {}),
        ...(preserve3d ? { transformStyle: 'preserve-3d' } : {}),
      }}
    >
      <div
        className={className}
        style={{
          padding,
          background: '#0f172a',
          boxShadow: OUTER_SHADOW,
          overflow: preserve3d ? 'visible' : 'hidden',
          position: 'relative',
          ...frame(),
        }}
      >
        <div
          style={{
            padding: 4,
            background: '#334155',
            boxShadow: `${midShadow}px 0 0 0 #475569, -${midShadow}px 0 0 0 #475569, 0 ${midShadow}px 0 0 #475569, 0 -${midShadow}px 0 0 #475569`,
            overflow: preserve3d ? 'visible' : 'hidden',
            ...frame(),
          }}
        >
          <div style={{ padding: 3, background: '#64748b', ...frame() }}>
            <div style={inner}>
              {children}
              {glint && <div className="glint" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}