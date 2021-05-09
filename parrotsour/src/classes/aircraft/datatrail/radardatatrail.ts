import { drawBullseye } from "../../../canvas/draw/drawutils"
import { PaintBrush } from "../../../canvas/draw/paintbrush"
import {
  headingToRadians,
  PIXELS_TO_NM,
  toRadians,
} from "../../../utils/psmath"
import { Point } from "../../point"
import { IDMatrix } from "../id"
import { DataTrail } from "./datatrail"

export class RadarDataTrail extends DataTrail {
  private radarPoints: Point[] = []

  private LEN_TRAIL: number = 7 * PIXELS_TO_NM
  constructor(startPos: Point, heading: number) {
    super(startPos)

    const starty = startPos.y
    const startx = startPos.x
    const vector = headingToRadians(heading)
    const endy = starty + this.LEN_TRAIL * -Math.sin(vector.radians)
    const endx = startx + this.LEN_TRAIL * Math.cos(vector.radians)

    const offsetX = (endx - startx) / PIXELS_TO_NM
    const offsetY = (endy - starty) / PIXELS_TO_NM

    let xPos = startx
    let yPos = starty
    const rdrPts: Point[] = []
    // draw the radar trail
    if (!this.radarPoints || this.radarPoints.length === 0) {
      for (let mult = 0; mult < 6; mult++) {
        // add a bit of jitter with randomness
        const jit = 3
        xPos = startx + offsetX * mult + jit * Math.random() + Math.random()
        yPos = starty + offsetY * mult + jit * Math.random() + Math.random()
        const rdrPt = new Point(xPos, yPos)
        rdrPts.push(rdrPt)
      }
      this.radarPoints = rdrPts
    }
  }

  getCenterOfMass(heading: number): Point {
    return this._getOnePlotAhead()
  }

  public move(heading: number): void {
    // this logic should be in move()
    // take the first point out of the radar trail
    const newRdrPts = this.radarPoints.slice(1)

    const startPos = this.getStartPos()
    const startx = startPos.x
    const starty = startPos.y
    const vector = headingToRadians(heading)

    const endy = starty + this.LEN_TRAIL * -Math.sin(vector.radians)
    const endx = startx + this.LEN_TRAIL * Math.cos(vector.radians)
    const offsetX = (endx - startx) / PIXELS_TO_NM
    const offsetY = (endy - starty) / PIXELS_TO_NM

    // add a bit of jitter with randomness
    const jit = 3

    const xPos = startx + offsetX * 6 + jit * Math.random() + Math.random()
    const yPos = starty + offsetY * 6 + jit * Math.random() + Math.random()
    newRdrPts.push(new Point(xPos, yPos))
    this.radarPoints = newRdrPts
  }

  draw(ctx: CanvasRenderingContext2D, heading: number, id: IDMatrix): void {
    // Draw radar dots
    ctx.strokeStyle = "#FF8C00"
    ctx.beginPath()
    this.radarPoints.forEach((pt) => {
      ctx.beginPath()
      ctx.moveTo(pt.x, pt.y)
      ctx.lineTo(pt.x - 3, pt.y - 3)
      ctx.stroke()
      ctx.stroke()
    })

    this._drawSymbology(ctx, id)
  }

  public getDataTrail(): Point[] {
    return this.radarPoints
  }

  _getOnePlotAhead(): Point {
    const cPt = this.radarPoints[this.radarPoints.length - 1]
    const pPt = this.radarPoints[this.radarPoints.length - 2]

    const deltX = cPt.x - pPt.x
    const deltY = cPt.y - pPt.y

    return new Point(cPt.x + deltX, cPt.y + deltY)
  }

  _drawSymbology(ctx: CanvasRenderingContext2D, id: IDMatrix): void {
    const plotAhead = this._getOnePlotAhead()

    ctx.strokeStyle = id

    if (id === IDMatrix.FRIEND) {
      // draw friend symbology (blue arc/upside-down U)
      ctx.moveTo(plotAhead.x - 2.5, plotAhead.y - 2.5)
      ctx.beginPath()
      ctx.arc(
        plotAhead.x - 2.5,
        plotAhead.y - 0.5,
        4,
        toRadians(170),
        toRadians(10)
      )
      ctx.stroke()
    } else {
      ctx.beginPath()
      const headX = plotAhead.x - 3
      const headY = plotAhead.y - 3

      const leftX = headX + 5 * Math.cos(toRadians(240))
      const leftY = headY + 5 - Math.sin(toRadians(240))
      ctx.moveTo(headX, headY)
      ctx.lineTo(leftX, leftY)

      const rightX = headX + 5 * Math.cos(toRadians(300))
      const rightY = headY + 5 - Math.sin(toRadians(300))
      ctx.moveTo(headX, headY)
      ctx.lineTo(rightX, rightY)
      ctx.stroke()
      ctx.stroke()
    }
  }
}
