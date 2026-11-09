// Fully downloads videos into blob URLs so a later <video> can reuse the bytes
// instead of re-requesting them (browsers often don't share media buffers
// between <video> elements).
const cache = new Map()

export function getVideoUrl(src) {
  return cache.get(src) ?? src
}

export async function preloadVideos(srcs) {
  // Sequential, so the first (visible) tile gets the full bandwidth.
  for (const src of srcs) {
    if (cache.has(src)) continue
    try {
      const res = await fetch(src)
      if (!res.ok) continue
      cache.set(src, URL.createObjectURL(await res.blob()))
    } catch {
      // fall back to the original src
    }
  }
}
