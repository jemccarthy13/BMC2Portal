import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import RangeBack from "../../../classes/groups/rangeback"
import { Point } from "../../../classes/point"
import { FORMAT } from "../../../classes/supportedformats"
import {
  PIXELS_TO_NM,
  randomHeading,
  randomNumber,
} from "../../../utils/psmath"
import { FightAxis } from "../../canvastypes"
import { PaintBrush } from "../paintbrush"
import { DrawPic } from "./drawpic"
import { getRestrictedStartPos, PictureInfo } from "./pictureclamp"

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
    this.numGroupsToCreate = randomNumber(3, maxGrps)
  }

  seps: number[] = [0]

  getPictureInfo(start?: Point): PictureInfo {
    let depth = 0
    for (let x = 1; x < this.groups.length; x++) {
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
    for (let x = 0; x < this.numGroupsToCreate; x++) {
      const offsetHeading = randomNumber(-10, 10)
      totalArrowOffset += this.seps[x]

      if (this.props.isHardMode)
        heading = randomHeading(
          this.props.format,
          this.state.blueAir.getHeading()
        )

      const grp = new AircraftGroup({
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

    for (let x = 0; x < this.groups.length; x++) {
      let altOffsetX = 0
      let altOffsetY = 0

      if (!isNS) {
        altOffsetX = -40 + -5 * (this.groups.length - x)
        altOffsetY = -20 + -11 * (this.groups.length - x)
      }

      const grp = this.groups[x]
      const grpPos = grp.getCenterOfMass(this.props.dataStyle)

      PaintBrush.drawAltitudes(
        grpPos,
        this.groups[x].getAltitudes(),
        altOffsetX,
        altOffsetY
      )
      grp.setBraaseye(new Braaseye(grpPos, bluePos, bullseye))
      grp
        .getBraaseye()
        .draw(showMeasurements, braaFirst, altOffsetX, altOffsetY)
    }
    let actualDeep
    const prevGpPos =
      this.groups[this.groups.length - 1].getCenterOfMass(dataStyle)
    const gpPos = this.groups[0].getCenterOfMass(dataStyle)
    if (isNS) {
      actualDeep = Math.floor(Math.abs(gpPos.y - prevGpPos.y) / PIXELS_TO_NM)
      PaintBrush.drawMeasurement(
        new Point(gpPos.x - 30, gpPos.y),
        new Point(gpPos.x - 30, prevGpPos.y),
        actualDeep,
        showMeasurements
      )
    } else {
      actualDeep = Math.floor(Math.abs(gpPos.x - prevGpPos.x) / PIXELS_TO_NM)
      PaintBrush.drawMeasurement(
        new Point(gpPos.x, gpPos.y + 40),
        new Point(prevGpPos.x, gpPos.y + 40),
        actualDeep,
        showMeasurements
      )
    }
    this.deep = actualDeep
  }

  applyLabels(): void {
    switch (this.groups.length) {
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
    this.groups.reverse()
  }

  formatPicTitle(): string {
    return this.groups.length + " GROUP LADDER "
  }

  formatDimensions(): string {
    return this.deep + " DEEP, "
  }

  formatWeighted(): string {
    return ""
  }

  getAnswer(): string {
    this.applyLabels()

    let answer = this.formatPicTitle() + " "
    answer += this.formatDimensions() + " "
    answer += this.picTrackDir() + " "

    const rangeBack: RangeBack = new RangeBack(
      this.props.format === FORMAT.ALSA ? "SEPARATION" : "RANGE",
      this.groups[this.groups.length - 2]
        .getCenterOfMass(this.props.dataStyle)
        .getBR(
          this.groups[this.groups.length - 1].getCenterOfMass(
            this.props.dataStyle
          )
        ).range
    )

    this.groups[0].setUseBull(true)
    for (let g = 0; g < this.groups.length; g++) {
      if (g !== 0) {
        // TODO - check echelon from prev group to cur group
      }
      const rngBackToUse = g === 1 ? rangeBack : undefined
      answer += this.groups[g].format(this.props.format, rngBackToUse) + " "
    }

    return answer.replace(/\s+/g, " ").trim()
  }
}
