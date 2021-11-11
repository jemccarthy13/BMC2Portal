import { BRAA } from "../../../classes/braa"
import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { randomNumber } from "../../../utils/psmath"
import { FightAxis, PictureAnswer } from "../../canvastypes"
import { PaintBrush } from "../paintbrush"
import { DrawPic } from "./drawpic"
import { Package } from "./package"
import { PictureInfo } from "./pictureclamp"
import { PictureFactory } from "./picturefactory"

export default class DrawPackage extends DrawPic {
  private packages!: Package[]

  private nPkgBe: BRAA = new BRAA(-1, -1)
  private sPkgBe: BRAA = new BRAA(-1, -1)
  private rngBack: BRAA = new BRAA(-1, -1)
  private bullPt1 = new Point(-1, -1)
  private bullPt2 = new Point(-1, -1)

  create(): DrawPic {
    return new DrawPackage()
  }

  chooseNumGroups(nCts: number): void {
    const nCt = Math.floor(nCts / 2)
    const sCt = nCts - nCt

    this.packages.push(
      PictureFactory.getPictureDraw("random", nCt, true) as Package
    )
    this.packages.push(
      PictureFactory.getPictureDraw("random", sCt, true) as Package
    )

    this.packages[0].initialize(this.props, this.state)
    this.packages[1].initialize(this.props, this.state)

    this.packages[0].chooseNumGroups(nCt)
    this.packages[1].chooseNumGroups(sCt)
  }

  private start2: Point = Point.DEFAULT
  private isRange = false

  getPictureInfo(): PictureInfo {
    this.isRange = randomNumber(0, 100) < 50

    const isNS = FightAxis.isNS(this.props.orientation.orient)

    let s1x = 0
    let s1y = 0
    let s2x = 0
    let s2y = 0

    const ctx = PaintBrush.getContext()

    if (isNS) {
      if (this.isRange) {
        // lLbl = "NORTH"
        // tLbl = "SOUTH"
        s1x = randomNumber(ctx.canvas.width * 0.2, ctx.canvas.width * 0.8)
        s1y = randomNumber(ctx.canvas.height * 0.5, ctx.canvas.height * 0.59)

        s2x = s1x
        s2y = randomNumber(ctx.canvas.height * 0.7, ctx.canvas.height * 0.8)
      } else {
        s1x = randomNumber(ctx.canvas.width * 0.2, ctx.canvas.width * 0.3)
        s1y = randomNumber(ctx.canvas.height * 0.5, ctx.canvas.height * 0.8)

        s2y = s1y
        s2x = randomNumber(ctx.canvas.width * 0.7, ctx.canvas.width * 0.8)
      }
    } else {
      if (this.isRange) {
        s1x = randomNumber(ctx.canvas.width * 0.5, ctx.canvas.width * 0.59)
        s1y = randomNumber(ctx.canvas.height * 0.2, ctx.canvas.width * 0.4)

        s2x = randomNumber(ctx.canvas.width * 0.2, ctx.canvas.width * 0.35)
        s2y = s1y
      } else {
        //     tLbl = "NORTH"
        //     lLbl = "SOUTH"
        s1x = randomNumber(ctx.canvas.width * 0.25, ctx.canvas.width * 0.5)
        s1y = randomNumber(ctx.canvas.height * 0.6, ctx.canvas.height * 0.7)
        s2x = s1x
        s2y = randomNumber(ctx.canvas.height * 0.25, ctx.canvas.height * 0.4)
      }
    }

    const start1 = new Point(s1x, s1y)
    const start2 = new Point(s2x, s2y)

    const nPkgInfo = this.packages[0].getPictureInfo(start1)
    this.packages[0].pInfo = nPkgInfo
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.packages[0].deep = nPkgInfo.deep!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.packages[0].wide = nPkgInfo.wide!

    const sPkgInfo = this.packages[1].getPictureInfo(start2)
    this.packages[1].pInfo = sPkgInfo
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.packages[1].deep = sPkgInfo.deep!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.packages[1].wide = sPkgInfo.wide!

    this.start2 = start2

    return {
      start: start1,
    }
  }

  createGroups = (startPos: Point, contactList: number[]): AircraftGroup[] => {
    const nGrps = this.packages[0].createGroups(
      startPos,
      contactList.slice(0, this.packages[0].getNumGroups())
    )
    const sGrps = this.packages[1].createGroups(
      this.start2,
      contactList.slice(this.packages[1].getNumGroups())
    )

    this.packages[0].groups = nGrps
    this.packages[1].groups = sGrps

    return nGrps.concat(sGrps)
  }

  drawInfo(): void {
    this.packages[0].drawInfo()
    this.packages[1].drawInfo()
  }

  _getPicBull = (groups: AircraftGroup[]): Point => {
    const { blueAir } = this.state
    const { dataStyle, orientation } = this.props
    let closestGroup = groups[0]

    let closestRng = 9999
    let sum = 0
    const bPos = blueAir.getCenterOfMass(dataStyle)

    const isNS = FightAxis.isNS(orientation.orient)
    for (let x = 0; x < groups.length; x++) {
      const gPos = groups[x].getCenterOfMass(dataStyle)

      const BRAA = bPos.getBR(gPos)
      if (BRAA.range < closestRng) {
        closestGroup = groups[x]
        closestRng = BRAA.range
      }

      if (isNS) {
        sum += gPos.x
      } else {
        sum += gPos.y
      }
    }

    // if it's wide (az) get center of mass
    // it it's deep (rng) get lead pos (depends on orientation)
    const cPos = closestGroup.getCenterOfMass(dataStyle)
    let retVal = new Point(sum / groups.length, cPos.y)
    if (!isNS) {
      retVal = new Point(cPos.x, sum / groups.length)
    }
    return retVal
  }

  tryAgain(): PictureAnswer {
    console.log("need to redraw pkgs")
    const nPkgContacts = this.packages[0].groups
      .map((grp) => grp.getStrength())
      .reduce((a, b) => a + b)
    const sPkgContacts = this.packages[1].groups
      .map((grp) => grp.getStrength())
      .reduce((a, b) => a + b)
    const nCts = nPkgContacts + sPkgContacts
    PaintBrush.clearCanvas()
    PaintBrush.drawBullseye(this.state.bullseye)
    this.state.blueAir.draw(this.props.dataStyle)
    return this.draw(false, nCts)
  }

  _isAnchorNPkg = (nBR: number, sBR: number): boolean => {
    let anchorNorth = true
    if (sBR < nBR) {
      anchorNorth = false
    } else if (sBR === nBR) {
      const maxAlt1 = Math.max(
        ...this.packages[0].groups.map((grp) => {
          return Math.max(...grp.getAltitudes())
        })
      )
      const maxAlt2 = Math.max(
        ...this.packages[1].groups.map((grp) => {
          return Math.max(...grp.getAltitudes())
        })
      )
      if (maxAlt2 > maxAlt1) {
        anchorNorth = false
      } else if (maxAlt2 === maxAlt1) {
        if (this.packages[1].groups.length > this.packages[0].groups.length) {
          anchorNorth = false
        }
      }
    }
    return anchorNorth
  }

  formatPicTitle(): string {
    return "2 PACKAGES "
  }

  formatDimensions(): string {
    const isNS = FightAxis.isNS(this.props.orientation.orient)

    this.packages[0].setBullseye(this.state.bullseye.getBR(this.bullPt1))
    this.packages[1].setBullseye(this.state.bullseye.getBR(this.bullPt2))

    // default deep
    this.rngBack = isNS
      ? new Point(this.bullPt1.x, this.bullPt2.y).getBR(this.bullPt1)
      : new Point(this.bullPt2.x, this.bullPt1.y).getBR(this.bullPt1)
    // measure wide if az
    if (!this.isRange) {
      this.rngBack = isNS
        ? new Point(this.bullPt2.x, this.bullPt1.y).getBR(this.bullPt1)
        : new Point(this.bullPt1.x, this.bullPt2.y).getBR(this.bullPt1)
    }
    return (this.isRange ? " RANGE " : " AZIMUTH ") + this.rngBack.range + " "
  }

  formatWeighted(): string {
    return ""
  }

  applyLabels(): void {
    const isNS = FightAxis.isNS(this.props.orientation.orient)

    let nLbl = isNS ? "WEST" : "SOUTH"
    let sLbl = isNS ? "EAST" : "NORTH"
    if (this.isRange) {
      nLbl = "LEAD"
      sLbl = "TRAIL"
    }

    this.packages[0].setLabel(nLbl)
    this.packages[1].setLabel(sLbl)

    if (!this.packages[0].isAnchor()) {
      this.packages[0].setLabel(sLbl)
      this.packages[1].setLabel(nLbl)
      this.packages.reverse()
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkAnchor = (grp1: AircraftGroup, grp2: AircraftGroup): void => {
    // TODO -- anchoring P's for closer package && comment
    const bPos = this.state.blueAir.getCenterOfMass(this.props.dataStyle)

    const isAnchNorth = this._isAnchorNPkg(
      bPos.getBR(this.bullPt1).range,
      bPos.getBR(this.bullPt2).range
    )
    this.packages[0].setAnchor(isAnchNorth)
    this.packages[1].setAnchor(!isAnchNorth)
  }

  getAnswer(): string {
    this.packages[0].setBullseyePt(this._getPicBull(this.packages[0].groups))
    this.packages[1].setBullseyePt(this._getPicBull(this.packages[1].groups))

    this.checkAnchor(this.packages[0].groups[0], this.packages[1].groups[0])
    this.applyLabels()
    let answer = ""

    answer = this.formatPicTitle()
    answer += this.formatDimensions()
    answer += this.packages[0].format()
    answer += " "
    answer += this.packages[1].format()

    if (this.rngBack.range < 40) {
      answer = this.tryAgain().pic
    }

    return answer.replace(/\s+/g, " ").trim()
  }
}
