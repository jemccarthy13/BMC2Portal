import { Braaseye } from "../../classes/braaseye"
import { AircraftGroup } from "../../classes/groups/group"
import { Point } from "../../classes/point"
import { PIXELS_TO_NM, randomNumber } from "../../utils/psmath"
import { PictureCanvasProps, PictureCanvasState } from "../canvastypes"
import { clampInContext } from "./drawutils"
import { formatAlt } from "./formatutils"

export class PaintBrush {
  private static ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    PaintBrush.ctx = ctx
  }

  public static use(ctx: CanvasRenderingContext2D | undefined | null): void {
    if (ctx) PaintBrush.ctx = ctx
  }

  public static getContext(): CanvasRenderingContext2D {
    return PaintBrush.ctx
  }

  public static clearCanvas(): void {
    const ctx = PaintBrush.ctx
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  /**
   * Draw a line on the drawing context, given the properties
   * @param startX start x of the line
   * @param startY start y of the line
   * @param endX end x of the line
   * @param endY end y of the line
   * @param color (optional) color of the line, defaults to black
   */
  public static drawLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color = "black",
    forcedCtx?: CanvasRenderingContext2D
  ): void {
    let context = PaintBrush.ctx
    if (forcedCtx) context = forcedCtx
    context.lineWidth = 1
    context.strokeStyle = color
    context.beginPath()
    context.moveTo(startX, startY)
    context.lineTo(endX, endY)
    context.stroke()
    context.stroke()
  }

  /**
   * Draw text to the drawing context at the given position
   * @param text Text to draw
   * @param x X Position to draw at
   * @param y Y Position to draw at
   * @param size (optional) Size of the text to draw, defaults 12
   * @param color (optional) Color of the text, defaults to black
   */
  public static drawText(
    text: string,
    x: number,
    y: number,
    size = 12,
    color = "black"
  ): void {
    const ctx = PaintBrush.ctx
    ctx.lineWidth = 1
    ctx.fillStyle = color
    ctx.font = size + "px Arial"
    const pos = clampInContext(ctx, x, y)

    ctx.fillText(text, pos.x, pos.y)
    ctx.fillText(text, pos.x, pos.y)
  }

  /**
   * Draw a measurement (distance with a length number)
   * @param {Point} start position to start for line
   * @param {Point} end position to end for line
   * @param {number} distance how long the line should be
   * @param {boolean} showMeasurements Display the measurements
   */
  public static drawMeasurement(
    start: Point,
    end: Point,
    distance: number,
    showMeasurements: boolean
  ): void {
    if (showMeasurements) {
      PaintBrush.drawLine(start.x, start.y, end.x, end.y)
      PaintBrush.drawText(
        Math.floor(distance).toString(),
        (start.x + end.x) / 2,
        (start.y + end.y) / 2 - 3
      )
    }
  }

  /**
   * Draw altitudes next to a group with optional offset
   *
   * @param grpPos group's current position
   * @param alts altitudes to draw
   * @param offX (optional) x-axis offset from group
   * @param offY (optional) y-axis offset from group
   */
  public static drawAltitudes(
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
    PaintBrush.drawText(
      formattedAlts.join(","),
      grpPos.x + 25 + offsetX,
      grpPos.y - 11 + offsetY,
      11,
      "#ff8c00"
    )
  }

  public static drawBullseye(bull?: Point, color?: string): Point {
    const context = PaintBrush.ctx
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

  public static drawFullInfo(
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
        ).draw(true, props.braaFirst)
      }
      PaintBrush.drawAltitudes(grpPos, groups[y].getAltitudes())
    }
  }
}
