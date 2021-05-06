// Classes, interfaces, types
import {
  FightAxis,
  PictureAnswer,
  PictureCanvasProps,
  PictureCanvasState,
  PictureDrawFunction,
} from "../../../canvas/canvastypes"
import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { AltStack } from "../../../classes/altstack"
import { Point } from "../../../classes/point"

// Functions
import { drawAltitudes, drawMeasurement } from "../../../canvas/draw/drawutils"
import { formatGroup } from "../../../canvas/draw/formatutils"
import { getStartPos } from "../../../canvas/draw/intercept/pictureclamp"
import { picTrackDir } from "../../../canvas/draw/intercept/picturehelpers"
import {
  PIXELS_TO_NM,
  randomHeading,
  randomNumber,
} from "../../../utils/psmath"
import { FORMAT } from "../../../classes/supportedformats"

export const drawLadder: PictureDrawFunction = (
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  start?: Point | undefined
): PictureAnswer => {
  const groups: AircraftGroup[] = []
  const braaseyes: Braaseye[] = []
  const altstacks: AltStack[] = []

  const numGroups = randomNumber(3, 5)

  /**
   * TODO -- CLAMP -- need to know how deep the ladder will
   * be in order to clamp to canvas w/getStartPos.
   *
   * This means calculating offset per group / depth ahead of time,
   * then creating / drawing groups later
   */
  const startPos = getStartPos(ctx, state.blueAir, props.orientation.orient, {
    start,
  })
  const startX = startPos.x
  const startY = startPos.y

  let heading = randomHeading(props.format, state.blueAir.getHeading())

  let totalArrowOffset = 0

  const isNS = FightAxis.isNS(props.orientation.orient)

  for (let x = 0; x < numGroups; x++) {
    const offsetHeading = randomNumber(-5, 5)
    totalArrowOffset += x === 0 ? 0 : randomNumber(30, 80)

    heading = !props.isHardMode
      ? heading
      : randomHeading(props.format, state.blueAir.getHeading())

    let offsetX = 0
    let offsetY = 0
    if (isNS) {
      const grp = new AircraftGroup({
        ctx,
        sx: startX,
        sy: startY - totalArrowOffset,
        hdg: heading + offsetHeading,
      })
      grp.draw(ctx, props.dataStyle)
      groups.push(grp)
    } else {
      const grp = new AircraftGroup({
        ctx,
        sx: startX + totalArrowOffset,
        sy: startY,
        hdg: heading + offsetHeading,
      })
      grp.draw(ctx, props.dataStyle)
      groups.push(grp)
      offsetX = -40 + -5 * (numGroups - x)
      offsetY = -20 + -11 * (numGroups - x)
    }

    const gPos = groups[x].getCenterOfMass()
    drawAltitudes(ctx, gPos, groups[x].getAltitudes(), offsetX, offsetY)

    const grpBraaseye = new Braaseye(
      gPos,
      state.blueAir.getCenterOfMass(),
      state.bullseye
    )
    grpBraaseye.draw(
      ctx,
      props.showMeasurements,
      props.braaFirst,
      offsetX,
      offsetY
    )
    braaseyes[x] = grpBraaseye

    altstacks[x] = groups[x].getAltStack(props.format)
  }

  let deep
  const prevGpPos = groups[groups.length - 1].getCenterOfMass()
  const gpPos = groups[0].getCenterOfMass()
  if (isNS) {
    deep = Math.floor(Math.abs(gpPos.y - prevGpPos.y) / PIXELS_TO_NM)
    drawMeasurement(
      ctx,
      gpPos.x - 30,
      gpPos.y,
      gpPos.x - 30,
      prevGpPos.y,
      deep,
      props.showMeasurements
    )
  } else {
    deep = Math.floor(Math.abs(gpPos.x - prevGpPos.x) / PIXELS_TO_NM)
    drawMeasurement(
      ctx,
      gpPos.x,
      gpPos.y + 40,
      prevGpPos.x,
      gpPos.y + 40,
      deep,
      props.showMeasurements
    )
  }

  switch (numGroups) {
    case 3:
      groups[0].setLabel("TRAIL GROUP")
      groups[1].setLabel("MIDDLE GROUP")
      groups[2].setLabel("LEAD GROUP")
      break
    case 4:
      groups[0].setLabel("TRAIL GROUP")
      groups[1].setLabel("3RD GROUP")
      groups[2].setLabel("2ND GROUP")
      groups[3].setLabel("LEAD GROUP")
      break
    case 5:
      groups[0].setLabel("TRAIL GROUP")
      groups[1].setLabel("4TH GROUP")
      groups[2].setLabel("3RD GROUP")
      groups[3].setLabel("2ND GROUP")
      groups[4].setLabel("LEAD GROUP")
      break
  }

  let answer = numGroups + " GROUP LADDER " + deep + " DEEP, "

  answer += picTrackDir(props.format, groups)

  //console.log("CHECK FOR ECHELON LADDER?");

  const rangeBack = {
    label: props.format === FORMAT.ALSA ? "SEPARATION" : "RANGE",
    range: groups[groups.length - 2]
      .getCenterOfMass()
      .getBR(groups[groups.length - 1].getCenterOfMass()).range,
  }

  for (let g = groups.length - 1; g >= 0; g--) {
    const label = groups[g].getLabel()
    answer +=
      formatGroup(
        label.replace(/GROUP/, ""),
        braaseyes[g],
        altstacks[g],
        groups[g].getStrength(),
        g === groups.length - 1,
        groups[g].getTrackDir(),
        g === groups.length - 2 ? rangeBack : undefined
      ) + " "
  }

  return {
    pic: answer,
    groups: groups,
  }
}
