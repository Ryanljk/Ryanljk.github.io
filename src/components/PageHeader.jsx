// Page title with the standard blue glow and fade-in.
export default function PageHeader({ children, className = 'mb-6' }) {
  return (
    <h1
      className={`font-pixel text-white text-3xl sm:text-4xl md:text-5xl tracking-wider fade-in ${className}`}
      style={{ textShadow: '0 0 20px rgba(59,130,246,0.4)' }}
    >
      {children}
    </h1>
  )
}