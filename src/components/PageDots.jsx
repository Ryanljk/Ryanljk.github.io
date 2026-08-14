// Carousel page indicator dots (blue = current).
export default function PageDots({ count, current }) {
  return (
    <div className="flex gap-2 mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 transition-all duration-200"
          style={{ background: i === current ? '#93c5fd' : '#334155' }}
        />
      ))}
    </div>
  )
}