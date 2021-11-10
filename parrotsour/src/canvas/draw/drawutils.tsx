/**
 * This file contains common low-level drawing utilities used
 * to build groups and pictures.
 */

// Interfaces
import { Point } from "../../classes/point"

/**
 * 'Clamp' the location to the confines of the drawing context
 * @param ctx The context to constrict it to
 * @param pos the current position
 */
export function clampInContext(
  ctx: CanvasRenderingContext2D,
  x: number | Point,
  y?: number
): Point {
  let retPoint = Point.DEFAULT
  if (x instanceof Point) {
    retPoint = new Point(
      Math.min(Math.max(x.x, 0), ctx.canvas.width),
      Math.min(Math.max(x.y, 0), ctx.canvas.height)
    )
  } else {
    if (y === undefined) y = 0
    retPoint = new Point(
      Math.min(Math.max(x, 0), ctx.canvas.width),
      Math.min(Math.max(y, 0), ctx.canvas.height)
    )
  }
  return retPoint
}
