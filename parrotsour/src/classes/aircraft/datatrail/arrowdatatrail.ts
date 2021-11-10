import { PaintBrush } from "../../../canvas/draw/paintbrush"
import { headingToRadians, PIXELS_TO_NM } from "../../../utils/psmath"
import { Point } from "../../point"
import { IDMatrix } from "../id"
import { DataTrail } from "./datatrail"

export class ArrowDataTrail extends DataTrail {
  public static LEN_TRAIL = 5
  getCenterOfMass(heading: number): Point {
    const vector = headingToRadians(heading)

    const dist = ArrowDataTrail.LEN_TRAIL * PIXELS_TO_NM

    const startPos = this.getStartPos()
    return new Point(
      Math.floor(startPos.x + 1.2 * dist * Math.cos(vector.radians)),
      Math.floor(startPos.y + 1.2 * dist * -Math.sin(vector.radians))
    )
  }

  draw(heading: number, id: IDMatrix): void {
    const ctx = PaintBrush.getContext()
    ctx.lineWidth = 1
    ctx.fillStyle = id

    let endx = 0
    let endy = 0

    const vector = headingToRadians(heading)

    const dist = ArrowDataTrail.LEN_TRAIL * PIXELS_TO_NM

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
      ArrowDataTrail.LEN_TRAIL *
        0.4 *
        PIXELS_TO_NM *
        -Math.sin(vector.headAngle)
    const headx: number =
      endx +
      ArrowDataTrail.LEN_TRAIL * 0.4 * PIXELS_TO_NM * Math.cos(vector.headAngle)

    ctx.lineTo(headx, heady)

    ctx.strokeStyle = id
    ctx.stroke()
    ctx.stroke()
    ctx.stroke()
  }
}
