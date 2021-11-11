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

export default class DrawWall extends DrawPic {
  create(): DrawPic {
    return new DrawWall()
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
    let width = 0
    for (let x = 1; x < this.numGroupsToCreate; x++) {
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
    for (let x = 0; x < this.numGroupsToCreate; x++) {
      const offsetHeading = randomNumber(-10, 10)
      totalArrowOffset += this.seps[x]

      if (this.props.isHardMode)
        heading = randomHeading(
          this.props.format,
          this.state.blueAir.getHeading()
        )

      const grp = new AircraftGroup({
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

    for (let x = 0; x < this.groups.length; x++) {
      let altOffsetX = 30
      let altOffsetY = 0

      if (isNS) {
        altOffsetX = -15 * (this.groups.length - x)
        altOffsetY = 40 + 11 * (this.groups.length - (this.groups.length - x))
      }
      const grp = this.groups[x]
      const grpPos = grp.getCenterOfMass(dataStyle)
      PaintBrush.drawAltitudes(
        grpPos,
        grp.getAltitudes(),
        altOffsetX,
        altOffsetY
      )
      grp.setBraaseye(new Braaseye(grpPos, bluePos, this.state.bullseye))
      grp
        .getBraaseye()
        .draw(showMeasurements, braaFirst, altOffsetX, altOffsetY)
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
    PaintBrush.drawMeasurement(fromPt, toPt, widthNM, showMeasurements)
    this.wide = widthNM
  }

  applyLabels(): void {
    const isNS = FightAxis.isNS(this.props.orientation.orient)
    const nLbl = isNS ? "WEST" : "NORTH"
    const sLbl = isNS ? "EAST" : "SOUTH"
    switch (this.groups.length) {
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
    this.groups[0].setUseBull(true)
    this.groups[this.groups.length - 1].setUseBull(this.isAnchorOutriggers())

    if (!this.groups[0].isAnchor()) {
      this.groups.reverse()
    }
  }

  formatPicTitle(): string {
    return this.groups.length + " GROUP WALL"
  }

  formatDimensions(): string {
    return this.wide + " WIDE"
  }

  formatWeighted(): string {
    console.warn("Check weighted for wall")
    const split = this.wide / this.groups.length
    this.seps.forEach((sep) => {
      if (sep > split) {
        console.log("weighted")
      }
    })
    return ""
  }

  getAnswer(): string {
    this.checkAnchor(this.groups[0], this.groups[this.groups.length - 1])
    this.applyLabels()

    let answer = this.formatPicTitle() + " "
    answer += this.formatDimensions() + " "
    answer += this.formatWeighted() + " "

    answer +=
      getOpenCloseAzimuth(this.groups[0], this.groups[this.groups.length - 1]) +
      ", "

    answer += this.picTrackDir() + " "

    for (let idx = 0; idx < this.groups.length; idx++) {
      const group = this.groups[idx]
      answer += group.format(this.props.format) + " "
    }

    return answer.replace(/\s+/g, " ").trim()
  }
}
