// Interfaces
import {
  PictureAnswer,
  PictureDrawFunction,
  PictureCanvasProps,
  PictureCanvasState,
  FightAxis,
} from "../../../canvas/canvastypes"

// Functions
import { drawMeasurement } from "../drawutils"
import { Point } from "../../../classes/point"
import { getRestrictedStartPos } from "./pictureclamp"
import { FORMAT } from "../../../classes/supportedformats"

export const drawLeadEdge: PictureDrawFunction = (
  ctx: CanvasRenderingContext2D,
  props: PictureCanvasProps,
  state: PictureCanvasState,
  start?: Point | undefined
): PictureAnswer => {
  const isNS = FightAxis.isNS(props.orientation.orient)

  // // Draw the first picture (i.e. the leading edge)
  const pic1StartPos = getRestrictedStartPos(
    ctx,
    state.blueAir,
    props.orientation.orient,
    props.dataStyle,
    45,
    100,
    { start }
  )
  const answer1 = state.reDraw(ctx, true, pic1StartPos)
  const groups1 = answer1.groups

  let furthestPic1Group = groups1[0]
  let furthestRange = 0
  groups1.forEach((grp) => {
    const grpRange = grp
      .getCenterOfMass(props.dataStyle)
      .getBR(state.blueAir.getCenterOfMass(props.dataStyle)).range
    if (grpRange > furthestRange) {
      furthestPic1Group = grp
      furthestRange = grpRange
    }
  })

  //
  // For a picture to be 'leading edge', the leading edge must be
  // at least 5 miles away from follow-on groups and no more than 40,
  // as 40 nm separation would be a package picture.
  //
  // This logic builds the required separation and gets the
  // second picture starting point
  //

  // TODO -- LEAD EDGE -- this restricted start pos should be based on the
  // first picture. but it should be directional (getRestrictedStartPos is not?)
  // and should be rngBack (distStraightNM).. if lead edge is in front return (neg?)
  // and clamp; if lead edge is behind, make sure it's at least 5 nm.
  //
  // What a pain.
  const pic2StartPos = getRestrictedStartPos(
    ctx,
    furthestPic1Group,
    props.orientation.orient,
    props.dataStyle,
    25,
    40
  )
  const answer2 = state.reDraw(ctx, true, pic2StartPos)
  const groups2 = answer2.groups

  let closestPic2Group = groups2[0]
  let closestRange = Number.MAX_VALUE
  groups2.forEach((grp) => {
    const grpRange = grp
      .getCenterOfMass(props.dataStyle)
      .getBR(state.blueAir.getCenterOfMass(props.dataStyle)).range
    if (grpRange < closestRange) {
      closestPic2Group = grp
      closestRange = grpRange
    }
  })

  const pic2Pos = closestPic2Group.getCenterOfMass(props.dataStyle)
  const pic1Pos = furthestPic1Group.getCenterOfMass(props.dataStyle)

  const rngBack = pic1Pos.straightDistNM(pic2Pos, props.orientation.orient)

  const drawXTo = isNS ? pic1Pos.x : pic2Pos.x
  const drawYTo = isNS ? pic2Pos.y : pic1Pos.y
  drawMeasurement(ctx, pic1Pos.x, pic1Pos.y, drawXTo, drawYTo, rngBack, true)

  const finalAnswer = {
    pic:
      groups1.length +
      groups2.length +
      "GROUPS, LEADING EDGE " +
      answer1.pic +
      " FOLLOW ON " +
      (props.format === FORMAT.IPE ? " GROUPS " : "") +
      rngBack +
      (props.format === FORMAT.IPE ? " MILES " : ""),
    groups: groups1.concat(groups2),
  }

  return finalAnswer
}
