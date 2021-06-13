import { Point } from "classes/point"
import Tasking from "classes/taskings/tasking"

const PIXELS_TO_NM = 4

export interface IntentParams {
  desiredHeading: number
  desiredAlt: number
  desiredSpeed: number
  desiredLoc: Point[]
  tasking: Tasking
  forcedTurn: string | undefined
}

/**
 * Describes the "I want to..." of an Aircraft, for animation.
 *
 * Examples:
 * "I want to go to X,Y"
 * "I want 180 as my altitude"
 * "I want my speed to be xx kts"
 * "I want to go to heading 225" (presumably, to go to some fixed/moving target)
 */
export class AircraftIntent {
  private desiredHeading = 90
  private desiredAlt = 0
  private desiredSpeed = 450
  private desiredLoc: Point[] = []
  private forcedTurn: string | undefined

  /**
   * Construct, which really performs update to set initial values
   */
  constructor(newIntent?: Partial<IntentParams>) {
    this.updateIntent(newIntent)
  }

  /**
   * Setting desired altitude to 0 will drive a descend to terrain (i.e. landing)
   * Setting desired speed to 0 will slow the aircraft down to a stop (i.e. landing)
   *
   * Warning: Setting speed to 0 without a desired location with ParrotSour provided animators
   * will draw a non-moving arrow.
   *
   * @param newIntent Use new parameters to update desireds.
   */
  updateIntent(newIntent?: Partial<IntentParams>): void {
    newIntent = newIntent || {}
    this.desiredLoc = newIntent.desiredLoc || this.desiredLoc
    if (newIntent.desiredHeading === 0) newIntent.desiredHeading = 360
    this.desiredAlt = newIntent.desiredAlt || this.desiredAlt
    this.desiredHeading = newIntent.desiredHeading || this.desiredHeading
    this.desiredSpeed = newIntent.desiredSpeed || this.desiredSpeed
    this.forcedTurn = newIntent.forcedTurn || this.forcedTurn
  }

  /**
   * @param hdg Set a new desired heading
   */
  setDesiredHeading(hdg: number): void {
    this.desiredHeading = hdg
  }

  /**
   * @returns Currently desired heading.
   */
  getDesiredHeading(): number {
    return this.desiredHeading
  }

  getForcedTurn(): string | undefined {
    return this.forcedTurn
  }

  setForcedTurn(fTurn: string | undefined): void {
    this.forcedTurn = fTurn
  }

  /**
   * @returns Currently desired altitude.
   */
  getDesiredAltitude(): number {
    return this.desiredAlt
  }

  /**
   * @param newAlt Set new desired altitude.
   */
  setDesiredAltitude(newAlt: number): void {
    this.desiredAlt = newAlt
  }

  /**
   * @returns Currently desired speed.
   */
  getDesiredSpeed(): number {
    return this.desiredSpeed
  }

  /**
   * @param newSpeed Set new desired speed.
   */
  setDesiredSpeed(newSpeed: number): void {
    this.desiredSpeed = newSpeed
  }

  /**
   * @param pt Add this point to the *end* of the current intended route.
   */
  addRoutingPoint(pt: Point): void {
    this.desiredLoc.push(pt)
  }

  /**
   * Remove the first routing point from the current intended route.
   */
  removeRoutingPoint(): void {
    this.desiredLoc = this.desiredLoc.slice(1)
  }

  /**
   * Clears current routing points
   */
  clearRouting(): void {
    this.desiredLoc = []
  }

  /**
   * @returns The next (x,y) point along the current intended route.
   */
  getNextRoutingPoint(): Point | undefined {
    let retPt = undefined
    if (this.desiredLoc.length > 0) {
      retPt = this.desiredLoc[0]
    }
    return retPt
  }

  /**
   * @param curPt Location to compare (destination) to.
   * @returns true iff Current location is within 5 NM of the target.
   */
  atNextRoutingPoint(curPt: Point): boolean {
    const firstLoc = this.getNextRoutingPoint()
    let isAtNext = false
    if (firstLoc) {
      const reachedDestX = Math.abs(firstLoc.x - curPt.x) < 5 * PIXELS_TO_NM
      const reachedDestY = Math.abs(firstLoc.y - curPt.y) < 5 * PIXELS_TO_NM
      isAtNext = reachedDestX && reachedDestY
    }
    return isAtNext
  }

  /**
   * @returns true iff there are no more locations in the current intended route.
   */
  atFinalDestination(): boolean {
    return this.desiredLoc.length === 0
  }
}
