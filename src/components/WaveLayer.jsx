export default function WaveLayer({ className, color, d }) {
  return (
    <svg
      className={`wave ${className}`}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill={color} d={d} />
    </svg>
  )
}
