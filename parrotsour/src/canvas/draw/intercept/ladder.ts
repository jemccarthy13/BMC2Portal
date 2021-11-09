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
import { formatGroup } from "../formatutils"
import { DrawPic } from "./drawpic"
import { getRestrictedStartPos, PictureInfo } from "./pictureclamp"
import { picTrackDir } from "./picturehelpers"

export default class DrawLadder extends DrawPic {
  create(): DrawPic {
    return new DrawLadder()
  }

  chooseNumGroups(nCts: number): void {
    let maxGrps = 5
    if (nCts < 3) {
      maxGrps = 3
    } else if (nCts < 5) {
      maxGrps = nCts
    }
    if (nCts === 0) maxGrps = 5
    this.numGroups = randomNumber(3, maxGrps)
  }

  seps: number[] = [0]

  getPictureInfo(start?: Point): PictureInfo {
    let depth = 0
    for (let x = 1; x < this.numGroups; x++) {
      const nextSep = randomNumber(7 * PIXELS_TO_NM, 15 * PIXELS_TO_NM)
      this.seps.push(nextSep)
      depth += nextSep
    }
    this.deep = depth
    const wide = 5 * PIXELS_TO_NM // ensures group is clamped visible in canvas

    const pInfo = {
      start,
      deep: this.deep,
      wide,
    }
    const startPos = getRestrictedStartPos(
      this.ctx,
      this.state.blueAir,
      this.props.orientation.orient,
      this.props.dataStyle,
      45 + this.deep / PIXELS_TO_NM,
      200,
      pInfo
    )
    pInfo.start = startPos
    return pInfo
  }

  createGroups = (startPos: Point, contactList: number[]): AircraftGroup[] => {
    const isNS = FightAxis.isNS(this.props.orientation.orient)

    let heading = randomHeading(
      this.props.format,
      this.state.blueAir.getHeading()
    )

    let totalArrowOffset = 0

    const groups: AircraftGroup[] = []
    for (let x = 0; x < this.numGroups; x++) {
      const offsetHeading = randomNumber(-10, 10)
      totalArrowOffset += this.seps[x]

      if (this.props.isHardMode)
        heading = randomHeading(
          this.props.format,
          this.state.blueAir.getHeading()
        )

      const grp = new AircraftGroup({
        ctx: this.ctx,
        sx: isNS ? startPos.x : startPos.x + totalArrowOffset,
        sy: isNS ? startPos.y + totalArrowOffset : startPos.y,
        hdg: heading + offsetHeading,
        nContacts: contactList[x],
      })
      groups.push(grp)
    }
    return groups
  }

  drawInfo(): void {
    const isNS = FightAxis.isNS(this.props.orientation.orient)

    const { dataStyle, showMeasurements, braaFirst } = this.props
    const { blueAir, bullseye } = this.state
    const bluePos = blueAir.getCenterOfMass(dataStyle)

    for (let x = 0; x < this.numGroups; x++) {
      let altOffsetX = 0
      let altOffsetY = 0

      if (!isNS) {
        altOffsetX = -40 + -5 * (this.numGroups - x)
        altOffsetY = -20 + -11 * (this.numGroups - x)
      }

      const grp = this.groups[x]
      const grpPos = grp.getCenterOfMass(this.props.dataStyle)

      drawAltitudes(
        this.ctx,
        grpPos,
        this.groups[x].getAltitudes(),
        altOffsetX,
        altOffsetY
      )
      grp.setBraaseye(new Braaseye(grpPos, bluePos, bullseye))
      grp
        .getBraaseye()
        .draw(this.ctx, showMeasurements, braaFirst, altOffsetX, altOffsetY)
    }
    let actualDeep
    const prevGpPos =
      this.groups[this.groups.length - 1].getCenterOfMass(dataStyle)
    const gpPos = this.groups[0].getCenterOfMass(dataStyle)
    if (isNS) {
      actualDeep = Math.floor(Math.abs(gpPos.y - prevGpPos.y) / PIXELS_TO_NM)
      drawMeasurement(
        this.ctx,
        new Point(gpPos.x - 30, gpPos.y),
        new Point(gpPos.x - 30, prevGpPos.y),
        actualDeep,
        showMeasurements
      )
    } else {
      actualDeep = Math.floor(Math.abs(gpPos.x - prevGpPos.x) / PIXELS_TO_NM)
      drawMeasurement(
        this.ctx,
        new Point(gpPos.x, gpPos.y + 40),
        new Point(prevGpPos.x, gpPos.y + 40),
        actualDeep,
        showMeasurements
      )
    }
    this.deep = actualDeep
  }

  getAnswer(): string {
    switch (this.numGroups) {
      case 3:
        this.groups[0].setLabel("TRAIL GROUP")
        this.groups[1].setLabel("MIDDLE GROUP")
        this.groups[2].setLabel("LEAD GROUP")
        break
      case 4:
        this.groups[0].setLabel("TRAIL GROUP")
        this.groups[1].setLabel("3RD GROUP")
        this.groups[2].setLabel("2ND GROUP")
        this.groups[3].setLabel("LEAD GROUP")
        break
      case 5:
        this.groups[0].setLabel("TRAIL GROUP")
        this.groups[1].setLabel("4TH GROUP")
        this.groups[2].setLabel("3RD GROUP")
        this.groups[3].setLabel("2ND GROUP")
        this.groups[4].setLabel("LEAD GROUP")
        break
    }

    let answer = this.numGroups + " GROUP LADDER " + this.deep + " DEEP, "

    answer += picTrackDir(this.props, this.groups, this.state.blueAir)

    //console.log("CHECK FOR ECHELON LADDER?");

    const rangeBack = {
      label: this.props.format === FORMAT.ALSA ? "SEPARATION" : "RANGE",
      range: this.groups[this.groups.length - 2]
        .getCenterOfMass(this.props.dataStyle)
        .getBR(
          this.groups[this.groups.length - 1].getCenterOfMass(
            this.props.dataStyle
          )
        ).range,
    }

    for (let g = this.groups.length - 1; g >= 0; g--) {
      answer +=
        formatGroup(
          this.props.format,
          this.groups[g],
          g === this.groups.length - 1,
          g === this.groups.length - 2 ? rangeBack : undefined
        ) + " "
    }

    return answer.replace(/\s+/g, " ").trim()
  }
}
