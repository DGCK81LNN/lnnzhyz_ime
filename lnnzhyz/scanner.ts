export class Scanner {
  string: string
  scanPos: number
  private _scanned: string

  get scanned() {
    return this._scanned
  }

  constructor(string: string, start = 0) {
    this.string = string
    this.scanPos = start
    this._scanned = ""
  }

  scan(patterns: string | string[]) {
    if (typeof patterns === "string") patterns = patterns.split(" ")
    for (const pattern of patterns) {
      if (this.string.startsWith(pattern, this.scanPos)) {
        this.scanPos += pattern.length
        this._scanned = pattern
        return pattern
      }
    }
    this._scanned = ""
    return ""
  }
}

export function inList(needle: string | undefined, haystack: string) {
  if (needle === undefined) return false
  return haystack.split(" ").includes(needle)
}
