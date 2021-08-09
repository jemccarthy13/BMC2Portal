import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { FORMAT } from "../../../classes/supportedformats"
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

export default class DrawChampagne extends DrawPic {
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

    let heading: number = randomHeading(
      this.props.format,
      this.state.blueAir.getHeading()
    )
    const tg = new AircraftGroup({
      ctx: this.ctx,
      sx: startPos.x,
      sy: startPos.y,
      hdg: heading + randomNumber(-10, 10),
      nContacts: contactList[0],
    })
    tg.setLabel("TRAIL GROUP")

    if (this.props.isHardMode)
      heading = randomHeading(
        this.props.format,
        this.state.blueAir.getHeading()
      )

    console.log(this.wide, this.deep)

    let nlg: AircraftGroup
    if (isNS) {
      nlg = new AircraftGroup({
        ctx: this.ctx,
        sx: startPos.x - this.wide / 2,
        sy: startPos.y - this.deep,
        hdg: heading + randomNumber(-10, 10),
        nContacts: contactList[1],
      })
    } else {
      nlg = new AircraftGroup({
        ctx: this.ctx,
        sx: startPos.x + this.deep,
        sy: startPos.y - this.wide / 2,
        hdg: heading + randomNumber(-10, 10),
        nContacts: contactList[1],
      })
    }

    if (this.props.isHardMode)
      heading = randomHeading(
        this.props.format,
        this.state.blueAir.getHeading()
      )

    let slg
    if (isNS) {
      slg = new AircraftGroup({
        ctx: this.ctx,
        sx: startPos.x + this.wide / 2,
        sy: startPos.y - this.deep,
        hdg: heading + randomNumber(-10, 10),
        nContacts: contactList[2],
      })
      nlg.setLabel("WEST LEAD GROUP")
      slg.setLabel("EAST LEAD GROUP")
    } else {
      slg = new AircraftGroup({
        ctx: this.ctx,
        sx: startPos.x + this.deep,
        sy: startPos.y + this.wide / 2,
        hdg: heading + randomNumber(-10, 10),
        nContacts: contactList[2],
      })

      nlg.setLabel("NORTH LEAD GROUP")
      slg.setLabel("SOUTH LEAD GROUP")
    }

    return [tg, nlg, slg]
  }

  drawInfo(): void {
    const isNS = FightAxis.isNS(this.props.orientation.orient)

    const { showMeasurements } = this.props

    const tg = this.groups[0]
    const nlg = this.groups[1]
    const slg = this.groups[2]

    const nlgPos = nlg.getCenterOfMass(this.props.dataStyle)
    const slgPos = slg.getCenterOfMass(this.props.dataStyle)
    const tgPos = tg.getCenterOfMass(this.props.dataStyle)

    let wPt = new Point(nlgPos.x, slgPos.y)
    let dPt = new Point(nlgPos.x, tgPos.y)
    if (isNS) {
      wPt = new Point(slgPos.x, nlgPos.y)
      dPt = new Point(tgPos.x, nlgPos.y)
    }
    this.wide = wPt.getBR(nlgPos).range
    this.deep = dPt.getBR(tgPos).range
    drawMeasurement(this.ctx, nlgPos, wPt, this.wide, showMeasurements)
    drawMeasurement(this.ctx, tgPos, dPt, this.deep, showMeasurements)

    const offsetXTrail = !isNS ? -100 : 0
    const offsetXNL = isNS ? -100 : 0
    drawAltitudes(this.ctx, tgPos, tg.getAltitudes(), offsetXTrail)
    drawAltitudes(this.ctx, slgPos, slg.getAltitudes())
    drawAltitudes(this.ctx, nlgPos, nlg.getAltitudes(), offsetXNL)

    const { blueAir, bullseye } = this.state
    const { dataStyle, braaFirst } = this.props

    const tgBraaseye = new Braaseye(
      tgPos,
      blueAir.getCenterOfMass(dataStyle),
      bullseye
    )
    const nlgBraaseye = new Braaseye(
      nlgPos,
      blueAir.getCenterOfMass(dataStyle),
      bullseye
    )
    const slgBraaseye = new Braaseye(
      slgPos,
      blueAir.getCenterOfMass(dataStyle),
      bullseye
    )

    tgBraaseye.draw(this.ctx, showMeasurements, braaFirst, offsetXTrail)
    nlgBraaseye.draw(this.ctx, showMeasurements, braaFirst, offsetXNL)
    slgBraaseye.draw(this.ctx, showMeasurements, braaFirst)

    tg.setBraaseye(tgBraaseye)
    nlg.setBraaseye(nlgBraaseye)
    slg.setBraaseye(slgBraaseye)
  }

  getAnswer(): string {
    const tg = this.groups[0]
    const nlg = this.groups[1]
    const slg = this.groups[2]

    // TODO -- CHAMP ANSWER -- cleanup
    const openClose = getOpenCloseAzimuth(nlg, slg)

    let answer =
      "THREE GROUP CHAMPAGNE " +
      this.wide +
      " WIDE" +
      openClose +
      " " +
      this.deep +
      " DEEP, "

    const isNS = FightAxis.isNS(this.props.orientation.orient)
    const nLbl = isNS ? "WEST" : "NORTH"
    const sLbl = isNS ? "EAST" : "SOUTH"

    nlg.draw(this.ctx, this.props.dataStyle)
    const nlgPos = nlg.getCenterOfMass(this.props.dataStyle)
    const slgPos = slg.getCenterOfMass(this.props.dataStyle)
    const tgPos = tg.getCenterOfMass(this.props.dataStyle)
    // determine if weighted
    let frmNPt = new Point(nlgPos.x, tgPos.y)
    let fromSPt = new Point(slgPos.x, tgPos.y)
    if (isNS) {
      frmNPt = new Point(tgPos.x, nlgPos.y)
      fromSPt = new Point(tgPos.x, slgPos.y)
    }
    if (frmNPt.getBR(nlgPos).range < this.wide / 3) {
      answer += " WEIGHTED " + nLbl + ", "
    } else if (fromSPt.getBR(slgPos).range < this.wide / 3) {
      answer += " WEIGHTED " + sLbl + ", "
    }

    answer += picTrackDir(this.props.format, [nlg, slg, tg])

    const includeBull = this.wide >= 10 && this.props.format !== FORMAT.IPE

    const anchorN = isAnchorNorth(nlg, slg)
    if (anchorN) {
      answer += formatGroup(this.props.format, nlg, true) + " "
      answer += formatGroup(this.props.format, slg, includeBull) + " "
    } else {
      answer += formatGroup(this.props.format, slg, true) + " "
      answer += formatGroup(this.props.format, nlg, includeBull) + " "
    }
    answer += formatGroup(this.props.format, tg, false)

    return answer
  }
}
