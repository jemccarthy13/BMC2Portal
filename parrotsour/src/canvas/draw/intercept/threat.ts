import { AltStack } from "../../../classes/altstack"
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
import { drawAltitudes } from "../drawutils"
import { DrawPic } from "./drawpic"
import { PictureInfo } from "./pictureclamp"

export default class DrawThreat extends DrawPic {
  create(): DrawPic {
    return new DrawThreat()
  }

  chooseNumGroups(): void {
    this.numGroups = 1
  }

  getPictureInfo(start?: Point): PictureInfo {
    const isNS = FightAxis.isNS(this.props.orientation.orient)
    const bPos = this.state.blueAir.getCenterOfMass(this.props.dataStyle)
    if (start === undefined) {
      start = new Point(
        randomNumber(bPos.x - 25 * PIXELS_TO_NM, bPos.x - 10 * PIXELS_TO_NM),
        isNS
          ? randomNumber(bPos.y - 2, bPos.y + 30 * PIXELS_TO_NM)
          : randomNumber(bPos.y - 25 * PIXELS_TO_NM, bPos.y + 25 * PIXELS_TO_NM)
      )
    }
    if (start && start.y === undefined) {
      start.y = randomNumber(bPos.y - 100, bPos.y + 40)
    }
    if (start && start.x === undefined) {
      start.x = randomNumber(bPos.x - 100, bPos.x - 40)
    }

    return {
      start,
      deep: 5 * PIXELS_TO_NM,
      wide: 5 * PIXELS_TO_NM,
    }
  }

  createGroups = (startPos: Point, contactList: number[]): AircraftGroup[] => {
    const heading: number = randomHeading(
      FORMAT.IPE,
      this.state.blueAir.getHeading()
    )

    const sg = new AircraftGroup({
      ctx: this.ctx,
      sx: startPos.x,
      sy: startPos.y,
      hdg: heading,
      nContacts: contactList[0],
    })
    return [sg]
  }

  drawInfo(): void {
    const sg = this.groups[0]

    const { blueAir, bullseye } = this.state
    const { dataStyle, showMeasurements, braaFirst } = this.props

    const sgPos = sg.getCenterOfMass(dataStyle)
    const bluePos = blueAir.getCenterOfMass(dataStyle)

    drawAltitudes(this.ctx, sgPos, sg.getAltitudes())

    sg.setBraaseye(new Braaseye(sgPos, bluePos, bullseye))
    sg.getBraaseye().draw(this.ctx, showMeasurements, braaFirst)
  }

  getAnswer(): string {
    const sg = this.groups[0]

    sg.setLabel("SINGLE GROUP")

    const { blueAir } = this.state
    const { dataStyle } = this.props

    const aspectH = blueAir.getAspect(sg, dataStyle)
    const trackDir = sg.getTrackDir()
    const braaseye = sg.getBraaseye()

    const sgAlts: AltStack = sg.getAltStack(this.props.format)

    let answer: string =
      "[FTR C/S], THREAT GROUP BRAA " +
      braaseye.braa.bearing +
      "/" +
      braaseye.braa.range +
      " " +
      sgAlts.stack +
      " " +
      aspectH +
      " " +
      (aspectH !== "HOT" ? trackDir : "") +
      " HOSTILE "

    if (sg.getStrength() > 1) {
      answer +=
        (sg.getStrength() >= 3 ? "HEAVY " : "") +
        sg.getStrength() +
        " CONTACTS "
    }

    answer += sgAlts.fillIns

    return answer
  }
}
