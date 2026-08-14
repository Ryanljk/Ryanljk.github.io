const COLS = 6
const ROWS = 5
const CELL_W = 100 / COLS
const CELL_H = 75 / ROWS

// Hero text exclusion zone (centered)
const ZONE_LEFT = 30
const ZONE_RIGHT = 70
const ZONE_TOP = 40
const ZONE_BOTTOM = 60

const COLORS = ['#fff', '#fff', '#4a9fff', '#bfdbfe', '#93c5fd']

const stars = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS
  const row = Math.floor(i / COLS)
  let left = col * CELL_W + Math.random() * CELL_W
  const top = row * CELL_H + Math.random() * CELL_H

  // Push stars out of the hero text zone
  if (left > ZONE_LEFT && left < ZONE_RIGHT && top > ZONE_TOP && top < ZONE_BOTTOM) {
    left = Math.random() < 0.5 ? ZONE_LEFT - Math.random() * 10 : ZONE_RIGHT + Math.random() * 10
  }

  return {
    id: i,
    left,
    top,
    size: Math.round(5 - (row / (ROWS - 1)) * 3) + Math.floor(Math.random() * 2),
    delay: Math.random() * 4,
    twinkleDur: 1.5 + Math.random() * 2,
    floatDur: 3 + Math.random() * 3,
    floatDelay: Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }
})

export default function StarField() {
  return (
    <>
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: s.color,
            animationDelay: `${s.delay}s, ${s.floatDelay}s`,
            animationDuration: `${s.twinkleDur}s, ${s.floatDur}s`,
          }}
        />
      ))}
    </>
  )
}
