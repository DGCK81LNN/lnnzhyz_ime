import { Syllable } from "./syllable"
import * as Letteral from "./letteral"

export function scanRoman(str: string): {
  end: number
  result: string
  data: unknown
  fine: boolean
} | null {
  const str0Lower = str[0].toLowerCase()

  const sub = str0Lower + str.slice(1)
  const prefix = str[0] !== str0Lower ? "\ue06f" : ""

  const letScan = Letteral.scanRoman(sub)
  const sylScan = Syllable.scanRoman(sub)

  if (letScan.result && (sylScan === null || sylScan.end <= letScan.end))
    return {
      end: letScan.end,
      result: prefix + letScan.result,
      data: letScan.result,
      fine: letScan.fine && sylScan.fine,
    }

  if (sylScan.data)
    return {
      end: sylScan.end,
      result: prefix + sylScan.data.toString(),
      data: sylScan.data,
      fine: sylScan.fine,
    }

  return {
    end: 0,
    result: "",
    data: null,
    fine: sylScan.fine && letScan.fine,
  }
}
