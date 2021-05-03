import { drawText } from "../canvas/draw/drawutils"
import { lpad } from "../utils/mathutilities"

/**
 * BRAA is a class that contains a bearing and range
 * as well as formatting and drawing functions for any bearing/range.
 */
export class BRAA {
  bearing = "000"
  bearingNum = 0
  range = 0
  label = ""

  constructor(bearingNum: number, range: number) {
    this.bearingNum = bearingNum
    this.bearing = lpad(this.bearingNum, 3)
    this.range = range
  }

  /**
   * Formatter
   *
   * @returns Formatted bearing and range
   */
  public toString(): string {
    return this.label + " " + this.bearing + "/" + this.range
  }

  /**
   * Draw a bearing and range at the given coordinates.
   *
   * @param ctx Current drawing context
   * @param x X position of draw
   * @param y Y position of draw
   * @param color
   * @param showMeasurements
   */
  draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color?: string,
    showMeasurements?: boolean
  ): void {
    if (showMeasurements) {
      drawText(ctx, this.bearing + "/" + this.range, x, y, 11, color)
    }
  }
}
