import { headingToRadians, PIXELS_TO_NM } from "../../../utils/psmath"
import { Point } from "../../point"
import { IDMatrix } from "../id"
import { DataTrail } from "./datatrail"

export class IFFDataTrail extends DataTrail {
  private iffPoints: Point[] = []
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
    const iPts: Point[] = []
    // draw the radar trail
    if (!this.iffPoints || this.iffPoints.length === 0) {
      for (let mult = 0; mult < 6; mult++) {
        xPos = startx + offsetX * mult + offsetX * 0.5
        yPos = starty + offsetY * mult + offsetY * 0.5
        iPts.push(new Point(xPos, yPos))
      }
      this.iffPoints = iPts
    }
  }

  getCenterOfMass(): Point {
    return this._getOnePlotAhead()
  }

  public move(heading: number): void {
    // this logic should be in move()
    // take the first point out of the radar trail
    const newIFFPts = this.iffPoints.slice(1)

    const startPos = this.getStartPos()
    const startx = startPos.x
    const starty = startPos.y
    const vector = headingToRadians(heading)

    const endy = starty + this.LEN_TRAIL * -Math.sin(vector.radians)
    const endx = startx + this.LEN_TRAIL * Math.cos(vector.radians)
    const offsetX = (endx - startx) / PIXELS_TO_NM
    const offsetY = (endy - starty) / PIXELS_TO_NM

    // add a bit of jitter with randomness
    const jit = 1

    const xPos = startx + offsetX * 6 + jit * Math.random() + Math.random()
    const yPos = starty + offsetY * 6 + jit * Math.random() + Math.random()
    newIFFPts.push(new Point(xPos, yPos))
    this.iffPoints = newIFFPts
  }

  draw(ctx: CanvasRenderingContext2D, heading: number, id: IDMatrix): void {
    if (id !== IDMatrix.SUSPECT && id !== IDMatrix.HOSTILE) {
      ctx.strokeStyle = "blue"
      ctx.lineWidth = 1
      for (let l = 0; l < this.iffPoints.length; l++) {
        const xPos = this.iffPoints[l].x
        const yPos = this.iffPoints[l].y
        ctx.beginPath()
        ctx.moveTo(xPos, yPos)
        ctx.lineTo(xPos - 3, yPos)
        ctx.lineTo(xPos - 3, yPos - 3)
        ctx.lineTo(xPos, yPos - 3)
        ctx.lineTo(xPos, yPos)
        ctx.stroke()
      }
    }
  }

  _getOnePlotAhead(): Point {
    const cPt = this.iffPoints[this.iffPoints.length - 1]
    const pPt = this.iffPoints[this.iffPoints.length - 2]

    const deltX = cPt.x - pPt.x
    const deltY = cPt.y - pPt.y

    return new Point(cPt.x + deltX, cPt.y + deltY)
  }
}
