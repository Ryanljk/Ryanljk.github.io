import { useEffect } from 'react'
import { preloadVideos } from '../utils/videoCache'
import aboutmeVideo from '../assets/aboutme.mp4'
import myprojectsVideo from '../assets/myprojects.mp4'
import skillsVideo from '../assets/skills.mp4'
import experienceVideo from '../assets/experience.mp4'
import contactmeVideo from '../assets/contactme.mp4'

const VIDEOS = [aboutmeVideo, myprojectsVideo, skillsVideo, experienceVideo, contactmeVideo]

// Downloads the Gallery tiles' videos while the user is still on Hero (after
// first paint, so Hero's animations aren't slowed). Gallery reads them back
// through getVideoUrl, so opening it needs no further network fetch.
export default function VideoPreloader() {
  useEffect(() => {
    const start = () => preloadVideos(VIDEOS)
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(start)
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(start, 200)
    return () => clearTimeout(id)
  }, [])

  return null
}
