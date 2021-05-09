import { headingToRadians, PIXELS_TO_NM } from "../../../utils/psmath"
import { Point } from "../../point"
import { IDMatrix } from "../id"
import { DataTrail } from "./datatrail"

export class ArrowDataTrail extends DataTrail {
  private ARROW_SIZE_NM = 5
  getCenterOfMass(heading: number): Point {
    const vector = headingToRadians(heading)

    const dist = this.ARROW_SIZE_NM * PIXELS_TO_NM

    const startPos = this.getStartPos()
    return new Point(
      Math.floor(startPos.x + 1.2 * dist * Math.cos(vector.radians)),
      Math.floor(startPos.y + 1.2 * dist * -Math.sin(vector.radians))
    )
  }

  draw(ctx: CanvasRenderingContext2D, heading: number, id: IDMatrix): void {
    ctx.lineWidth = 1
    ctx.fillStyle = id

    let endx = 0
    let endy = 0

    const vector = headingToRadians(heading)

    const dist = this.ARROW_SIZE_NM * PIXELS_TO_NM

    const startPos = this.getStartPos()
    const startx = startPos.x
    const starty = startPos.y

    endy = starty + dist * -Math.sin(vector.radians)
    endx = startx + dist * Math.cos(vector.radians)

    ctx.beginPath()
    ctx.moveTo(startx, starty)
    ctx.lineTo(endx, endy)

    const heady: number =
      endy +
      this.ARROW_SIZE_NM * 0.4 * PIXELS_TO_NM * -Math.sin(vector.headAngle)
    const headx: number =
      endx +
      this.ARROW_SIZE_NM * 0.4 * PIXELS_TO_NM * Math.cos(vector.headAngle)

    ctx.lineTo(headx, heady)

    ctx.strokeStyle = id
    ctx.stroke()
    ctx.stroke()
    ctx.stroke()
  }
}