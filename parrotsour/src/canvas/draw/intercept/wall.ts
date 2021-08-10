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

export default class DrawWall extends DrawPic {
  chooseNumGroups(nCts: number): number {
    let maxGrps = 5
    if (nCts < 3) {
      maxGrps = 3
    } else if (nCts < 5) {
      maxGrps = nCts
    }
    if (nCts === 0) maxGrps = 5
    return randomNumber(3, maxGrps)
  }

  seps: number[] = [0]

  getPictureInfo(start?: Point): PictureInfo {
    let width = 0
    for (let x = 1; x < this.numGroups; x++) {
      const nextSep = randomNumber(7 * PIXELS_TO_NM, 15 * PIXELS_TO_NM)
      this.seps.push(nextSep)
      width += nextSep
    }
    this.wide = width
    const deep = 20 * PIXELS_TO_NM // to ensure measurements can be drawn behind wall

    const pInfo = {
      start,
      wide: this.wide,
      deep,
    }
    const startPos = getRestrictedStartPos(
      this.ctx,
      this.state.blueAir,
      this.props.orientation.orient,
      this.props.dataStyle,
      45,
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
        sx: isNS ? startPos.x + totalArrowOffset : startPos.x,
        sy: isNS ? startPos.y : startPos.y + totalArrowOffset,
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

    const bluePos = this.state.blueAir.getCenterOfMass(dataStyle)

    for (let x = 0; x < this.numGroups; x++) {
      let altOffsetX = 30
      let altOffsetY = 0

      if (isNS) {
        altOffsetX = -15 * (this.numGroups - x)
        altOffsetY = 40 + 11 * (this.numGroups - (this.numGroups - x))
      }
      const grp = this.groups[x]
      const grpPos = grp.getCenterOfMass(dataStyle)
      drawAltitudes(
        this.ctx,
        grpPos,
        grp.getAltitudes(),
        altOffsetX,
        altOffsetY
      )
      grp.setBraaseye(new Braaseye(grpPos, bluePos, this.state.bullseye))
      grp
        .getBraaseye()
        .draw(this.ctx, showMeasurements, braaFirst, altOffsetX, altOffsetY)
    }

    const prevGpPos =
      this.groups[this.groups.length - 1].getCenterOfMass(dataStyle)

    const gpPos = this.groups[0].getCenterOfMass(dataStyle)
    let widthNM = Math.floor((prevGpPos.y - gpPos.y) / PIXELS_TO_NM)
    let fromPt = new Point(gpPos.x + 25, gpPos.y)
    let toPt = new Point(gpPos.x + 25, prevGpPos.y)
    if (isNS) {
      widthNM = Math.floor((prevGpPos.x - gpPos.x) / PIXELS_TO_NM)
      fromPt = new Point(gpPos.x, gpPos.y - 25)
      toPt = new Point(prevGpPos.x, gpPos.y - 25)
    }
    drawMeasurement(this.ctx, fromPt, toPt, widthNM, showMeasurements)
    this.wide = widthNM
  }

  getAnswer(): string {
    const isNS = FightAxis.isNS(this.props.orientation.orient)
    const nLbl = isNS ? "WEST" : "NORTH"
    const sLbl = isNS ? "EAST" : "SOUTH"
    switch (this.numGroups) {
      case 3:
        this.groups[0].setLabel(nLbl + " GROUP")
        this.groups[1].setLabel("MIDDLE GROUP")
        this.groups[2].setLabel(sLbl + " GROUP")
        break
      case 4:
        this.groups[0].setLabel(nLbl + " GROUP")
        this.groups[1].setLabel(nLbl + " MIDDLE GROUP")
        this.groups[2].setLabel(sLbl + " MIDDLE GROUP")
        this.groups[3].setLabel(sLbl + " GROUP")
        break
      case 5:
        this.groups[0].setLabel(nLbl + " GROUP")
        this.groups[1].setLabel(nLbl + " MIDDLE GROUP")
        this.groups[2].setLabel("MIDDLE GROUP")
        this.groups[3].setLabel(sLbl + " MIDDLE GROUP")
        this.groups[4].setLabel(sLbl + " GROUP")
        break
    }

    const openClose = getOpenCloseAzimuth(
      this.groups[0],
      this.groups[this.groups.length - 1]
    )
    let answer =
      this.numGroups + " GROUP WALL " + this.wide + " WIDE " + openClose + ", "

    answer += picTrackDir(this.props.format, this.groups)

    const anchorNorth = isAnchorNorth(
      this.groups[0],
      this.groups[this.groups.length - 1]
    )

    // TODO -- WEIGHTED WALL
    // since we have all the seps[], we could check if any are within weighted criteria

    const includeBull = this.wide > 10 && this.props.format !== FORMAT.IPE

    for (let g = 0; g < this.numGroups; g++) {
      const idx: number = anchorNorth ? g : this.numGroups - 1 - g
      const group = this.groups[idx]
      answer +=
        formatGroup(
          this.props.format,
          group,
          g === 0 || (g === this.numGroups - 1 && includeBull) || false
        ) + " "
    }

    return answer
  }
}
