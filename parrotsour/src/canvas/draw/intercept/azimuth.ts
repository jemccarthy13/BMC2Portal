import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { GroupFactory } from "../../../classes/groups/groupfactory"
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
import { getStartPos, PictureInfo } from "./pictureclamp"

export default class DrawAzimuth extends DrawPic {
  create(): DrawPic {
    return new DrawAzimuth()
  }

  chooseNumGroups(): void {
    this.numGroupsToCreate = 2
  }

  getPictureInfo(start?: Point): PictureInfo {
    // Min distance apart = 5 nm, max = 40
    const drawDistance = randomNumber(7, 40) * PIXELS_TO_NM

    return {
      deep: -1,
      wide: drawDistance,
      start: getStartPos(
        this.state.blueAir,
        this.props.orientation.orient,
        this.props.dataStyle,
        {
          wide: drawDistance,
          start,
        }
      ),
    }
  }

  createGroups = (startPos: Point, contactList: number[]): AircraftGroup[] => {
    const isNS = FightAxis.isNS(this.props.orientation.orient)

    // Create the first group
    const ng = GroupFactory.randomGroupAtLoc(
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
      : ng.getHeading() + randomNumber(-10, 10)

    const ngStPos = ng.getStartPos()
    const sg = new AircraftGroup({
      sx: isNS ? ngStPos.x + this.wide : ngStPos.x,
      sy: isNS ? ngStPos.y : ngStPos.y + this.wide,
      hdg: heading,
      dataTrailType: this.props.dataStyle,
      nContacts: contactList[1],
    })

    return [ng, sg]
  }

  drawInfo(): void {
    const { dataStyle, showMeasurements, braaFirst } = this.props
    const { blueAir, bullseye } = this.state

    const ng = this.groups[0]
    const sg = this.groups[1]

    const nPos = ng.getCenterOfMass(dataStyle)
    const sPos = sg.getCenterOfMass(dataStyle)
    const bluePos = blueAir.getCenterOfMass(dataStyle)

    const isNS = FightAxis.isNS(this.props.orientation.orient)
    let offsetX = 0
    let offsetY = 0
    let offsetX2 = 0
    let offsetY2 = 0
    let m2: Point
    if (isNS) {
      m2 = new Point(sPos.x, nPos.y)
      offsetX = -60
      offsetY = 40
      offsetX2 = 10
      offsetY2 = 10
    } else {
      m2 = new Point(nPos.x, sPos.y)
    }

    this.wide = m2.getBR(nPos).range
    PaintBrush.drawMeasurement(nPos, m2, this.wide, showMeasurements)
    PaintBrush.drawAltitudes(nPos, ng.getAltitudes(), offsetX, offsetY)
    PaintBrush.drawAltitudes(sPos, sg.getAltitudes(), offsetX2, offsetY2)

    ng.setBraaseye(new Braaseye(nPos, bluePos, bullseye))
    sg.setBraaseye(new Braaseye(sPos, bluePos, bullseye))

    ng.getBraaseye().draw(showMeasurements, braaFirst, offsetX, offsetY)
    sg.getBraaseye().draw(showMeasurements, braaFirst, offsetX2, offsetY2)
  }

  applyLabels(): void {
    const isNS = FightAxis.isNS(this.props.orientation.orient)

    // if Anchor N and NS, SG = "EAST", NG = "WEST"
    let firstGroup = this.groups[1]
    let secondGroup = this.groups[0]
    firstGroup.setLabel("EAST GROUP")
    secondGroup.setLabel("WEST GROUP")
    if (!this.groups[0].isAnchor()) {
      if (!isNS) {
        firstGroup.setLabel("SOUTH GROUP")
        secondGroup.setLabel("NORTH GROUP")
      }
    } else {
      firstGroup = this.groups[0]
      secondGroup = this.groups[1]
      if (isNS) {
        firstGroup.setLabel("WEST GROUP")
        secondGroup.setLabel("EAST GROUP")
      } else {
        firstGroup.setLabel("NORTH GROUP")
        secondGroup.setLabel("SOUTH GROUP")
      }
    }
    this.groups = [firstGroup, secondGroup]
  }

  formatWeighted(): string {
    return ""
  }

  formatPicTitle(): string {
    return "TWO GROUPS AZIMUTH"
  }

  formatDimensions(): string {
    return this.wide.toString()
  }

  getAnswer(): string {
    this.checkAnchor(this.groups[0], this.groups[1])
    this.applyLabels()

    let answer = this.formatPicTitle() + " "
    answer += this.formatDimensions() + " "
    answer += getOpenCloseAzimuth(this.groups[0], this.groups[1]) + " "
    answer += this.isEchelon(this.groups[0], this.groups[1]) + " "
    answer += this.picTrackDir() + " "

    this.groups[1].setUseBull(this.isAnchorOutriggers())

    for (let x = 0; x < this.groups.length; x++) {
      answer += this.groups[x].format(this.props.format) + " "
    }
    return answer.replace(/\s+/g, " ").trim()
  }
}
