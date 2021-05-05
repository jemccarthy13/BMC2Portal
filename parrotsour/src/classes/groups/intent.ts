import { Point } from "classes/point"
import { Tasking } from "classes/taskings/tasking"

export interface IntentParams {
  desiredHeading: number
  desiredAlt: number
  desiredSpeed: number // TODO -- implement speed
  desiredLoc: Point[]
  tasking: Tasking
}

// TODO -- use a Intent class:
//  'this group wants to':
//     - fly new hdg
//     - move to new loc
//     - climb/desc new alt
//     - accel/decel new speed
// to reduce the size of 'Group'
// intent.met() ~= atFinalDest
// intent.update(Partial<IntentParams>) to
//   update desired hdg/alt/loc/speed
// intent.clear(Partial<IntentParams>) to
//   remove desired hdg/alt/loc/speed
// ?? work in progress
export class AircraftIntent {
  private desiredHeading = 90
  private desiredAlt = 0
  private desiredSpeed = 450 // TODO -- implement speed
  private desiredLoc: Point[] = []

  updateIntent(newIntent: Partial<IntentParams>): void {
    if (newIntent.desiredAlt === 0 || newIntent.desiredSpeed === 0) {
      console.warn(
        "Setting intended speed or alt to 0 will not result in a change."
      )
    }
    if (newIntent.desiredHeading === 0) newIntent.desiredHeading = 360
    this.desiredAlt = newIntent.desiredAlt || this.desiredAlt
    this.desiredHeading = newIntent.desiredHeading || this.desiredHeading
    this.desiredSpeed = newIntent.desiredSpeed || this.desiredSpeed
    this.desiredLoc = newIntent.desiredLoc || this.desiredLoc
  }

  hasRouting(): boolean {
    return this.desiredLoc.length !== 0
  }

  addRoutingPoint(pt: Point): void {
    this.desiredLoc.push(pt)
  }

  removeRoutingPoint(): void {
    this.desiredLoc = this.desiredLoc.slice(1)
  }

  getNextRoutingPoint(): Point {
    return this.desiredLoc[0]
  }

  atNextRoutingPoint(curPt: Point): boolean {
    const firstLoc = this.getNextRoutingPoint()
    const reachedDestX = Math.abs(firstLoc.x - curPt.x) < 20
    const reachedDestY = Math.abs(firstLoc.y - curPt.y) < 20
    return reachedDestX && reachedDestY
  }

  setDesiredHeading(hdg: number): void {
    this.desiredHeading = hdg
  }

  getDesiredHeading(): number {
    return this.desiredHeading
  }

  getDesiredAltitude(): number {
    return this.desiredAlt
  }

  setDesiredAltitude(newAlt: number): void {
    this.desiredAlt = newAlt
  }

  getDesiredSpeed(): number {
    return this.desiredSpeed
  }

  setDesiredSpeed(newSpeed: number): void {
    this.desiredSpeed = newSpeed
  }

  atFinalDestination(): boolean {
    return this.desiredLoc.length === 0
  }
}
