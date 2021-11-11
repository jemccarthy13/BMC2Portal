import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { GroupFactory } from "../../../classes/groups/groupfactory"
import { Point } from "../../../classes/point"
import { toCardinal } from "../../../utils/aspect"
import {
  PIXELS_TO_NM,
  randomHeading,
  randomNumber,
} from "../../../utils/psmath"
import { FightAxis } from "../../canvastypes"
import { PaintBrush } from "../paintbrush"
import { DrawPic } from "./drawpic"
import { getRestrictedStartPos, PictureInfo } from "./pictureclamp"

export default class DrawRange extends DrawPic {
  create(): DrawPic {
    return new DrawRange()
  }

  chooseNumGroups(): void {
    this.numGroupsToCreate = 2
  }

  getPictureInfo(start?: Point): PictureInfo {
    const drawDistance = randomNumber(5 * PIXELS_TO_NM, 40 * PIXELS_TO_NM)

    return {
      deep: drawDistance,
      wide: -1,
      start: getRestrictedStartPos(
        this.state.blueAir,
        this.props.orientation.orient,
        this.props.dataStyle,
        45 + drawDistance / PIXELS_TO_NM,
        100,
        {
          start,
          deep: drawDistance,
        }
      ),
    }
  }

  createGroups = (startPos: Point, contactList: number[]): AircraftGroup[] => {
    const isNS = FightAxis.isNS(this.props.orientation.orient)
    const tg = GroupFactory.randomGroupAtLoc(
      this.props,
      this.state,
      startPos,
      undefined,
      contactList[0]
    )

    // if hard mode and ALSA, we randomize the 2nd groups heading
    // otherwise, pair to first group +/- 10 degrees
    const heading = this.props.isHardMode
      ? randomHeading(this.props.format, this.state.blueAir.getHeading())
      : tg.getHeading() + randomNumber(-10, 10)

    //const tgPos = tg.getCenterOfMass(this.props.dataStyle)
    const lg = new AircraftGroup({
      sx: isNS ? startPos.x : startPos.x + this.deep,
      sy: isNS ? startPos.y + this.deep : startPos.y,
      hdg: heading,
      dataTrailType: this.props.dataStyle,
      nContacts: contactList[1],
    })
    return [tg, lg]
  }

  drawInfo(): void {
    const tg = this.groups[0]
    const lg = this.groups[1]

    const { dataStyle, orientation, showMeasurements, braaFirst } = this.props
    const { blueAir, bullseye } = this.state

    const lPos = lg.getCenterOfMass(dataStyle)
    const tPos = tg.getCenterOfMass(dataStyle)
    let m2: Point
    let offsetX = 0
    let offsetY = 0
    let offsetX2 = 0
    let offsetY2 = 0
    const isNS = FightAxis.isNS(orientation.orient)
    if (isNS) {
      m2 = new Point(tPos.x, lg.getCenterOfMass(dataStyle).y)
    } else {
      m2 = new Point(lg.getCenterOfMass(dataStyle).x, tPos.y)
      offsetX = -10
      offsetY = 40
      offsetX2 = -60
      offsetY2 = 40
    }
    this.deep = m2.getBR(tPos).range

    PaintBrush.drawMeasurement(tPos, m2, this.deep, showMeasurements)

    PaintBrush.drawAltitudes(lPos, lg.getAltitudes(), offsetX, offsetY)
    PaintBrush.drawAltitudes(tPos, tg.getAltitudes(), offsetX2, offsetY2)

    const bluePos = blueAir.getCenterOfMass(dataStyle)
    lg.setBraaseye(new Braaseye(lPos, bluePos, bullseye))
    tg.setBraaseye(new Braaseye(tPos, bluePos, bullseye))

    lg.getBraaseye().draw(showMeasurements, braaFirst, offsetX, offsetY)
    tg.getBraaseye().draw(showMeasurements, braaFirst, offsetX2, offsetY2)
  }

  formatPicTitle(): string {
    return "TWO GROUPS RANGE"
  }

  formatDimensions(): string {
    return this.deep.toString()
  }

  formatWeighted(): string {
    return ""
  }

  applyLabels(): void {
    const tg = this.groups[0]
    const lg = this.groups[1]

    tg.setLabel("TRAIL GROUP")
    lg.setLabel("LEAD GROUP")

    let firstGroup = lg
    let secondGroup = tg
    if (tg.getBraaseye().braa.range < lg.getBraaseye().braa.range) {
      firstGroup = tg
      firstGroup.setLabel("LEAD GROUP")
      secondGroup = lg
      secondGroup.setLabel("TRAIL GROUP")
    }

    firstGroup.setUseBull(true)
    secondGroup.setUseBull(false)

    this.groups = [firstGroup, secondGroup]
  }

  isEchelon = (grp1: AircraftGroup, grp2: AircraftGroup): string => {
    let answer = ""
    const isNS = FightAxis.isNS(this.props.orientation.orient)
    const tgPos = grp2.getCenterOfMass(this.props.dataStyle)
    const lgPos = grp1.getCenterOfMass(this.props.dataStyle)
    if (
      (!isNS && new Point(tgPos.x, lgPos.y).getBR(tgPos).range > 5) ||
      (isNS && tgPos.getBR(new Point(lgPos.x, tgPos.y)).range > 5)
    ) {
      if (!isNS) {
        answer += " ECHELON " + toCardinal(lgPos.getBR(tgPos).bearingNum) + ", "
      } else {
        answer += " ECHELON " + toCardinal(tgPos.getBR(lgPos).bearingNum) + ", "
      }
    }
    return answer
  }

  getAnswer(): string {
    this.applyLabels()

    let answer: string = this.formatPicTitle() + " "

    answer += this.formatDimensions() + ", "

    // TODO -- determine open/close
    answer += this.isEchelon(this.groups[0], this.groups[1]) + " "

    answer += this.picTrackDir() + " "

    this.groups.forEach((group) => {
      answer += group.format(this.props.format) + " "
    })

    return answer.replace(/\s+/g, " ").trim()
  }
}
