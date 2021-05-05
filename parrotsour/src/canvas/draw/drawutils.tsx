/**
 * This file contains common low-level drawing utilities used
 * to build groups and pictures.
 */

// Interfaces
import { AircraftGroup } from "../../classes/groups/group"
import {
  BlueInThe,
  FightAxis,
  PictureCanvasState,
} from "../../canvas/canvastypes"
import { Point } from "../../classes/point"
import { Braaseye } from "../../classes/braaseye"

// Utility functions
import { formatAlt } from "./formatutils"
import { randomNumber, toRadians } from "../../utils/psmath"

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

/**
 * Draw a capping group's arrows
 * @param orientation Orientation of the drawing context
 * @param contacts Number of contacts in the CAP
 * @param startX X starting position
 * @param startY Y starting position
 * @param color (optional) color for the CAP, defaults to red
 */
export function drawGroupCap(
  c: CanvasRenderingContext2D,
  orientation: BlueInThe,
  contacts: number,
  startX: number,
  startY: number,
  color = "red"
): AircraftGroup {
  if (!c) {
    return new AircraftGroup()
  }

  // eslint-disable-next-line
  let alts: number[] = [...Array(contacts)].map((_) => randomNumber(15, 45))

  c.lineWidth = 1
  c.fillStyle = color
  c.strokeStyle = color

  c.beginPath()

  let radius = 10
  if (contacts === 1) {
    c.arc(startX, startY, 10, 1.0 * Math.PI, 0.8 * Math.PI)
    c.stroke()
    drawLine(c, startX - 8, startY + 6, startX - 6, startY + 12, color)
  } else {
    const ratio = 2 / contacts - 0.1
    let startPI = 0
    let endPI = ratio
    radius = 12
    for (let x = 1; x <= contacts; x++) {
      c.arc(startX, startY, radius, startPI * Math.PI, endPI * Math.PI)
      c.stroke()

      const opp: number = radius * Math.sin(endPI * Math.PI)
      const adj: number = radius * Math.cos(endPI * Math.PI)

      const endy = startY + opp
      const endx = startX + adj

      c.beginPath()
      c.moveTo(startX + adj * 0.6, startY + opp * 0.9)
      c.lineTo(endx, endy)
      c.stroke()
      c.beginPath()

      startPI = endPI + 0.1
      endPI = startPI + ratio
    }
  }

  const angle = FightAxis.isNS(orientation) ? 0 : 270
  const sY: number = Math.floor(startY + radius * Math.sin(toRadians(angle)))
  const sX: number = Math.floor(startX + radius * Math.cos(toRadians(angle)))

  const p = {
    sx: startX,
    sy: startY,
    sX,
    sY,
    numContacts: contacts,
    hdg: randomNumber(0, 360),
    alts,
    desiredHdg: 90,
  }
  return new AircraftGroup(p)
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
  context.arc(centerPointX, centerPointY, 2, 0, 2 * Math.PI, true)
  context.stroke()
  context.fill()

  context.moveTo(centerPointX, centerPointY + 6)
  context.lineTo(centerPointX, centerPointY - 6)
  context.stroke()

  context.moveTo(centerPointX + 6, centerPointY)
  context.lineTo(centerPointX - 6, centerPointY)
  context.stroke()

  return new Point(centerPointX, centerPointY)
}

export function drawFullInfo(
  ctx: CanvasRenderingContext2D,
  state: PictureCanvasState,
  braaFirst: boolean,
  showMeasurements: boolean,
  groups: AircraftGroup[]
): void {
  for (let y = 0; y < groups.length; y++) {
    const grpPos = groups[y].getCenterOfMass()
    if (showMeasurements) {
      new Braaseye(
        grpPos,
        state.blueAir.getCenterOfMass(),
        state.bullseye
      ).draw(ctx, true, braaFirst)
    }
    drawAltitudes(ctx, grpPos, groups[y].getAltitudes())
  }
}
