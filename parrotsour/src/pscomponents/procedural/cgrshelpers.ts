import { Point } from "../../classes/point"
import { PIXELS_TO_NM } from "../../utils/psmath"

export function Base26(sLetter: string): number {
  return sLetter.toUpperCase().charCodeAt(0) - 64
}

export function getColIndex(sColRef: string): number {
  let n = 0
  for (let p = 0; p < sColRef.length; p++) {
    n = sColRef.charCodeAt(p) - 64 + n * 26
  }
  return n
}

export function convertToXY(cgrs: string): Point {
  const re = new RegExp("([0-9]+)([A-Z])([A-Z])([0-9]*).*")
  const match = cgrs.match(re)
  let x = -1
  let y = -1
  if (match) {
    const row = match[1]
    const col1 = match[2].charAt(0)
    const col2 = match[3].charAt(0)

    const colNumber = getColIndex(col1 + col2)

    let keypad = match[4]
    if (keypad === "") keypad = "5"
    const kp = parseInt(keypad)
    let xMod = kp % 3
    if (xMod === 0) xMod = 3
    const xOff = (xMod - 1) * (10 * PIXELS_TO_NM) + 5 * PIXELS_TO_NM
    let yOff = 25 * PIXELS_TO_NM
    if (kp < 4) {
      yOff = 5 * PIXELS_TO_NM
    } else if (kp < 7) {
      yOff = 15 * PIXELS_TO_NM
    }

    y = (parseInt(row) - localStorage.startRow) * (30 * PIXELS_TO_NM) + yOff
    const lStorageColNumber = getColIndex(
      String.fromCharCode(localStorage.startCol1) +
        String.fromCharCode(localStorage.startCol2)
    )
    x = (colNumber - lStorageColNumber) * (30 * PIXELS_TO_NM) + xOff
  }
  return new Point(x, y)
}

export function convertToCGRS(x: number, y: number): string {
  const keypads = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]

  const gridSize = 30 * PIXELS_TO_NM

  const intStartRow = parseInt(localStorage.startRow)
  const intStartC1 = parseInt(localStorage.startCol1)
  const intStartC2 = parseInt(localStorage.startCol2)

  const row = intStartRow + Math.floor(y / gridSize)

  const col2 = intStartC2 + Math.floor(x / gridSize)
  let carryOver = 0
  if ((col2 - 65) / 26 > 1) {
    carryOver = (col2 - 65) % 26
  }
  const col1 = String.fromCharCode(intStartC1 + carryOver)
  const col = col1 + String.fromCharCode(((col2 - 65) % 26) + 65)
  const keypad =
    keypads[Math.floor((y % gridSize) / (gridSize / 3))][
      Math.floor((x % gridSize) / (gridSize / 3))
    ]
  return row + col + keypad + "+"
}
