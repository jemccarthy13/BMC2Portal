import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { GroupFactory } from "../../../classes/groups/groupfactory"
import { Point } from "../../../classes/point"
import { PIXELS_TO_NM } from "../../../utils/psmath"
import { FightAxis } from "../../canvastypes"
import { drawAltitudes } from "../drawutils"
import { formatGroup } from "../formatutils"
import { DrawPic } from "./drawpic"
import { getStartPos, PictureInfo } from "./pictureclamp"

export default class DrawSingleGroup extends DrawPic {
  create(): DrawPic {
    return new DrawSingleGroup()
  }

  /**
   * @returns # of groups in this picture
   */
  chooseNumGroups = (): void => {
    this.numGroups = 1
  }

  /**
   * Create a single group for this picture
   * @param ctx Current drawing context
   * @param props Canvas props
   * @param state Canvas state
   * @param startPos Start position for the picture
   * @param desiredNumContacts # contacts in pic or 0 for random #
   * @returns Array of AircraftGroup
   */
  createGroups = (startPos: Point, contactList: number[]): AircraftGroup[] => {
    const sg = GroupFactory.randomGroupAtLoc(
      this.ctx,
      this.props,
      this.state,
      startPos,
      undefined,
      contactList[0]
    )
    sg.setLabel("SINGLE GROUP")
    return [sg]
  }

  getPictureInfo = (start?: Point): PictureInfo => {
    return {
      deep: -1,
      wide: -1,
      start: getStartPos(
        this.ctx,
        this.state.blueAir,
        this.props.orientation.orient,
        this.props.dataStyle,
        {
          wide: 7 * PIXELS_TO_NM,
          deep: 7 * PIXELS_TO_NM,
          start,
        }
      ),
    }
  }

  drawInfo = (): void => {
    const sg = this.groups[0]
    const isNS = FightAxis.isNS(this.props.orientation.orient)

    const { blueAir, bullseye } = this.state
    const bluePos = blueAir.getCenterOfMass(this.props.dataStyle)

    let offsetX = 0
    let offsetY = 0
    if (isNS) {
      offsetX = -60
      offsetY = 40
    }
    const sgPos = sg.getCenterOfMass(this.props.dataStyle)
    drawAltitudes(this.ctx, sgPos, sg.getAltitudes(), offsetX, offsetY)

    sg.setBraaseye(new Braaseye(sgPos, bluePos, bullseye))

    sg.getBraaseye().draw(
      this.ctx,
      this.props.showMeasurements,
      this.props.braaFirst,
      offsetX,
      offsetY
    )
  }

  getAnswer = (): string => {
    const sg = this.groups[0]
    return formatGroup(this.props.format, sg, true).replace(/\s+/g, " ").trim()
  }
}
