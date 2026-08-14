// Signed offset of `index` from `current` in a wrapping list of `total` items,
// choosing the shortest direction (negative = previous/left).
export function wrappedOffset(index, current, total) {
  const offset = ((index - current + total) % total)
  return offset > Math.floor(total / 2) ? offset - total : offset
}