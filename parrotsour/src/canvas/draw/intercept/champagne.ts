import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
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
    this.numGroupsToCreate = 3
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

  applyLabels(): void {
    const isNS = FightAxis.isNS(this.props.orientation.orient)
    const nLbl = isNS ? "WEST" : "NORTH"
    const sLbl = isNS ? "EAST" : "SOUTH"
    this.groups[1].setLabel(nLbl + " LEAD GROUP")
    this.groups[2].setLabel(sLbl + " LEAD GROUP")
    this.groups[0].setLabel("TRAIL GROUP")

    let group1 = this.groups[1]
    let group2 = this.groups[2]

    if (group1.isAnchor()) {
      group2.setUseBull(this.isAnchorOutriggers())
    } else {
      group1 = this.groups[2]
      group2 = this.groups[1]
      group1.setUseBull(true)
      group2.setUseBull(this.isAnchorOutriggers())
    }
    this.groups = [group1, group2, this.groups[0]]
  }

  formatWeighted(): string {
    const isNS = FightAxis.isNS(this.props.orientation.orient)
    const grp0Pos = this.groups[0].getCenterOfMass(this.props.dataStyle)
    const grp1Pos = this.groups[1].getCenterOfMass(this.props.dataStyle)
    const grp2Pos = this.groups[2].getCenterOfMass(this.props.dataStyle)
    // determine if weighted
    let frmNPt = new Point(grp0Pos.x, grp2Pos.y)
    let fromSPt = new Point(grp1Pos.x, grp2Pos.y)
    let weighted = ""
    if (isNS) {
      frmNPt = new Point(grp2Pos.x, grp0Pos.y)
      fromSPt = new Point(grp2Pos.x, grp1Pos.y)
    }
    if (frmNPt.getBR(grp0Pos).range < this.wide / 3) {
      weighted =
        " WEIGHTED " +
        this.groups[0].getLabel().replace(" LEAD GROUP", "") +
        ", "
    } else if (fromSPt.getBR(grp1Pos).range < this.wide / 3) {
      weighted =
        " WEIGHTED " +
        this.groups[1].getLabel().replace(" LEAD GROUP", "") +
        ", "
    }
    return weighted
  }

  formatPicTitle(): string {
    return "THREE GROUP CHAMPAGNE"
  }

  formatDimensions(): string {
    const openClose = getOpenCloseAzimuth(this.groups[1], this.groups[2])
    return this.wide + " WIDE" + openClose + " " + this.deep + " DEEP, "
  }

  getAnswer(): string {
    this.checkAnchor(this.groups[1], this.groups[2])
    this.applyLabels()

    let answer = this.formatPicTitle() + " "
    answer += this.formatDimensions() + " "
    answer += this.formatWeighted() + " "
    answer += this.picTrackDir() + " "

    for (let x = 0; x < this.groups.length; x++) {
      answer += this.groups[x].format(this.props.format) + " "
    }

    return answer.replace(/\s+/g, " ").trim()
  }
}
