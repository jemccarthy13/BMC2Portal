import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import {
  PIXELS_TO_NM,
  randomHeading,
  randomNumber,
} from "../../../utils/psmath"
import { FightAxis } from "../../canvastypes"
import { DrawPic } from "./drawpic"
import { getRestrictedStartPos, PictureInfo } from "./pictureclamp"

export default class DrawVic extends DrawPic {
  getNumGroups(): number {
    return 3
  }

  getPictureInfo(start?: Point): PictureInfo {
    const picture = {
      start,
      wide: randomNumber(7 * PIXELS_TO_NM, 30 * PIXELS_TO_NM),
      deep: randomNumber(7 * PIXELS_TO_NM, 30 * PIXELS_TO_NM),
    }
    const startPos = getRestrictedStartPos(
      this.ctx,
      this.state.blueAir,
      this.props.orientation.orient,
      this.props.dataStyle,
      45 + picture.deep,
      100,
      picture
    )
    picture.start = startPos
    return picture
  }

  createGroups = (startPos: Point, contactList: number[]): AircraftGroup[] => {
    const isNS = FightAxis.isNS(this.props.orientation.orient)
    // start with trail groups (because clamp)
    let heading: number = randomHeading(
      this.props.format,
      this.state.blueAir.getHeading()
    )
    const ntg = new AircraftGroup({
      ctx: this.ctx,
      sx: startPos.x,
      sy: startPos.y,
      hdg: heading + randomNumber(-10, 10),
      nContacts: contactList[0],
    })

    if (this.props.isHardMode)
      heading = randomHeading(
        this.props.format,
        this.state.blueAir.getHeading()
      )
    let stg: AircraftGroup
    if (isNS) {
      stg = new AircraftGroup({
        ctx: this.ctx,
        sx: startPos.x + this.wide,
        sy: startPos.y,
        hdg: heading + randomNumber(-10, 10),
        nContacts: contactList[1],
      })
    } else {
      stg = new AircraftGroup({
        ctx: this.ctx,
        sx: startPos.x,
        sy: startPos.y + this.wide,
        hdg: heading + randomNumber(-10, 10),
        nContacts: contactList[1],
      })
    }

    return []
  }

  drawInfo(): void {
    throw new Error("Method not implemented.")
  }
  getAnswer(): string {
    throw new Error("Method not implemented.")
  }
}
