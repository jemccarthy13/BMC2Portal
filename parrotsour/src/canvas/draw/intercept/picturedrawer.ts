import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { PictureInfo } from "./pictureclamp"

export interface PictureDrawer {
  chooseNumGroups(nCts: number): number

  getPictureInfo(start?: Point): PictureInfo

  createGroups: (startPos: Point, contactList: number[]) => AircraftGroup[]

  drawInfo(): void

  getAnswer(): string
}
