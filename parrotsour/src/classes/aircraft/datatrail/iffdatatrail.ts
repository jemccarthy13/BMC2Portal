import { Point } from "../../point"
import { IDMatrix } from "../id"
import { DataTrail } from "./datatrail"

export class IFFDataTrail extends DataTrail {
  private iffData: Point[] = []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCenterOfMass(_heading: number): Point {
    return this.iffData[this.iffData.length - 1]
  }

  draw(ctx: CanvasRenderingContext2D, heading: number, id: IDMatrix): void {
    if (id !== IDMatrix.SUSPECT && id !== IDMatrix.HOSTILE) {
      //console.log("draw iff")
    }
    // error but don't break the runtime
  }
}
