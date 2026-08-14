export default function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-6 left-6 font-pixel-sm text-blue-300 text-[18px] tracking-widest hover:text-white transition-colors duration-200 cursor-pointer z-20"
    >
      &lt; back
    </button>
  )
}