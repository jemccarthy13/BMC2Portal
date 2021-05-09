import {
  FightAxis,
  PictureAnswer,
  PictureCanvasProps,
  PictureCanvasState,
  PictureDrawFunction,
} from "../../../canvas/canvastypes"
import {
  drawAltitudes,
  drawBullseye,
  drawMeasurement,
} from "../../../canvas/draw/drawutils"
import { formatGroup } from "../../../canvas/draw/formatutils"
import { getRestrictedStartPos } from "../../../canvas/draw/intercept/pictureclamp"
import {
  isAnchorNorth,
  picTrackDir,
} from "../../../canvas/draw/intercept/picturehelpers"
import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { AltStack } from "../../../classes/altstack"
import { Point } from "../../../classes/point"

import {
  PIXELS_TO_NM,
  randomHeading,
  randomNumber,
} from "../../../utils/psmath"

/**
 * Draw a three group vic and return the correct answer.
 *
 * @param ctx Current drawing context
 * @param props Current PictureCanvasProps
 * @param state Current PictureCanvasState
 * @param start (Optional) forced start position
 * @returns DrawAnswer
 */
export const drawVic: PictureDrawFunction = (
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  start?: Point | undefined
): PictureAnswer => {
  const picture = {
    start,
    wide: randomNumber(7 * PIXELS_TO_NM, 30 * PIXELS_TO_NM),
    deep: randomNumber(7 * PIXELS_TO_NM, 30 * PIXELS_TO_NM),
  }

  const startPos = getRestrictedStartPos(
    ctx,
    state.blueAir,
    props.orientation.orient,
    props.dataStyle,
    45 + picture.deep,
    100,
    picture
  )
  const startX = startPos.x
  const startY = startPos.y

  const isNS = FightAxis.isNS(props.orientation.orient)

  // start with trail groups (because clamp)
  let heading: number = randomHeading(props.format, state.blueAir.getHeading())

  const ntg = new AircraftGroup({
    ctx,
    sx: startX,
    sy: startY,
    hdg: heading + randomNumber(-10, 10),
  })
  let offsetX = 0
  let nLbl = "NORTH"
  let sLbl = "SOUTH"
  if (isNS) {
    offsetX = -70
    nLbl = "WEST"
    sLbl = "EAST"
  }
  ntg.draw(ctx, props.dataStyle)
  drawBullseye(ctx, ntg.getStartPos())

  if (props.isHardMode)
    heading = randomHeading(props.format, state.blueAir.getHeading())
  let stg: AircraftGroup
  if (isNS) {
    stg = new AircraftGroup({
      ctx,
      sx: startX + picture.wide,
      sy: startY,
      hdg: heading + randomNumber(-10, 10),
    })
  } else {
    stg = new AircraftGroup({
      ctx,
      sx: startX,
      sy: startY + picture.wide,
      hdg: heading + randomNumber(-10, 10),
    })
  }
  stg.draw(ctx, props.dataStyle)

  if (props.isHardMode)
    heading = randomHeading(props.format, state.blueAir.getHeading())
  let lg: AircraftGroup
  if (isNS) {
    lg = new AircraftGroup({
      ctx,
      sx: startX + picture.wide / 2,
      sy: startY - picture.deep,
      hdg: heading,
    })
  } else {
    lg = new AircraftGroup({
      ctx,
      sx: startX + picture.deep,
      sy: startY + picture.wide / 2,
      hdg: heading,
    })
  }
  lg.draw(ctx, props.dataStyle)

  const ntgPos = ntg.getCenterOfMass(props.dataStyle)
  const stgPos = stg.getCenterOfMass(props.dataStyle)
  const lgPos = lg.getCenterOfMass(props.dataStyle)
  let realDepth, realWidth
  if (isNS) {
    realDepth = new Point(lgPos.x, stgPos.y).getBR(lgPos).range
    realWidth = new Point(ntgPos.x, stgPos.y).getBR(stgPos).range
    drawMeasurement(
      ctx,
      lgPos.x,
      lgPos.y,
      lgPos.x,
      stgPos.y,
      realDepth,
      props.showMeasurements
    )
    drawMeasurement(
      ctx,
      stgPos.x,
      stgPos.y,
      ntgPos.x,
      stgPos.y,
      realWidth,
      props.showMeasurements
    )
  } else {
    realDepth = new Point(stgPos.x, lgPos.y).getBR(lgPos).range
    realWidth = new Point(stgPos.x, ntgPos.y).getBR(stgPos).range
    drawMeasurement(
      ctx,
      lgPos.x,
      lgPos.y,
      stgPos.x,
      lgPos.y,
      realDepth,
      props.showMeasurements
    )
    drawMeasurement(
      ctx,
      stgPos.x,
      stgPos.y,
      stgPos.x,
      ntgPos.y,
      realWidth,
      props.showMeasurements
    )
  }

  drawAltitudes(ctx, lgPos, lg.getAltitudes())
  drawAltitudes(ctx, stgPos, stg.getAltitudes())
  drawAltitudes(ctx, ntgPos, ntg.getAltitudes(), offsetX)

  const lgBraaseye = new Braaseye(
    lgPos,
    state.blueAir.getCenterOfMass(props.dataStyle),
    state.bullseye
  )
  const stgBraaseye = new Braaseye(
    stgPos,
    state.blueAir.getCenterOfMass(props.dataStyle),
    state.bullseye
  )
  const ntgBraaseye = new Braaseye(
    ntgPos,
    state.blueAir.getCenterOfMass(props.dataStyle),
    state.bullseye
  )

  lgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst)
  stgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst)
  ntgBraaseye.draw(ctx, props.showMeasurements, props.braaFirst, offsetX)

  const lgAlts: AltStack = lg.getAltStack(props.format)
  const stgAlts: AltStack = stg.getAltStack(props.format)
  const ntgAlts: AltStack = ntg.getAltStack(props.format)

  let answer =
    "THREE GROUP VIC " + realDepth + " DEEP, " + realWidth + " WIDE, "

  if (new Point(lgPos.x, ntgPos.y).getBR(lgPos).range < realWidth / 3) {
    answer += " WEIGHTED " + nLbl + ", "
  } else if (new Point(lgPos.x, stgPos.y).getBR(lgPos).range < realWidth / 3) {
    answer += " WEIGHTED " + sLbl + ", "
  }

  // TODO -- SPEED -- Opening/closing pic with range component

  answer += picTrackDir(props.format, [ntg, stg, lg])

  answer +=
    formatGroup(
      "LEAD",
      lgBraaseye,
      lgAlts,
      lg.getStrength(),
      true,
      lg.getTrackDir()
    ) + " "

  const anchorN = isAnchorNorth(ntgBraaseye, stgBraaseye, ntg, stg)

  if (anchorN) {
    answer +=
      formatGroup(
        nLbl + " TRAIL",
        ntgBraaseye,
        ntgAlts,
        ntg.getStrength(),
        false,
        ntg.getTrackDir()
      ) + " "
    answer += formatGroup(
      sLbl + " TRAIL",
      stgBraaseye,
      stgAlts,
      stg.getStrength(),
      false,
      stg.getTrackDir()
    )
  } else {
    answer +=
      formatGroup(
        sLbl + " TRAIL",
        stgBraaseye,
        stgAlts,
        stg.getStrength(),
        false,
        stg.getTrackDir()
      ) + " "
    answer += formatGroup(
      nLbl + " TRAIL",
      ntgBraaseye,
      ntgAlts,
      ntg.getStrength(),
      false,
      ntg.getTrackDir()
    )
  }

  lg.setLabel("LEAD GROUP")
  stg.setLabel(sLbl + " TRAIL GROUP")
  ntg.setLabel(nLbl + " TRAIL GROUP")

  return {
    pic: answer,
    groups: [lg, stg, ntg],
  }
}
