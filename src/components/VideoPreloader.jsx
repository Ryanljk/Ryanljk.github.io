import { useEffect, useRef } from 'react'
import aboutmeVideo from '../assets/aboutme.mp4'
import myprojectsVideo from '../assets/myprojects.mp4'
import skillsVideo from '../assets/skills.mp4'
import experienceVideo from '../assets/experience.mp4'
import contactmeVideo from '../assets/contactme.mp4'

const VIDEOS = [aboutmeVideo, myprojectsVideo, skillsVideo, experienceVideo, contactmeVideo]

// Hidden, off-screen video elements that start downloading the Gallery tiles'
// videos while the user is still on Hero, so they're cached when Gallery opens.
// `preload="auto"` alone is only a hint and is often skipped for off-screen
// videos, so they are also played muted — autoplay of a muted video forces the
// browser to actually fetch the file. Each pauses once it can play through,
// leaving the decoded/downloaded data in the cache.
export default function VideoPreloader() {
  const refs = useRef([])

  useEffect(() => {
    refs.current.forEach((v) => {
      if (!v) return
      v.play().catch(() => {})
    })
  }, [])

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
        <video
          key={i}
          ref={(el) => { refs.current[i] = el }}
          src={src}
          preload="auto"
          muted
          playsInline
          loop
          onCanPlayThrough={(e) => e.currentTarget.pause()}
        />
      ))}
    </div>
  )
}