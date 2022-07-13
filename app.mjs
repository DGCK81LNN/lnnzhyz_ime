import * as LNNZHYZ from "./lnnzhyz"
import { findBoundary } from "./lnnzhyz"

function $$$(id) {
  return document.getElementById(id)
}

if (/^iP|^Mac/.test(navigator.platform)) {
  try {
    document.querySelector("meta[name=viewport]").content += ",user-scalable=no"
  } catch (_) { }
}

/** @type {HTMLTextAreaElement} */
const $input = $$$("input")
const $inputFaux = $$$("input-faux")
const $inputFauxContent = $$$("input-faux-content")
const $inputFloater = $$$("input-floater")
const $inputFloaterPrev = $$$("input-floater-prev")
const $inputFloaterComp = $$$("input-floater-comp")
/** @type {HTMLInputElement} */
const $toggle = $$$("toggle")

/**
 * Suspend handling of `selectionchange` and `beforeinput` events to prevent
 * emulated input emitting events and causing infinite recursion.
 */
let suspended = false

//#region autoresize

function autoResize() {
  $input.style.height = "auto"
  var scrlHeight = $input.scrollHeight
  var height = `${scrlHeight + 2}px`
  $input.style.height = height
  $inputFaux.style.height = height
}

$input.addEventListener("input", () => void autoResize())
window.addEventListener("resize", () => void autoResize())

//#endregion

//#region selection fix

function getAnchorFocus() {
  var left = $input.selectionStart
  var right = $input.selectionEnd
  if ($input.selectionDirection === "backward") return [right, left]
  return [left, right]
}

function setAnchorFocus(anchor, focus) {
  if (focus < anchor) $input.setSelectionRange(focus, anchor, "backward")
  else $input.setSelectionRange(anchor, focus, "forward")
}

function autoCorrectSelection() {
  let [anchor, focus] = getAnchorFocus()
  anchor = findBoundary($input.value, anchor)
  focus = findBoundary($input.value, focus)
  setAnchorFocus(anchor, focus)
}

function shiftFocus(forward, shiftKey) {
  let [anchor, focus] = getAnchorFocus()
  if (shiftKey) {
    focus += forward ? 1 : -1
    focus = findBoundary($input.value, focus, forward ? "right" : "left")
    setAnchorFocus(anchor, focus)
    return true
  } else if (anchor === focus) {
    focus += forward ? 1 : -1
    focus = findBoundary($input.value, focus, forward ? "right" : "left")
    setAnchorFocus(focus, focus)
    return true
  }
  return false
}

function deleteChar(forward) {
  let [anchor, focus] = getAnchorFocus()
  if (anchor === focus) {
    focus += forward ? 1 : -1
    focus = findBoundary($input.value, focus, forward ? "right" : "left")
    setAnchorFocus(anchor, focus)
    insertText("")
    return true
  }
  return false
}

var hasFocus = false

$input.addEventListener("focus", () => {
  hasFocus = true
})

$input.addEventListener("blur", () => {
  hasFocus = false
})

$input.addEventListener("keydown", ev => {
  if (ev.key === "ArrowLeft") {
    if (shiftFocus(false, ev.shiftKey)) ev.preventDefault()
    return
  }
  if (ev.key === "ArrowRight") {
    if (shiftFocus(true, ev.shiftKey)) ev.preventDefault()
    return
  }

  if (!comp) {
    if (ev.key === "Backspace") {
      if (deleteChar(false)) ev.preventDefault()
      return
    }
    if (ev.key === "Delete") {
      if (deleteChar(true)) ev.preventDefault()
      return
    }
  }
})

document.addEventListener("selectionchange", () => {
  if (!suspended && hasFocus) autoCorrectSelection()
})

//#endregion

//#region IME logic

function insertText(text) {
  $input.focus()
  suspended = true
  document.execCommand("insertText", false, text) ||
    $input.setRangeText(text, $input.selectionStart, $input.selectionEnd, "end")
  suspended = false
  caretPos = $input.selectionStart
}

function updateFloater() {
  const text =
    ((scan && scan.result) || "") + comp.slice((scan && scan.end) || 0)
  if (text) {
    $inputFauxContent.textContent = $input.value.slice(0, $input.selectionStart)
    $inputFloater.classList.add("visible")
    $inputFloaterPrev.textContent = text
    $inputFloaterComp.textContent = comp
  } else {
    $inputFloater.classList.remove("visible")
  }
}

var enabled = true
var comp = ""
var scan
var caretPos = 0

function setEnabled(val) {
  enabled = val
  if (!val && comp) abortComp()
}

/** @returns {void} */
function updateComp() {
  if (!comp) {
    scan = null
    updateFloater()
    return
  }

  scan = LNNZHYZ.scanRoman(comp)
  if (!scan.result && scan.fine) {
    insertText(comp[0])
    comp = comp.slice(1)
    return updateComp()
  }

  updateFloater()
  if (scan.fine) return acceptComp()
}

function acceptComp() {
  if (!scan.result) return rejectComp()

  comp = comp.slice(scan.end)
  let result = scan.result
  scan = null
  updateFloater()
  insertText(result)
  if (comp) updateComp()
}

function rejectComp() {
  insertText(comp)
  abortComp()
}

function abortComp() {
  comp = ""
  scan = null
  updateFloater()
}

$input.addEventListener("blur", () => {
  if (enabled) abortComp()
})

document.addEventListener("selectionchange", () => {
  if (enabled && !suspended && $input.selectionStart !== caretPos) abortComp()
})

var onlyShift = false

$input.addEventListener("keydown", ev => {
  onlyShift = false
  if (ev.key === "Shift") {
    onlyShift = true
    return
  }
  if (!enabled || !comp) return
  if (ev.key === "Backspace") {
    ev.preventDefault()
    comp = comp.slice(0, -1)
    return updateComp()
  }
  if (ev.key === " ") {
    ev.preventDefault()
    return acceptComp()
  }
  if (ev.key === "Enter") {
    ev.preventDefault()
    return rejectComp()
  }
  if (ev.key === "Escape") {
    ev.preventDefault()
    return abortComp()
  }
})

$input.addEventListener("keyup", ev => {
  if (ev.key === "Shift" && onlyShift) {
    setEnabled(!enabled)
    $toggle.checked = enabled
  }
})

$input.addEventListener("beforeinput", ev => {
  if (!enabled || suspended || ev.inputType !== "insertText") return
  ev.preventDefault()
  comp += ev.data
  caretPos = $input.selectionStart
  updateComp()
})

$toggle.addEventListener("change", () => {
  setEnabled($toggle.checked)
})

//#endregion
