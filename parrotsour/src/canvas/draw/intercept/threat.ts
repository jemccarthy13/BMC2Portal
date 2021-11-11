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
import { PaintBrush } from "../paintbrush"
import { DrawPic } from "./drawpic"
import { PictureInfo } from "./pictureclamp"

export default class DrawThreat extends DrawPic {
  create(): DrawPic {
    return new DrawThreat()
  }

  chooseNumGroups(): void {
    this.numGroupsToCreate = 1
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

    PaintBrush.drawAltitudes(sgPos, sg.getAltitudes())

    sg.setBraaseye(new Braaseye(sgPos, bluePos, bullseye))
    sg.getBraaseye().draw(showMeasurements, braaFirst)
  }

  formatPicTitle(): string {
    return "[FTR C/S], THREAT GROUP BRAA "
  }

  applyLabels(): void {
    this.groups[0].setLabel("SINGLE GROUP")
  }

  formatWeighted(): string {
    return ""
  }

  formatDimensions(): string {
    return ""
  }

  getAnswer(): string {
    const sg = this.groups[0]

    this.applyLabels()

    const { blueAir } = this.state
    const { dataStyle } = this.props

    const aspectH = blueAir.getAspect(sg, dataStyle)
    const trackDir = sg.getTrackDir()
    const braaseye = sg.getBraaseye()

    const sgAlts: AltStack = sg.getAltStack(this.props.format)

    let answer: string = this.formatPicTitle()
    answer += braaseye.braa.toString() + " "
    answer += sgAlts.stack + " "
    answer += aspectH + " " + trackDir + " HOSTILE "

    answer += sg.formatNumContacts()

    answer += sgAlts.fillIns

    return answer.replace(/\s+/g, " ").trim()
  }
}
