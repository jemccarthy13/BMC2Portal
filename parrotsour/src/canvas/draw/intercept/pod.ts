import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { GroupFactory } from "../../../classes/groups/groupfactory"
import { Point } from "../../../classes/point"
import { PIXELS_TO_NM, randomNumber } from "../../../utils/psmath"
import { drawAltitudes, drawText } from "../drawutils"
import { formatGroup } from "../formatutils"
import { DrawPic } from "./drawpic"
import { PictureInfo } from "./pictureclamp"

export default class DrawPOD extends DrawPic {
  create(): DrawPic {
    return new DrawPOD()
  }

  chooseNumGroups(): number {
    const grpCt = randomNumber(3, 11)
    this.numGroups = grpCt
    return grpCt
  }

  getPictureInfo(start?: Point): PictureInfo {
    return {
      deep: 5 * PIXELS_TO_NM,
      wide: 5 * PIXELS_TO_NM,
      start,
    }
  }

  createGroups = (): AircraftGroup[] => {
    const groups = []
    for (let x = 0; x <= this.getNumGroups(); x++) {
      groups.push(GroupFactory.randomGroup(this.ctx, this.props, this.state))
    }
    return groups
  }

  drawInfo(): void {
    const bPos = this.state.blueAir.getCenterOfMass(this.props.dataStyle)
    drawText(this.ctx, '"DARKSTAR, EAGLE01, PICTURE"', bPos.x - 200, 20)

    const { showMeasurements, braaFirst } = this.props

    this.groups.forEach((grp) => {
      const grpPos = grp.getCenterOfMass(this.props.dataStyle)

      grp.setLabel("GROUP")
      grp.setBraaseye(new Braaseye(grpPos, bPos, this.state.bullseye))
      grp.getBraaseye().draw(this.ctx, showMeasurements, braaFirst)
      drawAltitudes(this.ctx, grpPos, grp.getAltitudes())
    })
  }

  getAnswer(): string {
    const { dataStyle } = this.props
    const { blueAir } = this.state
    function sortFun(a: AircraftGroup, b: AircraftGroup) {
      const bluePos = blueAir.getCenterOfMass(dataStyle)
      const aBR = bluePos.getBR(a.getCenterOfMass(dataStyle))
      const bBR = bluePos.getBR(b.getCenterOfMass(dataStyle))
      return aBR.range > bBR.range ? 1 : -1
    }

    const closestGroups = this.groups.sort(sortFun).slice(0, 3)

    let response = this.groups.length + " GROUPS, "
    for (let z = 0; z < closestGroups.length; z++) {
      response += formatGroup(this.props.format, this.groups[z], true)
    }
    response += "\r\n\r\nNote: This is core; there may be a better answer, "
    response += "but POD is intended to get you thinking about "
    response += "'what would you say if you saw...'"

    return response
  }
}
