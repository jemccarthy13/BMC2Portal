import { BlueInThe } from "../canvas/canvastypes"
import { BRAA } from "./braa"
import { PIXELS_TO_NM, toDegrees } from "../utils/psmath"

/**
 * An x,y Cartesian point that can calculate bearing and
 * range to another point.
 */
export class Point {
  x: number
  y: number

  static DEFAULT = new Point(0, 0)

  /**
   * Construct a new x,y point
   */
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  /**
   * Get a bearing and range between this point and another point
   *
   * @param ptTo the "other" or "to" point
   * @returns the bearing and range between this (ptFrom) and ptTo
   */
  getBR(toPoint: Point): BRAA {
    const deltaX = this.x - toPoint.x
    const deltaY = this.y - toPoint.y

    // distance formula for range
    const rng = Math.floor(
      Math.sqrt(deltaX * deltaX + deltaY * deltaY) / PIXELS_TO_NM
    )

    // convert cartesian angle to heading
    let brg = Math.round(
      270 + toDegrees(Math.atan2(this.y - toPoint.y, this.x - toPoint.x))
    )
    if (brg > 360) {
      brg = brg - 360
    }

    return new BRAA(brg, rng)
  }

  /**
   * Get distance between points (straight along axis, i.e. not slant range)
   */
  public straightDistNM(toPoint: Point, orientation: BlueInThe): number {
    return Math.floor(
      Math.abs(
        orientation === BlueInThe.NORTH || orientation === BlueInThe.SOUTH
          ? this.y - toPoint.y
          : this.x - toPoint.x
      ) / PIXELS_TO_NM
    )
  }
}
