import aboutmeVideo from '../assets/aboutme.mp4'
import myprojectsVideo from '../assets/myprojects.mp4'
import skillsVideo from '../assets/skills.mp4'
import experienceVideo from '../assets/experience.mp4'
import contactmeVideo from '../assets/contactme.mp4'

const VIDEOS = [aboutmeVideo, myprojectsVideo, skillsVideo, experienceVideo, contactmeVideo]

// Hidden, off-screen video elements that start downloading the Gallery tiles'
// videos while the user is still on Hero, so they're cached when Gallery opens.
export default function VideoPreloader() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        left: -9999,
        top: 0,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      {VIDEOS.map((src, i) => (
        <video key={i} src={src} preload="auto" muted playsInline loop />
      ))}
    </div>
  )
}