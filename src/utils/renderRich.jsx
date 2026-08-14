// Rich text: words wrapped in backticks (`word`) in content strings are
// rendered as highlighted spans (white + glow) instead of plain blue text.
export const renderRich = (text) =>
  text.split('`').map((part, i) =>
    i % 2 === 1 ? (
      <span
        key={i}
        className="text-white"
        style={{ textShadow: '0 0 10px rgba(59,130,246,0.5)' }}
      >
        {part}
      </span>
    ) : (
      part
    )
  )