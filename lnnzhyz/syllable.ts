import { inList, Scanner } from "./scanner"

function scanRomanInitial(s: Scanner) {
  if (s.scan("ng w b p m f d t n l g k h j q x zh ch sh r z c s"))
    return s.scanned
}

type Final = [string, string, string]

function scanRomanFinal(s: Scanner, initial = ""): Final {
  if (s.scan("iung")) return ["y", "e", "ng"]
  if (inList(initial, "zh ch sh r z c s") && s.scan("ih")) return ["", "", ""]
  if (s.scan("eo")) return ["", "e", ""]
  if (!initial && s.scan("er ar")) return ["", s.scanned[0], "r"]

  return [
    s.scan("i u y") || "",
    s.scan("e a o") || "",
    s.scan("ng i u n") || "",
  ]
}

function qualifyFinal(
  initial?: string,
  glide?: string,
  vowel?: string,
  coda?: string
): Final | null {
  if (!(glide || vowel || coda)) {
    if (inList(initial, "zh ch sh r z c s m n ng")) return ok()
    if (inList(initial, "d l")) return ok("e")
    return null
  }

  const semivowelCoda = inList(coda, "i u")

  if (!vowel) {
    if (!initial && glide === "u" && coda && !semivowelCoda)
      return ["", "o", coda]
    if (coda) return ok("e")
  }

  if (vowel === "o") {
    if (!initial && !glide && vowel && !semivowelCoda) return ok()
    if (!glide && !coda) return ["u", "e", ""]
    if (glide === "i" && coda === "ng") return ["y", "e", "ng"]

    return ok("e")
  }

  if (vowel === "e") {
    if (!initial && !glide && vowel && !coda) return ok("eh")
    return ok()
  }

  return ok()

  function ok(_vowel = vowel): Final {
    return [glide || "", _vowel || "", coda || ""]
  }
}

const initials = ["", ..."bpmfdtnlgkhjqx", "zh", "ch", "sh", ..."rzcs"]
const glides = ["i", "u", "y"]
const vowels = ["e", "a", "o", "eh"]
const codas = ["i", "u", "n", "ng", "r"]

function getTone(str: string) {
  if (!str || inList(str, "0 1 l s")) return 1
  if (inList(str, "2 z")) return 2
  if (inList(str, "3 x")) return 3
  if (inList(str, "4 h")) return 4
  throw new Error("Invalid tone")
}

export class Syllable {
  initial: string
  glide: string
  vowel: string
  coda: string
  tone: number

  constructor(initial = "", glide = "", vowel = "", coda = "", tone = 0) {
    this.initial = initial
    this.glide = glide
    this.vowel = vowel
    this.coda = coda
    this.tone = tone
  }

  static scanRoman(str: string) {
    const s = new Scanner(str)

    if (s.scan("hm0 hm1 hng0 hng1"))
      return {
        end: s.scanPos,
        data: new Syllable("h", "", "", s.scanned.slice(1, -1), 0),
        fine: true,
      }
    if (s.scan("hm hng"))
      return {
        end: s.scanPos,
        data: new Syllable("h", "", "", s.scanned.slice(1), 0),
        fine: s.scanPos < str.length,
      }

    let initial = scanRomanInitial(s)
    const scannedFinal = scanRomanFinal(s, initial)
    const final = qualifyFinal(initial, ...scannedFinal)
    if (!final) return {
      end: 0,
      data: null,
      fine: s.scanPos < str.length,
    }
    const [glide, vowel, coda] = final

    if (inList(initial, "ng w")) initial = ""

    s.scan("0 1 2 3 4 l z x h s")
    const fine = !!s.scanned || str.length > s.scanPos
    const tone = getTone(s.scanned)

    return {
      end: s.scanPos,
      data: new Syllable(initial, glide, vowel, coda, tone),
      fine,
    }
  }

  // Ruby 后遗症（确信）
  inspect() {
    const a = [this.initial, this.glide, this.vowel, this.coda, this.tone]
    return `[${a.filter(i => !!i).join("-")}]`
  }

  toString() {
    const ii = initials.indexOf(this.initial)
    if (ii === -1) throw new Error("Invalid syllable")
    let str = String.fromCharCode(0xe050 + ii)

    if (this.tone === 0) {
      if (this.coda === "m") return str + "\ue080"
      if (this.coda === "ng") return str + "\ue081"
      throw new Error("Invalid syllable")
    }

    const gi = glides.indexOf(this.glide)
    const vi = vowels.indexOf(this.vowel)
    const ci = codas.indexOf(this.coda)

    str += String.fromCharCode(0xe070 + (this.tone - 1))
    if (gi !== -1) str += String.fromCharCode(0xe074 + gi)
    if (vi !== -1) str += String.fromCharCode(0xe077 + vi)
    if (ci !== -1) str += String.fromCharCode(0xe07b + ci)
    return str
  }
}
