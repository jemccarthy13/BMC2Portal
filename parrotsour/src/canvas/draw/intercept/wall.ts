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
import { getStartPos, PictureInfo } from "./pictureclamp"
import { isAnchorNorth, picTrackDir } from "./picturehelpers"

export default class DrawWall extends DrawPic {
  getNumGroups(nCts: number): number {
    let maxGrps = 5
    if (nCts < 3) {
      maxGrps = 3
    } else if (nCts < 5) {
      maxGrps = nCts
    }
    if (nCts === 0) maxGrps = 5
    return randomNumber(3, maxGrps)
  }

  /**
   * Get the separation and total width of the wall
   * @param nGroups number of groups in the wall
   * @returns {width: total width, seps: array of separations between grps}
   */
  getSeparations(nGroups: number): number[] {
    const seps = [0]
    let width = 0
    for (let x = 1; x < nGroups; x++) {
      const nextSep = randomNumber(7 * PIXELS_TO_NM, 15 * PIXELS_TO_NM)
      seps.push(nextSep)
      width += nextSep
    }
    this.wide = width
    return seps
  }

  createGroups = (startPos: Point, contactList: number[]): AircraftGroup[] => {
    const isNS = FightAxis.isNS(this.props.orientation.orient)

    // calculate group separations ahead of time for clamping
    const seps = this.getSeparations(this.numGroups)

    let heading = randomHeading(
      this.props.format,
      this.state.blueAir.getHeading()
    )

    let totalArrowOffset = 0

    const groups: AircraftGroup[] = []
    for (let x = 0; x < this.numGroups; x++) {
      const offsetHeading = randomNumber(-10, 10)
      totalArrowOffset += seps[x]

      if (this.props.isHardMode)
        heading = randomHeading(
          this.props.format,
          this.state.blueAir.getHeading()
        )

      const grp = new AircraftGroup({
        ctx: this.ctx,
        sx: isNS ? startPos.x + totalArrowOffset : startPos.x,
        sy: isNS ? startPos.y : totalArrowOffset + startPos.y,
        hdg: heading + offsetHeading,
        nContacts: contactList[x],
      })
      groups.push(grp)
    }

    return groups
  }

  getPictureInfo(start?: Point): PictureInfo {
    const wide = this.wide + 5 * PIXELS_TO_NM
    const deep = 20 * PIXELS_TO_NM // to ensure measurements can be drawn behind wall
    const startPos = getStartPos(
      this.ctx,
      this.state.blueAir,
      this.props.orientation.orient,
      this.props.dataStyle,
      {
        start,
        wide,
        deep,
      }
    )
    return {
      start: startPos,
      wide,
      deep,
    }
  }

  drawInfo(): void {
    const isNS = FightAxis.isNS(this.props.orientation.orient)
    for (let x = 0; x < this.numGroups; x++) {
      let altOffsetX = 30
      let altOffsetY = 0

      if (isNS) {
        altOffsetX = -15 * (this.numGroups - x)
        altOffsetY = 40 + 11 * (this.numGroups - (this.numGroups - x))
      }
      const grp = this.groups[x]
      const grpPos = grp.getCenterOfMass(this.props.dataStyle)
      drawAltitudes(
        this.ctx,
        grpPos,
        grp.getAltitudes(),
        altOffsetX,
        altOffsetY
      )
      const grpBraaseye = new Braaseye(
        grpPos,
        this.state.blueAir.getCenterOfMass(this.props.dataStyle),
        this.state.bullseye
      )
      grpBraaseye.draw(
        this.ctx,
        this.props.showMeasurements,
        this.props.braaFirst,
        altOffsetX,
        altOffsetY
      )
      grp.setBraaseye(grpBraaseye)
    }

    const prevGpPos = this.groups[this.groups.length - 1].getCenterOfMass(
      this.props.dataStyle
    )
    const gpPos = this.groups[0].getCenterOfMass(this.props.dataStyle)
    let widthNM = 0
    if (isNS) {
      widthNM = Math.floor((prevGpPos.x - gpPos.x) / PIXELS_TO_NM)
      drawMeasurement(
        this.ctx,
        gpPos.x,
        gpPos.y - 25,
        prevGpPos.x,
        gpPos.y - 25,
        widthNM,
        this.props.showMeasurements
      )
    } else {
      widthNM = Math.floor((prevGpPos.y - gpPos.y) / PIXELS_TO_NM)
      drawMeasurement(
        this.ctx,
        gpPos.x + 25,
        gpPos.y,
        gpPos.x + 25,
        prevGpPos.y,
        widthNM,
        this.props.showMeasurements
      )
    }
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
      this.groups[0].getBraaseye(),
      this.groups[this.groups.length - 1].getBraaseye(),
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
