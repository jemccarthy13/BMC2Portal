import { AircraftGroup } from "../../../classes/groups/group"
import { Point } from "../../../classes/point"
import { FORMAT } from "../../../classes/supportedformats"
import { PictureAnswer } from "../../canvastypes"
import { drawBullseye } from "../drawutils"
import { DrawPic } from "./drawpic"
import { getRestrictedStartPos, PictureInfo } from "./pictureclamp"
import { PictureFactory } from "./picturefactory"

export default class DrawLeadEdge extends DrawPic {
  private leadEdge!: DrawPic
  private followOn!: DrawPic

  private furthestLeadGroup!: AircraftGroup

  create(): DrawPic {
    return new DrawLeadEdge()
  }

  chooseNumGroups(nCts: number): void {
    const nCt = Math.floor(nCts / 2)
    const sCt = nCts - nCt

    console.log("lead edge has " + nCt)
    console.log("follow on has " + sCt)
    this.leadEdge = PictureFactory.getPictureDraw("random", nCt, true)
    this.followOn = PictureFactory.getPictureDraw("random", sCt, true)

    this.leadEdge.initialize(this.ctx, this.props, this.state)
    this.followOn.initialize(this.ctx, this.props, this.state)

    this.leadEdge.chooseNumGroups(nCt)
    this.followOn.chooseNumGroups(sCt)
    this.numGroups = this.leadEdge.numGroups + this.followOn.numGroups
  }

  getPictureInfo(start?: Point): PictureInfo {
    // // Draw the first picture (i.e. the leading edge)
    const pic1StartPos = getRestrictedStartPos(
      this.ctx,
      this.state.blueAir,
      this.props.orientation.orient,
      this.props.dataStyle,
      45,
      100,
      { start }
    )
    const leadInfo = this.leadEdge.getPictureInfo(pic1StartPos)
    this.leadEdge.pInfo = leadInfo
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.leadEdge.deep = leadInfo.deep!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.leadEdge.wide = leadInfo.wide!

    const followInfo = this.followOn.getPictureInfo(pic1StartPos)
    this.followOn.pInfo = followInfo
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.followOn.deep = followInfo.deep!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.followOn.wide = followInfo.wide!

    return {
      deep: 0,
      wide: 0,
      start: pic1StartPos,
    }
  }

  createGroups = (startPos: Point, contactList: number[]): AircraftGroup[] => {
    const { dataStyle } = this.props
    const { blueAir } = this.state

    const leadGrps = this.leadEdge.createGroups(
      startPos,
      contactList.slice(0, this.leadEdge.getNumGroups())
    )
    this.leadEdge.groups = leadGrps

    console.log(this.leadEdge.groups)
    let furthestPic1Group = this.leadEdge.groups[0]
    let furthestRange = 0
    this.leadEdge.groups.forEach((grp) => {
      const grpRange = grp
        .getCenterOfMass(dataStyle)
        .getBR(blueAir.getCenterOfMass(dataStyle)).range
      if (grpRange > furthestRange) {
        furthestPic1Group = grp
        furthestRange = grpRange
      }
    })

    this.furthestLeadGroup = furthestPic1Group

    const pic2StartPos = getRestrictedStartPos(
      this.ctx,
      furthestPic1Group,
      this.props.orientation.orient,
      dataStyle,
      25,
      40
    )
    this.followOn.pInfo.start = pic2StartPos

    const followGrps = this.followOn.createGroups(
      pic2StartPos,
      contactList.slice(this.leadEdge.getNumGroups())
    )

    this.followOn.groups = followGrps

    return leadGrps.concat(followGrps)
  }

  drawInfo(): void {
    this.leadEdge.drawInfo()
    this.followOn.drawInfo()
  }

  tryAgain(): PictureAnswer {
    const nPkgContacts = this.leadEdge.groups
      .map((grp) => grp.getStrength())
      .reduce((a, b) => a + b)
    const sPkgContacts = this.followOn.groups
      .map((grp) => grp.getStrength())
      .reduce((a, b) => a + b)
    const nCts = nPkgContacts + sPkgContacts
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    drawBullseye(this.ctx, this.state.bullseye)
    this.state.blueAir.draw(this.ctx, this.props.dataStyle)
    return this.draw(this.ctx, false, nCts)
  }

  getAnswer(): string {
    const { dataStyle } = this.props
    const { blueAir } = this.state
    const groups2 = this.followOn.groups

    let closestFollowOn = groups2[0]
    let closestRange = Number.MAX_VALUE
    groups2.forEach((grp) => {
      const grpRange = grp
        .getCenterOfMass(dataStyle)
        .getBR(blueAir.getCenterOfMass(dataStyle)).range
      if (grpRange < closestRange) {
        closestFollowOn = grp
        closestRange = grpRange
      }
    })

    const pic2Pos = closestFollowOn.getCenterOfMass(dataStyle)
    const pic1Pos = this.furthestLeadGroup.getCenterOfMass(dataStyle)

    const rngBack = pic1Pos.straightDistNM(
      pic2Pos,
      this.props.orientation.orient
    )
    let answer = ""

    if (rngBack > 40) {
      answer = this.tryAgain().pic
    } else {
      answer = this.getNumGroups() + " GROUPS, "
      answer += "LEADING EDGE " + this.leadEdge.getAnswer()
      answer += " FOLLOW ON "
      answer += this.props.format === FORMAT.IPE ? " GROUPS " : ""
      answer += rngBack
      answer += this.props.format === FORMAT.IPE ? " MILES " : ""
    }
    return answer.replace(/\s+/g, " ").trim()
  }
}
