import {
  FightAxis,
  PictureAnswer,
  PictureCanvasProps,
  PictureCanvasState,
  PictureDrawFunction,
} from "../../../canvas/canvastypes"
import { drawAltitudes, drawMeasurement } from "../../../canvas/draw/drawutils"
import { formatGroup } from "../../../canvas/draw/formatutils"
import { getStartPos } from "../../../canvas/draw/intercept/pictureclamp"
import {
  isAnchorNorth,
  picTrackDir,
} from "../../../canvas/draw/intercept/picturehelpers"
import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { AltStack } from "../../../classes/altstack"
import { Point } from "../../../classes/point"

import { randomHeading, randomNumber } from "../../../utils/psmath"

export const drawVic: PictureDrawFunction = (
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  start?: Point | undefined
): PictureAnswer => {
  const incr: number = ctx.canvas.width / (ctx.canvas.width / 10)
  const picture = {
    start,
    wide: randomNumber(3.5 * incr, 10 * incr),
    deep: randomNumber(3.5 * incr, 10 * incr),
  }

  const startPos = getStartPos(
    ctx,
    state.blueAir,
    props.orientation.orient,
    picture
  )
  const startX = startPos.x
  const startY = startPos.y

  let heading: number = randomHeading(props.format, state.blueAir.getHeading())
  //const lg:Group = //
  const lg = new AircraftGroup({
    ctx,
    sx: startX,
    sy: startY,
    hdg: heading,
  })
  lg.draw(ctx, props.dataStyle)

  const isNS = FightAxis.isNS(props.orientation.orient)

  if (props.isHardMode)
    heading = randomHeading(props.format, state.blueAir.getHeading())
  let stg: AircraftGroup
  if (isNS) {
    stg = new AircraftGroup({
      ctx,
      sx: startX + picture.wide / 2,
      sy: startY + picture.deep,
      hdg: heading + randomNumber(-10, 10),
    })
  } else {
    stg = new AircraftGroup({
      ctx,
      sx: startX - picture.deep,
      sy: startY + picture.wide / 2,
      hdg: heading + randomNumber(-10, 10),
    })
  }
  stg.draw(ctx, props.dataStyle)

  if (props.isHardMode)
    heading = randomHeading(props.format, state.blueAir.getHeading())
  let ntg: AircraftGroup
  let offsetX = 0
  let nLbl = "NORTH"
  let sLbl = "SOUTH"
  if (isNS) {
    ntg = new AircraftGroup({
      ctx,
      sx: startX - picture.wide / 2,
      sy: startY + picture.deep,
      hdg: heading + randomNumber(-10, 10),
    })
    offsetX = -70
    nLbl = "WEST"
    sLbl = "EAST"
  } else {
    ntg = new AircraftGroup({
      ctx,
      sx: startX - picture.deep,
      sy: startY - picture.wide / 2,
      hdg: heading + randomNumber(-10, 10),
    })
  }
  ntg.draw(ctx, props.dataStyle)

  const ntgPos = ntg.getCenterOfMass()
  const stgPos = stg.getCenterOfMass()
  const lgPos = lg.getCenterOfMass()
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
    state.blueAir.getCenterOfMass(),
    state.bullseye
  )
  const stgBraaseye = new Braaseye(
    stgPos,
    state.blueAir.getCenterOfMass(),
    state.bullseye
  )
  const ntgBraaseye = new Braaseye(
    ntgPos,
    state.blueAir.getCenterOfMass(),
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

  //console.log("DETERMINE IF OPENING/CLOSING -- EWI/SPEED TG");

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
