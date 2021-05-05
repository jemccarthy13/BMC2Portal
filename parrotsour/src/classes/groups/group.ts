// Classes & Interfaces
import { AltStack } from "../interfaces"
import { SensorType } from "../groups/datatrail"
import { Point } from "../point"
import { ACType, Aircraft } from "../groups/aircraft"
import { IDMatrix } from "../groups/id"
import { IntentParams } from "../groups/intent"

// Functions
import { trackDirFromHdg } from "../../utils/mathutilities"
import {
  headingToRadians,
  PIXELS_TO_NM,
  randomNumber,
} from "../../utils/psmath"

/**
 * Non-exported function to format alt stacks and fill-ins for group altitudes
 *
 * A single group will be no-op (return hard alt + fillin if HIGH)
 * A group without stacks will return single alt + fillin if HIGH)
 * Otherwise, will return highest altitude for each "bucket" and # contacts hi/med/low
 *
 * @param altitudes - group's altitudes for each contact
 * @param format - comm format
 */
function _getAltStack(altitudes: number[], format: string): AltStack {
  // convert altitudes to 3-digit flight level and sort low->high
  const formattedAlts: string[] = altitudes
    .map((a: number) => ("0" + a).slice(-2) + "0")
    .sort()
    .reverse()

  const stackHeights: string[] = []
  let stackIndexes: number[] = []

  // break out into bins of 10k foot separation between contacts
  for (let x = formattedAlts.length; x >= 0; x--) {
    const diff: number =
      parseInt(formattedAlts[x - 1]) - parseInt(formattedAlts[x])
    if (diff >= 100) {
      stackHeights.push(formattedAlts[x])
      stackIndexes.push(x)
    }
  }

  stackIndexes = stackIndexes.reverse()

  // get the highest altitude within each bucket for formatting
  const stacks: string[][] = []
  let lastZ = 0
  for (let z = 0; z < stackIndexes.length; z++) {
    stacks.push(formattedAlts.slice(lastZ, stackIndexes[z]))
    lastZ = stackIndexes[z]
  }
  stacks.push(formattedAlts.slice(lastZ))

  // format to "##k"
  let answer = formattedAlts[0].replace(/0$/, "k") + " "
  let answer2 = ""

  // do formatting

  // if no stack, look for >40k for "HIGH"
  if (stacks.length <= 1) {
    altitudes.sort()
    if (altitudes[altitudes.length - 1] >= 40) {
      answer2 += " HIGH "
    }
    // otherwise, print stacks
  } else {
    answer = "STACK "
    for (let y = 0; y < stacks.length; y++) {
      // check to add "AND" for alsa, when on last stack alt
      const AND = y === stacks.length - 1 && format !== "ipe" ? "AND " : ""
      answer += AND + stacks[y][0].replace(/0$/, "k") + " "
    }

    // format # hi/med/low when there are at least 3 contacts
    // if there are 3 contacts and 3 altitudes, 1 hi / 1 med / 1 low is not required
    // (so skip this)
    if (
      altitudes.length > 2 &&
      !(altitudes.length === stacks.length && stacks.length === 3)
    ) {
      switch (stacks.length) {
        case 2:
          answer2 += stacks[0].length + " HIGH "
          answer2 += stacks[1].length + " LOW "
          break
        case 3:
          answer2 += stacks[0].length + " HIGH "
          answer2 += stacks[1].length + " MEDIUM "
          answer2 += stacks[2].length + " LOW "
          break
      }
    }
  }

  // return stack and fillins
  return {
    stack: answer,
    fillIns: answer2,
  }
}

export interface GroupParams {
  ctx: CanvasRenderingContext2D
  sx?: number
  sy?: number
  nContacts?: number
  hdg?: number
  alts?: number[]
  desiredHdg?: number
  id?: IDMatrix
  dataTrailType: SensorType
}

export class AircraftGroup extends Array<Aircraft> {
  private startPos: Point = Point.DEFAULT
  // TODO -- Currently maneuvers are handled as a group
  // (all or nothing)
  //
  // Consider how to implement split/merge in maneuvers (animator)
  //
  private maneuvers = 0

  private label = "GROUP"

  private picDir: string | undefined

  constructor(p?: Partial<GroupParams>) {
    super()
    if (!p) p = {}
    this.startPos.x = p.sx || randomNumber(1, 100)
    this.startPos.y = p.sy || randomNumber(1, 100)

    p.sx = this.startPos.x
    p.sy = this.startPos.y

    // TODO -- user selected max # contacts per group?
    const nContacts = p.nContacts || randomNumber(1, 4)
    for (let contact = 0; contact < nContacts; contact++) {
      this.push(new Aircraft(p))

      const vectors = headingToRadians(this.getHeading())

      p.sx += PIXELS_TO_NM * Math.cos(vectors.offset)
      p.sy += PIXELS_TO_NM * -Math.sin(vectors.offset)
    }

    // TODO -- MANEUVER -- % chance of 2 maneuvers (i.e. flank turn back hot)
    if (randomNumber(0, 100) < 20) {
      this.maneuvers = 1
    }
    // TODO -- CAP -- console.warn("Fix isCapping (group/aircraft capping logic is broken)")
  }

  getStartPos(): Point {
    return this.startPos
  }

  getCenterOfMass(): Point {
    let x = 0
    let y = 0
    for (let idx = 0; idx < this.getStrength(); idx++) {
      const acPos = this[idx].getCenterOfMass()
      x += acPos.x
      y += acPos.y
    }
    return new Point(x / this.getStrength(), y / this.getStrength())
  }

  getAltitude(): number {
    return Math.max(...this.getAltitudes())
  }

  // They should all be heading the same dir when a group?
  getHeading(): number {
    return this[0].getHeading()
  }

  // To check if a group has routing, see if any of the AC have routing
  hasRouting(): boolean {
    return this.find((ac) => !ac.atFinalDestination()) !== undefined
  }

  doNextRouting(): void {
    this.forEach((ac) => ac.doNextRouting())
  }

  // TODO -- verify unnecessary
  // doNextAltitudeChange(): void{
  //     this.forEach((ac
  // }

  isCapping(): boolean {
    return false
  }

  getTrackDir(): string | undefined {
    if (this.isCapping()) {
      return "CAP"
    } else if (this.picDir) {
      return undefined
    }
    return trackDirFromHdg(this.getHeading())
  }

  updateIntent(newIntent: Partial<IntentParams>): void {
    this.forEach((ac) => ac.updateIntent(newIntent))
  }

  getAltStack(format: string): AltStack {
    return _getAltStack(this.getAltitudes(), format) //configuration.format)
  }

  getAltitudes(): number[] {
    const alts = []
    for (let idx = 0; idx < this.length; idx++) {
      alts.push(this[idx].getAltitude())
    }
    return alts
  }

  draw(context: CanvasRenderingContext2D, dataStyle: SensorType): void {
    this.forEach((ac) => ac.draw(context, dataStyle))
  }

  move(): void {
    this.forEach((ac) => ac.move())
  }

  getStrength(): number {
    return this.length
  }

  setManeuvers(newNumManeuvers: number): void {
    this.maneuvers = newNumManeuvers
  }

  doesManeuvers(): boolean {
    return this.maneuvers > 0
  }

  getLabel(): string {
    return this.label
  }

  setLabel(newLbl: string): void {
    this.label = newLbl
  }

  getPicDir(): string | undefined {
    return this.picDir
  }

  setPicDir(newDir: string | undefined): void {
    this.picDir = newDir
  }

  getNextRoutingPoint(): Point {
    return this[0].getNextRoutingPoint()
  }

  addRoutingPoint(pt: Point): void {
    this.forEach((ac) => ac.addRoutingPoint(pt))
  }

  updateAltitude(): void {
    this.forEach((ac) => ac.doNextAltChange())
  }

  isOnTask(): boolean {
    return this.find((ac) => ac.isTasked) !== undefined
  }

  getType(): ACType {
    return this[0].getType()
  }
}

// export class GroupofAC {
//     private picDir: string | undefined = undefined
//     private inCap = false
//     isCapping(): boolean {
//         return this.inCap
//     }
//     setCapping(isCap: boolean): void {
//         this.inCap = isCap
//     }
// ///// TODO -- in move, manage radar and IFF history (similar to vector arrow drawing)

// // if (props.dataStyle==="radar"){
// //   if (groups[x].radarPoints.length!==0){
// //     for (let z = 0; z < groups[x].radarPoints.length; z++){
// //       groups[x].radarPoints[z] = groups[x].radarPoints[z].slice(1)
// //       groups[x].drawnRadar[z] = groups[x].drawnRadar[z].slice(1)
// //       const endX = groups[x].radarPoints[z][groups[x].radarPoints[z].length-1].x
// //       const endY = groups[x].radarPoints[z][groups[x].radarPoints[z].length-1].y

// //       const startX = groups[x].radarPoints[z][0].x
// //       const startY = groups[x].radarPoints[z][0].y

// //       const deltX = endX-startX
// //       const deltY = endY-startY
// //       const rng = Math.sqrt(deltX * deltX + deltY * deltY)/3

// //       const newX = endX + (rng*Math.cos(rads+Math.random()/5))
// //       const newY = endY + (rng*-Math.sin(rads+Math.random()/5))
// //       groups[x].startX = groups[x].radarPoints[z][0].x
// //       groups[x].startY = groups[x].radarPoints[z][0].y

// //       const jit = 5
// //       const drawnX = newX + jit* Math.random()+Math.random()+Math.random()
// //       const drawnY = newY + jit*Math.random()+Math.random()+Math.random()

// //       groups[x].radarPoints[z].push({x:newX, y:newY})
// //       groups[x].drawnRadar[z].push({x:drawnX, y: drawnY})
// //     }
// //   }
// // }
