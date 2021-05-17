/**
 * This file contains common low-level drawing utilities used
 * to build groups and pictures.
 */

// Interfaces
import { AircraftGroup } from "../../classes/groups/group"
import {
  PictureCanvasProps,
  PictureCanvasState,
} from "../../canvas/canvastypes"
import { Point } from "../../classes/point"
import { Braaseye } from "../../classes/braaseye"

// Utility functions
import { formatAlt } from "./formatutils"
import { PIXELS_TO_NM, randomNumber } from "../../utils/psmath"

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

/**
 * Draw a line on the drawing context, given the properties
 * @param ctx Context to draw on
 * @param startX start x of the line
 * @param startY start y of the line
 * @param endX end x of the line
 * @param endY end y of the line
 * @param color (optional) color of the line, defaults to black
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color = "black"
): void {
  ctx.lineWidth = 1
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()
  ctx.stroke()
}

/**
 * Draw text to the drawing context at the given position
 * @param ctx The context to draw on
 * @param text Text to draw
 * @param x X Position to draw at
 * @param y Y Position to draw at
 * @param size (optional) Size of the text to draw, defaults 12
 * @param color (optional) Color of the text, defaults to black
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size = 12,
  color = "black"
): void {
  ctx.lineWidth = 1
  ctx.fillStyle = color
  ctx.font = size + "px Arial"
  const pos = clampInContext(ctx, x, y)

  ctx.fillText(text, pos.x, pos.y)
  ctx.fillText(text, pos.x, pos.y)
}

/**
 * Draw altitudes next to a group with optional offset
 *
 * @param ctx Current drawing context
 * @param grpPos group's current position
 * @param alts altitudes to draw
 * @param offX (optional) x-axis offset from group
 * @param offY (optional) y-axis offset from group
 */
export function drawAltitudes(
  ctx: CanvasRenderingContext2D,
  grpPos: Point,
  alts: number[],
  offX?: number,
  offY?: number
): void {
  const offsetX = offX || 0
  const offsetY = offY || 0
  const formattedAlts: string[] = alts.map((a: number) => {
    return formatAlt(a)
  })
  drawText(
    ctx,
    formattedAlts.join(","),
    grpPos.x + 25 + offsetX,
    grpPos.y - 11 + offsetY,
    11,
    "#ff8c00"
  )
}

/**
 * Draw a measurement (distance with a length number)
 * @param ctx Context to draw on
 * @param startX X position to start for line
 * @param startY Y position to start for line
 * @param endX X position to end for line
 * @param endY Y position to end for line
 * @param distance Distance of the measurement
 * @param showMeasurements true iff measurement should be drawn/shown
 */
export function drawMeasurement(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  distance: number,
  showMeasurements: boolean
): void {
  if (showMeasurements) {
    drawLine(ctx, startX, startY, endX, endY)
    drawText(
      ctx,
      Math.floor(distance).toString(),
      (startX + endX) / 2,
      (startY + endY) / 2 - 3
    )
  }
}

export function drawBullseye(
  context: CanvasRenderingContext2D,
  bull?: Point,
  color?: string
): Point {
  color = color || "black"
  context.lineWidth = 1
  context.fillStyle = color
  context.strokeStyle = color

  const centerPointX = bull
    ? bull.x
    : randomNumber(context.canvas.width * 0.33, context.canvas.width * 0.66)
  const centerPointY = bull
    ? bull.y
    : randomNumber(context.canvas.height * 0.33, context.canvas.height * 0.66)

  context.beginPath()
  context.arc(
    centerPointX,
    centerPointY,
    PIXELS_TO_NM / 2,
    0,
    2 * Math.PI,
    true
  )
  context.stroke()
  context.fill()

  context.moveTo(centerPointX, centerPointY + PIXELS_TO_NM * 2)
  context.lineTo(centerPointX, centerPointY - PIXELS_TO_NM * 2)
  context.stroke()

  context.moveTo(centerPointX + PIXELS_TO_NM * 2, centerPointY)
  context.lineTo(centerPointX - PIXELS_TO_NM * 2, centerPointY)
  context.stroke()

  return new Point(centerPointX, centerPointY)
}

export function drawFullInfo(
  ctx: CanvasRenderingContext2D,
  state: PictureCanvasState,
  props: PictureCanvasProps,
  groups: AircraftGroup[]
): void {
  for (let y = 0; y < groups.length; y++) {
    const grpPos = groups[y].getCenterOfMass(props.dataStyle)
    if (props.showMeasurements) {
      new Braaseye(
        grpPos,
        state.blueAir.getCenterOfMass(props.dataStyle),
        state.bullseye
      ).draw(ctx, true, props.braaFirst)
    }
    drawAltitudes(ctx, grpPos, groups[y].getAltitudes())
  }
}
