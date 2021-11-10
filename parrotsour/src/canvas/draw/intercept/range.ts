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
import { drawAltitudes, drawMeasurement } from "../drawutils"
import { DrawPic } from "./drawpic"
import { getRestrictedStartPos, PictureInfo } from "./pictureclamp"

export default class DrawRange extends DrawPic {
  create(): DrawPic {
    return new DrawRange()
  }

  chooseNumGroups(): void {
    this.numGroups = 2
  }

  getPictureInfo(start?: Point): PictureInfo {
    const drawDistance = randomNumber(5 * PIXELS_TO_NM, 40 * PIXELS_TO_NM)

    return {
      deep: drawDistance,
      wide: -1,
      start: getRestrictedStartPos(
        this.ctx,
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
      this.ctx,
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
      ctx: this.ctx,
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

    drawMeasurement(this.ctx, tPos, m2, this.deep, showMeasurements)

    drawAltitudes(this.ctx, lPos, lg.getAltitudes(), offsetX, offsetY)
    drawAltitudes(this.ctx, tPos, tg.getAltitudes(), offsetX2, offsetY2)

    const bluePos = blueAir.getCenterOfMass(dataStyle)
    lg.setBraaseye(new Braaseye(lPos, bluePos, bullseye))
    tg.setBraaseye(new Braaseye(tPos, bluePos, bullseye))

    lg.getBraaseye().draw(
      this.ctx,
      showMeasurements,
      braaFirst,
      offsetX,
      offsetY
    )
    tg.getBraaseye().draw(
      this.ctx,
      showMeasurements,
      braaFirst,
      offsetX2,
      offsetY2
    )
  }

  getAnswer(): string {
    const isNS = FightAxis.isNS(this.props.orientation.orient)

    const tg = this.groups[0]
    const lg = this.groups[1]

    tg.setLabel("TRAIL GROUP")
    lg.setLabel("LEAD GROUP")

    const tgPos = tg.getCenterOfMass(this.props.dataStyle)
    const lgPos = lg.getCenterOfMass(this.props.dataStyle)

    let answer: string = "TWO GROUPS RANGE " + this.deep + ", "
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

    answer += this.picTrackDir()

    // TODO -- DETERMINE IF OPENING/CLOSING

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

    answer += firstGroup.format(this.props.format) + " "
    answer += secondGroup.format(this.props.format)

    return answer.replace(/\s+/g, " ").trim()
  }
}
