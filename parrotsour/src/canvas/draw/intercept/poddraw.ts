// Interfaces
import { AircraftGroup } from "../../../classes/groups/group"
import {
  PictureAnswer,
  PictureDrawFunction,
  PictureCanvasProps,
  PictureCanvasState,
} from "../../../canvas/canvastypes"

// Functions
import { drawAltitudes, drawLine, drawText } from "../drawutils"
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

  const bPos = state.blueAir.getCenterOfMass()

  drawText(ctx, '"DARKSTAR, EAGLE01, PICTURE"', bPos.x - 200, 20)

  const groups2: AircraftGroup[] = []

  const groups: AircraftGroup[] = []
  for (let x = 0; x <= numGrps; x++) {
    groups.push(GroupFactory.randomGroup(ctx, props, state))
    groups[x].draw(ctx, props.dataStyle)

    const grpPos = groups[x].getCenterOfMass()
    drawLine(
      ctx,
      state.bullseye.x,
      state.bullseye.y,
      state.bullseye.x - 2,
      state.bullseye.y - 2
    )

    new Braaseye(grpPos, state.blueAir.getCenterOfMass(), state.bullseye).draw(
      ctx,
      props.showMeasurements,
      props.braaFirst
    )
    drawAltitudes(ctx, grpPos, groups[x].getAltitudes())
  }

  function sortFun(a: AircraftGroup, b: AircraftGroup) {
    const aBR = state.blueAir.getCenterOfMass().getBR(a.getCenterOfMass())
    const bBR = state.blueAir.getCenterOfMass().getBR(b.getCenterOfMass())
    return aBR.range > bBR.range ? 1 : -1
  }

  const closestGroups = groups.sort(sortFun).slice(0, 3)

  let response = groups.length + " GROUPS, "

  for (let z = 0; z < closestGroups.length; z++) {
    const braaseye = new Braaseye(
      closestGroups[z].getCenterOfMass(),
      state.blueAir.getCenterOfMass(),
      state.bullseye
    )
    response += formatGroup(
      "",
      braaseye,
      groups[z].getAltStack(props.format),
      groups[z].getStrength(),
      true,
      groups[z].getTrackDir() + " "
    )
  }

  return {
    pic: response,
    groups: groups2,
  }
}
