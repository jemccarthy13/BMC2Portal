// Classes & Interfaces
import { SensorType } from "../groups/datatrail"
import { Point } from "../point"
import { ACType, Aircraft } from "../groups/aircraft"
import { IDMatrix } from "../groups/id"
import { IntentParams } from "../groups/intent"

import { AltStack, getAltStack } from "../altstack"
// Functions
import { trackDirFromHdg } from "../../utils/mathutilities"
import {
  headingToRadians,
  PIXELS_TO_NM,
  randomNumber,
} from "../../utils/psmath"
import Tasking from "../taskings/tasking"

export interface GroupParams {
  ctx: CanvasRenderingContext2D
  dataTrailType: SensorType
  sx?: number
  sy?: number
  nContacts?: number
  hdg?: number
  alts?: number[]
  desiredHdg?: number
  id?: IDMatrix
  type?: ACType
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

    p.hdg = p.hdg || 90

    // TODO -- user selected max # contacts per group?
    const nContacts = p.nContacts || randomNumber(1, 4)
    for (let contact = 0; contact < nContacts; contact++) {
      if (p.alts && p.alts[contact])
        this.push(new Aircraft({ ...p, alt: p.alts[contact] }))
      else {
        this.push(new Aircraft(p))
      }

      const vectors = headingToRadians(p.hdg)

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

  isCapping(): boolean {
    return (
      this.find((ac) => {
        return !ac.isCapping()
      }) === undefined
    )
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
    return getAltStack(this.getAltitudes(), format)
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

  setTasking(task: Tasking): void {
    this.forEach((ac: Aircraft) => {
      ac.setTasking(task)
    })
  }

  isOnTask(): boolean {
    return this.find((ac) => ac.isTasked()) !== undefined
  }

  getType(): ACType {
    return this[0].getType()
  }
}
