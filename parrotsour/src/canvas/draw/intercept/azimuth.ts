import {
  FightAxis,
  PictureAnswer,
  PictureCanvasProps,
  PictureCanvasState,
  PictureDrawFunction,
} from "../../../canvas/canvastypes"
import { drawAltitudes, drawMeasurement } from "../../../canvas/draw/drawutils"
import {
  formatGroup,
  getGroupOpenClose,
} from "../../../canvas/draw/formatutils"
import { getStartPos } from "../../../canvas/draw/intercept/pictureclamp"
import {
  isAnchorNorth,
  isEchelon,
  picTrackDir,
} from "../../../canvas/draw/intercept/picturehelpers"
import { Braaseye } from "../../../classes/braaseye"
import { AircraftGroup } from "../../../classes/groups/group"
import { GroupFactory } from "../../../classes/groups/groupfactory"
import { Point } from "../../../classes/point"
import { randomHeading, randomNumber } from "../../../utils/psmath"

/**
 * Draw two groups azimuth and return the correct answer.
 *
 * @param ctx Current drawing context
 * @param props PicCanvasProps for the canvas
 * @param state PicCanvasState of the current canvas
 * @param start (Optional) Forced starting location for the picture
 * @returns DrawAnswer with the correct answer for this picture
 */
export const drawAzimuth: PictureDrawFunction = (
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  start?: Point
): PictureAnswer => {
  const incr: number = ctx.canvas.width / (ctx.canvas.width / 10)
  const drawDistance: number = randomNumber(3.5 * incr, 10 * incr)

  const startPos = getStartPos(ctx, state.blueAir, props.orientation.orient, {
    wide: drawDistance,
    start,
  })

  console.log(startPos)
  // Create the first group
  const ng = GroupFactory.randomGroupAtLoc(ctx, props, state, startPos)
  console.log(ng.getStartPos())

  ng.draw(ctx, props.dataStyle)

  // if hard mode and ALSA, we randomize the 2nd groups heading
  // otherwise, pair to first group +/- 10 degrees
  const heading = props.isHardMode
    ? randomHeading(props.format, state.blueAir.getHeading())
    : ng.getHeading() + randomNumber(-10, 10)

  const isNS = FightAxis.isNS(props.orientation.orient)

  const ngStPos = ng.getStartPos()

  const sg = new AircraftGroup({
    ctx,
    sx: isNS ? ngStPos.x + drawDistance : ngStPos.x,
    sy: isNS ? ngStPos.y : ngStPos.y + drawDistance,
    hdg: heading,
    dataTrailType: props.dataStyle,
  })
  sg.draw(ctx, props.dataStyle)

  let offsetX = 0
  let offsetY = 0
  let offsetX2 = 0
  let offsetY2 = 0
  let m2: Point

  const nPos = ng.getCenterOfMass()
  if (isNS) {
    m2 = new Point(sg.getCenterOfMass().x, nPos.y)
    offsetX = -60
    offsetY = 40
    offsetX2 = 10
    offsetY2 = 10
    ng.setLabel("WEST GROUP")
    sg.setLabel("EAST GROUP")
  } else {
    m2 = new Point(nPos.x, sg.getCenterOfMass().y)
    ng.setLabel("NORTH GROUP")
    sg.setLabel("SOUTH GROUP")
  }

  const width = m2.getBR(nPos).range

  drawMeasurement(
    ctx,
    nPos.x,
    nPos.y + 2,
    m2.x,
    m2.y + 2,
    width,
    props.showMeasurements
  )

  drawAltitudes(ctx, nPos, ng.getAltitudes(), offsetX, offsetY)
  drawAltitudes(
    ctx,
    sg.getCenterOfMass(),
    sg.getAltitudes(),
    offsetX2,
    offsetY2
  )

  const ngBraaseye = new Braaseye(
    ng.getCenterOfMass(),
    state.blueAir.getCenterOfMass(),
    state.bullseye
  )
  const sgBraaseye = new Braaseye(
    sg.getCenterOfMass(),
    state.blueAir.getCenterOfMass(),
    state.bullseye
  )

  ngBraaseye.draw(
    ctx,
    props.showMeasurements,
    props.braaFirst,
    offsetX,
    offsetY
  )
  sgBraaseye.draw(
    ctx,
    props.showMeasurements,
    props.braaFirst,
    offsetX2,
    offsetY2
  )

  const ngAlts = ng.getAltStack(props.format)
  const sgAlts = sg.getAltStack(props.format)

  // anchor both outrigger with bullseye if >10 az and !ipe
  const includeBull = width >= 10 && props.format !== "ipe"

  let answer = "TWO GROUPS AZIMUTH " + width + " "

  answer += getGroupOpenClose(ng, sg) + " "

  answer += isEchelon(props.orientation.orient, ngBraaseye, sgBraaseye, ng, sg)

  answer += picTrackDir(props.format, [ng, sg])

  const anchorN = isAnchorNorth(ngBraaseye, sgBraaseye, ng, sg)

  if (!anchorN) {
    if (isNS) {
      answer += formatGroup(
        "EAST",
        sgBraaseye,
        sgAlts,
        sg.getStrength(),
        true,
        sg.getTrackDir()
      )
      answer +=
        " " +
        formatGroup(
          "WEST",
          ngBraaseye,
          ngAlts,
          ng.getStrength(),
          includeBull,
          ng.getTrackDir()
        )
    } else {
      answer += formatGroup(
        "SOUTH",
        sgBraaseye,
        sgAlts,
        sg.getStrength(),
        true,
        sg.getTrackDir()
      )
      answer +=
        " " +
        formatGroup(
          "NORTH",
          ngBraaseye,
          ngAlts,
          ng.getStrength(),
          includeBull,
          ng.getTrackDir()
        )
    }
  } else {
    if (isNS) {
      answer += formatGroup(
        "WEST",
        ngBraaseye,
        ngAlts,
        ng.getStrength(),
        true,
        ng.getTrackDir()
      )
      answer +=
        " " +
        formatGroup(
          "EAST",
          sgBraaseye,
          sgAlts,
          sg.getStrength(),
          includeBull,
          sg.getTrackDir()
        )
    } else {
      answer += formatGroup(
        "NORTH",
        ngBraaseye,
        ngAlts,
        ng.getStrength(),
        true,
        ng.getTrackDir()
      )
      answer +=
        " " +
        formatGroup(
          "SOUTH",
          sgBraaseye,
          sgAlts,
          sg.getStrength(),
          includeBull,
          sg.getTrackDir()
        )
    }
  }

  return {
    pic: answer,
    groups: [ng, sg],
  }
}
