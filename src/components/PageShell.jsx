import usePageTransition from '../hooks/usePageTransition'
import BackButton from './BackButton'

// Standard page wrapper: 300ms ease-in-out slide transition (in from right,
// out to right on back) plus the `< back` button.
export default function PageShell({ onBack, onLeave, children }) {
  const { entered, leaving, handleBack } = usePageTransition(onBack, { onLeave })

  return (
    <div
      className={`relative z-10 flex flex-col items-center justify-center h-full px-6 text-center transition-all duration-300 ease-in-out select-none ${
        leaving
          ? 'opacity-0 translate-x-[50vw]'
          : entered
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-[50vw]'
      }`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <BackButton onClick={handleBack} />
      {children}
    </div>
  )
}