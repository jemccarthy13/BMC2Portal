import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { DrawPic } from "./drawpic"
import { PictureInfo } from "./pictureclamp"

export default class DrawPOD extends DrawPic {
  chooseNumGroups(nCts: number): number {
    throw new Error("Method not implemented.")
  }

  getPictureInfo(start?: Point): PictureInfo {
    throw new Error("Method not implemented.")
  }

  createGroups = (startPos: Point, contactList: number[]): AircraftGroup[] => {
    return []
  }

  drawInfo(): void {
    throw new Error("Method not implemented.")
  }

  getAnswer(): string {
    throw new Error("Method not implemented.")
  }
}
