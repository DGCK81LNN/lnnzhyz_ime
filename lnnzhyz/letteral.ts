// prettier-ignore
const table: Record<string, string> = {
  "0":  "\ue040", "1":  "\ue041",  "2":  "\ue042", "3":  "\ue043",
  "4":  "\ue044", "5":  "\ue045",  "6":  "\ue046", "7":  "\ue047",
  "8":  "\ue048", "9":  "\ue049",  "xa": "\ue04a", "xb": "\ue04b",
  "xc": "\ue04c", "xd": "\ue04d",  "xe": "\ue04e", "xf": "\ue04f",
  "w":  "\ue050", "b":  "\ue051",  "p":  "\ue052", "m":  "\ue053",
  "f":  "\ue054", "d":  "\ue055",  "t":  "\ue056", "n":  "\ue057",
  "l":  "\ue058", "g":  "\ue059",  "k":  "\ue05a", "h":  "\ue05b",
  "j":  "\ue05c", "q":  "\ue05d",  "x":  "\ue05e", "zh": "\ue05f",
  "ch": "\ue060", "sh": "\ue061",  "r":  "\ue062", "z":  "\ue063",
  "c":  "\ue064", "s":  "\ue065",  "v":  "\ue066", "i":  "\ue067",
  "u":  "\ue068", "y":  "\ue069",  "e":  "\ue06a", "a":  "\ue06b",
  "o":  "\ue06c", "er": "\ue06d",  "_":  "\ue06e",

  "-": "- ",      "--": "\u2013 ", "---": "\u2014 ",
  ".": "\uff61 ", "..": ". ",      "...": "… ",
  ",": ", ",      ",,": "\uff64 ",
}

const tableKeys = Object.keys(table)

export function scanRoman(str: string) {
  for (let i = str.length; i; --i) {
    const sub = str.slice(0, i)
    if (sub in table)
      return {
        end: i,
        result: table[sub],
        fine: !tableKeys.some(key => key !== sub && key.startsWith(sub)),
      }
  }
  return {
    end: 0,
    result: null,
    fine: !tableKeys.some(key => key !== str[0] && key.startsWith(str[0])),
  }
}
