import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { randomNumber } from "../../../utils/psmath"
import { FightAxis, PictureAnswer } from "../../canvastypes"
import { drawBullseye } from "../drawutils"
import { DrawPic } from "./drawpic"
import { PictureInfo } from "./pictureclamp"
import { PictureFactory } from "./picturefactory"

export default class DrawPackage extends DrawPic {
  private nPkg!: DrawPic
  private sPkg!: DrawPic

  create(): DrawPic {
    return new DrawPackage()
  }

  chooseNumGroups(nCts: number): void {
    const nCt = Math.floor(nCts / 2)
    const sCt = nCts - nCt

    this.nPkg = PictureFactory.getPictureDraw("random", nCt, true)
    this.sPkg = PictureFactory.getPictureDraw("random", sCt, true)

    this.nPkg.initialize(this.ctx, this.props, this.state)
    this.sPkg.initialize(this.ctx, this.props, this.state)

    this.nPkg.chooseNumGroups(nCt)
    this.sPkg.chooseNumGroups(sCt)

    this.numGroups = this.nPkg.numGroups + this.sPkg.numGroups
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

    if (isNS) {
      if (this.isRange) {
        // lLbl = "NORTH"
        // tLbl = "SOUTH"
        s1x = randomNumber(
          this.ctx.canvas.width * 0.2,
          this.ctx.canvas.width * 0.8
        )
        s1y = randomNumber(
          this.ctx.canvas.height * 0.5,
          this.ctx.canvas.height * 0.59
        )

        s2x = s1x
        s2y = randomNumber(
          this.ctx.canvas.height * 0.7,
          this.ctx.canvas.height * 0.8
        )
      } else {
        s1x = randomNumber(
          this.ctx.canvas.width * 0.2,
          this.ctx.canvas.width * 0.3
        )
        s1y = randomNumber(
          this.ctx.canvas.height * 0.5,
          this.ctx.canvas.height * 0.8
        )

        s2y = s1y
        s2x = randomNumber(
          this.ctx.canvas.width * 0.7,
          this.ctx.canvas.width * 0.8
        )
      }
    } else {
      if (this.isRange) {
        s1x = randomNumber(
          this.ctx.canvas.width * 0.5,
          this.ctx.canvas.width * 0.59
        )
        s1y = randomNumber(
          this.ctx.canvas.height * 0.2,
          this.ctx.canvas.width * 0.4
        )

        s2x = randomNumber(
          this.ctx.canvas.width * 0.2,
          this.ctx.canvas.width * 0.35
        )
        s2y = s1y
      } else {
        //     tLbl = "NORTH"
        //     lLbl = "SOUTH"
        s1x = randomNumber(
          this.ctx.canvas.width * 0.25,
          this.ctx.canvas.width * 0.5
        )
        s1y = randomNumber(
          this.ctx.canvas.height * 0.6,
          this.ctx.canvas.height * 0.7
        )
        s2x = s1x
        s2y = randomNumber(
          this.ctx.canvas.height * 0.25,
          this.ctx.canvas.height * 0.4
        )
      }
    }

    const start1 = new Point(s1x, s1y)
    const start2 = new Point(s2x, s2y)

    const nPkgInfo = this.nPkg.getPictureInfo(start1)
    this.nPkg.pInfo = nPkgInfo
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.nPkg.deep = nPkgInfo.deep!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.nPkg.wide = nPkgInfo.wide!

    const sPkgInfo = this.sPkg.getPictureInfo(start2)
    this.sPkg.pInfo = sPkgInfo
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.sPkg.deep = sPkgInfo.deep!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.sPkg.wide = sPkgInfo.wide!

    this.start2 = start2

    return {
      start: start1,
    }
  }

  createGroups = (startPos: Point, contactList: number[]): AircraftGroup[] => {
    const nGrps = this.nPkg.createGroups(
      startPos,
      contactList.slice(0, this.nPkg.getNumGroups())
    )
    const sGrps = this.sPkg.createGroups(
      this.start2,
      contactList.slice(this.nPkg.getNumGroups())
    )

    this.nPkg.groups = nGrps
    this.sPkg.groups = sGrps

    return nGrps.concat(sGrps)
  }

  drawInfo(): void {
    this.nPkg.drawInfo()
    this.sPkg.drawInfo()
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
    const nPkgContacts = this.nPkg.groups
      .map((grp) => grp.getStrength())
      .reduce((a, b) => a + b)
    const sPkgContacts = this.sPkg.groups
      .map((grp) => grp.getStrength())
      .reduce((a, b) => a + b)
    const nCts = nPkgContacts + sPkgContacts
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    drawBullseye(this.ctx, this.state.bullseye)
    this.state.blueAir.draw(this.ctx, this.props.dataStyle)
    return this.draw(this.ctx, false, nCts)
  }

  _isAnchorNPkg = (
    nBR: number,
    sBR: number,
    nGrps: AircraftGroup[],
    sGrps: AircraftGroup[]
  ): boolean => {
    let anchorNorth = true
    if (sBR < nBR) {
      anchorNorth = false
    } else if (sBR === nBR) {
      const maxAlt1 = Math.max(
        ...nGrps.map((grp) => {
          return Math.max(...grp.getAltitudes())
        })
      )
      const maxAlt2 = Math.max(
        ...sGrps.map((grp) => {
          return Math.max(...grp.getAltitudes())
        })
      )
      if (maxAlt2 > maxAlt1) {
        anchorNorth = false
      } else if (maxAlt2 === maxAlt1) {
        if (sGrps.length > nGrps.length) {
          anchorNorth = false
        }
      }
    }
    return anchorNorth
  }

  getAnswer(): string {
    const bull1 = this._getPicBull(this.nPkg.groups)
    const bull2 = this._getPicBull(this.sPkg.groups)

    let nPkgBe = this.state.bullseye.getBR(bull1)
    let sPkgBe = this.state.bullseye.getBR(bull2)

    const isNS = FightAxis.isNS(this.props.orientation.orient)

    // default deep
    let rngBack = isNS
      ? new Point(bull1.x, bull2.y).getBR(bull1)
      : new Point(bull2.x, bull1.y).getBR(bull1)
    // measure wide if az
    if (!this.isRange) {
      rngBack = isNS
        ? new Point(bull2.x, bull1.y).getBR(bull1)
        : new Point(bull1.x, bull2.y).getBR(bull1)
    }

    let answer = ""
    if (rngBack.range < 40) {
      answer = this.tryAgain().pic
    } else {
      let nLbl = isNS ? "WEST" : "SOUTH"
      let sLbl = isNS ? "EAST" : "NORTH"
      if (this.isRange) {
        nLbl = "LEAD"
        sLbl = "TRAIL"
      }

      // TODO -- anchoring P's for closer package
      const bPos = this.state.blueAir.getCenterOfMass(this.props.dataStyle)
      const nBR = bPos.getBR(bull1).range
      const sBR = bPos.getBR(bull2).range
      const anchorNPkg = this._isAnchorNPkg(
        nBR,
        sBR,
        this.nPkg.groups,
        this.sPkg.groups
      )

      if (!anchorNPkg) {
        const tmpPkgBe = nPkgBe
        nPkgBe = sPkgBe
        sPkgBe = tmpPkgBe
        const tmpLbl = nLbl
        nLbl = sLbl
        sLbl = tmpLbl
      }

      answer = "2 PACKAGES "
      answer += (this.isRange ? " RANGE " : " AZIMUTH ") + rngBack.range + " "
      answer +=
        nLbl + " PACKAGE BULLSEYE " + nPkgBe.bearing + "/" + nPkgBe.range
      answer += " "
      answer +=
        sLbl + " PACKAGE BULLSEYE " + sPkgBe.bearing + "/" + sPkgBe.range
    }
    return answer.replace(/\s+/g, " ").trim()
  }
}
