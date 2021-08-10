// Interfaces
import { AircraftGroup } from "../../../classes/groups/group"
import {
  PictureAnswer,
  PictureDrawFunction,
  PictureCanvasProps,
  PictureCanvasState,
} from "../../canvastypes"

// Functions
import { drawAltitudes, drawText } from "../drawutils"
import { formatGroup } from "../formatutils"
import { GroupFactory } from "../../../classes/groups/groupfactory"
import { Braaseye } from "../../../classes/braaseye"
import { randomNumber } from "../../../utils/psmath"

export const drawPOD: PictureDrawFunction = (
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState
): PictureAnswer => {
  if (!state.blueAir) {
    return { pic: "", groups: [] }
  }
  const numGrps: number = randomNumber(3, 11)

  const bPos = state.blueAir.getCenterOfMass(props.dataStyle)

  drawText(ctx, '"DARKSTAR, EAGLE01, PICTURE"', bPos.x - 200, 20)

  const groups: AircraftGroup[] = []
  for (let x = 0; x <= numGrps; x++) {
    groups.push(GroupFactory.randomGroup(ctx, props, state))
    groups[x].draw(ctx, props.dataStyle)

    const grpPos = groups[x].getCenterOfMass(props.dataStyle)

    new Braaseye(
      grpPos,
      state.blueAir.getCenterOfMass(props.dataStyle),
      state.bullseye
    ).draw(ctx, props.showMeasurements, props.braaFirst)
    drawAltitudes(ctx, grpPos, groups[x].getAltitudes())
  }

  function sortFun(a: AircraftGroup, b: AircraftGroup) {
    const bluePos = state.blueAir.getCenterOfMass(props.dataStyle)
    const aBR = bluePos.getBR(a.getCenterOfMass(props.dataStyle))
    const bBR = bluePos.getBR(b.getCenterOfMass(props.dataStyle))
    return aBR.range > bBR.range ? 1 : -1
  }

  const closestGroups = groups.sort(sortFun).slice(0, 3)

  let response = groups.length + " GROUPS, "

  for (let z = 0; z < closestGroups.length; z++) {
    const braaseye = new Braaseye(
      closestGroups[z].getCenterOfMass(props.dataStyle),
      state.blueAir.getCenterOfMass(props.dataStyle),
      state.bullseye
    )
    closestGroups[z].setBraaseye(braaseye)
    closestGroups[z].setLabel("GROUP")
    response += formatGroup(props.format, groups[z], true)
  }

  response +=
    "\r\n\r\nNote: This is core; there may be a better answer, but POD is intended to get you thinking about 'what would you say if you saw...'"
  return {
    pic: response,
    groups: closestGroups,
  }
}
