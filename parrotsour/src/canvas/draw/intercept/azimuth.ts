import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { GroupFactory } from "../../../classes/groups/groupfactory"
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
import { getStartPos, PictureInfo } from "./pictureclamp"
import { isAnchorNorth, isEchelon, picTrackDir } from "./picturehelpers"

export default class DrawAzimuth extends DrawPic {
  create(): DrawPic {
    return new DrawAzimuth()
  }

  chooseNumGroups(): number {
    this.numGroups = 2
    return 2
  }

  getPictureInfo(start?: Point): PictureInfo {
    // Min distance apart = 5 nm, max = 40
    const drawDistance = randomNumber(7, 40) * PIXELS_TO_NM

    return {
      deep: -1,
      wide: drawDistance,
      start: getStartPos(
        this.ctx,
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
      : ng.getHeading() + randomNumber(-10, 10)

    const ngStPos = ng.getStartPos()
    const sg = new AircraftGroup({
      ctx: this.ctx,
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
    drawMeasurement(this.ctx, nPos, m2, this.wide, showMeasurements)
    drawAltitudes(this.ctx, nPos, ng.getAltitudes(), offsetX, offsetY)
    drawAltitudes(this.ctx, sPos, sg.getAltitudes(), offsetX2, offsetY2)

    ng.setBraaseye(new Braaseye(nPos, bluePos, bullseye))
    sg.setBraaseye(new Braaseye(sPos, bluePos, bullseye))

    ng.getBraaseye().draw(
      this.ctx,
      showMeasurements,
      braaFirst,
      offsetX,
      offsetY
    )
    sg.getBraaseye().draw(
      this.ctx,
      showMeasurements,
      braaFirst,
      offsetX2,
      offsetY2
    )
  }

  getAnswer(): string {
    const ng = this.groups[0]
    const sg = this.groups[1]

    // anchor both outrigger with bullseye if >10 az and !ipe
    const includeBull = this.wide >= 10 && this.props.format !== FORMAT.IPE

    let answer = "TWO GROUPS AZIMUTH " + this.wide + " "

    answer += getOpenCloseAzimuth(ng, sg)

    answer += isEchelon(
      this.props.orientation.orient,
      this.props.dataStyle,
      ng.getBraaseye(),
      sg.getBraaseye(),
      ng,
      sg
    )

    answer += picTrackDir(this.props, [ng, sg], this.state.blueAir)

    const anchorN = isAnchorNorth(ng, sg)

    const isNS = FightAxis.isNS(this.props.orientation.orient)

    // if Anchor N and NS, SG = "EAST", NG = "WEST"
    let firstGroup = sg
    let secondGroup = ng
    firstGroup.setLabel("EAST GROUP")
    secondGroup.setLabel("WEST GROUP")
    if (!anchorN) {
      if (!isNS) {
        firstGroup.setLabel("SOUTH GROUP")
        secondGroup.setLabel("NORTH GROUP")
      }
    } else {
      firstGroup = ng
      secondGroup = sg
      if (isNS) {
        firstGroup.setLabel("WEST GROUP")
        secondGroup.setLabel("EAST GROUP")
      } else {
        firstGroup.setLabel("NORTH GROUP")
        secondGroup.setLabel("SOUTH GROUP")
      }
    }
    answer += formatGroup(this.props.format, firstGroup, true)

    answer += " " + formatGroup(this.props.format, secondGroup, includeBull)

    return answer
  }
}
