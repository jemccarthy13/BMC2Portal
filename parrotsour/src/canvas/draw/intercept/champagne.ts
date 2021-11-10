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
import { getOpenCloseAzimuth } from "../formatutils"
import { PaintBrush } from "../paintbrush"
import { DrawPic } from "./drawpic"
import { getRestrictedStartPos, PictureInfo } from "./pictureclamp"

export default class DrawChampagne extends DrawPic {
  create(): DrawPic {
    return new DrawChampagne()
  }

  chooseNumGroups(): void {
    this.numGroups = 3
  }

  getPictureInfo(start?: Point): PictureInfo {
    const picture = {
      start,
      wide: randomNumber(7 * PIXELS_TO_NM, 30 * PIXELS_TO_NM),
      deep: randomNumber(7 * PIXELS_TO_NM, 30 * PIXELS_TO_NM),
    }

    const startPos = getRestrictedStartPos(
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

    let nlg: AircraftGroup
    if (isNS) {
      nlg = new AircraftGroup({
        sx: startPos.x - this.wide / 2,
        sy: startPos.y - this.deep,
        hdg: heading + randomNumber(-10, 10),
        nContacts: contactList[1],
      })
    } else {
      nlg = new AircraftGroup({
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
        sx: startPos.x + this.wide / 2,
        sy: startPos.y - this.deep,
        hdg: heading + randomNumber(-10, 10),
        nContacts: contactList[2],
      })
      nlg.setLabel("WEST LEAD GROUP")
      slg.setLabel("EAST LEAD GROUP")
    } else {
      slg = new AircraftGroup({
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
    PaintBrush.drawMeasurement(nlgPos, wPt, this.wide, showMeasurements)
    PaintBrush.drawMeasurement(tgPos, dPt, this.deep, showMeasurements)

    const offsetXTrail = !isNS ? -100 : 0
    const offsetXNL = isNS ? -100 : 0
    PaintBrush.drawAltitudes(tgPos, tg.getAltitudes(), offsetXTrail)
    PaintBrush.drawAltitudes(slgPos, slg.getAltitudes())
    PaintBrush.drawAltitudes(nlgPos, nlg.getAltitudes(), offsetXNL)

    const { blueAir, bullseye } = this.state
    const { dataStyle, braaFirst } = this.props
    const bluePos = blueAir.getCenterOfMass(dataStyle)

    tg.setBraaseye(new Braaseye(tgPos, bluePos, bullseye))
    nlg.setBraaseye(new Braaseye(nlgPos, bluePos, bullseye))
    slg.setBraaseye(new Braaseye(slgPos, bluePos, bullseye))

    tg.getBraaseye().draw(showMeasurements, braaFirst, offsetXTrail)
    nlg.getBraaseye().draw(showMeasurements, braaFirst, offsetXNL)
    slg.getBraaseye().draw(showMeasurements, braaFirst)
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

    nlg.draw(this.props.dataStyle)
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

    answer += this.picTrackDir()

    const anchorOutriggers = this.wide >= 10 && this.props.format !== FORMAT.IPE

    this.checkAnchor(nlg, slg)

    let group1 = nlg
    let group2 = slg

    if (nlg.isAnchor()) {
      slg.setUseBull(anchorOutriggers)
    } else {
      slg.setUseBull(true)
      nlg.setUseBull(anchorOutriggers)
      group1 = slg
      group2 = nlg
    }
    answer += group1.format(this.props.format)
    answer += group2.format(this.props.format)
    answer += tg.format(this.props.format)

    return answer.replace(/\s+/g, " ").trim()
  }
}
