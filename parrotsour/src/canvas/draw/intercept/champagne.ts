// Classes & Types
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
import { getRestrictedStartPos } from "../../../canvas/draw/intercept/pictureclamp"
import {
  isAnchorNorth,
  picTrackDir,
} from "../../../canvas/draw/intercept/picturehelpers"
import {
  PIXELS_TO_NM,
  randomHeading,
  randomNumber,
} from "../../../utils/psmath"
import { FORMAT } from "../../../classes/supportedformats"
import { checkCaps } from "./capdraw"

/**
 * Draw a three group champagne and return the correct answer.
 *
 * @param ctx Current drawing context
 * @param props PicCanvasProps for the canvas
 * @param state PicCanvasState of the current canvas
 * @param start (Optional) Forced starting location for the picture
 * @returns DrawAnswer with the correct answer for this picture
 */
export const drawChampagne: PictureDrawFunction = (
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  hasCaps: boolean,
  start?: Point | undefined
): PictureAnswer => {
  const picture = {
    start,
    width: randomNumber(7 * PIXELS_TO_NM, 30 * PIXELS_TO_NM),
    depth: randomNumber(7 * PIXELS_TO_NM, 30 * PIXELS_TO_NM),
  }

  const startPos = getRestrictedStartPos(
    ctx,
    state.blueAir,
    props.orientation.orient,
    props.dataStyle,
    45 + picture.depth,
    100,
    picture
  )
  const startX = startPos.x
  const startY = startPos.y

  let heading: number = randomHeading(props.format, state.blueAir.getHeading())
  const tg = new AircraftGroup({
    ctx,
    sx: startX,
    sy: startY,
    hdg: heading + randomNumber(-10, 10),
  })

  if (props.isHardMode)
    heading = randomHeading(props.format, state.blueAir.getHeading())

  const isNS = FightAxis.isNS(props.orientation.orient)

  let nlg: AircraftGroup
  if (isNS) {
    nlg = new AircraftGroup({
      ctx,
      sx: startX - picture.width / 2,
      sy: startY - picture.depth,
      hdg: heading + randomNumber(-10, 10),
    })
  } else {
    nlg = new AircraftGroup({
      ctx,
      sx: startX + picture.depth,
      sy: startY - picture.width / 2,
      hdg: heading + randomNumber(-10, 10),
    })
  }

  if (props.isHardMode)
    heading = randomHeading(props.format, state.blueAir.getHeading())
  let slg: AircraftGroup
  let offsetX = 0
  let offsetX2 = 0

  let sLbl = "SOUTH"
  let nLbl = "NORTH"

  if (isNS) {
    slg = new AircraftGroup({
      ctx,
      sx: startX + picture.width / 2,
      sy: startY - picture.depth,
      hdg: heading + randomNumber(-10, 10),
    })
    offsetX2 = -70
    sLbl = "EAST"
    nLbl = "WEST"
  } else {
    slg = new AircraftGroup({
      ctx,
      sx: startX + picture.depth,
      sy: startY + picture.width / 2,
      hdg: heading + randomNumber(-10, 10),
    })
    offsetX = -70
  }

  checkCaps(hasCaps, [tg, nlg, slg])

  tg.draw(ctx, props.dataStyle)
  nlg.draw(ctx, props.dataStyle)
  slg.draw(ctx, props.dataStyle)

  let realDepth, realWidth
  const nlgPos = nlg.getCenterOfMass(props.dataStyle)
  const slgPos = slg.getCenterOfMass(props.dataStyle)
  const tgPos = tg.getCenterOfMass(props.dataStyle)
  if (isNS) {
    realWidth = new Point(slgPos.x, nlgPos.y).getBR(nlgPos).range
    realDepth = new Point(tgPos.x, nlgPos.y).getBR(tgPos).range
    drawMeasurement(
      ctx,
      nlgPos.x,
      nlgPos.y,
      tgPos.x,
      nlgPos.y,
      realWidth,
      props.showMeasurements
    )
    drawMeasurement(
      ctx,
      tgPos.x,
      tgPos.y,
      tgPos.x,
      nlgPos.y,
      realDepth,
      props.showMeasurements
    )
  } else {
    realWidth = nlgPos.getBR(new Point(nlgPos.x, slgPos.y)).range
    realDepth = new Point(nlgPos.x, tgPos.y).getBR(tgPos).range
    drawMeasurement(
      ctx,
      nlgPos.x,
      slgPos.y,
      nlgPos.x,
      nlgPos.y,
      realWidth,
      props.showMeasurements
    )
    drawMeasurement(
      ctx,
      tgPos.x,
      tgPos.y,
      nlgPos.x,
      tgPos.y,
      realDepth,
      props.showMeasurements
    )
  }

  drawAltitudes(ctx, tgPos, tg.getAltitudes(), offsetX)
  drawAltitudes(ctx, slgPos, slg.getAltitudes())
  drawAltitudes(ctx, nlgPos, nlg.getAltitudes(), offsetX2)

  const tgBraaseye = new Braaseye(
    tgPos,
    state.blueAir.getCenterOfMass(props.dataStyle),
    state.bullseye
  )
  const nlgBraaseye = new Braaseye(
    nlgPos,
    state.blueAir.getCenterOfMass(props.dataStyle),
    state.bullseye
  )
  const slgBraaseye = new Braaseye(
    slgPos,
    state.blueAir.getCenterOfMass(props.dataStyle),
    state.bullseye
  )

  tgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst, offsetX)
  nlgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst, offsetX2)
  slgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst)

  const tgAlts: AltStack = tg.getAltStack(props.format)
  const nlgAlts: AltStack = nlg.getAltStack(props.format)
  const slgAlts: AltStack = slg.getAltStack(props.format)

  // TODO -- CHAMP ANSWER -- cleanup
  let answer =
    "THREE GROUP CHAMPAGNE " + realWidth + " WIDE, " + realDepth + " DEEP, "

  // determine if weighted
  if (new Point(nlgPos.x, tgPos.y).getBR(nlgPos).range < realWidth / 3) {
    answer += " WEIGHTED " + nLbl + ", "
  } else if (new Point(slgPos.x, tgPos.y).getBR(slgPos).range < realWidth / 3) {
    answer += " WEIGHTED " + sLbl + ", "
  }

  answer += picTrackDir(props.format, [nlg, slg, tg])

  const includeBull = realWidth >= 10 && props.format !== FORMAT.IPE

  const anchorN = isAnchorNorth(nlgBraaseye, slgBraaseye, nlg, slg)
  if (anchorN) {
    answer +=
      formatGroup(
        nLbl + " LEAD",
        nlgBraaseye,
        nlgAlts,
        nlg.getStrength(),
        true,
        nlg.getTrackDir()
      ) + " "
    answer +=
      formatGroup(
        sLbl + " LEAD",
        slgBraaseye,
        slgAlts,
        slg.getStrength(),
        includeBull,
        slg.getTrackDir()
      ) + " "
  } else {
    answer +=
      formatGroup(
        sLbl + " LEAD",
        slgBraaseye,
        slgAlts,
        slg.getStrength(),
        true,
        slg.getTrackDir()
      ) + " "
    answer +=
      formatGroup(
        nLbl + " LEAD",
        nlgBraaseye,
        nlgAlts,
        nlg.getStrength(),
        includeBull,
        nlg.getTrackDir()
      ) + " "
  }
  answer += formatGroup(
    "TRAIL",
    tgBraaseye,
    tgAlts,
    tg.getStrength(),
    false,
    tg.getTrackDir()
  )

  tg.setLabel("TRAIL GROUP")
  nlg.setLabel(nLbl + " LEAD GROUP")
  slg.setLabel(sLbl + " LEAD GROUP")

  return {
    pic: answer,
    groups: [tg, nlg, slg],
  }
}
