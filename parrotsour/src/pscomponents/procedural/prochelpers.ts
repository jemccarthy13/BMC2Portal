import { AircraftGroup } from "../../classes/groups/group"
import { Point } from "../../classes/point"

export function getAsset(
  groups: AircraftGroup[],
  callsign: string
): AircraftGroup | undefined {
  return groups.find((a) => {
    if (a.getLabel()) {
      return a.getLabel().toUpperCase() === callsign.toUpperCase()
    } else {
      return false
    }
  })
}

export function convertToXY(cgrs: string | undefined): Point {
  if (cgrs === undefined) {
    return new Point(50, 50)
  }
  const re = new RegExp("([0-9]+)([A-Z])([A-Z])([0-9]*).*")
  const match = cgrs.match(re)
  let x = 50
  let y = 50
  if (match) {
    const row = match[1]
    const col2 = match[3].charCodeAt(0)
    let keypad = match[4]
    if (keypad === "") keypad = "5"
    const kp = parseInt(keypad)
    let xMod = kp % 3
    if (xMod === 0) xMod = 3
    const xOff = (xMod - 1) * 33 + 15
    let yOff = 81
    if (kp < 4) {
      yOff = 15
    } else if (kp < 7) {
      yOff = 48
    }

    /// TODO - fix logic here to translate to x,y coordinates
    //log(kp, yOff)
    //log(row, localStorage.startRow)
    y = (localStorage.startRow - parseInt(row)) * 100 + yOff
    x = (col2 - localStorage.startCol2) * 100 + xOff
  }
  return new Point(x, y)
}

export function convertToCGRS(x: number, y: number): string {
  const keypads = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]
  const row = localStorage.startRow - Math.floor(y / 100)
  const col =
    String.fromCharCode(localStorage.startCol1) +
    String.fromCharCode(localStorage.startCol2 + Math.floor(x / 100))
  const keypad = keypads[Math.floor((y % 100) / 33)][Math.floor((x % 100) / 33)]
  return row + col + keypad + "+"
}
