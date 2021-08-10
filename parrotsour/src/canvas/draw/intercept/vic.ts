import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import {
  PIXELS_TO_NM,
  randomHeading,
  randomNumber,
} from "../../../utils/psmath"
import { FightAxis } from "../../canvastypes"
import { drawAltitudes, drawMeasurement } from "../drawutils"
import { formatGroup, getOpenCloseAzimuth } from "../formatutils"
import { DrawPic } from "./drawpic"
import { getRestrictedStartPos, PictureInfo } from "./pictureclamp"
import { isAnchorNorth, picTrackDir } from "./picturehelpers"

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
    const { format, isHardMode } = this.props
    const { blueAir } = this.state

    const isNS = FightAxis.isNS(this.props.orientation.orient)
    // start with trail groups (because clamp)
    let sx = startPos.x
    let sy = startPos.y
    let heading: number = randomHeading(format, blueAir.getHeading())
    const ntg = new AircraftGroup({
      ctx: this.ctx,
      sx,
      sy,
      hdg: heading + randomNumber(-10, 10),
      nContacts: contactList[0],
    })

    if (isHardMode) heading = randomHeading(format, blueAir.getHeading())

    if (isNS) {
      sx = startPos.x + this.wide
    } else {
      sy = startPos.y + this.wide
    }
    const stg = new AircraftGroup({
      ctx: this.ctx,
      sx,
      sy,
      hdg: heading + randomNumber(-10, 10),
      nContacts: contactList[1],
    })

    if (isHardMode) heading = randomHeading(format, blueAir.getHeading())
    if (isNS) {
      sx = startPos.x + this.wide / 2
      sy = startPos.y - this.deep
    } else {
      sx = startPos.x + this.deep
      sy = startPos.y + this.wide / 2
    }
    const lg = new AircraftGroup({
      ctx: this.ctx,
      sx,
      sy,
      hdg: heading,
      nContacts: contactList[2],
    })

    return [lg, ntg, stg]
  }

  drawInfo(): void {
    const { dataStyle, showMeasurements, braaFirst } = this.props
    const { blueAir, bullseye } = this.state
    const isNS = FightAxis.isNS(this.props.orientation.orient)

    const lg = this.groups[0]
    const ntg = this.groups[1]
    const stg = this.groups[2]

    const ntgPos = ntg.getCenterOfMass(dataStyle)
    const stgPos = stg.getCenterOfMass(dataStyle)
    const lgPos = lg.getCenterOfMass(dataStyle)
    const bluePos = blueAir.getCenterOfMass(dataStyle)

    let offsetX = 0
    let dPt = new Point(stgPos.x, lgPos.y)
    let wPt = new Point(stgPos.x, ntgPos.y)
    if (isNS) {
      offsetX = -70
      dPt = new Point(lgPos.x, stgPos.y)
      wPt = new Point(ntgPos.x, stgPos.y)
    }

    const realDepth = dPt.getBR(lgPos).range
    const realWidth = wPt.getBR(stgPos).range
    this.deep = realDepth
    this.wide = realWidth
    drawMeasurement(this.ctx, lgPos, dPt, realDepth, showMeasurements)
    drawMeasurement(this.ctx, stgPos, wPt, realWidth, showMeasurements)

    drawAltitudes(this.ctx, lgPos, lg.getAltitudes())
    drawAltitudes(this.ctx, stgPos, stg.getAltitudes())
    drawAltitudes(this.ctx, ntgPos, ntg.getAltitudes(), offsetX)

    lg.setBraaseye(new Braaseye(lgPos, bluePos, bullseye))
    stg.setBraaseye(new Braaseye(stgPos, bluePos, bullseye))
    ntg.setBraaseye(new Braaseye(ntgPos, bluePos, bullseye))

    lg.getBraaseye().draw(this.ctx, showMeasurements, braaFirst)
    stg.getBraaseye().draw(this.ctx, showMeasurements, braaFirst)
    ntg.getBraaseye().draw(this.ctx, showMeasurements, braaFirst, offsetX)
  }

  getAnswer(): string {
    const isNS = FightAxis.isNS(this.props.orientation.orient)
    const { dataStyle, format } = this.props

    const lg = this.groups[0]
    const ntg = this.groups[1]
    const stg = this.groups[2]

    let nLbl = "NORTH"
    let sLbl = "SOUTH"
    if (isNS) {
      nLbl = "WEST"
      sLbl = "EAST"
    }
    lg.setLabel("LEAD GROUP")
    ntg.setLabel(nLbl + " TRAIL GROUP")
    stg.setLabel(sLbl + " TRAIL GROUP")

    const openClose = getOpenCloseAzimuth(ntg, stg)

    let answer =
      "THREE GROUP VIC " +
      this.deep +
      " DEEP, " +
      this.wide +
      " WIDE" +
      openClose +
      ", "

    const lgPos = lg.getCenterOfMass(dataStyle)
    const ntgPos = ntg.getCenterOfMass(dataStyle)
    const stgPos = stg.getCenterOfMass(dataStyle)

    if (new Point(lgPos.x, ntgPos.y).getBR(lgPos).range < this.wide / 3) {
      answer += " WEIGHTED " + nLbl + ", "
    } else if (
      new Point(lgPos.x, stgPos.y).getBR(lgPos).range <
      this.wide / 3
    ) {
      answer += " WEIGHTED " + sLbl + ", "
    }

    // TODO -- SPEED -- Opening/closing pic with range component

    answer += picTrackDir(format, [ntg, stg, lg])

    answer += formatGroup(format, lg, true) + " "

    const anchorN = isAnchorNorth(ntg, stg)

    if (anchorN) {
      answer += formatGroup(format, ntg, false) + " "
      answer += formatGroup(format, stg, false)
    } else {
      answer += formatGroup(format, stg, false) + " "
      answer += formatGroup(format, ntg, false)
    }

    return answer
  }
}
