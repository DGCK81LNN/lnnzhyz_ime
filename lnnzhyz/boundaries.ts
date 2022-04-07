const rightMarks = /^\ue06f$/
const leftMarks = /^[\ue070-\ue081]$/

export function isBoundary(text: string, pos: number) {
  if (pos > 0 && text[pos - 1].match(rightMarks)) return false
  if (pos < text.length && text[pos].match(leftMarks)) return false
  return true
}

export function findBoundary(text: string, pos: number, dir?: "left" | "right") {
  if (pos < 0) pos = 0
  else if (pos > text.length) pos = text.length

  if (!dir) {
    if (pos > 0 && text[pos - 1].match(rightMarks)) dir = "left"
    else dir = "right"
  }

  if (dir === "left") {
    while (pos > 0 && !isBoundary(text, pos)) pos--
  } else {
    while (pos < text.length && !isBoundary(text, pos)) pos++
  }
  return pos
}
