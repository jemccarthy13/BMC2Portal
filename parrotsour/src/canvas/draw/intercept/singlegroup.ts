// Classes & Types
import {
  FightAxis,
  PictureAnswer,
  PictureCanvasProps,
  PictureCanvasState,
  PictureDrawFunction,
} from "../../canvastypes"
import { Braaseye } from "../../../classes/braaseye"
import { GroupFactory } from "../../../classes/groups/groupfactory"
import { Point } from "../../../classes/point"

// Functions
import { drawAltitudes } from "../drawutils"
import { formatGroup } from "../formatutils"
import { getStartPos } from "./pictureclamp"
import { picTrackDir } from "./picturehelpers"
import { PIXELS_TO_NM } from "../../../utils/psmath"
import { checkCaps } from "./capdraw"

/**
 * Draw a single group, one contact (for debugging)
 *
 * @param ctx Current drawing context
 * @param props PicCanvasProps for the canvas
 * @param state PicCanvasState of the current canvas
 * @param start (Optional) Forced starting location for the picture
 * @returns DrawAnswer with the correct answer for this picture
 */
export const drawSingleGroup: PictureDrawFunction = (
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  hasCaps: boolean,
  start?: Point
): PictureAnswer => {
  const startPos = getStartPos(
    ctx,
    state.blueAir,
    props.orientation.orient,
    props.dataStyle,
    {
      wide: 7 * PIXELS_TO_NM,
      deep: 7 * PIXELS_TO_NM,
      start,
    }
  )

  // Create the first group
  const sg = GroupFactory.randomGroupAtLoc(ctx, props, state, startPos)
  checkCaps([sg])
  sg.setLabel("SINGLE GROUP")
  sg.draw(ctx, props.dataStyle)

  const isNS = FightAxis.isNS(props.orientation.orient)

  let offsetX = 0
  let offsetY = 0
  let offsetX2 = 0
  let offsetY2 = 0
  if (isNS) {
    offsetX = -60
    offsetY = 40
    offsetX2 = 10
    offsetY2 = 10
  }
  const sgPos = sg.getCenterOfMass(props.dataStyle)
  drawAltitudes(ctx, sgPos, sg.getAltitudes(), offsetX, offsetY)
  drawAltitudes(ctx, sgPos, sg.getAltitudes(), offsetX2, offsetY2)

  const ngBraaseye = new Braaseye(
    sgPos,
    state.blueAir.getCenterOfMass(props.dataStyle),
    state.bullseye
  )

  ngBraaseye.draw(
    ctx,
    props.showMeasurements,
    props.braaFirst,
    offsetX,
    offsetY
  )

  const sgAlts = sg.getAltStack(props.format)

  let answer = "SINGLE GROUP "

  answer += picTrackDir(props.format, [sg])

  answer += formatGroup(
    "SINGLE",
    ngBraaseye,
    sgAlts,
    sg.getStrength(),
    true,
    sg.getTrackDir()
  )

  return {
    pic: answer,
    groups: [sg],
  }
}
